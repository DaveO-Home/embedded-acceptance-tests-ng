import Start from "start";
import Setup from "setup";
import Helpers from "helpers";

declare let Promise: any;

export class StartService {
  getHtml(obj: any): Promise<{response: string; obj: any}> {
    Setup.init();
    Start.initMenu();
    Start.index();

    return new Promise(function (resolve: any, reject: any) {
      const count = 0;
      Helpers.isLoaded(resolve, reject, "", Start, count, 10);
    })
      .catch(function (rejected: any) {
        console.warn("Failed", rejected);
      })
      .then(function (resolved: string) {
        return {"response": resolved, "obj": obj};
      });
  }
}
