/**
 * Successful acceptance tests & lints start the production build.
 * Tasks are run serially, 'pat'(run acceptance tests) -> 'build-development' -> ('eslint', 'csslint', 'bootlint') -> 'build'
 */
const { src, dest, series, parallel, task } = require('gulp');
const eslint = require('gulp-eslint');
const csslint = require('gulp-csslint');
const exec = require('child_process').exec;
const env = require("gulp-env")
const copy = require("gulp-copy");
const stripCode = require("gulp-strip-code");
const del = require('del');
const noop = require('gulp-noop');
const log = require('fancy-log');
const Bundler = require('parcel-bundler')
const flatten = require('gulp-flatten')
const chalk = require('chalk');
const browserSync = require('browser-sync');
const uglify = require('gulp-uglify-es').default;
const Server = require('karma').Server;
const parcel = require('gulp-parcel')

const startComment = "develblock:start",
    endComment = "develblock:end",
    regexPattern = new RegExp("[\\t ]*(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)" +
        startComment + " ?[\\*\\/]?[\\s\\S]*?(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)" +
        endComment + " ?(\\*\\/)?[\\t ]*\\n?", "g");

let lintCount = 0
let isProduction = process.env.NODE_ENV == 'production'
let browsers = process.env.USE_BROWSERS
let bundleTest = process.env.USE_BUNDLER
let testDist = "dist_test/parcel"
let prodDist = "dist/parcel"
let dist = isProduction ? prodDist : testDist
let useNg = '';
let runSingle = true;

if (browsers) {
    global.whichBrowsers = browsers.split(",");
}
/**
 * Build Development bundle from package.json 
 */
const build_development = function (cb) {
    return parcelBuild(false, cb); // setting watch = false
};
/* This is an alternative to using the "parcel-plugin-strip" plugin for prod build
*  See "default" task vs "prod" task
* Strip development code from parcel build and uglify main.*.js
*/
const parcel_prod = function (cb) {
    isProduction = true;
    dist = prodDist;
    log(chalk.cyan("***** Starting Strip Development Code and Uglify *****"))
    var envs = env.set({
        NODE_ENV: "production",
    });
    return src('../../' + dist + '/appl/main.*.js')
        .pipe(envs)
        .pipe(isProduction ? stripCode({ pattern: regexPattern }) : noop())
        .pipe(isProduction ? uglify() : noop())
        .pipe(dest('../../' + dist + '/appl'))
        .on('end', () => {
            log(chalk.cyan("***** Finished Build *****"));
            cb()
        });
};
/**
 * Production Parcel 
 */
const build = function (cb) {
    process.env.NODE_ENV = 'production'
    isProduction = true;
    dist = prodDist;
    parcelBuild(false, cb)
};
/**
 * Default: Production Acceptance Tests 
 */
const pate2e = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    useNg = ''
    runSingle = true
    runKarma(done);
};
/**
 * Add in Angular unit tests 
 */
const pat = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    useNg = '.ng'
    runSingle = true
    runKarma(done);
};
/*
 * javascript linter
 */
const esLint = function (cb) {
    dist = prodDist;
    var stream = src(["../appl/js/**/*.js"])
        .pipe(eslint({
            configFile: 'eslintConf.json',
            quiet: 0
        }))
        .pipe(eslint.format())
        .pipe(eslint.result(result => {
            //Keeping track of # of javascript files linted.
            lintCount++;
        }))
        .pipe(eslint.failAfterError());

    stream.on('error', () => {
        process.exit(1);
    });

    return stream.on('end', () => {
        log(chalk.cyan("# javascript files linted: " + lintCount));
        cb()
    });
};
/*
 * css linter
 */
const cssLint = function (cb) {
    var stream = src(['../appl/css/site.css', '../appl/css/table.css'])
        .pipe(csslint())
        .pipe(csslint.formatter());

    stream.on('error', () => {
        process.exit(1);
    }).on('end', () => {
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
/**
 * Remove previous build
 */
const clean = function (done) {
    isProduction = true;
    dist = prodDist;
    return del([
        '../../' + prodDist + '/**/*'
    ], { dryRun: false, force: true }, done);
};

const cleant = function (done) {
    let dryRun = false
    if (bundleTest && bundleTest === "false") {
        dryRun = true
    }
    isProduction = false;
    dist = testDist;
    return del([
        '../../' + testDist + '/**/*'
    ], { dryRun: dryRun, force: true }, done);
};
/**
 * Resources and content copied to dist directory - for production
 */
const copyprod = function () {
    return copySrc();
};

const copyprod_images = function () {
    isProduction = true;
    dist = prodDist;
    return copyImages();
};
/**
 * Resources and content copied to dist_test directory - for development
 */
const copy_test = function () {
    return copySrc();
};

const copy_images = function () {
    isProduction = false;
    dist = testDist;
    return copyImages();
};
/**
 * Run karma/jasmine tests once and exit without rebuilding(requires a previous build)
 */
const e2e_test = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    runSingle = true;
    return runKarma(done);
};
/**
 * Run karma/jasmine/angular tests once and exit without rebuilding(requires a previous build)
 */
const ng_test = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    runSingle = true
    useNg = ".ng"
    return runKarma(done);
};
/**
 * Continuous testing - test driven development.  
 */
const tdd_parcel = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["Chrome", "Firefox"];
    }
    new Server({
        configFile: __dirname + '/karma.conf.js',
    }, done).start();
};
/**
 * Karma testing under Opera. -- needs configuation  
 */
