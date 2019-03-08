/**
 * Successful acceptance tests & lints start the production build.
 * Tasks are run serially, 'pat' -> 'accept' -> ('eslint', 'csslint', 'bootlint') -> 'build'
 */
const { src, dest, series, parallel, task } = require('gulp');
const copy = require('gulp-copy');
const csslint = require('gulp-csslint');
const env = require("gulp-env");
const eslint = require('gulp-eslint');
const exec = require('child_process').exec;
const log = require("fancy-log");
const Server = require('karma').Server;
const chalk = require('chalk');
const rmf = require('rimraf');

let lintCount = 0
let dist = "dist_test/fusebox"
let distProd = "dist/fusebox"
let isProduction = false
let browsers = process.env.USE_BROWSERS
let useNg = '';
let runSingle = true;

if (browsers) {
    global.whichBrowsers = browsers.split(",");
}
var isWindows = /^win/.test(process.platform);
var initialTask;
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
    var stream = src(["../appl/js/**/*.js"])
        .pipe(eslint({
            configFile: 'eslintConf.json',
            quiet: 1,
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
        cb();
    });
};
/*
 * css linter
 */
const cssLint = function (cb) {
    var stream = src(['../appl/css/site.css'
    ])
        .pipe(csslint())
        .pipe(csslint.formatter());

    stream.on('error', function () {
        process.exit(1);
    })
        .on('end', function () {
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
 * Build the application to run karma acceptance tests
 */
const test_build = function (cb) {
    var osCommands = 'cd ..; export NODE_ENV=development; export USE_KARMA=true; export USE_HMR=false; ';

    if (isWindows) {
        osCommands = 'cd ..\\ & set NODE_ENV=development & set USE_KARMA=true & set USE_HMR=false & ';
    }

    exec(osCommands + 'node fuse.js', function (err, stdout, stderr) {
        log(chalk.cyan('Building Test - please wait......'))
        let cmd = exec(osCommands + 'node fuse.js');
        cmd.stdout.on('data', (data) => {
            if (data && data.length > 0) {
                console.log(data.trim());
            }
        });
        cmd.stderr.on('data', (data) => {
            if (data && data.length > 0)
                console.log(data.trim())
        });
        return cmd.on('exit', (code) => {
            log(chalk.green(`Build successful - ${code}`));
            cb()
        });
    });
};
/*
 * Build the application to the production distribution 
 */
const build = function (cb) {
    var osCommands = 'cd ..; export NODE_ENV=production; export USE_KARMA=false; export USE_HMR=false; ';

    if (isWindows) {
        osCommands = 'cd ..\\ & set NODE_ENV=production & set USE_KARMA=false & set USE_HMR=false & ';
    }

    log(chalk.cyan('Production Build - please wait......'))
    let cmd = exec(osCommands + 'node fuse.js');
    cmd.stdout.on('data', (data) => {
        if (data && data.length > 0) {
            console.log(data.trim());
        }
    });
    cmd.stderr.on('data', (data) => {
        if (data && data.length > 0)
            console.log(data.trim())
    });
    return cmd.on('exit', (code) => {
        log(chalk.green(`Build successful - ${code}`));
        cb()
    });
};
/**
 * Remove previous build
 */
const clean = function (done) {
    return rmf('../../' + distProd, [], (err) => {
        if (err) {
            log(err)
        }
        done()
    });
};
/**
 * Remove previous test build
 */
const clean_test = function (done) {
    return rmf('../../' + dist, [], (err) => {
        if (err) {
            log(err)
        }
        done()
    });
};
/*
 * Build the application to run karma acceptance tests with hmr
 */
const fusebox_hmr = function (cb) {
    var osCommands = 'cd ..; export NODE_ENV=development; export USE_KARMA=false; export USE_HMR=true; ';

    if (isWindows) {
        osCommands = 'cd ..\\ & set NODE_ENV=development & set USE_KARMA=false & set USE_HMR=true & ';
    }

    log(chalk.cyan('Configuring HMR - please wait......'))
    let cmd = exec(osCommands + 'node fuse.js');
    cmd.stdout.on('data', (data) => {
        if (data && data.length > 0) {
            console.log(data.trim());
        }
    });
    cmd.stderr.on('data', (data) => {
        if (data && data.length > 0)
            console.log(data.trim())
    });
    return cmd.on('exit', (code) => {
        log(chalk.green(`Build successful - ${code}`));
        cb()
    });
};
/*
 * Build the application to run node express so font-awesome is resolved
 */
const fusebox_rebuild = function (cb) {
    var osCommands = 'cd ..; export NODE_ENV=development; export USE_KARMA=false; export USE_HMR=false; ';

    if (isWindows) {
        osCommands = 'cd ..\\ & set NODE_ENV=development & set USE_KARMA=false & set USE_HMR=false & ';
    }

    exec(osCommands + 'node fuse.js', function (err, stdout, stderr) {
        log(chalk.cyan('Rebuilding - please wait......'))
        let cmd = exec(osCommands + 'node fuse.js');
        cmd.stdout.on('data', (data) => {
            if (data && data.length > 0) {
                console.log(data.trim());
            }
        });
        cmd.stderr.on('data', (data) => {
            if (data && data.length > 0)
                console.log(data.trim())
        });
        return cmd.on('exit', (code) => {
            log(chalk.green(`Build successful - ${code}`));
            cb()
        });
    });
};
/**
 * Run karma/jasmine tests once and exit
 */
const fb_test = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    runSingle = true;
    return runKarma(done);
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
 * Run karma/jasmine tests once and exit without rebuilding(requires a previous build)
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
const fusebox_tdd = function (done) {
    if (!browsers) {
        global.whichBrowsers = ['Chrome', 'Firefox'];
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
        global.whichBrowsers = ['Opera'];
    }
    new Server({
        configFile: __dirname + '/karma.conf.js',
    }, done).start();
};

const testRun = series(clean_test, test_build, pate2e, pat)
const lintRun = parallel(esLint, cssLint, bootLint)

exports.default = series(testRun, lintRun, clean, build)
exports.prod = series(testRun, lintRun, clean, build)
exports.prd = series(clean, build)
exports.test = testRun
exports.tdd = fusebox_tdd
exports.hmr = fusebox_hmr
exports.rebuild = fusebox_rebuild
exports.acceptance = e2e_test
exports.ngtest = ng_test
exports.e2e = e2e_test
exports.development = parallel(fusebox_hmr, fusebox_tdd)

function runKarma(done) {
    new Server({
        configFile: __dirname + '/karma' + useNg + '.conf.js',
        singleRun: runSingle
    }, function (result) {
        var exitCode = !result ? 0 : result;
        if (typeof done === "function") {
            done();
        }
        if (exitCode > 0) {
            process.exit(exitCode);
        }
    }).start();
}

//From Stack Overflow - Node (Gulp) process.stdout.write to file
if (process.env.USE_LOGFILE == 'true') {
    var fs = require('fs');
    var proc = require('process');
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
