"use strict";

const AUTH0_DOMAIN =
"dev-2tvu028qm4wmvd0l.us.auth0.com";

const AUTH0_CLIENT_ID =
"LpoyuFK4GqAA6gzsVzu2yxGarfb8mXs6";

const statusIcon =
document.getElementById("statusIcon");

const statusTitle =
document.getElementById("statusTitle");

const statusMessage =
document.getElementById("statusMessage");

async function initializeCallback() {

try {

    const auth0Client =
        await auth0.createAuth0Client({

            domain:
                AUTH0_DOMAIN,

            clientId:
                AUTH0_CLIENT_ID,

            authorizationParams: {

                redirect_uri:
                    window.location.origin +
                    "/callback.html"

            }

        });

    const hasAuth0Callback =
        window.location.search.includes("code=") &&
        window.location.search.includes("state=");

    if (!hasAuth0Callback) {

        throw new Error(
            "No authentication response was received."
        );

    }

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

    const country =
        appState.country;

    if (!country) {

        throw new Error(
            "Country information was not provided."
        );

    }

    const result =
        await Parse.Cloud.run(
            "createGoogleUser",
            {

                email:
                    auth0User.email,

                fullName:
                    auth0User.name || "",

                country:
                    country

            }
        );

    if (
        !result ||
        !result.sessionToken
    ) {

        throw new Error(
            "Unable to complete Google authentication."
        );

    }

    const loggedInUser =
        await Parse.User.become(
            result.sessionToken
        );

    if (!loggedInUser) {

        throw new Error(
            "Google authentication succeeded, but the InvoicePro session could not be created."
        );

    }

    const currentUser =
        await Parse.User.currentAsync();

    if (!currentUser) {

        throw new Error(
            "Google authentication succeeded, but you are not logged in to InvoicePro."
        );

    }

    window.history.replaceState(
        {},
        document.title,
        "/callback.html"
    );

    statusIcon.classList.remove(
        "loading"
    );

    statusIcon.classList.add(
        "success"
    );

    statusTitle.textContent =
        "Authentication successful";

    statusMessage.textContent =
        "Your account has been verified. Redirecting to your dashboard...";

    setTimeout(
        () => {

            window.location.replace(
                "/dashboard.html"
            );

        },
        1200
    );

} catch (error) {

    console.error(
        "Authentication error:",
        error
    );

    statusIcon.classList.remove(
        "loading"
    );

    statusIcon.classList.add(
        "error"
    );

    statusTitle.textContent =
        "Authentication failed";

    statusMessage.textContent =
        error.message ||
        "We were unable to verify your account. Please try again.";

}

}

initializeCallback();