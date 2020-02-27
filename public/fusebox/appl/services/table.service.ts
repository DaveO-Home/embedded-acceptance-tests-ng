import Helpers from '../js/utils/helpers'
import App from '../js/app'
import Table from '../js/controller/table'

declare var Promise: any;

export class TableService {
  getHtml(obj: this): Promise<{ response: any, obj: any }> {
    const controllerName = 'Table'
    const actionName = 'tools'
    const failMsg = `Load problem with: '${controllerName}/${actionName}'.`
    App.loadController(controllerName, Table, (controller: { [x: string]: (arg0: {}) => void; }) => {
      if (controller &&
        controller[actionName]) {
        controller[actionName]({})
      } else {
        console.error(failMsg)
      }
    }, (err: any) => {
      console.error(`${failMsg} - ${err}`)
    })

    return new Promise(function (resolve: any, reject: any) {
      let count = 0
      Helpers.isLoaded(resolve, reject, '', Table, count, 10)
    })
      .catch(function (rejected: any) {
        console.warn('Failed', rejected)
      })
      .then(function (resolved: any) {
        return { "response": resolved, "obj": obj }
      })
  }
}
