
var moment = require('moment')

module.exports = {
    scrollTop () {
        $('html, body').animate({
            scrollTop: 0
        }, 'slow')
    },
    convertToBoolean (value) {
        if (!this.isNullOrEmpty(value)) {
            return false
        }

        if (typeof value === 'string') {
            switch (value.toLowerCase()) {
                case 'true':
                case 'yes':
                case '1':
                    return true
                case 'false':
                case 'no':
                case '0':
                    return false
            }
        }
        return Boolean(value)
    },
    parseJson (json) {
        return (JSON && JSON.parse(json)) || $.parseJSON(json)
    },
    isNullOrEmpty (value) {
        return typeof value === 'undefined' || value === null || value.length === 0
    },
    getValueOrDefault (value, defaultValue) {
        return !this.isNullOrEmpty(value) ? value : defaultValue
    },
    endsWith (str, endswith) {
        return str.endsWith(endswith)
    },
    getWeekKeys () {
        var nthWeek = moment().format('w')
        var year = moment().format('TYYYY')
        var weekKeys = []

        for (var i = 1; i <= nthWeek; i++) {
            var week = (`0${i}`).slice(-2)
            weekKeys.push(year + week)
        }
        return weekKeys
    },
    getOptions (keys, values) {
        if (!values || values.length !== keys.length) {
            values = keys
        }

        var options = '<option value=""></option>'
        for (var i = 0; i < keys.length; i++) {
            options = `${options}<option value='${values[i]}'>${keys[i]}</option>`
        }

        return options
    },
    // Insert loaded html into main_container or specified element
    renderer (controller, options) {
        var helper = this

        return frag => {
            if (options.ang) {
                return frag
            }
            var selector = typeof options.selector !== 'undefined' ? options.selector : '#main_container'
            var el = $(selector)

            el.empty()
            var fade = helper.getValueOrDefault(options.fade, options.fade)

            // If loading(long running load from backend) don't fade-in).
            if (fade && !controller.loading) {
                el.hide().html(frag).fadeIn(fade)
            } else {
                el.html(frag)
            }

            if (options.fnLoad) {
                options.fnLoad(el)
            }

            helper.scrollTop()
        }
    },
    isLoaded: function isLoaded (resolve, reject, dataHtml, Controller, counter, length) {
        switch (Controller.name) {
            case 'start':
            case 'table':
                dataHtml = Controller.getHtml()
                break
            default:
        }

        if (dataHtml.length > length) {
            resolve(dataHtml)
        } else {
            counter++
            if (counter > 10) {
                reject('failed')
            } else {
                var time = Math.random() * 100 + 200
                setTimeout(() => {
                    isLoaded(resolve, reject, dataHtml, Controller, counter, length)
                }, time)
            }
        }

        return true
    }
    /* develblock:start */
    /* eslint comma-style: ["error", "first", { "exceptions": { "ArrayExpression": true, "ObjectExpression": true } }] */
    ,
    // Custom promise for async call for a resource.
    // If the DOM (#main_container) is populated then the promise is compvare.
    isResolved: function isResolved (resolve, reject, selectorId, counter, length) {
        const container = document.querySelector(selectorId)

        if (container && container.children.length > length) {
            // console.log("Found Container", `loaded - with counter/length: ${counter} - ${container.children.length}`)
            resolve(`loaded - with counter/length: ${counter} - ${container.children.length}`)
        } else {
            counter++
            if (counter > 25) {
                reject('failed')
            } else {
                const time = Math.random() * 100 + 1000

                setTimeout(() => {
                    isResolved(resolve, reject, selectorId, counter, length)
                }, time)
            }
        }
        return true
    },
    getResource (selector, startCount, childrenLength) {
        return new Promise((resolve, reject) => {
            this.isResolved(resolve, reject, selector, startCount, childrenLength)
        }).catch(rejected => {
            fail(`The ${selector} Page did not load within limited time: ${rejected}`)
        }).then(resolved => {
            return resolved
        })
    },
    // Per Stack Overflow - Fire a click event in raw javascript
    /* global extend:true */
    fireEvent (...args) {
        var eventType = null
        var i
        var j
        var k
        var l
        var event

        var einstellungen = {
            'pointerX': 0,
            'pointerY': 0,
            'button': 0,
            'ctrlKey': false,
            'altKey': false,
            'shiftKey': false,
            'metaKey': false,
            'bubbles': true,
            'cancelable': true
        }

        var moeglicheEvents = [
            ['HTMLEvents', ['load', 'unload', 'abort', 'error', 'select', 'change', 'submit', 'reset', 'focus', 'blur', 'resize', 'scroll']],
            ['MouseEvents', ['click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mousemove', 'mouseout']]
        ]

        for (i = 0, j = moeglicheEvents.length; i < j; ++i) {
            for (k = 0, l = moeglicheEvents[i][1].length; k < l; ++k) {
                if (args[1] === moeglicheEvents[i][1][k]) {
                    eventType = moeglicheEvents[i][0]
                    i = j
                    k = l
                }
            }
        }

        if (args.length > 2) {
            if ((typeof args[2]) === 'object') {
                this.change(einstellungen, args[2])
            }
        }

        if (eventType === null) {
            throw new SyntaxError(`Event type ${args[1]} is not implemented!`)
        }

        if (document.createEvent) {
            event = document.createEvent(eventType)
            if (eventType === 'HTMLEvents') {
                event.initEvent(args[1], einstellungen.bubbles, einstellungen.cancalable)
            } else {
                event.initMouseEvent(args[1], einstellungen.bubbles, einstellungen.cancelable, document.defaultView,
                    einstellungen.button, einstellungen.pointerX, einstellungen.pointerY, einstellungen.pointerX, einstellungen.pointerY,
                    einstellungen.ctrlKey, einstellungen.altKey, einstellungen.shiftKey, einstellungen.metaKey, einstellungen.button, args[0])
            }

            args[0].dispatchEvent(event)
        } else {
            einstellungen.clientX = einstellungen.pointerX
            einstellungen.clientY = einstellungen.pointerY
            event = document.createEventObject()
            event = extend(event, einstellungen)
            args[0].fireEvent(`on${args[1]}`, event)
        }
    },
    change: function change () {
        var name
        for (name in arguments[1]) {
            if ((typeof arguments[1][name]) === 'object') {
                if ((typeof arguments[0][name]) === 'undefined') {
                    arguments[0][name] = {}
                }

                change(arguments[0][name], arguments[1][name])
            } else {
                arguments[0][name] = arguments[1][name]
            }
        }

        return arguments[0]
    }
    /* develblock:end */
}
