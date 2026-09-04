if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js", {
                scope: "/"
            })
            .then(() => {
                console.log("Service Worker registered successfully.");
            })
            .catch(error => {
                console.error(
                    "Service Worker registration failed:",
                    error
                );
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

(function() {
    
    const SETTINGS_KEY =
        "invoiceProLogoutSettings";
    
    const REMEMBERED_SESSION_KEY =
        "invoiceProRememberedSession";
    
    const EXIT_INTENT_KEY =
        "invoiceProLogoutOnExit";
    
    const RETURN_URL_KEY =
        "invoiceProReturnUrl";
    
    function getSettings() {
        
        try {
            
            const saved =
                localStorage.getItem(
                    SETTINGS_KEY
                );
            
            if (!saved) {
                
                return {
                    keepSignedIn: true,
                    logoutOnExit: false,
                    rememberDevice: true
                };
                
            }
            
            const settings =
                JSON.parse(saved);
            
            return {
                keepSignedIn: settings.keepSignedIn === true,
                
                logoutOnExit: settings.logoutOnExit === true,
                
                rememberDevice: settings.rememberDevice === true
            };
            
        } catch (error) {
            
            return {
                keepSignedIn: true,
                logoutOnExit: false,
                rememberDevice: true
            };
            
        }
        
    }
    
    function saveSettings(settings) {
        
        const current =
            getSettings();
        
        const updated = {
            keepSignedIn: settings.keepSignedIn !== undefined ?
                settings.keepSignedIn === true :
                current.keepSignedIn,
            
            logoutOnExit: settings.logoutOnExit !== undefined ?
                settings.logoutOnExit === true :
                current.logoutOnExit,
            
            rememberDevice: settings.rememberDevice !== undefined ?
                settings.rememberDevice === true :
                current.rememberDevice
        };
        
        if (updated.keepSignedIn) {
            updated.logoutOnExit = false;
        }
        
        if (updated.logoutOnExit) {
            updated.keepSignedIn = false;
        }
        
        localStorage.setItem(
            SETTINGS_KEY,
            JSON.stringify(updated)
        );
        
        if (
            !updated.keepSignedIn &&
            !updated.rememberDevice
        ) {
            
            localStorage.removeItem(
                REMEMBERED_SESSION_KEY
            );
            
        }
        
        return updated;
        
    }
    
    async function rememberCurrentSession() {
        
        try {
            
            const settings =
                getSettings();
            
            if (
                !settings.keepSignedIn &&
                !settings.rememberDevice
            ) {
                
                localStorage.removeItem(
                    REMEMBERED_SESSION_KEY
                );
                
                return;
                
            }
            
            const user =
                await Parse.User.currentAsync();
            
            if (!user) {
                return;
            }
            
            const sessionToken =
                user.getSessionToken();
            
            if (!sessionToken) {
                return;
            }
            
            localStorage.setItem(
                REMEMBERED_SESSION_KEY,
                JSON.stringify({
                    sessionToken: sessionToken,
                    
                    userId: user.id
                })
            );
            
        } catch (error) {
            
            console.error(
                "Session remember error:",
                error
            );
            
        }
        
    }
    
    async function restoreSession() {
        
        try {
            
            const settings =
                getSettings();
            
            if (settings.logoutOnExit) {
                return null;
            }
            
            const currentUser =
                await Parse.User.currentAsync();
            
            if (currentUser) {
                return currentUser;
            }
            
            if (
                !settings.keepSignedIn &&
                !settings.rememberDevice
            ) {
                
                return null;
                
            }
            
            const savedSession =
                localStorage.getItem(
                    REMEMBERED_SESSION_KEY
                );
            
            if (!savedSession) {
                return null;
            }
            
            const remembered =
                JSON.parse(
                    savedSession
                );
            
            if (
                !remembered ||
                !remembered.sessionToken
            ) {
                
                localStorage.removeItem(
                    REMEMBERED_SESSION_KEY
                );
                
                return null;
                
            }
            
            const user =
                await Parse.User.become(
                    remembered.sessionToken
                );
            
            if (!user) {
                
                localStorage.removeItem(
                    REMEMBERED_SESSION_KEY
                );
                
                return null;
                
            }
            
            return user;
            
        } catch (error) {
            
            localStorage.removeItem(
                REMEMBERED_SESSION_KEY
            );
            
            return null;
            
        }
        
    }
    
    function saveReturnUrl() {
        
        const currentUrl =
            window.location.href;
        
        if (
            window.location.pathname.endsWith(
                "/login.html"
            )
        ) {
            return;
        }
        
        localStorage.setItem(
            RETURN_URL_KEY,
            currentUrl
        );
        
    }
    
    function getReturnUrl() {
        
        const savedUrl =
            localStorage.getItem(
                RETURN_URL_KEY
            );
        
        if (
            !savedUrl ||
            !savedUrl.startsWith(
                window.location.origin
            )
        ) {
            
            return "dashboard.html";
            
        }
        
        return savedUrl;
        
    }
    
    function clearReturnUrl() {
        
        localStorage.removeItem(
            RETURN_URL_KEY
        );
        
    }
    
    function markPageExit() {
        
        const settings =
            getSettings();
        
        if (!settings.logoutOnExit) {
            return;
        }
        
        if (
            window.location.pathname.endsWith(
                "/login.html"
            )
        ) {
            return;
        }
        
        if (
            window.location.pathname.endsWith(
                "/index.html"
            )
        ) {
            return;
        }
        
        const user =
            Parse.User.current();
        
        if (!user) {
            return;
        }
        
        saveReturnUrl();
        
        localStorage.setItem(
            EXIT_INTENT_KEY,
            JSON.stringify({
                url: window.location.href,
                
                time: Date.now()
            })
        );
        
    }
    
    async function processPageReturn() {
        
        const settings =
            getSettings();
        
        const exitIntent =
            localStorage.getItem(
                EXIT_INTENT_KEY
            );
        
        if (!exitIntent) {
            return false;
        }
        
        if (
            window.location.pathname.endsWith(
                "/login.html"
            )
        ) {
            return false;
        }
        
        let intent;
        
        try {
            
            intent =
                JSON.parse(
                    exitIntent
                );
            
        } catch (error) {
            
            localStorage.removeItem(
                EXIT_INTENT_KEY
            );
            
            return false;
            
        }
        
        const referrer =
            document.referrer || "";
        
        const sameOrigin =
            referrer.startsWith(
                window.location.origin
            );
        
        if (
            sameOrigin &&
            intent &&
            intent.url &&
            intent.url !== window.location.href
        ) {
            
            localStorage.removeItem(
                EXIT_INTENT_KEY
            );
            
            return false;
            
        }
        
        if (!settings.logoutOnExit) {
            
            localStorage.removeItem(
                EXIT_INTENT_KEY
            );
            
            return false;
            
        }
        
        localStorage.removeItem(
            EXIT_INTENT_KEY
        );
        
        localStorage.removeItem(
            REMEMBERED_SESSION_KEY
        );
        
        try {
            
            await Parse.User.logOut();
            
        } catch (error) {
            
            console.error(
                "Logout on exit error:",
                error
            );
            
        }
        
        if (
            !window.location.pathname.endsWith(
                "/login.html"
            )
        ) {
            
            window.location.replace(
                "login.html"
            );
            
        }
        
        return true;
        
    }
    
    async function initializeAuthentication() {
        
        if (
            typeof Parse === "undefined" ||
            !Parse.User
        ) {
            return;
        }
        
        const loggedOut =
            await processPageReturn();
        
        if (loggedOut) {
            return;
        }
        
        const settings =
            getSettings();
        
        if (settings.logoutOnExit) {
            return;
        }
        
        const user =
            await restoreSession();
        
        if (user) {
            await rememberCurrentSession();
        }
        
    }
    
    function updateSettings(settings) {
        
        const updated =
            saveSettings(settings);
        
        if (
            updated.keepSignedIn ||
            updated.rememberDevice
        ) {
            
            rememberCurrentSession();
            
        }
        
        return updated;
        
    }
    
    window.InvoiceProAuth = {
        
        getSettings: getSettings,
        
        saveSettings: updateSettings,
        
        rememberCurrentSession: rememberCurrentSession,
        
        restoreSession: restoreSession,
        
        saveReturnUrl: saveReturnUrl,
        
        getReturnUrl: getReturnUrl,
        
        clearReturnUrl: clearReturnUrl
        
    };
    
    window.addEventListener(
        "pagehide",
        markPageExit
    );
    
    if (
        document.readyState ===
        "loading"
    ) {
        
        document.addEventListener(
            "DOMContentLoaded",
            initializeAuthentication
        );
        
    } else {
        
        initializeAuthentication();
        
    }
    
})();

(function() {
    
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
                    
                    if (!value) {
                        continue;
                    }
                    
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
    
    async function getLoggedInUser() {
        
        try {
            
            if (
                typeof Parse !== "undefined" &&
                Parse.User &&
                typeof Parse.User.current === "function"
            ) {
                
                const currentUser =
                    Parse.User.current();
                
                if (currentUser) {
                    
                    if (
                        typeof currentUser.isAuthenticated === "function"
                    ) {
                        
                        const authenticated =
                            currentUser.isAuthenticated();
                        
                        if (authenticated) {
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
    
    function getUserValue(user, keys) {
        
        for (const key of keys) {
            
            let value = "";
            
            try {
                
                if (
                    user &&
                    typeof user.get === "function"
                ) {
                    
                    value =
                        user.get(key);
                    
                } else if (user) {
                    
                    value =
                        user[key];
                    
                }
                
            } catch (error) {
                
                value = "";
                
            }
            
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
            getUserValue(
                user,
                [
                    "fullName",
                    "name",
                    "username"
                ]
            );
        
        const email =
            getUserValue(
                user,
                [
                    "email"
                ]
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
        
        let image = "";
        
        try {
            
            if (
                user &&
                typeof user.get === "function"
            ) {
                
                const profileImage =
                    user.get("profileImage");
                
                if (
                    profileImage &&
                    typeof profileImage.url === "function"
                ) {
                    
                    image =
                        profileImage.url() || "";
                    
                } else if (
                    typeof profileImage === "string"
                ) {
                    
                    image =
                        profileImage;
                    
                }
                
            } else if (user) {
                
                image =
                    user.profileImage ||
                    user.profileImageUrl ||
                    "";
                
            }
            
        } catch (error) {
            
            image = "";
            
        }
        
        return image;
        
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
                function() {
                    
                    profileButton.innerHTML =
                        "";
                    
                    const initialElement =
                        document.createElement("span");
                    
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
                document.createElement("span");
            
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
            function() {
                
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
        
        if (!headerButtons) {
            return;
        }
        
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
            
            const profileButton =
                createProfileButton(user);
            
            loginButton.replaceWith(
                profileButton
            );
            
        } else {
            
            const existingProfile =
                headerButtons.querySelector(
                    ".header-profile-btn"
                );
            
            if (!existingProfile) {
                
                const profileButton =
                    createProfileButton(user);
                
                headerButtons.insertBefore(
                    profileButton,
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
    
    const theme =
        localStorage.getItem("invoiceProTheme");
    
    if (theme === "dark") {
        
        document.documentElement.setAttribute(
            "data-theme",
            "dark"
        );
        
    }
    
})();

(function() {
    
    const CURRENT_COMPANY_KEY =
        "invoiceProCurrentCompanyId";
    
    let companies = [];
    let currentCompanyId = "";
    
    function getCompanyId(company) {
        
        if (!company) {
            return "";
        }
        
        return String(
            company.companyId ||
            company.id ||
            ""
        );
        
    }
    
    function getCompanyName(company) {
        
        if (!company) {
            return "Select Company";
        }
        
        return String(
            company.businessName ||
            "Unnamed Company"
        ).trim();
        
    }
    
    function createCompanySwitcher() {
        
        const sidebarLogo =
            document.querySelector(
                ".sidebar-logo"
            );
        
        if (!sidebarLogo) {
            return null;
        }
        
        let switcher =
            document.getElementById(
                "invoiceProCompanySwitcher"
            );
        
        if (switcher) {
            return switcher;
        }
        
        switcher =
            document.createElement("div");
        
        switcher.id =
            "invoiceProCompanySwitcher";
        
        switcher.style.position =
            "relative";
        
        switcher.style.marginTop =
            "12px";
        
        const button =
            document.createElement("button");
        
        button.type =
            "button";
        
        button.style.width =
            "100%";
        
        button.style.display =
            "flex";
        
        button.style.alignItems =
            "center";
        
        button.style.justifyContent =
            "space-between";
        
        button.style.gap =
            "8px";
        
        button.style.padding =
            "9px 10px";
        
        button.style.border =
            "1px solid rgba(255,255,255,0.10)";
        
        button.style.borderRadius =
            "10px";
        
        button.style.background =
            "rgba(255,255,255,0.05)";
        
        button.style.color =
            "inherit";
        
        button.style.cursor =
            "pointer";
        
        const left =
            document.createElement("span");
        
        left.style.minWidth =
            "0";
        
        left.style.display =
            "flex";
        
        left.style.alignItems =
            "center";
        
        left.style.gap =
            "8px";
        
        const icon =
            document.createElement("i");
        
        icon.className =
            "ri-building-4-line";
        
        const name =
            document.createElement("span");
        
        name.style.overflow =
            "hidden";
        
        name.style.textOverflow =
            "ellipsis";
        
        name.style.whiteSpace =
            "nowrap";
        
        name.textContent =
            "Loading...";
        
        const arrow =
            document.createElement("i");
        
        arrow.className =
            "ri-arrow-down-s-line";
        
        left.appendChild(icon);
        left.appendChild(name);
        
        button.appendChild(left);
        button.appendChild(arrow);
        
        const dropdown =
            document.createElement("div");
        
        dropdown.style.display =
            "none";
        
        dropdown.style.position =
            "absolute";
        
        dropdown.style.left =
            "0";
        
        dropdown.style.right =
            "0";
        
        dropdown.style.top =
            "calc(100% + 6px)";
        
        dropdown.style.zIndex =
            "9999";
        
        dropdown.style.padding =
            "6px";
        
        dropdown.style.border =
            "1px solid rgba(255,255,255,0.12)";
        
        dropdown.style.borderRadius =
            "10px";
        
        dropdown.style.background =
            "var(--navy-900, #041229)";
        
        dropdown.style.boxShadow =
            "0 15px 35px rgba(0,0,0,0.35)";
        
        switcher.appendChild(button);
        switcher.appendChild(dropdown);
        
        sidebarLogo.appendChild(
            switcher
        );
        
        button.addEventListener(
            "click",
            function(event) {
                
                event.stopPropagation();
                
                dropdown.style.display =
                    dropdown.style.display === "none" ?
                    "block" :
                    "none";
                
            }
        );
        
        dropdown.addEventListener(
            "click",
            function(event) {
                
                event.stopPropagation();
                
            }
        );
        
        document.addEventListener(
            "click",
            function() {
                
                dropdown.style.display =
                    "none";
                
            }
        );
        
        switcher._companyName =
            name;
        
        switcher._dropdown =
            dropdown;
        
        return switcher;
        
    }
    
    async function loadCompanies() {
        
        try {
            
            const user =
                Parse.User.current();
            
            if (!user) {
                return;
            }
            
            const result =
                await Parse.Cloud.run(
                    "getCompanies"
                );
            
            if (
                !result ||
                !Array.isArray(
                    result.companies
                )
            ) {
                companies = [];
                return;
            }
            
            companies =
                result.companies;
            
        } catch (error) {
            
            console.error(
                "Failed to load companies:",
                error
            );
            
            companies = [];
            
        }
        
    }
    
    async function loadCurrentCompany() {
        
        try {
            
            const result =
                await Parse.Cloud.run(
                    "getCurrentCompany"
                );
            
            if (
                result &&
                result.success &&
                result.company
            ) {
                
                currentCompanyId =
                    getCompanyId(
                        result.company
                    );
                
                localStorage.setItem(
                    CURRENT_COMPANY_KEY,
                    currentCompanyId
                );
                
                return result.company;
                
            }
            
            const storedCompanyId =
                localStorage.getItem(
                    CURRENT_COMPANY_KEY
                );
            
            if (storedCompanyId) {
                
                const storedCompany =
                    companies.find(
                        function(company) {
                            
                            return (
                                getCompanyId(
                                    company
                                ) ===
                                storedCompanyId
                            );
                            
                        }
                    );
                
                if (storedCompany) {
                    
                    currentCompanyId =
                        storedCompanyId;
                    
                    return storedCompany;
                    
                }
                
            }
            
            if (companies.length > 0) {
                
                currentCompanyId =
                    getCompanyId(
                        companies[0]
                    );
                
                localStorage.setItem(
                    CURRENT_COMPANY_KEY,
                    currentCompanyId
                );
                
                await Parse.Cloud.run(
                    "selectCompany",
                    {
                        companyId: currentCompanyId
                    }
                );
                
                return companies[0];
                
            }
            
        } catch (error) {
            
            console.error(
                "Failed to load current company:",
                error
            );
            
        }
        
        return null;
        
    }
    
    function renderCompanySwitcher(
        currentCompany
    ) {
        
        const switcher =
            createCompanySwitcher();
        
        if (!switcher) {
            return;
        }
        
        switcher._companyName.textContent =
            currentCompany ?
            getCompanyName(
                currentCompany
            ) :
            "No Company";
        
        switcher._dropdown.innerHTML =
            "";
        
        companies.forEach(
            function(company) {
                
                const companyId =
                    getCompanyId(
                        company
                    );
                
                const companyName =
                    getCompanyName(
                        company
                    );
                
                const item =
                    document.createElement(
                        "button"
                    );
                
                item.type =
                    "button";
                
                item.textContent =
                    companyName;
                
                item.style.width =
                    "100%";
                
                item.style.display =
                    "block";
                
                item.style.textAlign =
                    "left";
                
                item.style.padding =
                    "9px 10px";
                
                item.style.border =
                    "0";
                
                item.style.borderRadius =
                    "7px";
                
                item.style.background =
                    companyId ===
                    currentCompanyId ?
                    "rgba(255,255,255,0.10)" :
                    "transparent";
                
                item.style.color =
                    "inherit";
                
                item.style.cursor =
                    "pointer";
                
                item.addEventListener(
                    "click",
                    async function() {
                        
                        if (
                            companyId ===
                            currentCompanyId
                        ) {
                            
                            switcher
                                ._dropdown
                                .style
                                .display =
                                "none";
                            
                            return;
                            
                        }
                        
                        item.disabled =
                            true;
                        
                        try {
                            
                            await Parse.Cloud.run(
                                "selectCompany",
                                {
                                    companyId: companyId
                                }
                            );
                            
                            localStorage.setItem(
                                CURRENT_COMPANY_KEY,
                                companyId
                            );
                            
                            currentCompanyId =
                                companyId;
                            
                            window.location.reload();
                            
                        } catch (error) {
                            
                            console.error(
                                "Company switch error:",
                                error
                            );
                            
                            item.disabled =
                                false;
                            
                        }
                        
                    }
                );
                
                switcher
                    ._dropdown
                    .appendChild(item);
                
            }
        );
        
    }
    
    async function initializeCompanySwitcher() {
        
        try {
            
            const user =
                Parse.User.current();
            
            if (!user) {
                return;
            }
            
            await loadCompanies();
            
            if (!companies.length) {
                createCompanySwitcher();
                return;
            }
            
            const currentCompany =
                await loadCurrentCompany();
            
            renderCompanySwitcher(
                currentCompany
            );
            
        } catch (error) {
            
            console.error(
                "Company switcher initialization error:",
                error
            );
            
        }
        
    }
    
    if (
        document.readyState ===
        "loading"
    ) {
        
        document.addEventListener(
            "DOMContentLoaded",
            initializeCompanySwitcher
        );
        
    } else {
        
        initializeCompanySwitcher();
        
    }
    
})();

document.addEventListener(
    "DOMContentLoaded",
    function() {
        
        const sidebar =
            document.getElementById("sidebar");
        
        const sidebarOverlay =
            document.getElementById("sidebarOverlay");
        
        const menuToggle =
            document.getElementById("menuToggle");
        
        const settingsToggle =
            document.getElementById("settingsToggle");
        
        const settingsDropdown =
            document.getElementById("settingsDropdown");
        
        if (!sidebar) {
            return;
        }
        
        function updateSidebarLayout() {
            
            if (window.innerWidth > 992) {
                
                sidebar.classList.add("show");
                
                if (sidebarOverlay) {
                    sidebarOverlay.classList.remove("show");
                }
                
                if (menuToggle) {
                    menuToggle.style.display = "none";
                }
                
            } else {
                
                sidebar.classList.remove("show");
                
                if (sidebarOverlay) {
                    sidebarOverlay.classList.remove("show");
                }
                
                if (menuToggle) {
                    menuToggle.style.display = "";
                }
                
            }
            
        }
        
        if (menuToggle) {
            
            menuToggle.addEventListener(
                "click",
                function() {
                    
                    sidebar.classList.add("show");
                    
                    if (sidebarOverlay) {
                        sidebarOverlay.classList.add("show");
                    }
                    
                }
            );
            
        }
        
        if (sidebarOverlay) {
            
            sidebarOverlay.addEventListener(
                "click",
                function() {
                    
                    sidebar.classList.remove("show");
                    
                    sidebarOverlay.classList.remove("show");
                    
                }
            );
            
        }
        
        if (
            settingsToggle &&
            settingsDropdown
        ) {
            
            settingsToggle.addEventListener(
                "click",
                function() {
                    
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
            function(link) {
                
                link.addEventListener(
                    "click",
                    function() {
                        
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

document.addEventListener("DOMContentLoaded", async function() {
    
    try {
        
        const user = Parse.User.current();
        
        if (!user) {
            return;
        }
        
        const profileImage =
            user.get("profileImage");
        
        if (
            !profileImage ||
            typeof profileImage.url !== "function"
        ) {
            return;
        }
        
        const imageUrl =
            profileImage.url();
        
        if (!imageUrl) {
            return;
        }
        
        const profileImages =
            document.querySelectorAll(
                ".profile-avatar, .header-avatar img"
            );
        
        profileImages.forEach(function(image) {
            
            image.src = imageUrl;
            
        });
        
    } catch (error) {
        
        console.error(
            "Profile image load error:",
            error
        );
        
    }
    
});