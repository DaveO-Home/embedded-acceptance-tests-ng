import { Component, ViewEncapsulation, ViewChild, OnInit } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import ToolsSM from "../js/utils/tools.sm";
import { TableService } from "../services/table.service";
import Table from "../js/controller/table";
import Helpers from "../js/utils/helpers";
import App from "../js/app";
import "../css/table.css";

declare const $: JQueryStatic;

const dropdown =
    `<h4 class="center">
Tools Count - <span class='tools-state'>{{getMessage()}} (using Redux)</span>
</h4>
<section>
<div id="dropdown1" class="app-dropdown pull-left">
			<button class="dropdown-toggle smallerfont" 
			type="button"
			id="dropdown0"
			data-bs-toggle="dropdown"
			aria-haspopup="true"
			aria-expanded="false">
	  Select Tools Type
	</button>
	<div class="dropdown-menu pointer" aria-labelledby="dropdown0">
	  <a class="dropdown-item smallerfont pointer" (click)="onCompletedClick($event)">Combined</a>
	  <a class="dropdown-item smallerfont pointer" (click)="onCompletedClick($event)">Category1</a>
	  <a class="dropdown-item smallerfont pointer" (click)="onCompletedClick($event)">Category2</a>
	</div>
  </div>
  </section>`;

@Component({
    selector: "app-dropdown",
    template: dropdown
})
export class ToolsSelectComponent {
    public state: {
        items: []
    };
    public message = "Combined";

    constructor() {
        this.state = {
            items: []
        };
    }

    getMessage() {
        const items = ToolsSM.getStore().getState().tools.items;
        let index = -1;
        items.forEach((item, _index) => {
            if (item.displayed) {
                index = _index;
            }
        });
        if (index !== -1) {
            this.message = items[index].message;
        }
        else {
            ToolsSM.addCategory(this.message);
        }
        return this.message;
    }

    onCompletedClick(e) {
        e.preventDefault();
        const controller = App.controllers["Table"];

        const dropdownValue = e.target.text.trim();
        // const store = ToolsSM.getStore();
        const found = ToolsSM.findEntry(dropdownValue); // , store.getState().tools.items)

        controller.dropdownEvent(e); // Load table with selected data
        if (found.idx === -1) {
            ToolsSM.addCategory(dropdownValue);
        } else {
            ToolsSM.replaceCategory(found.idx);
        }

        $("#dropdown1 a svg").each(function () { this.remove(); });
    }
}

@Component({
    encapsulation: ViewEncapsulation.None,
    template: "<app-dropdown></app-dropdown><span id=\"data\" [innerHTML]=\"htmldata\"></span>",
    // styleUrls: ['../css/table.css'],
})
export class ToolsComponent implements OnInit {
    public tables;
    public htmldata = "Loading tools....";

    @ViewChild(ToolsSelectComponent, {static: false}) dropdown: ToolsSelectComponent;

    constructor(tableservice: TableService, sanitizer: DomSanitizer) {
        ToolsSM.toolsStateManagement();
        this.tables = tableservice;
        this.tables.getHtml(this).then(function (data) {
            data.obj.htmldata = sanitizer.bypassSecurityTrustHtml(data.response);
            
            $(function () {
                Table.decorateTable("tools");
                Helpers.scrollTop();
                if (App.controllers["Start"]) {
                    App.controllers["Start"].initMenu();
                }              
                setTimeout(function() {    
                    $("#tools").removeClass("hide");
                }, 0);
            });
        });
    }

    ngOnInit(): void {
        $("#top-nav").removeAttr("hidden");
        $("#side-nav").removeAttr("hidden"); 
    }
}
