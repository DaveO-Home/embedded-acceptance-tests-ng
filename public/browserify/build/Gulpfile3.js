/**
 * Successful acceptance tests & lints start the production build.
 * Tasks are run serially, 'pat'(run acceptance tests) -> 'build-development' -> ('eslint', 'csslint') -> 'bootlint' -> 'build'
 */
const env = require("gulp-env")
const log = require("fancy-log");
const rmf = require("rimraf");
const copy = require("gulp-copy");
const exec = require("child_process").exec;
const gulp = require("gulp");
const noop = require("gulp-noop");
const assign = require("lodash.assign");
const buffer = require("vinyl-buffer");
const envify = require("loose-envify/custom") // require('envify/custom');
const eslint = require("gulp-eslint");
const source = require("vinyl-source-stream");
const uglify = require("gulp-uglify-es").default;
const Server = require("karma").Server;
const csslint = require("gulp-csslint");
const watchify = require("watchify");
const stripCode = require("gulp-strip-code");
const browserify = require("browserify");
const removeCode = require("gulp-remove-code");
const sourcemaps = require("gulp-sourcemaps");
const browserSync = require("browser-sync").create("devl");
const tsify = require("tsify")

const startComment = "develblock:start",
        endComment = "develblock:end",
        regexPattern = new RegExp("[\\t ]*(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)" +
                startComment + " ?[\\*\\/]?[\\s\\S]*?(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)" +
                endComment + " ?(\\*\\/)?[\\t ]*\\n?", "g");

let vendors = [];
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
let runSingle = true;

if (browsers) {
    global.whichBrowsers = browsers.split(",");
}

/**
 * Build bundle from package.json 
 */
gulp.task("build", ["application"], function () {
    isWatchify = false;
    return browserifyBuild();
});
/**
 * Build Development bundle from package.json 
 */
gulp.task("build-development", ["application-development"], function () {   
    return isSplitBundle ? browserifyBuild() : noop();
});
/**
 * Production Browserify 
 */
gulp.task("application", ["copyprod"], function () {
    isWatchify = false;
    return applicationBuild();
});
/**
 * Development Browserify - optional watchify and reload 
 */
gulp.task("application-development", ["copy"], function () {
    var initialTask = this.seq.slice(-1)[0];
    if(initialTask === "hmr" || initialTask === "tdd-browserify") {
        isWatchify = true;
    }
    //Set isWatchify=true via env USE_WATCH for tdd/test   
    return applicationBuild();
});
/**
 * Default: Production Acceptance Tests 
 */
gulp.task("pate2e", ["build-development"], function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    useNg = ""
    runSingle = true
    return runKarma(done);
});
/**
 * Add in Angular unit tests 
 */
gulp.task("pat", ["pate2e"], function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    useNg = ".ng"
    runSingle = true
    runKarma(done);
});
/*
 * javascript linter
 */
gulp.task("eslint", ["pat"], () => {
    dist = prodDist;
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
    var stream = gulp.src(["../appl/css/site.css"])
            .pipe(csslint())
            .pipe(csslint.formatter());

    stream.on("error", function () {
        process.exit(1);
    });
});

