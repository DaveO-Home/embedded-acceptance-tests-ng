import { Component } from '@angular/core';
import 'rxjs/add/operator/map';
import App from 'app'
import Setup from 'setup'

declare var $: any;

@Component({
    templateUrl: "views/prod/contact.html"
})
export class ContactComponent {
    constructor() {
        Setup.init();
    }

    ngOnInit() {
        const controllerName = 'Start'
        const actionName = 'init'
        const failMsg = `Load problem with: '${controllerName}/${actionName}'.`
        $(document).ready(function () {
            const el = $($('[name=contact]')[0])
            App.loadController(controllerName, {}, (controller: any) => {
                if (controller &&
                    controller[actionName]) {
                    controller.initMenu()
                    controller.contactListener(el, controller)
                } else {
                    console.error(failMsg)
                }
            }, (err: any) => {
                console.error(`${failMsg} - ${err}`)
            })
        })
    }
}
