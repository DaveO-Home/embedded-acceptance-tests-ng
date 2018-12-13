"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var start_1 = require("../js/controller/start");
var setup_1 = require("../js/utils/setup");
var helpers_1 = require("../js/utils/helpers");
var StartService = /** @class */ (function () {
    function StartService() {
    }
    StartService.prototype.getHtml = function (obj) {
        setup_1.default.init();
        start_1.default.initMenu();
        start_1.default.index();
        return new Promise(function (resolve, reject) {
            var count = 0;
            helpers_1.default.isLoaded(resolve, reject, '', start_1.default, count, 10);
        })
            .catch(function (rejected) {
            console.warn('Failed', rejected);
        })
            .then(function (resolved) {
            return { "response": resolved, "obj": obj };
        });
    };
    return StartService;
}());
exports.StartService = StartService;
