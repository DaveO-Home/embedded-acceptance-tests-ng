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
// Setting up for optional Karma/Jasmine
require("../js/utils/set.globals");
app_1.default.init();
var url = 'views/prod/Test.pdf';
var PdfComponent = /** @class */ (function () {
    function PdfComponent() {
    }
    PdfComponent.prototype.ngOnInit = function () {
        $('#top-nav').removeAttr('hidden');
        $('#side-nav').removeAttr('hidden');
    };
    PdfComponent = __decorate([
        core_1.Component({
            template: "<iframe id=\"data\" name=\"pdfDO\" src=\"" + url + "\" class=\"col-lg-12\" style=\"height: 750px\"></iframe>",
        }),
        __metadata("design:paramtypes", [])
    ], PdfComponent);
    return PdfComponent;
}());
exports.PdfComponent = PdfComponent;
