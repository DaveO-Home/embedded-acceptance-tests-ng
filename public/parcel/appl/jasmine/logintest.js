export default function (Start, timer) {
    /*
     * Test Form validation and submission.
     */
    describe("Popup Login Form", () => {
        let modal
        let closeButton
        let nameObject

        beforeAll(done => {
            Start.initMenu()
            Start["div .login click"]()
            const loginObject = $("div .login")
            loginObject.click()

            // Note: if page does not refresh, increase the timer time.
            // Using RxJs instead of Promise.
            const numbers = timer(50, 50);
            const observable = numbers.subscribe(timer => {
                modal = $("#modalTemplate");
                if ((typeof modal[0] !== "undefined" && modal[0].length !== 0) || timer === 20) {
                    nameObject = $("#inputUsername");
                    modal.on("shown.bs.modal", function (html) {
                        modal.modal("toggle");
                    });
                    observable.unsubscribe();
                    done();
                }
            })
        })

        it("Login form - verify modal with login loaded", function (done) {
            expect(modal[0]).toBeInDOM()
            expect(nameObject[0]).toExist()

            closeButton = $(".close-modal")
            done()
        })

        it("Login form - verify cancel and removed from DOM", function (done) {
            expect(modal[0]).toExist()
            closeButton.click()

            const numbers = timer(50, 50);
            const observable = numbers.subscribe(timer => {
                const modal2 = $("#modalTemplate");
                if (typeof modal2[0] === "undefined" || timer === 25) {
                    expect(modal[0]).not.toBeVisible();
                    expect(modal[0]).not.toBeInDOM();
                    observable.unsubscribe();
                    done();
                }
            })
        })
    })
}
