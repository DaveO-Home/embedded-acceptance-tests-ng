"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./js/utils/set.globals");
var core_1 = require("@angular/core");
var platform_browser_1 = require("@angular/platform-browser");
require("rxjs/add/operator/map");
var index_1 = require("./router/index");
var start_1 = require("./js/controller/start");
var TestApp = /** @class */ (function () {
    function TestApp() {
    }
    TestApp.prototype.loginModal = function (event) {
        start_1.default['div .login click']();
    };
    TestApp = __decorate([
        core_1.Component({
            selector: 'test-app',
            templateUrl: 'app_bootstrap.html'
        }),
        __metadata("design:paramtypes", [])
    ], TestApp);
    return TestApp;
}());
exports.TestApp = TestApp;
var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        core_1.NgModule({
            imports: [
                platform_browser_1.BrowserModule,
                index_1.AppRoutingModule
            ],
            declarations: [
                TestApp
            ],
            bootstrap: [TestApp],
        })
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
