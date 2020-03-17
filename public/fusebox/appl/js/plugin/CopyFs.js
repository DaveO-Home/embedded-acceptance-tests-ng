
Object.defineProperty(exports, "__esModule", { value: true });
var copy = require("copy");
/*eslint no-extra-semi: "warn"*/
/*global exports:true*/
/*eslint no-console: ["error", { allow: ["warn", "error"] }] */
var CopyFsClass = /** @class */ (function () {
    function CopyFsClass(options) {
        this.options = options;
        options.copy.forEach(function (fromTo) {
            copy(fromTo.from, fromTo.to, function (err, files) {
                if (err) {
                    console.error("Copy Failed on: ");
                    console.error(files);
                    throw err;
                }
            });
        });
    }
    
    return CopyFsClass;
}());
exports.CopyFsClass = CopyFsClass;
exports.CopyFs = function (options) {
    return new CopyFsClass(options);
};
