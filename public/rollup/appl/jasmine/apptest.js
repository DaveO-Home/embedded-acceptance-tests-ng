import domTest from "domtest";
import toolsTest from "toolstest";
import contactTest from "contacttest";
import loginTest from "logintest";
import dodexTest from "./dodextest";
import inputTest from "./inputtest";
import Start from "../js/controller/start";
import Helpers from "../js/utils/helpers";
import dodex from "dodex";
import input from "dodex-input";
import mess from "dodex-mess";

export default function (App, AppModule, platformBrowserDynamic) {
    describe("Application Unit test suite - AppTest", () => {
        beforeAll(() => {
            // Add angular tag to karma page
            $("body").append(layout());
            platformBrowserDynamic().bootstrapModule(AppModule)
                .catch(err => console.error(err));

            spyOn(App, "loadView").and.callThrough();
            spyOn(Helpers, "isLoaded").and.callThrough();
        }, 3000);

        afterEach(() => {
            $(document.querySelector("ng-component")).empty();
        });

        afterAll(() => {
            $(document.querySelector("ng-component")).remove();
            $(document.querySelector("#layout")).remove();
        });

        it("Is Default Page Loaded(Start)", (done) => {
            /*
             * Start page loads by default. 
             */
            Helpers.getResource("ng-component span", 0, 3)
            .catch(rejected => {
                fail(`The Start Page did not load within limited time: ${rejected}`);
            }).then(resolved => {
                expect(App.loadView).toHaveBeenCalled();
                expect(Helpers.isLoaded.calls.count()).toEqual(1);
                expect(App.controllers["Start"]).not.toBeUndefined();
                expect(document.querySelector("ng-component span").children.length > 3).toBe(true);

                domTest("index");
                done();
            });
        });

        it("Is Tools Table Loaded", (done) => {
            /*
             * Using hash to load page, angular router is accessed from components!
             */
            location.hash = "/table/tools";

            Helpers.getResource("ng-component", 0, 1)
            .catch(rejected => {
                fail(`The Tools Page did not load within limited time: ${rejected}`);
            }).then(resolved => {
                expect(App.controllers["Table"]).not.toBeUndefined();
                const toolsEle = document.querySelector("ng-component");
                expect(toolsEle.querySelector("[class~=\"tablesorter\"]").children.length > 3).toBe(true);

                domTest("tools");
                done();
            });
        });

        it("Re-load Start Page", (done) => {
            location.hash = "";

            Helpers.getResource("ng-component span", 0, 1)
            .catch(rejected => {
                fail(`The Start Page did not load within limited time: ${rejected}`);
            }).then(resolved => {
                expect(App.loadView).toHaveBeenCalled();
                expect(Helpers.isLoaded.calls.count()).toEqual(3);
                expect(App.controllers["Start"]).not.toBeUndefined();
                expect(document.querySelector("ng-component span").children.length > 3).toBe(true);

                domTest("index");
                done();
            });
        });

        it("Is Pdf Loaded", (done) => {
            location.hash = "/pdf/test";

            Helpers.getResource("ng-component", 0, 0)
            .catch(rejected => {
                fail(`The Pdf Page did not load within limited time: ${rejected}`);
            }).then(resolved => {
                const componentTag = document.querySelector("ng-component");
                expect(componentTag.querySelector("[name=\"pdfDO\"]")).toBeDefined();

                domTest("pdf", document);
                done();
            });
        });

        it("Is Angular Welcome Loaded", (done) => {
            location.hash = "/welcome";

            Helpers.getResource("ng-component", 0, 2)
            .catch(rejected => {
                fail(`The Welcome Page did not load within limited time: ${rejected}`);
            }).then(resolved => {
                const componentTag = document.querySelector("ng-component");
                expect(componentTag.querySelector("div > h1").textContent.indexOf("Welcome") === 1).toBe(true);

                domTest("welcome", document);
                done();
            });
        });

        // Spec to test if page data changes on select change event.
        toolsTest(Helpers);
        // Form Validation
        contactTest(Helpers);
        // Verify modal form
        loginTest(Start);
        //Test dodex
        dodexTest(dodex, input, mess, getAdditionalContent(), Start);
        //Test dodex input
        inputTest(dodex, input, mess, getAdditionalContent(), Start);
        
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 4000;
        __karma__.start();

        if (testOnly) {
            it("Testing only", () => {
                fail("Testing only, build will not proceed");
            });
        }
    });
}

function getAdditionalContent() {
    return {
        cards: {
            card28: {
                tab: "F01999", //Only first 3 characters will show on the tab.
                front: {
                    content: `<h1 style="font-size: 10px;">Friends</h1>
					<address style="width:385px">
						<strong>Charlie Brown</strong> 	111 Ace Ave. Pet Town
						<abbr title="phone"> : </abbr>555 555-1212<br>
						<abbr title="email" class="mr-1"></abbr><a href="mailto:cbrown@pets.com">cbrown@pets.com</a>
					</address>
					`
                },
                back: {
                    content: `<h1 style="font-size: 10px;">More Friends</h1>
					<address style="width:385px">
						<strong>Lucy</strong> 113 Ace Ave. Pet Town
						<abbr title="phone"> : </abbr>555 555-1255<br>
						<abbr title="email" class="mr-1"></abbr><a href="mailto:lucy@pets.com">lucy@pets.com</a>
					</address>
					`
                }
            },
            card29: {
                tab: "F02",
                front: {
                    content: "<h1 style=\"font-size: 14px;\">My New Card Front</h1>"
                },
                back: {
                    content: "<h1 style=\"font-size: 14px;\">My New Card Back</h1>"
                }
            }
        }
    };
}

function layout() {
    const layout = `<span id="layout"><nav id="top-nav" class="navbar navbar-expand-sm navbar-light fixed-top rounded nav-bar-bg">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">Test</a>
      <ul class="navbar-nav me-auto mb-md-0">
        <div class="nav-item">
          <div class="dodex--open">
            <img src="../images/dodex_g.ico">
          </div>
        </div>
      </ul>
      <test-login></test-login>
    </div>
  </nav>
  <main class="container-fluid pb-1 flex-grow-1 d-flex flex-column flex-sm-row overflow-auto">
    <div class="row flex-grow-sm-1 flex-grow-0 w-100">
      <div class="col-sm-2 flex-grow-sm-1 flex-shrink-1 flex-grow-0 pb-sm-0 pb-3">
        <div class="bg-light border rounded-3 p-1 h-100">
          <h6 class="d-none d-sm-block text-muted">Views</h6>
          <ul class="nav nav-pills flex-sm-column flex-row mb-auto justify-content-between text-truncate">
            <test-app></test-app>
          </ul>
        </div>
      </div>
      <div class="col-sm overflow-auto h-100">
        <div class="page-bg border rounded-3 p-3">
          <div id="container"></div>
          <div id="main_container">
            <div class="loading-page"></div>
            <span>
              <test-content></test-content>
            </span>
          </div>
        </div>
      </div>
    </div>
  </main>
  <test-footer></test-footer></span>`
  return layout;
}
