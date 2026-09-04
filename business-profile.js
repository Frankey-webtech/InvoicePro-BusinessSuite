"use strict";

const businessProfileState = {
    
    currentUser: null,
    
    profile: null,
    
    hasUnsavedChanges: false,
    
    isSaving: false,
    
    currentField: null,
    
    currentType: "text",
    
    selectedLogoFile: null,
    
    originalValues: {}
    
};

const BusinessProfile = Parse.Object.extend("BusinessProfile");

const businessDOM = {
    
    saveButton: document.getElementById("saveBusinessProfileBtn"),
    
    logoImage: document.getElementById("businessLogoImage"),
    
    logoInput: document.getElementById("businessLogoInput"),
    
    logoFileName: document.getElementById("businessLogoFileName"),
    
    logoFileSize: document.getElementById("businessLogoFileSize"),
    
    logoStatus: document.getElementById("businessLogoStatus"),
    
    businessName: document.getElementById("businessName"),
    
    businessEmail: document.getElementById("businessEmail"),
    
    businessPhone: document.getElementById("businessPhone"),
    
    businessWebsite: document.getElementById("businessWebsite"),
    
    businessAddress: document.getElementById("businessAddress"),
    
    businessTaxId: document.getElementById("businessTaxId"),
    
    businessCurrency: document.getElementById("businessCurrency"),
    
    registrationNumber: document.getElementById("registrationNumber"),
    
    invoicePrefix: document.getElementById("invoicePrefix"),
    
    estimatePrefix: document.getElementById("estimatePrefix"),
    
    modal: document.getElementById("businessEditModal"),
    
    modalTitle: document.getElementById("modalTitle"),
    
    modalLabel: document.getElementById("modalInputLabel"),
    
    modalInput: document.getElementById("modalInput"),
    
    modalTextarea: document.getElementById("modalTextarea"),
    
    modalSelect: document.getElementById("modalSelect"),
    
    modalColorPicker: document.getElementById("modalColorPicker"),
    
    saveModalButton: document.getElementById("saveBusinessModal"),
    
    cancelModalButton: document.getElementById("cancelBusinessModal"),
    
    closeModalButton: document.getElementById("closeBusinessModal"),
    
    editBusinessLogoBtn: document.getElementById("editBusinessLogoBtn"),
    
    editBusinessNameBtn: document.getElementById("editBusinessNameBtn"),
    
    editBusinessEmailBtn: document.getElementById("editBusinessEmailBtn"),
    
    editBusinessPhoneBtn: document.getElementById("editBusinessPhoneBtn"),
    
    editBusinessWebsiteBtn: document.getElementById("editBusinessWebsiteBtn"),
    
    editBusinessAddressBtn: document.getElementById("editBusinessAddressBtn"),
    
    editBusinessTaxBtn: document.getElementById("editBusinessTaxBtn"),
    
    editBusinessCurrencyBtn: document.getElementById("editBusinessCurrencyBtn"),
    
    editRegistrationNumberBtn: document.getElementById("editRegistrationNumberBtn"),
    
    editInvoicePrefixBtn: document.getElementById("editInvoicePrefixBtn"),
    
    editEstimatePrefixBtn: document.getElementById("editEstimatePrefixBtn")
    
};

const profileImage = document.getElementById("profileImage");

const DEFAULT_PROFILE_IMAGE =
    "profile.png";

async function loadHeaderProfileImage() {
    
    try {
        
        const response = await Parse.Cloud.run(
            "getUserProfile"
        );
        
        if (!response.success) {
            
            throw new Error(
                "Unable to load profile."
            );
            
        }
        
        const profile = response.profile;
        
        let imageURL = DEFAULT_PROFILE_IMAGE;
        
        if (profile.profileImage) {
            
            if (typeof profile.profileImage === "string") {
                
                imageURL = profile.profileImage;
                
            } else if (profile.profileImage.url) {
                
                imageURL = profile.profileImage.url();
                
            }
            profileImage.src = imageURL;
            
        }
    }
    
    catch (error) {
        
        console.error(error);
        
        showToast(
            error.message || error, "error"
        );
        
    }
    
}

