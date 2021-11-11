
var App = require("../app");
var Helpers = require("./helpers");

var base = false;
var baseUrl = "";
/* develblock:start */
if (typeof testit !== "undefined" && testit) {
    base = true;
}
/* develblock:end */

module.exports = {
    defaults: {
        base
    },
    baseUrl,
    init () {
        if (base) {
            baseUrl = `base/${window._bundler}/appl/`;
        }
    },
    view (options) {
        var loading = Helpers.getValueOrDefault(options.loading, false);

        // Lets not clutter up the test reporting.
        if (typeof testit !== "undefined" && !testit) {
            if (loading) {
                // In lieu of spinner for demo
                console.warn("Loading");
            }
        }

        var render = Helpers.renderer(this, options);

        if (options.template) {
            if(options.template.split(".")[0] === "tools") {
                App.renderTools(options, render);
            }
        } else {
            App.loadView(options, frag => {
                App.html = render(frag);
            });
        }
    },
    modal (options) {
        var template;

        App.loadView({
            url: `${options.baseUrl}templates/stache/modal.stache`
        }, modalFrag => {
            template = Stache.compile(modalFrag);

            App.loadView(options, frag => {
                options["body"] = frag;
                options["foot"] = Stache.compile(options.foot)(options);
                var el = $(document.body).append(template(options)).find("> .modal").last();
                var css = {};
                if (options.width) {
                    css["width"] = typeof css.width === "number" ? `${options.width}%` : options.width;
                    var width = css.width.substring(0, css.width.length - 1);
                    css["margin-left"] = `${(100 - width) / 2}%`;
                }
                $(".modal .submit-login").on("click", this[".modal .submit-login click"]);
                $("div .modal-footer .contact").on("click", this["div .modal-footer .contact click"]);
                $(el).on("show.bs.modal", () => {
                    if (options.fnLoad) {
                        options.fnLoad(el);
                    }
                }).on("hide.bs.modal", () => {
                    if (options.fnHide) {
                        options.fnHide(el);
                    }
                }).on("hidden.bs.modal", function () {
                    $(this).remove();
                }).modal("show").css(css).find("> .modal-dialog").addClass(options.widthClass);
            });
        });
    },
    hideModal () {
        // HIDE ANY OPEN MODAL WINDOWS
        $(".modal.in", this.element).modal("hide");
    },
    base
};
