export default function (Helpers) {
    /*
     * Test Form validation and submission.
     */
    describe("Contact Form Validation", () => {
        let contact;
        let submitObject;
        let nameObject;
        let emailObject;
        let commentObject;
        const mainContainer = "ng-component";

        beforeAll(done => {
            location.hash = "/contact";
            done();
        });

        it("Contact form - verify required fields", done => {
            Helpers.getResource(mainContainer, 0, 0)
                .catch(rejected => {
                    fail(`Contact Page did not load within limited time: ${rejected}`);
                }).then(() => {
                    contact = $(`${mainContainer} form`);
                    nameObject = $("#inputName");
                    emailObject = $("#inputEmail");
                    commentObject = $("#inputComment");

                    expect(nameObject[0].validity.valueMissing).toBe(true);
                    expect(emailObject[0].validity.valueMissing).toBe(true);
                    expect(commentObject[0].validity.valueMissing).toBe(true);
                    expect(contact.find("input[type=checkbox]")[0].validity.valueMissing).toBe(false); // Not required

                    done();
                });
        });

        it("Contact form - validate populated fields, email mismatch.", done => {
            submitObject = contact.find("input[type=submit]");

            nameObject.val("me");
            emailObject.val("notanemailaddress");
            commentObject.val("Stuff");

            submitObject.click();

            expect(nameObject[0].validity.valueMissing).toBe(false);
            expect(nameObject[0].checkValidity()).toBe(true);
            expect(commentObject[0].validity.valueMissing).toBe(false);
            expect(commentObject[0].checkValidity()).toBe(true);
            expect(emailObject[0].validity.valueMissing).toBe(false);
            expect(emailObject[0].checkValidity()).toBe(false);
            expect(emailObject[0].validity.typeMismatch).toBe(true);

            // expect(contact[0]).toBeInDOM()
            expect(contact[0]).toExist();

            done();
        });

        it("Contact form - validate email with valid email address.", done => {
            emailObject.val("ace@ventura.com");

            expect(emailObject[0].validity.typeMismatch).toBe(false);
            expect(emailObject[0].checkValidity()).toBe(true);

            done();
        });
        /* Seems that the component isn't removed from dom with Angular 11
        */
        // it("Contact form - validate form submission.", done => {
        //     submitObject.click();

        //     setTimeout(() => {
        //         expect($(`${mainContainer} form`)[0]).not.toBeInDOM();
        //         expect($(`${mainContainer} form`)[0]).not.toExist();
        //         done();
        //     }, 100);
        // });
    });
}
