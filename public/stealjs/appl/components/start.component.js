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
var start_service_1 = require("../services/start.service");
var StartComponent = /** @class */ (function () {
    function StartComponent(starts) {
        this.htmldata = 'Loading Index Page...';
        this.starts = starts;
    }
    /*
      Please note; to minimize code differences among the the demo-ed frameworks
      (canjs, react, vue, angular), this code does not use the angular http module.
      The proper design would be to use something like this;
        import {Http, Headers, HTTP_PROVIDERS, URLSearchParams} from '@angular/http';
      with perhaps the Observable module.
    */
    StartComponent.prototype.ngOnInit = function () {
        return this.starts.getHtml(this).then(function (data) {
            data.obj.htmldata = data.response;
        });
    };
    StartComponent = __decorate([
        core_1.Component({
            template: '<span [innerHTML]="htmldata"></span>',
        }),
        __metadata("design:paramtypes", [start_service_1.StartService])
    ], StartComponent);
    return StartComponent;
}());
exports.StartComponent = StartComponent;
