if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js", { scope: "/" })
            .then(() => {
                console.log("Service Worker registered successfully.");
            })
            .catch((error) => {
                console.error("Service Worker registration failed:", error);
            });
    });
}

if (!window.Parse) {
    console.error("Parse SDK not loaded!");
} else {
    console.log("Parse SDK Loaded");

    Parse.initialize(
        "CHXrQck3aaULy1aZuPeRpHfhvbw386HOpjDa1XWF",
        "RPe3sQfHFnzuIn9KfOt1vYtb5JKAgPaByaNvH9yk"
    );

    Parse.serverURL = "https://parseapi.back4app.com/";
    console.log("Parse ready:", typeof Parse);
}

(function () {
    "use strict";

    let pricingData = null;
    let currentUser = null;
    let pricingRequestInProgress = false;

    const $ = (id) => document.getElementById(id);

    function showElement(element) {
        if (element) element.classList.add("is-visible");
    }

    function hideElement(element) {
        if (element) element.classList.remove("is-visible");
    }

    function setLocationStatus(icon, message) {
        const status = $("pricingLocationStatus");
        const text = $("pricingLocationText");

        if (!status || !text) return;

        const statusIcon = status.querySelector("i");

        if (statusIcon) {
            statusIcon.className = icon;
        }

        text.textContent = message;
    }

    function showToast(title, message) {
        const toast = $("pricingToast");
        const toastTitle = $("pricingToastTitle");
        const toastMessage = $("pricingToastMessage");

        if (!toast) return;

        if (toastTitle) toastTitle.textContent = title;
        if (toastMessage) toastMessage.textContent = message;

        toast.classList.add("is-visible");

        window.clearTimeout(window.pricingToastTimer);

        window.pricingToastTimer = window.setTimeout(() => {
            toast.classList.remove("is-visible");
        }, 5000);
    }

    function formatPrice(price, currencyCode, currencySymbol) {
        const numericPrice = Number(price);

        if (!Number.isFinite(numericPrice)) {
            return `${currencySymbol || ""}0`;
        }

        if (numericPrice === 0) {
            return currencySymbol || "0";
        }

        try {
            return new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: currencyCode || "USD",
                currencyDisplay: "symbol",
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }).format(numericPrice);
        } catch (error) {
            return `${currencySymbol || ""}${numericPrice.toLocaleString()}`;
        }
    }

    function getBillingText(plan, currencySymbol) {
        if (plan.billing === "Forever") {
            return "Free forever";
        }

        return `${currencySymbol || ""}${Number(plan.price || 0).toLocaleString()} billed monthly`;
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function renderPlans() {
        const grid = $("pricingGrid");

        if (!grid || !pricingData) return;

        const currencyCode = pricingData.currencyCode || "";
        const currencySymbol = pricingData.currencySymbol || "";
        const plans = pricingData.plans || {};
        const planOrder = ["Free", "Starter", "Business", "Enterprise"];

        grid.innerHTML = "";

        planOrder.forEach((planKey) => {
            const plan = plans[planKey];

            if (!plan) return;

            const card = document.createElement("article");
            card.className = "pricing-plan-card";

            if (plan.popular) {
                card.classList.add("pricing-plan-popular");
            }

            const popularBadge = plan.popular
                ? `
                    <div class="pricing-popular-badge">
                        <i class="ri-star-fill"></i>
                        <span>Most Popular</span>
                    </div>
                `
                : "";

            const features = Array.isArray(plan.features)
                ? plan.features
                : [];

            const featureMarkup = features.map((feature) => `
                <li class="pricing-plan-feature">
                    <i class="ri-check-line"></i>
                    <span>${escapeHtml(feature)}</span>
                </li>
            `).join("");

            const price = formatPrice(
                plan.price,
                currencyCode,
                currencySymbol
            );

            const period =
                plan.billing === "Forever"
                    ? "Forever"
                    : "/month";

            const billingText =
                getBillingText(plan, currencySymbol);

            const planName =
                plan.name || planKey;

            card.innerHTML = `
                ${popularBadge}

                <div class="pricing-plan-icon">
                    <i class="${escapeHtml(plan.icon || "ri-price-tag-3-line")}"></i>
                </div>

                <div class="pricing-plan-header">
                    <h3>${escapeHtml(planName)}</h3>
                    <p class="pricing-plan-description">
                        ${escapeHtml(plan.description || "")}
                    </p>
                </div>

                <div class="pricing-plan-price">
                    <span class="pricing-plan-price-amount">${price}</span>
                    <span class="pricing-plan-price-period">${period}</span>
                </div>

                <div class="pricing-plan-billing">
                    ${escapeHtml(billingText)}
                </div>

                <div class="pricing-plan-divider"></div>

                <div class="pricing-plan-includes">
                    ${escapeHtml(plan.includes || "")}
                </div>

                <ul class="pricing-plan-features">
                    ${featureMarkup}
                </ul>

                <button
                    type="button"
                    class="pricing-plan-button"
                    data-plan="${escapeHtml(planName)}"
                >
                    ${planName === "Free"
                        ? "Get started"
                        : `Choose ${escapeHtml(planName)}`}
                </button>
            `;

            grid.appendChild(card);
        });

        bindPlanButtons();
    }

    function bindPlanButtons() {
        document.querySelectorAll(".pricing-plan-button").forEach((button) => {
            button.addEventListener("click", () => {
                handlePlanSelection(button.dataset.plan);
            });
        });
    }

    function handlePlanSelection(planName) {
        if (!planName) return;

        window.location.href =
            `signup.html?plan=${encodeURIComponent(planName)}`;
    }

    function normalizePricingResult(result) {
        if (!result || typeof result !== "object") {
            return null;
        }

        const country =
            result.country ||
            result.countryName ||
            "";

        const countryCode =
            String(
                result.countryCode ||
                ""
            ).trim().toUpperCase();

        const currencyCode =
            String(
                result.currencyCode ||
                ""
            ).trim().toUpperCase();

        const currencySymbol =
            result.currencySymbol ||
            "";

        const plans =
            result.plans &&
            typeof result.plans === "object"
                ? result.plans
                : null;

        if (
            !country ||
            !countryCode ||
            !currencyCode ||
            !currencySymbol ||
            !plans
        ) {
            return null;
        }

        return {
            ...result,
            country,
            countryCode,
            currencyCode,
            currencySymbol,
            plans
        };
    }

    function applyPricingResult(result) {
        pricingData = result;
        window.invoiceProPricingData = result;  

        const countryElement =
            $("pricingCountry");

        if (countryElement) {
            countryElement.textContent =
                result.country;
        }

        const currencyElement =
            $("pricingCurrency");

        if (currencyElement) {
            currencyElement.textContent =
                `${result.currencySymbol} ${result.currencyCode}`;
        }

        renderPlans();
        showPricing();
    }

    async function loadPricingForLoggedInUser() {
        if (
            typeof Parse === "undefined" ||
            !Parse.Cloud
        ) {
            throw new Error(
                "Parse SDK is not available."
            );
        }

        const result =
            await Parse.Cloud.run(
                "getPublicPricing"
            );

        const normalized =
            normalizePricingResult(result);

        if (!normalized) {
            throw new Error(
                "The server returned incomplete pricing information."
            );
        }

        applyPricingResult(normalized);

        setLocationStatus(
            "ri-user-location-line",
            `${normalized.country} · ${normalized.currencyCode}`
        );

        return true;
    }

    async function loadPricingByLocation(
        latitude,
        longitude
    ) {
        if (
            typeof Parse === "undefined" ||
            !Parse.Cloud
        ) {
            throw new Error(
                "Parse SDK is not available."
            );
        }

        const lat = Number(latitude);
        const lng = Number(longitude);

        if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng) ||
            lat < -90 ||
            lat > 90 ||
            lng < -180 ||
            lng > 180
        ) {
            throw new Error(
                "Invalid location coordinates."
            );
        }

        const result =
            await Parse.Cloud.run(
                "getPublicPricing",
                {
                    latitude: lat,
                    longitude: lng
                }
            );

        const normalized =
            normalizePricingResult(result);

        if (!normalized) {
            throw new Error(
                "Invalid pricing information received."
            );
        }

        applyPricingResult(normalized);

        setLocationStatus(
            "ri-map-pin-check-line",
            `${normalized.country} · ${normalized.currencyCode}`
        );

        return true;
    }

    async function getLoggedInUser() {
        try {
            if (
                typeof Parse === "undefined" ||
                !Parse.User
            ) {
                return null;
            }

            const user =
                Parse.User.current();

            if (!user) {
                return null;
            }

            if (
                typeof user.isAuthenticated ===
                "function" &&
                !user.isAuthenticated()
            ) {
                return null;
            }

            try {
                await user.fetch();
            } catch (error) {
                console.warn(
                    "Pricing: using cached account data.",
                    error
                );
            }

            return user;
        } catch (error) {
            console.warn(
                "Pricing: current-user check failed.",
                error
            );

            return null;
        }
    }

    function showPricing() {
        hideElement(
            $("pricingLoadingSection")
        );

        hideElement(
            $("pricingLocationSection")
        );

        showElement(
            $("pricingContent")
        );

        if (pricingData) {
            setLocationStatus(
                currentUser
                    ? "ri-user-location-line"
                    : "ri-map-pin-check-line",
                `${pricingData.country} · ${pricingData.currencyCode}`
            );
        }
    }

    function showLocationRequest() {
        hideElement(
            $("pricingLoadingSection")
        );

        hideElement(
            $("pricingContent")
        );

        showElement(
            $("pricingLocationSection")
        );
    }

    function showLoading(
        message = "Preparing your pricing"
    ) {
        hideElement(
            $("pricingLocationSection")
        );

        hideElement(
            $("pricingContent")
        );

        showElement(
            $("pricingLoadingSection")
        );

        const loadingTitle =
            $("pricingLoadingSection")
                ?.querySelector("h2");

        if (loadingTitle) {
            loadingTitle.textContent =
                message;
        }

        setLocationStatus(
            "ri-loader-4-line",
            "Preparing your pricing..."
        );
    }

    function clearLocationError() {
        const errorElement =
            $("pricingLocationError");

        if (errorElement) {
            errorElement.textContent = "";
        }
    }

    function showPricingError(message) {
        const errorElement =
            $("pricingLocationError");

        if (errorElement) {
            errorElement.textContent =
                message;
        }

        showLocationRequest();
    }

    function handleLocationError(error) {
        let message =
            "We couldn't access your location. Please try again.";

        if (
            error &&
            error.code ===
            error.PERMISSION_DENIED
        ) {
            message =
                "Location permission was denied. Please allow location access and try again.";
        } else if (
            error &&
            error.code ===
            error.POSITION_UNAVAILABLE
        ) {
            message =
                "Your location could not be determined. Please check your device location settings and try again.";
        } else if (
            error &&
            error.code ===
            error.TIMEOUT
        ) {
            message =
                "Location detection timed out. Please try again.";
        }

        showPricingError(message);
    }

    async function requestLocation() {
        if (pricingRequestInProgress) {
            return;
        }

        if (currentUser) {
            return;
        }

        clearLocationError();

        if (!navigator.geolocation) {
            showPricingError(
                "Location services are not supported by this browser."
            );
            return;
        }

        pricingRequestInProgress = true;

        showLoading(
            "Determining your pricing"
        );

        try {
            const position =
                await new Promise(
                    (resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(
                            resolve,
                            reject,
                            {
                                enableHighAccuracy: false,
                                timeout: 15000,
                                maximumAge: 600000
                            }
                        );
                    }
                );

            await loadPricingByLocation(
                Number(position.coords.latitude),
                Number(position.coords.longitude)
            );
        } catch (error) {
            console.error(
                "Pricing location error:",
                error
            );

            if (
                error &&
                typeof error.code === "number" &&
                error.code >= 1 &&
                error.code <= 3
            ) {
                handleLocationError(error);
            } else {
                showPricingError(
                    "We couldn't load pricing from your location. Please try again."
                );
            }
        } finally {
            pricingRequestInProgress = false;
        }
    }

    function updateHeaderForUser(user) {
        const loginButton =
            $("headerLoginBtn");

        const signupButton =
            $("headerSignupBtn");

        if (!loginButton || !signupButton) {
            return;
        }

        if (!user) {
            loginButton.textContent =
                "Login";

            loginButton.href =
                "login.html";

            loginButton.removeAttribute(
                "aria-label"
            );

            signupButton.textContent =
                "Get Started";

            signupButton.href =
                "signup.html";

            signupButton.removeAttribute(
                "aria-label"
            );

            return;
        }

        loginButton.textContent =
            "Profile";

        loginButton.href =
            "profile.html";

        loginButton.setAttribute(
            "aria-label",
            "Open your profile"
        );

        signupButton.textContent =
            "Dashboard";

        signupButton.href =
            "dashboard.html";

        signupButton.setAttribute(
            "aria-label",
            "Open your dashboard"
        );
    }

    function initializeMobileNavigation() {
        const menuButton =
            $("pricingMenuButton");

        const navigation =
            $("pricingMobileNavigation");

        if (!menuButton || !navigation) {
            return;
        }

        menuButton.addEventListener(
            "click",
            () => {
                const isOpen =
                    navigation.classList.toggle(
                        "is-open"
                    );

                const icon =
                    menuButton.querySelector("i");

                if (icon) {
                    icon.className =
                        isOpen
                            ? "ri-close-line"
                            : "ri-menu-line";
                }
            }
        );
    }

    function initializeToast() {
        const closeButton =
            $("pricingToastClose");

        const toast =
            $("pricingToast");

        if (!closeButton || !toast) {
            return;
        }

        closeButton.addEventListener(
            "click",
            () => {
                toast.classList.remove(
                    "is-visible"
                );
            }
        );
    }

    async function initialize() {
        initializeMobileNavigation();
        initializeToast();

        const locationButton =
            $("enableLocationButton");

        if (locationButton) {
            locationButton.addEventListener(
                "click",
                requestLocation
            );
        }

        showLoading(
            "Preparing your pricing"
        );

        currentUser =
            await getLoggedInUser();

        updateHeaderForUser(
            currentUser
        );

        if (currentUser) {
            try {
                await loadPricingForLoggedInUser();
                return;
            } catch (error) {
                console.error(
                    "Pricing: account pricing failed.",
                    error
                );

                showPricingError(
                    "We couldn't load your account pricing right now. Please try again."
                );

                return;
            }
        }

        showLocationRequest();

        setLocationStatus(
            "ri-map-pin-line",
            "Location permission required"
        );
    }

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            initialize
        );
    } else {
        initialize();
    }
})();

