/* Note; this is being handled in  the PdfC component */

var App = require('../app')
var Base = require('../utils/base.control')

Base.init()
module.exports = App.controllers.Pdf || (App.controllers.Pdf = Object.assign({
    name: 'pdf',
    finish (options) {
        $('#pdfDO').attr('src', options.pdfUrl)
    },
    test (options) {
        var pdfUrl = 'views/prod/Test.pdf'
        if (window.testit) {
            this.baseUrl = `base/${window._bundler}/appl/`
        }

        this.view({
            local_content: '<iframe id="pdfDO" name="pdfDO" class="col-lg-12" style="height: 750px"></iframe>',
            pdfUrl: this.baseUrl + pdfUrl,
            controller: options.controller
        })
    }
}, Base))
