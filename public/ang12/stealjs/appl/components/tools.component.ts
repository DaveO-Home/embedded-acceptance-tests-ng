import { Component, ViewEncapsulation, ViewChild, OnInit } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import "rxjs/add/operator/map";
import ToolsSM from "toolssm";
import { TableService } from "tables";
import Table from "table";
import Helpers from "helpers";
import App from "app";

declare const $: JQueryStatic;

const dropdown =
    `<h4 class="center">
Tools Count - <span class='tools-state'>{{getMessage()}} (using Redux)</span>
</h4>
<section>
<div id="dropdown1" class="dropdown pull-left">
			<button class="dropdown-toggle smallerfont" 
			type="button"
			id="dropdown0"
			data-toggle="dropdown"
			aria-haspopup="true"
			aria-expanded="false">
	  Select Tools Type
	</button>
	<div class="dropdown-menu pointer" aria-labelledby="dropdown0">
	  <a class="dropdown-item smallerfont" (click)="onCompletedClick($event)">Combined</a>
	  <a class="dropdown-item smallerfont" (click)="onCompletedClick($event)">Category1</a>
	  <a class="dropdown-item smallerfont" (click)="onCompletedClick($event)">Category2</a>
	</div>
  </div>
  </section>`;

@Component({
    selector: "dropdown",
    template: dropdown
})
export class ToolsSelect {
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
        items.forEach((item: any, _index: number) => {
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
    
    onCompletedClick(e: any) {
        e.preventDefault();
        const controller = App.controllers["Table"];

        const dropdownValue = e.target.text.trim();
        // const store = ToolsSM.getStore();
        const found = ToolsSM.findEntry(dropdownValue); // , store.getState().tools.items);
        
        controller.dropdownEvent(e); // Load table with selected data
        if (found.idx === -1) {
            ToolsSM.addCategory(dropdownValue);
        } else {
            ToolsSM.replaceCategory(found.idx);
        }

        $("#dropdown1 a i").each(function () { this.remove(); });
        $(e.target).fa({ icon: "check" });
    }
}

@Component({
    encapsulation: ViewEncapsulation.None,
    template: "<dropdown></dropdown><span id=\"data\" [innerHTML]=\"htmldata\"></span>",
    styleUrls: ["../css/table.css"],
})
export class ToolsComponent implements OnInit {
    public tables: TableService;
    public htmldata = "Loading tools....";

    @ViewChild(ToolsSelect, {static: false}) dropdown: ToolsSelect;

    constructor(tableservice: TableService, sanitizer: DomSanitizer) {
        ToolsSM.toolsStateManagement();
        this.tables = tableservice;
        this.tables.getHtml(this).then(function (data) {
            data.obj.htmldata = sanitizer.bypassSecurityTrustHtml(data.response);
            $(function () {
                Helpers.scrollTop();
                if (App.controllers["Start"]) {
                    App.controllers["Start"].initMenu();
                }
                $("#top-nav").removeAttr("hidden");
                $("#side-nav").removeAttr("hidden");               
                Table.decorateTable("tools");
                setTimeout(function() {    
                    $("#tools").removeClass("hide");
                }, 0);
            });
        });
    }

    ngOnInit(): void {
        //
    }
}
