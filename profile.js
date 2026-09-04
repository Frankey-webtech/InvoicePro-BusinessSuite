let currentUserCountry = "";
const headerProfileImage = document.getElementById("headerProfileImage");
const userFullName = document.getElementById("userFullName");
const userEmail = document.getElementById("userEmail");

const userPlan = document.getElementById("userPlan");
const subscriptionStatus = document.getElementById("subscriptionStatus");

const memberSince = document.getElementById("memberSince");

const invoiceCount = document.getElementById("invoiceCount");
const clientCount = document.getElementById("clientCount");
const totalRevenue = document.getElementById("totalRevenue");
const lastUpdated = document.getElementById("lastUpdated");

const fullNameField = document.getElementById("fullNameField");
const emailField = document.getElementById("emailField");
const phoneField = document.getElementById("phoneField");
const countryField = document.getElementById("countryField");

const uploadProfileImageBtn = document.getElementById("uploadProfileImageBtn");

const editEmailBtn = document.getElementById("editEmailBtn");
const editPhoneBtn = document.getElementById("editPhoneBtn");
const editCountryBtn = document.getElementById("editCountryBtn");

const toastContainer = document.getElementById("toastContainer");
const profileImageInput = document.getElementById("profileImageInput");
const editEmailModal = document.getElementById("editEmailModal");
const closeEmailModal = document.getElementById("closeEmailModal");
const cancelEmailBtn = document.getElementById("cancelEmailBtn");
const saveEmailBtn = document.getElementById("saveEmailBtn");
const emailInput = document.getElementById("emailInput");
const editPhoneModal = document.getElementById("editPhoneModal");
const closePhoneModal = document.getElementById("closePhoneModal");
const cancelPhoneBtn = document.getElementById("cancelPhoneBtn");
const savePhoneBtn = document.getElementById("savePhoneBtn");
const phoneInput = document.getElementById("phoneInput");
const editCountryModal = document.getElementById("editCountryModal");
const closeCountryModal = document.getElementById("closeCountryModal");
const cancelCountryBtn = document.getElementById("cancelCountryBtn");
const saveCountryBtn = document.getElementById("saveCountryBtn");
const countryInput = document.getElementById("countryInput");
const logoutBtn = document.getElementById("logoutBtn");

const paymentMethodInput =
    document.getElementById("paymentMethodInput");

const paymentProviderInput =
    document.getElementById("paymentProviderInput");

const bankNameInput =
    document.getElementById("bankNameInput");

const accountNameInput =
    document.getElementById("accountNameInput");

const accountNumberInput =
    document.getElementById("accountNumberInput");

const routingNumberInput =
    document.getElementById("routingNumberInput");

const swiftCodeInput =
    document.getElementById("swiftCodeInput");

const paymentLinkInput =
    document.getElementById("paymentLinkInput");

const paymentAccountInput =
    document.getElementById("paymentAccountInput");

const paymentTermsInput =
    document.getElementById("paymentTermsInput");

const paymentDueDaysInput =
    document.getElementById("paymentDueDaysInput");

const paymentInstructionsInput =
    document.getElementById("paymentInstructionsInput");

const savePaymentBtn =
    document.getElementById("savePaymentBtn");

const paymentStatus =
    document.getElementById("paymentStatus");

const paymentStatusIndicator =
    document.getElementById("paymentStatusIndicator");

const paymentStatusText =
    document.getElementById("paymentStatusText");
    
const paymentInputs = [

    paymentMethodInput,
    paymentProviderInput,
    bankNameInput,
    accountNameInput,
    accountNumberInput,
    routingNumberInput,
    swiftCodeInput,
    paymentLinkInput,
    paymentAccountInput,
    paymentTermsInput,
    paymentDueDaysInput,
    paymentInstructionsInput

];

paymentInputs.forEach((input) => {

    if (!input) {
        return;
    }

    input.addEventListener(
        "input",
        updatePaymentButtonState
    );

    input.addEventListener(
        "change",
        updatePaymentButtonState
    );

});

let savedPaymentDetails = {
    paymentMethod: "",
    paymentProvider: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
    routingNumber: "",
    swiftCode: "",
    paymentLink: "",
    paymentAccount: "",
    paymentTerms: "",
    paymentDueDays: "",
    paymentInstructions: ""
};

