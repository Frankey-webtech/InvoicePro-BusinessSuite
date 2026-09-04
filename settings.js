(function () {

    "use strict";

    let settingsUserProfile = null;
    let settingsBusinessProfile = null;
    let currentSubscriptionSettings = null;

    const $ = (id) => document.getElementById(id);

    const notificationSettingIds = [
        "invoicePaidNotification",
        "invoiceOverdueNotification",
        "invoiceViewedNotification",
        "estimateAcceptedNotification",
        "estimateRejectedNotification",
        "subscriptionNotification"
    ];

    const defaultNotificationSettings = {
        invoicePaidNotification: true,
        invoiceOverdueNotification: true,
        invoiceViewedNotification: true,
        estimateAcceptedNotification: true,
        estimateRejectedNotification: true,
        subscriptionNotification: true
    };

    function showToast(message, type = "info", duration = 3000) {

        const toastContainer = $("toastContainer");

        if (!toastContainer) {
            return;
        }

        const toast = document.createElement("div");

        toast.className = `toast ${type}`;

        const messageSpan = document.createElement("span");

        messageSpan.textContent = message;

        const closeSpan = document.createElement("span");

        closeSpan.className = "toastClose";

        closeSpan.innerHTML = "&times;";

        toast.appendChild(messageSpan);
        toast.appendChild(closeSpan);

        toastContainer.appendChild(toast);

        let removed = false;

        const removeToast = () => {

            if (removed) {
                return;
            }

            removed = true;

            toast.style.animation = "toastOut .3s forwards";

            setTimeout(() => {

                if (toast.parentNode) {
                    toast.remove();
                }

            }, 300);

        };

        closeSpan.addEventListener(
            "click",
            removeToast
        );

        setTimeout(
            removeToast,
            duration
        );
    }

    function setButtonLoading(button, loading, loadingText) {

        if (!button) {
            return;
        }

        if (loading) {

            if (!button.dataset.originalText) {
                button.dataset.originalText = button.textContent;
            }

            button.disabled = true;

            if (loadingText) {
                button.textContent = loadingText;
            }

        } else {

            button.disabled = false;

            if (button.dataset.originalText) {
                button.textContent = button.dataset.originalText;
                delete button.dataset.originalText;
            }

        }
    }

    function getErrorMessage(error, fallback) {

        if (!error) {
            return fallback;
        }

        if (typeof error === "string") {
            return error;
        }

        return (
            error.message ||
            error.error ||
            fallback
        );
    }

    function openModal(modal) {

        if (!modal) {
            return;
        }

        modal.classList.add("active");

        modal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "settings-modal-open"
        );
    }

    function closeModal(modal) {

        if (!modal) {
            return;
        }

        modal.classList.remove("active");

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "settings-modal-open"
        );
    }

    function openSecurityPasswordModal() {

        const modal =
            $("changePasswordModal");

        if (!modal) {
            return;
        }

        openModal(modal);

        const form =
            $("changePasswordForm");

        if (form) {
            form.reset();
        }

        setTimeout(() => {

            const currentPassword =
                $("currentPassword");

            if (currentPassword) {
                currentPassword.focus();
            }

        }, 100);
    }

    function closeSecurityPasswordModal() {

        const modal =
            $("changePasswordModal");

        closeModal(modal);

        const form =
            $("changePasswordForm");

        if (form) {
            form.reset();
        }
    }

    function initializePasswordModal() {

        const openButton =
            $("changePasswordButton");

        const closeButton =
            $("closeChangePasswordModal");

        const cancelButton =
            $("cancelChangePassword");

        const overlay =
            $("changePasswordModalOverlay");

        if (openButton) {

            openButton.addEventListener(
                "click",
                openSecurityPasswordModal
            );

        }

        if (closeButton) {

            closeButton.addEventListener(
                "click",
                closeSecurityPasswordModal
            );

        }

        if (cancelButton) {

            cancelButton.addEventListener(
                "click",
                closeSecurityPasswordModal
            );

        }

        if (overlay) {

            overlay.addEventListener(
                "click",
                closeSecurityPasswordModal
            );

        }

        const form =
            $("changePasswordForm");

        if (form) {

            form.addEventListener(
                "submit",
                handleChangePassword
            );

        }

        document
            .querySelectorAll(
                ".password-visibility-button"
            )
            .forEach((button) => {

                button.addEventListener(
                    "click",
                    function () {

                        const targetId =
                            this.dataset.target;

                        const input =
                            $(targetId);

                        if (!input) {
                            return;
                        }

                        const icon =
                            this.querySelector("i");

                        if (
                            input.type ===
                            "password"
                        ) {

                            input.type = "text";

                            if (icon) {
                                icon.className =
                                    "ri-eye-off-line";
                            }

                            this.setAttribute(
                                "aria-label",
                                "Hide password"
                            );

                        } else {

                            input.type = "password";

                            if (icon) {
                                icon.className =
                                    "ri-eye-line";
                            }

                            this.setAttribute(
                                "aria-label",
                                "Show password"
                            );

                        }

                    }
                );

            });
    }

    async function handleChangePassword(event) {

        event.preventDefault();

        const currentPassword =
            $("currentPassword")?.value.trim();

        const newPassword =
            $("newPassword")?.value || "";

        const confirmPassword =
            $("confirmPassword")?.value || "";

        if (
            !currentPassword ||
            !newPassword ||
            !confirmPassword
        ) {

            showToast(
                "Please fill in all required fields.",
                "error"
            );

            return;
        }

        if (newPassword.length < 8) {

            showToast(
                "Password must be at least 8 characters.",
                "error"
            );

            return;
        }

        if (newPassword !== confirmPassword) {

            showToast(
                "Passwords do not match.",
                "error"
            );

            return;
        }

        if (currentPassword === newPassword) {

            showToast(
                "Your new password must be different from your current password.",
                "error"
            );

            return;
        }

        const submitButton =
            $("submitChangePassword");

        setButtonLoading(
            submitButton,
            true,
            "Changing..."
        );

        try {

            const result =
                await Parse.Cloud.run(
                    "changeUserPassword",
                    {
                        currentPassword,
                        newPassword,
                        confirmPassword
                    }
                );

            showToast(
                result?.message ||
                "Password changed successfully. Please log in again.",
                "success",
                5000
            );

            closeSecurityPasswordModal();

        } catch (error) {

            console.error(
                "Password change failed:",
                error
            );

            showToast(
                getErrorMessage(
                    error,
                    "Unable to change your password."
                ),
                "error"
            );

        } finally {

            setButtonLoading(
                submitButton,
                false
            );

        }
    }

    async function loadSettingsUserProfile() {

        try {

            const result =
                await Parse.Cloud.run(
                    "getUserProfile"
                );

            if (
                !result ||
                !result.success ||
                !result.profile
            ) {

                throw new Error(
                    "Unable to load your profile."
                );

            }

            settingsUserProfile =
                result.profile;

            const accountName =
                $("settingsAccountName");

            if (accountName) {

                accountName.textContent =
                    settingsUserProfile.fullName ||
                    "Not available";

            }

            const accountEmail =
                $("settingsAccountEmail");

            if (accountEmail) {

                accountEmail.textContent =
                    settingsUserProfile.email ||
                    "Not available";

            }

            const accountId =
                $("settingsAccountId");

            if (accountId) {

                accountId.textContent =
                    settingsUserProfile.id ||
                    "Not available";

            }

            return settingsUserProfile;

        } catch (error) {

            console.error(
                "Settings profile loading failed:",
                error
            );

            showToast(
                getErrorMessage(
                    error,
                    "Unable to load your profile."
                ),
                "error"
            );

            return null;
        }
    }

    async function loadSettingsBusinessProfile() {

    try {

        const currentUser = Parse.User.current();

        if (!currentUser) {

            throw new Error(
                "You are not logged in."
            );

        }

        const BusinessProfile =
            Parse.Object.extend("BusinessProfile");

        const query =
            new Parse.Query(BusinessProfile);

        query.equalTo(
            "user",
            currentUser
        );

        const profile =
            await query.first();

        if (!profile) {

            settingsBusinessProfile = null;

            displaySettingsBusinessProfile(null);

            return null;
        }

        settingsBusinessProfile = {

            objectId:
                profile.id,

            businessName:
                profile.get("businessName") || "",

            businessEmail:
                profile.get("businessEmail") || "",

            businessPhone:
                profile.get("businessPhone") || "",

            businessWebsite:
                profile.get("businessWebsite") || "",

            businessAddress:
                profile.get("businessAddress") || "",

            businessTaxId:
                profile.get("businessTaxId") || "",

            registrationNumber:
                profile.get("registrationNumber") || "",

            invoicePrefix:
                profile.get("invoicePrefix") || "INV-",

            estimatePrefix:
                profile.get("estimatePrefix") || "EST-",

            logo:
                profile.get("logo") || null

        };

        displaySettingsBusinessProfile(
            settingsBusinessProfile
        );

        return settingsBusinessProfile;

    } catch (error) {

        console.error(
            "Business profile loading failed:",
            error
        );

        displaySettingsBusinessProfile(null);

        showToast(
            getErrorMessage(
                error,
                "Unable to load business information."
            ),
            "error"
        );

        return null;
    }
}

    async function initializeClientImageSetting() {
    const toggle = $("showClientImageToggle");

    if (!toggle) {
        return;
    }

    toggle.checked = true;

    try {
        const currentUser = Parse.User.current();

        if (!currentUser) {
            console.warn(
                "Unable to load client image setting: user is not logged in."
            );
            return;
        }

        const BusinessProfile =
            Parse.Object.extend("BusinessProfile");

        const query =
            new Parse.Query(BusinessProfile);

        query.equalTo(
            "user",
            currentUser
        );

        const profile =
            await query.first();

        if (profile) {
            const savedValue =
                profile.get("showClientImage");

            if (typeof savedValue === "boolean") {
                toggle.checked = savedValue;
            } else {
                toggle.checked = true;
            }

            if (!settingsBusinessProfile) {
                settingsBusinessProfile = {};
            }

            settingsBusinessProfile.showClientImage =
                toggle.checked;
        }
    } catch (error) {
        console.error(
            "Client image setting loading failed:",
            error
        );

        toggle.checked = true;
    }

    toggle.addEventListener(
        "change",
        async function () {
            const newValue = this.checked;

            this.disabled = true;

            try {
                const currentUser =
                    Parse.User.current();

                if (!currentUser) {
                    throw new Error(
                        "You must be logged in to change this setting."
                    );
                }

                const BusinessProfile =
                    Parse.Object.extend("BusinessProfile");

                const query =
                    new Parse.Query(BusinessProfile);

                query.equalTo(
                    "user",
                    currentUser
                );

                let profile =
                    await query.first();

                if (!profile) {
                    throw new Error(
                        "Business profile not found. Please complete your Business Profile first."
                    );
                }

                profile.set(
                    "showClientImage",
                    newValue
                );

                await profile.save();

                if (!settingsBusinessProfile) {
                    settingsBusinessProfile = {};
                }

                settingsBusinessProfile.showClientImage =
                    newValue;

                showToast(
                    newValue
                        ? "Client images enabled."
                        : "Client images disabled.",
                    "success"
                );

            } catch (error) {
                console.error(
                    "Client image setting save failed:",
                    error
                );

                this.checked = !newValue;

                showToast(
                    getErrorMessage(
                        error,
                        "Unable to save client image setting."
                    ),
                    "error"
                );

            } finally {
                this.disabled = false;
            }
        }
    );
}

    function displaySettingsBusinessProfile(profile) {

    const businessName =
        $("settingsBusinessName");

    const businessEmail =
        $("settingsBusinessEmail");

    const businessPhone =
        $("settingsBusinessPhone");

    const businessWebsite =
        $("settingsBusinessWebsite");

    const businessAddress =
        $("settingsBusinessAddress");

    const businessId =
        $("settingsBusinessId");

    if (!profile) {

        if (businessName) {
            businessName.textContent = "Not Set";
        }

        if (businessEmail) {
            businessEmail.textContent = "Not Set";
        }

        if (businessPhone) {
            businessPhone.textContent = "Not Set";
        }

        if (businessWebsite) {
            businessWebsite.textContent = "Not Set";
        }

        if (businessAddress) {
            businessAddress.textContent = "Not Set";
        }

        if (businessId) {
            businessId.textContent = "Not Set";
        }

        return;
    }

    if (businessName) {

        businessName.textContent =
            profile.businessName ||
            "Not Set";

    }

    if (businessEmail) {

        businessEmail.textContent =
            profile.businessEmail ||
            "Not Set";

    }

    if (businessPhone) {

        businessPhone.textContent =
            profile.businessPhone ||
            "Not Set";

    }

    if (businessWebsite) {

        businessWebsite.textContent =
            profile.businessWebsite ||
            "Not Set";

    }

    if (businessAddress) {

        businessAddress.textContent =
            profile.businessAddress ||
            "Not Set";

    }

    if (businessId) {

        businessId.textContent =
            profile.businessTaxId ||
            "Not Set";

    }
}

    function getBusinessValue(field) {

    if (
        settingsBusinessProfile &&
        settingsBusinessProfile[field] !== undefined
    ) {

        return settingsBusinessProfile[field];

    }

    return "";
}

    async function updateBusinessField(field, value) {

    const data = {

        businessName:
            field === "businessName"
                ? value
                : getBusinessValue("businessName"),

        businessEmail:
            field === "businessEmail"
                ? value
                : getBusinessValue("businessEmail"),

        businessPhone:
            field === "businessPhone"
                ? value
                : getBusinessValue("businessPhone"),

        businessWebsite:
            field === "businessWebsite"
                ? value
                : getBusinessValue("businessWebsite"),

        businessAddress:
            field === "businessAddress"
                ? value
                : getBusinessValue("businessAddress"),

        businessTaxId:
            field === "businessTaxId"
                ? value
                : getBusinessValue("businessTaxId"),

        primaryColor:
            getBusinessValue("primaryColor") ||
            "#2563EB",

        secondaryColor:
            getBusinessValue("secondaryColor") ||
            "#FFFFFF"
    };

    if (!data.businessName.trim()) {

        showToast(
            "Business name is required.",
            "error"
        );

        return false;
    }

    try {

        await Parse.Cloud.run(
            "updateBusinessProfile",
            data
        );

        if (!settingsBusinessProfile) {
            settingsBusinessProfile = {};
        }

        settingsBusinessProfile[field] =
            value;

        displaySettingsBusinessProfile(
            settingsBusinessProfile
        );

        showToast(
            "Business information updated successfully.",
            "success"
        );

        return true;

    } catch (error) {

        console.error(
            "Business update failed:",
            error
        );

        showToast(
            getErrorMessage(
                error,
                "Unable to update business information."
            ),
            "error"
        );

        return false;
    }
}

    async function editBusinessField(field, label) {

        const currentValue =
            getBusinessValue(field);

        const value =
            window.prompt(
                `Enter your ${label}:`,
                currentValue
            );

        if (value === null) {
            return;
        }

        const cleanedValue =
            value.trim();

        if (
            field === "businessName" &&
            !cleanedValue
        ) {

            showToast(
                "Business name is required.",
                "error"
            );

            return;
        }

        await updateBusinessField(
            field,
            cleanedValue
        );
    }

    function initializeBusinessEditing() {

        const mappings = [

            [
                "editBusinessNameButton",
                "businessName",
                "business name"
            ],

            [
                "editBusinessEmailButton",
                "businessEmail",
                "business email"
            ],

            [
                "editBusinessPhoneButton",
                "businessPhone",
                "business phone number"
            ],

            [
                "editBusinessAddressButton",
                "businessAddress",
                "business address"
            ],

            [
                "editBusinessWebsiteButton",
                "businessWebsite",
                "business website"
            ],

            [
                "editBusinessIdButton",
                "businessTaxId",
                "business ID / Tax ID"
            ]

        ];

        mappings.forEach(
            ([buttonId, field, label]) => {

                const button =
                    $(buttonId);

                if (!button) {
                    return;
                }

                button.addEventListener(
                    "click",
                    () => {

                        editBusinessField(
                            field,
                            label
                        );

                    }
                );

            }
        );

        const logoButton =
            $("manageBusinessLogoButton");

        if (logoButton) {

            logoButton.addEventListener(
                "click",
                openBusinessLogoPicker
            );

        }
    }

    function openBusinessLogoPicker() {

        let input =
            $("settingsBusinessLogoFileInput");

        if (!input) {

            input =
                document.createElement("input");

            input.type = "file";

            input.id =
                "settingsBusinessLogoFileInput";

            input.accept =
                "image/jpeg,image/jpg,image/png,image/webp";

            input.style.display =
                "none";

            document.body.appendChild(
                input
            );

            input.addEventListener(
                "change",
                handleBusinessLogoUpload
            );
        }

        input.click();
    }

    async function handleBusinessLogoUpload(event) {

        const file =
            event.target.files?.[0];

        event.target.value = "";

        if (!file) {
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
        ];

        if (
            !allowedTypes.includes(
                file.type
            )
        ) {

            showToast(
                "Only JPG, JPEG, PNG and WEBP images are allowed.",
                "error"
            );

            return;
        }

        if (
            file.size >
            5 * 1024 * 1024
        ) {

            showToast(
                "Business logo must not be larger than 5MB.",
                "error"
            );

            return;
        }

        const button =
            $("manageBusinessLogoButton");

        setButtonLoading(
            button,
            true,
            "Uploading..."
        );

        try {

            const parseFile =
                new Parse.File(
                    file.name,
                    file,
                    file.type
                );

            await parseFile.save();

            const currentName =
                getBusinessValue(
                    "businessName"
                );

            if (!currentName) {

                throw new Error(
                    "Business name is required before uploading a logo."
                );
            }

            await Parse.Cloud.run(
                "updateBusinessProfile",
                {
                    businessName:
                        currentName,

                    businessEmail:
                        getBusinessValue(
                            "businessEmail"
                        ),

                    businessPhone:
                        getBusinessValue(
                            "businessPhone"
                        ),

                    businessWebsite:
                        getBusinessValue(
                            "businessWebsite"
                        ),

                    businessAddress:
                        getBusinessValue(
                            "businessAddress"
                        ),

                    taxId:
                        getBusinessValue(
                            "businessTaxId"
                        ),

                    businessLogo:
                        parseFile,

                    primaryColor:
                        getBusinessValue(
                            "primaryColor"
                        ) || "#2563EB",

                    secondaryColor:
                        getBusinessValue(
                            "secondaryColor"
                        ) || "#FFFFFF"
                }
            );

            if (!settingsBusinessProfile) {
                settingsBusinessProfile = {};
            }

            settingsBusinessProfile.businessLogo =
                parseFile.url();

            showToast(
                "Business logo updated successfully.",
                "success"
            );

        } catch (error) {

            console.error(
                "Business logo upload failed:",
                error
            );

            showToast(
                getErrorMessage(
                    error,
                    "Unable to update business logo."
                ),
                "error"
            );

        } finally {

            setButtonLoading(
                button,
                false
            );

        }
    }

  /*  function loadNotificationSettings() {

        try {

            const saved =
                localStorage.getItem(
                    "invoiceProNotificationSettings"
                );

            const settings =
                saved
                    ? JSON.parse(saved)
                    : {
                        ...defaultNotificationSettings
                    };

            notificationSettingIds.forEach(
                (id) => {

                    const toggle =
                        $(id);

                    if (!toggle) {
                        return;
                    }

                    toggle.checked =
                        settings[id] !== undefined
                            ? Boolean(settings[id])
                            : true;

                }
            );

        } catch (error) {

            console.error(
                "Notification settings loading failed:",
                error
            );

        }
    }

    function saveNotificationSetting(
        id,
        value
    ) {

        try {

            const saved =
                localStorage.getItem(
                    "invoiceProNotificationSettings"
                );

            const settings =
                saved
                    ? JSON.parse(saved)
                    : {
                        ...defaultNotificationSettings
                    };

            settings[id] =
                Boolean(value);

            localStorage.setItem(
                "invoiceProNotificationSettings",
                JSON.stringify(settings)
            );

            showToast(
                value
                    ? "Notification enabled."
                    : "Notification disabled.",
                "success"
            );

        } catch (error) {

            console.error(
                "Notification setting save failed:",
                error
            );

            showToast(
                "Unable to save notification setting.",
                "error"
            );
        }
    }

    function initializeNotificationSettings() {

        notificationSettingIds.forEach(
            (id) => {

                const toggle =
                    $(id);

                if (!toggle) {
                    return;
                }

                toggle.addEventListener(
                    "change",
                    function () {

                        saveNotificationSetting(
                            id,
                            this.checked
                        );

                    }
                );

            }
        );
    }*/

    async function loadSubscriptionSettings() {

        try {

            const result =
                await Parse.Cloud.run(
                    "getCurrentSubscription"
                );

            if (
                !result ||
                !result.success
            ) {

                throw new Error(
                    "Unable to load subscription information."
                );
            }

            currentSubscriptionSettings =
                result;

            const currentPlan =
                $("settingsCurrentPlan");

            if (currentPlan) {

                currentPlan.textContent =
                    result.plan ||
                    "Free Plan";

            }

            const status =
                $("settingsSubscriptionStatus");

            if (status) {

                status.textContent =
                    result.subscriptionStatus ||
                    "Active";

            }

            const renewalDate =
                $("settingsRenewalDate");

            if (renewalDate) {

                if (result.renewalDate) {

                    const date =
                        new Date(
                            result.renewalDate
                        );

                    if (
                        !Number.isNaN(
                            date.getTime()
                        )
                    ) {

                        renewalDate.textContent =
                            date.toLocaleDateString(
                                undefined,
                                {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric"
                                }
                            );

                    } else {

                        renewalDate.textContent =
                            "No renewal date";

                    }

                } else {

                    renewalDate.textContent =
                        "No renewal date";

                }
            }
            
updateExportButtonState();

            const autoRenew =
                $("subscriptionAutoRenew");

            if (autoRenew) {

                const savedAutoRenew =
                    localStorage.getItem(
                        "invoiceProAutoRenew"
                    );

                if (
                    typeof result.autoRenew ===
                    "boolean"
                ) {

                    autoRenew.checked =
                        result.autoRenew;

                } else if (
                    savedAutoRenew !== null
                ) {

                    autoRenew.checked =
                        savedAutoRenew === "true";

                }

            }
            
            updateExportButtonState();
            
            return result;

        } catch (error) {

            console.error(
                "Subscription loading failed:",
                error
            );

            showToast(
                getErrorMessage(
                    error,
                    "Unable to load subscription information."
                ),
                "error"
            );
        }
    }

    function initializeAutoRenew() {

        const toggle =
            $("subscriptionAutoRenew");

        if (!toggle) {
            return;
        }

        toggle.addEventListener(
            "change",
            async function () {

                const value =
                    this.checked;

                try {

                    localStorage.setItem(
                        "invoiceProAutoRenew",
                        String(value)
                    );

                    try {

                        await Parse.Cloud.run(
                            "updateSubscriptionAutoRenew",
                            {
                                autoRenew: value
                            }
                        );

                    } catch (backendError) {

                        if (
                            !backendError ||
                            !backendError.message ||
                            !backendError.message
                                .toLowerCase()
                                .includes(
                                    "function not found"
                                )
                        ) {

                            throw backendError;

                        }
                    }

                    showToast(
                        value
                            ? "Auto-renew enabled."
                            : "Auto-renew disabled.",
                        "success"
                    );

                } catch (error) {

                    this.checked =
                        !value;

                    localStorage.setItem(
                        "invoiceProAutoRenew",
                        String(!value)
                    );

                    showToast(
                        getErrorMessage(
                            error,
                            "Unable to update auto-renew."
                        ),
                        "error"
                    );
                }
            }
        );
    }

    function initializeSubscriptionNavigation() {

        const button =
            $("manageSubscriptionButton");

        if (!button) {
            return;
        }

        button.addEventListener(
            "click",
            () => {

                window.location.href =
                    "subscription.html";

            }
        );
    }

    function initializeDeleteAccount() {

    const deleteButton =
        $("deleteAccountButton");

    const modal =
        $("deleteAccountModal");

    const closeButton =
        $("closeDeleteAccountModal");

    const cancelButton =
        $("cancelDeleteAccount");

    const overlay =
        $("deleteAccountModalOverlay");

    const confirmation =
        $("deleteAccountConfirmation");

    const password =
        $("deleteAccountPassword");

    const confirmButton =
        $("confirmDeleteAccount");

    if (deleteButton) {

        deleteButton.addEventListener(
            "click",
            () => {

                openModal(modal);

                if (confirmation) {
                    confirmation.value = "";
                }

                if (password) {
                    password.value = "";
                }

                if (confirmButton) {
                    confirmButton.disabled = true;
                }

                setTimeout(() => {

                    if (confirmation) {
                        confirmation.focus();
                    }

                }, 100);

            }
        );

    }

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            () => closeModal(modal)
        );

    }

    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            () => closeModal(modal)
        );

    }

    if (overlay) {

        overlay.addEventListener(
            "click",
            () => closeModal(modal)
        );

    }

    if (password) {

    password.addEventListener(
        "input",
        function () {

            if (confirmButton) {

                confirmButton.disabled =
                    !this.value.trim();

            }

        }
    );

}

    if (confirmButton) {

        confirmButton.addEventListener(
            "click",
            handleDeleteAccount
        );

    }

}

    async function handleDeleteAccount() {

    const password =
        $("deleteAccountPassword");

    const confirmButton =
        $("confirmDeleteAccount");

    if (
        !password ||
        !password.value.trim()
    ) {

        showToast(
            "Please enter your current password.",
            "error"
        );

        return;

    }

    setButtonLoading(
        confirmButton,
        true,
        "Deleting..."
    );

    try {

        const result =
            await Parse.Cloud.run(
                "deleteAccount",
                {
                    password:
                        password.value
                }
            );

        showToast(
            result?.message ||
            "Your account has been deleted successfully.",
            "success",
            5000
        );

        closeModal(
            $("deleteAccountModal")
        );

        setTimeout(() => {

            window.location.href =
                "login.html";

        }, 1500);

    }

    catch (error) {

        console.error(
            "Account deletion failed:",
            error
        );

        showToast(
            getErrorMessage(
                error,
                "Unable to delete your account."
            ),
            "error"
        );

        setButtonLoading(
            confirmButton,
            false
        );

    }

}

    async function exportAccountData() {

    const button =
        $("exportAccountDataButton");

    setButtonLoading(
        button,
        true,
        "Exporting..."
    );

    try {
        
        const subscription =
    currentSubscriptionSettings ||
    await loadSubscriptionSettings();

const exportUsage =
    subscription?.usage?.exports;

if (!exportUsage) {

    throw new Error(
        "Unable to verify your PDF export limit."
    );

}

if (
    exportUsage.maximum === undefined ||
    exportUsage.maximum === null
) {

    throw new Error(
        "PDF exports are not available on your current plan."
    );

}

if (
    exportUsage.maximum !== -1 &&
    Number(exportUsage.remaining) <= 0
) {

    throw new Error(
        `You have reached the PDF export limit for your current plan.`
    );

}

        const profile =
            settingsUserProfile ||
            await loadSettingsUserProfile();

        let business =
            settingsBusinessProfile;

        if (!business) {

            business =
                await loadSettingsBusinessProfile();

        }
        
        if (!profile) {

            throw new Error(
                "Unable to load your account information."
            );

        }

        const value =
            (item) => {

                if (
                    item === null ||
                    item === undefined ||
                    item === ""
                ) {
                    return "Not available";
                }

                return String(item);

            };

        const formatPrice =
            (price) => {

                if (
                    price === null ||
                    price === undefined ||
                    price === ""
                ) {
                    return "Not available";
                }

                const number =
                    Number(price);

                if (
                    Number.isNaN(number)
                ) {
                    return String(price);
                }

                return new Intl.NumberFormat(
                    undefined,
                    {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2
                    }
                ).format(number);

            };

        const formatDate =
            (dateValue) => {

                if (!dateValue) {
                    return "Not available";
                }

                const date =
                    new Date(dateValue);

                if (
                    Number.isNaN(
                        date.getTime()
                    )
                ) {
                    return String(dateValue);
                }

                return date.toLocaleDateString(
                    undefined,
                    {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    }
                );

            };

        const escapeHtml =
            (text) => {

                return String(text)
                    .replace(
                        /&/g,
                        "&amp;"
                    )
                    .replace(
                        /</g,
                        "&lt;"
                    )
                    .replace(
                        />/g,
                        "&gt;"
                    )
                    .replace(
                        /"/g,
                        "&quot;"
                    )
                    .replace(
                        /'/g,
                        "&#039;"
                    );

            };

        const currencyCode =
            value(
                profile.currencyCode
            );

        const currencySymbol =
            profile.currencySymbol || "";

        const currency =
            currencySymbol
                ? `${currencyCode} (${currencySymbol})`
                : currencyCode;

        const accountPlan =
            profile.plan ||
            subscription?.plan ||
            "Free Plan";

        const accountPrice =
            profile.planPrice !== undefined &&
            profile.planPrice !== null &&
            profile.planPrice !== ""
                ? `${currencySymbol}${formatPrice(profile.planPrice)}`
                : subscription?.planPrice !== undefined &&
                  subscription?.planPrice !== null &&
                  subscription?.planPrice !== ""
                    ? `${currencySymbol}${formatPrice(subscription.planPrice)}`
                    : "Not available";

        const accountBilling =
            profile.planBilling ||
            subscription?.planBilling ||
            "Not available";

        const accountStatus =
            profile.subscriptionStatus ||
            subscription?.subscriptionStatus ||
            "Not available";

        const renewalDate =
            subscription?.renewalDate
                ? formatDate(
                    subscription.renewalDate
                )
                : "Not available";

        const autoRenew =
            typeof subscription?.autoRenew ===
            "boolean"
                ? subscription.autoRenew
                    ? "Enabled"
                    : "Disabled"
                : (
                    localStorage.getItem(
                        "invoiceProAutoRenew"
                    ) === "true"
                        ? "Enabled"
                        : "Not available"
                );

        const reportDate =
            new Date().toLocaleDateString(
                undefined,
                {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                }
            );

        const businessRows = [

            [
                "Business Name",
                business?.businessName
            ],

            [
                "Business Email",
                business?.businessEmail
            ],

            [
                "Business Phone",
                business?.businessPhone
            ],

            [
                "Business Website",
                business?.businessWebsite
            ],

            [
                "Business Address",
                business?.businessAddress
            ],

            [
                "Business Tax ID",
                business?.businessTaxId
            ],

            [
                "Registration Number",
                business?.registrationNumber
            ],

            [
                "Invoice Prefix",
                business?.invoicePrefix
            ],

            [
                "Estimate Prefix",
                business?.estimatePrefix
            ]

        ];

        const accountRows = [

            [
                "Full Name",
                profile.fullName
            ],

            [
                "Email",
                profile.email
            ],

            [
                "Country",
                profile.country
            ],

            [
                "Currency",
                currency
            ],

            [
                "Plan",
                accountPlan
            ],

            [
                "Plan Price",
                accountPrice
            ],

            [
                "Billing",
                accountBilling
            ],

            [
                "Subscription Status",
                accountStatus
            ],

            [
                "Account ID",
                profile.id
            ]

        ];

        const subscriptionRows = [

            [
                "Plan",
                subscription?.plan ||
                accountPlan
            ],

            [
                "Price",
                subscription?.planPrice !== undefined &&
                subscription?.planPrice !== null &&
                subscription?.planPrice !== ""
                    ? `${currencySymbol}${formatPrice(subscription.planPrice)}`
                    : accountPrice
            ],

            [
                "Billing",
                subscription?.planBilling ||
                accountBilling
            ],

            [
                "Status",
                subscription?.subscriptionStatus ||
                accountStatus
            ],

            [
                "Renewal Date",
                renewalDate
            ],

            [
                "Auto Renew",
                autoRenew
            ]

        ];

        const createRows =
            (rows) => {

                return rows
                    .map(
                        ([label, data]) => {

                            return `
                                <div class="data-row">
                                    <div class="data-label">
                                        ${escapeHtml(label)}
                                    </div>
                                    <div class="data-value">
                                        ${escapeHtml(
                                            value(data)
                                        )}
                                    </div>
                                </div>
                            `;

                        }
                    )
                    .join("");

            };

        const report =
            `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>InvoicePro Account Data</title>

                <style>

                    * {
                        box-sizing: border-box;
                    }

                    body {
                        margin: 0;
                        padding: 40px;
                        background: #f5f5f5;
                        color: #1f2937;
                        font-family: Arial, Helvetica, sans-serif;
                    }

                    .report {
                        width: 100%;
                        max-width: 850px;
                        margin: 0 auto;
                        background: #ffffff;
                        padding: 45px;
                        border-radius: 10px;
                    }

                    .report-header {
                        padding-bottom: 25px;
                        margin-bottom: 30px;
                        border-bottom: 1px solid #e5e7eb;
                    }

                    .brand {
                        font-size: 28px;
                        font-weight: 700;
                        margin-bottom: 8px;
                    }

                    .report-title {
                        font-size: 18px;
                        font-weight: 600;
                        margin: 0;
                    }

                    .report-date {
                        margin-top: 8px;
                        font-size: 13px;
                        color: #6b7280;
                    }

                    .section {
                        margin-bottom: 32px;
                    }

                    .section h3 {
                        margin: 0 0 15px;
                        font-size: 18px;
                        font-weight: 700;
                        color: #111827;
                    }

                    .data-container {
                        border: 1px solid #e5e7eb;
                        border-radius: 8px;
                        overflow: hidden;
                    }

                    .data-row {
                        display: grid;
                        grid-template-columns: 35% 65%;
                        min-height: 48px;
                        border-bottom: 1px solid #e5e7eb;
                    }

                    .data-row:last-child {
                        border-bottom: none;
                    }

                    .data-label {
                        padding: 14px 16px;
                        background: #f9fafb;
                        font-size: 13px;
                        font-weight: 600;
                        color: #374151;
                    }

                    .data-value {
                        padding: 14px 16px;
                        font-size: 13px;
                        color: #111827;
                        word-break: break-word;
                    }

                    .report-footer {
                        padding-top: 20px;
                        margin-top: 10px;
                        border-top: 1px solid #e5e7eb;
                        text-align: center;
                        font-size: 12px;
                        color: #6b7280;
                    }

                    @media print {

                        @page {
                            size: A4;
                            margin: 15mm;
                        }

                        body {
                            padding: 0;
                            background: #ffffff;
                        }

                        .report {
                            max-width: none;
                            padding: 0;
                            border-radius: 0;
                        }

                        .section {
                            break-inside: avoid;
                        }

                        .data-container {
                            break-inside: avoid;
                        }

                    }

                    @media screen and (max-width: 600px) {

                        body {
                            padding: 15px;
                        }

                        .report {
                            padding: 25px 18px;
                        }

                        .data-row {
                            grid-template-columns: 42% 58%;
                        }

                    }

                </style>
            </head>

            <body>

                <div class="report">

                    <div class="report-header">

                        <div class="brand">
                            InvoicePro
                        </div>

                        <h1 class="report-title">
                            Account Data
                        </h1>

                        <div class="report-date">
                            Exported on ${escapeHtml(reportDate)}
                        </div>

                    </div>

                    <section class="section">

                        <h3>
                            Account Information
                        </h3>

                        <div class="data-container">

                            ${createRows(accountRows)}

                        </div>

                    </section>

                    <section class="section">

                        <h3>
                            Business Information
                        </h3>

                        <div class="data-container">

                            ${createRows(businessRows)}

                        </div>

                    </section>

                    <section class="section">

                        <h3>
                            Subscription Information
                        </h3>

                        <div class="data-container">

                            ${createRows(subscriptionRows)}

                        </div>

                    </section>

                    <div class="report-footer">
                        InvoicePro Account Data Export
                    </div>

                </div>

                <script>

                    window.onload = function () {

                        setTimeout(
                            function () {

                                window.print();

                            },
                            300
                        );

                    };

                </script>

            </body>
            </html>
            `;

        const exportWindow =
            window.open(
                "",
                "_blank",
                "width=900,height=900"
            );

        if (!exportWindow) {

            throw new Error(
                "Unable to open the export page. Please allow pop-ups for InvoicePro."
            );

        }

exportWindow.document.open();

exportWindow.document.write(
    report
);

exportWindow.document.close();

const exportResult =
    await Parse.Cloud.run(
        "recordPdfExport"
    );

if (!exportResult?.success) {

    exportWindow.close();

    throw new Error(
        "Unable to record your PDF export."
    );

}

if (
    currentSubscriptionSettings?.usage?.exports
) {

    currentSubscriptionSettings.usage.exports.used =
        exportResult.used;

    currentSubscriptionSettings.usage.exports.maximum =
        exportResult.maximum;

    currentSubscriptionSettings.usage.exports.remaining =
        exportResult.remaining;
        
    updateExportButtonState();

}

showToast(
    "Your account data is ready to export.",
    "success"
);

const checkExportWindow = setInterval(() => {

    if (exportWindow.closed) {

        clearInterval(checkExportWindow);

        window.location.reload();

    }

}, 500);

    } catch (error) {

        console.error(
            "Account data export failed:",
            error
        );

        showToast(
            getErrorMessage(
                error,
                "Unable to export your account data."
            ),
            "error"
        );

    } finally {

        setButtonLoading(
            button,
            false
        );

    }

}

    function updateExportButtonState() {

    const button =
        $("exportAccountDataButton");

    const exportUsage =
        currentSubscriptionSettings?.usage?.exports;

    if (!button || !exportUsage) {
        return;
    }

    const maximum =
        exportUsage.maximum;

    if (maximum === -1) {

        button.disabled = false;

        button.textContent =
            "Export";

        button.title =
            "Unlimited PDF exports";

        return;
    }

    if (
        maximum === undefined ||
        maximum === null
    ) {

        button.disabled = true;

        button.textContent =
            "Unavailable";

        button.title =
            "PDF exports are not available on your current plan.";

        return;
    }

    const remaining =
        Number(exportUsage.remaining);

    if (remaining <= 0) {

        button.disabled = true;

        button.textContent =
            "Limit Reached";

        button.title =
            `You have used all ${maximum} PDF exports included in your plan.`;

        return;
    }

    button.disabled = false;

    button.textContent =
        `Export (${remaining} left)`;

    button.title =
        `${remaining} PDF exports remaining`;
}

    function initializeExportData() {

        const button =
            $("exportAccountDataButton");

        if (!button) {
            return;
        }

        button.addEventListener(
            "click",
            exportAccountData
        );
    }

    function initializePrivacyInformation() {

        const button =
            $("privacyInformationButton");

        if (!button) {
            return;
        }

        button.addEventListener(
            "click",
            () => {

                showToast(
                    "InvoicePro uses your account, business and invoice information to provide the invoicing services available in your account.",
                    "info",
                    6000
                );

            }
        );
    }

    function initializeBusinessSettingsState() {

        if (!window.currentBusinessSettings) {

            window.currentBusinessSettings = {};

        }

        const profile =
            settingsUserProfile;

        window.currentBusinessSettings =
            {

                ...window.currentBusinessSettings,

                businessName:
                    profile?.businessName ||
                    "",

                businessEmail:
                    profile?.businessEmail ||
                    "",

                businessPhone:
                    profile?.businessPhone ||
                    "",

                businessWebsite:
                    profile?.businessWebsite ||
                    "",

                businessAddress:
                    profile?.businessAddress ||
                    "",

                taxId:
                    profile?.taxId ||
                    "",

                businessLogo:
                    profile?.businessLogo ||
                    "",

                primaryColor:
                    profile?.primaryColor ||
                    "#2563EB",

                secondaryColor:
                    profile?.secondaryColor ||
                    "#FFFFFF"

            };
    }

    function initializeKeyboardControls() {

        document.addEventListener(
            "keydown",
            function (event) {

                if (event.key !== "Escape") {
                    return;
                }

                const passwordModal =
                    $("changePasswordModal");

                const deleteModal =
                    $("deleteAccountModal");

                if (
                    passwordModal &&
                    passwordModal.classList.contains(
                        "active"
                    )
                ) {

                    closeSecurityPasswordModal();

                    return;
                }

                if (
                    deleteModal &&
                    deleteModal.classList.contains(
                        "active"
                    )
                ) {

                    closeModal(
                        deleteModal
                    );

                }

            }
        );
    }

    async function initializeSettingsPage() {

        try {

            await loadSettingsUserProfile();

            initializeBusinessSettingsState();

            await loadSettingsBusinessProfile();
            
            await initializeClientImageSetting();
            
            await loadSubscriptionSettings();

            initializeAutoRenew();

            initializeSubscriptionNavigation();

            initializeBusinessEditing();

            initializePasswordModal();

            initializeDeleteAccount();

            initializeExportData();

            initializePrivacyInformation();

            initializeKeyboardControls();

            console.log(
                "Settings page initialized successfully."
            );

        } catch (error) {

            console.error(
                "Settings initialization failed:",
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
            initializeSettingsPage
        );

    } else {

        initializeSettingsPage();

    }

})();