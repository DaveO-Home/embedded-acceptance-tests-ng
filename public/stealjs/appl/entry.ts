import 'setglobals'
import { NgModule, Component } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import 'rxjs/add/operator/map';
import { AppRoutingModule } from 'router'
import Start from 'start'

@Component({
	selector: 'test-app',
	templateUrl: 'app_bootstrap.html'
})
export class TestApp {
	constructor() {
	}
	loginModal(event: any) {
		Start['div .login click']()
	}
}

@NgModule({
	imports: [
		BrowserModule,
		AppRoutingModule
	],
	declarations: [
		TestApp
	],
	bootstrap: [TestApp],
})
export class AppModule {
}
