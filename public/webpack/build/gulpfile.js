/**
 * Production build using karma/jasmine acceptance test approval and Development environment with Webpack
 * Successful acceptance tests & lints start the production build.
 * Tasks are run serially, 'pat' -> test-build -> acceptance-tests -> ('csslint', 'bootlint') -> 'build(eslint)'
 */
const { src, dest, series, parallel, task } = require('gulp')
const env = require("gulp-env")
const log = require("fancy-log")
const rmf = require('rimraf')
const exec = require('child_process').exec
// const execSync = require('child_process').execSync
const path = require('path')
const chalk = require('chalk')
const config = require('./config')
const csslint = require('gulp-csslint')
const eslint = require('gulp-eslint');
const webpack = require('webpack')
const webpackStream = require("webpack-stream")
const WebpackDevServer = require('webpack-dev-server')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const Server = require('karma').Server

const package = require('../../package.json')
const webpackVersion = Number(/\d/.exec(package.devDependencies.webpack)[0])
const HOST = process.env.HOST || 'localhost'
const PORT = process.env.PORT && Number(process.env.PORT)

let webpackConfig = null
let browsers = process.env.USE_BROWSERS
let useNg = '';
let runSingle = true;
let lintCount = 0;

if (browsers) {
    global.whichBrowsers = browsers.split(",")
}

/**
 * Default: Production Acceptance Tests 
 */
const pate2e = function (done) {
    if (!browsers) {
        global.whichBrowser = ["ChromeHeadless", "FirefoxHeadless"];
    }
    useNg = ''
    runSingle = true
    karmaServer(done);
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
    karmaServer(done);
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
    var stream = src(['../appl/css/site.css'])
        .pipe(csslint())
        .pipe(csslint.formatter());

    stream.on('error', function (err) {
        log(err);
        process.exit(1);
    }).on('error', function (err) {
        cb()
    });
};
/*
 * Bootstrap html linter 
 */
const bootLint = function (cb) {
    log("Starting Gulpboot.js")
    return exec('npx gulp --gulpfile Gulpboot.js', function (err, stdout, stderr) {
        log(stdout);
        log(stderr);
        cb(err);
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

    rmf('../../dist/webpack', [], (err) => {
        if (err) {
            log(err)
        }
    });
    return src("../appl/main.ts")
        .pipe(envs)
        .pipe(webpackStream(require('./webpack.prod.conf.js')))
        .pipe(envs.reset)
        .pipe(dest("../../dist/webpack"))
        .on("end", function () {
            cb();
        })
};
/*
 * Build the application to the production distribution 
 */
const build_prod = function (cb) {
    var envs = env.set({
        NODE_ENV: "production",
        USE_WATCH: "false",
        USE_KARMA: "false",
        USE_HMR: "false",
        PUBLIC_PATH: "",
        USE_TEST: "false",
        USE_BUILD: "false"
    });

    rmf('../../dist/webpack', [], (err) => {
        if (err) {
            log(err)
        }
    });
    return src("../appl/main.ts")
        .pipe(envs)
        .pipe(webpackStream(require('./webpack.prod.conf.js'))) // (null, {mode:"production"})))
        .pipe(envs.reset)
        .pipe(dest("../../dist/webpack"))
        .on("end", function () {
            cb()
        })
};
/*
 * javascript linter - test
 */
const eslint_test = function (cb) {
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
}

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
            cb()
        })
}
/**
 * Run karma/jasmine tests once and exit without rebuilding(requires a previous build)
 */
