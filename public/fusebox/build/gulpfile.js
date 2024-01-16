/*eslint "no-console": 0 camelcase: 0 */
/**
 * Successful acceptance tests & lints start the production build.
 * Tasks are run serially, 'pat' -> 'accept' -> ('eslint', 'csslint') -> 'build'
 */
const { src, series, parallel /*, dest, task*/ } = require("gulp");
const fs = require("fs");
const path = require("path");
const csslint = require("gulp-csslint");
const eslint = require("gulp-eslint");
const exec = require("child_process").exec;
const log = require("fancy-log");
const karma = require("karma");
const chalk = require("chalk");
let runFusebox; //  = require("./fuse4.js");

let lintCount = 0;
let browsers = process.env.USE_BROWSERS;
let useNg = "";
let useBundler = process.env.USE_BUNDLER !== "false";
let useFtl = true;

// eslint-disable-next-line no-unused-vars
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
    setTimeout(() => {
        karmaServer(done, true, false);
    }, 500);
};
/**
 * Add in Angular unit tests 
 */
const pat = function (done) {
    log(chalk.cyan("Starting Angular unit tests"));
    process.env.BUNDLER = "fusebox";
    const spawn = require('child_process').spawn;
    const run = spawn("cd .. && npx ng test devacc", { shell: true, stdio: 'inherit' });
    run.on("exit", code => {
        done(code);
    });
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
        log("Error", e);
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
 * Build the application to run node express 
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
    return karmaServer(done, true, false);
};
/**
 * Run Angular Devkit karma/jasmine unit tests - uses angular.json
 */
const ngTest = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    process.env.BUNDLER = "fusebox";
    const spawn = require('child_process').spawn;
    const run = spawn("npx ng test devacc", { shell: true, stdio: 'inherit' });
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
    process.env.BUNDLER = "fusebox";
    const spawn = require('child_process').spawn;
    const run = spawn("npm run anglint", { shell: true, stdio: 'inherit' });
    run.on("exit", code => {
        done(code);
    });
};
/**
 * Continuous testing - test driven development.  
 */
const fuseboxTdd = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["Chrome", "Firefox"];
    }

    karmaServer(done, false, true);
};
/**
 * Continuous testing - test driven development with hmr(see task "development").  
 */
const fuseboxTddWait = function (done) {
    if (!browsers) {
        global.whichBrowsers = ["Chrome", "Firefox"];
    }
    setTimeout(function() {
        karmaServer(done, false, true);
    }, 10000);  // wait for hmr to compile - increase as needed
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

const fusebox = (done) => {
    if (!fs.existsSync("../node_modules")) {
        const spawn = require('child_process').spawn;
        const run = spawn("npm install --force", { shell: true, stdio: 'inherit' });
        return run.on("exit", code => {
	          runFusebox = require("./fuse4.js");
            done(code);
        });
    } else {
	      runFusebox = require("./fuse4.js");
        done();
    }
}

const testRun = series(fusebox, testBuild, pate2e, ngTest);
const testNgRun = series(fusebox, pat);
const lintRun = parallel(fusebox, esLint, esLintts, cssLint);

exports.default = series(fusebox, testRun, lintRun, build);
exports.prod = series(fusebox, testRun, lintRun, build);
exports.preview = series(fusebox, preview);
exports.prd = series(fusebox, build);
exports.test = testRun;
// exports.testng = testNgRun;
exports.tdd = series(fusebox, fuseboxTdd);
exports.tddo = series(fusebox, tddo);
exports.hmr = series(fusebox, fuseboxHmr);
exports.rebuild = series(fusebox, fuseboxRebuild);
exports.acceptance = series(fusebox, e2eTest);
exports.ngtest = series(fusebox,ngTest);
exports.nglint = series(fusebox, ngLint);
exports.e2e = series(fusebox, e2eTest);
exports.development = series(fusebox, setNoftl, parallel(fuseboxHmr, fuseboxTddWait));
exports.lint = lintRun;
exports.copy = copy;

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

function fuseboxConfig(mode, props) {
    mode = mode || "test";
    // if(process.argv[2]) {
    //     mode = process.argv[2];
    // }
    if (typeof props === "undefined") {
        props = {};
    }
    let toDist = "";
    let isProduction = mode !== "test";
    let distDir = isProduction ? path.join(__dirname, "../../dist/fusebox") : path.join(__dirname, "../../dist_test/fusebox");
    let defaultServer = props.useServer;
    let devServe = {
        httpServer: {
            root: path.join(__dirname, "../.."),
            port: 3080,
            open: false
        },
    };
    const configure = {
        root: path.join(__dirname, "../.."),
        distRoot: path.join("/", `${distDir}${toDist}`),
        target: "browser",
        env: { NODE_ENV: isProduction ? "production" : "development" },
        entry: path.join(__dirname, "../appl/main.ts"),
        dependencies: { serverIgnoreExternals: true },
        cache: {
            root: path.join(__dirname, ".cache"),
            enabled: !isProduction,
            FTL: typeof props.ftl === "undefined" ? true : props.ftl
        },
        sourceMap: !isProduction,
        webIndex: {
            distFileName: isProduction ? path.join(__dirname, "../../dist/fusebox/appl/testapp.html") : path.join(__dirname, "../../dist_test/fusebox/appl/testapp_dev.html"),
            publicPath: "../",
            template: isProduction ? path.join(__dirname, "../appl/testapp.html") : path.join(__dirname, "../appl/testapp_dev.html")
        },
        tsConfig: path.join(__dirname, "./tsconfig.json"),
        watcher: props.isWatch && !isProduction,
        hmr: props.isHmr && !isProduction,
        devServer: defaultServer ? devServe : false,
        logging: { level: "succinct" },
        modules: ["node_modules"],
        turboMode: true,
        exclude: isProduction ? "**/*test.js" : "",
        resources: {
            resourceFolder: "./styles",
            resourcePublicRoot: isProduction ? "./" : "../styles"
        },
        codeSplitting: {
            useHash: isProduction ? true : false
        },
        compilerOptions: {
            buildTarget: "browser",
            tsConfig: path.join(__dirname, "./tsconfig.json"),
        }
    };

    return configure;
}

//From Stack Overflow - Node (Gulp) process.stdout.write to file
if (process.env.USE_LOGFILE == "true") {
//    var fs = require("fs");
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
