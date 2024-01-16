/**
 * Successful acceptance tests & lints start the production build.
 * Tasks are run serially, 'pat'(run acceptance tests) -> 'build-development' -> ('eslint', 'csslint') -> 'build'
 */
const { src, dest, series, parallel, task } = require("gulp");
var fs = require("fs");
const alias = require("@rollup/plugin-alias");
const buble = require("@rollup/plugin-buble");
const chalk = require("chalk");
const commonjs = require("@rollup/plugin-commonjs");
const copy = require("gulp-copy");
const csslint = require("gulp-csslint");
const eslint = require("gulp-eslint");
const exec = require("child_process").exec;
const livereload = require("rollup-plugin-livereload");
const log = require("fancy-log");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const noop = require("gulp-noop");
const path = require("path");
const postcss = require("rollup-plugin-postcss");
const progress = require("rollup-plugin-progress");
const replaceEnv = require("@rollup/plugin-replace");
const rmf = require("rimraf");
const rollup = require("rollup");
const serve = require("rollup-plugin-serve");
const stripCode = require("gulp-strip-code");
const terser = require("@rollup/plugin-terser");
const ts = require("gulp-typescript");
const karma = require("karma");

const startComment = "develblock:start",
    endComment = "develblock:end",
    regexPattern = new RegExp("[\\t ]*(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)" +
        startComment + " ?[\\*\\/]?[\\s\\S]*?(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)" +
        endComment + " ?(\\*\\/)?[\\t ]*\\n?", "g");

let lintCount = 0;
let isProduction = process.env.NODE_ENV == "production";
let browsers = process.env.USE_BROWSERS;
let testDist = "dist_test/rollup";
let prodDist = "dist/rollup";
let dist = isProduction ? prodDist : testDist;

if (browsers) {
    global.whichBrowsers = browsers.split(",");
}

/**
 * Build Development bundle from package.json 
 */
const build_development = function (cb) {
    return rollupBuild(cb);
};
/**
 * Production Rollup 
 */
const build = function (cb) {
    return rollupBuild(cb);
};
/**
 * Default: Production Acceptance Tests 
 */
