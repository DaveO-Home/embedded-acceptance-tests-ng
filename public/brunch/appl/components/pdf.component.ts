import { Component } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
// import { map } from "rxjs/operators";
const App = require("../js/app");
// Setting up for optional Karma/Jasmine

App.init();

declare const $: JQueryStatic;

@Component({
  template: "<iframe id=\"data\" name=\"pdfDO\" [src]=\"url\" class=\"col-lg-12\" style=\"height: 750px\"></iframe>",
})
export class PdfComponent {
  public url;
  constructor(sanitizer: DomSanitizer) {
    this.url = sanitizer.bypassSecurityTrustResourceUrl("views/prod/Test.pdf");
  }

  ngOnInit(): void {
    $("#top-nav").removeAttr("hidden");
    $("#side-nav").removeAttr("hidden");
  }
}