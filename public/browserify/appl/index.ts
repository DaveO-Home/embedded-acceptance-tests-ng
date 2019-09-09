import 'babel-polyfill';
import './polyfills'
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './entry';
import './js/config'
import App from './js/app'
import Default from './js/utils/default'
import Setup from './js/utils/setup'
import 'b/pager'
//removeIf(production)
import 'zone.js/dist/zone-error';
import apptest from './jasmine/apptest'
//endRemoveIf(production)

declare var fail: any;
declare var testit: any;
declare var jasmine: any;
declare var __karma__: any;
declare var Promise: any;

let production = true;
//removeIf(production)
production = false;
//endRemoveIf(production)

if (typeof production === 'undefined' || production) {
    enableProdMode();
}
if(typeof testit === "undefined" || !testit) {
    platformBrowserDynamic().bootstrapModule(AppModule)
        .catch(err => console.error(err));
}

App.init(Default)
Setup.init()
//removeIf(production)
//Code between the ..start and ..end tags will be removed by browserify during the production build.
//testit is true if running under Karma - see testapp_dev.html
new Promise((resolve, reject) => {
    setTimeout(function () {
        resolve(0)
    },  500);
}).catch(rejected => {
    fail(`Error ${rejected}`)
}).then(resolved => {
    if (typeof testit !== "undefined" && testit) {
        //Run acceptance tests. - To run only unit tests, comment the apptest call.
        apptest(App, AppModule, platformBrowserDynamic);
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
        __karma__.start();
    }
})
//endRemoveIf(production)
