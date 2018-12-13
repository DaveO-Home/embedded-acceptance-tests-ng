"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var setup_1 = require("../js/utils/setup");
var start_1 = require("../js/controller/start");
var HelloWorldComponent = /** @class */ (function () {
    function HelloWorldComponent() {
        this.title = 'Acceptance Testing with Angular';
    }
    HelloWorldComponent.prototype.ngOnInit = function () {
        setup_1.default.init();
        start_1.default.initMenu();
        start_1.default.index();
    };
    HelloWorldComponent = __decorate([
        core_1.Component({
            templateUrl: 'views/hello.world.html',
            styleUrls: ['css/hello.world.css']
        })
    ], HelloWorldComponent);
    return HelloWorldComponent;
}());
exports.HelloWorldComponent = HelloWorldComponent;
