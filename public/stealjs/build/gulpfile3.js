/**
 * Successful acceptance tests & lints start the production build.
 * Tasks are run serially, 'pat' -> ('eslint', 'csslint') -> 'bootlint' -> 'build'
 */

const chalk = require("chalk")
const csslint = require("gulp-csslint");
const gulp = require("gulp");
const eslint = require("gulp-eslint");
const exec = require("child_process").exec;
const log = require("fancy-log");
const stealTools = require("steal-tools");
const del = require("del")
const Server = require("karma").Server;


let lintCount = 0;
let browsers = process.env.USE_BROWSERS;
if (browsers) {
    global.whichBrowsers = browsers.split(",");
}
let isWindows = /^win/.test(process.platform);
let useNg = "";
let runSingle = true;

/**
 * Default: Production Acceptance Tests 
 */
gulp.task("pate2e", ["clean-test"], function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    useNg = ""
    runKarma(done, true, false);
});
/**
 * Add in Angular unit tests 
 */
gulp.task("pat", ["pate2e"], function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    useNg = ".ng"
    runKarma(done, true, false);
});
/*
 * javascript linter
 */
gulp.task("eslint", ["pat"], () => {
    var stream = gulp.src(["../appl/js/**/*.js"])
            .pipe(eslint({
                configFile: "eslintConf.json",
                quiet: 1
            }))
            .pipe(eslint.format())
            .pipe(eslint.result(result => {
                //Keeping track of # of javascript files linted.
                lintCount++;
            }))
            .pipe(eslint.failAfterError());

    stream.on("end", function () {
        log("# javascript files linted: " + lintCount);
    });
    stream.on("error", function () {
        process.exit(1);
    });
    
    return stream;
});
/*
 * css linter
 */
gulp.task("csslint", ["pat"], function () {
    var stream = gulp.src(["../appl/css/site.css",
        "../appl/css/main.css"])
            .pipe(csslint())
            .pipe(csslint.formatter());

    stream.on("error", function () {
        process.exit(1);
    });
});

/*
 * Build the application to the production distribution 
 */
gulp.task("build", ["clean", "bootlint"], function () {

    return toolsBuild()
});
/*
 * Build the application to the production distribution 
 */
gulp.task("build-only", ["clean-only"], function () {

    return toolsBuild()
});
/*
 * Bootstrap html linter 
 */
gulp.task("bootlint", ["eslint", "csslint"], function (cb) {
    exec("gulp --gulpfile Gulpboot.js", function (err, stdout, stderr) {
        log(stdout);
        log(stderr);
        cb(err);
    });
});
/**
 * Remove previous build
 */
gulp.task("clean", ["compile", "bootlint"], done => {
    isProduction = true;
    dist = "../../dist/";
    return del([
        dist + "stealjs/**/*",
        dist + "bundles/**/*",
        dist + "steal.production.js"
    ], { dryRun: false, force: true }, done);
});
/**
 * Remove previous build
 */
gulp.task("clean-only", ["compile-only"], done => {
    isProduction = true;
    dist = "../../dist/";
    return del([
        dist + "stealjs/**/*",
        dist + "bundles/**/*",
        dist + "steal.production.js"
    ], { dryRun: false, force: true }, done);
});
/**
 * Remove previous build
 */
gulp.task("clean-test", ["compile-only"], done => {
    isProduction = false;
    dist = "../../dist_test/";
    return del([
        dist + "stealjs/**/*",
        dist + "bundles/**/*",
        dist + "steal.production.js"
    ], { dryRun: false, force: true }, done);
});
/**
 * Run karma/jasmine tests using FirefoxHeadless 
 */
gulp.task("steal-firefox", function (done) {
    // Running both together as Headless has problems, tdd works
    global.whichBrowsers = ["FirefoxHeadless"];

    runKarma(done, true, false);
});

/**
 * Run karma/jasmine tests using ChromeHeadless 
 */
gulp.task("steal-chrome", function (done) {
    // Running both together as Headless has problems, tdd works
    global.whichBrowsers = ["ChromeHeadless"];

    runKarma(done, true, false);
});

/**
 * Run karma/jasmine tests once and exit
 */
gulp.task("steal-test", function (done) {
    // Running both together as Headless has problems, tdd works
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }

    return runKarma(done, true, false);
});
/**
 * Run karma/jasmine tests once and exit without rebuilding(requires a previous build)
 */
gulp.task("e2e-test", function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    return runKarma(done, true, false);
});

/**
 * Run karma/jasmine/angular tests once and exit without rebuilding(requires a previous build)
 */
