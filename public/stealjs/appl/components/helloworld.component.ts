import { Component } from "@angular/core";
import Setup from "setup";
import Start from "start";

@Component({
  templateUrl: "views/hello.world.html",
  styleUrls: ["css/hello.world.css"]
})
export class HelloWorldComponent {
  title = "Acceptance Testing with Angular8";
  ngOnInit() { // required if page is refreshed
    Setup.init();
    Start.initMenu();
    Start.index();
  }
}
