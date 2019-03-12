declare var Promise: any;

var Setup = require('../js/utils/setup')
var Helpers = require('../js/utils/helpers')
var Start = require('../js/controller/start')

export class StartService {
  getHtml(obj):Promise<{response, obj}> {   
    Setup.init()
    Start.initMenu()
    Start.index()

    return new Promise(function (resolve, reject) {
      let count = 0
      Helpers.isLoaded(resolve, reject, '', Start, count, 10)
    })
      .catch(function (rejected) {
        console.warn('Failed', rejected)
      })
      .then(function (resolved: String) {
        return {"response": resolved, "obj": obj};
      })
  }
}
