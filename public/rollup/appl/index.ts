import "babel-polyfill";
import "./polyfills";
import "./js/utils/set.globals";
import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { AppModule } from "./entry";
import "reflect-metadata";

import "./js/config";
import App from "./js/app";
import Default from "./js/utils/default";
import Setup from "./js/utils/setup";
import "tablesorter/dist/js/extras/jquery.tablesorter.pager.min.js";

/* develblock:start */
import "zone.js/dist/zone-error";
import apptest from "./jasmine/apptest";

declare let testit: any;
declare let Promise: any;
/* develblock:end */

let production = true;
/* develblock:start */
production = false;
/* develblock:end */

if (typeof production === "undefined" || production) {
    enableProdMode();
}
if(typeof testit === "undefined" || !testit) {
    platformBrowserDynamic().bootstrapModule(AppModule)
        .catch(err => console.error(err));
}

App.init(Default);
Setup.init();
/* develblock:start */
//Code between the ..start and ..end tags will be removed by the BlockStrip plugin during the production build.
//testit is true if running under Karma - see testapp_dev.html
new Promise((resolve, reject) => {
    setTimeout(function () {
        resolve(0);
    },  500);
}).then(resolved => {
    if (typeof testit !== "undefined" && testit) {
        //Run acceptance tests. - To run only unit tests, comment the apptest call.
        apptest(App, AppModule, platformBrowserDynamic);
    }
}).catch(rejected => {
    throw `Error ${rejected}`;
});
/* develblock:end */
