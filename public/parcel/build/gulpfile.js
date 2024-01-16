/*eslint no-console: 0 */
/**
 * Successful acceptance tests & lints start the production build.
 * Tasks are run serially, 'pat'(run acceptance tests) -> 'build-development' -> ('eslint', 'csslint') -> 'build'
 */
const { src, /* dest, */ series, parallel, task } = require("gulp");
const eslint = require("gulp-eslint");
const csslint = require("gulp-csslint");
const exec = require("child_process").exec;
const log = require("fancy-log");
const Parcel = require("@parcel/core").default;
const chalk = require("chalk");
const karma = require("karma");
const path = require("path");
const copy = require("gulp-copy");


let lintCount = 0;
let isProduction = process.env.NODE_ENV == "production";
let browsers = process.env.USE_BROWSERS;
let bundleTest = process.env.USE_BUNDLER;
let testDist = "dist_test/parcel";
let prodDist = "dist/parcel";
let dist = isProduction ? prodDist : testDist;
let useNg = "";

if (browsers) {
    global.whichBrowsers = browsers.split(",");
}
const serve_parcel = function (cb) {
    return parcelBuild(false, true, cb); // setting watch = false
};
/**
 * Build Development bundle from package.json 
 */
const build_development = function (cb) {
    return parcelBuild(false, false, cb);
};
/**
 * Production Parcel 
 */
const build = function (cb) {
    process.env.NODE_ENV = "production";
    isProduction = true;
    dist = prodDist;
    parcelBuild(false, false, cb);
};
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
const pat = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    ngTest(done);
};
/*
 * javascript linter
 */
const esLint = function (cb) {
    dist = prodDist;
    var stream = src(["../appl/js/**/*.js"])
        .pipe(eslint({
            configFile: "../../.eslintrc.js", // 'eslintConf.json',
            quiet: 0
        }))
        .pipe(eslint.format())
        .pipe(eslint.result(() => {
            //Keeping track of # of javascript files linted.
            lintCount++;
        }))
        .pipe(eslint.failAfterError());

    stream.on("error", () => {
        process.exit(1);
    });

    return stream.on("end", () => {
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
    var stream = src(["../appl/css/site.css", "../appl/css/hello.world.css"])
        .pipe(csslint())
        .pipe(csslint.formatter());

    stream.on("error", () => {
        process.exit(1);
    }).on("end", () => {
        cb();
    });
};
/**
 * Run Angular Devkit karma/jasmine unit tests - uses angular.json
 */
 const ngTest = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    process.env.BUNDLER = "parcel";
    const spawn = require('child_process').spawn;
    const run = spawn("cd .. && npx ng test devacc", { shell: true, stdio: 'inherit' });
    run.on("exit", code => {
        done(code);
    });
};
/**
 * Run Angular linting - uses angular.json
 */
 const ngLint = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    process.env.BUNDLER = "parcel";
    const spawn = require('child_process').spawn;
    const run = spawn("npm run anglint", { shell: true, stdio: 'inherit' });
    run.on("exit", code => {
        done(code);
    });
};
/**
 * Remove previous build
 */
const clean = function (done) {
    isProduction = true;
    dist = prodDist;
    return import("del").then(del => {
        del.deleteSync([
                 "../../" + prodDist + "/**/*"
             ], { dryRun: false, force: true });
        done();
     });
};

const cleant = function (done) {
    let dryRun = false;
    if (bundleTest && bundleTest === "false") {
        dryRun = true;
    }
    isProduction = false;
    dist = testDist;
    return import("del").then(del => {
        del.deleteSync([
                 "../../" + testDist + "/**/*"
             ], { dryRun: false, force: true });
        done();
     });
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
    return karmaServer(done, true, false);
};
/**
 * Run karma/jasmine/angular tests once and exit using angular devkit
 */
const ng_test = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    return ngTest(done);
};
/**
 * Continuous testing - test driven development.  
 */
const tdd_parcel = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["Chrome", "Firefox"];
    }
    karmaServer(done, false, true);
};
/**
 * Karma testing under Opera. -- needs configuation  
 */
// eslint-disable-next-line no-unused-vars
const tddo = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["Opera"];
    }
    karmaServer(done, false, true);
};

const watch_parcel = function (cb) {
    return parcelBuild(true, false, cb);
};

const testRun = series(cleant, copy_images, copy_test, build_development);
const lintRun = parallel(esLint, esLintts, ngLint, cssLint);
const prodRun = series(testRun, pate2e, pat, lintRun, clean, copyprod_images, copyprod, build);
const copyStatic = series(cleant, parallel(copy_images, copy_test));
prodRun.displayName = "prod";

