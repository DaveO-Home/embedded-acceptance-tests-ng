/* eslint "comma-style": [0, "last"] */
import * as _ from "lodash";
import "bootstrap";
import "tablesorter";
import "tablepager";
import { createPopper } from "@popperjs/core";

/* develblock:start */
// Specs can be inserted at initialization(before karma is started).
if (typeof testit !== "undefined" && testit) {
    describe("Popper Defined - required for Bootstrap", () => {
        it("is JQuery defined", () => {
            expect(typeof $ === "function").toBe(true);
        });

        it("is Popper defined", () => {
            expect(typeof createPopper === "function").toBe(true);
        });
    });
}
/* develblock:end */

const baseScriptsUrl = "~/";

const pathName = window.location.pathname;

let baseUrl = `${pathName.substring(0, pathName.substring(1, pathName.length).lastIndexOf("/") + 1)}`;

export default {
    controllers: [],
    init (options) {
        options = options || {};
        this.initPage(options);
        $.fn.fa = function (options) {
            options = $.extend({
                icon: "check"
            }, options);
            return this.each(function () {
                const $element = $(this.target ? this.target : this);
                const icon = `<i class='fa fa-${options.icon}'> </i>`;
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
        if (_.startsWith(baseUrl, "/appl/")) {
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
        return _.startsWith(url, "views/") ? this.toScriptsUrl(url) : this.toUrl(url);
    },
    loadController (controllerName, controller, fnLoad, fnError) {
        const me = this;

        if (this.controllers[controllerName]) {
            fnLoad(me.controllers[controllerName]);
        } else {
            const appController = controller;

            try {
                /* develblock:start */
                if (testit) {
                    expect(appController).not.toBe(null);
                    expect(typeof fnLoad === "function").toBe(true);
                }
                /* develblock:end */
                me.controllers[_.capitalize(controllerName)] = appController;

                fnLoad(me.controllers[controllerName]);
            } catch (e) {
                console.error(e);
                fnError();
            }
        }
    },
    loadView (options, fnLoad) {
        if (options && fnLoad) {
            const resolvedUrl = options.url;
            const currentController = this.controllers[_.capitalize(options.controller)];

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
        const currentController = this.controllers[_.capitalize(options.controller)];
        let template;
        const jsonUrl = "templates/tools_ful.json";

        $.get(options.templateUrl + options.template, source => {
            template = Stache.compile(source);

            $.get(jsonUrl, data => {
                currentController.html = $("<div>").append(template(data)).attr("id", "stuff").html();
                $("#stuff").remove();

                const updateTable = sender => {
                    const osKeys = ["Combined", "Category1", "Category2"];
                    const values = ["ful", "cat1", "cat2"];
                    const tbodyTemplate = template;
                    const toolsUrl = "templates/tools_";

                    let selectedJobType = getValue(sender.target.innerText, osKeys, values);
                    if (typeof selectedJobType === "undefined") {
                        return;
                    }
                    $.get(`${toolsUrl + selectedJobType}.json`, data => {
                        if (selectedJobType === "ful") {
                            data.all = false;
                        }
                        const tbody = tbodyTemplate(data);
                        $(".tablesorter tbody").html(tbody).trigger("update");
                        $("#dropdown1 a i").each(function () { this.remove(); });
                        $(sender).fa({ icon: "check" });
                    }, "json").fail((data, err) => {
                        console.error(`Error fetching fixture data: ${err}`);
                    });
                    function getValue (item, keys, values) {
                        for (let idx = 0; idx < keys.length; idx++) {
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
        for (let idx = 0; idx < keys.length; idx++) {
            if (keys[idx] === item) return values[idx];
        }
    }
};
