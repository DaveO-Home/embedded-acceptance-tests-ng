"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var router_1 = require("@angular/router");
require("rxjs/add/operator/map");
var start_component_1 = require("../components/start.component");
var contact_component_1 = require("../components/contact.component");
var pdf_component_1 = require("../components/pdf.component");
var tools_component_1 = require("../components/tools.component");
var helloworld_component_1 = require("../components/helloworld.component");
var start_service_1 = require("../services/start.service");
var table_service_1 = require("../services/table.service");
var appRoutes = [
    { path: '', component: start_component_1.StartComponent },
    { path: '#/', component: start_component_1.StartComponent },
    { path: '#', component: start_component_1.StartComponent },
    { path: 'contact', component: contact_component_1.ContactComponent },
    { path: 'pdf/test', component: pdf_component_1.PdfComponent },
    { path: 'table/tools', component: tools_component_1.ToolsComponent },
    { path: 'welcome', component: helloworld_component_1.HelloWorldComponent }
];
var AppRoutingModule = /** @class */ (function () {
    function AppRoutingModule() {
    }
    AppRoutingModule = __decorate([
        core_1.NgModule({
            declarations: [
                start_component_1.StartComponent,
                contact_component_1.ContactComponent,
                pdf_component_1.PdfComponent,
                tools_component_1.ToolsComponent,
                tools_component_1.ToolsSelect,
                helloworld_component_1.HelloWorldComponent,
            ],
            imports: [
                router_1.RouterModule.forRoot(appRoutes, {
                    enableTracing: false,
                })
            ],
            exports: [
                router_1.RouterModule
            ],
            providers: [
                start_service_1.StartService,
                table_service_1.TableService,
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
