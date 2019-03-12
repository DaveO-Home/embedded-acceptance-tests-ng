/**
 * Successful acceptance tests & lints start the production build.
 * Tasks are run serially, 'pat' -> ('eslint', 'csslint') -> 'bootlint' -> 'build'
 */
const { src, dest, series, parallel, task } = require('gulp');
const chalk = require('chalk')
const csslint = require('gulp-csslint');
const eslint = require('gulp-eslint');
const exec = require('child_process').exec;
const log = require("fancy-log");
const stealTools = require('steal-tools');
const del = require('del')
const Server = require('karma').Server;

let lintCount = 0;
let browsers = process.env.USE_BROWSERS;
if (browsers) {
    global.whichBrowsers = browsers.split(",");
}
let isWindows = /^win/.test(process.platform);
let useNg = '';
let runSingle = true;

/**
 * Default: Production Acceptance Tests 
 */
const pate2e = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    useNg = ''
    runKarma(done, true, false);
};
/**
 * Add in Angular unit tests 
 */
const patng = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    useNg = '.ng'
    runKarma(done, true, false);
};
/*
 * javascript linter
 */
const esLint = function (cb) {
    var stream = src(["../appl/js/**/*.js"])
        .pipe(eslint({
            configFile: 'eslintConf.json',
            quiet: 1
        }))
        .pipe(eslint.format())
        .pipe(eslint.result(result => {
            //Keeping track of # of javascript files linted.
            lintCount++;
        }))
        .pipe(eslint.failAfterError());

    stream.on('error', function () {
        process.exit(1);
    });

    return stream.on('end', function () {
        log("# javascript files linted: " + lintCount);
        cb()
    });
};
/*
 * css linter
 */
const cssLint = function (cb) {
    var stream = src(['../appl/css/site.css'])
        .pipe(csslint())
        .pipe(csslint.formatter());

    stream.on('error', function () {
        process.exit(1);
    }).on('end', function () {
        cb();
    });
};
/*
 * Bootstrap html linter 
 */
const bootLint = function (cb) {
    exec('npx gulp --gulpfile Gulpboot.js', function (err, stdout, stderr) {
        log(stdout);
        log(stderr);
        cb(err);
    });
};
/*
 * Build the application to the production distribution 
 */
const build = function (cb) {
    return toolsBuild(cb)
};
/*
 * Build the application to the production distribution 
 */
const build_only = function (cb) {
    return toolsBuild(cb)
};
/**
 * Remove previous build
 */
const clean = function (done) {
    isProduction = true;
    dist = '../../dist/';
    return del([
        dist + 'stealjs/**/*',
        dist + 'bundles/**/*',
        dist + 'steal.production.js'
    ], { dryRun: false, force: true }, done);
};
/**
 * Remove previous build
 */
const clean_only = function (done) {
    isProduction = true;
    dist = '../../dist/';
    return del([
        dist + 'stealjs/**/*',
        dist + 'bundles/**/*',
        dist + 'steal.production.js'
    ], { dryRun: false, force: true }, done);
};
/**
 * Run karma/jasmine tests using FirefoxHeadless 
 */
const steal_firefox = function (done) {
    // Running both together as Headless has problems, tdd works
    global.whichBrowsers = ["FirefoxHeadless"];
    runKarma(done, true, false);
};
/**
 * Run karma/jasmine tests using ChromeHeadless 
 */
const steal_chrome = function (done) {
    // Running both together as Headless has problems, tdd works
    global.whichBrowsers = ["ChromeHeadless"];
    runKarma(done, true, false);
};
/**
 * Run karma/jasmine tests once and exit
 */
const steal_test = function (done) {
    // Running both together as Headless has problems, tdd works
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    return runKarma(done, true, false);
};
/**
 * Run karma/jasmine tests once and exit without rebuilding(requires a previous build)
 */
const e2e_test = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    return runKarma(done, true, false);
};
/**
 * Run karma/jasmine/angular tests once and exit without rebuilding(requires a previous build)
 */
const ng_test = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    useNg = ".ng"
    return runKarma(done, true, false);
};
/**
 * Continuous testing - test driven development.  
 */
const steal_tdd = function (done) {
    if (!browsers) {
        global.whichBrowsers = ['Firefox', 'Chrome'];
    }
    return runKarma(done, false, true);
};
/*
 * Compile production angular typescript. 
 */
const compile = function (cb) {
    var osCommands = 'touch ../appl/entry.ts; ../../node_modules/.bin/tsc --build tsconfig_stealjs.json';
    if (isWindows) {
        osCommands = 'copy /b ..\\appl\\entry.ts +,, & ..\\..\\node_modules\\.bin/tsc --build'
    }

    exec(osCommands, function (err, stdout, stderr) {
        log(stdout);
        log(stderr);
        cb(err);
    });
};
/*
 * Compile angular typescript. 
 */
