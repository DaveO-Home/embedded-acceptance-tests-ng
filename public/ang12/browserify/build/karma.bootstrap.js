var statusReporter = {
    jasmineStarted: function (suiteInfo) {
        const browser = get_browser_info();
        let browserName = "";
        if (browser.name !== "Chrome") {
            browserName = `${browser.name} ${browser.version}: `;
        }
        console.log(`${browserName} You should get ${suiteInfo.totalSpecsDefined} successful specs.`);
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
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;
    jasmine.getEnv().addReporter(statusReporter);
    const config = jasmine.getEnv().configuration();
    config.random = false;
    jasmine.getEnv().configure(config);
};
// per gregoryvarghese.com/how-to-get-browser-name-and-version-via-javascript/
function get_browser_info() {
    try {
        var ua = navigator.userAgent, tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if (/trident/i.test(M[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
            return { name: "IE ", version: (tem[1] || "") };
        }
        if (M[1] === "Chrome") {
            tem = ua.match(/\bOPR\/(\d+)/);
            if (tem != null) { return { name: "Opera", version: tem[1] }; }
        }
        M = M[2] ? [M[1], M[2]] : ["Netscape", "", "-?"];
        if ((tem = ua.match(/version\/(\d+)/i)) != null) { M.splice(1, 1, tem[1]); }
        return {
            name: M[0],
            version: M[1]
        };
    } catch (e) {
        return { name: "unknown", version: 0 };
    }
}