import Start from "../js/controller/start";
import Setup from "../js/utils/setup";
import Helpers from "../js/utils/helpers";

declare let Promise: any;

export class StartService {
  getHtml(obj): Promise<{ response; obj }> {
    Setup.init();
    Start.initMenu();
    Start.index();

    return new Promise(function (resolve, reject) {
      const count = 0;
      Helpers.isLoaded(resolve, reject, "", Start, count, 10);
    }).then(function (resolved: string) {
      return { "response": resolved, "obj": obj };
    }).catch(function (rejected) {
      console.warn("Failed", rejected);
    });
  }
}
