const toastContainer =
            document.getElementById("toastContainer");

        function showToast(
            message,
            type = "info",
            duration = 3000
        ){

            const toast =
                document.createElement("div");

            toast.className =
                `toast ${type}`;

            toast.innerHTML = `

                <span>${message}</span>

                <span class="toastClose">&times;</span>

            `;

            toastContainer.appendChild(toast);

            const removeToast = () => {

                toast.style.animation =
                    "toastOut .3s forwards";

                setTimeout(() => {

                    toast.remove();

                }, 300);

            };

            toast
                .querySelector(".toastClose")
                .addEventListener(
                    "click",
                    removeToast
                );

            setTimeout(
                removeToast,
                duration
            );

        }


        const toggleButtons =
            document.querySelectorAll(".toggle-password");

        toggleButtons.forEach(button => {

            button.addEventListener("click", () => {

                const input =
                    button.previousElementSibling;

                const icon =
                    button.querySelector("i");

                if (input.type === "password") {

                    input.type = "text";

                    icon.className =
                        "ri-eye-off-line";

                } else {

                    input.type = "password";

                    icon.className =
                        "ri-eye-line";

                }

            });

        });


        const planInput =
            document.getElementById("selectedPlan");

        planInput.value =
            "Free Plan";


        const createBtn =
            document.getElementById("createAccountBtn");


        createBtn.addEventListener("click", async () => {

            const fullName =
                document
                    .getElementById("fullName")
                    .value
                    .trim();

            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("password")
                    .value;

            const confirmPassword =
                document
                    .getElementById("confirmPassword")
                    .value;

            const terms =
                document
                    .getElementById("terms")
                    .checked;


            if (
                !fullName ||
                !email ||
                !password ||
                !confirmPassword ||
                !countrySelect.value ||
                !currencyInput.value
            ) {

                showToast(
                    "Please fill in all fields.",
                    "info"
                );

                return;

            }


            if (password !== confirmPassword) {

                showToast(
                    "Passwords do not match.",
                    "warning"
                );

                return;

            }


            const passwordRegex =
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]).{8,}$/;


            if (!passwordRegex.test(password)) {

                showToast(
                    "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character.",
                    "warning"
                );

                return;

            }


            if (!terms) {

                showToast(
                    "Please agree to the Terms of Service.",
                    "info"
                );

                return;

            }


            createBtn.disabled =
                true;

            createBtn.textContent =
                "Creating Account...";


            try {

                const selectedCurrency = {

                    code:
                        currencyInput.dataset.code,

                    symbol:
                        currencyInput.dataset.symbol || ""

                };


                const user =
                    new Parse.User();


                user.set(
                    "username",
                    email.toLowerCase()
                );

                user.set(
                    "email",
                    email.toLowerCase()
                );

                user.set(
                    "password",
                    password
                );

                user.set(
                    "fullName",
                    fullName
                );
                
                user.set(
    "authMethod",
    "password"
);


                user.set(
                    "country",
                    countrySelect
                        .options[
                            countrySelect.selectedIndex
                        ].text
                );


                user.set(
                    "currencyCode",
                    currencyInput.dataset.code
                );


                user.set(
                    "currencySymbol",
                    currencyInput.dataset.symbol
                );


                await user.signUp();


                await Parse.Cloud.run(
                    "initializeNewUser"
                );


                showToast(
                    "Account created successfully.",
                    "success"
                );


                window.location.href =
                    "dashboard.html";


            } catch (error) {

                console.log(error);

                console.log(
                    "Code:",
                    error.code
                );

                console.log(
                    "Message:",
                    error.message
                );


                showToast(
                    `Code: ${error.code}\nMessage: ${error.message}`,
                    "error"
                );


                createBtn.disabled =
                    false;

                createBtn.textContent =
                    "Create Account";

            }

        });


        const countrySelect =
            document.getElementById("country");

        const currencyInput =
            document.getElementById("currency");


        async function loadCountries() {

            try {

                const result =
                    await Parse.Cloud.run(
                        "getCountries"
                    );


                countrySelect.innerHTML =
                    '<option value="">Select Country</option>';


                result.countries.forEach(country => {

                    const option =
                        document.createElement("option");


                    option.value =
                        country.name;

                    option.textContent =
                        country.name;


                    option.dataset.code =
                        country.code;

                    option.dataset.symbol =
                        country.symbol;


                    countrySelect.appendChild(
                        option
                    );

                });

            } catch (error) {

                console.error(error);

                showToast(
                    error.message,
                    "error"
                );

            }

        }


        loadCountries();


        countrySelect.addEventListener(
            "change",
            () => {

                const option =
                    countrySelect.options[
                        countrySelect.selectedIndex
                    ];


                if (!option.value) {

                    currencyInput.value =
                        "";

                    currencyInput.dataset.code =
                        "";

                    currencyInput.dataset.symbol =
                        "";

                    return;

                }


                currencyInput.dataset.code =
                    option.dataset.code;


                currencyInput.dataset.symbol =
                    option.dataset.symbol;


                currencyInput.value =
                    `${option.dataset.symbol} (${option.dataset.code})`;

            }
        );

const googleBtn =
    document.getElementById("googleBtn");

let auth0Client;

async function initializeAuth0() {

    auth0Client = await auth0.createAuth0Client({

        domain:
            "dev-4mpuls6ree381pqd.us.auth0.com",

        clientId:
            "CfxLswv3awjuN3irjFb44ddd8wP2QAe2",

        authorizationParams: {

            redirect_uri:
    window.location.origin +
    "/callback.html"

        }

    });

    googleBtn.addEventListener(
        "click",
        async () => {

            const country =
                countrySelect.value;

            if (!country) {

                showToast(
                    "Please select your country before continuing with Google.",
                    "info"
                );

                alert(
                    "Please select your country before continuing with Google.",
                    "info"
                );

                return;

            }

            try {

                googleBtn.disabled = true;

                googleBtn.textContent =
                    "Connecting...";

                await auth0Client.loginWithRedirect({

                    authorizationParams: {

                        connection:
                            "google-oauth2"

                    },

                    appState: {

                        mode:
                            "signup",

                        country:
                            country

                    }

                });

            } catch (error) {

                console.error(error);

                showToast(
                    error.message,
                    "error"
                );

                googleBtn.disabled = false;

                googleBtn.innerHTML = `
                    <img
                        src="google.svg"
                        alt="Google"
                    >
                    Google
                `;

            }

        }
    );

}

initializeAuth0();