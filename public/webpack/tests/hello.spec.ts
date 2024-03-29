// import { DebugElement } from "@angular/core";
import { waitForAsync, ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { HelloComponent } from "./hello";

describe("Example HelloComponent", () => {

    let fixture: ComponentFixture<HelloComponent>;

    beforeEach(waitForAsync(() => {
        fixture = TestBed.createComponent(HelloComponent);
    }));

    it("should display original title", () => {
        let debugElement = fixture.debugElement.query(By.css("h1"));
        fixture.detectChanges();

        expect(debugElement.nativeElement.textContent).toEqual("Hello :)");
    });

    it("should display a different test title", () => {
        let debugElement = fixture.debugElement.query(By.css("h1"));

        fixture.componentInstance.title = "Test Title";
        fixture.detectChanges();

        expect(debugElement.nativeElement.textContent).toEqual("Test Title");
    });
});