async function initializeBusinessProfile() {
    
    try {
        
        const currentUser = Parse.User.current();
        
        if (!currentUser) {
            
            window.location.href = "login.html";
            return;
            
        }
        
        businessProfileState.currentUser = currentUser;
        
        disableSaveButton();
        
        await loadBusinessProfile();
        
        registerBusinessProfileEvents();
        
    } catch (error) {
        
        console.error("Business Profile Initialization Error:", error);
        
        showToast("Unable to load your business profile. Please refresh the page.",
            "warning");
        
    }
    
}

async function loadBusinessProfile() {
    
    const query = new Parse.Query(BusinessProfile);
    
    query.equalTo("user", businessProfileState.currentUser);
    
    let profile = await query.first();
    
    if (!profile) {
        
        profile = new BusinessProfile();
        
        profile.set("user", businessProfileState.currentUser);
        
        await profile.save();
        
    }
    
    businessProfileState.profile = profile;
    
    await populateBusinessProfile(profile);
    
}

async function populateBusinessProfile(profile) {
    
    const currentUser = businessProfileState.currentUser;
    
    const currencyCode = currentUser.get("currencyCode") || "";
    
    const currencySymbol = currentUser.get("currencySymbol") || "";
    
    let currencyName = currencyCode;
    
    if (typeof currencyMap !== "undefined") {
        
        for (const country in currencyMap) {
            
            if (currencyMap[country].code === currencyCode) {
                
                currencyName = country;
                
                break;
                
            }
            
        }
        
    }
    
    const profileData = {
        
        businessName: profile.get("businessName") || "",
        
        businessEmail: profile.get("businessEmail") || "",
        
        businessPhone: profile.get("businessPhone") || "",
        
        businessWebsite: profile.get("businessWebsite") || "",
        
        businessAddress: profile.get("businessAddress") || "",
        
        businessTaxId: profile.get("businessTaxId") || "",
        
        registrationNumber: profile.get("registrationNumber") || "",
        
        invoicePrefix: currentUser.get("invoicePrefix") ||
            profile.get("invoicePrefix") ||
            "INV-",
        
        estimatePrefix: currentUser.get("estimatePrefix") ||
            profile.get("estimatePrefix") ||
            "EST-"
        
    };
    
    businessProfileState.originalValues = {
        
        ...profileData,
        
        currencyCode: currentUser.get("currencyCode") || ""
        
    };
    businessDOM.businessName.textContent =
        profileData.businessName || "Not Set";
    
    businessDOM.businessEmail.textContent =
        profileData.businessEmail || "Not Set";
    
    businessDOM.businessPhone.textContent =
        profileData.businessPhone || "Not Set";
    
    businessDOM.businessWebsite.textContent =
        profileData.businessWebsite || "Not Set";
    
    businessDOM.businessAddress.textContent =
        profileData.businessAddress || "Not Set";
    
    businessDOM.businessTaxId.textContent =
        profileData.businessTaxId || "Not Set";
    
    businessDOM.registrationNumber.textContent =
        profileData.registrationNumber || "Not Set";
    
    businessDOM.invoicePrefix.textContent =
        profileData.invoicePrefix;
    
    businessDOM.estimatePrefix.textContent =
        profileData.estimatePrefix;
    
    if (currencySymbol) {
        
        businessDOM.businessCurrency.textContent =
            `${currencyName} (${currencySymbol})`;
        
    } else {
        
        businessDOM.businessCurrency.textContent =
            currencyCode || "Not Set";
        
    }
    
    const logo = profile.get("logo");
    
    if (logo) {
        
        businessDOM.logoImage.src = logo.url();
        
        setBusinessLogoFileName(
            logo.name()
        );
        
        businessDOM.logoStatus.textContent = "Uploaded";
        
    }
    
    disableSaveButton();
    
}

