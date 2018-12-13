import 'zone.js/dist/zone'
import {} from '@angular/compiler'
import './js/utils/set.globals'
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './entry';
import './js/config'
import Default from './js/utils/default' 
import Setup from './js/utils/setup'
import 'pager'
import App from './js/app'
//!steal-remove-start
import 'zone.js/dist/zone-error';
import apptest from './jasmine/apptest'
//!steal-remove-end
import './css/site.css'

let production = true; 
//!steal-remove-start
production = false;
//!steal-remove-end

if (typeof production === 'undefined' || production) {
    enableProdMode();
}
if (typeof testit === "undefined" || !testit) {
    platformBrowserDynamic().bootstrapModule(AppModule)
        .catch(err => console.error(err));
}

App.init(Default)
Setup.init()
//!steal-remove-start
//Code between the ..start and ..end tags will be removed by the BlockStrip plugin during the production build.
//testit is true if running under Karma - see testapp_dev.html
if (typeof testit !== "undefined" && testit) {
    //Run acceptance tests
    apptest(App, AppModule, platformBrowserDynamic);
}
//!steal-remove-end