const compile_ts = function (cb) {
    var osCommands = 'touch ../appl/entry.ts; ../../node_modules/.bin/tsc --build';
    if (isWindows) {
        osCommands = 'copy /b ..\\appl\\entry.ts +,, & ..\\..\\node_modules\\.bin/tsc --build'
    }

    exec(osCommands, function (err, stdout, stderr) {
        log(stdout);
        log(stderr);
        cb(err);
    });
};
/*
 * Startup live reload monitor. 
 */
const live_reload = function (cb) {
    var osCommands = 'cd ../..; node_modules/.bin/steal-tools live-reload';
    if (isWindows) {
        osCommands = 'cd ..\\.. & .\\node_modules\\.bin\\steal-tools live-reload'
    }

    exec(osCommands, function (err, stdout, stderr) {
        log(stdout);
        log(stderr);
        cb(err);
    });
};
/*
 * Build a vendor bundle from package.json
 */
const vendor = function (cb) {
    let vendorBuild = process.env.USE_VENDOR_BUILD;

    if (vendorBuild && vendorBuild == "false") {
        cb();
        return;
    }

    stealTools.bundle({
        config: "../../package.json!npm"
    }, {
            filter: ["node_modules/**/*", "package.json"],
            //dest: __dirname + "/../dist_test"
        }).then(() => {
            cb();
        });
};
/*
 * Startup live reload monitor. 
 */
const web_server = function (cb) {
    log.warn(chalk.cyan("Express started"))
    return exec('npm run server', function (err, stdout, stderr) {
        log(stdout);
        log(stderr);
        cb(err);
    });
};

const lintRun = parallel(esLint, cssLint, bootLint)
const testRun = series(compile_ts, pate2e, patng)
const prodRun = series(testRun, lintRun, clean, build)
prodRun.displayName = 'prod'

task(prodRun)
exports.default = prodRun
exports.prd = series(clean, build)
exports.test = testRun
exports.tdd = steal_tdd
exports.acceptance = ng_test
exports.firefox = steal_firefox
exports.chrome = steal_chrome
exports.hmr = series(vendor, live_reload)
exports.server = web_server
exports.ngtest = ng_test
exports.e2e = e2e_test
exports.development = parallel(series(vendor, live_reload), web_server, steal_tdd)

function runKarma(done, singleRun, watch) {
    const serv = new Server({
        configFile: __dirname + '/karma' + useNg + '.conf.js',
        singleRun: singleRun
    }, result => {
        var exitCode = !result ? 0 : result;

        if (typeof done === "function") {
            done();
        }
        if (exitCode > 0) {
            process.exit(exitCode);
        }
    });
    serv.start()
}

function toolsBuild(cb) {
    return stealTools.build({
        config: "package.json!npm",
        main: "stealjs/appl/main",
        baseURL: "../../"
    }, {
            sourceMaps: false,
            bundleAssets: {
                infer: true,
                glob: [
                    '../images/favicon.ico',
                    '../appl/testapp.html',
                    '../appl/app_bootstrap.html',
                    '../appl/index.html',
                    '../index.html',
                    '../appl/views/**/*',
                    '../appl/assets/**/*',
                    '../appl/templates/**/*',
                    '../../README.md',
                    '../appl/css/table.css',
                    '../appl/css/hello.world.css'
                ]
            },
            target: ["web"],
            bundleSteal: false,
            dest: "dist",
            removeDevelopmentCode: true,
            minify: true,
            uglifyOptions: {
                mangle: false,
                compress: true
            },
            maxBundleRequests: 5,
            maxMainRequests: 5
        }).then(function (result) {
            del([
                '../appl/components/**/*.js',
                '../appl/services/**/*.js',
                '../appl/entry.js'
            ], { dryRun: false, force: true });
            cb();
        }).catch(function (rejection) {
            console.log("Build Failed:", rejection)
            process.exit(1)
        })
}

//From Stack Overflow - Node (Gulp) process.stdout.write to file
if (process.env.USE_LOGFILE == 'true') {
    var fs = require('fs');
    var proc = require('process');
    var origstdout = process.stdout.write,
        origstderr = process.stderr.write,
        outfile = 'production_build.log',
        errfile = 'production_error.log';

    if (fs.exists(outfile)) {
        fs.unlink(outfile);
    }
    if (fs.exists(errfile)) {
        fs.unlink(errfile);
    }

    process.stdout.write = function (chunk) {
        fs.appendFile(outfile, chunk.replace(/\x1b\[[0-9;]*m/g, ''));
        origstdout.apply(this, arguments);
    };

    process.stderr.write = function (chunk) {
        fs.appendFile(errfile, chunk.replace(/\x1b\[[0-9;]*m/g, ''));
        origstderr.apply(this, arguments);
    };
}