let paymentDetailsLoaded = false;

async function loadUserProfile() {

    try {

        const response = await Parse.Cloud.run(
            "getUserProfile"
        );

        if (!response.success) {

            throw new Error(
                "Unable to load profile."
            );

        }

        const profile =
            response.profile;

        loadPaymentDetails(profile);

        userFullName.textContent =
            profile.fullName || "-";

        userEmail.textContent =
            profile.email || "-";

        fullNameField.textContent =
            profile.fullName || "-";

        emailField.textContent =
            profile.email || "-";

        phoneField.textContent =
            profile.phone || "-";

        currentUserCountry =
            profile.country || "";

        countryField.textContent =
            currentUserCountry || "-";

        userPlan.textContent =
            profile.plan || "Free Plan";

        subscriptionStatus.textContent =
            profile.subscriptionStatus || "Inactive";

        invoiceCount.textContent =
            profile.invoiceCount ?? 0;

        clientCount.textContent =
            profile.clientCount ?? 0;

        const symbol =
            profile.currencySymbol || "";

        const revenueResult =
    await Parse.Cloud.run(
        "paidInvoices"
    );

const revenue =
    Number(
        revenueResult?.totalPaidAmount
    ) || 0;

        totalRevenue.textContent =
            symbol +
            revenue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

        if (profile.createdAt) {

            memberSince.textContent =
                new Date(profile.createdAt)
                .toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                });

        } else {

            memberSince.textContent = "-";

        }

        if (profile.updatedAt) {

            lastUpdated.textContent =
                new Date(profile.updatedAt)
                .toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                });

        } else {

            lastUpdated.textContent = "-";

        }

    }

    catch (error) {

        console.error(error);

        showToast(
            error.message || error,
            "error"
        );

    }

}

async function loadCurrencyCountries() {

    try {

        countryInput.innerHTML = `
            <option value="">
                Loading countries...
            </option>
        `;

        const response = await Parse.Cloud.run(
            "getCurrencyCountries"
        );

        if (!response.success || !response.countries) {

            throw new Error(
                "Unable to load countries."
            );

        }

        countryInput.innerHTML = `
            <option value="">
                Select your country
            </option>
        `;

        response.countries.forEach((item) => {

            const option =
                document.createElement("option");

            option.value = item.country;

            option.textContent =
                item.country;

            countryInput.appendChild(option);

        });

    }

    catch (error) {

        console.error(error);

        countryInput.innerHTML = `
            <option value="">
                Unable to load countries
            </option>
        `;

        showToast(
            error.message || "Unable to load countries.",
            "error"
        );

    }

}

async function savePaymentDetails() {

    const paymentDetails =
        getCurrentPaymentDetails();

    try {

        savePaymentBtn.disabled = true;

        savePaymentBtn.textContent =
            "Saving...";

        const response =
            await Parse.Cloud.run(
                "updateUserProfile",
                {
                    paymentDetails
                }
            );

        if (!response.success) {

            throw new Error(
                response.message ||
                "Unable to save payment details."
            );

        }

        savedPaymentDetails = {
            ...paymentDetails
        };

        paymentDetailsLoaded = true;

        setPaymentFieldVisibility();

        updatePaymentStatus();

        updatePaymentButtonState();

        showToast(
            "Payment details saved successfully.",
            "success"
        );
        
        if (
    sessionStorage.getItem(
        "returnToEstimate"
    ) === "true"
) {

    sessionStorage.removeItem(
        "returnToEstimate"
    );

    setTimeout(() => {

        window.location.href =
            "estimates.html";

    }, 500);

    return;

}

    }

    catch (error) {

        console.error(error);

        savePaymentBtn.disabled = false;

        savePaymentBtn.textContent =
            savedPaymentDetails.paymentMethod ||
            savedPaymentDetails.paymentProvider
                ? "Update Changes"
                : "Save Changes";

        showToast(
            error.message ||
            "Unable to save payment details.",
            "error"
        );

    }

}