const e2e_test = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    runSingle = true;
    return karmaServer(done);
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
    return karmaServer(done);
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

    rmf('../../dist_test/webpack', [], (err) => {
        if (err) {
            log(err)
        }
    });
    return src("../appl/main.ts")
        .pipe(envs)
        .pipe(webpackStream(require('./webpack.dev.conf.js')))
        .pipe(envs.reset)
        .pipe(dest("../../dist_test/webpack"))
        .on("end", function () {
            cb()
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

    if (process.env.USE_BUILD == 'false') {  //Let Webpack do the build if only doing unit-tests
        return src("../appl/main.ts")
            .pipe(envs);
    }

    rmf('../../dist_test/webpack', [], (err) => {
        log(chalk.cyan("dist_test/webpack cleaned"))
        if (err) {
            log(err)
        }
    });
    return src("../appl/main.ts")
        .pipe(envs)
        .pipe(webpackStream(require('./webpack.dev.conf.js')))
        .pipe(envs.reset)
        .pipe(dest("../../dist_test/webpack"))
        .on("end", function () {
            cb()
        });
};
/**
 * Continuous testing - test driven development.  
 */
const webpack_tdd = function (done) {
    if (!browsers) {
        global.whichBrowsers = ['Chrome', 'Firefox'];
    }

    new Server({
        configFile: __dirname + '/karma.conf.js'
    }, done).start();
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
        .pipe(webpackStream(require('./webpack.dev.conf.js')))
        .pipe(dest("../../dist_test/webpack"))
        .on("end", function () {
            cb()
        });
};

const set_watch_env = function (cb) {
    var envs = env.set({
        NODE_ENV: "development",
        USE_WATCH: "true",
        USE_KARMA: "false",
        USE_HMR: "false",
        PUBLIC_PATH: "/base/dist_test/webpack/"
    });

    return src("./appl/index.js")
        .pipe(envs)
        .on("end", function () {
            cb()
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

    const options = {
        contentBase: '../../',
        hot: true,
        host: 'localhost',
        publicPath: config.dev.assetsPublicPath,
        stats: { colors: true },
        watchOptions: {
            ignored: /node_modules/,
            poll: config.dev.poll
        },
        quiet: false
    };

    webpackConfig = require('./webpack.dev.conf.js')
    webpackConfig.devtool = 'eval';
    webpackConfig.output.path = path.resolve(config.dev.assetsRoot);
    webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
    webpackConfig.plugins.push(new webpack.NamedModulesPlugin()); // HMR shows correct file names in console on update.
    webpackConfig.plugins.push(new HtmlWebpackPlugin({
        filename: 'testapp_dev.html',
        template: webpackVersion === 4 ? '../appl/testapp_dev.html' : 'appl/testapp_dev.html',
        inject: true
    }));

    WebpackDevServer.addDevServerEntrypoints(webpackConfig, options);

    const compiler = webpack(webpackConfig);
    const server = new WebpackDevServer(compiler, options);

    server.listen(PORT || config.dev.port, HOST /*|| webpackConfig.devServer.host*/, function (err) {
        log('[webpack-server]', `http://${/*webpackConfig.devServer.host*/ HOST}:${PORT || config.dev.port}/webpack/appl/testapp_dev.html`);
        if (err) {
            log(err);
        }
        cb()
    });
};

const testRun = series(eslint_test, test_build)
const lintRun = parallel(esLint, cssLint, bootLint)
const prodRun = series(testRun, pate2e, pat, build)
prodRun.displayName = 'prod'

task(prodRun)
exports.default = prodRun
exports.test = series(testRun, pate2e, pat)
exports.tdd = series(testRun, webpack_tdd)
exports.rebuild = webpack_rebuild
exports.acceptance = series(test_env, e2e_test)
exports.ngtest = series(test_env, ng_test)
exports.e2e = series(test_env, e2e_test)
exports.hmr = webpack_server
exports.watch = webpack_watch
exports.development = parallel(webpack_server, webpack_tdd)

function karmaServer(done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    new Server({
        configFile: __dirname + '/karma' + useNg + '.conf.js',
        singleRun: runSingle,
        watch: false
    }, function (result) {
        var exitCode = !result ? 0 : result;
        done();
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
/*
 * Taking a snapshot example - puppeteer - Not installed!
 */
function karmaServerSnap(done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    new Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true,
        watch: false
    }, function (result) {
        var exitCode = !result ? 0 : result;
        done();
        if (exitCode > 0) {
            // Install Puppeteer to run these
            takeSnapShot(['', 'start'])
            takeSnapShot(['contact', 'contact'])
            takeSnapShot(['welcome', 'vue'])
            takeSnapShot(['table/tools', 'tools'])
            // Not working with PDF-?
            // takeSnapShot(['pdf/test', 'test'])       
            process.exit(exitCode);
        }
    }).start();
}

function snap(url, puppeteer, snapshot) {  // Puppeteer is not installed
    puppeteer.launch().then((browser) => {
        console.log('SnapShot URL', `${url}${snapshot[0]}`)
        let name = snapshot[1]
        let page = browser.newPage().then((page) => {
            page.goto(`${url}${snapshot[0]}`).then(() => {
                page.screenshot({ path: `snapshots/${name}Acceptance.png` }).then(() => {
                    browser.close();
                }).catch((rejected) => {
                    log(rejected)
                })
            }).catch((rejected) => {
                log(rejected)
            })
        }).catch((rejected) => {
            log(rejected)
        })
    }).catch((rejected) => {
        log(rejected)
    })
}

function takeSnapShot(snapshot) {
    const puppeteer = require('puppeteer')
    let url = 'http://localhost:3080/dist_test/webpack/appl/testapp_dev.html#/'

    snap(url, puppeteer, snapshot)
}