(function () {
    const theme =
        localStorage.getItem(
            "invoiceProTheme"
        );

    if (theme === "dark") {
        document.documentElement.setAttribute(
            "data-theme",
            "dark"
        );
    }
})();

(function () {
    function getStoredUser() {
        const storageSources = [
            window.localStorage,
            window.sessionStorage
        ];

        const possibleKeys = [
            "user",
            "currentUser",
            "loggedInUser",
            "userData",
            "profile",
            "currentUserData"
        ];

        for (const storage of storageSources) {
            for (const key of possibleKeys) {
                try {
                    const value =
                        storage.getItem(key);

                    if (!value) continue;

                    const parsed =
                        JSON.parse(value);

                    if (
                        parsed &&
                        (
                            parsed.id ||
                            parsed.objectId ||
                            parsed.userId ||
                            parsed.email ||
                            parsed.username
                        )
                    ) {
                        return parsed;
                    }
                } catch (error) {
                }
            }
        }

        return null;
    }

    function getStoredUserValue(user, keys) {
        for (const key of keys) {
            const value =
                user &&
                user[key];

            if (
                value !== undefined &&
                value !== null &&
                String(value).trim()
            ) {
                return String(value).trim();
            }
        }

        return "";
    }

    function getInitial(user) {
        const fullName =
            getStoredUserValue(
                user,
                [
                    "fullName",
                    "name",
                    "username"
                ]
            );

        const email =
            getStoredUserValue(
                user,
                ["email"]
            );

        const source =
            fullName ||
            email ||
            "U";

        const words =
            source
                .trim()
                .split(/\s+/)
                .filter(Boolean);

        if (words.length >= 2) {
            return (
                words[0].charAt(0) +
                words[1].charAt(0)
            ).toUpperCase();
        }

        return source
            .charAt(0)
            .toUpperCase();
    }

    function getProfileImage(user) {
        if (!user) return "";

        return (
            user.profileImage ||
            user.profileImageUrl ||
            ""
        );
    }

    async function getLoggedInUser() {
        try {
            if (
                typeof Parse !== "undefined" &&
                Parse.User &&
                typeof Parse.User.current ===
                "function"
            ) {
                const currentUser =
                    Parse.User.current();

                if (currentUser) {
                    if (
                        typeof currentUser.isAuthenticated ===
                        "function"
                    ) {
                        if (
                            currentUser.isAuthenticated()
                        ) {
                            return currentUser;
                        }
                    } else {
                        return currentUser;
                    }
                }
            }
        } catch (error) {
        }

        return getStoredUser();
    }

    function createProfileButton(user) {
        const profileImage =
            getProfileImage(user);

        const initial =
            getInitial(user);

        const profileButton =
            document.createElement("button");

        profileButton.type =
            "button";

        profileButton.className =
            "header-profile-btn";

        profileButton.setAttribute(
            "aria-label",
            "Profile"
        );

        if (profileImage) {
            const image =
                document.createElement("img");

            image.src =
                profileImage;

            image.alt =
                "Profile";

            image.className =
                "header-profile-image";

            image.onerror =
                function () {
                    profileButton.innerHTML =
                        "";

                    const initialElement =
                        document.createElement(
                            "span"
                        );

                    initialElement.className =
                        "header-profile-initial";

                    initialElement.textContent =
                        initial;

                    profileButton.appendChild(
                        initialElement
                    );
                };

            profileButton.appendChild(
                image
            );
        } else {
            const initialElement =
                document.createElement(
                    "span"
                );

            initialElement.className =
                "header-profile-initial";

            initialElement.textContent =
                initial;

            profileButton.appendChild(
                initialElement
            );
        }

        profileButton.addEventListener(
            "click",
            function () {
                window.location.href =
                    "profile.html";
            }
        );

        return profileButton;
    }

    function updateHeader(user) {
        const loginButton =
            document.querySelector(
                ".login-btn"
            );

        const nextButton =
            document.querySelector(
                ".header-buttons .primary-btn"
            );

        const headerButtons =
            document.querySelector(
                ".header-buttons"
            );

        if (!headerButtons) return;

        if (!user) {
            if (loginButton) {
                loginButton.textContent =
                    "Login";

                loginButton.href =
                    "login.html";

                loginButton.style.display =
                    "";
            }

            if (nextButton) {
                nextButton.textContent =
                    "Next";

                nextButton.href =
                    "features.html";

                nextButton.style.display =
                    "";
            }

            return;
        }

        if (loginButton) {
            loginButton.replaceWith(
                createProfileButton(user)
            );
        } else {
            const existingProfile =
                headerButtons.querySelector(
                    ".header-profile-btn"
                );

            if (!existingProfile) {
                headerButtons.insertBefore(
                    createProfileButton(user),
                    headerButtons.firstChild
                );
            }
        }

        if (nextButton) {
            nextButton.textContent =
                "Dashboard";

            nextButton.href =
                "dashboard.html";

            nextButton.style.display =
                "";
        }
    }

    async function initializeSharedHeader() {
        try {
            const user =
                await getLoggedInUser();

            updateHeader(user);
        } catch (error) {
            updateHeader(null);
        }
    }

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            initializeSharedHeader
        );
    } else {
        initializeSharedHeader();
    }
})();

