// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  global.whichBrowsers = process.env.USE_BROWSERS;
  if (!global.whichBrowsers) {
        global.whichBrowsers = ["ChromeHeadless", "FirefoxHeadless"];
  }  else {
    global.whichBrowsers = global.whichBrowsers.split(",");
  }
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    files: [
            //Jasmine unit tests
            "../tests/unit_test*.js",
        ],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require("karma-firefox-launcher"),
      // require('karma-jasmine-html-reporter'),
      // require('karma-coverage'),
      "karma-mocha-reporter",
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        random: false
      },
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    jasmineHtmlReporter: {
      suppressAll: true // removes the duplicated traces
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/webpack'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' }
      ]
    },
    reporters: [/* 'progress', 'kjhtml'*/, 'mocha'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_WARN,
    autoWatch: false,
    browsers: global.whichBrowsers,
    customLaunchers: {
        FirefoxHeadless: {
            base: "Firefox",
            flags: ["--headless", " --safe-mode"]
        }
    },
    singleRun: true,
    restartOnFileChange: true
  });
};
