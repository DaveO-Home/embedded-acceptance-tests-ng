import "./polyfills";
import { enableProdMode, destroyPlatform } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { AppModule } from "./entry";
import ENV from "./js/utils/dev.env";
import "./js/config";
import App from "./js/app";
import Default from "./js/utils/default";
import Setup from "./js/utils/setup";
import "tablepager";
import { environment } from "./js/utils/environments/environment.prod";
import { fail, testit, jasmine, __karma__, Promise } from "./global.variables";
/* develblock:start */
import "zone.js/dist/zone-error";
import apptest from "./jasmine/apptest";
environment.production = false;
/* develblock:end */

const env = ENV.BROWSER_ENV;
const production = env === "production";

if (environment.production || production) {
  enableProdMode();
}

if (typeof testit === "undefined" || !testit) {
    platformBrowserDynamic().bootstrapModule(AppModule)
        .catch(err => console.error(err));
}
App.init(Default);
Setup.init();
/* The strip-code plugin does not work on .ts files - using ReplacementPlugin to change "apptest" to "apptest.noop",
*  this will eliminate the jasmine test files from the production bundle.
/* develblock:start */
// Code between the ..start and ..end tags will be removed by browserify during the production build.
if (!environment.production) {
    // testit is true if running under Karma - seeTestApp-Component_dev.html
    new Promise((resolve) => {
        setTimeout(function () {
            resolve(0);
        }, 500);
    }).catch(rejected => {
        fail(`Error ${rejected}`);
    }).then(() => {
        if (typeof testit !== "undefined" && testit) {
            // Run acceptance tests. - To run only unit tests, comment the apptest call.
            apptest(App, AppModule, platformBrowserDynamic, destroyPlatform);
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 4000;
            __karma__.start();
        }
    });
}
/* develblock:end */
