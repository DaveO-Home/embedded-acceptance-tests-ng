import * as handlebars from "handlebars";
import Menu from "menu";
import JSONEditor from "jsoneditor/dist/jsoneditor.min.js";
window.JSONEditor = JSONEditor;

window.Stache = handlebars;

export default {
    init () {
        // Show the page
        $("#top-nav").removeAttr("hidden");
        $("#side-nav").removeAttr("hidden");
        Menu.activate("#top-nav div ul li");
        Menu.activate("#side-nav nav ul li");
    }
};