(function() {
    "use strict";
    
    const YEARLY_DISCOUNT = 0.20;
    
    function formatYearlyPrice(price, currencyCode, currencySymbol) {
        const yearlyPrice =
            Number(price || 0) * 12 * (1 - YEARLY_DISCOUNT);
        
        if (!Number.isFinite(yearlyPrice)) {
            return `${currencySymbol || ""}0`;
        }
        
        if (yearlyPrice === 0) {
            return currencySymbol || "0";
        }
        
        try {
            return new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: currencyCode || "USD",
                currencyDisplay: "symbol",
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }).format(yearlyPrice);
        } catch (error) {
            return `${currencySymbol || ""}${yearlyPrice.toLocaleString()}`;
        }
    }
    
    function formatMonthlyPrice(price, currencyCode, currencySymbol) {
        const numericPrice =
            Number(price || 0);
        
        if (!Number.isFinite(numericPrice)) {
            return `${currencySymbol || ""}0`;
        }
        
        if (numericPrice === 0) {
            return currencySymbol || "0";
        }
        
        try {
            return new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: currencyCode || "USD",
                currencyDisplay: "symbol",
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }).format(numericPrice);
        } catch (error) {
            return `${currencySymbol || ""}${numericPrice.toLocaleString()}`;
        }
    }
    
    function updateBillingDisplay() {
        const toggle =
            document.getElementById("billingToggle");
        
        const pricingData =
            window.invoiceProPricingData;
        
        if (!toggle || !pricingData) {
            return;
        }
        
        const isYearly =
            toggle.checked;
        
        const currencyCode =
            pricingData.currencyCode || "USD";
        
        const currencySymbol =
            pricingData.currencySymbol || "";
        
        const plans =
            pricingData.plans || {};
        
        const planOrder = [
            "Free",
            "Starter",
            "Business",
            "Enterprise"
        ];
        
        const cards =
            document.querySelectorAll(
                ".pricing-plan-card"
            );
        
        cards.forEach(function(card, index) {
            
            const planKey =
                planOrder[index];
            
            const plan =
                plans[planKey];
            
            if (!plan) {
                return;
            }
            
            const priceElement =
                card.querySelector(
                    ".pricing-plan-price-amount"
                );
            
            const periodElement =
                card.querySelector(
                    ".pricing-plan-price-period"
                );
            
            const billingElement =
                card.querySelector(
                    ".pricing-plan-billing"
                );
            
            if (!priceElement || !periodElement) {
                return;
            }
            
            const monthlyPrice =
                Number(plan.price || 0);
            
            if (!Number.isFinite(monthlyPrice)) {
                return;
            }
            
            if (plan.billing === "Forever") {
                priceElement.textContent =
                    currencySymbol || "0";
                
                periodElement.textContent =
                    "Forever";
                
                if (billingElement) {
                    billingElement.textContent =
                        "Free forever";
                }
                
                return;
            }
            
            if (isYearly) {
                
                const yearlyPrice =
                    monthlyPrice *
                    12 *
                    (1 - YEARLY_DISCOUNT);
                
                const normalYearlyPrice =
                    monthlyPrice * 12;
                
                const savings =
                    normalYearlyPrice -
                    yearlyPrice;
                
                priceElement.textContent =
                    formatYearlyPrice(
                        monthlyPrice,
                        currencyCode,
                        currencySymbol
                    );
                
                periodElement.textContent =
                    "/year";
                
                if (billingElement) {
                    billingElement.innerHTML = `
                        <span>
                            ${formatYearlyPrice(
                                monthlyPrice,
                                currencyCode,
                                currencySymbol
                            )} billed yearly
                        </span>
                        <small>
                            Save 20% · Save ${formatMonthlyPrice(
                                savings,
                                currencyCode,
                                currencySymbol
                            )}
                        </small>
                    `;
                }
                
            } else {
                
                priceElement.textContent =
                    formatMonthlyPrice(
                        monthlyPrice,
                        currencyCode,
                        currencySymbol
                    );
                
                periodElement.textContent =
                    "/month";
                
                if (billingElement) {
                    billingElement.textContent =
                        `${currencySymbol}${monthlyPrice.toLocaleString()} billed monthly`;
                }
            }
        });
    }
    
    function initializeBillingToggle() {
        const toggle =
            document.getElementById(
                "billingToggle"
            );
        
        if (!toggle) {
            return;
        }
        
        toggle.addEventListener(
            "change",
            updateBillingDisplay
        );
        
        updateBillingDisplay();
    }
    
    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            initializeBillingToggle
        );
    } else {
        initializeBillingToggle();
    }
    
})();