const pate2e = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    return karmaServer(done, true, false);
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
    });
    return stream.on("end", function () {
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
    process.env.BUNDLER = "rollup";
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
    process.env.BUNDLER = "rollup";
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
    return rmf(`../../${prodDist}/**/*`, err => {
        done(err);
    });
};
/**
 * Resources and content copied to dist directory - for production
 */
const copyprod_src = function () {
    copyIndex();
    return copySrc();
};

const copyprod_images = function () {
    return copyImages();
};

const copyprod_node_css = function () {
    return copyNodeCss();
};

const copyprod_css = function () {
    return copyCss();
};

/**
 * Resources and content copied to dist_test directory - for development
 */
const copy_src = function () {
    return copySrc();
};

const copy_images = function () {
    copyIndex();
    return copyImages();
};

const copy_node_css = function () {
    return copyNodeCss();
};

const copy_css = function () {
    return copyCss();
};

/**
 * Continuous testing - test driven development.  
 */
const tdd_rollup = function (done) {
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

const rollup_watch = function (cb) {
    const watchOptions = {
        input: `../../${dist}/appl/main.js`,
        onwarn: function (warning) {
            if (warning.code === "THIS_IS_UNDEFINED" ||
                warning.code === "CIRCULAR_DEPENDENCY") {
                return;
            }
            // eslint-disable-next-line no-console
            console.warn(warning.message);
        },
        plugins: [
            progress({
                clearLine: isProduction === false
            }),
            postcss(),
            commonjs(),
            nodeResolve({ extensions: [".js", ".ts", ".json"] }),
            replaceEnv({
                "process.env.NODE_ENV": JSON.stringify(isProduction ? "production" : "development")
            }),
            alias(aliases()),
            serve({
                open: false,
                verbose: true,
                contentBase: "../../",
                historyApiFallback: false,
                host: "localhost",
                port: 3080
            }),
            livereload({
                watch: "../../" + dist + "/bundle.js",
                verbose: true,
            })
        ],
        external: ["fs"],
        output: {
            name: "acceptance",
            globals: {"fs": "fs"},
            file: "../../" + dist + "/bundle.js",
            format: "iife",
            sourcemap: true,
            banner: "var fs"
        }
    };

    const watcher = rollup.watch(watchOptions);
    let starting = false;
    watcher.on("event", event => {
        switch (event.code) {
            case "START":
                log("Starting...");
                starting = true;
                break;
            case "BUNDLE_START":
                log(event.code, "\nInput=", event.input, "\nOutput=", event.output);
                break;
            case "BUNDLE_END":
                log("Waiting for code change. Build Time:", millisToMinutesAndSeconds(event.duration));
                break;
            case "END":
                if (!starting) {
                    log("Watch Shutdown Normally");
                    cb();
                }
                starting = false;
                break;
            case "ERROR":
                log("Unexpected Error", event);
                cb();
                break;
            case "FATAL":
                log("Rollup Watch interrupted by Fatal Error", event);
                cb();
                break;
            default:
                break;
        }
    });
};

const lintRun = parallel(esLint, esLintts, ngLint, cssLint)
const testCopy = series(parallel(copy_src, copy_images, copy_node_css, copy_css));
const testRun = series(testCopy, build_development, pate2e, pat);
const prodCopy = series(parallel(copyprod_src, copyprod_images, copyprod_node_css, copyprod_css));
const prodRun = series(testRun, lintRun , clean, prodCopy, build);
prodRun.displayName = "prod";

exports.default = prodRun;
task(prodRun);
exports.prd = series(clean, prodCopy, build);
exports.test = series(testCopy, build_development, pate2e, pat);
exports.testit = series(pate2e, pat);
exports.e2e = pate2e;
exports.acceptance = series(lintRun, pate2e, pat);
exports.ngtest = pat;
exports.rebuild = series(testCopy, build_development);
exports.tdd = tdd_rollup;
exports.tddo = tddo;
exports.watch = rollup_watch;
exports.lint = lintRun;
exports.nglint = ngLint;

var tsProject = ts.createProject("../tsconfig.json", {
    typescript: require("typescript")
});

function rollupBuild(cb) {
    src(["../appl/**/*.ts", "../appl/**/*js"])
        .pipe(tsProject.src())
        .pipe(tsProject())
        .pipe(isProduction ? stripCode({ pattern: regexPattern }) : noop())
        .pipe(dest(`../../${dist}/appl`))
        .on("error", (err) => {
            log(err);
            cb();
            process.exit(1);
        })
        .on("end", () => {
            buildBundle(cb);
        });
}

function buildBundle(cb) {
    rollup.rollup({
        input: `../../${dist}/appl/main.js`,
        onwarn: function (warning) {
            if (warning.code === "THIS_IS_UNDEFINED" ||
                warning.code === "CIRCULAR_DEPENDENCY") {
                return;
            }
            // eslint-disable-next-line no-console
            console.warn(warning.message);
        },
        treeshake: true,
        perf: isProduction === true, 
        plugins: [
            progress({
                clearLine: true
            }),
            postcss(),
            buble({ exclude: "../../node_modules/**" }),
            commonjs(),
            nodeResolve({ extensions: [".js", ".ts", ".json"] }),
            replaceEnv({
                "process.env.NODE_ENV": JSON.stringify(isProduction ? "production" : "development")
            }),
            alias(aliases()),
            isProduction ? terser() : noop()
        ],
    }).catch(function (err) {
        log(chalk.red(`Build ${err}`));
        cb();
        process.exit(1);
    }).then(function (bundle) {
        if(isProduction) {
            // eslint-disable-next-line no-console
            console.warn("Timings:", bundle.getTimings());
        }
        log(chalk.cyan("Writing bundle..."));
        bundle.write({
//            external: ["fs"],
//            output: {
                globals: {"fs": "fs"},
                file: `../../${dist}/bundle.js`,
                banner: "var fs",
                format: "iife",
                name: "bundle",
                sourcemap: isProduction === false,
//            },
        }).then(function () {
            if (isProduction) {
                import("del").then(del => {
                  del.deleteSync([
                    `../../${dist}/appl/components`,
                    `../../${dist}/appl/services`,
                    `../../${dist}/appl/router`,
                    `../../${dist}/appl/jasmine`,
                    `../../${dist}/appl/js`,
                    `../../${dist}/appl/\*.js`
                    ], { dryRun: false, force: true });
                  cb();
                });
            }
            else {
                log(chalk.green("*** Build finished ***"));
                cb();
            }
        });
    });
}

function modResolve(dir) {
    return path.join(__dirname, "..", dir);
}

function aliases() {
    return {
        entries: [
            {find: "setglobals", replacement: modResolve("appl/js/utils/set.globals")},
            {find: "setimports", replacement: modResolve("appl/js/utils/set.imports")},
            {find: "app", replacement: modResolve("appl/js/app.js")},
            {find: "router", replacement: modResolve("appl/router")},
            {find: "config", replacement: modResolve("appl/js/config")},
            {find: "helpers", replacement: modResolve("appl/js/utils/helpers")},
            {find: "setup", replacement: modResolve("appl/js/utils/setup")},
            {find: "menu", replacement: modResolve("appl/js/utils/menu.js")},
            {find: "default", replacement: modResolve("appl/js/utils/default")},
            {find: "basecontrol", replacement: modResolve("appl/js/utils/base.control")},
            {find: "start", replacement: modResolve("appl/js/controller/start")},
            {find: "pdf", replacement: modResolve("appl/js/controller/pdf")},
            {find: "table", replacement: modResolve("appl/js/controller/table")},
            {find: "pager", replacement: "tablesorter/dist/js/extras/jquery.tablesorter.pager.min.js"},
            {find: "popper", replacement: "popper.js/dist/esm/popper.js"},
            {find: "handlebars", replacement: "handlebars/dist/handlebars.min.js"},
            {find: "bootstrap", replacement: "bootstrap/dist/js/bootstrap.min.js"},
            {find: "apptest", replacement: "../appl/jasmine/apptest.js"},
            {find: "contacttest", replacement: "./contacttest.js"},
            {find: "domtest", replacement: "./domtest.js"},
            {find: "logintest", replacement: "./logintest.js"},
            {find: "routertest", replacement: "./routertest.js"},
            {find: "toolstest", replacement: "./toolstest.js"},
            {find: "dodextest", replacement: "./dodextest.js"},
            {find: "inputtest", replacement: "./inputtest.js"}
     ]
    };
}

function copySrc() {
    return src(["../appl/views/**/*", "../appl/templates/**/*", "../appl/index.html",
            "../appl/assets/**/*", isProduction ? "../appl/testapp.html" : "../appl/testapp_dev.html",
            "../appl/app_bootstrap.html", "../appl/app_footer.html"])
        .pipe(copy("../../" + dist + "/appl"));
}

function copyIndex() {
    return src(["../index.html"])
        .pipe(copy("../../" + dist));
}

function copyImages() {
    return src(["../images/*", "../../README.md"])
        .pipe(copy("../../" + dist + "/appl"));
}

function copyCss() {
    src(["../../node_modules/jsoneditor/dist/img/jsoneditor-icons.svg"])
        .pipe(copy("../../" + dist + "/appl", { prefix: 5 }));
    return src(["../appl/css/site.css", "../appl/css/hello.world.css", "../appl/css/table.css"])
        .pipe(copy("../../" + dist + "/appl"));
}

function copyNodeCss() {
    return src(["../../node_modules/bootstrap/dist/css/bootstrap.min.css",
        "../../node_modules/tablesorter/dist/css/jquery.tablesorter.pager.min.css", "../../node_modules/tablesorter/dist/css/theme.blue.min.css"])
        .pipe(copy("../../" + dist + "/appl"));
}

function karmaServer(done, singleRun = false, watch = true) {
    const parseConfig = karma.config.parseConfig;
    const Server = karma.Server;

    parseConfig(
        path.resolve("./karma.conf.js"),
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
//per stackoverflow - Converting milliseconds to minutes and seconds with Javascript
function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return ((seconds == 60 ? (minutes + 1) + ":00" : minutes + ":" + (seconds < 10 ? "0" : "") + seconds) + (minutes === 0 ? " seconds" : "minutes"));

}
/*
 * From Stack Overflow - Node (Gulp) process.stdout.write to file
 * @type type
 */
if (process.env.USE_LOGFILE == "true") {
    var origstdout = process.stdout.write,
        origstderr = process.stderr.write,
        outfile = "node_output.log",
        errfile = "node_error.log";

    if (fs.exists(outfile)) {
        fs.unlink(outfile);
    }
    if (fs.exists(errfile)) {
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
