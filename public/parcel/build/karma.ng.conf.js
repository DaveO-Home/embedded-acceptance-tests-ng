let bundler = "fusebox";
// Karma configuration
module.exports = function (config) {
    global.whichBrowsers = process.env.USE_BROWSERS;
    if (!global.whichBrowsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
    } else {
            global.whichBrowsers = global.whichBrowsers.split(",");
    }

    config.set({
        basePath: "../",
        frameworks: ["jasmine", "@angular-devkit/build-angular"],
        proxies: {
        },
        files: [
            //Jasmine unit tests
            bundler + "/../tests/unit_test*.js",
        ],
        bowerPackages: [
        ],
        plugins: [
            "karma-chrome-launcher",
            "karma-firefox-launcher",
            "karma-opera-launcher",
            "karma-jasmine",
            "karma-mocha-reporter",
            require('@angular-devkit/build-angular/plugins/karma')
        ],
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
        logLevel: config.LOG_WARN,
        autoWatch: true,
        singleRun: true,
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
