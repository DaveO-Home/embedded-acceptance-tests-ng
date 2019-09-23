/*eslint "no-console": 0 camelcase: 0 */
/**
 * Successful acceptance tests & lints start the production build.
 * Tasks are run serially, 'pat' -> 'accept' -> ('eslint', 'csslint', 'bootlint') -> 'build'
 */
const { src, series, parallel /*, dest, task*/ } = require("gulp");
const runFusebox = require("./fuse4.js");
const path = require("path");
const csslint = require("gulp-csslint");
const eslint = require("gulp-eslint");
const exec = require("child_process").exec;
const log = require("fancy-log");
const Server = require("karma").Server;
const chalk = require("chalk");

let lintCount = 0;
let browsers = process.env.USE_BROWSERS;
let useNg = "";
let runSingle = true;
let useBundler = process.env.USE_BUNDLER !== "false";
let useFtl = true;

process.argv.forEach(function (val, index, array) {
    useFtl = val === "--noftl" && useFtl ? false : useFtl;
    if(index > 2) {
        process.argv[index] = "";
    }
});

if (browsers) {
    global.whichBrowsers = browsers.split(",");
}
/**
 * Default: Production Acceptance Tests 
 */
const pate2e = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    useNg = "";
    runSingle = true;
    setTimeout(() => {
        runKarma(done);
    }, 500);
};
/**
 * Add in Angular unit tests 
 */
const pat = function (done) {
    log(chalk.cyan("Starting Angular unit tests"));
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    useNg = ".ng";
    runSingle = true;
    runKarma(done);
};
/*
 * javascript linter
 */
const esLint = function (cb) {
    var stream = src(["../appl/js/**/*.js"])
        .pipe(eslint({
            configFile: "../../.eslintrc.js",
            quiet: 1,
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
        log(chalk.blue.bold.underline("# javascript files linted: " + lintCount));
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
    ]).pipe(csslint())
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
 * Build the application to run karma acceptance tests
 */
const testBuild = function (cb) {
    process.argv[2] = "";
    const props = {
        isKarma: true,
        isHmr: false,
        isWatch: false,
        env: "development",
        useServer: false,
        ftl: false
    };
    let mode = "test";
    const debug = true;
    try {
        return runFusebox(mode, fuseboxConfig(mode, props), debug, cb);
    } catch (e) {
        console.log("Error", e);
    }
};
/*
 * Build the application to the production distribution 
 */
const build = function (cb) {
    process.argv[2] = "";
    if(!useBundler) {
        return cb();
    }
    const props = {
        isKarma: false,
        isHmr: false,
        isWatch: false,
        env: "production",
        useServer: false,
        ftl: false
    };
    let mode = "prod";
    const debug = true;
    try {
        return runFusebox(mode, fuseboxConfig(mode, props), debug, cb);
    } catch (e) {
        console.log("Error", e);
    }
};
/*
 * Build the application to preview the production distribution 
 */
const preview = function (cb) {
    process.argv[2] = "";
    const props = {
        isKarma: false,
        isHmr: false,
        isWatch: false,
        env: "production",
        useServer: true,
        ftl: false
    };
    let mode = "preview";
    const debug = true;
    try {
        return runFusebox(mode, fuseboxConfig(mode, props), debug, cb);
    } catch (e) {
        console.log("Error", e);
    }
};
/*
 * Build the application to run karma acceptance tests with hmr
 */
const fuseboxHmr = function (cb) {
    process.argv[2] = "";
    const props = {
        isKarma: false,
        isHmr: true,
        isWatch: true,
        env: "development",
        useServer: true,
        ftl: useFtl
    };
    let mode = "test";
    const debug = true;
    try {
        runFusebox(mode, fuseboxConfig(mode, props), debug, cb);
    } catch (e) {
        console.log("Error", e);
    }
};

const setNoftl = function (cb) {
    useFtl = false;
    cb();
};

/*
 * Build the application to run node express so font-awesome is resolved
 */
const fuseboxRebuild = function (cb) {
    process.argv[2] = "";
    const props = {
        isKarma: false,
        isHmr: false,
        isWatch: false,
        env: "development",
        useServer: false,
        ftl: false
    };
    let mode = "test";
    const debug = true;
    try {
        return runFusebox(mode, fuseboxConfig(mode, props), debug, cb);
    } catch (e) {
        console.log("Error", e);
    }
};
/*
 * copy assets for development
 */
const copy = async function (cb) {
    process.argv[2] = "";
    const props = {
        isKarma: false,
        isHmr: false,
        isWatch: false,
        env: "development",
        useServer: false
    };
    let mode = "copy";
    const debug = true;
    try {
        runFusebox(mode, fuseboxConfig(mode, props), debug);
    } catch (e) {
        console.log("Error", e);
    }
    cb();
};
/**
 * Run karma/jasmine tests once and exit without rebuilding(requires a previous build)
 */
const e2eTest = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    runSingle = true;
    return runKarma(done);
};
/**
 * Run karma/jasmine tests once and exit without rebuilding(requires a previous build)
 */
const ngTest = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    runSingle = true;
    useNg = ".ng";
    return runKarma(done);
};
/**
 * Continuous testing - test driven development.  
 */
