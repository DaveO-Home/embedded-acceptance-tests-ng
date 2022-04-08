import "babel-polyfill";
import "./polyfills";
import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { AppModule } from "./entry";
import "pager";

/* develblock:start */
import "zone.js/dist/zone-error";
import apptest from "../jasmine/apptest";
// const apptest = require('../jasmine/apptest').default
/* develblock:end */
require("./js/config");
const App = require("./js/app");
const Default = require("./js/utils/default");
const Setup = require("./js/utils/setup");


declare let testit: boolean;
declare let Promise: any;

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
