
'use strict'

function StripCanjsLoader (content, startComment, endComment) {
    var regexPattern = new RegExp('[\\t ]*(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)' + startComment +
            ' ?[\\*\\/]?[\\s\\S]*?(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)' + endComment + ' ?(\\*\\/)?[\\t ]*\\n?', 'g')

    content = content.replace(regexPattern, '')

    return content
}

var content4 = '/* develblock:start */ \n' +
                'var some-code\n' +
                '/* develblock:end */\n' +
                'var prod-code1 = 0;'

var content5 = '\n/* develblock:start */\n' +
                'var some-code2\n' +
                '/* develblock:end */\n' +
                'var prod-code2 = 0;'

var content6 = '\n\t\t      /* develblock:start */\n' +
                'var some-code3\n' +
                '\t\t  /* develblock:end */\n' +
                'var prod-code3 = 0;'

describe('Unit Tests - Suite 3', function () {
    var strippedCode = StripCanjsLoader(content4 + content5 + content6, 'develblock:start', 'develblock:end')

    it('Strip Webpack Block Code', function () {
        expect(strippedCode.indexOf('develblock') === -1).toBeTruthy()
        expect(strippedCode.indexOf('some-code') === -1).toBeTruthy()
        expect(strippedCode.indexOf('code1') > -1).toBeTruthy()
        expect(strippedCode.indexOf('code2') > -1).toBeTruthy()
        expect(strippedCode.indexOf('code3') > -1).toBeTruthy()
    })
})
