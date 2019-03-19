import { Component } from '@angular/core';
const Setup = require('../js/utils/setup')
const Start = require('../js/controller/start')

@Component({
  templateUrl: 'views/hello.world.html',
  styleUrls: ['css/hello.world.css']
})
export class HelloWorldComponent {
  title = 'Acceptance Testing with Angular2';
  ngOnInit() {
    Setup.init()
    Start.initMenu()
    Start.index()
  }
}