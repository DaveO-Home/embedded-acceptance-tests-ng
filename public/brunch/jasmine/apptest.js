import domTest from "./domtest"
import toolsTest from "./toolstest"
import contactTest from "./contacttest"
import loginTest from "./logintest"
import Start from "../appl/js/controller/start"
import Helpers from "../appl/js/utils/helpers"
import { timer } from "rxjs"

export default function (App, AppModule, platformBrowserDynamic) {
    describe("Application Unit test suite - AppTest", () => {
        beforeAll(() => {
            // Add angular tag to karma page
            $("body").prepend("<test-app>Loading</test-app>")
            platformBrowserDynamic().bootstrapModule(AppModule)
                .catch(err => console.error(err));

            spyOn(App, "loadView").and.callThrough()
            spyOn(Helpers, "isLoaded").and.callThrough()
        }, 3000)

        afterEach(() => {
            $(document.querySelector("ng-component")).empty()
        })

        afterAll(() => {
            $(document.querySelector("ng-component")).remove()
            $(document.querySelector("test-app")).remove()
        })

        it("Is Default Page Loaded(Start)", (done) => {
            /*
             * Start page loads by default. 
             */
            Helpers.getResource("ng-component span", 0, 3)
            .catch(rejected => {
                fail(`The Start Page did not load within limited time: ${rejected}`)
            }).then(resolved => {
                expect(App.loadView).toHaveBeenCalled()
                expect(Helpers.isLoaded.calls.count()).toEqual(1)
                expect(App.controllers["Start"]).not.toBeUndefined()
                expect(document.querySelector("ng-component span").children.length > 3).toBe(true)

                domTest("index")
                done()
            })
        })

        it("Is Tools Table Loaded", (done) => {
            /*
             * Using hash to load page, angular router is accessed from components!
             */
            location.hash = "/table/tools"

            Helpers.getResource("ng-component", 0, 1)
            .catch(rejected => {
                fail(`The Tools Page did not load within limited time: ${rejected}`)
            }).then(resolved => {
                expect(App.controllers["Table"]).not.toBeUndefined()
                const toolsEle = document.querySelector("ng-component")
                expect(toolsEle.querySelector("[class~=\"tablesorter\"]").children.length > 3).toBe(true)

                domTest("tools")
                done()
            })
        })

        it("Re-load Start Page", (done) => {
            location.hash = ""

            Helpers.getResource("ng-component span", 0, 1)
            .catch(rejected => {
                fail(`The Start Page did not load within limited time: ${rejected}`)
            }).then(resolved => {
                expect(App.loadView).toHaveBeenCalled()
                expect(Helpers.isLoaded.calls.count()).toEqual(3)
                expect(App.controllers["Start"]).not.toBeUndefined()
                expect(document.querySelector("ng-component span").children.length > 3).toBe(true)

                domTest("index")
                done()
            })
        })

        it("Is Pdf Loaded", (done) => {
            location.hash = "/pdf/test"

            Helpers.getResource("ng-component", 0, 0)
            .catch(rejected => {
                fail(`The Pdf Page did not load within limited time: ${rejected}`)
            }).then(resolved => {
                const componentTag = document.querySelector("ng-component")
                expect(componentTag.querySelector("[name=\"pdfDO\"]")).toBeDefined()

                domTest("pdf", document)
                done()
            })
        })

        it("Is Angular Welcome Loaded", (done) => {
            location.hash = "/welcome"

            Helpers.getResource("ng-component", 0, 2)
            .catch(rejected => {
                fail(`The Welcome Page did not load within limited time: ${rejected}`)
            }).then(resolved => {
                const componentTag = document.querySelector("ng-component")
                expect(componentTag.querySelector("div > h1").textContent.indexOf("Welcome") === 1).toBe(true)

                domTest("welcome", document)
                done()
            })
        })

        // Spec to test if page data changes on select change event.
        toolsTest(Helpers, timer)
        // Form Validation
        contactTest(Helpers)
        // Verify modal form
        loginTest(Start, timer)

        jasmine.DEFAULT_TIMEOUT_INTERVAL = 4000;
        __karma__.start();
        
        if (testOnly) {
            it("Testing only", () => {
                fail("Testing only, build will not proceed")
            })
        }
    })
}
