// import './js/utils/set.globals.js'
import { NgModule, Component } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import 'rxjs-compat/add/operator/map';
import { AppRoutingModule } from './router'
// import Start from './js/controller/start'
const Start = require('./js/controller/start')

@Component({
	selector: 'test-app',
	templateUrl: './app_bootstrap.html'
})
export class TestApp {
	constructor() {
	}
	loginModal(event) {
		Start['div .login click']()
	}
}

@NgModule({
	imports: [
		BrowserModule,
		AppRoutingModule,
	],
	declarations: [
		TestApp,
	],
	bootstrap: [TestApp],
})
export class AppModule {
}