const tddo = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["Opera"];
    }
    new Server({
        configFile: __dirname + '/karma.conf.js',
    }, done).start();
};
/**
 * Using BrowserSync Middleware for HMR  
 */
const sync = function () {
    const server = browserSync.create('devl');
    dist = testDist;
    server.init({ server: '../../', index: 'index_p.html', port: 3080/*, browser: ['google-chrome']*/ });
    server.watch('../../' + dist + '/appl/main.*.js').on('change', server.reload);  //change any file in appl/ to reload app - triggered on watchify results
    return server;
};

const watcher = function (done) {
    log(chalk.green("Watcher & BrowserSync Started - Waiting...."));
    return done()
};

const watch_parcel = function (cb) {
    return parcelBuild(true, cb)
};

const testRun = series(cleant, copy_images, copy_test, build_development)
const lintRun = parallel(esLint, cssLint, bootLint)
const prodRun = series(testRun, pate2e, pat, lintRun, clean, copyprod_images, copyprod, build, parcel_prod)
prodRun.displayName = 'prod'

task(prodRun)
exports.default = prodRun
exports.prd = series(clean, copyprod_images, copyprod, build, parcel_prod)
exports.test = series(testRun, pate2e, pat)
exports.tdd = series(/*testRun,*/ tdd_parcel)
exports.acceptance = ng_test
exports.watch = series(watch_parcel, sync, watcher)
exports.rebuild = testRun
exports.ngtest = ng_test
exports.e2e = e2e_test
exports.development = parallel(series(watch_parcel, sync, watcher), tdd_parcel)

function parcelBuild(watch, cb) {
    if (bundleTest && bundleTest === "false") {
        return cb()
    }
    
    const file = isProduction ? '../appl/testapp.html' : '../appl/testapp_dev.html'
    // Bundler options
    const options = {
        production: isProduction,
        outDir: '../../' + dist + '/appl',
        outFile: isProduction ? 'testapp.html' : 'testapp_dev.html',
        publicUrl: './',
        watch: watch,
        cache: !isProduction,
        cacheDir: '.cache',
        minify: false,
        target: 'browser',
        https: false,
        logLevel: 3, // 3 = log everything, 2 = log warnings & errors, 1 = log errors
        // hmrPort: 3080,
        sourceMaps: !isProduction,
        // hmrHostname: 'localhost',
        detailedReport: isProduction
    };

    // Initialises a bundler using the entrypoint location and options provided
    const bundler = new Bundler(file, options);
    let isBundled = false

    bundler.on('bundled', (bundle) => {
        isBundled = true
    })
    bundler.on("buildEnd", () => {
        if (isBundled) {
            log(chalk.green("Build Successful"))
            cb()
        }
        else {
            log(chalk.red("Build Failed"))
            cb()
            process.exit(1)
        }
    })
    // Run the bundler, this returns the main bundle
    return bundler.bundle()
}

function copySrc() {
    return src(['../appl/view*/**/*', '../appl/temp*/**/*' /*, isProduction ? '../appl/testapp.html' : '../appl/testapp_dev.html'*/])
        .pipe(flatten({ includeParents: -2 })
            .pipe(dest('../../' + dist + '/appl')))
}

function copyImages() {
    return src(['../images/*', '../../README.m*', '../appl/css/table.css', '../appl/app_bootstrap.html', '../appl/css/hello.world.css'])
        .pipe(copy('../../' + dist + '/appl'));
}

function runKarma(done) {
    new Server({
        configFile: __dirname + '/karma' + useNg + '.conf.js',
        singleRun: true
    }, result => {
        var exitCode = !result ? 0 : result;
        if (typeof done === "function") {
            done();
        }
        if (exitCode > 0) {
            process.exit(exitCode);
        }
    }).start();
}
/*
 * From Stack Overflow - Node (Gulp) process.stdout.write to file
 * @type type
 */
if (process.env.USE_LOGFILE == 'true') {
    var fs = require('fs');
    var origstdout = process.stdout.write,
        origstderr = process.stderr.write,
        outfile = 'node_output.log',
        errfile = 'node_error.log';

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