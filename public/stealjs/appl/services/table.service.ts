import Helpers from "helpers";
import App from "app";
import Table from "table";

declare let Promise: any;

export class TableService {
  getHtml(obj: any): Promise<{ response: string; obj: any }> {
    const controllerName = "Table";
    const actionName = "tools";
    const failMsg = `Load problem with: '${controllerName}/${actionName}'.`;
    App.loadController(controllerName, Table, (controller: unknown) => {
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
    })
      .catch(function (rejected: any) {
        console.warn("Failed", rejected);
      })
      .then(function (resolved: any) {
        return { "response": resolved, "obj": obj };
      });
  }
}
