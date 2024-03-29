/**
 * Successful acceptance tests & lints start the production build.
 * Tasks are run serially, 'pat'(run acceptance tests) -> 'build-development' -> ('eslint', 'csslint') -> 'bootlint' -> 'build'
 */
const { src, dest, series, parallel, task } = require("gulp");
const log = require("fancy-log");
const rmf = require("rimraf");
const copy = require("gulp-copy");
const exec = require("child_process").exec;
const noop = require("gulp-noop");
const path = require("path");
const chalk = require("chalk");
const karma = require("karma");
const buffer = require("vinyl-buffer");
const envify = require('loose-envify/custom');
const eslint = require("gulp-eslint");
const source = require("vinyl-source-stream");
const uglify = require("gulp-uglify-es").default;
const csslint = require("gulp-csslint");
const watchify = require("watchify");
const stripCode = require("gulp-strip-code");
const browserify = require("browserify");
const removeCode = require("gulp-remove-code");
const sourcemaps = require("gulp-sourcemaps");
const browserSync = require("browser-sync").create("devl");
const tsify = require("tsify");

const startComment = "develblock:start";
const endComment = "develblock:end";
const regexPattern = new RegExp("[\\t ]*(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)" +
    startComment + " ?[\\*\\/]?[\\s\\S]*?(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)" +
    endComment + " ?(\\*\\/)?[\\t ]*\\n?", "g");

let browsers = process.env.USE_BROWSERS;
let testDist = "dist_test/browserify";
let prodDist = "dist/browserify";
let lintCount = 0;
let isWatchify = process.env.USE_WATCH === "true";
let isProduction = process.env.NODE_ENV === "production";
let dist = isProduction ? prodDist : testDist;
let isSplitBundle = true;
let browserifyInited;
let useNg = "";

if (browsers) {
    global.whichBrowsers = browsers.split(",");
}

/**
 * Build bundle from package.json
 */
const build_prod_vendor = function (cb) {
    isWatchify = false;
    return browserifyBuild(cb);
};
/**
 * Build Development bundle from package.json
 */
const build_dev_vendor = function (cb) {
    return isSplitBundle ? browserifyBuild(cb) : noop();
};
/**
 * Production Browserify
 */
const build_prod_bundle = function (cb) {
    isWatchify = false;
    return applicationBuild(cb);
};
/**
 * Development Browserify - optional watchify and reload
 */
const build_dev_bundle = function (cb) {
    // Set isWatchify=true via env USE_WATCH for tdd/test
    return applicationBuild(cb);
};
/**
 * Default: Production Acceptance Tests
 */
const pate2e = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    useNg = "";
    return karmaServer(done, true, false);
};
/**
 * Add in Angular unit tests
 */
const pat = function (done) {
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
    dist = prodDist;
    var stream = src(["../appl/js/**/*.js"])
        .pipe(eslint({
            configFile: "../../.eslintrc.js", //"eslintConf.json",
            quiet: 1
        }))
        .pipe(eslint.format())
        .pipe(eslint.result(() => {
            // Keeping track of # of javascript files linted.
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
    })
        .on("end", function () {
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
/**
 * Remove previous build
 */
const clean = function (done) {
    isProduction = true;
    dist = prodDist;
    return rmf("../../" + prodDist, [], (err) => {
        if (err) {
            log(err);
        }
        done();
    });
};
/**
 * Remove previous test build
 */
const cleant = function (done) {
    isProduction = false;
    dist = testDist;
    return rmf("../../" + testDist, [], (err) => {
        if (err) {
            log(err);
        }
        done();
    });
};
/**
 * Resources and content copied to dist directory - for production
 */
const copyprod = function () {
    copyIndex();
    return copySrc();
};

const copyprod_images = function () {
    return copyImages();
};
/**
 * Resources and content copied to dist_test directory - for development
 */
const copy_test = function () {
    copyIndex();
    return copySrc();
};

const copy_images = function () {
    return copyImages();
};
/*
 * Setup development with reload of app on code change
 */
const watch = function () {
    dist = testDist;
    browserSync.init({ server: "../../", index: "index_b.html", port: 3080, browser: ["google-chrome"] });
    browserSync.watch("../../" + dist + "/index.js").on("change", browserSync.reload); // change any file in appl/ to reload app - triggered on watchify results

    return browserSync;
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
 * Run karma/jasmine tests once and exit without rebuilding(requires a previous build)
 */
const ng_test = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    useNg = ".ng";
    return karmaServer(done, true, false);
};
/**
 * Run watch(HMR)
 */
const b_hmr = function () {
    log(chalk.blue("Watching, will rebuild bundle on code change."));
};

const b_watchify = function (cb) {
    isWatchify = true;
    cb();
};
/**
 * Continuous testing - test driven development.
 */
const tdd_browserify = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["Chrome", "Firefox"];
    }
    karmaServer(done, false, true);
};
/**
 * Karma testing under Opera. -- needs configuation
 */
const tddo = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["Opera"];
    }
    karmaServer(done, false, true);
};