task(prodRun);
exports.default = prodRun;
exports.prd = series(clean, copyprod_images, copyprod, build);
exports.test = series(testRun, pate2e, pat);
exports.tdd = series(testRun, tdd_parcel);
exports.acceptance = series(lintRun, e2e_test, ng_test);
exports.watch = series(copyStatic, watch_parcel, copyImagesForWatch);
exports.serve = series(copyStatic, serve_parcel, copyImagesForWatch);
exports.rebuild = testRun;
exports.ngtest = ng_test;
exports.e2e = e2e_test;
exports.lint = lintRun;
exports.copy = series(copy_images, copy_test);
exports.nglint = ngLint;

function parcelBuild(watch, serve = false, cb) {
    if (bundleTest && bundleTest === "false") {
        return cb();
    }
    const file = isProduction ? "../appl/testapp.html" : "../appl/testapp_dev.html";
    const port = 3080;
    // Bundler options
    const options = {
        mode: isProduction ? "production" : "development",
        entryRoot: "../appl",
        entries: file,
        shouldDisableCache: !isProduction,
        shouldAutoInstall: true,
        shouldProfile: false,
        cacheDir: ".cache",
        shouldContentHash: isProduction,
        logLevel: "info",
        detailedReport: isProduction,
        defaultConfig: require.resolve("@parcel/config-default"),
        additionalReporters: [
            { packageName: "@parcel/reporter-cli", resolveFrom: __filename },
            { packageName: "@parcel/reporter-dev-server", resolveFrom: __filename }
        ],
        shouldPatchConsole: false,
        defaultTargetOptions: {
            publicUrl: "./",
            shouldOptimize: isProduction,
            shouldScopeHoist: false,
            sourceMaps: isProduction,
            distDir: "../../" + dist + "/appl"
        }
    };

    return (async () => {
        const parcel = new Parcel(options);
        if (serve || watch) {
            options.hmrOptions = {
                port: port,
                host: "localhost"
            };
            options.serveOptions = {
                host: "localhost",
                port: port,
                https: false
            };
            await parcel.watch(err => {
                if (err) throw err;
            });
            cb();
        } else {
            try {
                await parcel.run(err => {
                    console.error(err, err.diagnostics[0] ? err.diagnostics[0].codeFrame : "");
                });
            } catch (e) {
                console.error(e);
                process.exit(1);
            }
            cb();
        }
    })();
}

function copySrc() {
    src([
        "../appl/views/**/*",
        "../appl/templates/**/*",
    ])
        .pipe(copy("../../" + dist, { prefix: 1 }));
    src([
        "../appl/css/**/*.css"
    ])
        .pipe(copy("../../" + dist, { prefix: 1 }));
    src([
        "../appl/dodex/**/*"
    ])
        .pipe(copy("../../" + dist, { prefix: 1 }));
    return src(["../images*/**/*"])
        .pipe(copy("../../" + dist, { prefix: 1 }));
}

function copyImages() {
    copyfiles();
    return src(["../../README.md"])
        .pipe(copy("../../" + dist, { prefix: 2 }));
}

function copyImagesForWatch() {
    src(["../../README.md"])
        .pipe(copy("../../" + dist + "/appl", { prefix: 2 }));

    return src(["../images*/**/*"])
        .pipe(copy("../../" + dist + "/appl", { prefix: 1 }));
}

function copyfiles() {
    return src(["../appl/app_bootstrap.html", "../appl/app_footer.html"])
        .pipe(copy("../../" + dist, { prefix: 1 }));
}

function karmaServer(done, singleRun = false, watch = true) {
    const parseConfig = karma.config.parseConfig;
    const Server = karma.Server;

    parseConfig(
        path.resolve("./karma" + useNg + ".conf.js"),
        { port: 9876, singleRun: singleRun, watch: watch },
        { promiseConfig: true, throwErrors: true },
    ).then(
        (karmaConfig) => {
            if (!singleRun) {
                done();
            }
            new Server(karmaConfig, function doneCallback(exitCode) {
                /* eslint no-console: ["error", { allow: ["log"] }] */
                console.log("Karma has exited with " + exitCode);
                if (singleRun) {
                    done();
                }
                if (exitCode > 0) {
                    process.exit(exitCode);
                }
            }).start();
        },
        // eslint-disable-next-line no-console
        (rejectReason) => { console.error(rejectReason); }
    );
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
