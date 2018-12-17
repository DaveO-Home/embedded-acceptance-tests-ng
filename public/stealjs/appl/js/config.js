import 'css'
//!steal-remove-start
import steal from "@steal"
import App from 'app'
//!steal-remove-end
/*
 * Startup live-reload in another window first - gulp hmr
 */
//!steal-remove-start
steal.import("live-reload").then(reload => {
    // Only use outside of Karma
    if (typeof testit === "undefined" || !testit) {
        reload("*", function () {
            App.controllers = []
        })
    }
}).catch(failed => {
    fail(`The Welcome Page did not load within limited time: ${failed}`)
})
//!steal-remove-end
