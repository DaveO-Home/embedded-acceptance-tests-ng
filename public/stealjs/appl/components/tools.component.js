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
var tools_sm_1 = require("../js/utils/tools.sm");
var table_service_1 = require("../services/table.service");
var table_1 = require("../js/controller/table");
var helpers_1 = require("../js/utils/helpers");
var app_1 = require("../js/app");
var dropdown = "<h4 class=\"center\">\nTools Count - <span class='tools-state'>{{getMessage()}} (using Redux)</span>\n</h4>\n<section>\n<div id=\"dropdown1\" class=\"dropdown\">\n\t\t\t<button class=\"dropdown-toggle smallerfont\" \n\t\t\ttype=\"button\"\n\t\t\tid=\"dropdown0\"\n\t\t\tdata-toggle=\"dropdown\"\n\t\t\taria-haspopup=\"true\"\n\t\t\taria-expanded=\"false\">\n\t  Select Tools Type\n\t</button>\n\t<div class=\"dropdown-menu pointer\" aria-labelledby=\"dropdown0\">\n\t  <a class=\"dropdown-item smallerfont\" (click)=\"onCompletedClick($event)\">Combined</a>\n\t  <a class=\"dropdown-item smallerfont\" (click)=\"onCompletedClick($event)\">Category1</a>\n\t  <a class=\"dropdown-item smallerfont\" (click)=\"onCompletedClick($event)\">Category2</a>\n\t</div>\n  </div>\n  </section>";
var ToolsSelect = /** @class */ (function () {
    function ToolsSelect() {
        this.message = "Combined";
        this.state = {
            items: []
        };
    }
    ToolsSelect.prototype.getMessage = function () {
        var items = tools_sm_1.default.getStore().getState().tools.items;
        var index = -1;
        items.forEach(function (item, _index) {
            if (item.displayed) {
                index = _index;
            }
        });
        if (index !== -1) {
            this.message = items[index].message;
        }
        else {
            tools_sm_1.default.addCategory(this.message);
        }
        return this.message;
    };
    ToolsSelect.prototype.onCompletedClick = function (e) {
        var dropdownValue;
        e.preventDefault();
        var controller = app_1.default.controllers['Table'];
        dropdownValue = e.target.text.trim();
        var store = tools_sm_1.default.getStore();
        var found = tools_sm_1.default.findEntry(dropdownValue, store.getState().tools.items);
        controller.dropdownEvent(e); // Load table with selected data
        if (found.idx === -1) {
            tools_sm_1.default.addCategory(dropdownValue);
        }
        else {
            tools_sm_1.default.replaceCategory(found.idx);
        }
        $('#dropdown1 a i').each(function () { this.remove(); });
        $(e.target).fa({ icon: 'check' });
    };
    ToolsSelect = __decorate([
        core_1.Component({
            selector: "dropdown",
            template: dropdown
        }),
        __metadata("design:paramtypes", [])
    ], ToolsSelect);
    return ToolsSelect;
}());
exports.ToolsSelect = ToolsSelect;
var ToolsComponent = /** @class */ (function () {
    function ToolsComponent(tableservice) {
        tools_sm_1.default.toolsStateManagement();
        this.tables = tableservice;
    }
    ToolsComponent.prototype.ngOnInit = function () {
        return this.tables.getHtml(this).then(function (data) {
            /*
                By-passing angular sanitizing since it removes too much from template &
                minimum checking for possible injection.
            */
            var scriptCount = (data.response.match(/script/gi) || []).length;
            var columnCount = (data.response.match(/th class/gi) || []).length;
            var jsCount = (data.response.match(/javascript/gi) || []).length;
            if (scriptCount === 0 && columnCount > 0 && jsCount === 0) {
                $(document).ready(function () {
                    $('#data').html(data.response);
                    helpers_1.default.scrollTop();
                    if (app_1.default.controllers['Start']) {
                        app_1.default.controllers['Start'].initMenu();
                    }
                    $('#top-nav').removeAttr('hidden');
                    $('#side-nav').removeAttr('hidden');
                    table_1.default.decorateTable('tools');
                });
            }
        });
    };
    __decorate([
        core_1.ViewChild(ToolsSelect),
        __metadata("design:type", ToolsSelect)
    ], ToolsComponent.prototype, "dropdown", void 0);
    ToolsComponent = __decorate([
        core_1.Component({
            encapsulation: core_1.ViewEncapsulation.None,
            template: '<dropdown></dropdown><span id="data"></span>',
            styleUrls: ['css/table.css'],
        }),
        __metadata("design:paramtypes", [table_service_1.TableService])
    ], ToolsComponent);
    return ToolsComponent;
}());
exports.ToolsComponent = ToolsComponent;