function getCurrentPaymentDetails() {

    return {

        paymentMethod:
            paymentMethodInput?.value || "",

        paymentProvider:
            paymentProviderInput?.value || "",

        bankName:
            bankNameInput?.value.trim() || "",

        accountName:
            accountNameInput?.value.trim() || "",

        accountNumber:
            accountNumberInput?.value.trim() || "",

        routingNumber:
            routingNumberInput?.value.trim() || "",

        swiftCode:
            swiftCodeInput?.value.trim() || "",

        paymentLink:
            paymentLinkInput?.value.trim() || "",

        paymentAccount:
            paymentAccountInput?.value.trim() || "",

        paymentTerms:
            paymentTermsInput?.value || "",

        paymentDueDays:
            paymentDueDaysInput?.value.trim() || "",

        paymentInstructions:
            paymentInstructionsInput?.value.trim() || "",
            
        paymentStatus:
    savedPaymentDetails.paymentStatus ||
    "Pending"

    };

}

function hasPaymentChanges() {

    const current =
        getCurrentPaymentDetails();

    return JSON.stringify(current) !==
        JSON.stringify(savedPaymentDetails);

}

function closeEmailEditor() {

    editEmailModal.classList.remove("show");

}

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

        },300);

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

function closePhoneEditor() {

    editPhoneModal.classList.remove("show");

}

function closeCountryEditor() {

    editCountryModal.classList.remove("show");

}

function updatePaymentButtonState() {

    if (!paymentDetailsLoaded) {
        return;
    }

    const changed =
        hasPaymentChanges();

    savePaymentBtn.disabled =
        !changed;

    savePaymentBtn.textContent =
        savedPaymentDetails.paymentMethod ||
        savedPaymentDetails.paymentProvider
            ? "Update Changes"
            : "Save Changes";

}

function setPaymentFieldVisibility() {

    const method =
        paymentMethodInput?.value || "";

    const bankTransfer =
        method === "bank_transfer";

    const providerPayment =
        [
            "paystack",
            "flutterwave",
            "paypal",
            "stripe"
        ].includes(method);

    const bankFields = [
        bankNameInput,
        accountNameInput,
        accountNumberInput,
        routingNumberInput,
        swiftCodeInput
    ];

    const providerFields = [
        paymentLinkInput,
        paymentAccountInput
    ];

    bankFields.forEach((input) => {

        const group =
            input?.closest(".payment-form-group");

        if (group) {

            group.style.display =
                bankTransfer ? "" : "none";

        }

    });

    providerFields.forEach((input) => {

        const group =
            input?.closest(".payment-form-group");

        if (group) {

            group.style.display =
                providerPayment ? "" : "none";

        }

    });

    const customTerms =
        paymentDueDaysInput?.closest(
            ".payment-form-group"
        );

    if (customTerms) {

        customTerms.style.display =
            paymentTermsInput?.value === "custom"
                ? ""
                : "none";

    }

}

function loadPaymentDetails(profile) {

    const paymentDetails =
        profile.paymentDetails || {};

    paymentMethodInput.value =
        paymentDetails.paymentMethod || "";

    paymentProviderInput.value =
        paymentDetails.paymentProvider || "";

    bankNameInput.value =
        paymentDetails.bankName || "";

    accountNameInput.value =
        paymentDetails.accountName || "";

    accountNumberInput.value =
        paymentDetails.accountNumber || "";

    routingNumberInput.value =
        paymentDetails.routingNumber || "";

    swiftCodeInput.value =
        paymentDetails.swiftCode || "";

    paymentLinkInput.value =
        paymentDetails.paymentLink || "";

    paymentAccountInput.value =
        paymentDetails.paymentAccount || "";

    paymentTermsInput.value =
        paymentDetails.paymentTerms || "";

    paymentDueDaysInput.value =
        paymentDetails.paymentDueDays || "";

    paymentInstructionsInput.value =
        paymentDetails.paymentInstructions || "";

    savedPaymentDetails = {
        paymentMethod:
            paymentDetails.paymentMethod || "",

        paymentProvider:
            paymentDetails.paymentProvider || "",

        bankName:
            paymentDetails.bankName || "",

        accountName:
            paymentDetails.accountName || "",

        accountNumber:
            paymentDetails.accountNumber || "",

        routingNumber:
            paymentDetails.routingNumber || "",

        swiftCode:
            paymentDetails.swiftCode || "",

        paymentLink:
            paymentDetails.paymentLink || "",

        paymentAccount:
            paymentDetails.paymentAccount || "",

        paymentTerms:
            paymentDetails.paymentTerms || "",

        paymentDueDays:
            paymentDetails.paymentDueDays || "",

        paymentInstructions:
            paymentDetails.paymentInstructions || ""

    };

    paymentDetailsLoaded = true;

    setPaymentFieldVisibility();

    updatePaymentStatus();

    updatePaymentButtonState();

}

