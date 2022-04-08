import { Component, OnInit } from "@angular/core";
import App from "js/app";
import Setup from "js/setup";

declare const $: JQueryStatic;

@Component({
    templateUrl: "views/prod/contact.html"
})
export class ContactComponent implements OnInit  {
    constructor() {
        Setup.init();
    }

    ngOnInit() {
        const controllerName = "Start";
        const actionName = "init";
        const failMsg = `Load problem with: '${controllerName}/${actionName}'.`;
        $(function () {
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
