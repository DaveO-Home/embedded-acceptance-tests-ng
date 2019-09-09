import { Component, ViewEncapsulation, ViewChild, OnInit } from '@angular/core';
import 'rxjs/operator/map';
import ToolsSM from 'js/tools.sm'
import { TableService } from 'ts/table.service';
import Table from 'js/table'
import Helpers from 'js/helpers'
import App from 'js/app'

declare var $: any;

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
  </section>`

@Component({
    selector: "dropdown",
    template: dropdown
})
export class ToolsSelect {
    public state: {};
    public message: string = "Combined";

    constructor() {
        this.state = {
            items: []
        }
    }

    getMessage() {
        const items = ToolsSM.getStore().getState().tools.items
        let index = -1
        items.forEach((item, _index) => {
            if (item.displayed) {
                index = _index
            }
        })
        if (index !== -1) {
            this.message = items[index].message
        }
        else {
            ToolsSM.addCategory(this.message);
        }
        return this.message;
    }
    
    onCompletedClick(e) {
        let dropdownValue;
        e.preventDefault();
        const controller = App.controllers['Table']

        dropdownValue = e.target.text.trim();
        let store = ToolsSM.getStore()
        const found = ToolsSM.findEntry(dropdownValue, store.getState().tools.items)
        
        controller.dropdownEvent(e) // Load table with selected data
        if (found.idx === -1) {
            ToolsSM.addCategory(dropdownValue);
        } else {
            ToolsSM.replaceCategory(found.idx);
        }

        $('#dropdown1 a i').each(function () { this.remove() })
        $(e.target).fa({ icon: 'check' })
    }
}

@Component({
    encapsulation: ViewEncapsulation.None,
    template: '<dropdown></dropdown><span id="data"></span>',
    styleUrls: ['css/table.css'],
})
export class ToolsComponent implements OnInit {
    public tables;

    @ViewChild(ToolsSelect, {static: false}) dropdown: ToolsSelect;

    constructor(tableservice: TableService) {
        ToolsSM.toolsStateManagement()
        this.tables = tableservice;
    }

    ngOnInit(): Promise<void> {
        return this.tables.getHtml(this).then(function (data) {
			/*
				By-passing angular sanitizing since it removes too much from template &
				minimum checking for possible injection.
			*/
            const scriptCount = (data.response.match(/script/gi) || []).length;
            const columnCount = (data.response.match(/th class/gi) || []).length;
            const jsCount = (data.response.match(/javascript/gi) || []).length;
            if (scriptCount === 0 && columnCount > 0 && jsCount === 0) {
                $(document).ready(function () {
                    $('#data').html(data.response);
                    Helpers.scrollTop()
                    if (App.controllers['Start']) {
                        App.controllers['Start'].initMenu()
                    }
                    $('#top-nav').removeAttr('hidden')
                    $('#side-nav').removeAttr('hidden')
                    Table.decorateTable('tools')
                });
            }
        });
    }
}
