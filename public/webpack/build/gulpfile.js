/**
 * Production build using karma/jasmine acceptance test approval and Development environment with Webpack
 * Successful acceptance tests & lints start the production build.
 * Tasks are run serially, 'pat' -> test-build -> acceptance-tests -> ('csslint') -> 'build(eslint)'
 */
const { src, dest, series, parallel, task } = require("gulp");
const env = require("gulp-env");
const log = require("fancy-log");
const rmf = require("rimraf");
const exec = require("child_process").exec;
const path = require("path");
const chalk = require("chalk");
const config = require("./config/index.js");
const csslint = require("gulp-csslint");
const eslint = require("gulp-eslint");
const webpack = require("webpack");
const webpackStream = require("webpack-stream");
const WebpackDevServer = require("webpack-dev-server");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const karma = require("karma");

const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 3080; // && Number(process.env.PORT);

let webpackConfig = null;
let browsers = process.env.USE_BROWSERS;
let useNg = "";
let lintCount = 0;

if (browsers) {
    global.whichBrowsers = browsers.split(",");
}

/**
 * Default: Production Acceptance Tests
 */
const pate2e = function (done) {
    if (!browsers) {
        global.whichBrowser = ["ChromeHeadless", "FirefoxHeadless"];
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
    log(chalk.cyan("Starting Angular unit tests with", global.whichBrowsers));
    process.env.BUNDLER = "webpack";
    ngTest(done);
};
/*
 * javascript linter
 */
const esLint = function (cb) {
    var stream = src(["../appl/js/**/*.js"])
        .pipe(eslint({
            configFile: "eslintConf.json",
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
    var stream = src(["../appl/css/site.css", "../appl/css/hello.world.css", "../appl/css/app.css" /**/])
        .pipe(csslint())
        .pipe(csslint.formatter());

    stream.on("error", function (err) {
        log(err);
        process.exit(1);
    }).on("end", function () {
        cb();
    });
};
/*
 * Bootstrap html linter
 */
const bootLint = function (cb) {
    log("Starting Gulpboot.js");
    return exec("npx gulp --gulpfile Gulpboot.js", function (err, stdout, stderr) {
        log(stdout);
        log(stderr);
        cb(err);
    });
};
/**
 * Run Angular Devkit karma/jasmine unit tests - uses angular.json
 */
 const ngTest = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    process.env.BUNDLER = "webpack";
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
    process.env.BUNDLER = "esbuild";
    const spawn = require('child_process').spawn;
    const run = spawn("npm run anglint", { shell: true, stdio: 'inherit' });
    run.on("exit", code => {
        done(code);
    });
};
/*
 * Build the application to the production distribution
 */
const build = function (cb) {
    var envs = env.set({
        NODE_ENV: "production",
        USE_WATCH: "false",
        USE_KARMA: "false",
        USE_HMR: "false",
        PUBLIC_PATH: "",
        USE_TEST: "false",
        USE_BUILD: "false"
    });

    rmf("../../dist/webpack", [], (err) => {
        if (err) {
            log(err);
        }
    });
    return src("../appl/main.ts")
        .pipe(envs)
        .pipe(webpackStream(require("./webpack.prod.conf.js"), webpack))
        .pipe(envs.reset)
        .pipe(dest("../../dist/webpack"))
        .on("error", function (err) {
            log(err);
            cb();
        })
        .on("end", function () {
            cb();
        });
};
/*
 * javascript linter - test
 */
const eslint_test = function (cb) {
    var stream = src(["../appl/js/**/*.js"])
        .pipe(eslint({
            configFile: "eslintConf.json",
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

const test_env = function (cb) {
    var envs = env.set({
        NODE_ENV: "development",
        USE_WATCH: "false",
        USE_KARMA: "true",
        USE_HMR: "false",
        USE_BUILD: false,
        PUBLIC_PATH: "/base/dist_test/webpack/"   //This sets config to run under Karma
    });

    return src("../appl/main.ts")
        .pipe(envs)
        .on("end", function () {
            cb();
        });
};
/**
 * Run karma/jasmine tests once and exit without rebuilding(requires a previous build)
 */
const e2e_test = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    karmaServer(done, true, false);
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
/*
 * Build Test without Karma settings for npm Express server (npm start)
 */
const webpack_rebuild = function (cb) {
    var envs = env.set({
        NODE_ENV: "development",
        USE_WATCH: "false",
        USE_KARMA: "false",
        USE_HMR: "false",
        PUBLIC_PATH: "",
        USE_TEST: "true",
        USE_BUILD: "false"
    });

    rmf("../../dist_test/webpack", [], (err) => {
        if (err) {
            log(err);
        }
    });
    return src("../appl/main.ts")
        .pipe(envs)
        .pipe(webpackStream(require("./webpack.dev.conf.js"), webpack))
        .pipe(envs.reset)
        .pipe(dest("../../dist_test/webpack"))
        .on("end", function () {
            cb();
        });
};
/*
 * Build the test bundle
 */
const test_build = function (cb) {
    var useBuild = process.env.USE_BUILD === "false" ? "false" : "true";
    var envs = env.set({
        NODE_ENV: "development",
        USE_WATCH: "false",
        USE_KARMA: "true",
        USE_HMR: "false",
        USE_BUILD: useBuild,
        PUBLIC_PATH: "/base/dist_test/webpack/"   //This sets config to run under Karma
    });

    if (process.env.USE_BUILD == "false") {  //Let Webpack do the build if only doing unit-tests
        return src("../appl/main.ts")
            .pipe(envs);
    }

    rmf("../../dist_test/webpack", [], (err) => {
        log(chalk.cyan("dist_test/webpack cleaned"));
        if (err) {
            log(err);
        }
    });
    return src("../appl/main.ts")
        .pipe(envs)
        .pipe(webpackStream(require("./webpack.dev.conf.js"), webpack))
        .pipe(envs.reset)
        .pipe(dest("../../dist_test/webpack"))
        .on("end", function () {
            cb();
        });
};
/**
 * Continuous testing - test driven development.
 */
const webpack_tdd = function (done) {
    if (typeof browsers === "undefined") {
        global.whichBrowsers = ["Chrome", "Firefox"];
    }
    karmaServer(done, false, true);
};
/*
 * Webpack recompile to 'dist_test' on code change
 * run watch in separate window. Used with karma tdd.
 */
const webpack_watch = function (cb) {
    let envs = env.set({
        NODE_ENV: "development",
        USE_WATCH: "true",
        USE_KARMA: "false",
        USE_HMR: "false",
        PUBLIC_PATH: "/base/dist_test/webpack/"
    });

    return src("../appl/**/*")
        .pipe(envs)
        .pipe(webpackStream(require("./webpack.dev.conf.js"), webpack))
        .pipe(dest("../../dist_test/webpack"))
        .on("end", function () {
            cb();
        });
};
/*
 * Webpack development server - use with normal development
 * Rebuilds bundles in dist_test on code change.
 * Run server in separate window -
 * - watch for code changes
 * - hot module recompile/replace
 * - reload served web page.
 */
const webpack_server = function (cb) {
    env.set({
        NODE_ENV: "development",
        USE_WATCH: "true",
        USE_KARMA: "false",
        USE_HMR: "true"
    });

    webpackConfig = require("./webpack.dev.conf.js");
    webpackConfig.devtool = "eval";
    webpackConfig.output.path = path.resolve(config.dev.assetsRoot);
    webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
    webpackConfig.plugins.push(new HtmlWebpackPlugin({
        filename: "testapp_dev.html",
        template: "appl/testapp_dev.html",
        // alwaysWriteToDisk: true,
        inject: true
    }));

    webpackConfig.entry = getEntry();
    const compiler = webpack(webpackConfig);
    const devServerOptions = { ...webpackConfig.devServer, open: false};
    const server = new WebpackDevServer(devServerOptions, compiler);
    server.startCallback(() => {
        log(chalk.blue(`\nSuccessfully started server on http://localhost:${PORT}`));
        cb();
      });
};

const testRun = series(eslint_test, test_build);
const lintRun = parallel(esLint, esLintts, ngLint, cssLint);
const prodRun = series(testRun, pate2e, pat, lintRun, build);
prodRun.displayName = "prod";

task(prodRun);
exports.default = prodRun;
exports.prd = series(lintRun, build);
exports.test = series(testRun, pate2e, pat);
exports.tdd = series(testRun, webpack_tdd);
exports.rebuild = webpack_rebuild;
exports.acceptance = series(test_env, e2e_test);
exports.ngtest = series(test_env, ng_test);
exports.e2e = series(test_env, e2e_test);
exports.hmr = webpack_server;
exports.watch = webpack_watch;
exports.development = parallel(webpack_server, webpack_tdd);
exports.lint = lintRun;
exports.ngtest = ngTest;
exports.nglint = ngLint;

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

//From Stack Overflow - Node (Gulp) process.stdout.write to file
if (process.env.USE_LOGFILE == "true") {
    var fs = require("fs");
    // eslint-disable-next-line no-unused-vars
    var proc = require("process");
    var origstdout = process.stdout.write,
        origstderr = process.stderr.write,
        outfile = "node_output.log",
        errfile = "node_error.log";

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
/*
 * Taking a snapshot example - puppeteer - Not installed!
 */
// eslint-disable-next-line no-unused-vars
function karmaServerSnap(done, singleRun = true, watch = false) {
    if (!global.whichBrowsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    const parseConfig = karma.config.parseConfig;
    const Server = karma.Server;

    parseConfig(
        path.resolve("./karma.conf.js"),
        { port: 9876, singleRun: singleRun, watch: watch },
        { promiseConfig: true, throwErrors: true },
    ).then(
        (karmaConfig) => {
            new Server(karmaConfig, function doneCallback(exitCode) {
                console.log("Karma has exited with " + exitCode);
                done();
                if (exitCode > 0) {
                    takeSnapShot(["", "start"]);
                    takeSnapShot(["contact", "contact"]);
                    takeSnapShot(["welcome", "react"]);
                    takeSnapShot(["table/tools", "tools"]);
                    // Not working with PDF-?
                    // takeSnapShot(['pdf/test', 'test'])
                }
                process.exit(exitCode);
            }).start();
        },
        // eslint-disable-next-line no-console
        (rejectReason) => { console.err(rejectReason); }
    );
}

function snap(url, puppeteer, snapshot) {  // Puppeteer is not installed
    puppeteer.launch().then((browser) => {
        console.log("SnapShot URL", `${url}${snapshot[0]}`);
        let name = snapshot[1];
        // eslint-disable-next-line no-unused-vars
        let page = browser.newPage().then((page) => {
            page.goto(`${url}${snapshot[0]}`).then(() => {
                page.screenshot({ path: `snapshots/${name}Acceptance.png` }).then(() => {
                    browser.close();
                }).catch((rejected) => {
                    log(rejected);
                });
            }).catch((rejected) => {
                log(rejected);
            });
        }).catch((rejected) => {
            log(rejected);
        });
    }).catch((rejected) => {
        log(rejected);
    });
}

function takeSnapShot(snapshot) {
    const puppeteer = require("puppeteer");
    let url = "http://localhost:3080/dist_test/webpack/appl/testapp_dev.html#/";

    snap(url, puppeteer, snapshot);
}

function getEntry() {
    return [
        // Runtime code for hot module replacement
        "webpack/hot/dev-server.js",
        // Dev server client for web socket transport, hot and live reload logic
        "webpack-dev-server/client/index.js?hot=true&live-reload=true",
        // Your entry
        "/appl/main",
    ];
}
