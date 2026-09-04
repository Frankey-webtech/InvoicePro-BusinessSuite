const toggleButtons = document.querySelectorAll(".toggle-password");

toggleButtons.forEach(button => {
    
    button.addEventListener("click", () => {
        
        const input = button.parentElement.querySelector("input");
        const icon = button.querySelector("i");
        
        if (input.type === "password") {
            
            input.type = "text";
            
            icon.classList.remove("ri-eye-line");
            icon.classList.add("ri-eye-off-line");
            
            button.setAttribute("aria-label", "Hide password");
            
        } else {
            
            input.type = "password";
            
            icon.classList.remove("ri-eye-off-line");
            icon.classList.add("ri-eye-line");
            
            button.setAttribute("aria-label", "Show password");
            
        }
        
    });
    
});

const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const googleBtn = document.getElementById("googleBtn");
const LOGIN_SETTINGS_KEY =
    "invoiceProLogoutSettings";

const REMEMBERED_SESSION_KEY =
    "invoiceProRememberedSession";

async function initializeGoogleLogin() {

    try {

        const auth0Client =
            await auth0.createAuth0Client({

                domain:
                    "dev-4mpuls6ree381pqd.us.auth0.com",
                clientId:
                    "CfxLswv3awjuN3irjFb44ddd8wP2QAe2",

                authorizationParams: {

                    redirect_uri:
                        window.location.origin +
                        "/login.html"

                }

            });

        const hasAuth0Callback =
            window.location.search.includes("code=") &&
            window.location.search.includes("state=");

        if (hasAuth0Callback) {

            try {

                const callbackResult =
                    await auth0Client.handleRedirectCallback();

                const auth0User =
                    await auth0Client.getUser();

                if (
                    !auth0User ||
                    !auth0User.email
                ) {

                    throw new Error(
                        "Unable to retrieve your Google account."
                    );

                }

                const appState =
                    callbackResult.appState || {};

                if (
                    appState.mode !== "login"
                ) {

                    throw new Error(
                        "Invalid Google login request."
                    );

                }

                const result =
                    await Parse.Cloud.run(
                        "loginGoogleUser",
                        {
                            email:
                                auth0User.email
                        }
                    );

                if (
                    !result ||
                    !result.sessionToken
                ) {

                    throw new Error(
                        "Unable to log you in with Google."
                    );

                }

                const loggedInUser =
                    await Parse.User.become(
                        result.sessionToken
                    );

                if (!loggedInUser) {

                    throw new Error(
                        "Google login succeeded, but the InvoicePro session could not be created."
                    );

                }

                const currentUser =
                    await Parse.User.currentAsync();

                if (!currentUser) {

                    throw new Error(
                        "Google login succeeded, but the InvoicePro session could not be restored."
                    );

                }

                await InvoiceProAuth.rememberCurrentSession();

                localStorage.setItem(
                    "userId",
                    currentUser.id
                );

                localStorage.setItem(
                    "fullName",
                    currentUser.get("fullName") || ""
                );

                localStorage.setItem(
                    "email",
                    currentUser.get("email") || ""
                );

                localStorage.setItem(
                    "country",
                    currentUser.get("country") || ""
                );

                localStorage.setItem(
                    "currencyCode",
                    currentUser.get("currencyCode") || ""
                );

                localStorage.setItem(
                    "currencySymbol",
                    currentUser.get("currencySymbol") || ""
                );

                localStorage.setItem(
                    "userPlan",
                    JSON.stringify({
                        name:
                            currentUser.get("plan") || "",
                        price:
                            currentUser.get("planPrice") || 0,
                        billing:
                            currentUser.get("planBilling") || ""
                    })
                );

                const returnUrl =
                    InvoiceProAuth.getReturnUrl();

                InvoiceProAuth.clearReturnUrl();

                window.location.replace(
                    returnUrl
                );

                return;

            } catch (error) {

                console.error(
                    "Google Login Error:",
                    error
                );

                if (
                    typeof showToast ===
                    "function"
                ) {

                    showToast(
                        error.message ||
                        "Unable to log in with Google.",
                        "error"
                    );

                } else {

                    alert(
                        error.message ||
                        "Unable to log in with Google."
                    );

                }

            }

        }

        googleBtn.addEventListener(
            "click",
            async () => {

                try {

                    googleBtn.disabled =
                        true;

                    googleBtn.innerHTML =
                        "Connecting...";

                    await auth0Client.loginWithRedirect({

                        authorizationParams: {

                            connection:
                                "google-oauth2"

                        },

                        appState: {

                            mode:
                                "login"

                        }

                    });

                } catch (error) {

                    console.error(
                        error
                    );

                    if (
                        typeof showToast ===
                        "function"
                    ) {

                        showToast(
                            error.message ||
                            "Unable to log in with Google.",
                            "error"
                        );

                    } else {

                        alert(
                            error.message ||
                            "Unable to log in with Google."
                        );

                    }

                    googleBtn.disabled =
                        false;

                    googleBtn.innerHTML = `
                        <img src="google.svg" alt="Google">
                        Google
                    `;

                }

            }
        );

    } catch (error) {

        console.error(
            "Auth0 initialization error:",
            error
        );

    }

}

async function checkExistingLogin() {
    
    try {
        
        const user =
            await InvoiceProAuth.restoreSession();
        
        if (!user) {
            return;
        }
        
        const returnUrl =
            InvoiceProAuth.getReturnUrl();
        
        InvoiceProAuth.clearReturnUrl();
        
        window.location.replace(
            returnUrl
        );
        
    } catch (error) {
        
        console.error(
            "Session check error:",
            error
        );
        
    }
    
}

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email =
        document.getElementById("email").value
            .trim()
            .toLowerCase();

    const password =
        document.getElementById("password").value;

    if (!email || !password) {

        alert(
            "Please enter your email and password."
        );

        return;

    }

    loginBtn.disabled = true;

    loginBtn.innerHTML =
        "Logging In...";

    try {

        const user =
            await Parse.User.logIn(
                email,
                password
            );

        const loggedInUser =
            await Parse.User.currentAsync();

        if (!loggedInUser) {

            throw new Error(
                "Login succeeded, but your session could not be saved. Please try again."
            );

        }

        await InvoiceProAuth.rememberCurrentSession();

        localStorage.setItem(
            "userId",
            loggedInUser.id
        );

        localStorage.setItem(
            "fullName",
            loggedInUser.get("fullName") || ""
        );

        localStorage.setItem(
            "email",
            loggedInUser.get("email") || ""
        );

        localStorage.setItem(
            "country",
            loggedInUser.get("country") || ""
        );

        localStorage.setItem(
            "currencyCode",
            loggedInUser.get("currencyCode") || ""
        );

        localStorage.setItem(
            "currencySymbol",
            loggedInUser.get("currencySymbol") || ""
        );

        localStorage.setItem(
            "userPlan",
            JSON.stringify({
                name:
                    loggedInUser.get("plan") || "",
                price:
                    loggedInUser.get("planPrice") || 0,
                billing:
                    loggedInUser.get("planBilling") || ""
            })
        );

        const returnUrl =
            InvoiceProAuth.getReturnUrl();

        InvoiceProAuth.clearReturnUrl();

        window.location.replace(
            returnUrl
        );

    } catch (error) {

        console.error(
            "Login Error:",
            error
        );

        alert(
            error.message ||
            "Unable to log in."
        );

        loginBtn.disabled = false;

        loginBtn.innerHTML =
            "<span>Log In</span>";

    }

});

checkExistingLogin();
initializeGoogleLogin();