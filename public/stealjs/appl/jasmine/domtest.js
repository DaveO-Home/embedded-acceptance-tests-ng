export default function (resource) {
    if (testit) {
        switch (resource) {
            case "index":
                expect(document.querySelector(".mx-auto h1").textContent).toBe("Welcome To")
                break
            case "pdf":
                expect($(document).find("#data[src$='Test.pdf']").length > 0).toBe(true)
                break
            case "tools":
                expect($(document).find(".dropdown-menu").find(".dropdown-item").length > 2).toBe(true)
                expect($(document).find("ng-component").find("tbody").find("tr").find("td").length > 9).toBe(true)
                break
            default:
        }
    }
}
