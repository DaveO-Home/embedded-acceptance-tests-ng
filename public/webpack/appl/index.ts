import 'babel-polyfill';
import './polyfills'
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './entry';
import ENV from './js/utils/dev.env';
import './js/config'
import App from './js/app'
import Default from './js/utils/default'
import Setup from './js/utils/setup'
import 'pager'
/* develblock:start */
import 'zone.js/dist/zone-error';
import apptest from './jasmine/apptest'
/* develblock:end */

declare var fail: any;
declare var testit: any;
declare var jasmine: any;
declare var __karma__: any;
declare var Promise: any;

/*
* Using webpack NormalModuleReplacementPlugin to determine production env
*/
const env = ENV.BROWSER_ENV;
let production = env === "production";

if (production) {
    enableProdMode();
}
if (typeof testit === "undefined" || !testit) {
    platformBrowserDynamic().bootstrapModule(AppModule)
        .catch(err => console.error(err))
}

App.init(Default)
Setup.init()
/* The strip-code plugin does not work on .ts files - using ReplacementPlugin to change "apptest" to "apptest.noop",
*  this will eliminate the jasmine test files from the production bundle.
/* develblock:start */
// Code between the ..start and ..end tags will be removed by browserify during the production build.
if (!production) {
    // testit is true if running under Karma - see testapp_dev.html
    new Promise((resolve, reject) => {
        setTimeout(function () {
            resolve(0)
        }, 500);
    }).catch(rejected => {
        fail(`Error ${rejected}`)
    }).then(resolved => {
        if (typeof testit !== "undefined" && testit) {
            // Run acceptance tests. - To run only unit tests, comment the apptest call.
            apptest(App, AppModule, platformBrowserDynamic);
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 4000;
            __karma__.start();
        }
    })
    /* develblock:end */
}
