

export default {
    // Bootstrap activation
    activate (selector) {
        let activated = false;
        // Ensure jquery
        const el = selector instanceof $ ? selector : $(selector);
        // Element is likely a list
        el.each(function () {
            const href = $("a", this).attr("href");
            const url = href ? trimHash(href) : "none";
            const hash = trimHash(window.location.hash);
            if (hash === url) {
                // window.location.hash = ''
                $(this).addClass("active").siblings().removeClass("active");
                // window.location.hash = `#${hash}`
                activated = true;

                return false;
            }
        });
        if (!activated) {
            el.removeClass("active");
        }
    }
};

function trimHash(href) {
    const thisHref = href !== null && href.trim().startsWith("#") ? 
        href.trim().replace("#", "") : href;
    return thisHref;
}