const copyTestRun = parallel(copy_images, copy_test);
const copyProdRun = parallel(copyprod_images, copyprod);
const testRun = series(cleant, copyTestRun, parallel(build_dev_bundle, build_dev_vendor));
const prodRun = series(clean, copyProdRun, parallel(build_prod_bundle, build_prod_vendor));
const lintRun = parallel(esLint, esLintts, cssLint, bootLint);
prodRun.displayName = "prd";

exports.default = series(testRun, pate2e, pat, lintRun, prodRun);
exports.prod = series(testRun, pate2e, pat, lintRun, prodRun);
task(prodRun);
exports.test = series(testRun, pate2e, pat);
exports.tdd = series(testRun, b_watchify, tdd_browserify);
exports.tddo = series(testRun, b_watchify, tddo);
exports.acceptance = e2e_test;
exports.rebuild = testRun;
exports.hmr = series(b_watchify, testRun, b_hmr);
exports.server = watch;
exports.development = parallel(b_watchify, series(testRun, b_hmr), watch, tdd_browserify);
exports.ngtest = ng_test;
exports.e2e = e2e_test;
exports.lint = lintRun;
exports.copy = copyTestRun;

function browserifyBuild(cb) {
    browserifyInited = browserify({
        debug: !isProduction,
        bundleExternal: true
    });

    var mods = getNPMPackageIds();
    for (var id in mods) {
        if (mods[id] !== "@fortawesome/fontawesome-free") {
            browserifyInited.require(require("resolve").sync(mods[id]), { expose: mods[id] });
        }
    }

    var stream = browserifyInited
        .transform(
            envify({ NODE_ENV: isProduction ? 'production' : 'development' })
        )
        .bundle()
        .pipe(source("vendor.js"))
        .pipe(buffer())
        .pipe(isProduction ? stripCode({ pattern: regexPattern }) : noop())
        .pipe(isProduction ? uglify() : noop());

    stream = stream.pipe(sourcemaps.init({ loadMaps: !isProduction }))
        .pipe(sourcemaps.write("../../" + dist + "/maps", { addComment: !isProduction }));

    return stream.pipe(dest("../../" + dist))
        .on("end", function () {
            cb();
        });
}

function getNPMPackageIds() {
    var ids = JSON.parse("{" +
        "\"aw\": \"@fortawesome/fontawesome-free\"," +
        "\"bo\": \"bootstrap\"," +
        "\"jq\": \"jquery\"," +
        "\"lo\": \"lodash\"," +
        "\"hb\": \"handlebars\"," +
        "\"mo\": \"moment\"," +
        "\"@po\": \"@popperjs/core\"," +
        "\"tb\": \"tablesorter\"}");
    return ids;
}

