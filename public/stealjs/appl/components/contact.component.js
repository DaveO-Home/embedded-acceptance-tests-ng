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
var core_1 = require("@angular/core");
require("rxjs/add/operator/map");
var app_1 = require("../js/app");
var setup_1 = require("../js/utils/setup");
var ContactComponent = /** @class */ (function () {
    function ContactComponent() {
        setup_1.default.init();
    }
    ContactComponent.prototype.ngOnInit = function () {
        var controllerName = 'Start';
        var actionName = 'init';
        var failMsg = "Load problem with: '" + controllerName + "/" + actionName + "'.";
        $(document).ready(function () {
            var el = $($('[name=contact]')[0]);
            app_1.default.loadController(controllerName, {}, function (controller) {
                if (controller &&
                    controller[actionName]) {
                    controller.initMenu();
                    controller.contactListener(el, controller);
                }
                else {
                    console.error(failMsg);
                }
            }, function (err) {
                console.error(failMsg + " - " + err);
            });
        });
    };
    ContactComponent = __decorate([
        core_1.Component({
            templateUrl: "views/prod/contact.html"
        }),
        __metadata("design:paramtypes", [])
    ], ContactComponent);
    return ContactComponent;
}());
exports.ContactComponent = ContactComponent;
