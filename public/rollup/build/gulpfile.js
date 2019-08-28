/**
 * Successful acceptance tests & lints start the production build.
 * Tasks are run serially, 'pat'(run acceptance tests) -> 'build-development' -> ('eslint', 'csslint', 'bootlint') -> 'build'
 */
const { src, dest, series, parallel, task } = require("gulp");
const alias = require("rollup-plugin-alias");
const chalk = require("chalk");
const compilerPackage = require("google-closure-compiler");
const closureCompiler = compilerPackage.gulp();
const commonjs = require("rollup-plugin-commonjs");
const copy = require("gulp-copy");
const csslint = require("gulp-csslint");
const del = require("del");
const eslint = require("gulp-eslint");
const exec = require("child_process").exec;
const livereload = require("rollup-plugin-livereload");
const log = require("fancy-log");
const nodeResolve = require("rollup-plugin-node-resolve");
const noop = require("gulp-noop");
const path = require("path");
const postcss = require("rollup-plugin-postcss");
const progress = require("rollup-plugin-progress");
const replaceEnv = require("rollup-plugin-replace");
const rmf = require("rimraf");
const rollup = require("rollup");
const serve = require("rollup-plugin-serve");
const stripCode = require("gulp-strip-code");
const ts = require("gulp-typescript");
const Server = require("karma").Server;

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
let useNg = "";
let singleRun = true;

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
    useNg = "";
    singleRun = true;
    return runKarma(done);
};
/**
 * Add in Angular unit tests 
 */
const pat = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    useNg = ".ng";
    singleRun = true;
    runKarma(done);
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
        log("# javascript files linted: " + lintCount);
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

const copyprod_fonts = function () {
    isProduction = true;
    dist = prodDist;
    return copyFonts();
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

const copy_fonts = function () {
    isProduction = false;
    dist = testDist;
    return copyFonts();
};
/**
 * Continuous testing - test driven development.  
 */
const tdd_rollup = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["Chrome", "Firefox"];
    }
    singleRun = false;
    useNg = "";
    runKarma(done);
};
/**
 * Karma testing under Opera. -- needs configuation  
 */
const tddo = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["Opera"];
    }
    singleRun = false;
    useNg = "";
    runKarma(done);
};

const rollup_watch = function (cb) {
    const watchOptions = {
        input: `../../${dist}/appl/main.js`,
        onwarn: function (warning) {
            if (warning.code === "THIS_IS_UNDEFINED" ||
                warning.code === "CIRCULAR_DEPENDENCY") {
                return;
            }
            console.warn(warning.message);
        },
        plugins: [
            progress({
                clearLine: isProduction === false
            }),
            postcss(),
            commonjs({
            }),
            nodeResolve({ mainFields: ["module", "main"], browser: true }),
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
        output: {
            name: "acceptance",
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

const lintRun = parallel(esLint, cssLint, bootLint)
const testCopy = series(copy_fonts, parallel(copy_src, copy_images, copy_node_css, copy_css));
const testRun = series(testCopy, build_development, pate2e, pat);
const prodCopy = series(copyprod_fonts, parallel(copyprod_src, copyprod_images, copyprod_node_css, copyprod_css));
const prodRun = series(testRun, lintRun , clean, prodCopy, build);
prodRun.displayName = "prod";

exports.default = prodRun;
task(prodRun);
exports.prd = series(clean, prodCopy, build);
exports.test = series(testCopy, build_development, pate2e, pat);
exports.testit = series(pate2e, pat);
exports.acceptance = pate2e;
exports.ngtest = pat;
exports.rebuild = series(testCopy, build_development);
exports.tdd = tdd_rollup;
exports.tddo = tddo;
exports.watch = rollup_watch;
exports.lint = lintRun;

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
            console.warn(warning.message);
        },
        treeshake: true,
        perf: isProduction === true, 
        plugins: [
            progress({
                clearLine: isProduction === false
            }),
            postcss(),
            commonjs(),
            nodeResolve({ mainFields: ["module", "main"], browser: true }),
            replaceEnv({
                "process.env.NODE_ENV": JSON.stringify(isProduction ? "production" : "development")
            }),
            alias(aliases()),
        ],
    }).catch(function (err) {
        log(chalk.red(`Build ${err}`));
        cb();
        process.exit(1);
    }).then(function (bundle) {
        if(isProduction) {
            console.log("Timings:", bundle.getTimings());
        }
        bundle.write({
            banner: "var fs",
            format: "iife",
            name: "bundle",
            sourcemap: isProduction === false,
            file: `../../${dist}/bundle.js`,
        }).then(function (/*result*/) {
            if (isProduction) {
                del.sync([
                    `../../${dist}/appl/components`,
                    `../../${dist}/appl/services`,
                    `../../${dist}/appl/router`,
                    `../../${dist}/appl/jasmine`,
                    `../../${dist}/appl/js`,
                    `../../${dist}/appl/*.js`
                ], { dryRun: false, force: true });
                googleCompiler(cb);
            }
            else {
                log(chalk.green("*** Build finished ***"));
                cb();
            }
        });
    });
}

