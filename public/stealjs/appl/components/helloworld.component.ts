import { Component } from '@angular/core';
import Setup from '../js/utils/setup'
import Start from '../js/controller/start'

@Component({
  templateUrl: 'views/hello.world.html',
  styleUrls: ['css/hello.world.css']
})
export class HelloWorldComponent {
  title = 'Acceptance Testing with Angular';
  ngOnInit() { // required if page is refreshed
    Setup.init()
    Start.initMenu()
    Start.index()
  }
}
