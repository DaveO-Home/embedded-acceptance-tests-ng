import { NgModule } from '@angular/core';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { RouterModule, Routes, Router } from '@angular/router';
import 'rxjs/add/operator/map';
import { StartComponent } from '../components/start.component';
import { ContactComponent } from '../components/contact.component'
import { PdfComponent } from '../components/pdf.component'
import { ToolsComponent, ToolsSelect } from '../components/tools.component'
import { HelloWorldComponent } from '../components/helloworld.component'
import { StartService } from '../services/start.service';
import { TableService } from '../services/table.service';

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
