import { Component } from "@angular/core";
// import { map } from "rxjs/operators";
import App from "../js/app";
import Setup from "../js/utils/setup";

declare let $: JQueryStatic;

@Component({
    templateUrl: "views/prod/contact.html"
})
export class ContactComponent {
    constructor() {
        Setup.init();
    }

    ngOnInit() {
        const controllerName = "Start";
        const actionName = "init";
        const failMsg = `Load problem with: '${controllerName}/${actionName}'.`;
        $(document).ready(function () {
            const el = $($("[name=contact]")[0]);
            App.loadController(controllerName, {}, controller => {
                if (controller &&
                    controller[actionName]) {
                    controller.initMenu();
                    controller.contactListener(el, controller);
                } else {
                    console.error(failMsg);
                }
            }, err => {
                console.error(`${failMsg} - ${err}`);
            });
        });
    }
}
