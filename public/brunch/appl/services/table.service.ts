const Helpers = require("../js/utils/helpers");
const App = require("../js/app");
const Table = require("../js/controller/table");

declare let Promise: any;

export class TableService {
  getHtml(obj: object): Promise<object> {
    const controllerName = "Table";
    const actionName = "tools";
    const failMsg = `Load problem with: '${controllerName}/${actionName}'.`;
    App.loadController(controllerName, Table, controller => {
      if (controller &&
        controller[actionName]) {
        controller[actionName]({});
      } else {
        console.error(failMsg);
      }
    }, (err: any) => {
      console.error(`${failMsg} - ${err}`);
    });

    return new Promise(function (resolve: any, reject: any) {
      const count = 0;
      Helpers.isLoaded(resolve, reject, "", Table, count, 10);
    }).then(function (resolved) {
        return { "response": resolved, "obj": obj };
      }).catch(function (rejected) {
        console.warn("Failed", rejected);
      });
  }
}
