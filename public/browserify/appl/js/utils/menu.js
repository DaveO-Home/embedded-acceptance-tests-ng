
import * as _ from 'lodash'

export default {
    // Bootstrap activation
    activate (selector) {
        let activated = false
        // Ensure jquery
        const el = selector instanceof $ ? selector : $(selector)
        // Element is likely a list
        el.each(function () {
            const href = $('a', this).attr('href')
            const url = href ? _.trimStart(href, '#') : 'none'
            const hash = _.trimStart(window.location.hash, '#')
            if (hash === url) {
                // window.location.hash = ''
                $(this).addClass('active').siblings().removeClass('active')
                // window.location.hash = `#${hash}`
                activated = true

                return false
            }
        })
        if (!activated) {
            el.removeClass('active')
        }
    }
}
