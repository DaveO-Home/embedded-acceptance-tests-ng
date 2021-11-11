import { Component } from "@angular/core";

@Component({
    selector: "app-hello",
    // styleUrls: ["../assets/style/main.css", "../assets/style/main.less", "../assets/style/main.scss"],
    // templateUrl: "./hello.html"
    template: "<h1>{{title}}</h1>"
})
export class HelloComponent {
    public title = "Hello :)";
}