function setBusinessLogoFileName(fileName) {
    
    const fileNameElement =
        businessDOM.logoFileName;
    
    if (!fileNameElement) {
        return;
    }
    
    fileNameElement.textContent =
        fileName || "";
    
    fileNameElement.title =
        fileName || "";
    
}

function registerBusinessProfileEvents() {
    
    businessDOM.editBusinessLogoBtn.addEventListener(
        "click",
        () => businessDOM.logoInput.click()
    );
    
    businessDOM.logoInput.addEventListener(
        "change",
        handleLogoSelection
    );
    
    businessDOM.editBusinessNameBtn.addEventListener(
        "click",
        () => openTextModal(
            "businessName",
            "Business Name",
            businessDOM.businessName.textContent
        )
    );
    
    businessDOM.editBusinessEmailBtn.addEventListener(
        "click",
        () => openTextModal(
            "businessEmail",
            "Business Email",
            businessDOM.businessEmail.textContent
        )
    );
    
    businessDOM.editBusinessPhoneBtn.addEventListener(
        "click",
        () => openTextModal(
            "businessPhone",
            "Business Phone",
            businessDOM.businessPhone.textContent
        )
    );
    
    businessDOM.editBusinessWebsiteBtn.addEventListener(
        "click",
        () => openTextModal(
            "businessWebsite",
            "Business Website",
            businessDOM.businessWebsite.textContent
        )
    );
    
    businessDOM.editBusinessAddressBtn.addEventListener(
        "click",
        () => openTextareaModal(
            "businessAddress",
            "Business Address",
            businessDOM.businessAddress.textContent
        )
    );
    
    businessDOM.editBusinessTaxBtn.addEventListener(
        "click",
        () => openTextModal(
            "businessTaxId",
            "Tax ID / VAT Number",
            businessDOM.businessTaxId.textContent
        )
    );
    
    businessDOM.editRegistrationNumberBtn.addEventListener(
        "click",
        () => openTextModal(
            "registrationNumber",
            "Registration Number",
            businessDOM.registrationNumber.textContent
        )
    );
    
    businessDOM.editInvoicePrefixBtn.addEventListener(
        "click",
        () => openTextModal(
            "invoicePrefix",
            "Invoice Prefix",
            businessDOM.invoicePrefix.textContent
        )
    );
    
    businessDOM.editEstimatePrefixBtn.addEventListener(
        "click",
        () => openTextModal(
            "estimatePrefix",
            "Estimate Prefix",
            businessDOM.estimatePrefix.textContent
        )
    );
    
    businessDOM.editBusinessCurrencyBtn.addEventListener(
        "click",
        openCurrencyModal
    );
    
    businessDOM.closeModalButton.addEventListener(
        "click",
        closeBusinessModal
    );
    
    businessDOM.cancelModalButton.addEventListener(
        "click",
        closeBusinessModal
    );
    
    businessDOM.saveModalButton.addEventListener(
        "click",
        saveModalChanges
    );
    
    businessDOM.saveButton.addEventListener(
        "click",
        saveBusinessProfile
    );
    
    businessDOM.modal.addEventListener(
        "click",
        function(event) {
            
            if (event.target === businessDOM.modal) {
                
                closeBusinessModal();
                
            }
            
        }
    );
    
    document.addEventListener(
        "keydown",
        function(event) {
            
            if (
                event.key === "Escape" &&
                businessDOM.modal.classList.contains("show")
            ) {
                
                closeBusinessModal();
                
            }
            
        }
    );
    
}

function resetModalControls() {
    
    businessDOM.modalInput.hidden = true;
    
    businessDOM.modalTextarea.hidden = true;
    
    businessDOM.modalSelect.hidden = true;
    
    businessDOM.modalColorPicker.hidden = true;
    
    businessDOM.modalInput.value = "";
    
    businessDOM.modalTextarea.value = "";
    
    businessDOM.modalSelect.innerHTML = "";
    
}

