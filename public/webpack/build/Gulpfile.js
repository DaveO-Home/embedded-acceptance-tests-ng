/**
 * Production build using karma/jasmine acceptance test approval and Development environment with Webpack
 * Successful acceptance tests & lints start the production build.
 * Tasks are run serially, 'pat' -> test-build -> acceptance-tests -> ('csslint', 'bootlint') -> 'build(eslint)'
 */
const env = require("gulp-env")
const log = require("fancy-log")
const rmf = require('rimraf')
const exec = require('child_process').exec
const execSync = require('child_process').execSync
const gulp = require('gulp')
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
gulp.task('pate2e', ['acceptance-tests'], function (done) {
    if (!browsers) {
        global.whichBrowser = ["ChromeHeadless", "FirefoxHeadless"];
    }
    useNg = ''
    runSingle = true
    karmaServer(done);
});

/**
 * Add in Angular unit tests 
 */
gulp.task('pat', ['pate2e'], function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    useNg = '.ng'
    runSingle = true
    karmaServer(done);
});
/*
 * javascript linter
 */
gulp.task('eslint', ['pat'], () => {
    var stream = gulp.src(["../appl/js/**/*.js"])
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

    stream.on('end', function () {
        log("# javascript files linted: " + lintCount);
    });

    stream.on('error', function () {
        process.exit(1);
    });

    return stream;
});
/*
 * css linter
 */
gulp.task('csslint', ['pat'], function () {
    var stream = gulp.src(['../appl/css/site.css'])
        .pipe(csslint())
        .pipe(csslint.formatter());

    stream.on('error', function (err) {
        log(err);
        process.exit(1);
    });
});
/*
 * Build the application to the production distribution 
 */
gulp.task('build', ['bootlint'], function () { 
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
    return gulp.src("../appl/main.ts")
        .pipe(envs)
        .pipe(webpackStream(require('./webpack.prod.conf.js')))
        .pipe(envs.reset)
        .pipe(gulp.dest("../../dist/webpack"))
});

/*
 * Build the application to the production distribution 
 */
gulp.task('build-prod', function () { 
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
    return gulp.src("../appl/main.ts")
        .pipe(envs)
        .pipe(webpackStream(require('./webpack.prod.conf.js'))) // (null, {mode:"production"})))
        .pipe(envs.reset)
        .pipe(gulp.dest("../../dist/webpack"))
});

/*
 * Bootstrap html linter 
 */
gulp.task('bootlint', ['csslint'], function (cb) {
    log("Starting Gulpboot.js")
    return exec('gulp --gulpfile Gulpboot.js', function (err, stdout, stderr) {
        log(stdout);
        log(stderr);
        cb(err);
    });
});
/*
 * javascript linter - test
 */
gulp.task('eslint-test', function () {
    var stream = gulp.src(["../appl/js/**/*.js"])
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
    });
})
//     return stream;
// });
/**
 * Run karma/jasmine tests once and exit
 * Set environment variable USE_BUILD=false to bypass the build
 */
gulp.task('acceptance-tests', ['test-build'], function (done) {
    done();
});

gulp.task("test-env", function () {
    var envs = env.set({
        NODE_ENV: "development",
        USE_WATCH: "false",
        USE_KARMA: "true",
        USE_HMR: "false",
        USE_BUILD: false,
        PUBLIC_PATH: "/base/dist_test/webpack/"   //This sets config to run under Karma
    });

    return gulp.src("../appl/main.ts")
        .pipe(envs);
})

/**
 * Run karma/jasmine tests once and exit without rebuilding(requires a previous build)
 */
gulp.task('e2e-test', ['test-env'], function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    runSingle = true;
    return karmaServer(done);
});

/**
 * Run karma/jasmine/angular tests once and exit without rebuilding(requires a previous build)
 */
gulp.task('ng-test', ['test-env'], function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    runSingle = true
    useNg = ".ng"
    return karmaServer(done);
});


/*
 * Build Test without Karma settings for npm Express server (npm start)
 */
gulp.task("webpack-rebuild", function () {
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
    return gulp.src("../appl/main.ts")
        .pipe(envs)
        .pipe(webpackStream(require('./webpack.dev.conf.js')))
        .pipe(envs.reset)
        .pipe(gulp.dest("../../dist_test/webpack"));
});
/*
 * Build the test bundle
 */
gulp.task("test-build", ['eslint-test'], function () {
    // var initialTask = this.seq.slice(-1)[0];

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
        return gulp.src("../appl/main.ts")
            .pipe(envs);
    }

    rmf('../../dist_test/webpack', [], (err) => {
        if (err) {
            log(err)
        }
    });
    return gulp.src("../appl/main.ts")
        .pipe(envs)
        .pipe(webpackStream(require('./webpack.dev.conf.js')))
        .pipe(envs.reset)
        .pipe(gulp.dest("../../dist_test/webpack"));
});
/**
 * Continuous testing - test driven development.  
 */
gulp.task('webpack-tdd', ["test-build"], function (done) {
    if (!browsers) {
        global.whichBrowsers = ['Chrome', 'Firefox'];
    }

    new Server({
        configFile: __dirname + '/karma.conf.js'
    }, done).start();
});
/*
 * Webpack recompile to 'dist_test' on code change
 * run watch in separate window. Used with karma tdd.
 */
gulp.task("webpack-watch", function () {
    let envs = env.set({
        NODE_ENV: "development",
        USE_WATCH: "true",
        USE_KARMA: "false",
        USE_HMR: "false",
        PUBLIC_PATH: "/base/dist_test/webpack/"
    });

    rmf('../../dist_test/webpack', [], (err) => {
        if (err) {
            log(err)
        }
    });
    return gulp.src("../appl/**/*")
        .pipe(envs)
        .pipe(webpackStream(require('./webpack.dev.conf.js')))
        .pipe(gulp.dest("../../dist_test/webpack"));

});

gulp.task('set-watch-env', function () {
    var envs = env.set({
        NODE_ENV: "development",
        USE_WATCH: "true",
        USE_KARMA: "false",
        USE_HMR: "false",
        PUBLIC_PATH: "/base/dist_test/webpack/"
    });

    return gulp.src("./appl/index.js")
        .pipe(envs);
});
/*
 * Webpack development server - use with normal development
 * Rebuilds bundles in dist_test on code change.
 * Run server in separate window - 
 * - watch for code changes 
 * - hot module recompile/replace
 * - reload served web page.
 */
gulp.task("webpack-server", function () {
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
    });
});

gulp.task('default', ['pat', 'eslint', 'csslint', 'bootlint', 'build']);
gulp.task('prod', ['pat', 'eslint', 'csslint', 'bootlint', 'build']);
gulp.task('prd', ['build-prod']);
gulp.task('tdd', ['webpack-tdd']);
gulp.task('test', ['pat']);
gulp.task('watch', ['webpack-watch']);
gulp.task('hmr', ['webpack-server']);
gulp.task('rebuild', ['webpack-rebuild']);   //removes karma config for node express.
gulp.task('acceptance', ['e2e-test']);
gulp.task('ngtest', ['ng-test']);
gulp.task('e2e', ['e2e-test']);

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
