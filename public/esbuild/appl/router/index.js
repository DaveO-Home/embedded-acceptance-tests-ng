var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { NgModule } from "@angular/core";
import { LocationStrategy, HashLocationStrategy } from "@angular/common";
import { RouterModule } from "@angular/router";
// import { map } from "rxjs/operators";
import { StartComponent } from "../components/start.component";
import { ContactComponent } from "../components/contact.component";
import { PdfComponent } from "../components/pdf.component";
import { ToolsComponent, ToolsSelect } from "../components/tools.component";
import { HelloWorldComponent } from "../components/helloworld.component";
import { StartService } from "../services/start.service";
import { TableService } from "../services/table.service";
var appRoutes = [
    { path: "", component: StartComponent },
    { path: "#/", component: StartComponent },
    { path: "#", component: StartComponent },
    { path: "contact", component: ContactComponent },
    { path: "pdf/test", component: PdfComponent },
    { path: "table/tools", component: ToolsComponent },
    { path: "welcome", component: HelloWorldComponent },
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
        NgModule({
            declarations: [
                StartComponent,
                ContactComponent,
                PdfComponent,
                ToolsComponent,
                ToolsSelect,
                HelloWorldComponent,
            ],
            imports: [
                RouterModule.forRoot(appRoutes, {
                    enableTracing: false,
                    anchorScrolling: "enabled",
                    scrollPositionRestoration: "enabled",
                    useHash: false
                    // preloadingStrategy: SelectivePreloadingStrategyService,
                })
            ],
            exports: [
                RouterModule
            ],
            providers: [
                StartService,
                TableService,
                { provide: LocationStrategy, useClass: HashLocationStrategy },
            ],
        })
    ], AppRoutingModule);
    return AppRoutingModule;
}());
export { AppRoutingModule };
var MyRouter = /** @class */ (function () {
    function MyRouter(_router) {
        this.router = _router;
    }
    return MyRouter;
}());
export { MyRouter };
//# sourceMappingURL=index.js.map