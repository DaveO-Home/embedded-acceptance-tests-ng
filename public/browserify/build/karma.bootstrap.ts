import 'zone.js/dist/long-stack-trace-zone';
import 'zone.js/dist/proxy.js';
import 'zone.js/dist/sync-test';
import 'zone.js/dist/jasmine-patch';
import 'zone.js/dist/async-test';
import 'zone.js/dist/fake-async-test';

declare var window: any;
declare var jasmine: any;

var statusReporter = {
    jasmineStarted: function (suiteInfo) {
        console.log("You should get " + suiteInfo.totalSpecsDefined + " successful specs.");
    },
    specDone: function (result) {
        if (result.failedExpectations.length > 0) {
            this.isInError = true;
        }
    },
    suiteDone: function (result) {
        if (result.failedExpectations.length > 0) {
            this.isInError = true;
        }
    },
    jasmineDone: function () {
        window.isInError = this.isInError;
        //download(this.isInError, 'isInError.txt', 'text/plain'); 

    },
    isInError: false
};
window.__karma__.loaded = function () {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    jasmine.getEnv().addReporter(statusReporter);
    const config = jasmine.getEnv().configuration()
    config.random = false;
    jasmine.getEnv().configure(config)
};