gulp.task("ng-test", function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    useNg = ".ng"
    return runKarma(done, true, false);
});
/**
 * Continuous testing - test driven development.  
 */
gulp.task("steal-tdd", function (done) {
    if (!browsers) {
        global.whichBrowsers = ["Firefox", "Chrome"];
    }

    return runKarma(done, false, true);
});

/*
 * Compile production angular typescript. 
 */
gulp.task("compile", ["bootlint"], function (cb) {
    var osCommands = "touch ../appl/entry.ts; ../../node_modules/.bin/tsc --build";
    if(isWindows) {
	    osCommands = "copy /b ..\\appl\\entry.ts +,, & ..\\..\\node_modules\\.bin/tsc --build"
    }
    
    exec(osCommands, function (err, stdout, stderr) {
        log(stdout);
        log(stderr);
        cb(err);
    });
});
/*
 * Compile angular typescript. 
 */
gulp.task("compile-only", function (cb) {
    var osCommands = "touch ../appl/entry.ts; ../../node_modules/.bin/tsc --build";
    if(isWindows) {
	    osCommands = "copy /b ..\\appl\\entry.ts +,, & ..\\..\\node_modules\\.bin/tsc --build"
    }
    
    exec(osCommands, function (err, stdout, stderr) {
        log(stdout);
        log(stderr);
        cb(err);
    });
});
/*
 * Startup live reload monitor. 
 */
gulp.task("live-reload", ["vendor"], function (cb) {
    var osCommands = "cd ../..; node_modules/.bin/steal-tools live-reload";
    if(isWindows) {
	    osCommands = "cd ..\\.. & .\\node_modules\\.bin\\steal-tools live-reload"
    }
    
    exec(osCommands, function (err, stdout, stderr) {
        log(stdout);
        log(stderr);
        cb(err);
    });
});
/*
 * Build a vendor bundle from package.json
 */
gulp.task("vendor", function (cb) {
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
});
/*
 * Startup live reload monitor. 
 */
gulp.task("web-server", function (cb) {
    log.warn(chalk.cyan("Express started"))
    return exec("npm run server", function (err, stdout, stderr) {
        log(stdout);
        log(stderr);
        cb(err);
    });
});

gulp.task("default", ["pat", "eslint", "csslint", "bootlint", "build"]);
gulp.task("prod", ["pat", "eslint", "csslint", "bootlint", "build"]);
gulp.task("prd", ["build-only"]);
gulp.task("tdd", ["steal-tdd"]);
gulp.task("test", ["pat"]);
gulp.task("acceptance", ["ng-test"]);
gulp.task("firefox", ["steal-firefox"]);
gulp.task("chrome", ["steal-chrome"]);
gulp.task("hmr", ["live-reload"]);
gulp.task("server", ["web-server"]);
gulp.task("ngtest", ["ng-test"]);
gulp.task("e2e", ["e2e-test"]);

function runKarma(done, singleRun, watch) {
    const serv = new Server({
        configFile: __dirname + "/karma" + useNg + ".conf.js",
        singleRun: singleRun
    }, result => {
        var exitCode = !result ? 0 : result;
        
        if (typeof done === "function") {
            done();
        }
        if (exitCode > 0) {
            process.exit(exitCode);
        }
    });
    serv.start()
}

function toolsBuild() {
    return stealTools.build({
        config: "package.json!npm",
        main: "stealjs/appl/main",
        baseURL: "../../"
    }, {
        sourceMaps: false,
        bundleAssets: {
            infer: true,
            glob: [
                "../images/favicon.ico",
                "../appl/testapp.html",
                "../appl/app_bootstrap.html",
                "../appl/index.html",
                "../index.html",
                "../appl/views/**/*",
                "../appl/assets/**/*",
                "../appl/templates/**/*",
                "../../README.md",
                "../appl/css/table.css",
                "../appl/css/hello.world.css"
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
    }).then(function(result) {
        del([
            "../appl/components/**/*.js",
            "../appl/services/**/*.js",
            "../appl/entry.js"
        ], { dryRun: false, force: true });
    }).catch(function(rejection) {
        console.log("Build Failed:", rejection)
        process.exit(1)
    })
}

//From Stack Overflow - Node (Gulp) process.stdout.write to file
if (process.env.USE_LOGFILE == "true") {
    var fs = require("fs");
    var proc = require("process");
    var origstdout = process.stdout.write,
            origstderr = process.stderr.write,
            outfile = "production_build.log",
            errfile = "production_error.log";

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