function applicationBuild(cb) {
    browserifyInited = browserify({
        entries: ["../appl/main.ts"],
        transform: ["browserify-css"],
        debug: !isProduction,
        insertGlobals: true,
        noParse: ["jquery", "dodex"],
        cache: {},
        packageCache: {}
    });

    let modules = [];
    var mods = getNPMPackageIds();
    for (var id in modules) {
        if (mods[id] !== "@fortawesome/fontawesome-free") {
            modules
            loose - envify.push(mods[id]);
        }
    }

    if (isSplitBundle) {
        browserifyInited.external(modules);
    }
    enableWatchify();

    return browserifyApp(cb);
}

/*
 * Build application bundle for production or development
 */
function browserifyApp(cb) {
    var stream = browserifyInited
        .transform(
            envify({ NODE_ENV: isProduction ? 'production' : 'development' })
        )
        .add(["../appl/index.ts"])
        .plugin(tsify, { noImplicitAny: false })
        .bundle()
        .pipe(source("index.js"))
        .pipe(removeCode({ production: isProduction }))
        .pipe(buffer())
        .pipe(isProduction ? stripCode({ pattern: regexPattern }) : noop())
        .pipe(isProduction ? uglify().on("error", log) : noop());

    stream = stream.pipe(sourcemaps.init({ loadMaps: !isProduction }))
        .pipe(sourcemaps.write("../../" + dist + "/maps", { addComment: !isProduction }));

    return stream.pipe(dest("../../" + dist))
        .on("end", function () {
            if (typeof cb === "function") {
                cb();
            }
        });
}

function enableWatchify() {
    if (isWatchify) {
        browserifyInited.plugin(watchify);
        browserifyInited.on("update", applicationBuild);
        browserifyInited.on("log", log);
    }
}

function copySrc() {
    if (!isProduction) {
        src(["../../node_modules/bootstrap/dist/css/bootstrap.min.css.map"])
            .pipe(dest("../../" + dist + "/appl"));
    }
    return src(["../appl/views/**/*", "../appl/templates/**/*", "../appl/index.html", "../appl/dodex/**/*",
        isProduction ? "../appl/testapp.html" : "../appl/testapp_dev.html"])
        .pipe(copy("../../" + dist + "/appl"));
}

function copyIndex() {
    return src(["../index.html"])
        .pipe(copy("../../" + dist + "/browserify"));
}

function copyImages() {
    src(["../../../README.md"])
        .pipe(copy("../../" + dist, { prefix: 2 }));
    src(["../../node_modules/jsoneditor/dist/img/jsoneditor-icons.svg",])
        .pipe(copy("../../" + dist, { prefix: 1 }));
    return src(["../images/*", "../appl/assets/*", "../appl/app_*.html", "../appl/css/table.css", "../appl/css/hello.world.css"])
        .pipe(copy("../../" + dist + "/appl"));
}

function copyReadme() {

}

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
        (rejectReason) => { console.err(rejectReason); }
    );
}

/*
 * From Stack Overflow - Node (Gulp) process.stdout.write to file
 * @type type
 */
if (process.env.USE_LOGFILE === "true") {
    var fs = require("fs");
    var origstdout = process.stdout.write;
    var origstderr = process.stderr.write;
    var outfile = "node_output.log";
    var errfile = "node_error.log";

    if (fs.stat(outfile)) {
        fs.unlink(outfile);
    }
    if (fs.stat(errfile)) {
        fs.unlink(errfile);
    }

    process.stdout.write = function (chunk) {
        // eslint-disable-next-line no-control-regex
        fs.appendFile(outfile, chunk.replace(/\x1b\[[0-9;]*m/g, ""));
        origstdout.apply(this, arguments);
    };

    process.stderr.write = function (chunk) {
        // eslint-disable-next-line no-control-regex
        fs.appendFile(errfile, chunk.replace(/\x1b\[[0-9;]*m/g, ""));
        origstderr.apply(this, arguments);
    };
}
