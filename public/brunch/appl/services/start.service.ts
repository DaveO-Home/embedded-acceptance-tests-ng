declare let Promise: any;

const Setup = require("../js/utils/setup");
const Helpers = require("../js/utils/helpers");
const Start = require("../js/controller/start");

export class StartService {
  getHtml(obj: object): Promise<{response: string; obj: object}> {   
    Setup.init();
    Start.initMenu();
    Start.index();

    return new Promise(function (resolve, reject) {
      const count = 0;
      Helpers.isLoaded(resolve, reject, "", Start, count, 10);
    }).then(function (resolved: string) {
        return {"response": resolved, "obj": obj};
      }).catch(function (rejected) {
        console.warn("Failed", rejected);
      });
  }
}
