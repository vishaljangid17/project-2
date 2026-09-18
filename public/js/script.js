// =========================
// FORM VALIDATION
// =========================

(() => {

    "use strict";


    const forms =
        document.querySelectorAll(
            ".needs-validation"
        );


    Array.from(forms).forEach(
        (form) => {

            form.addEventListener(
                "submit",
                (event) => {

                    if (!form.checkValidity()) {

                        event.preventDefault();

                        event.stopPropagation();

                    }


                    form.classList.add(
                        "was-validated"
                    );

                },
                false
            );

        }
    );

})();


// =========================
// FLASH MESSAGE
// =========================

setTimeout(() => {

    document
        .querySelectorAll(".custom-flash")
        .forEach((flash) => {

            flash.remove();

        });

}, 1200);