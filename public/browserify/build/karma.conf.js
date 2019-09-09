let startupHtml = "/appl/testapp_karma.html";
let bundler = "browserify";
// Karma configuration
module.exports = function (config) {

    if (!global.whichBrowsers) {
        global.whichBrowsers = ["ChromeHeadless, FirefoxHeadless"];
    }

    config.set({
        basePath: "../..",
        frameworks: ["jasmine-jquery", "jasmine"],
        proxies: {
            "/views": "/base/dist_test/" + bundler + "/appl/views",
            "/templates": "/base/dist_test/" + bundler + "/appl/templates",
            "/css": "/base/dist_test/" + bundler + "/appl/css",
            "/node_modules/font-awesome": "/base/node_modules/font-awesome",
            "/app_bootstrap.html": "/base/dist_test/" + bundler + "/appl/app_bootstrap.html",
            "/README.md": "/base/dist_test/README.md",
            "../../../dodex/": "/base/dodex/",
            "/dodex/": "/base/" + bundler + "/appl/dodex/",
            "/images/": "/base/" + bundler + "/images/"
        },
        files: [
            //Webcomponents for Firefox - used for link tag with import attribute.
            { pattern: bundler + "/appl/jasmine/webcomponents-hi-sd-ce.js", watched: false },
            //Jasmine unit tests
            bundler + "/tests/unit_test*.js",
            //Application and Acceptance specs.
            bundler + startupHtml,
            { pattern: "package.json", watched: false, included: false },
            { pattern: "dist_test/README.md", included: false },
            { pattern: "node_modules/font-awesome/**/*", watched: false, included: false },
            { pattern: "dist_test/" + bundler + "/vendor.js", included: false, watched: false, served: true },
            { pattern: "dist_test/" + bundler + "/index.js", included: false, watched: true, served: true },  //watching bundle to get changes during tdd/test
            { pattern: "dist_test/" + bundler + "/**/*.*", included: false, watched: false },
            {pattern: bundler + "/images/*", included: false, watched: false},
            //Karma/Jasmine/Loader
            bundler + "/build/karma.bootstrap.js"
        ],
        bowerPackages: [
        ],
        plugins: [
            "karma-chrome-launcher",
            "karma-firefox-launcher",
            "karma-opera-launcher",
            "karma-jasmine",
            "karma-jasmine-jquery",
            "karma-mocha-reporter"           
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
        browserNoActivityTimeout: 0,
        exclude: [
        ],
        reporters: ["mocha"],
        port: 9876,
        colors: true,
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_ERROR,
        autoWatch: true,
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
