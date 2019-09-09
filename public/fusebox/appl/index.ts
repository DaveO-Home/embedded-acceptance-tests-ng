import 'babel-polyfill';
import 'polyfills'
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from 'ts/entry';
import 'js/config';
import App from 'js/app';
import Default from 'js/default';
import Setup from 'js/setup';
import "tablesorter/dist/js/extras/jquery.tablesorter.pager.min";

/* develblock:start */
import 'zone.js/dist/zone-error';
import apptest from 'js/apptest';
/* develblock:end */

declare const testit: boolean;

let production = true;
/* develblock:start */
production = false;
/* develblock:end */

if (typeof production === 'undefined' || production) {
    enableProdMode();
}

if (typeof testit === "undefined" || !testit) {
    platformBrowserDynamic().bootstrapModule(AppModule)
        .catch(err => console.error(err));
}

App.init(Default)
Setup.init()

/* develblock:start */
/**
 * Code between the ..start and ..end tags will be removed by the 
 * BlockStrip plugin during the production build.
 * testit is true if running under Karma - see testapp_dev.html
 */
if (typeof testit !== "undefined" && testit) {
    //Run acceptance tests. - To run only unit tests, comment the apptest call.
    apptest(App, AppModule, platformBrowserDynamic);
}
/* develblock:end */
