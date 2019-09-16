import { Component } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import "rxjs/add/operator/map";
import { StartService } from "starts";

@Component({
  template: "<span [innerHTML]=\"htmldata\"></span>",
})
export class StartComponent {
  public starts: StartService;
  public htmldata = "Loading Index Page...";

  constructor(starts: StartService, sanitizer: DomSanitizer) {
    this.starts = starts;
    this.starts.getHtml(this).then(function (data) {
      data.obj.htmldata = sanitizer.bypassSecurityTrustHtml(data.response);
    });
  }

  ngOnInit(): void { 
    //
  }
}
