"use strict";
exports.__esModule = true;
var pluginUtils_1 = require("fuse-box/plugins/pluginUtils");
function pluginStripCode(a, b) {
    var _a = pluginUtils_1.parsePluginOptions(a, b, {}), opts = _a[0], matcher = _a[1];
    return function (ctx) {
        ctx.ict.on("assemble_fast_analysis", function (props) {
            if ((matcher && !matcher.test(props.module.props.absPath)) ||
                /node_modules/.test(props.module.props.absPath)) {
                return;
            }
            var module = props.module;
            ctx.log.info("pluginStripCode", "stripping code in $file \n", {
                file: module.props.fuseBoxPath
            });
            var startComment = opts.start || "develblock:start";
            var endComment = opts.end || "develblock:end";
            var regexPattern = new RegExp("[\\t ]*(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)"
                + startComment + " ?[\\*\\/]?[\\s\\S]*?(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)"
                + endComment + " ?(\\*\\/)?[\\t ]*\\n?", "g");
            module.read();
            module.contents = module.contents.replace(regexPattern, "");
            return props;
        });
    };
}
exports.pluginStripCode = pluginStripCode;
