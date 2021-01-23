import handlebars from "handlebars/dist/handlebars.min";
import Menu from "./menu";
import JSONEditor from "jsoneditor/dist/jsoneditor.min.js";

window.Stache = handlebars;
window.JSONEditor = JSONEditor;

export default {
    init () {
        // Show the page
        $("#top-nav").removeAttr("hidden");
        $("#side-nav").removeAttr("hidden");
        Menu.activate("#top-nav div ul li");
        Menu.activate("#side-nav nav ul li");
    }
};
