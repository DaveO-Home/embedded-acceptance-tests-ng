/**
 * Successful acceptance tests & lints start the production build.
 * Tasks are run serially, 'pat' -> 'accept' -> ('eslint', 'csslint', 'bootlint') -> 'build'
 */
const { src, series, parallel, task } = require("gulp");
const csslint = require("gulp-csslint");
const eslint = require("gulp-eslint");
const exec = require("child_process").exec;
const log = require("fancy-log");
const chalk = require("chalk");

let lintCount = 0;
let browsers = process.env.USE_BROWSERS;
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

    var osCommands = "cd ../..; export NODE_ENV=development; export USE_KARMA=true; export USE_HMR=false; ";
    osCommands = osCommands + "export NODE_NO_WARNINGS=1; ";
    if (isWindows) {
        osCommands = "cd ..\\..\\ & set NODE_ENV=development & set USE_KARMA=true & set USE_HMR=false & ";
        osCommands = osCommands + "set NODE_NO_WARNINGS=1 & ";
    }
    log(chalk.cyan("E2E Testing - please wait......"));

    let cmd = exec(osCommands + "npm run bt");
    cmd.stdout.on("data", (data) => {
        if (data && data.length > 0) {
            log(data.trim());
        }
    });
    cmd.stderr.on("data", (data) => {
        if (data && data.length > 0)
            log(data.trim());
    });
    return cmd.on("exit", (code) => {
        done();
        log(`Child exited with code ${code}`);
    });
};
/*
 * javascript linter
 */
const esLint = function (cb) {
    var stream = src(["../appl/js/**/*.js"])
        .pipe(eslint({
            configFile: "../../.eslintrc.js", // 'eslintConf.json',
            quiet: 1,
        }))
        .pipe(eslint.format())
        .pipe(eslint.result(() => {
            //Keeping track of # of javascript files linted.
            lintCount++;
        }))
        .pipe(eslint.failAfterError());

    stream.on("error", function () {
        process.exit(1);
    });
    return stream.on("end", function () {
        log(chalk.blue.bold("# javascript files linted: " + lintCount));
        cb();
    });
};
/*
 * typescript linter
 */
const esLintts = function (cb) {
    var stream = src(["../appl/**/*.ts"])
        .pipe(eslint({
            configFile: "../../.eslintts.js",
            quiet: 1,
        }))
        .pipe(eslint.format())
        .pipe(eslint.result(() => {
            //Keeping track of # of javascript files linted.
            lintCount++;
        }))
        .pipe(eslint.failAfterError());

    stream.on("error", function () {
        process.exit(1);
    });
    return stream.on("end", function () {
        log(chalk.blue.bold("# typescript files linted: " + lintCount));
        cb();
    });
};
/*
 * css linter
 */
const cssLint = function (cb) {
    var stream = src(["../appl/css/site.css"
    ])
        .pipe(csslint())
        .pipe(csslint.formatter());

    stream.on("error", function () {
        process.exit(1);
    }).on("end", function () {
        cb();
    });
};
/*
 * Bootstrap html linter 
 */
const bootLint = function (cb) {
    return exec("npx gulp --gulpfile Gulpboot.js", function (err, stdout, stderr) {
        log(stdout);
        log(stderr);
        if (err) {
            log("ERROR", err);
        } else {
            log(chalk.green("Bootstrap linting a success"));
        }
        cb();
    });
};
/*
 * Build the application to the production distribution 
 */
const build = function (cb) {
    var osCommands = "cd ..; export NODE_ENV=production; export USE_KARMA=false; export USE_HMR=false; ";
    osCommands = osCommands + "export NODE_NO_WARNINGS=1; ";
    if (isWindows) {
        osCommands = "cd ..\\ & set NODE_ENV=production & set USE_KARMA=false & set USE_HMR=false & ";
        osCommands = osCommands + "set NODE_NO_WARNINGS=1 & ";
    }
    log(chalk.cyan("Building Production - please wait......"));

    let cmd = exec(osCommands + "npm run bp");
    cmd.stdout.on("data", (data) => {
        if (data && data.length > 0) {
            log(data.trim());
        }
    });
    cmd.stderr.on("data", (data) => {
        if (data && data.length > 0)
            log(data.trim());
    });
    return cmd.on("exit", (code) => {
        cb();
        if(code && code > 0) {
            log(`Test Driven Development exited with code ${code}`);
        } else {
            log(chalk.green("Production build a success"));
        }

    });
};
/*
 * Build the application to run karma acceptance tests with hmr
 */