function openTextModal(field, title, value) {
    
    resetModalControls();
    
    businessProfileState.currentField = field;
    
    businessProfileState.currentType = "text";
    
    businessDOM.modalTitle.textContent = title;
    
    businessDOM.modalLabel.textContent = title;
    
    businessDOM.modalInput.hidden = false;
    
    businessDOM.modalInput.value =
        value === "Not Set" ? "" : value;
    
    businessDOM.modal.classList.add("show");
    
    businessDOM.modalInput.focus();
    
}

function openTextareaModal(field, title, value) {
    
    resetModalControls();
    
    businessProfileState.currentField = field;
    
    businessProfileState.currentType = "textarea";
    
    businessDOM.modalTitle.textContent = title;
    
    businessDOM.modalLabel.textContent = title;
    
    businessDOM.modalTextarea.hidden = false;
    
    businessDOM.modalTextarea.value =
        value === "Not Set" ? "" : value;
    
    businessDOM.modal.classList.add("show");
    
    businessDOM.modalTextarea.focus();
    
}

function openCurrencyModal() {
    
    resetModalControls();
    
    businessProfileState.currentField = "currencyCode";
    
    businessProfileState.currentType = "select";
    
    businessDOM.modalTitle.textContent = "Business Currency";
    
    businessDOM.modalLabel.textContent = "Select Currency";
    
    businessDOM.modalSelect.hidden = false;
    
    businessDOM.modalSelect.innerHTML = "";
    
    Object.keys(currencyMap).forEach(function(country) {
        
        const option = document.createElement("option");
        
        option.value = currencyMap[country].code;
        
        option.textContent =
            `${country} (${currencyMap[country].symbol})`;
        
        if (
            currencyMap[country].code ===
            businessProfileState.currentUser.get("currencyCode")
        ) {
            
            option.selected = true;
            
        }
        
        businessDOM.modalSelect.appendChild(option);
        
    });
    
    businessDOM.modal.classList.add("show");
    
}

function closeBusinessModal() {
    
    businessDOM.modal.classList.remove("show");
    
    businessProfileState.currentField = null;
    
    businessProfileState.currentType = "text";
    
}

function saveModalChanges() {
    
    let value = "";
    
    switch (businessProfileState.currentType) {
        
        case "text":
            
            value = businessDOM.modalInput.value.trim();
            
            break;
            
        case "textarea":
            
            value = businessDOM.modalTextarea.value.trim();
            
            break;
            
        case "select":
            
            value = businessDOM.modalSelect.value;
            
            break;
            
        default:
            
            return;
            
    }
    
    if (businessProfileState.currentField === "currencyCode") {
        
        businessProfileState.currentUser.set(
            "currencyCode",
            value
        );
        
        let symbol = "";
        
        Object.keys(currencyMap).forEach(function(country) {
            
            if (currencyMap[country].code === value) {
                
                symbol = currencyMap[country].symbol;
                
            }
            
        });
        
        if (
            !validateField(
                businessProfileState.currentField,
                value
            )
        ) {
            
            return;
            
        }
        
        businessProfileState.currentUser.set(
            "currencySymbol",
            symbol
        );
        
        businessDOM.businessCurrency.textContent =
            `${value} (${symbol})`;
        
        checkForChanges();
        
        closeBusinessModal();
        
        return;
        
    }
    
    if (
    businessProfileState.currentField ===
    "invoicePrefix"
) {

    businessProfileState.currentUser.set(
        "invoicePrefix",
        value
    );

    businessProfileState.profile.set(
        "invoicePrefix",
        value
    );

} else if (
    businessProfileState.currentField ===
    "estimatePrefix"
) {

    businessProfileState.currentUser.set(
        "estimatePrefix",
        value
    );

    businessProfileState.profile.set(
        "estimatePrefix",
        value
    );

} else {

    businessProfileState.profile.set(
        businessProfileState.currentField,
        value
    );

}
    
    const fieldMap = {
        
        businessName: businessDOM.businessName,
        
        businessEmail: businessDOM.businessEmail,
        
        businessPhone: businessDOM.businessPhone,
        
        businessWebsite: businessDOM.businessWebsite,
        
        businessAddress: businessDOM.businessAddress,
        
        businessTaxId: businessDOM.businessTaxId,
        
        registrationNumber: businessDOM.registrationNumber,
        
        invoicePrefix: businessDOM.invoicePrefix,
        
        estimatePrefix: businessDOM.estimatePrefix
        
    };
    
    if (fieldMap[businessProfileState.currentField]) {
        
        fieldMap[businessProfileState.currentField].textContent =
            value || "Not Set";
        
    }
    
    checkForChanges();
    
    closeBusinessModal();
    
}

