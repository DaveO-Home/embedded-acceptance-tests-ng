let bundler = "webpack";
var startupHtml = "dist_test/" + bundler + "/appl/testapp_dev.html";
// Karma configuration
module.exports = function (config) {
    if (!global.whichBrowsers) {
        global.whichBrowsers = ["ChromeHeadless, FirefoxHeadless"];
    }

    config.set({
        basePath: "../..",
        frameworks: ["jasmine-jquery"],
        proxies: {
            "/views": "/base/dist_test/" + bundler + "/appl/views",
            "/appl/views": "/base/dist_test/" + bundler + "/appl/views",
            "/templates": "/base/dist_test/" + bundler + "/appl/templates",
            "/css": "/base/dist_test/" + bundler + "/appl/css",
            "/app_bootstrap.html": "/base/dist_test/" + bundler + "/appl/app_bootstrap.html",
            "/app_footer.html": "/base/dist_test/" + bundler + "/appl/app_footer.html",
            "/README.md": "/base/dist_test/README.md",
            "/node_modules/tablesorter/dist/css": "/base/node_modules/tablesorter/dist/css",
            "/node_modules/bootstrap/dist/css/bootstrap.min.css": "/base/node_modules/bootstrap/dist/css/bootstrap.min.css",
            "../../../dodex/": "/base/dodex/",
            "/dodex/": "/base/" + bundler + "/appl/dodex/",
            "/images/": "/base/dist_test/" + bundler + "/images/",
            "/base/dist_test/": "/base/dist_test/webpack/",
        },
        files: [
            //Webcomponents for Firefox - used for link tag with import attribute.
            { pattern: bundler + "/appl/jasmine/webcomponents-hi-sd-ce.js", watched: false },
            //Jasmine unit tests
            bundler + "/tests/unit_test*.js",
            //Application and Acceptance specs.
            startupHtml,
            { pattern: "package.json", watched: false, included: false },
            { pattern: "dist_test/README.md", included: false },
            { pattern: "node_modules/tablesorter/dist/css/**/*", watched: false, included: false },
            { pattern: "node_modules/bootstrap/dist/css/bootstrap.min.css", watched: false, included: false },
            { pattern: "node_modules/jsoneditor/dist/jsoneditor.min.css", watched: false, included: false},
            { pattern: "dist_test/" + bundler + "/main.js", included: false, watched: true, served: true },  //watching bundle to get changes during tdd/test
            { pattern: "dist_test/" + bundler + "/*main*.css", included: false, watched: true, served: true },
            { pattern: "dist_test/" + bundler + "/**/*.*", included: false, watched: false },
            { pattern: bundler + "/appl/dodex/data/*.*", included: false, watched: false },
            //Karma/Jasmine/Loader
            bundler + "/build/karma.bootstrap.js"
        ],
        bowerPackages: [
        ],
        plugins: [
            "karma-*",
            "@metahubt/karma-jasmine-jquery",          
        ],
        /* Karma uses <link href="/base/appl/testapp_dev.html" rel="import"> -- you will need webcomponents polyfill to use browsers other than Chrome.
         * This test demo will work with Chrome/ChromeHeadless by default - Webcomponents included above, so FirefoxHeadless should work also. 
         * Other browsers may work with tdd.
         */
        browsers: global.whichBrowsers,
        customLaunchers: {
            FirefoxHeadless: {
                base: "Firefox",
                flags: ["--headless", " --safe-mode"]
            }
        },
        browserNoActivityTimeout: 30000,
        exclude: [
        ],
        reporters: ["mocha"],
        port: 9876,
        colors: true,
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_WARN,
        autoWatch: true,
        // autoWatchBatchDelay: 10000,
        // restartOnFileChange: true,
        // retryLimit: 10,
        singleRun: false,
        loggers: [{
            type: "console"
        }
        ],
        client: {
            captureConsole: true,
            clearContext: false,
            runInParent: true,
            useIframe: true,
        },
        concurrency: 5
    });
};
