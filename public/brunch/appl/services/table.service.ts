const Helpers = require('../js/utils/helpers')
const App = require('../js/app')
const Table = require('../js/controller/table')

declare var Promise: any;

export class TableService {
  getHtml(obj): Promise<{ response, obj }> {
    const controllerName = 'Table'
    const actionName = 'tools'
    const failMsg = `Load problem with: '${controllerName}/${actionName}'.`
    App.loadController(controllerName, Table, controller => {
      if (controller &&
        controller[actionName]) {
        controller[actionName]({})
      } else {
        console.error(failMsg)
      }
    }, err => {
      console.error(`${failMsg} - ${err}`)
    })

    return new Promise(function (resolve, reject) {
      let count = 0
      Helpers.isLoaded(resolve, reject, '', Table, count, 10)
    })
      .catch(function (rejected) {
        console.warn('Failed', rejected)
      })
      .then(function (resolved) {
        return { "response": resolved, "obj": obj }
      })
  }
}
