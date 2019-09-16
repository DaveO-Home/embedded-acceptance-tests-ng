/* eslint "comma-style": [0, "last"] */

var startsWith = require("lodash/startsWith");
var capitalize = require("lodash/capitalize");
require("bootstrap");
require("tablesorter");
/* develblock:start */
// Specs can be inserted at initialization(before karma is started).
if (typeof testit !== "undefined" && testit) {
    describe("Popper Defined - required for Bootstrap", () => {
        it("is JQuery defined", () => {
            expect(typeof $ === "function").toBe(true);
        });

        it("is Popper defined", () => {
            expect(typeof Popper === "function").toBe(true);
        });
    });
}
/* develblock:end */

var baseScriptsUrl = "~/";

var pathName = window.location.pathname;

var baseUrl = `${pathName.substring(0, pathName.substring(1, pathName.length).lastIndexOf("/") + 1)}`;

module.exports = {
    controllers: [],
    bUrl: baseUrl,
    init (options) {
        options = options || {};
        this.initPage(options);
        if (pathName === "/context.html" || (typeof window.testit !== "undefined" && testit)) {
            this.bUrl = baseUrl = "/base/brunch/appl";
        }
        // Check on tools dropdown
        $.fn.fa = function (options) {
            options = $.extend({
                icon: "check"
            }, options);
            return this.each(function () {
                var $element = $(this.target ? this.target : this);
                var icon = `<i class='fa fa-${options.icon}'> </i>`;
                $(icon).appendTo($element);
            });
        };
    },
    initPage () {
        $("[data-toggle=collapse]").click(function (e) {
            // Don't change the hash
            e.preventDefault();
            $(this).find("i").toggleClass("fa-chevron-right fa-chevron-down");
        });
    },
    toUrl (url) {
        // Node Express exception
        if (startsWith(baseUrl, "/appl/")) {
            baseUrl = "/appl";
        }

        if (url && url.indexOf("~/") === 0) {
            url = baseUrl + url.substring(2);
        }

        return url;
    },
    toScriptsUrl (url) {
        return this.toUrl(`${baseScriptsUrl}/${url}`);
    },
    toViewsUrl (url) {
        return startsWith(url, "views/") ? this.toScriptsUrl(url) : this.toUrl(url);
    },
    loadController (controllerName, controller, fnLoad, fnError) {
        var me = this;

        if (this.controllers[controllerName]) {
            fnLoad(me.controllers[controllerName]);
        } else {
            var appController = controller;

            try {
                /* develblock:start */
                if (testit) {
                    expect(appController).not.toBe(null);
                    expect(typeof fnLoad === "function").toBe(true);
                }
                /* develblock:end */
                me.controllers[capitalize(controllerName)] = appController;

                fnLoad(me.controllers[controllerName]);
            } catch (e) {
                console.error(e);
                fnError();
            }
        }
    },
    loadView (options, fnLoad) {
        if (options && fnLoad) {
            var resolvedUrl = this.toViewsUrl(options.url);
            var currentController = this.controllers[capitalize(options.controller)];

            if (options.url) {
                $.get(resolvedUrl, fnLoad)
                    .done((data, err) => {
                        if (typeof currentController !== "undefined" && currentController.finish) {
                            currentController.finish(options);
                        }
                        if (err !== "success") {
                            console.error(err);
                        }
                    });
            } else if (options.local_content) {
                fnLoad(options.local_content);
                if (typeof currentController !== "undefined" && currentController.finish) {
                    currentController.finish(options);
                }
            }
        }
    },
    renderTools (options) {
        var currentController = this.controllers[capitalize(options.controller)];
        var template;
        var jsonUrl = `${baseUrl}/templates/tools_ful.json`;

        $.get(options.templateUrl + options.template, source => {
            template = Stache.compile(source);

            $.get(jsonUrl, data => {
                currentController.html = $("<div>").append(template(data)).attr("id", "stuff").html();
                $("#stuff").remove();

                var updateTable = sender => {
                    var osKeys = ["Combined", "Category1", "Category2"];
                    var values = ["ful", "cat1", "cat2"];
                    var tbodyTemplate = template;
                    var toolsUrl = `${baseUrl}/templates/tools_`;

                    var selectedJobType = getValue(sender.target.innerText, osKeys, values);
                    if (typeof selectedJobType === "undefined") {
                        return;
                    }
                    $.get(`${toolsUrl + selectedJobType}.json`, data => {
                        if (selectedJobType === "ful") {
                            data.all = false;
                        }
                        var tbody = tbodyTemplate(data);
                        $(".tablesorter tbody").html(tbody).trigger("update");
                        $("#dropdown1 a i").each(function () { this.remove(); });
                        $(sender).fa({ icon: "check" });
                    }, "json").fail((data, err) => {
                        console.error(`Error fetching fixture data: ${err}`);
                    });
                    function getValue (item, keys, values) {
                        for (var idx = 0; idx < keys.length; idx++) {
                            if (keys[idx] === item) return values[idx];
                        }
                    }
                };
                currentController.dropdownEvent = updateTable;
            }, "json").fail((data, err) => {
                console.error(`Error fetching json data: ${err}`);
            });
        }, "text")
            .fail((data, err) => {
                console.error(`Error Loading Template: ${err}`);
                console.warn(data);
            });
    },
    getValue (item, keys, values) {
        for (var idx = 0; idx < keys.length; idx++) {
            if (keys[idx] === item) return values[idx];
        }
    }
};
