let startupHtml = "./appl/testapp_karma.html";
let bundler = "parcel";
// Karma configuration - Unit testing angular components
module.exports = function (config) {

    if (!global.whichBrowsers) {
        global.whichBrowsers = ["ChromeHeadless, FirefoxHeadless"];
    }

    config.set({
        basePath: '../',
        frameworks: ['jasmine-jquery', 'jasmine', 'karma-typescript'],
        files: [
            'tests/**/*.+(js|ts|html)'
        ],
        bowerPackages: [
        ],preprocessors: {
            "tests/*.ts": ["karma-typescript"]
        },
        karmaTypescriptConfig: {
            bundlerOptions: {
                entrypoints: /\.spec\.ts$/,
                transforms: [
                    require("karma-typescript-angular2-transform")
                ]
            },
            compilerOptions: {
                lib: ["es2015", "dom"],
                allowJs: true
            },
            include: {
                mode: "replace",
                values: ["tests/**/*.ts"]
            }
        },
        browsers: global.whichBrowsers,
        customLaunchers: {
            FirefoxHeadless: {
                base: 'Firefox',
                flags: ['--headless', ' --safe-mode']
            }
        },
        browserNoActivityTimeout: 0,
        exclude: [
        ],
        reporters: ['mocha'],
        port: 9876,
        colors: true,
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,
        autoWatch: true,
        singleRun: false,
        loggers: [{
            type: 'console'
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
