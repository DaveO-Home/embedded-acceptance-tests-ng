
var App = require("../app")
var Base = require("../utils/base.control")

Base.init()
module.exports = App.controllers["Table"] || (App.controllers["Table"] = Object.assign({ // new (Base.extend({
    defaults: {
    },
    name: "table",
    tools () {
        var toolsUrl = "templates/stache/"
        if (this.base || window.testit) {
            this.baseUrl = `base/${window._bundler}/appl/`
        }
        this.view({
            controller: "table",
            action: "tools",
            templateUrl: this.baseUrl + toolsUrl,
            template: "tools.stache",
            list: true,
            loading: true,
            ang: true
        })
    },
    decorateTable (elementId) {
        var id = `#${elementId}`
        var headers

        var pageSorter = {
            container: $(".ts-pager"),
            cssGoto: ".pagenum",
            removeRows: false,
            output: "{startRow} - {endRow} / {filteredRows} ({totalRows})",
            updateArrows: true,
            page: 0,
            size: 10
        }

        var defaultPage = [1, 10]

        if (elementId === "tools") {
            headers = { ".disabled": { sorter: false, filter: false } }
            defaultPage = [1, 20]
        }

        $(id).tablesorter({
            theme: "blue",
            widthFixed: true,
            headers,
            headerTemplate: "{content} {icon}",
            widgets: ["filter", "columns", "resizeable", "zebra"],
            widgetOptions: {
                zebra: ["even", "odd"],
                columns: ["primary", "secondary", "tertiary"],
                filter_reset: ".reset"
            }
        }).tablesorterPager(pageSorter)

        $(id).trigger("pageAndSize", defaultPage)
        $($("#dropdown1 a")[0]).fa({ icon: "check" })
    },
    base: false,
    "#dropdown1 a click": function (sender, e) {
        e.preventDefault()
        this.dropdownEvent(sender)
    },
    "#dropdown1 a select": function (sender, e) {
        e.preventDefault()
        this.dropdownEvent(sender)
    },
    dropdownEvent (/*sender*/) { },
    getHtml () {
        return this.html
    },
    html: ""
}, Base))
