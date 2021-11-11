import "babel-polyfill";
import "./polyfills";
import "./js/utils/set.globals";
import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { AppModule } from "./entry";
import "./js/config";
import Default from "./js/utils/default";
import Setup from "./js/utils/setup";
import "../../../node_modules/tablesorter/dist/js/extras/jquery.tablesorter.pager.min.js";
import App from "./js/app";
/* develblock:start */
import "zone.js/dist/zone-error";
import apptest from "./jasmine/apptest";
/* develblock:end */
// import { Elm } from "./elm/Main.elm";
// import { register } from "./elm/elm-console-debug";

// register({ simple_mode: true, debug: false, sizeLimit: 1000 });
// setTimeout(() => {
// Elm.Main.init({
//     node: document.getElementById("root"),
// });
// }, 1500);
let production = true;  // This will work if "parcel-plugin-strip" is linked in - see README
/* develblock:start */
production = false;
/* develblock:end */

if (production) {
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
new Promise((resolve) => {
    setTimeout(function () {
        resolve(0);
    },  500);
}).then(() => {
    if (typeof testit !== "undefined" && testit) {
        //Run acceptance tests. - To run only unit tests, comment the apptest call.
        apptest(App, AppModule, platformBrowserDynamic);
    }
}).catch(rejected => {
    throw `Error ${rejected}`;
});
/* develblock:end */
