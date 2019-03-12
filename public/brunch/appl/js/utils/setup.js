
var handlebars = require('handlebars')
var Menu = require('./menu')
window.Stache = handlebars

module.exports = {
    init () {
        // Show the page
        $('#top-nav').removeAttr('hidden')
        $('#side-nav').removeAttr('hidden')
        Menu.activate('#top-nav div ul li')
        Menu.activate('#side-nav nav ul li')
    }
}