async function saveBusinessProfile() {
    
    if (businessProfileState.isSaving) {
        
        return;
        
    }
    
    if (!businessProfileState.hasUnsavedChanges) {
        
        return;
        
    }
    
    try {
        
        businessProfileState.isSaving = true;
        
        businessDOM.saveButton.disabled = true;
        
        businessDOM.saveButton.textContent = "Saving...";
        
        if (businessProfileState.selectedLogoFile) {
            
            const logoFile = new Parse.File(
                
                businessProfileState.selectedLogoFile.name,
                
                businessProfileState.selectedLogoFile
                
            );
            
            await logoFile.save();
            
            businessProfileState.profile.set(
                "logo",
                logoFile
            );
            
        }
        
        await businessProfileState.currentUser.save();
        
        await businessProfileState.profile.save();
        
        businessProfileState.selectedLogoFile = null;
        
        refreshOriginalValues();
        
        resetBusinessProfileState();
        
        businessProfileState.hasUnsavedChanges = false;
        
        disableSaveButton();
        
        businessDOM.logoStatus.textContent = "Uploaded";
        
        businessDOM.saveButton.textContent = "Save Changes";
        
        showToast(
            "Business profile updated successfully.",
            "success"
        );
        
    }
    
    catch (error) {
        
        console.error(error);
        
        businessDOM.saveButton.disabled = false;
        
        businessDOM.saveButton.textContent = "Save Changes";
        
        showToast(error.message || "Unable to save business profile.",
            "error"
        );
        
    }
    
    finally {
        
        businessProfileState.isSaving = false;
        
    }
    
}

function enableSaveButton() {
    
    businessProfileState.hasUnsavedChanges = true;
    
    businessDOM.saveButton.disabled = false;
    
    businessDOM.saveButton.classList.add("active");
    
}

function disableSaveButton() {
    
    businessProfileState.hasUnsavedChanges = false;
    
    businessDOM.saveButton.disabled = true;
    
    businessDOM.saveButton.classList.remove("active");
    
}

function isValidEmail(email) {
    
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    
}

function isValidWebsite(url) {
    
    if (!url) {
        
        return true;
        
    }
    
    try {
        
        new URL(
            url.startsWith("http") ?
            url :
            `https://${url}`
        );
        
        return true;
        
    }
    
    catch {
        
        return false;
        
    }
    
}

function validateField(field, value) {
    
    switch (field) {
        
        case "businessName":
            
            if (!value.trim()) {
                
                showToast("Business name is required.",
                    "required"
                );
                
                return false;
                
            }
            
            break;
            
        case "businessEmail":
            
            if (
                value &&
                !isValidEmail(value)
            ) {
                
                showToast("Please enter a valid email address.",
                    "warning"
                );
                
                return false;
                
            }
            
            break;
            
        case "businessWebsite":
            
            if (
                value &&
                !isValidWebsite(value)
            ) {
                
                showToast("Please enter a valid website.",
                    "warning"
                );
                
                return false;
                
            }
            
            break;
            
    }
    
    return true;
    
}

function validateLogo(file) {
    
    const allowedTypes = [
        
        "image/png",
        
        "image/jpeg",
        
        "image/jpg",
        
        "image/webp"
        
    ];
    
    const maxSize = 2 * 1024 * 1024;
    
    if (!allowedTypes.includes(file.type)) {
        
        showToast(
            "Please select a PNG, JPG, JPEG or WEBP image.",
            "warning"
        );
        
        return false;
        
    }
    
    if (file.size > maxSize) {
        
        showToast(
            "Logo size must not exceed 2 MB.",
            "warning"
        );
        
        return false;
        
    }
    
    return true;
    
}

