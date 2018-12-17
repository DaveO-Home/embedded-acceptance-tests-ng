import { Component } from '@angular/core';
import 'rxjs/add/operator/map';
import App from 'app'
// Setting up for optional Karma/Jasmine
import 'setglobals'
App.init()
const url = 'views/prod/Test.pdf'
declare var $: any;

@Component({
  template: `<iframe id="data" name="pdfDO" src="${url}" class="col-lg-12" style="height: 750px"></iframe>`,
})
export class PdfComponent {
  constructor() {
  }

  ngOnInit() {
    $('#top-nav').removeAttr('hidden')
    $('#side-nav').removeAttr('hidden')
  }
}