function updatePaymentStatus() {

    const hasDetails =
        Boolean(
            savedPaymentDetails.paymentMethod ||
            savedPaymentDetails.paymentProvider ||
            savedPaymentDetails.bankName ||
            savedPaymentDetails.accountNumber ||
            savedPaymentDetails.paymentLink
        );

    if (hasDetails) {

        paymentStatus.classList.add("is-set");

        paymentStatusText.textContent =
            "Payment details are set";

    } else {

        paymentStatus.classList.remove("is-set");

        paymentStatusText.textContent =
            "Payment details not set";

    }

}

if (paymentMethodInput) {

    paymentMethodInput.addEventListener(
        "change",
        () => {

            setPaymentFieldVisibility();

            updatePaymentButtonState();

        }
    );

}

if (paymentTermsInput) {

    paymentTermsInput.addEventListener(
        "change",
        () => {

            setPaymentFieldVisibility();

            updatePaymentButtonState();

        }
    );

}

if (profileImageInput) {

    profileImageInput.addEventListener("change", async () => {

        const file = profileImageInput.files?.[0];

        if (!file) {
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.type)) {

            showToast(
                "Only JPG, JPEG, PNG and WEBP images are allowed."
            );

            profileImageInput.value = "";

            return;
        }

        try {
           
            uploadProfileImageBtn.innerHTML = `Uploading...`;
            const parseFile = new Parse.File(
                file.name,
                file
            );

            await parseFile.save();

            const result = await Parse.Cloud.run(
                "uploadProfileImage",
                {
                    profileImage: parseFile
                }
            );
            uploadProfileImageBtn.innerHTML = `Uploaded.`;

            console.log(
                "Profile image uploaded successfully:",
                result
            );

            if (result?.message) {
                showToast(result.message, "info");
            }
           
            if (result?.profileImage) {

                const profileImage =
                    document.getElementById("profileImage");

                const headerProfileImage =
                    document.getElementById("headerProfileImage");

                if (profileImage) {
                    profileImage.src = result.profileImage;
                }

                if (headerProfileImage) {
                    headerProfileImage.src = result.profileImage;
                }
            }
            
            uploadProfileImageBtn.innerHTML = `Edit Photo`;

        } catch (error) {

            console.error(
                "Profile image upload failed:",
                error
            );

            showToast(
                error?.message ||
                "Failed to upload profile image.", "error"
            );

        } finally {

            profileImageInput.value = "";

        }

    });

} else {

    console.error(
        "Profile image input not found: #profileImageInput"
    );

}

if (savePaymentBtn) {

    savePaymentBtn.addEventListener(
        "click",
        savePaymentDetails
    );

}

uploadProfileImageBtn.addEventListener("click", () => {

    profileImageInput.click();

})
/*profileImageInput.addEventListener("change", async () => {

    const file = profileImageInput.files[0];

    if (!file) {
        return;
    }

    // =========================
    // VALIDATE FILE TYPE
    // =========================

    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {

        alert(
            "Only JPG, JPEG, PNG and WEBP images are allowed."
        );

        profileImageInput.value = "";

        return;
    }

    try {

        // =========================
        // CREATE PARSE FILE
        // =========================

        const parseFile = new Parse.File(
            file.name,
            file
        );

        // =========================
        // UPLOAD TO PARSE
        // =========================

        await parseFile.save();

        // =========================
        // UPDATE USER PROFILE
        // =========================

        const result = await Parse.Cloud.run(
            "uploadProfileImage",
            {
                profileImage: parseFile
            }
        );

        // =========================
        // SUCCESS
        // =========================

        console.log(
            "Profile image uploaded successfully:",
            result
        );

        if (result && result.message) {
            alert(result.message);
        }

        // =========================
        // UPDATE PROFILE IMAGES
        // =========================

        if (result && result.profileImage) {

            const profileImage =
                document.getElementById("profileImage");

            const headerProfileImage =
                document.getElementById("headerProfileImage");

            if (profileImage) {
                profileImage.src = result.profileImage;
            }

            if (headerProfileImage) {
                headerProfileImage.src = result.profileImage;
            }
        }

    } catch (error) {

        console.error(
            "Profile image upload failed:",
            error
        );

        alert(
            error.message ||
            "Failed to upload profile image."
        );

    } finally {

        profileImageInput.value = "";

    }

});*/