function handleLogoSelection(event) {
    
    const file = event.target.files[0];
    
    if (!file) {
        
        return;
        
    }
    
    if (!validateLogo(file)) {
        
        businessDOM.logoInput.value = "";
        
        return;
        
    }
    
    businessProfileState.selectedLogoFile = file;
    
    businessDOM.logoImage.src =
        URL.createObjectURL(file);
    
    setBusinessLogoFileName(
        file.name
    );
    
    businessDOM.logoFileSize.textContent =
        `${Math.round(file.size / 1024)} KB`;
    
    businessDOM.logoStatus.textContent =
        "Ready to Save";
    
    enableSaveButton();
    
}

function refreshOriginalValues() {
    
    businessProfileState.originalValues = {
        
        businessName: businessDOM.businessName.textContent,
        
        businessEmail: businessDOM.businessEmail.textContent,
        
        businessPhone: businessDOM.businessPhone.textContent,
        
        businessWebsite: businessDOM.businessWebsite.textContent,
        
        businessAddress: businessDOM.businessAddress.textContent,
        
        businessTaxId: businessDOM.businessTaxId.textContent,
        
        registrationNumber: businessDOM.registrationNumber.textContent,
        
        invoicePrefix: businessDOM.invoicePrefix.textContent,
        
        estimatePrefix: businessDOM.estimatePrefix.textContent
        
    };
    
}

function checkForChanges() {
    
    let changed = false;
    
    const currentValues = {
        
        businessName: businessDOM.businessName.textContent,
        
        businessEmail: businessDOM.businessEmail.textContent,
        
        businessPhone: businessDOM.businessPhone.textContent,
        
        businessWebsite: businessDOM.businessWebsite.textContent,
        
        businessAddress: businessDOM.businessAddress.textContent,
        
        businessTaxId: businessDOM.businessTaxId.textContent,
        
        registrationNumber: businessDOM.registrationNumber.textContent,
        
        invoicePrefix: businessDOM.invoicePrefix.textContent,
        
        estimatePrefix: businessDOM.estimatePrefix.textContent
        
    };
    
    for (const key in currentValues) {
        
        if (
            currentValues[key] !==
            businessProfileState.originalValues[key]
        ) {
            
            changed = true;
            
            break;
            
        }
        
    }
    
    if (
        businessProfileState.selectedLogoFile
    ) {
        
        changed = true;
        
    }
    
    if (
        businessProfileState.currentUser.get("currencyCode") !==
        businessProfileState.originalValues.currencyCode
    ) {
        
        changed = true;
        
    }
    
    if (changed) {
        
        enableSaveButton();
        
    } else {
        
        disableSaveButton();
        
    }
    
}

function resetBusinessProfileState() {
    
    businessProfileState.selectedLogoFile = null;
    
    businessProfileState.hasUnsavedChanges = false;
    
    businessProfileState.isSaving = false;
    
    businessDOM.logoInput.value = "";
    
    businessDOM.logoStatus.textContent = "Uploaded";
    
    refreshOriginalValues();
    
    disableSaveButton();
    
}

window.addEventListener("beforeunload", function(event) {
    
    if (!businessProfileState.hasUnsavedChanges) {
        
        return;
        
    }
    
    event.preventDefault();
    
    event.returnValue = "";
    
});

function setFieldValue(element, value) {
    
    if (!element) {
        
        return;
        
    }
    
    element.textContent = value && value.trim() ?
        value :
        "Not Set";
    
}

function updateCurrencyDisplay() {
    
    const code =
        businessProfileState.currentUser.get("currencyCode") || "";
    
    const symbol =
        businessProfileState.currentUser.get("currencySymbol") || "";
    
    let display = code;
    
    for (const country in currencyMap) {
        
        if (currencyMap[country].code === code) {
            
            display =
                `${country} (${symbol})`;
            
            break;
            
        }
        
    }
    
    businessDOM.businessCurrency.textContent =
        display || "Not Set";
    
}

