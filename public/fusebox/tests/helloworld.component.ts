import { Component } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  template: '<h1 class="h1">{{title}}</h1>'
})
export class HelloWorldComponent {
  title = 'Acceptance Testing with Angular12';
  router: any
  
  constructor(router: Router) {
    this.router = router;
  }
  
  gotoWelcome() {
    this.router.navigate('/welcome')
  }
}
