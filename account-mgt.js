(function() {
    
    "use strict";
    
    const accountAvatar =
        document.getElementById("logoutAccountAvatar");
    
    const accountName =
        document.getElementById("logoutAccountName");
    
    const accountEmail =
        document.getElementById("logoutAccountEmail");
    
    const keepSignedInToggle =
        document.getElementById("keepSignedInToggle");
    
    const logoutOnExitToggle =
        document.getElementById("logoutOnExitToggle");
    
    const rememberDeviceToggle =
        document.getElementById("rememberDeviceToggle");
    
    const logoutButton =
        document.getElementById("logoutButton");
    
    const logoutAllDevicesButton =
        document.getElementById("logoutAllDevicesButton");
    
    const logoutModal =
        document.getElementById("logoutModal");
    
    const cancelLogoutButton =
        document.getElementById("cancelLogoutButton");
    
    const confirmLogoutButton =
        document.getElementById("confirmLogoutButton");
    
    const logoutErrorMessage =
        document.getElementById("logoutErrorMessage");
    
    const SETTINGS_KEY =
        "invoiceProLogoutSettings";
    
    const DEVICE_KEY =
        "invoiceProRememberedDevice";
    
    let logoutInProgress = false;
    
    function showToast(message) {
        
        if (typeof window.showToast === "function") {
            window.showToast(message);
            return;
        }
        
        const toastContainer =
            document.getElementById("toastContainer");
        
        if (!toastContainer) {
            return;
        }
        
        const toast =
            document.createElement("div");
        
        toast.className = "toast";
        
        toast.textContent =
            message;
        
        toastContainer.appendChild(toast);
        
        setTimeout(function() {
            
            toast.classList.add("show");
            
        }, 10);
        
        setTimeout(function() {
            
            toast.classList.remove("show");
            
            setTimeout(function() {
                
                toast.remove();
                
            }, 300);
            
        }, 3500);
        
    }
    
    function getDeviceId() {
        
        let deviceId =
            localStorage.getItem(DEVICE_KEY);
        
        if (deviceId) {
            return deviceId;
        }
        
        if (
            typeof crypto !== "undefined" &&
            typeof crypto.randomUUID === "function"
        ) {
            
            deviceId =
                crypto.randomUUID();
            
        } else {
            
            deviceId =
                "device-" +
                Date.now() +
                "-" +
                Math.random()
                .toString(36)
                .substring(2);
            
        }
        
        localStorage.setItem(
            DEVICE_KEY,
            deviceId
        );
        
        return deviceId;
        
    }
    
    function removeRememberedDevice() {
        
        try {
            
            localStorage.removeItem(
                DEVICE_KEY
            );
            
        } catch (error) {
            
            console.warn(
                "Unable to remove remembered device.",
                error
            );
            
        }
        
    }
    
    function saveSettings() {
        
        if (
            !window.InvoiceProAuth
        ) {
            return;
        }
        
        window.InvoiceProAuth.saveSettings({
            
            keepSignedIn: keepSignedInToggle.checked,
            
            logoutOnExit: logoutOnExitToggle.checked,
            
            rememberDevice: rememberDeviceToggle.checked
            
        });
        
    }
    
    function loadSettings() {
        
        if (
            !window.InvoiceProAuth
        ) {
            return;
        }
        
        const settings =
            window.InvoiceProAuth.getSettings();
        
        keepSignedInToggle.checked =
            settings.keepSignedIn;
        
        logoutOnExitToggle.checked =
            settings.logoutOnExit;
        
        rememberDeviceToggle.checked =
            settings.rememberDevice;
        
    }
    
    function getCurrentUser() {
        
        if (
            typeof Parse === "undefined" ||
            !Parse.User
        ) {
            return null;
        }
        
        return Parse.User.current();
        
    }
    
    function getUserName(user) {
        
        if (!user) {
            return "InvoicePro User";
        }
        
        return (
            user.get("fullName") ||
            user.get("name") ||
            user.get("username") ||
            user.get("email") ||
            "InvoicePro User"
        );
        
    }
    
    function getUserEmail(user) {
        
        if (!user) {
            return "";
        }
        
        return (
            user.get("email") ||
            ""
        );
        
    }
    
    function getProfileImageURL(user) {
        
        if (!user) {
            return "";
        }
        
        const profileImage =
            user.get("profileImage");
        
        if (!profileImage) {
            return "";
        }
        
        if (
            typeof profileImage === "object" &&
            typeof profileImage.url === "function"
        ) {
            
            return profileImage.url() || "";
            
        }
        
        if (
            typeof profileImage === "string"
        ) {
            
            return profileImage;
            
        }
        
        return "";
        
    }
    
    function setDefaultAvatar() {
        
        if (!accountAvatar) {
            return;
        }
        
        accountAvatar.innerHTML =
            '<i class="ri-user-line"></i>';
        
    }
    
    function setAccountAvatar(user) {
        
        if (!accountAvatar) {
            return;
        }
        
        const imageURL =
            getProfileImageURL(user);
        
        if (!imageURL) {
            
            setDefaultAvatar();
            
            return;
            
        }
        
        accountAvatar.innerHTML = "";
        
        const image =
            document.createElement("img");
        
        image.src =
            imageURL;
        
        image.alt =
            "Profile";
        
        image.loading =
            "lazy";
        
        image.onerror =
            function() {
                
                setDefaultAvatar();
                
            };
        
        accountAvatar.appendChild(
            image
        );
        
    }
    
    function loadCurrentUser() {
        
        if (
            typeof Parse === "undefined" ||
            !Parse.User
        ) {
            
            if (accountName) {
                accountName.textContent =
                    "InvoicePro User";
            }
            
            if (accountEmail) {
                accountEmail.textContent =
                    "";
            }
            
            setDefaultAvatar();
            
            return;
            
        }
        
        const user =
            getCurrentUser();
        
        if (!user) {
            
            if (accountName) {
                accountName.textContent =
                    "No active session";
            }
            
            if (accountEmail) {
                accountEmail.textContent =
                    "You are currently logged out.";
            }
            
            setDefaultAvatar();
            
            return;
            
        }
        
        if (accountName) {
            
            accountName.textContent =
                getUserName(user);
            
        }
        
        if (accountEmail) {
            
            accountEmail.textContent =
                getUserEmail(user);
            
        }
        
        setAccountAvatar(user);
        
    }
    
    function openLogoutModal() {
        
        if (!logoutModal) {
            return;
        }
        
        if (logoutErrorMessage) {
            
            logoutErrorMessage.textContent =
                "";
            
        }
        
        logoutModal.classList.add(
            "active"
        );
        
        logoutModal.setAttribute(
            "aria-hidden",
            "false"
        );
        
        document.body.classList.add(
            "logout-modal-open"
        );
        
    }
    
    function closeLogoutModal() {
        
        if (!logoutModal) {
            return;
        }
        
        if (logoutInProgress) {
            return;
        }
        
        logoutModal.classList.remove(
            "active"
        );
        
        logoutModal.setAttribute(
            "aria-hidden",
            "true"
        );
        
        document.body.classList.remove(
            "logout-modal-open"
        );
        
        if (logoutErrorMessage) {
            
            logoutErrorMessage.textContent =
                "";
            
        }
        
    }
    
    function setLogoutButtonsLoading(
        loading
    ) {
        
        if (
            !confirmLogoutButton ||
            !cancelLogoutButton
        ) {
            return;
        }
        
        confirmLogoutButton.disabled =
            loading;
        
        cancelLogoutButton.disabled =
            loading;
        
        if (loading) {
            
            confirmLogoutButton.innerHTML = `
                <span class="logout-loading-spinner"></span>
                <span>Logging out...</span>
            `;
            
        } else {
            
            confirmLogoutButton.innerHTML = `
                <i class="ri-logout-box-r-line"></i>
                <span>Log Out</span>
            `;
            
        }
        
    }
    
    async function logoutCurrentDevice() {
        
        if (logoutInProgress) {
            return;
        }
        
        logoutInProgress =
            true;
        
        if (logoutErrorMessage) {
            
            logoutErrorMessage.textContent =
                "";
            
        }
        
        setLogoutButtonsLoading(
            true
        );
        
        try {
            
            if (
                typeof Parse === "undefined" ||
                !Parse.User
            ) {
                
                throw new Error(
                    "Parse SDK is not loaded."
                );
                
            }
            
            const user =
                Parse.User.current();
            
            if (!user) {
                
                window.location.replace(
                    "login.html"
                );
                
                return;
                
            }
            
            await Parse.User.logOut();
            
            localStorage.removeItem(
                "invoiceProRememberedSession"
            );
            
            if (Parse.User.current()) {
                
                throw new Error(
                    "The current session could not be cleared."
                );
                
            }
            
            removeRememberedDevice();
            
            try {
                
                sessionStorage.clear();
                
            } catch (error) {
                
                console.warn(
                    "Unable to clear session storage.",
                    error
                );
                
            }
            
            window.location.replace(
                "login.html"
            );
            
        } catch (error) {
            
            console.error(
                "Logout failed:",
                error
            );
            
            if (logoutErrorMessage) {
                
                logoutErrorMessage.textContent =
                    error.message ||
                    "Unable to log out. Please try again.";
                
            }
            
            setLogoutButtonsLoading(
                false
            );
            
            logoutInProgress =
                false;
            
        }
        
    }
    
    async function logoutEverywhere() {
        
        if (logoutInProgress) {
            return;
        }
        
        if (
            typeof Parse === "undefined" ||
            !Parse.User
        ) {
            
            showToast(
                "Unable to log out of all devices. Parse SDK is not loaded."
            );
            
            return;
            
        }
        
        const user =
            Parse.User.current();
        
        if (!user) {
            
            window.location.replace(
                "login.html"
            );
            
            return;
            
        }
        
        const originalHTML =
            logoutAllDevicesButton.innerHTML;
        
        logoutInProgress =
            true;
        
        logoutAllDevicesButton.disabled =
            true;
        
        logoutAllDevicesButton.innerHTML = `
        <span class="logout-loading-spinner"></span>
        <span>Logging Out...</span>
    `;
        
        try {
            
            const result =
                await Parse.Cloud.run(
                    "logoutAllDevices"
                );
            
            if (
                !result ||
                result.success !== true
            ) {
                
                throw new Error(
                    "The server could not revoke the active sessions."
                );
                
            }
            
            localStorage.removeItem(
                "invoiceProRememberedSession"
            );
            
            removeRememberedDevice();
            
            try {
                
                localStorage.removeItem(
                    SETTINGS_KEY
                );
                
            } catch (error) {
                
                console.warn(
                    "Unable to clear logout settings.",
                    error
                );
                
            }
            
            try {
                
                sessionStorage.clear();
                
            } catch (error) {
                
                console.warn(
                    "Unable to clear session storage.",
                    error
                );
                
            }
            
            await new Promise(
                function(resolve) {
                    
                    setTimeout(
                        resolve,
                        250
                    );
                    
                }
            );
            
            window.location.replace(
                "login.html"
            );
            
        } catch (error) {
            
            console.error(
                "Log out everywhere failed:",
                error
            );
            
            logoutAllDevicesButton.disabled =
                false;
            
            logoutAllDevicesButton.innerHTML =
                originalHTML;
            
            logoutInProgress =
                false;
            
            showToast(
                error.message ||
                "Unable to log out of all devices. Please try again."
            );
            
        }
        
    }
    
    function handleKeepSignedInChange() {
        
        if (
            keepSignedInToggle &&
            keepSignedInToggle.checked
        ) {
            
            if (logoutOnExitToggle) {
                logoutOnExitToggle.checked = false;
            }
            
            saveSettings();
            
            showToast(
                "Your session will remain available when you reopen InvoicePro on this device."
            );
            
        } else {
            
            saveSettings();
            
            showToast(
                "Keep me signed in has been turned off."
            );
            
        }
        
    }
    
    function handleLogoutOnExitChange() {
        
        saveSettings();
        
        if (
            logoutOnExitToggle &&
            logoutOnExitToggle.checked
        ) {
            
            showToast(
                "InvoicePro will sign you out when you leave the application."
            );
            
        } else {
            
            showToast(
                "Automatic logout when leaving InvoicePro has been turned off."
            );
            
        }
        
    }
    
    function handleRememberDeviceChange() {
        
        if (
            rememberDeviceToggle &&
            rememberDeviceToggle.checked
        ) {
            
            const deviceId =
                getDeviceId();
            
            if (!deviceId) {
                rememberDeviceToggle.checked = false;
                saveSettings();
                
                showToast(
                    "This device could not be remembered."
                );
                
                return;
            }
            
            saveSettings();
            
            showToast(
                "This device will be remembered."
            );
            
        } else {
            
            removeRememberedDevice();
            
            saveSettings();
            
            showToast(
                "This device will no longer be remembered."
            );
            
        }
        
    }
    
    if (keepSignedInToggle) {
        
        keepSignedInToggle.addEventListener(
            "change",
            handleKeepSignedInChange
        );
        
    }
    
    if (logoutOnExitToggle) {
        
        logoutOnExitToggle.addEventListener(
            "change",
            handleLogoutOnExitChange
        );
        
    }
    
    if (rememberDeviceToggle) {
        
        rememberDeviceToggle.addEventListener(
            "change",
            handleRememberDeviceChange
        );
        
    }
    
    if (logoutButton) {
        
        logoutButton.addEventListener(
            "click",
            function() {
                
                openLogoutModal();
                
            }
        );
        
    }
    
    if (cancelLogoutButton) {
        
        cancelLogoutButton.addEventListener(
            "click",
            closeLogoutModal
        );
        
    }
    
    if (confirmLogoutButton) {
        
        confirmLogoutButton.addEventListener(
            "click",
            logoutCurrentDevice
        );
        
    }
    
    if (logoutAllDevicesButton) {
        
        logoutAllDevicesButton.addEventListener(
            "click",
            logoutEverywhere
        );
        
    }
    
    if (logoutModal) {
        
        logoutModal.addEventListener(
            "click",
            function(event) {
                
                if (
                    event.target === logoutModal
                ) {
                    
                    closeLogoutModal();
                    
                }
                
            }
        );
        
    }
    
    document.addEventListener(
        "keydown",
        function(event) {
            
            if (
                event.key === "Escape" &&
                logoutModal &&
                logoutModal.classList.contains("active")
            ) {
                
                closeLogoutModal();
                
            }
            
        }
    );
    
    loadSettings();
    
    loadCurrentUser();
    
})();