function refreshBusinessProfileUI() {
    
    const profile =
        businessProfileState.profile;
    
    setFieldValue(
        businessDOM.businessName,
        profile.get("businessName") || ""
    );
    
    setFieldValue(
        businessDOM.businessEmail,
        profile.get("businessEmail") || ""
    );
    
    setFieldValue(
        businessDOM.businessPhone,
        profile.get("businessPhone") || ""
    );
    
    setFieldValue(
        businessDOM.businessWebsite,
        profile.get("businessWebsite") || ""
    );
    
    setFieldValue(
        businessDOM.businessAddress,
        profile.get("businessAddress") || ""
    );
    
    setFieldValue(
        businessDOM.businessTaxId,
        profile.get("businessTaxId") || ""
    );
    
    setFieldValue(
        businessDOM.registrationNumber,
        profile.get("registrationNumber") || ""
    );
    
    setFieldValue(
        businessDOM.invoicePrefix,
        profile.get("invoicePrefix") || "INV-"
    );
    
    setFieldValue(
        businessDOM.estimatePrefix,
        profile.get("estimatePrefix") || "EST-"
    );
    
    updateCurrencyDisplay();
    
}

function showToast(message, type = "success") {
    
    const container =
        document.getElementById("toastContainer");
    
    
    if (!container) {
        
        console.error("Toast container missing");
        
        return;
        
    }
    
    
    const toast =
        document.createElement("div");
    
    
    toast.className =
        `toast ${type}`;
    
    
    toast.textContent =
        message;
    
    
    container.appendChild(toast);
    
    
    setTimeout(() => {
        
        toast.style.opacity = "0";
        
        toast.style.transform =
            "translateX(50px)";
        
        
        setTimeout(() => {
            
            toast.remove();
            
        }, 300);
        
        
    }, 3000);
    
}

const requiredBusinessProfileIDs = [
    "saveBusinessProfileBtn",
    "businessLogoImage",
    "businessLogoInput",
    "businessLogoFileName",
    "businessLogoFileSize",
    "businessLogoStatus",
    
    "businessName",
    "businessEmail",
    "businessPhone",
    "businessWebsite",
    "businessAddress",
    "businessTaxId",
    "businessCurrency",
    "registrationNumber",
    "invoicePrefix",
    "estimatePrefix",
    
    "businessEditModal",
    "modalTitle",
    "modalInputLabel",
    "modalInput",
    "modalTextarea",
    "modalSelect",
    "modalColorPicker",
    "saveBusinessModal",
    "cancelBusinessModal",
    "closeBusinessModal",
    
    "editBusinessLogoBtn",
    "editBusinessNameBtn",
    "editBusinessEmailBtn",
    "editBusinessPhoneBtn",
    "editBusinessWebsiteBtn",
    "editBusinessAddressBtn",
    "editBusinessTaxBtn",
    "editBusinessCurrencyBtn",
    "editRegistrationNumberBtn",
    "editInvoicePrefixBtn",
    "editEstimatePrefixBtn"
];
/*
document.addEventListener(
    "DOMContentLoaded",
    initializeBusinessProfile,
    
    loadHeaderProfileImage
    
);*/

document.addEventListener(
    "DOMContentLoaded",
    function() {
        
        if (initializeBusinessProfile()) {
            initializeBusinessProfile();
            console.log("Business profile Initialised")
        } else {
            try {
                if (!initializeBusinessProfile) {
                    console.log("Business Profile not loaded")
                }
            }
            catch (error) {
                console.error(error)
            }
        }
        
        if (loadHeaderProfileImage()) {
            loadHeaderProfileImage();
            console.log("Profile Image Loaded")
        } else {
            try {
                if (!initializeBusinessProfile) {
                    console.log("Business Profile not loaded")
                }
            }
            catch (error) {
                console.error(error)
            }
        }
        
        
    }
);