const brunch_watch = function (cb) {
    var osCommands = "cd ../..; export NODE_ENV=development; export USE_KARMA=false; export USE_HMR=true; ";
    osCommands = osCommands + "export NODE_NO_WARNINGS=1; ";
    if (isWindows) {
        osCommands = "cd ..\\..\\ & set NODE_ENV=development & set USE_KARMA=false & set USE_HMR=true & ";
        osCommands = osCommands + "set NODE_NO_WARNINGS=1 & ";
    }
    let cmd = exec(osCommands + "npm run bw");
    cmd.stdout.on("data", (data) => {
        if (data && data.length > 0) {
            log(data.trim());
        }
    });
    cmd.stderr.on("data", (data) => {
        if (data && data.length > 0)
            log(data.trim());
    });
    return cmd.on("exit", (code) => {
        cb();
        log(`Watch exited with code ${code}`);
    });
};
/*
 * Build the application to run node express so font-awesome is resolved
 */
const brunch_rebuild = function (cb) {
    var osCommands = "cd ../..; export NODE_ENV=development; unset USE_TDD; export USE_KARMA=false; export USE_HMR=false; ";
    osCommands = osCommands + "export NODE_NO_WARNINGS=1; ";
    if (isWindows) {
        osCommands = "cd ..\\..\\ & set NODE_ENV=development & set USE_TDD & set USE_KARMA=false & set USE_HMR=false & ";
        osCommands = osCommands + "set NODE_NO_WARNINGS=1 & ";
    }
    log(chalk.cyan("Re-building Development - please wait......"));
    exec(osCommands + "brunch build", function (err, stdout, stderr) {
        log(stdout);
        log(stderr);
        if (err) {
            log("ERROR", err);
        } else {
            log(chalk.green("Rebuild a success"));
        }
        cb();
    });
};
/**
 * Continuous testing - test driven development.  
 */
const brunch_tdd = function (done) {
    if (!browsers) {
        global.whichBrowser = ["Chrome", "Firefox"];
    }

    var osCommands = "cd ../..; export NODE_ENV=development; export USE_TDD=true; export USE_KARMA=true; export USE_HMR=false; ";
    osCommands = osCommands + "export NODE_NO_WARNINGS=1; ";
    if (isWindows) {
        osCommands = "cd ..\\..\\ & set NODE_ENV=development & set USE_TDD=true; set USE_KARMA=true & set USE_HMR=false & ";
        osCommands = osCommands + "set NODE_NO_WARNINGS=1 & ";
    }

    log(chalk.cyan("Test Driven Development - please wait......"));
    let cmd = exec(osCommands + "npm run bt");
    cmd.stdout.on("data", (data) => {
        if (data && data.length > 0) {
            log(data.trim());
        }
    });
    cmd.stderr.on("data", (data) => {
        if (data && data.length > 0)
            log(data.trim());
    });
    return cmd.on("exit", (code) => {
        done();
        log(`Test Driven Development exited with code ${code}`);
    });
};

const prodRun = series(pat, parallel(esLint, esLintts, cssLint, bootLint), build);
prodRun.displayName = "prod";

task(prodRun);
exports.default = prodRun;
exports.prd = series(parallel(esLint, esLintts, cssLint, bootLint), build);
exports.test = pat;
exports.acceptance = pat;
exports.tdd = brunch_tdd;
exports.watch = brunch_watch;
exports.rebuild = brunch_rebuild;
exports.lint = parallel(esLint, esLintts, cssLint, bootLint);

//From Stack Overflow - Node (Gulp) process.stdout.write to file
if (process.env.USE_LOGFILE == "true") {
    var fs = require("fs");
    var util = require("util");
    var logFile = fs.createWriteStream("log.txt", { flags: "w" });
    // Or "w" to truncate the file every time the process starts.
    var logStdout = process.stdout;

    // eslint-disable-next-line no-console
    console.log = function () {
        logFile.write(util.format.apply(null, arguments) + "\n");
        logStdout.write(util.format.apply(null, arguments) + "\n");
    };
    // eslint-disable-next-line no-console
    console.error = console.log;
}
