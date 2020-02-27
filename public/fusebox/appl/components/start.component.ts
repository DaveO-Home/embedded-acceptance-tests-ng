import { Component } from '@angular/core';
import 'rxjs/add/operator/map';
import { StartService } from '../services/start.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  template: '<span [innerHTML]="htmldata"></span>',
})
export class StartComponent {
  public starts: StartService;
  public htmldata: String = 'Loading Index Page...';
  public sanitizer: DomSanitizer;

  constructor(sanitizer: DomSanitizer, starts: StartService) {
    this.sanitizer = sanitizer;
    this.starts = starts;
  }
  /*
    Please note; to minimize code differences among the the demo-ed frameworks
    (canjs, react, vue, angular), this code does not use the angular http module.
    The proper design would be to use something like this; 
      import {Http, Headers, HTTP_PROVIDERS, URLSearchParams} from '@angular/http';
    with perhaps the Observable module.
  */
  ngOnInit(): Promise<void> {
    return this.starts.getHtml(this).then(function(data: any) {
      data.obj.htmldata = data.obj.sanitizer.bypassSecurityTrustHtml(data.response);
    });
   }
}
