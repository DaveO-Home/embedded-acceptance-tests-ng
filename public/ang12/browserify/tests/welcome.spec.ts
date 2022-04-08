import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HelloWorldComponent } from './helloworld.component'

describe('Test Welcome Router', () => {
    let fixture: ComponentFixture<HelloWorldComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                HelloWorldComponent,
            ],
            imports: [
                RouterTestingModule.withRoutes([{ path: 'welcome', component: HelloWorldComponent }]),
            ],
        }).compileComponents().then(() => {
            fixture = TestBed.createComponent(HelloWorldComponent);
        });
    }));

    it('should navigate', () => {
        let component = fixture.componentInstance;
        let navigateSpy = spyOn((<any>component).router, 'navigate');
        component.gotoWelcome();
        expect(navigateSpy).toHaveBeenCalledWith('/welcome');
    });
});