editEmailBtn.addEventListener("click", () => {

    emailInput.value = emailField.textContent.trim();

    editEmailModal.classList.add("show");

});

closeEmailModal.addEventListener(
    "click",
    closeEmailEditor
);

cancelEmailBtn.addEventListener(
    "click",
    closeEmailEditor
);

editEmailModal.addEventListener("click", (e) => {

    if (e.target === editEmailModal) {

        closeEmailEditor();

    }

});


saveEmailBtn.addEventListener("click", async () => {

    const email = emailInput.value.trim().toLowerCase();

    if (!email) {

        showToast("Please enter an email address.", "warning");

        return;

    }

    try {

        saveEmailBtn.disabled = true;

        saveEmailBtn.textContent = "Saving...";

        const response = await Parse.Cloud.run(

            "updateUserProfile",

            {

                email

            }

        );

        if (!response.success) {

            throw new Error(
                response.message ||
                "Unable to update email."
            );

        }

        emailField.textContent = email;
        userEmail.textContent = email;

        closeEmailEditor();

        showToast("Email updated successfully.");

    }

    catch (error) {

        console.error(error);

        showToast(error.message || error, "error");

    }

    finally {

        saveEmailBtn.disabled = false;

        saveEmailBtn.textContent = "Save Changes";

    }

});

editPhoneBtn.addEventListener("click", () => {

    phoneInput.value = phoneField.textContent.trim();

    editPhoneModal.classList.add("show");

});

closePhoneModal.addEventListener(
    "click",
    closePhoneEditor
);

cancelPhoneBtn.addEventListener(
    "click",
    closePhoneEditor
);

editPhoneModal.addEventListener("click", (event) => {

    if (event.target === editPhoneModal) {

        closePhoneEditor();

    }

});

savePhoneBtn.addEventListener("click", async () => {

    const phone = phoneInput.value.trim();

    if (!phone) {

        showToast("Please enter your phone number.", "info");

        return;

    }

    try {

        savePhoneBtn.disabled = true;

        savePhoneBtn.textContent = "Saving...";

        const response = await Parse.Cloud.run(

            "updateUserProfile",

            {

                phone

            }

        );

        if (!response.success) {

            throw new Error(

                response.message ||

                "Unable to update phone number."

            );

        }

        phoneField.textContent = phone;

        closePhoneEditor();

        showToast("Phone number updated successfully.", "success");

    }

    catch (error) {

        console.error(error);

        showToast(error.message || error, error, "error");

    }

    finally {

        savePhoneBtn.disabled = false;

        savePhoneBtn.textContent = "Save Changes";

    }

});

editCountryBtn.addEventListener("click", () => {

    countryInput.value = currentUserCountry;

    editCountryModal.classList.add("show");

});

closeCountryModal.addEventListener(
    "click",
    closeCountryEditor
);

cancelCountryBtn.addEventListener(
    "click",
    closeCountryEditor
);

editCountryModal.addEventListener("click", (event) => {

    if (event.target === editCountryModal) {

        closeCountryEditor();

    }

});

saveCountryBtn.addEventListener("click", async () => {

    const country = countryInput.value.trim();

    if (!country) {

        showToast("Please select a country.", "warning");

        return;

    }

    try {

        saveCountryBtn.disabled = true;

        saveCountryBtn.textContent = "Saving...";

        const response = await Parse.Cloud.run(

            "updateUserProfile",

            {

                country

            }

        );

        if (!response.success) {

            throw new Error(

                response.message ||

                "Unable to update country."

            );

        }

        currentUserCountry = country;

countryField.textContent = country;;

        closeCountryEditor();

        showToast("Country updated successfully.", "success");

    }

    catch (error) {

        console.error(error);

        showToast(error.message || error, "error");

    }

    finally {

        saveCountryBtn.disabled = false;

        saveCountryBtn.textContent = "Save Changes";

    }

});

document.addEventListener("DOMContentLoaded", async () => {

    await loadCurrencyCountries();

    await loadUserProfile();

});