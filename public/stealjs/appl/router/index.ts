import { NgModule } from "@angular/core";
import { LocationStrategy, HashLocationStrategy } from "@angular/common";
import { RouterModule, Routes, Router } from "@angular/router";
import "rxjs/add/operator/map";
import { StartComponent } from "startc";
import { ContactComponent } from "contactc";
import { PdfComponent } from "pdfc";
import { ToolsComponent, ToolsSelect } from "toolsc";
import { HelloWorldComponent } from "helloc";
import { StartService } from "starts";
import { TableService } from "tables";

const appRoutes: Routes = [
  { path: "", component: StartComponent },
  { path: "#/", component: StartComponent },
  { path: "#", component: StartComponent },
  { path: "contact", component: ContactComponent },
  { path: "pdf/test", component: PdfComponent },
  { path: "table/tools", component: ToolsComponent },
  { path: "welcome", component: HelloWorldComponent },
  { path: "close", redirectTo: "#close" },
  { path: "dodexInput", redirectTo: "#dodexInput" },
  { path: "commHandle", redirectTo: "#commHandle" },
  { path: "closeHandle", redirectTo: "#closeHandle" },
  { path: "dodexComm", redirectTo: "#dodexComm" },
  /*
    For navigating to anchors on README page.
  */
  { path: "embedded-angular2-acceptance-testing-with-karma-and-jasmine", redirectTo: "/#top" },
  { path: "production-build", redirectTo: "/#production-build" },
  { path: "test-build", redirectTo: "/#test-build" },
  { path: "development", redirectTo: "/#development" },
  { path: "i-browserify", redirectTo: "/#browserify" },
  { path: "ii-brunch", redirectTo: "/#brunch" },
  { path: "iii-fusebox", redirectTo: "/#fusebox" },
  { path: "iv-parcel", redirectTo: "/#parcel" },
  { path: "v-rollup", redirectTo: "/#rollup" },
  { path: "vi-stealjs", redirectTo: "/#steal" },
  { path: "vii-webpack", redirectTo: "/#webpack" },
  { path: "viii-dockerfile", redirectTo: "/#docker" },
  { path: "installation", redirectTo: "/#installation" }
];

@NgModule({
  declarations: [
    StartComponent,
    ContactComponent,
    PdfComponent,
    ToolsComponent,
    ToolsSelect,
    HelloWorldComponent,
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes,
      {
        enableTracing: false,
        anchorScrolling: "enabled",
        scrollPositionRestoration: "enabled",
        useHash: false
        // preloadingStrategy: SelectivePreloadingStrategyService,
      }
    )
  ],
  exports: [
    RouterModule
  ],
  providers: [
    StartService,
    TableService,
    { provide: LocationStrategy, useClass: HashLocationStrategy },
  ],
})
export class AppRoutingModule { }

export class MyRouter {
  public router: Router;
  constructor(_router: Router) {
    this.router = _router;
  }
}
