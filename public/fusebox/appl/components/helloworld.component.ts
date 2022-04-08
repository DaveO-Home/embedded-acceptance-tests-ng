import { Component, OnInit } from "@angular/core";
import Setup from "js/setup";
import Start from "js/start";

@Component({
  templateUrl: "views/hello.world.html",
  styleUrls: ["css/hello.world.css"]
})
export class HelloWorldComponent implements OnInit  {
  title = "Acceptance Testing with Angular13";
  ngOnInit() {
    Setup.init();
    Start.initMenu();
    Start.index();
  }
}
