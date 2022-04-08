import "zone.js/dist/zone";
import {} from "@angular/compiler";
import "setglobals";
import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { AppModule } from "entry";
import "config";
import Default from "default"; 
import Setup from "setup";
//!steal-remove-start
import "zone.js/dist/zone-error";
import apptest from "apptest";
//!steal-remove-end
import "./css/site.css";
import App from "app";

let production = true; 
//!steal-remove-start
production = false;
//!steal-remove-end

if (typeof production === "undefined" || production) {
    enableProdMode();
}
if (typeof testit === "undefined" || !testit) {
    platformBrowserDynamic().bootstrapModule(AppModule)
        .catch(err => console.error(err));
}

App.init(Default);
Setup.init();
//!steal-remove-start
//Code between the ..start and ..end tags will be removed by the BlockStrip plugin during the production build.
//testit is true if running under Karma - see testapp_dev.html
if (typeof testit !== "undefined" && testit) {
    //Run acceptance tests
    apptest(App, AppModule, platformBrowserDynamic);
}
//!steal-remove-end
