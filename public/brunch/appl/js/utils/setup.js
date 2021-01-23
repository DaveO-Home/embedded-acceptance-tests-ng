
var handlebars = require("handlebars");
var Menu = require("./menu");
var JSONEditor = require("jsoneditor/dist/jsoneditor.min.js");

window.Stache = handlebars;
window.JSONEditor = JSONEditor;

module.exports = {
    init () {
        // Show the page
        $("#top-nav").removeAttr("hidden");
        $("#side-nav").removeAttr("hidden");
        Menu.activate("#top-nav div ul li");
        Menu.activate("#side-nav nav ul li");
    }
};
