/*eslint no-console: 0 */
/**
 * Successful acceptance tests & lints start the production build.
 * Tasks are run serially, 'pat' -> ('eslint', 'csslint') -> 'bootlint' -> 'build'
 */
const { src, /*dest,*/ series, parallel, task } = require("gulp");
const chalk = require("chalk");
const csslint = require("gulp-csslint");
const eslint = require("gulp-eslint");
const exec = require("child_process").exec;
const log = require("fancy-log");
const stealTools = require("steal-tools");
const del = require("del");
const karma = require("karma");
const path = require("path");

let lintCount = 0;
let browsers = process.env.USE_BROWSERS;
if (browsers) {
    global.whichBrowsers = browsers.split(",");
}
let isWindows = /^win/.test(process.platform);
let useNg = "";

/**
 * Default: Production Acceptance Tests 
 */
const pate2e = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    useNg = "";
    karmaServer(done, true, false);
};
/**
 * Add in Angular unit tests 
 */
const patng = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    useNg = ".ng";
    karmaServer(done, true, false);
};
/*
 * javascript linter
 */
const esLint = function (cb) {
    var stream = src(["../appl/js/**/*.js"])
        .pipe(eslint({
            configFile: "../../.eslintrc.js", // "eslintConf.json",
            quiet: 1
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
    var stream = src(["../appl/css/site.css"])
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
    exec("npx gulp --gulpfile Gulpboot.js", function (err, stdout, stderr) {
        log(stdout);
        log(stderr);
        cb(err);
    });
};
/*
 * Build the application to the production distribution 
 */
const build = function (cb) {
    return toolsBuild(cb);
};
/*
 * Build the application to the production distribution 
 */
// const build_only = function (cb) {
//     return toolsBuild(cb);
// };
/**
 * Remove previous build
 */
const clean = function (done) {
    const dist = "../../dist/";
    return del([
        dist + "stealjs/**/*",
        dist + "bundles/**/*",
        dist + "steal.production.js"
    ], { dryRun: false, force: true }, done);
};
/**
 * Remove previous build
 */
// const clean_only = function (done) {
//     const dist = "../../dist/";
//     return del([
//         dist + "stealjs/**/*",
//         dist + "bundles/**/*",
//         dist + "steal.production.js"
//     ], { dryRun: false, force: true }, done);
// };
/**
 * Run karma/jasmine tests using FirefoxHeadless 
 */
const steal_firefox = function (done) {
    // Running both together as Headless has problems, tdd works
    global.whichBrowsers = ["FirefoxHeadless"];
    karmaServer(done, true, false);
};
/**
 * Run karma/jasmine tests using ChromeHeadless 
 */
const steal_chrome = function (done) {
    // Running both together as Headless has problems, tdd works
    global.whichBrowsers = ["ChromeHeadless"];
    karmaServer(done, true, false);
};
/**
 * Run karma/jasmine tests once and exit
 */
// const steal_test = function (done) {
//     // Running both together as Headless has problems, tdd works
//     if (!browsers) {
//         global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
//     }
//     return runKarma(done, true, false);
// };
/**
 * Run karma/jasmine tests once and exit without rebuilding(requires a previous build)
 */
const e2e_test = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    return karmaServer(done, true, false);
};
/**
 * Run karma/jasmine/angular tests once and exit without rebuilding(requires a previous build)
 */
const ng_test = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    useNg = ".ng";
    return karmaServer(done, true, false);
};
/**
 * Continuous testing - test driven development.  
 */
const steal_tdd = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["Firefox", "Chrome"];
    }
    return karmaServer(done, false, true);
};
/*
 * Compile production angular typescript. 
 */
// const compile = function (cb) {
//     var osCommands = "touch ../appl/entry.ts; ../../node_modules/.bin/tsc --build tsconfig_stealjs.json";
//     if (isWindows) {
//         osCommands = "copy /b ..\\appl\\entry.ts +,, & ..\\..\\node_modules\\.bin/tsc --build";
//     }

//     exec(osCommands, function (err, stdout, stderr) {
//         log(stdout);
//         log(stderr);
//         cb(err);
//     });
// };
/*
 * Compile angular typescript. 
 */
const compile_ts = function (cb) {
    var osCommands = "touch ../appl/entry.ts; npx tsc --build";
    if (isWindows) {
        osCommands = "copy /b ..\\appl\\entry.ts +,, & npx tsc --build";
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
    var osCommands = "cd ../..; node_modules/.bin/steal-tools live-reload";
    if (isWindows) {
        osCommands = "cd ..\\.. & .\\node_modules\\.bin\\steal-tools live-reload";
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
    log.warn(chalk.cyan("Express started"));
    return exec("npm run server", function (err, stdout, stderr) {
        log(stdout);
        log(stderr);
        cb(err);
    });
};

const lintRun = parallel(esLint, esLintts, cssLint, bootLint);
const testRun = series(compile_ts, pate2e, patng);
const prodRun = series(testRun, lintRun, clean, build);
prodRun.displayName = "prod";

task(prodRun);
exports.default = prodRun;
exports.prd = series(clean, build);
exports.test = testRun;
exports.tdd = steal_tdd;
exports.acceptance = ng_test;
exports.firefox = steal_firefox;
exports.chrome = steal_chrome;
exports.hmr = series(vendor, live_reload);
exports.server = web_server;
exports.ngtest = ng_test;
exports.e2e = e2e_test;
exports.development = series(vendor, parallel(live_reload, steal_tdd, web_server));
exports.lint = lintRun;
exports.compile = compile_ts;

function karmaServer(done, singleRun = false, watch = true) {
    const parseConfig = karma.config.parseConfig;
    const Server = karma.Server;
    if (!global.whichBrowsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }

    parseConfig(
        path.resolve("./karma" + useNg + ".conf.js"),
        { port: 9876, singleRun: singleRun, watch: watch },
        { promiseConfig: true, throwErrors: true },
    ).then(
        (karmaConfig) => {
            if(!singleRun) {
                done();
            }
            new Server(karmaConfig, function doneCallback(exitCode) {
                /* eslint no-console: ["error", { allow: ["log"] }] */
                console.log("Karma has exited with " + exitCode);
                if(singleRun) {
                    done();
                }
                if(exitCode > 0) {
                    process.exit(exitCode);
                }
            }).start();
        },
        // eslint-disable-next-line no-console
        (rejectReason) => { console.err(rejectReason); }
    );
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
                "../images/*",
                "../appl/testapp.html",
                "../appl/app_bootstrap.html",
                "../appl/index.html",
                "../index.html",
                "../appl/views/**/*",
                "../appl/assets/**/*",
                "../appl/templates/**/*",
                "../../README.md",
                "../appl/css/table.css",
                "../appl/css/hello.world.css",
                "../appl/dodex/**/*"
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
    }).then(function () {
        del([
            "../appl/components/**/*.js",
            "../appl/services/**/*.js",
            "../appl/entry.js"
        ], { dryRun: false, force: true });
        cb();
    }).catch(function (rejection) {
        console.log("Build Failed:", rejection);
        process.exit(1);
    });
}

//From Stack Overflow - Node (Gulp) process.stdout.write to file
if (process.env.USE_LOGFILE == "true") {
    var fs = require("fs");
    var util = require("util");
    var logFile = fs.createWriteStream("log.txt", { flags: "w" });
    // Or "w" to truncate the file every time the process starts.
    var logStdout = process.stdout;

    console.log = function () {
        logFile.write(util.format.apply(null, arguments) + "\n");
        logStdout.write(util.format.apply(null, arguments) + "\n");
    };
    // eslint-disable-next-line no-console
    console.error = console.log;
}