const fuseboxTdd = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["Chrome", "Firefox"];
    }

    new Server({
        configFile: path.join(__dirname, "/karma.conf.js"),
    }).start();
    done();
};
/**
 * Karma testing under Opera. -- needs configuation  
 */
const tddo = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["Opera"];
    }
    new Server({
        configFile: path.join(__dirname, "/karma.conf.js"),
    }, done).start();
};

const testRun = series(testBuild, pate2e, pat);
const lintRun = parallel(esLint, esLintts, cssLint, bootLint);

exports.default = series(testRun, lintRun, build);
exports.prod = series(testRun, lintRun, build);
exports.preview = preview;
exports.prd = series(build);
exports.test = testRun;
exports.tdd = fuseboxTdd;
exports.tddo = tddo;
exports.hmr = fuseboxHmr;
exports.rebuild = fuseboxRebuild;
exports.acceptance = e2eTest;
exports.ngtest = ngTest;
exports.e2e = e2eTest;
exports.development = series(setNoftl, fuseboxHmr, fuseboxTdd);
exports.lint = lintRun;
exports.copy = copy;

function runKarma(done) {
    const karmaPath = "/karma" + useNg + ".conf.js";
    new Server({
        configFile: path.join(__dirname, karmaPath),
        singleRun: runSingle
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

function fuseboxConfig(mode, props) {
    mode = mode || "test";
    // if(process.argv[2]) {
    //     mode = process.argv[2];
    // }
    if (typeof props === "undefined") {
        props = {};
    }
    const appSrc = path.join(__dirname, "../appl");
    let toDist = "";
    let isProduction = mode !== "test";
    let distDir = isProduction ? path.join(__dirname, "../../dist/fusebox") : path.join(__dirname, "../../dist_test/fusebox");
    let defaultServer = props.useServer;
    let devServe = {
        httpServer: {
            root: "../../",
            port: 3080,
            open: false
        },
    };
    const configure = {
        target: "browser",
        env: { NODE_ENV: isProduction ? "production" : "development" },
        homeDir: appSrc,
        entry: path.join(__dirname, "../appl/main.ts"),
        output: `${distDir}${toDist}`,
        cache: {
            root: path.join(__dirname, ".cache"),
            enabled: !isProduction,
            FTL: typeof props.ftl === "undefined" ? true : props.ftl
        },
        sourceMap: !isProduction,
        webIndex: {
            distFileName: isProduction ? path.join(__dirname, "../../dist/fusebox/appl/testapp.html") : path.join(__dirname, "../../dist_test/fusebox/appl/testapp_dev.html"),
            publicPath: "../",
            template: isProduction ? path.join(__dirname, "../appl/index.html") : path.join(__dirname, "../appl/index_dev.html")
        },
        tsConfig: path.join(__dirname, "tsconfig.json"),
        watch: props.isWatch && !isProduction,
        hmr: props.isHmr && !isProduction,
        devServer: defaultServer ? devServe : false,
        logging: { level: "succinct" },
        turboMode: true,
        exclude: isProduction ? "**/*test.js" : "",
        resources: {
            resourceFolder: "./appl/resources",
            resourcePublicRoot: isProduction ? "appl/resources" : "./resources",
        }
    };
    return configure;
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
    console.error = console.log;
}
