import handlebars from "handlebars/dist/handlebars.min";
import Menu from "./menu";
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
