
Object.defineProperty(exports, "__esModule", { value: true });
/*eslint no-extra-semi: "warn"*/
/*global exports:true*/
/*eslint no-console: ["error", { allow: ["warn", "error"] }] */
var BlockStripClass = /** @class */ (function () {
    function BlockStripClass(options) {
        if (options === void 0) { options = {}; }
        this.options = options;
        //minimize file selection list by including only js files under a js directory, index.js and js under can
        this.test = /(\/js\/.*\.js|index(\.js|\.ts)|can.*\.js)/;
        this.startComment = options.options.start || "develblock:start";
        this.endComment = options.options.end || "develblock:end";
        this.regexPattern = new RegExp("[\\t ]*(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)" + this.startComment + " ?[\\*\\/]?[\\s\\S]*?(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)" + this.endComment + " ?(\\*\\/)?[\\t ]*\\n?", "g");
    }
    
    BlockStripClass.prototype.transform = function (file) {
        file.loadContents();
        file.contents = file.contents.replace(this.regexPattern, "");
    };
    return BlockStripClass;
}());
exports.BlockStripClass = BlockStripClass;
exports.BlockStrip = function (options) {
    return new BlockStripClass(options);
};
