"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var helpers_1 = require("../js/utils/helpers");
var app_1 = require("../js/app");
var table_1 = require("../js/controller/table");
var TableService = /** @class */ (function () {
    function TableService() {
    }
    TableService.prototype.getHtml = function (obj) {
        var controllerName = 'Table';
        var actionName = 'tools';
        var failMsg = "Load problem with: '" + controllerName + "/" + actionName + "'.";
        app_1.default.loadController(controllerName, table_1.default, function (controller) {
            if (controller &&
                controller[actionName]) {
                controller[actionName]({});
            }
            else {
                console.error(failMsg);
            }
        }, function (err) {
            console.error(failMsg + " - " + err);
        });
        return new Promise(function (resolve, reject) {
            var count = 0;
            helpers_1.default.isLoaded(resolve, reject, '', table_1.default, count, 10);
        })
            .catch(function (rejected) {
            console.warn('Failed', rejected);
        })
            .then(function (resolved) {
            return { "response": resolved, "obj": obj };
        });
    };
    return TableService;
}());
exports.TableService = TableService;
