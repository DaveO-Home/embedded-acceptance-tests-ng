/**
 * Successful acceptance tests & lints start the production build.
 * Tasks are run serially, 'pat' -> 'accept' -> ('eslint', 'csslint', 'bootlint') -> 'build'
 */
const { src, dest, series, parallel, task } = require('gulp');
const csslint = require('gulp-csslint');
// const env = require("gulp-env");
const eslint = require('gulp-eslint');
const exec = require('child_process').exec;
// const spawn = require('child_process').spawn;
const log = require("fancy-log");
const Server = require('karma').Server;
const chalk = require('chalk');

let lintCount = 0
let dist = "dist_test/brunch"
let browsers = process.env.USE_BROWSERS
if (browsers) {
    global.whichBrowser = browsers.split(",");
}
var isWindows = /^win/.test(process.platform);

/**
 * Default: Production Acceptance Tests 
 */
const pat = function (done) {
    if (!browsers) {
        global.whichBrowser = ["ChromeHeadless", "FirefoxHeadless"];
    }

    var osCommands = 'cd ../..; export NODE_ENV=development; export USE_KARMA=true; export USE_HMR=false; ';

    if (isWindows) {
        osCommands = 'cd ..\\..\\ & set NODE_ENV=development & set USE_KARMA=true & set USE_HMR=false & ';
    }
    log(chalk.cyan('E2E Testing - please wait......'))

    let cmd = exec(osCommands + 'npm run bt');
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
        done()
        console.log(`Child exited with code ${code}`);
    });
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
        cb()
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
    }).on('end', function () {
        cb()
    });
};
/*
 * Bootstrap html linter 
 */
const bootLint = function (cb) {
    return exec('npx gulp --gulpfile Gulpboot.js', function (err, stdout, stderr) {
        log(stdout)
        log(stderr)
        if (err) {
            log("ERROR", err);
        } else {
            log(chalk.green('Bootstrap linting a success'))
        }
        cb()
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
    log(chalk.cyan('Building Production - please wait......'))

    let cmd = exec(osCommands + 'npm run bp');
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
        cb()
        if(code && code > 0) {
            console.log(`Test Driven Development exited with code ${code}`);
        } else {
            log(chalk.green('Production build a success'))
        }

    });
};
/*
 * Build the application to run karma acceptance tests with hmr
 */
const brunch_watch = function (cb) {
    var osCommands = 'cd ../..; export NODE_ENV=development; export USE_KARMA=false; export USE_HMR=true; ';

    if (isWindows) {
        osCommands = 'cd ..\\..\\ & set NODE_ENV=development & set USE_KARMA=false & set USE_HMR=true & ';
    }
    let cmd = exec(osCommands + 'npm run bw');
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
        cb()
        console.log(`Watch exited with code ${code}`);
    });
};
/*
 * Build the application to run node express so font-awesome is resolved
 */
const brunch_rebuild = function (cb) {
    var osCommands = 'cd ../..; export NODE_ENV=development; unset USE_TDD; export USE_KARMA=false; export USE_HMR=false; ';

    if (isWindows) {
        osCommands = 'cd ..\\..\\ & set NODE_ENV=development & set USE_TDD & set USE_KARMA=false & set USE_HMR=false & ';
    }
    log(chalk.cyan('Re-building Development - please wait......'))
    exec(osCommands + 'brunch build', function (err, stdout, stderr) {
        log(stdout)
        log(stderr)
        if (err) {
            log("ERROR", err);
        } else {
            log(chalk.green('Rebuild a success'))
        }
        cb()
    });
};
/**
 * Continuous testing - test driven development.  
 */
const brunch_tdd = function (done) {
    if (!browsers) {
        global.whichBrowser = ["Chrome", "Firefox"];
    }

    var osCommands = 'cd ../..; export NODE_ENV=development; export USE_TDD=true; export USE_KARMA=true; export USE_HMR=false; ';
    if (isWindows) {
        osCommands = 'cd ..\\..\\ & set NODE_ENV=development & set USE_TDD=true; set USE_KARMA=true & set USE_HMR=false & ';
    }

    log(chalk.cyan('Test Driven Development - please wait......'))
    let cmd = exec(osCommands + 'npm run bt');
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
        done()
        console.log(`Test Driven Development exited with code ${code}`);
    });
};

const prodRun = series(pat, parallel(esLint, cssLint, bootLint), build)
prodRun.displayName = 'prod'

task(prodRun)
exports.default = prodRun
exports.prd = series(parallel(esLint, cssLint, bootLint), build)
exports.test = pat
exports.acceptance = pat
exports.tdd = brunch_tdd
exports.watch = brunch_watch
exports.rebuild = brunch_rebuild

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