gulp.task("setdevelopment", function () {
    return process.env.NODE_ENV = "development";
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
gulp.task("clean", ["bootlint"], function (done) {    
    isProduction = true;
    dist = prodDist;
    return rmf("../../" + prodDist, [], (err) => {
        if (err) {
            log(err)
        }
        done()
        });
    });
/**
 * Resources and content copied to dist directory - for production
 */
gulp.task("copyprod", ["bootlint", "copyprod_images"], function () {
    copyIndex();
    return copySrc();
});
gulp.task("copyprod_images", ["bootlint", "copyprod_fonts"], function () {
    return copyImages();
});
gulp.task("copyprod_fonts", ["bootlint", "clean"], function () {
    isProduction = true;
    dist = prodDist;
    return copyFonts();
});
/**
 * Resources and content copied to dist_test directory - for development
 */
gulp.task("copy", ["copy_images"], function () {
    copyIndex();
    return copySrc();
});
gulp.task("copy_images", ["copy_fonts"], function () {
    return copyImages();
});
gulp.task("copy_fonts", function () {
    isProduction = false;
    dist = testDist;
    return copyFonts();
});
/*
 * Setup development with reload of app on code change
 */
gulp.task("watch", function () {
    dist = testDist;
    browserSync.init({server: "../../", index: "index_b.html", port: 3080, browser: ["google-chrome"]}); 
    browserSync.watch("../../" + dist + "/index.js").on("change", browserSync.reload);  //change any file in appl/ to reload app - triggered on watchify results

    return browserSync;
});
/**
 * Run karma/jasmine tests once and exit without rebuilding(requires a previous build)
 */
gulp.task("e2e-test", function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    runSingle = true;
    return runKarma(done);  
});

/**
 * Run karma/jasmine tests once and exit without rebuilding(requires a previous build)
 */
gulp.task("ng-test", function (done) {
    if (!browsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    }
    runSingle = true
    useNg = ".ng"
    return runKarma(done);  
});

/**
 * Run watch(HMR)
 */
gulp.task("b-hmr", ["build-development"], function () {
    console.log("Watching, will rebuild bundle on code change.");
});

/**
 * Continuous testing - test driven development.  
 */
gulp.task("tdd-browserify", ["build-development"], function (done) {
    if (!browsers) {
        global.whichBrowsers = ["Chrome", "Firefox"];
    }
    new Server({
        configFile: __dirname + "/karma.conf.js",
    }, done).start();
});
/**
 * Karma testing under Opera. -- needs configuation  
 */
gulp.task("tddo", function (done) {
    if (!browsers) {
        global.whichBrowsers = ["Opera"];
    }
    new Server({
        configFile: __dirname + "/karma.conf.js",
    }, done).start();
});

gulp.task("default", ["pat", "eslint", "csslint", "bootlint", "build"]);
gulp.task("prod", ["pat", "eslint", "csslint", "bootlint", "build"]);
gulp.task("acceptance", ["e2e-test"]);
gulp.task("tdd", ["tdd-browserify"]);
gulp.task("test", ["pat"]);
gulp.task("hmr", ["b-hmr"]);
gulp.task("server", ["watch"]);
gulp.task("rebuild", ["build-development"]);
gulp.task("ngtest", ["ng-test"]);
gulp.task("e2e", ["e2e-test"]);

function browserifyBuild() {
    browserifyInited = browserify({
        debug: !isProduction,
        bundleExternal: true
    });

    var mods = getNPMPackageIds();
    for(var id in mods) {
        if (mods[id] !== "font-awesome") { 
            browserifyInited.require(require("resolve").sync(mods[id]), {expose: mods[id]});
        }
    }
    var envs = env.set({
        NODE_ENV: isProduction? "production": "development",
    })

    var stream = browserifyInited
            // .transform(
            //     // { global: true },
            //     envify({ NODE_ENV: isProduction ? 'production' : 'development' })
            // )
            .bundle()
            .pipe(envs)
            .pipe(source("vendor.js"))
            .pipe(buffer())
            .pipe(isProduction ? stripCode({pattern: regexPattern}) : noop())
            .pipe(isProduction ? uglify() : noop());

    stream = stream.pipe(sourcemaps.init({loadMaps: !isProduction}))
            .pipe(sourcemaps.write("../../" + dist + "/maps", {addComment: !isProduction}));

    return stream.pipe(gulp.dest("../../" + dist));
}

function getNPMPackageIds() {
    var ids = JSON.parse("{" +
        "\"aw\": \"font-awesome\"," +  
        "\"bo\": \"bootstrap\"," +
        "\"jq\": \"jquery\"," +
        "\"lo\": \"lodash\"," +
        "\"hb\": \"handlebars\"," +
        "\"mo\": \"moment\"," +
        "\"po\": \"popper.js\"," +
        "\"tb\": \"tablesorter\"}");
    return ids;
}

function applicationBuild() {
    browserifyInited = browserify({
        entries: ["../appl/main.js"],
        transform: ["browserify-css"],
        debug: !isProduction,
        insertGlobals: true,
        noParse: ["jquery"],
        cache: {},
        packageCache: {}
    });

    let modules = [];
    var mods = getNPMPackageIds();
    for(var id in modules) {
        if (mods[id] !== "font-awesome") {
            modules.push(mods[id]);
        }
    }
 
    if (isSplitBundle) {
        browserifyInited.external(modules);
    }
    enableWatchify();

    return browserifyApp();
}

/*
 * Build application bundle for production or development
 */
function browserifyApp() {
    var envs = env.set({
        NODE_ENV: isProduction? "production": "development",
    })
    var stream = browserifyInited
            // .transform(
            //     { global: true },
            //     envify({ NODE_ENV: isProduction ? 'production' : 'development' })
            //   )
            .add(["../appl/index.ts"])
            .plugin(tsify, { noImplicitAny: false })
            .bundle()
            .pipe(envs)
            .pipe(source("index.js"))
            .pipe(removeCode({production: isProduction}))
            .pipe(buffer())
            .pipe(isProduction ? stripCode({pattern: regexPattern}) : noop())
            .pipe(isProduction ? uglify().on("error", log) : noop());

    stream = stream.pipe(sourcemaps.init({loadMaps: !isProduction}))
            .pipe(sourcemaps.write("../../" + dist + "/maps", {addComment: !isProduction}));

    return stream.pipe(gulp.dest("../../" + dist));
}

function enableWatchify() {
    if (isWatchify) {
        browserifyInited.plugin(watchify);
        browserifyInited.on("update", applicationBuild);
        browserifyInited.on("log", log);
    }
}

function copySrc() {
    return gulp
            .src(["../appl/views/**/*", "../appl/templates/**/*", "../appl/index.html", isProduction ? "../appl/testapp.html" : "../appl/testapp_dev.html"])
            .pipe(copy("../../" + dist + "/appl"));
}

function copyIndex() {
    return gulp
            .src(["../index.html"])
            .pipe(copy("../../" + dist + "/browserify"));
}

function copyImages() {
    return gulp
            .src(["../images/*", "../../README.md", "../appl/assets/*", "../appl/app_bootstrap.html", "../appl/css/table.css", "../appl/css/hello.world.css"])
            .pipe(copy("../../" + dist + "/appl"));
}

function copyFonts() {
    return gulp
            .src(["../../node_modules/font-awesome/fonts/*"])
            .pipe(copy("../../" + dist + "/appl"));
}

function runKarma(done) {   
    new Server({
        configFile: __dirname + "/karma" + useNg + ".conf.js",
        singleRun: runSingle
    }, function (result) {
        var exitCode = !result ? 0 : result;
        if(typeof done === "function") {
            done();
        }
        if (exitCode > 0) {
            process.exit(exitCode);
        }
    }).start();    
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
