import { Component } from "@angular/core";
import Setup from "js/setup";
import Start from "js/start";

@Component({
  templateUrl: "views/hello.world.html",
  styleUrls: ["css/hello.world.css"]
})
export class HelloWorldComponent {
  title = "Acceptance Testing with Angular8";
  ngOnInit() {
    Setup.init();
    Start.initMenu();
    Start.index();
  }
}
