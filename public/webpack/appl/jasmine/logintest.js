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
                done()
            }, 500)
        })

        it('Login form - verify modal with login loaded', function (done) {
            expect(modal[0]).toBeInDOM()
            expect(nameObject[0]).toExist()

            closeButton = $('.close-modal')
            closeButton.click(function (ev) {
                ev.preventDefault()
                modal.modal('toggle')
                return false
            })

            done()
        })

        it('Login form - verify cancel and removed from DOM', function (done) {
            expect(modal[0]).toExist()
            setTimeout(function () {
                closeButton.click()

                setTimeout(function () {
                    $('div .login').remove()
                    expect(modal[0]).not.toBeVisible()
                    expect(modal[0]).not.toBeInDOM()
                    done()
                }, 750)
            }, 100)
        })
    })
}