function googleCompiler(cb) {
    log(chalk.cyan("Compressing bundle..."));
    return closureCompiler({
        js: "../../dist/rollup/bundle.js",
        compilation_level: "SIMPLE",
        warning_level: "QUIET",
        js_output_file: "bundle.js"
    }, {
        platform: ["native", "java", "javascript"]
      })
        .src()
        .pipe(dest("../../dist/rollup"))
        .on("end", function () {
            log(chalk.green("*** Build finished ***"));
            cb();
        });
}

function modResolve(dir) {
    return path.join(__dirname, "..", dir);
}

function aliases() {
    return {
        app: modResolve("appl/js/app.js"),
        basecontrol: modResolve("appl/js/utils/base.control"),
        config: modResolve("appl/js/config"),
        default: modResolve("appl/js/utils/default"),
        helpers: modResolve("appl/js/utils/helpers"),
        menu: modResolve("appl/js/utils/menu.js"),
        pdf: modResolve("appl/js/controller/pdf"),
        router: modResolve("appl/router"),
        start: modResolve("appl/js/controller/start"),
        setup: modResolve("appl/js/utils/setup"),
        setglobals: modResolve("appl/js/utils/set.globals"),
        setimports: modResolve("appl/js/utils/set.imports"),
        table: modResolve("appl/js/controller/table"),
        pager: "tablesorter/dist/js/extras/jquery.tablesorter.pager.min.js",
        popper: "popper.js/dist/esm/popper.js",
        handlebars: "handlebars/dist/handlebars.min.js",
        bootstrap: "bootstrap/dist/js/bootstrap.min.js",
        "apptest": "../appl/jasmine/apptest.js",
        "contacttest": "./contacttest.js",
        "domtest": "./domtest.js",
        "logintest": "./logintest.js",
        "routertest": "./routertest.js",
        "toolstest": "./toolstest.js"
    };
}

function copySrc() {
    return src(["../appl/views/**/*", "../appl/templates/**/*", "../appl/index.html", "../appl/assets/**/*", isProduction ? "../appl/testapp.html" : "../appl/testapp_dev.html", "../appl/app_bootstrap.html"])
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
    return src(["../appl/css/site.css", "../appl/css/hello.world.css", "../appl/css/table.css"])
        .pipe(copy("../../" + dist + "/appl"));
}

function copyNodeCss() {
    return src(["../../node_modules/bootstrap/dist/css/bootstrap.min.css", "../../node_modules/font-awesome/css/font-awesome.css",
        "../../node_modules/tablesorter/dist/css/jquery.tablesorter.pager.min.css", "../../node_modules/tablesorter/dist/css/theme.blue.min.css"])
        .pipe(copy("../../" + dist + "/appl"));
}

function copyFonts() {
    return src(["../../node_modules/font-awesome/fonts/*"])
        .pipe(copy("../../" + dist, { prefix: 4 }));
}

function runKarma(done) {
    new Server({
        configFile: __dirname + "/karma" + useNg + ".conf.js",
        singleRun: singleRun
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
    var fs = require("fs");
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
        fs.appendFile(outfile, chunk.replace(/\x1b\[[0-9;]*m/g, ""));
        origstdout.apply(this, arguments);
    };

    process.stderr.write = function (chunk) {
        fs.appendFile(errfile, chunk.replace(/\x1b\[[0-9;]*m/g, ""));
        origstderr.apply(this, arguments);
    };
}
