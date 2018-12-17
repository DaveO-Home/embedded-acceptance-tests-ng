import { NgModule } from '@angular/core';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { RouterModule, Routes, Router } from '@angular/router';
import 'rxjs/add/operator/map';
import { StartComponent } from 'startc';
import { ContactComponent } from 'contactc'
import { PdfComponent } from 'pdfc'
import { ToolsComponent, ToolsSelect } from 'toolsc'
import { HelloWorldComponent } from 'helloc'
import { StartService } from 'starts';
import { TableService } from 'tables';

const appRoutes: Routes = [
  { path: '', component: StartComponent },
  { path: '#/', component: StartComponent },
  { path: '#', component: StartComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'pdf/test', component: PdfComponent },
  { path: 'table/tools', component: ToolsComponent },
  { path: 'welcome', component: HelloWorldComponent }
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
