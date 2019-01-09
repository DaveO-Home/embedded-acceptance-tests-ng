export default function (Start) {
    /*
     * Test Form validation and submission.
     */
    describe('Popup Login Form', () => {
        let modal
        let closeButton
        let nameObject

        beforeAll(done => {
            Start.initMenu()
            Start['div .login click']()
            const loginObject = $('div .login')
            loginObject.click()

            // Not bothering with a promise.
            setTimeout(() => {
                modal = $('#modalTemplate')
                nameObject = $('#inputUsername')
                modal.on('shown.bs.modal', function (html) {
                    modal.modal("toggle") // primes the toggle - so click will close the modal.
                })
                done()
            }, 750)
        })

        it('Login form - verify modal with login loaded', function (done) {
            expect(modal[0]).toBeInDOM()
            expect(nameObject[0]).toExist()

            closeButton = $('.close-modal')
            done()
        })

        it('Login form - verify cancel and removed from DOM', function (done) {
            expect(modal[0]).toExist()
            closeButton.click()

            setTimeout(function () {
                $('div .login').remove()
                expect(modal[0]).not.toBeVisible()
                expect(modal[0]).not.toBeInDOM()
                done()
            }, 750)
        })
    })
}