document.addEventListener(
    "DOMContentLoaded",
    function () {
        const sidebar =
            document.getElementById(
                "sidebar"
            );

        const sidebarOverlay =
            document.getElementById(
                "sidebarOverlay"
            );

        const menuToggle =
            document.getElementById(
                "menuToggle"
            );

        const settingsToggle =
            document.getElementById(
                "settingsToggle"
            );

        const settingsDropdown =
            document.getElementById(
                "settingsDropdown"
            );

        if (!sidebar) return;

        function updateSidebarLayout() {
            if (window.innerWidth > 992) {
                sidebar.classList.add(
                    "show"
                );

                if (sidebarOverlay) {
                    sidebarOverlay.classList.remove(
                        "show"
                    );
                }

                if (menuToggle) {
                    menuToggle.style.display =
                        "none";
                }
            } else {
                sidebar.classList.remove(
                    "show"
                );

                if (sidebarOverlay) {
                    sidebarOverlay.classList.remove(
                        "show"
                    );
                }

                if (menuToggle) {
                    menuToggle.style.display =
                        "";
                }
            }
        }

        if (menuToggle) {
            menuToggle.addEventListener(
                "click",
                function () {
                    sidebar.classList.add(
                        "show"
                    );

                    if (sidebarOverlay) {
                        sidebarOverlay.classList.add(
                            "show"
                        );
                    }
                }
            );
        }

        if (sidebarOverlay) {
            sidebarOverlay.addEventListener(
                "click",
                function () {
                    sidebar.classList.remove(
                        "show"
                    );

                    sidebarOverlay.classList.remove(
                        "show"
                    );
                }
            );
        }

        if (
            settingsToggle &&
            settingsDropdown
        ) {
            settingsToggle.addEventListener(
                "click",
                function () {
                    settingsDropdown.classList.toggle(
                        "active"
                    );
                }
            );
        }

        const activeDropdownItem =
            document.querySelector(
                ".dropdown-item.active"
            );

        if (
            activeDropdownItem &&
            settingsDropdown
        ) {
            settingsDropdown.classList.add(
                "active"
            );
        }

        const navLinks =
            document.querySelectorAll(
                ".nav-item, .dropdown-item"
            );

        navLinks.forEach(
            function (link) {
                link.addEventListener(
                    "click",
                    function () {
                        if (
                            window.innerWidth <= 992
                        ) {
                            sidebar.classList.remove(
                                "show"
                            );

                            if (sidebarOverlay) {
                                sidebarOverlay.classList.remove(
                                    "show"
                                );
                            }
                        }
                    }
                );
            }
        );

        window.addEventListener(
            "resize",
            updateSidebarLayout
        );

        updateSidebarLayout();
    }
);

document.addEventListener(
    "DOMContentLoaded",
    async function () {
        try {
            if (
                typeof Parse === "undefined" ||
                !Parse.User
            ) {
                return;
            }

            const user =
                Parse.User.current();

            if (!user) return;

            const profileImage =
                user.get("profileImage");

            if (
                !profileImage ||
                typeof profileImage.url !==
                "function"
            ) {
                return;
            }

            const imageUrl =
                profileImage.url();

            if (!imageUrl) return;

            const profileImages =
                document.querySelectorAll(
                    ".profile-avatar, .header-avatar img"
                );

            profileImages.forEach(
                function (image) {
                    image.src =
                        imageUrl;
                }
            );
        } catch (error) {
            console.error(
                "Profile image load error:",
                error
            );
        }
    }
);
