import Start from 'js/start'
import Setup from 'js/setup'
import Helpers from 'js/helpers'

declare var Promise: any;

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
