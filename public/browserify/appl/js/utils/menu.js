
var trimStart = require("lodash/trimStart");

export default {
    // Bootstrap activation
    activate (selector) {
        let activated = false;
        // Ensure jquery
        const el = selector instanceof $ ? selector : $(selector);
        // Element is likely a list
        el.each(function () {
            const href = $("a", this).attr("href");
            const url = href ? trimStart(href, "#") : "none";
            const hash = trimStart(window.location.hash, "#");
            if (hash === url) {
                $(this).addClass("active").siblings().removeClass("active");
                activated = true;
                return false;
            }
        });
        if (!activated) {
            el.removeClass("active");
        }
    }
};
