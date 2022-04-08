"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyRouter = exports.AppRoutingModule = void 0;
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var router_1 = require("@angular/router");
require("rxjs/add/operator/map");
var startc_1 = require("startc");
var contactc_1 = require("contactc");
var pdfc_1 = require("pdfc");
var toolsc_1 = require("toolsc");
var helloc_1 = require("helloc");
var starts_1 = require("starts");
var tables_1 = require("tables");
var appRoutes = [
    { path: "", component: startc_1.StartComponent },
    { path: "#/", component: startc_1.StartComponent },
    { path: "#", component: startc_1.StartComponent },
    { path: "contact", component: contactc_1.ContactComponent },
    { path: "pdf/test", component: pdfc_1.PdfComponent },
    { path: "table/tools", component: toolsc_1.ToolsComponent },
    { path: "welcome", component: helloc_1.HelloWorldComponent },
    { path: "close", redirectTo: "#close" },
    { path: "dodexInput", redirectTo: "#dodexInput" },
    { path: "commHandle", redirectTo: "#commHandle" },
    { path: "closeHandle", redirectTo: "#closeHandle" },
    { path: "dodexComm", redirectTo: "#dodexComm" },
    /*
      For navigating to anchors on README page.
    */
    { path: "embedded-angular2-acceptance-testing-with-karma-and-jasmine", redirectTo: "/#top" },
    { path: "production-build", redirectTo: "/#production-build" },
    { path: "test-build", redirectTo: "/#test-build" },
    { path: "development", redirectTo: "/#development" },
    { path: "i-browserify", redirectTo: "/#browserify" },
    { path: "ii-brunch", redirectTo: "/#brunch" },
    { path: "iii-fusebox", redirectTo: "/#fusebox" },
    { path: "iv-parcel", redirectTo: "/#parcel" },
    { path: "v-rollup", redirectTo: "/#rollup" },
    { path: "vi-stealjs", redirectTo: "/#steal" },
    { path: "vii-webpack", redirectTo: "/#webpack" },
    { path: "viii-dockerfile", redirectTo: "/#docker" },
    { path: "installation", redirectTo: "/#installation" }
];
var AppRoutingModule = /** @class */ (function () {
    function AppRoutingModule() {
    }
    AppRoutingModule = __decorate([
        core_1.NgModule({
            declarations: [
                startc_1.StartComponent,
                contactc_1.ContactComponent,
                pdfc_1.PdfComponent,
                toolsc_1.ToolsComponent,
                toolsc_1.ToolsSelect,
                helloc_1.HelloWorldComponent,
            ],
            imports: [
                router_1.RouterModule.forRoot(appRoutes, {
                    enableTracing: false,
                    anchorScrolling: "enabled",
                    scrollPositionRestoration: "enabled",
                    useHash: false
                    // preloadingStrategy: SelectivePreloadingStrategyService,
                })
            ],
            exports: [
                router_1.RouterModule
            ],
            providers: [
                starts_1.StartService,
                tables_1.TableService,
                { provide: common_1.LocationStrategy, useClass: common_1.HashLocationStrategy },
            ],
        })
    ], AppRoutingModule);
    return AppRoutingModule;
}());
exports.AppRoutingModule = AppRoutingModule;
var MyRouter = /** @class */ (function () {
    function MyRouter(_router) {
        this.router = _router;
    }
    return MyRouter;
}());
exports.MyRouter = MyRouter;
