
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { HelloWorldComponent } from './helloworld.component';
import { RouterTestingModule } from '@angular/router/testing';


describe('Test Welcome Router', () => {
  let fixture: ComponentFixture<HelloWorldComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(
          [{ path: 'welcome', component: HelloWorldComponent }]
        )
      ]
    });
    fixture = TestBed.createComponent(HelloWorldComponent);
  }));

  it('should create the welcome app', () => {
    const fixture = TestBed.createComponent(HelloWorldComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should navigate', () => {
    let component = fixture.componentInstance;
    let navigateSpy = spyOn((<any>component).router, 'navigate');
    component.gotoWelcome();
    expect(navigateSpy).toHaveBeenCalledWith('/welcome');
  });
});
