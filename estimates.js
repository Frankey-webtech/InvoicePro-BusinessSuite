let searchTimeout;

let selectedEstimate = null;

let selectedEstimateCompany = null;

let deletingEstimateId = null;

let selectedEstimateItems = [];

let selectedEstimateClient = null;

let currentSubscriptionSettings = null;

let showClientImage = true;

let currentPage = 1;

const pageLimit = 10;

let totalPages = 1;

let totalRecords = 0;

let estimates = [];

let estimateCurrencyCode = "";

let estimateCurrencySymbol = "";

let currencySymbol = "$";

let editingEstimate = false;

let editingEstimateId = null;

let estimateItemCount = 0;

let estimateTemplateSaveTimeout = null;

let estimateTemplateSaving = false;

const toastContainer =
document.getElementById("toastContainer");

const deleteEstimateButton = document.getElementById("confirmDeleteEstimateButton");

const cancelDeleteEstimateButton = document.getElementById("cancelDeleteEstimateButton");

const estimatesTableBody = document.getElementById("estimatesTableBody");

const emptyState =
    document.getElementById("emptyState");

const emptyStateTitle =
    document.getElementById("emptyStateTitle");

const emptyStateDescription =
    document.getElementById("emptyStateDescription");

const estimateSearchInput = document.getElementById("estimateSearchInput");

const estimateStatusFilter = document.getElementById("estimateStatusFilter");

const sortEstimates = document.getElementById("sortEstimates");

const estimateClientPicker =
    document.getElementById(
        "estimateClientPicker"
    );

const estimateClientPickerTrigger =
    document.getElementById(
        "estimateClientPickerTrigger"
    );

const estimateClientPickerSelected =
    document.getElementById(
        "estimateClientPickerSelected"
    );

const estimateClientPickerSearch =
    document.getElementById(
        "estimateClientPickerSearch"
    );

const estimateClientPickerOptions =
    document.getElementById(
        "estimateClientPickerOptions"
    );

const createEstimateButton = document.getElementById("createEstimateButton");

const emptyStateCreateEstimateButton = document.getElementById("emptyStateCreateEstimateButton");

const exportEstimatesPdfButton =
document.getElementById("exportEstimatesPdfButton");

const previousPageButton = document.getElementById("previousPageButton");

const nextPageButton = document.getElementById("nextPageButton");

const pageOneButton = document.getElementById("pageOneButton");

const pageTwoButton = document.getElementById("pageTwoButton");

const pageThreeButton = document.getElementById("pageThreeButton");

const startRecord =document.getElementById("startRecord");

const endRecord = document.getElementById("endRecord");

const totalRecordsElement =
document.getElementById("totalRecords");

const totalEstimatesValue = document.getElementById("totalEstimatesValue");

const pendingEstimatesValue = document.getElementById("pendingEstimatesValue");

const approvedEstimatesValue = document.getElementById("approvedEstimatesValue");

const estimatedValueValue = document.getElementById("estimatedValueValue");

const estimatePreviewPanel =
document.getElementById("estimatePreviewPanel");

const estimatePreviewOverlay = document.getElementById("estimatePreviewOverlay");

const closeEstimatePreviewButton = document.getElementById("closeEstimatePreviewButton");

const approveEstimateButton =
document.getElementById(
    "approveEstimateButton"
);

const printEstimatePdfButton =
document.getElementById(
    "printEstimatePdfButton"
);

const convertEstimate =
document.getElementById(
    "convertEstimate"
);

const createEstimateOverlay = document.getElementById("createEstimateOverlay");

const createEstimateModal = document.getElementById("createEstimateModal");

const closeCreateEstimateButton = document.getElementById("closeCreateEstimateButton");

const cancelEstimateButton = document.getElementById("cancelEstimateButton");

const saveEstimateButton = document.getElementById("saveEstimateButton");

const saveEstimateDraftButton = document.getElementById("saveEstimateDraftButton");

const addEstimateItemButton = document.getElementById("addEstimateItemButton");

const estimateItemsContainer = document.getElementById("estimateItemsContainer");

const tableWrapper =
document.getElementById("tableWrapper");

const tableFooter =
document.getElementById("tableFooter");

const tableToolbar =
document.getElementById("tableToolbar");

const estimateClientInput =
document.getElementById("estimateClientInput");

const estimateNumberInput =
document.getElementById("estimateNumberInput");

const profileMenuButton =
document.getElementById("profileMenuButton");

const profileDropdown =
document.getElementById("profileDropdown");

const sidebar =
document.getElementById("sidebar");

const sidebarOverlay =
document.getElementById("sidebarOverlay");

if (profileMenuButton && profileDropdown) {

    profileMenuButton.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            profileDropdown.classList.toggle("show");

        }
    );

    document.addEventListener(
        "click",
        function () {

            profileDropdown.classList.remove("show");

        }
    );

}

async function loadUserProfile() {

    try {

        const result =
        await Parse.Cloud.run("getDashboardProfile");

        estimateCurrencySymbol =
            result.currencySymbol || "$";

        currencySymbol =
            estimateCurrencySymbol;

    }

    catch (error) {

        console.error(
            "Profile Error:",
            error
        );

        showToast(
            error.message ||
            "Unable to load your profile.",
            "error"
        );

    }

}

const notificationButton =
document.getElementById("notificationBtn");

const notificationBadge =
document.getElementById("notificationBadge");

const estimatePreviewState = {

    initialized: false,

    userProfile: null,

    template: null,

    currencyCode: "USD",

    currencySymbol: "$",

    logoUrl: "",

    primaryColor: "#2563EB",

    secondaryColor: "#FFFFFF",

    estimate: null

};

const estimatePreviewElements = {

    paper: document.getElementById("estimatePaper"),

    title: document.getElementById("estimatePreviewTitle"),

    number: document.getElementById("estimatePreviewNumber"),

    companyName: document.getElementById("estimateCompanyName"),

    logo: document.getElementById("estimateCompanyLogo"),

    itemsTable: document.getElementById("estimateItemsTableBody"),

    subtotal: document.getElementById("previewSubtotal"),

    grandTotal: document.getElementById("estimatePreviewGrandTotal")

};

const printEstimateButton =
document.getElementById(
    "printEstimateButton"
);

if (printEstimateButton) {

    printEstimateButton.addEventListener(
        "click",
        printEstimatePreview
    );

}

const downloadEstimatePdfButton =
document.getElementById(
    "downloadEstimatePdfButton"
);

const signatureImageInput =
    document.getElementById("signatureImageInput");

const signaturePreview =
    document.getElementById("signaturePreview");
    
const sendEstimateButton =
document.getElementById(
    "sendEstimateButton"
);

if (downloadEstimatePdfButton) {

    downloadEstimatePdfButton.addEventListener(
        "click",
        () => {

            exportEstimatesPdf(
                selectedEstimate?.objectId
            );

        }
    );

}

function formatDate(date) {

    if (!date) {
        return "-";
    }

    const parsedDate =
        new Date(date);

    if (isNaN(parsedDate.getTime())) {
        return "-";
    }

    return parsedDate.toLocaleDateString();
}

function initializeEstimatePreviewDefaults() {

    const profile =
    estimatePreviewState.userProfile;

    customerNotesInput.value =
    profile.defaultInvoiceNotes || "";

    estimateTermsInput.value =
    profile.defaultInvoiceTerms || "";

    estimateTaxInput.value =
    profile.defaultTaxPercentage || 0;

}

function updateEstimatePreview() {

    updateEstimateHeaderPreview();

    updateEstimateDetailsPreview();

    updateEstimateNotesPreview();

    updateEstimateSignaturePreview();

}

function updateEstimatePaymentPreview() {

    const paymentDetails =
    selectedEstimate?.paymentDetails || {};

setPreviewText(
    "previewPaymentProvider",
    paymentDetails.paymentProvider,
    "-"
);

setPreviewText(
    "previewPaymentMethod",
    paymentDetails.paymentMethod,
    "-"
);

const paymentReference =
    [
        paymentDetails.accountName
            ? `<strong>Account Name:</strong> ${paymentDetails.accountName}`
            : "",
        paymentDetails.bankName
            ? `<strong>Bank Name:</strong> ${paymentDetails.bankName}`
            : "",
        paymentDetails.accountNumber
            ? `<strong>Account Number:</strong> ${paymentDetails.accountNumber}`
            : "",
        paymentDetails.routingNumber
            ? `<strong>Routing Number:</strong> ${paymentDetails.routingNumber}`
            : "",
        paymentDetails.swiftCode
            ? `<strong>SWIFT Code:</strong> ${paymentDetails.swiftCode}`
            : "",
        paymentDetails.paymentAccount
            ? `<strong>Payment Account:</strong> ${paymentDetails.paymentAccount}`
            : "",
        paymentDetails.paymentLink
            ? `<strong>Payment Link:</strong> ${paymentDetails.paymentLink}`
            : ""
    ]
    .filter(Boolean)
    .join("<br><br>");

document.getElementById(
    "previewPaymentReference"
).innerHTML =
    paymentReference || "-";

    setPreviewText(
        "previewPaymentStatus",
        paymentDetails.paymentStatus,
        "Pending"
    );
    
    setPreviewText(
    "previewPaymentStatus",
    paymentDetails.paymentStatus || "Pending",
    "Pending"
);

}

function updateEstimateHeaderPreview() {

    setPreviewText(
        "estimatePreviewTitle",
        estimateTitleInput.value,
        "ESTIMATE"
    );

    setPreviewText(
        "estimatePreviewProjectName",
        projectNameInput.value,
        "-"
    );

    setPreviewText(
        "estimatePreviewNumber",
        estimateNumberInput.value,
        "-"
    );

}

function updateEstimateDetailsPreview() {

    setPreviewText(
        "estimatePreviewReference",
        referenceNumberInput.value,
        "-"
    );

    setPreviewText(
        "estimatePreviewPurchaseOrder",
        purchaseOrderInput.value,
        "-"
    );

    setPreviewText(
        "estimatePreviewIssueDate",
        formatPreviewDate(
            estimateIssueDateInput.value
        ),
        "-"
    );

    setPreviewText(
        "estimatePreviewExpiryDate",
        formatPreviewDate(
            estimateExpiryDateInput.value
        ),
        "-"
    );

}

function updateEstimateNotesPreview() {

    setPreviewText(
        "estimatePreviewNotes",
        customerNotesInput.value,
        "No notes."
    );

    setPreviewText(
        "estimatePreviewTerms",
        estimateTermsInput.value,
        "No terms."
    );

    setPreviewText(
        "estimatePreviewValidity",
        validityMessageInput.value,
        ""
    );
    
    updateEstimateSignaturePreview();

}

function updateEstimateSignaturePreview() {

    setPreviewText(
        "estimatePreviewSignatureName",
        signatureNameInput.value,
        ""
    );

    setPreviewText(
        "estimatePreviewSignatureTitle",
        signatureTitleInput.value,
        ""
    );

    const previewImage =
        document.getElementById(
            "estimatePreviewSignatureImage"
        );

    if (!previewImage) {
        return;
    }

    if (
        signatureImageInput &&
        signatureImageInput.files &&
        signatureImageInput.files.length > 0
    ) {

        const file =
            signatureImageInput.files[0];

        if (!file.type.startsWith("image/")) {

            previewImage.style.display = "none";

            return;

        }

        const reader =
            new FileReader();

        reader.onload =
            function(event) {

                previewImage.src =
                    event.target.result;

                previewImage.style.display =
                    "block";

            };

        reader.readAsDataURL(file);

    }

}

function registerEstimatePreviewListeners() {

    const controls = [

        estimateTitleInput,

        projectNameInput,

        estimateNumberInput,

        referenceNumberInput,

        purchaseOrderInput,

        estimateIssueDateInput,

        estimateExpiryDateInput,

        customerNotesInput,

        estimateTermsInput,

        validityMessageInput,

        signatureNameInput,

        signatureTitleInput

    ];

    controls.forEach(control => {

        if (!control) return;

        control.addEventListener("input", updateEstimatePreview);

        control.addEventListener("change", updateEstimatePreview);

    });

    if (signatureImageInput) {

        signatureImageInput.addEventListener(
            "change",
            updateEstimateSignatureImagePreview
        );

    }
    
    estimateClientInput.addEventListener(
    "change",
    updateEstimateClientPreview
);

estimateTaxInput.addEventListener(
    "input",
    updateEstimateTotalsPreview
);

estimateDiscountInput.addEventListener(
    "input",
    updateEstimateTotalsPreview
);

estimateShippingInput.addEventListener(
    "input",
    updateEstimateTotalsPreview
);

    updateEstimatePreview();

}

function updateEstimateSignatureImagePreview() {

    if (!signatureImageInput || !signaturePreview) {
        return;
    }

    const file = signatureImageInput.files[0];

    if (!file) {

        signaturePreview.src = "";
        signaturePreview.style.display = "none";

        return;
    }

    if (!file.type.startsWith("image/")) {

        signatureImageInput.value = "";
        signaturePreview.src = "";
        signaturePreview.style.display = "none";

        return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {

        signaturePreview.src = event.target.result;
        signaturePreview.style.display = "block";

    };

    reader.readAsDataURL(file);
}

function setPreviewText(
    id,
    value,
    fallback = ""
) {

    const element =
    document.getElementById(id);

    if (!element) return;

    element.textContent =
        value && value.trim()
        ? value
        : fallback;

}

function formatPreviewDate(value) {

    if (!value) {

        return "";

    }

    return new Date(value)
        .toLocaleDateString(
            undefined,
            {

                year: "numeric",

                month: "long",

                day: "numeric"

            }

        );

}

function updateEstimateBusinessPreview() {

    const profile =
        estimatePreviewState.userProfile;

    if (!profile) {
        return;
    }

    setPreviewText(
        "previewCompanyName",
        profile.businessName ||
        profile.companyName ||
        profile.name,
        "Invoice Pro"
    );

    setPreviewText(
        "previewCompanyAddress",
        profile.businessAddress ||
        profile.address ||
        "",
        ""
    );

    setPreviewText(
        "previewCompanyPhone",
        profile.businessPhone ||
        profile.phone ||
        "",
        ""
    );

    setPreviewText(
        "previewCompanyEmail",
        profile.businessEmail ||
        profile.email ||
        "",
        ""
    );

    setPreviewText(
        "previewCompanyWebsite",
        profile.businessWebsite ||
        profile.website ||
        "",
        ""
    );

    updateEstimateCompanyLogo(profile);

}

function updateEstimateCompanyLogo(profile) {

    const logo =
        document.getElementById(
            "previewCompanyLogo"
        );

    if (!logo) {
        return;
    }

    let logoUrl =
        estimatePreviewState.logoUrl || "";

    if (!logoUrl && profile) {

        const businessLogo =
            profile.businessLogo;

        if (
            businessLogo &&
            typeof businessLogo.url === "function"
        ) {

            logoUrl =
                businessLogo.url();

        }

        else if (
            typeof businessLogo === "string"
        ) {

            logoUrl =
                businessLogo;

        }

    }

    if (logoUrl) {

        logo.src =
            logoUrl;

        logo.style.display =
            "block";

    }

    else {

        logo.removeAttribute(
            "src"
        );

        logo.style.display =
            "none";

    }

}

function applyEstimateBrandColors(profile) {

    const paper =
        document.getElementById(
            "estimatePaper"
        );

    if (!paper) {

        return;

    }

    paper.style.setProperty(

        "--estimate-primary",

        profile.primaryColor || "#2563EB"

    );

    paper.style.setProperty(

        "--estimate-secondary",

        profile.secondaryColor || "#FFFFFF"

    );

}

function refreshEstimateBusinessPreview() {

    updateEstimateBusinessPreview();

}

function setEstimatePreviewClients(clients) {

    estimatePreviewState.clients =
        Array.isArray(clients)
        ? clients
        : [];

}

function updateEstimateClientPreview() {
    
    const clientId =
        estimateClientInput.value;
    
    const client =
        selectedEstimateClient &&
        (
            selectedEstimateClient.objectId ===
            clientId ||
            selectedEstimateClient.id ===
            clientId
        ) ?
        selectedEstimateClient :
        estimatePreviewState.clients.find(
            item => {
                
                return (
                    item.objectId ===
                    clientId ||
                    item.id ===
                    clientId
                );
                
            }
        );
    
    if (!client) {
        
        clearEstimateClientPreview();
        
        return;
        
    }
    
    setPreviewText(
        "estimatePreviewClientName",
        client.contactPerson ||
        client.contactName ||
        client.fullName ||
        client.name,
        "-"
    );
    
    setPreviewText(
        "estimatePreviewCompany",
        client.companyName,
        "-"
    );
    
    setPreviewText(
        "estimatePreviewClientEmail",
        client.clientEmail ||
        client.email ||
        client.contactEmail,
        "-"
    );
    
    setPreviewText(
        "estimatePreviewClientPhone",
        client.clientPhone ||
        client.phone ||
        client.contactPhone,
        "-"
    );
    
    setPreviewText(
        "estimatePreviewClientAddress",
        client.clientAddress ||
        client.address ||
        client.businessAddress,
        "-"
    );
    
}

function clearEstimateClientPreview() {

    const ids = [

        "estimatePreviewClientName",

        "estimatePreviewCompany",

        "estimatePreviewClientEmail",

        "estimatePreviewClientPhone",

        "estimatePreviewClientAddress"

    ];

    ids.forEach(id => {

        setPreviewText(
            id,
            "",
            "-"
        );

    });

}

function setEstimatePreviewItems(items) {

    estimatePreviewState.items = Array.isArray(items)
        ? items
        : [];

    updateEstimateItemsPreview();

}

function updateEstimateItemsPreview() {

    const tbody =
        document.getElementById(
            "previewItemsBody"
        );

    if (!tbody) {

        console.warn(
            "previewItemsBody was not found."
        );

        return;

    }

    tbody.innerHTML = "";

    const items =
        Array.isArray(estimatePreviewState.items)
            ? estimatePreviewState.items
            : [];

    if (items.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="empty-items-row">

                    No items added yet.

                </td>

            </tr>

        `;

        return;

    }

    items.forEach((item, index) => {

        const quantity =
            Number(item.quantity) || 0;

        const unitPrice =
            Number(
                item.rate ??
                item.unitPrice ??
                0
            );

        const description =
            item.itemName ??
            item.description ??
            "-";

        const total =
            Number(
                item.total ??
                (quantity * unitPrice)
            );

        const row =
            document.createElement("tr");

        row.innerHTML = `

            <td class="item-number">
                ${index + 1}
            </td>

            <td class="item-description">
                ${description}
            </td>

            <td>
                ${quantity}
            </td>

            <td>
                ${formatEstimateMoney(unitPrice)}
            </td>

            <td class="amount-column">
                ${formatEstimateMoney(total)}
            </td>

        `;

        tbody.appendChild(row);

    });

}

function formatEstimateMoney(amount) {

    return `${estimatePreviewState.currencySymbol}${Number(amount || 0).toLocaleString(
        undefined,
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    )}`;

}

function updateEstimateTotalsPreview() {

    const items =
        Array.isArray(estimatePreviewState.items)
            ? estimatePreviewState.items
            : [];

    let subtotal = 0;

    items.forEach(item => {

        const quantity =
            Number(item.quantity) || 0;

        const unitPrice =
            Number(
                item.rate ??
                item.unitPrice ??
                0
            );

        subtotal +=
            quantity * unitPrice;

    });

    const taxPercent =
        Number(
            estimateTaxInput.value
        ) || 0;

    const discount =
        Number(
            estimateDiscountInput.value
        ) || 0;

    const shipping =
        Number(
            estimateShippingInput.value
        ) || 0;

    const taxAmount =
        subtotal *
        (taxPercent / 100);

    const grandTotal =
        subtotal +
        taxAmount +
        shipping -
        discount;

    setPreviewText(
        "previewSubtotal",
        formatEstimateMoney(subtotal),
        formatEstimateMoney(0)
    );

    setPreviewText(
        "previewTax",
        formatEstimateMoney(taxAmount),
        formatEstimateMoney(0)
    );

    setPreviewText(
        "previewDiscount",
        formatEstimateMoney(discount),
        formatEstimateMoney(0)
    );

    setPreviewText(
        "previewShipping",
        formatEstimateMoney(shipping),
        formatEstimateMoney(0)
    );

    setPreviewText(
        "previewGrandTotal",
        formatEstimateMoney(
            Math.max(grandTotal, 0)
        ),
        formatEstimateMoney(0)
    );

}

function applyEstimateTemplate() {

    const paper =
        document.getElementById("estimatePaper");

    if (!paper) {

        return;

    }

    const settings =
        estimatePreviewState.template || {};

    // ======================================
    // COLORS
    // ======================================

    paper.style.backgroundColor =
        settings.backgroundColor || "#FFFFFF";

    paper.style.color =
        settings.textColor || "#111827";

    paper.style.setProperty(
        "--estimate-accent-color",
        settings.accentColor || "#2563EB"
    );

    // ======================================
    // TYPOGRAPHY
    // ======================================

    paper.style.fontFamily =
        settings.fontFamily || "Inter";

    paper.style.fontSize =
        `${settings.fontSize || 16}px`;

    paper.style.fontWeight =
        settings.fontWeight || "400";

    paper.style.lineHeight =
        settings.lineHeight || 1.5;

    paper.style.letterSpacing =
        `${settings.letterSpacing || 0}px`;

    paper.style.textTransform =
        settings.textTransform || "none";

    paper.style.borderRadius =
        `${settings.borderRadius || 0}px`;

    paper.style.padding =
        `${settings.padding || 40}px`;

    paper.style.width =
        `${settings.width || 100}%`;

    // ======================================
    // BORDER
    // ======================================

    paper.style.border =
        settings.borderEnabled
        ? `${settings.borderWidth || 1}px ${settings.borderStyle || "solid"} ${settings.borderColor || "#D9E2EC"}`
        : "none";

    // ======================================
    // SHADOW
    // ======================================

    paper.style.boxShadow =
        settings.shadowEnabled
        ? `0 0 ${settings.shadowBlur || 12}px rgba(0,0,0,.15)`
        : "none";

    // ======================================
    // ALIGNMENT
    // ======================================

    paper.style.textAlign =
        settings.textAlign || "left";

    // ======================================
    // VISIBILITY
    // ======================================

    toggleEstimateSection(
        "estimateHeaderSelection",
        settings.showEstimateTitle
    );

    toggleEstimateSection(
        "estimateCompanySelection",
        settings.showCompanyInfo
    );

    toggleEstimateSection(
        "estimateCustomerSelection",
        settings.showCustomerInfo
    );

    toggleEstimateSection(
        "estimateItemsSelection",
        settings.showItemsTable
    );

    toggleEstimateSection(
        "estimateTotalsSelection",
        settings.showGrandTotal
    );

    toggleEstimateSection(
        "estimateNotesSelection",
        settings.showNotes
    );

    toggleEstimateSection(
        "estimateFooterSelection",
        settings.showFooter
    );

    toggleEstimateElement(
        "estimateCompanyLogo",
        settings.showLogo
    );

    toggleEstimateElement(
        "estimateCompanyAddress",
        settings.showCompanyAddress
    );

    toggleEstimateElement(
        "estimateCompanyPhone",
        settings.showCompanyPhone
    );

    toggleEstimateElement(
        "estimateCompanyEmail",
        settings.showCompanyEmail
    );

}

function toggleEstimateSection(id, visible) {

    const element =
        document.getElementById(id);

    if (!element) {

        return;

    }

    element.style.display =
        visible === false
        ? "none"
        : "";

}

function toggleEstimateElement(id, visible) {

    const element =
        document.getElementById(id);

    if (!element) {

        return;

    }

    element.style.display =
        visible === false
        ? "none"
        : "";

}

function queueEstimateTemplateSave(section) {

    clearTimeout(
        estimateTemplateSaveTimeout
    );

    estimateTemplateSaveTimeout =
        setTimeout(() => {

            saveEstimateTemplate(section);

        }, 600);

}

function updateEstimateTemplateSetting(
    key,
    value,
    section = "general"
) {

    estimatePreviewState.template[key] =
        value;

    applyEstimateTemplate();

    queueEstimateTemplateSave(section);

}

function getEstimatePreviewElement() {

    return document.getElementById(
        "estimatePaper"
    );

}

function prepareEstimatePreviewForExport() {

    const paper =
        getEstimatePreviewElement();

    if (!paper) {

        return null;

    }

    paper.classList.add(
        "estimate-export-mode"
    );

    return paper;

}

function restoreEstimatePreviewAfterExport() {

    const paper =
        getEstimatePreviewElement();

    if (!paper) {

        return;

    }

    paper.classList.remove(
        "estimate-export-mode"
    );

}

function populateEstimatePreview() {

    if (!selectedEstimate) {
        return;
    }

    const estimate =
        selectedEstimate;

    const client =
        selectedEstimateClient;
        
    
    estimatePreviewState.currencyCode =
        estimate.currencyCode || "USD";

    estimatePreviewState.currencySymbol =
        estimate.currencySymbol || "$";

    setPreviewText(
        "previewCurrency",
        estimate.currencyCode &&
        estimate.currencySymbol
            ? `${estimate.currencyCode} (${estimate.currencySymbol})`
            : "USD ($)"
    );

    setPreviewText(
        "previewHeaderEstimateNumber",
        estimate.estimateNumber,
        "EST-000001"
    );

    setPreviewText(
        "previewHeaderIssueDate",
        formatPreviewDate(
            estimate.issueDate
        ),
        "-"
    );

    setPreviewText(
        "previewHeaderExpiryDate",
        formatPreviewDate(
            estimate.expiryDate
        ),
        "-"
    );

    setPreviewText(
        "previewEstimateNumber",
        estimate.estimateNumber,
        "EST-000001"
    );

    setPreviewText(
        "previewEstimateTitle",
        estimate.estimateTitle ||
        "ESTIMATE",
        "ESTIMATE"
    );

    setPreviewText(
        "estimatePreviewPurchaseOrder",
        estimate.purchaseOrder,
        "-"
    );

    setPreviewText(
        "estimatePreviewReference",
        estimate.referenceNumber,
        "-"
    );

    setPreviewText(
        "estimatePreviewProjectName",
        estimate.projectName,
        "-"
    );

    const statusElement =
        document.getElementById(
            "previewEstimateStatus"
        );

    if (statusElement) {

        const status =
            estimate.status || "Draft";

        statusElement.textContent =
            status;

        statusElement.className =
            `estimate-status ${status.toLowerCase()}`;

    }

    setPreviewText(
        "previewIssueDate",
        formatPreviewDate(
            estimate.issueDate
        ),
        "-"
    );

    setPreviewText(
        "previewExpiryDate",
        formatPreviewDate(
            estimate.expiryDate
        ),
        "-"
    );

    updateEstimateBusinessPreview();
    
    setPreviewText(
    "previewSalesRepresentative",
    selectedEstimateCompany?.salesRepresentative,
    "-"
);

    if (client) {

        setPreviewText(
            "previewClientName",
            client.contactPerson,
            "-"
        );

        setPreviewText(
            "previewClientCompany",
            client.companyName,
            "-"
        );

        setPreviewText(
    "previewClientAddress",
    [
        client.billingAddressLine1,
        client.billingAddressLine2,
        client.billingCityStateZip,
        client.billingCountry
    ]
    .filter(Boolean)
    .join("\n"),
    "-"
);

        setPreviewText(
            "previewClientEmail",
            client.clientEmail,
            "-"
        );

        setPreviewText(
            "previewClientPhone",
            client.clientPhone,
            "-"
        );
        
        const clientImage =
    document.getElementById(
        "estimatePreviewClientImage"
    );

if (clientImage) {

    if (
        showClientImage &&
        client.clientImageUrl
    ) {

        clientImage.src =
            client.clientImageUrl;

        clientImage.style.display =
            "block";

    } else {

        clientImage.removeAttribute(
            "src"
        );

        clientImage.style.display =
            "none";

    }

}

        setPreviewText(
            "estimatePreviewClientName",
            client.contactPerson,
            "-"
        );

        setPreviewText(
            "estimatePreviewCompany",
            client.companyName,
            "-"
        );

        setPreviewText(
            "estimatePreviewClientEmail",
            client.clientEmail,
            "-"
        );

        setPreviewText(
            "estimatePreviewClientPhone",
            client.clientPhone,
            "-"
        );

        setPreviewText(
    "estimatePreviewBillingAddressLine1",
    client.billingAddressLine1,
    "-"
);

setPreviewText(
    "estimatePreviewBillingAddressLine2",
    client.billingAddressLine2,
    "-"
);

setPreviewText(
    "estimatePreviewBillingCityStateZip",
    client.billingCityStateZip,
    "-"
);

setPreviewText(
    "estimatePreviewBillingCountry",
    client.billingCountry,
    "-"
);

        setPreviewText(
            "previewClientShipName",
            client.contactPerson,
            "-"
        );

        setPreviewText(
    "previewClientShipAddress",
    [
        client.billingAddressLine1,
        client.billingAddressLine2,
        client.billingCityStateZip,
        client.billingCountry
    ]
    .filter(Boolean)
    .join("\n"),
    "-"
);

    } else {

        setPreviewText(
            "previewClientName",
            "",
            "-"
        );

        setPreviewText(
            "previewClientCompany",
            "",
            "-"
        );

        setPreviewText(
        "previewClientAddress",
        "",
        "-"
);

        setPreviewText(
            "previewClientEmail",
            "",
            "-"
        );

        setPreviewText(
            "previewClientPhone",
            "",
            "-"
        );

        setPreviewText(
            "estimatePreviewClientName",
            "",
            "-"
        );

        setPreviewText(
            "estimatePreviewCompany",
            "",
            "-"
        );

        setPreviewText(
            "estimatePreviewClientEmail",
            "",
            "-"
        );

        setPreviewText(
            "estimatePreviewClientPhone",
            "",
            "-"
        );

        setPreviewText(
            "estimatePreviewBillingAddress",
            "",
            "-"
        );

        setPreviewText(
            "previewClientShipName",
            "",
            "-"
        );

        setPreviewText(
    "previewClientShipAddress",
    [
        client.billingAddressLine1,
        client.billingAddressLine2,
        client.billingCityStateZip,
        client.billingCountry
    ]
    .filter(Boolean)
    .join("\n"),
    "-"
);

    }

    setEstimatePreviewItems(
        Array.isArray(
            selectedEstimateItems
        )
            ? selectedEstimateItems
            : []
    );

    updateEstimateSavedTotalsPreview(
        estimate
    );

    updateEstimatePaymentPreview();

    setPreviewText(
        "estimatePreviewNotes",
        estimate.notes,
        "No notes."
    );

    setPreviewText(
        "estimatePreviewTerms",
        estimate.terms,
        "No terms available."
    );

    setPreviewText(
        "estimatePreviewValidity",
        estimate.validityMessage,
        ""
    );

    setPreviewText(
        "estimatePreviewSignatureName",
        estimate.signatureName,
        ""
    );

    setPreviewText(
    "estimatePreviewSignatureTitle",
    estimate.signatureTitle
        ? ` (${estimate.signatureTitle})`
        : "",
    ""
);

    const signatureImage =
        document.getElementById(
            "estimatePreviewSignatureImage"
        );

    if (signatureImage) {

        if (estimate.signatureImage) {

            signatureImage.src =
                estimate.signatureImage;

            signatureImage.style.display =
                "block";

        } else {

            signatureImage.removeAttribute(
                "src"
            );

            signatureImage.style.display =
                "none";

        }

    }

}

function updateEstimateSavedTotalsPreview(estimate) {

    if (!estimate) {

        return;

    }

    setPreviewText(
        "previewSubtotal",
        formatEstimateMoney(
            estimate.subtotal || 0
        ),
        formatEstimateMoney(0)
    );

    setPreviewText(
        "previewTax",
        formatEstimateMoney(
            estimate.taxAmount || 0
        ),
        formatEstimateMoney(0)
    );

    setPreviewText(
        "previewDiscount",
        formatEstimateMoney(
            estimate.discount || 0
        ),
        formatEstimateMoney(0)
    );

    setPreviewText(
        "previewShipping",
        formatEstimateMoney(
            estimate.shipping || 0
        ),
        formatEstimateMoney(0)
    );

    setPreviewText(
        "previewGrandTotal",
        formatEstimateMoney(
            estimate.grandTotal || 0
        ),
        formatEstimateMoney(0)
    );

}

function getClientInitials(name) {

    const parts =
        (name || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (!parts.length) {
        return "?";
    }

    if (parts.length === 1) {
        return parts[0]
            .substring(0, 2)
            .toUpperCase();
    }

    return (
        parts[0][0] +
        parts[parts.length - 1][0]
    ).toUpperCase();

}

function getClientAvatarColor(name) {

    const colors = [
        "#3B82F6",
        "#8B5CF6",
        "#EC4899",
        "#10B981",
        "#F59E0B",
        "#EF4444",
        "#06B6D4",
        "#6366F1"
    ];

    let hash = 0;

    for (let i = 0; i < name.length; i++) {
        hash =
            name.charCodeAt(i) +
            ((hash << 5) - hash);
    }

    return colors[
        Math.abs(hash) % colors.length
    ];

}

function openEstimatePreview(){

    estimatePreviewPanel.classList.add(
    "show"
    );

    estimatePreviewOverlay.classList.add(
    "show"
    );

}

function closeEstimatePreview(){

    estimatePreviewPanel.classList.remove(
    "show"
    );

    estimatePreviewOverlay.classList.remove(
    "show"
    );

}

function resetEstimateForm(){
    
    const estimateCurrencyInput =
    document.getElementById(
        "estimateCurrencyInput"
    );

if (estimateCurrencyInput) {

    estimateCurrencyInput.value = "";

}

    editingEstimate = false;

    editingEstimateId = null;

    estimateItemCount = 0;
    
    selectedEstimate = null;

    clearEstimateClientPicker();

    document.getElementById(
    "estimateNumberInput"
    ).value = "";

    document.getElementById(
    "estimateIssueDateInput"
    ).value = "";

    document.getElementById(
    "estimateExpiryDateInput"
    ).value = "";

    document.getElementById(
    "estimateTaxInput"
    ).value = "";

    document.getElementById(
    "estimateDiscountInput"
    ).value = "";

    document.getElementById(
    "estimateShippingInput"
    ).value = "";

    document.getElementById(
    "customerNotesInput"
    ).value = "";

    document.getElementById(
    "estimateTermsInput"
    ).value = "";

    document.getElementById(
    "estimateItemsContainer"
    ).innerHTML = "";
    
    document.getElementById(
    "estimateTitleInput"
).value = "";

document.getElementById(
    "projectNameInput"
).value = "";

document.getElementById(
    "referenceNumberInput"
).value = "";

document.getElementById(
    "purchaseOrderInput"
).value = "";

document.getElementById(
    "validityMessageInput"
).value = "";

document.getElementById(
    "signatureNameInput"
).value = "";

document.getElementById(
    "signatureTitleInput"
).value = "";

document.getElementById(
    "signatureImageInput"
).value = "";

document.getElementById(
    "signaturePreview"
).style.display = "none";
    
    addEstimateItem();

    document.getElementById(
    "estimateSubtotal"
    ).textContent =
    currencySymbol + "0.00";

    document.getElementById(
    "estimateGrandTotal"
    ).textContent =
    currencySymbol + "0.00";
    
   


} 

function populateEstimateForm(result){

    const estimate =
    result.estimate;

    const client =
    result.client;
    
    const estimateCurrencyInput =
    document.getElementById(
        "estimateCurrencyInput"
    );

    if (estimateCurrencyInput) {

    estimateCurrencyInput.value =
        estimate.currencyCode || "";

}

    estimateClientInput.value =
    client.objectId || "";

selectedEstimateClient =
    client;

estimateClientPickerSelected.textContent =
    getEstimateClientDisplayName(
        client
    );

setEstimatePreviewClients([
    client
]);

updateEstimateClientPreview();

    document.getElementById(
        "estimateNumberInput"
    ).value =
    estimate.estimateNumber || "";

    document.getElementById(
        "estimateIssueDateInput"
    ).value =
    estimate.issueDate
    ? new Date(
        estimate.issueDate
      ).toISOString().split("T")[0]
    : "";

    document.getElementById(
        "estimateExpiryDateInput"
    ).value =
    estimate.expiryDate
    ? new Date(
        estimate.expiryDate
      ).toISOString().split("T")[0]
    : "";

    document.getElementById(
        "estimateTaxInput"
    ).value =
    estimate.taxPercent || 0;

    document.getElementById(
        "estimateDiscountInput"
    ).value =
    estimate.discount || 0;

    document.getElementById(
        "estimateShippingInput"
    ).value =
    estimate.shipping || 0;

    document.getElementById(
        "customerNotesInput"
    ).value =
    estimate.notes || "";

    document.getElementById(
        "estimateTermsInput"
    ).value =
    estimate.terms || "";
    
    document.getElementById(
    "estimateTitleInput"
).value =
estimate.estimateTitle || "";

document.getElementById(
    "projectNameInput"
).value =
estimate.projectName || "";

document.getElementById(
    "referenceNumberInput"
).value =
estimate.referenceNumber || "";

document.getElementById(
    "purchaseOrderInput"
).value =
estimate.purchaseOrder || "";

document.getElementById(
    "validityMessageInput"
).value =
estimate.validityMessage || "";

document.getElementById(
    "signatureNameInput"
).value =
estimate.signatureName || "";

document.getElementById(
    "signatureTitleInput"
).value =
estimate.signatureTitle || "";

const signaturePreview =
    document.getElementById("signaturePreview");

if (signaturePreview) {

    if (estimate.signatureImage) {

        signaturePreview.src =
            estimate.signatureImage;

        signaturePreview.style.display =
            "block";

    } else {

        signaturePreview.src = "";

        signaturePreview.style.display =
            "none";
    }
}

    estimateItemsContainer.innerHTML = "";

    populateEstimateItems(
        result.items || []
    );

    calculateEstimateGrandTotal();

}

function closeDeleteEstimateModal(){

    deletingEstimateId = null;

    deleteEstimateOverlay
    .classList.remove(
        "show"
    );

    deleteEstimateModal
    .classList.remove(
        "show"
    );

}

function renderEstimatesTable() {

    estimatesTableBody.innerHTML = "";

    if (!estimates.length) {

        estimatesTable.style.display = "none";

        tableFooter.style.display = "none";

        emptyState.style.display = "flex";

        const searchValue =
            estimateSearchInput.value.trim();

        const statusValue =
            estimateStatusFilter.value;

        if (searchValue !== "") {

            emptyStateTitle.textContent =
                "Estimate not found";

            emptyStateDescription.textContent =
                "We couldn't find the estimate you're searching for. Try searching by estimate number or client name.";

            emptyStateCreateEstimateButton.style.display =
                "none";

        } else if (statusValue !== "") {

            emptyStateTitle.textContent =
                "No estimates found";

            emptyStateDescription.textContent =
                `There are no estimates with the status "${statusValue}".`;

            emptyStateCreateEstimateButton.style.display =
                "none";

        } else {

            emptyStateTitle.textContent =
                "No estimates yet";

            emptyStateDescription.textContent =
                "Create your first estimate to get started.";

            emptyStateCreateEstimateButton.style.display =
                "inline-flex";

        }

        return;
    }

    estimatesTable.style.display = "table";

    tableFooter.style.display = "flex";

    emptyState.style.display = "none";

    estimates.forEach(estimate => {

        const row = document.createElement("tr");

        row.innerHTML = `

            <td>${estimate.estimateNumber}</td>

<td>

    ${
        showClientImage
        ?
        `
        <div class="client-table-info">

            ${
                estimate.clientImageUrl
                ?
                `
                <img
                    src="${estimate.clientImageUrl}"
                    class="client-table-avatar"
                    alt="${estimate.clientName || "Client"}"
                >
                `
                :
                `
                <div
                    class="client-table-avatar client-table-initials"
                    style="background-color: ${getClientAvatarColor(estimate.clientName || "")};"
                >
                    ${getClientInitials(estimate.clientName)}
                </div>
                `
            }

            <span>
                ${estimate.clientName || "No client"}
            </span>

        </div>
        `
        :
        `
        <span>
            ${estimate.clientName || "No client"}
        </span>
        `
    }

</td>

            <td>${formatDate(estimate.createdDate)}</td>

            <td>${formatDate(estimate.expiryDate)}</td>

            <td>${formatCurrency(estimate.grandTotal)}</td>

            <td>

                <span class="status-badge ${estimate.status.toLowerCase()}">

                    ${estimate.status}

                </span>

            </td>

            <td>

                <div class="table-actions">

                    <button
                        class="action-btn view-btn"
                        data-id="${estimate.objectId}">

                        <i class="ri-eye-line"></i>

                    </button>

<button
    class="action-btn edit-btn"
    data-id="${estimate.objectId}">

    <i class="ri-edit-line"></i>

</button>

<button
    class="action-btn duplicate-btn"
    data-id="${estimate.objectId}">

    <i class="ri-file-copy-line"></i>

</button>

<button
    class="action-btn convert-btn"
    data-id="${estimate.objectId}">

    <i class="ri-exchange-line"></i>
   
</button>

                    <button
                        class="action-btn delete-btn"
                        data-id="${estimate.objectId}">

                        <i class="ri-delete-bin-line"></i>

                    </button>

                </div>

            </td>

        `;

        estimatesTableBody.appendChild(row);

    });

}

function updateTableFooter() {

    if (totalRecords === 0) {

        startRecord.textContent = 0;

        endRecord.textContent = 0;

        totalRecordsElement.textContent = 0;

        return;

    }

    const start = ((currentPage - 1) * pageLimit) + 1;

    const end = Math.min(
        currentPage * pageLimit,
        totalRecords
    );

    startRecord.textContent = start;

    endRecord.textContent = end;

    totalRecordsElement.textContent = totalRecords;

}

function updatePagination() {

    pageOneButton.textContent = currentPage;

    pageTwoButton.textContent = currentPage + 1;

    pageThreeButton.textContent = currentPage + 2;

    pageOneButton.classList.remove("active");
    pageTwoButton.classList.remove("active");
    pageThreeButton.classList.remove("active");

    pageOneButton.classList.add("active");

    pageOneButton.disabled = currentPage > totalPages;

    pageTwoButton.disabled = (currentPage + 1) > totalPages;

    pageThreeButton.disabled = (currentPage + 2) > totalPages;

    previousPageButton.disabled = currentPage === 1;

    nextPageButton.disabled = currentPage >= totalPages;

}

function closeCreateEstimateModal() {

    createEstimateModal.classList.remove("show");

    createEstimateOverlay.classList.remove("show");

    document.body.style.overflow = "";

}

function addEstimateItem() {

    const row = document.createElement("div");

    row.className = "estimate-item-row";

    row.innerHTML = `

        <input
            type="text"
            class="estimate-item-name form-control"
            placeholder="Item name">

        <input
            type="number"
            class="estimate-item-quantity form-control"
            value="1"
            min="1">

        <input
            type="number"
            class="estimate-item-rate form-control"
            value="0"
            min="0">

        <input
            type="text"
            class="estimate-item-total form-control"
            value="${currencySymbol}0.00"
            readonly>

        <button
            type="button"
            class="remove-estimate-item">

            Remove

        </button>

    `;

    estimateItemsContainer.appendChild(row);

    attachEstimateItemEvents(row);

    calculateEstimateGrandTotal();

}

function attachEstimateItemEvents(row) {

    row.querySelector(".estimate-item-quantity")
        .addEventListener(
            "input",
            () => updateEstimateRowTotal(row)
        );

    row.querySelector(".estimate-item-rate")
        .addEventListener(
            "input",
            () => updateEstimateRowTotal(row)
        );

    row.querySelector(".remove-estimate-item")
        .addEventListener(
            "click",
            () => {

                row.remove();

                calculateEstimateGrandTotal();

            }
        );

}

function updateEstimateRowTotal(row) {

    const quantity = Number(

        row.querySelector(".estimate-item-quantity").value

    ) || 0;

    const rate = Number(

        row.querySelector(".estimate-item-rate").value

    ) || 0;

    const total = quantity * rate;

    row.querySelector(".estimate-item-total").value =

        currencySymbol +

        total.toFixed(2);

    calculateEstimateGrandTotal();

}

function calculateEstimateGrandTotal() {

    const subtotal =
    calculateEstimateSubtotal();

    const taxPercent = Number(

        estimateTaxInput.value

    ) || 0;

    const discount = Number(

        estimateDiscountInput.value

    ) || 0;

    const shipping = Number(

        estimateShippingInput.value

    ) || 0;

    const taxAmount =

        subtotal *

        (taxPercent / 100);

    const grandTotal =

        subtotal +

        taxAmount +

        shipping -

        discount;

    estimateGrandTotal.textContent =

        formatCurrency(grandTotal);

}

function calculateEstimateSubtotal() {

    let subtotal = 0;

    const rows = estimateItemsContainer.querySelectorAll(
        ".estimate-item-row"
    );

    rows.forEach(row => {

        const quantity = Number(

            row.querySelector(".estimate-item-quantity").value

        ) || 0;

        const rate = Number(

            row.querySelector(".estimate-item-rate").value

        ) || 0;

        subtotal += quantity * rate;

    });

    estimateSubtotal.textContent =

        formatCurrency(subtotal);

    return subtotal;

}

function initializeTotalInputs() {

    estimateTaxInput.addEventListener(
        "input",
        calculateEstimateGrandTotal
    );

    estimateDiscountInput.addEventListener(
        "input",
        calculateEstimateGrandTotal
    );

    estimateShippingInput.addEventListener(
        "input",
        calculateEstimateGrandTotal
    );

}

function showToast(

    message,

    type = "info",

    duration = 3000

){

    console.log(
        `[Toast: ${type}]`,
        message
    );

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

function showEstimateResultModal(
    title,
    message,
    buttonText = "",
    buttonAction = null
){

    document.getElementById(
        "estimateResultTitle"
    ).textContent =
        title;

    document.getElementById(
        "estimateResultMessage"
    ).textContent =
        message;

    const actionButton =
        document.getElementById(
            "estimateResultButton"
        );

    if(buttonText){

        actionButton.textContent =
            buttonText;

        actionButton.style.display =
            "inline-block";

        actionButton.onclick =
            buttonAction || null;

    }else{

        actionButton.style.display =
            "none";

        actionButton.onclick =
            null;

    }

    document.getElementById(
        "estimateResultOverlay"
    ).classList.add("show");

    setTimeout(
        function(){

            document.getElementById(
                "estimateResultOverlay"
            ).classList.remove("show");

        },
        4000
    );

}

function formatCurrency(amount) {

    const value = Number(amount) || 0;

    return `${currencySymbol}${value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

function populateEstimateItems(items) {

    estimateItemsContainer.innerHTML = "";

    estimateItemCount = 0;

    if (!items || items.length === 0) {

        addEstimateItem();

        return;

    }

    items.forEach(item => {

        const row =
            document.createElement("div");

        row.className =
            "estimate-item-row";

        row.innerHTML = `

            <input
                type="text"
                class="estimate-item-name form-control"
                placeholder="Item name"
                value="${item.itemName || ""}">

            <input
                type="number"
                class="estimate-item-quantity form-control"
                value="${item.quantity ?? 1}"
                min="1">

            <input
                type="number"
                class="estimate-item-rate form-control"
                value="${item.rate ?? 0}"
                min="0">

            <input
                type="text"
                class="estimate-item-total form-control"
                value="${formatCurrency(item.total || 0)}"
                readonly>

            <button
                type="button"
                class="remove-estimate-item">

                Remove

            </button>

        `;

        estimateItemsContainer.appendChild(row);

        estimateItemCount++;

        attachEstimateItemEvents(row);

        updateEstimateRowTotal(row);

    });

}

function displayEstimatePaymentMethod(paymentDetails) {

    const paymentStatus =
        document.getElementById(
            "estimatePaymentMethodStatus"
        );

    if (!paymentStatus) {
        return;
    }

    const details =
        paymentDetails &&
        typeof paymentDetails === "object" &&
        !Array.isArray(paymentDetails)
            ? paymentDetails
            : {};

    const hasPaymentDetails =
        Boolean(
            details.paymentMethod ||
            details.paymentProvider ||
            details.bankName ||
            details.accountName ||
            details.accountNumber ||
            details.routingNumber ||
            details.swiftCode ||
            details.paymentLink ||
            details.paymentAccount ||
            details.paymentTerms ||
            details.paymentDueDays ||
            details.paymentInstructions
        );

    if (!hasPaymentDetails) {

        paymentStatus.innerHTML = `

            <span
            id="estimatePaymentMethodText">

                Payment method not set.

            </span>

            <button
            type="button"
            class="secondary-button"
            id="setPaymentMethodButton">

                Set Payment Method

            </button>

        `;

        return;

    }

    let html = "";

    if (details.paymentMethod) {

        html += `
            <div class="estimate-payment-method-details">

                <strong>
                    ${details.paymentMethod}
                </strong>

        `;

    } else {

        html += `
            <div class="estimate-payment-method-details">
        `;

    }

    if (details.paymentProvider) {

        html += `
            <div>
                <strong>Provider:</strong> ${details.paymentProvider}
            </div>
        `;

    }

    if (details.bankName) {

        html += `
            <div>
               <strong> Bank Name:</strong> ${details.bankName}
            </div>
        `;

    }

    if (details.accountName) {

        html += `
            <div>
                <strong>Account Name:</strong> ${details.accountName}
            </div>
        `;

    }

    if (details.accountNumber) {

        html += `
            <div>
                <strong>Account Number:</strong> ${details.accountNumber}
            </div>
        `;

    }

    if (details.routingNumber) {

        html += `
            <div>
                <strong>Routing Number</strong>: ${details.routingNumber}
            </div>
        `;

    }

    if (details.swiftCode) {

        html += `
            <div>
               <strong> SWIFT Code:</strong> ${details.swiftCode}
            </div>
        `;

    }

    if (details.paymentLink) {

        html += `
            <div>
              <strong>  Payment Link:</strong> ${details.paymentLink}
            </div>
        `;

    }

    if (details.paymentAccount) {

        html += `
            <div>
               <strong> Payment Account:</strong> ${details.paymentAccount}
            </div>
        `;

    }

    if (details.paymentTerms) {

        html += `
            <div>
                <strong>Payment Terms:</strong> ${details.paymentTerms}
            </div>
        `;

    }

    if (details.paymentDueDays) {

        html += `
            <div>
             <strong>  Payment Due Days: </strong>${details.paymentDueDays}
            </div>
        `;

    }

    if (details.paymentInstructions) {

        html += `
            <div>
               <strong> Payment Instructions:</strong> ${details.paymentInstructions}
            </div>
        `;

    }

    html += `
            </div>
        `;

    paymentStatus.innerHTML = html;

}

function loadEstimateCurrencies() {

    const currencyInput =
        document.getElementById(
            "estimateCurrencyInput"
        );

    if (!currencyInput) {
        return;
    }

    currencyInput.innerHTML = `
        <option value="">
            Select currency
        </option>
    `;

    if (
        typeof currencyMap === "undefined" ||
        !currencyMap
    ) {
        return;
    }

    Object.entries(currencyMap)
    .sort(
        ([codeA], [codeB]) =>
            codeA.localeCompare(codeB)
    )
    .forEach(
        ([code, currency]) => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                code;

            option.textContent =
                `${code} ${currency.symbol}`;

            option.dataset.symbol =
                currency.symbol;

            currencyInput.appendChild(
                option
            );

        }
    );

}

function canExportEstimatePdf() {

    const exportUsage =
        currentSubscriptionSettings?.usage?.exports;

    if (!exportUsage) {

        showToast(
            "Unable to verify your PDF export limit.",
            "error"
        );

        return false;
    }

    const maximum =
        exportUsage.maximum;

    if (
        maximum === undefined ||
        maximum === null
    ) {

        showToast(
            "PDF exports are not available on your current plan.",
            "error"
        );

        return false;
    }

    if (maximum !== -1) {

        const remaining =
            Number(exportUsage.remaining);

        if (
            Number.isNaN(remaining) ||
            remaining <= 0
        ) {

            showToast(
                "You have reached the PDF export limit for your current plan.",
                "error"
            );

            return false;
        }

    }

    return true;
}

function setDefaultEstimateCurrency() {

    const currencyInput =
        document.getElementById(
            "estimateCurrencyInput"
        );

    if (!currencyInput) {
        return;
    }

    const currentUser = Parse.User.current();

    if (!currentUser) {
        return;
    }

    const currencyCode =
        currentUser.get(
            "currencyCode"
        ) || "";

    if (!currencyCode) {
        return;
    }

    const option =
        currencyInput.querySelector(
            `option[value="${currencyCode}"]`
        );

    if (option) {

        currencyInput.value =
            currencyCode;

    }

}

function updateEstimateExportButtonState() {

    const button =
    exportEstimatesPdfButton;
    
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
            "Export PDF";

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
        `Export PDF (${remaining} left)`;

    button.title =
        `${remaining} PDF exports remaining`;
}

function addEstimateCanvasToPdf(
    pdf,
    canvas
) {
    
    const pageWidth =
        pdf.internal.pageSize.getWidth();
    
    const pageHeight =
        pdf.internal.pageSize.getHeight();
    
    const imageWidth =
        pageWidth;
    
    const pixelsPerPdfPage =
        Math.floor(
            canvas.width *
            pageHeight /
            pageWidth
        );
    
    let offsetY = 0;
    
    let pageNumber = 0;
    
    while (
        offsetY < canvas.height
    ) {
        
        const sliceHeight =
            Math.min(
                pixelsPerPdfPage,
                canvas.height - offsetY
            );
        
        const pageCanvas =
            document.createElement(
                "canvas"
            );
        
        pageCanvas.width =
            canvas.width;
        
        pageCanvas.height =
            sliceHeight;
        
        const context =
            pageCanvas.getContext(
                "2d"
            );
        
        context.fillStyle =
            "#ffffff";
        
        context.fillRect(
            0,
            0,
            pageCanvas.width,
            pageCanvas.height
        );
        
        context.drawImage(
            canvas,
            0,
            offsetY,
            canvas.width,
            sliceHeight,
            0,
            0,
            canvas.width,
            sliceHeight
        );
        
        if (
            pageNumber > 0
        ) {
            
            pdf.addPage();
            
        }
        
        const imageHeight =
            sliceHeight *
            imageWidth /
            canvas.width;
        
        pdf.addImage(
            pageCanvas.toDataURL(
                "image/jpeg",
                0.98
            ),
            "JPEG",
            0,
            0,
            imageWidth,
            imageHeight,
            undefined,
            "FAST"
        );
        
        offsetY +=
            sliceHeight;
        
        pageNumber++;
        
    }
    
}

function getEstimateClientDisplayName(
    client
) {

    return (
        client.contactPerson ||
        client.companyName ||
        client.clientEmail ||
        "Unnamed Client"
    );

}

function getEstimateClientInitials(
    name
) {

    const parts =
        String(name || "")
            .trim()
            .split(/\s+/)
            .filter(Boolean);

    if (!parts.length) {
        return "C";
    }

    if (parts.length === 1) {

        return parts[0]
            .substring(0, 2)
            .toUpperCase();

    }

    return (
        parts[0][0] +
        parts[1][0]
    ).toUpperCase();

}

function renderEstimateClientOptions(
    clients
) {

    if (!clients.length) {

        estimateClientPickerOptions.innerHTML = `
            <div class="client-picker-empty">
                No clients found.
            </div>
        `;

        return;

    }

    estimateClientPickerOptions.innerHTML =
        "";

    clients.forEach(
        client => {

            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            button.className =
                "client-picker-option";

            if (
                estimateClientInput.value ===
                client.objectId
            ) {

                button.classList.add(
                    "selected"
                );

            }

            const name =
                getEstimateClientDisplayName(
                    client
                );

            const company =
                client.companyName ||
                "";

            const email =
                client.clientEmail ||
                "";

            const imageUrl =
                client.clientImageUrl ||
                "";

            const avatar =
                document.createElement(
                    "div"
                );

            avatar.className =
                "client-picker-option-avatar";

            if (imageUrl) {

                const image =
                    document.createElement(
                        "img"
                    );

                image.src =
                    imageUrl;

                image.alt =
                    name;

                image.onerror =
                    () => {

                        image.remove();

                        avatar.textContent =
                            getEstimateClientInitials(
                                name
                            );

                    };

                avatar.appendChild(
                    image
                );

            }
            else {

                avatar.textContent =
                    getEstimateClientInitials(
                        name
                    );

            }

            const info =
                document.createElement(
                    "div"
                );

            info.className =
                "client-picker-option-info";

            const nameElement =
                document.createElement(
                    "div"
                );

            nameElement.className =
                "client-picker-option-name";

            nameElement.textContent =
                name;

            info.appendChild(
                nameElement
            );

            if (company) {

                const companyElement =
                    document.createElement(
                        "div"
                    );

                companyElement.className =
                    "client-picker-option-company";

                companyElement.textContent =
                    company;

                info.appendChild(
                    companyElement
                );

            }

            if (email) {

                const emailElement =
                    document.createElement(
                        "div"
                    );

                emailElement.className =
                    "client-picker-option-email";

                emailElement.textContent =
                    email;

                info.appendChild(
                    emailElement
                );

            }

            button.appendChild(
                avatar
            );

            button.appendChild(
                info
            );

            button.addEventListener(
                "click",
                () => {

                    selectEstimateClientObject(
                        client
                    );

                }
            );

            estimateClientPickerOptions.appendChild(
                button
            );

        }
    );

}

function selectEstimateClientObject(
    client
) {

    if (!client) {

        clearEstimateClientPicker();

        return;

    }

    estimateClientInput.value =
        client.objectId || "";

    selectedEstimateClient =
        client;

    estimateClientPickerSelected.textContent =
        getEstimateClientDisplayName(
            client
        );

    setEstimatePreviewClients([
        client
    ]);

    updateEstimateClientPreview();

    closeEstimateClientPicker();

}

function clearEstimateClientPicker() {

    estimateClientInput.value =
        "";

    selectedEstimateClient =
        null;

    estimateClientPickerSelected.textContent =
        "Select Client";

    setEstimatePreviewClients([]);

    clearEstimateClientPreview();

}

function closeEstimateClientPicker() {

    estimateClientPicker.classList.remove(
        "open"
    );

}

function toggleEstimateClientPicker() {

    const isOpen =
        estimateClientPicker.classList.contains(
            "open"
        );

    if (isOpen) {

        closeEstimateClientPicker();

        return;

    }

    estimateClientPicker.classList.add(
        "open"
    );

    estimateClientPickerSearch.focus();

    loadEstimateClients(
        estimateClientPickerSearch.value
    );

}

let estimateClientSearchTimer =
    null;

function initializeEstimateClientPicker() {

    estimateClientPickerTrigger.addEventListener(
        "click",
        toggleEstimateClientPicker
    );

    estimateClientPickerSearch.addEventListener(
        "input",
        () => {

            clearTimeout(
                estimateClientSearchTimer
            );

            estimateClientSearchTimer =
                setTimeout(
                    () => {

                        loadEstimateClients(
                            estimateClientPickerSearch.value
                        );

                    },
                    300
                );

        }
    );

    document.addEventListener(
        "click",
        event => {

            if (
                estimateClientPicker.contains(
                    event.target
                )
            ) {

                return;

            }

            closeEstimateClientPicker();

        }
    );

}

async function openDeleteEstimateModal(estimateId){

    deletingEstimateId =
    estimateId;

    deleteEstimateOverlay
    .classList.add(
        "show"
    );

    deleteEstimateModal
    .classList.add(
        "show"
    );

}

async function editEstimate(estimateId) {
    
    document.getElementById("createEstimateTitle").textContent =
    "Edit Estimate";
    
    saveEstimateButton.textContent =
    "Update Estimate";
    
    document.getElementById("createEstimateSubtitle").textContent =
    "Make Edits to your estimate for better preview.";

    try {

        const result =
            await loadEstimateDetails(
                estimateId
            );

        if (!result) {
            return;
        }

        editingEstimate = true;

        editingEstimateId =
            estimateId;

        loadEstimateCurrencies();

await loadEstimatePaymentMethod();

await loadEstimateClients();

populateEstimateForm(result);

        createEstimateModal.classList.add(
            "show"
        );

        createEstimateOverlay.classList.add(
            "show"
        );

        document.body.style.overflow =
            "hidden";

    }

    catch (error) {

        console.error(
            "Edit Estimate Error:",
            error
        );

        showToast(
            error.message ||
            "Unable to load estimate.",
            "error"
        );

    }

}

async function loadEstimateDetails(estimateId){

    try{

        const result =
        await Parse.Cloud.run(
            "getEstimateDetails",
            {
                estimateId
            }
        );

        selectedEstimate =
            result.estimate;

        selectedEstimateClient =
    result.client;

console.log(
    "REFRESHED ESTIMATE CLIENT:",
    JSON.stringify(result.client, null, 2)
);

        selectedEstimateCompany =
            result.company;

        selectedEstimateItems =
            result.items;
            
        selectedEstimate.paymentDetails =
            result.paymentDetails || {};


        return result;

    }

    catch(error){

        console.error(error);

        showToast(
            error.message,
            "error"
        );

        return null;

    }

}

async function previewEstimate(estimateId) {

    try {

        const result =
            await loadEstimateDetails(
                estimateId
            );

        if (!result) {

            return;

        }


        // Make sure business profile/template
        // information exists.

        if (
            !estimatePreviewState.initialized
        ) {

            await initializeEstimatePreview();

        }


        // Populate the actual preview panel.

        populateEstimatePreview();


        // Open it.

        openEstimatePreview();

    }

    catch (error) {

        console.error(
            "Preview Estimate Error:",
            error
        );

        showToast(
            error.message ||
            "Unable to open estimate preview.",
            "error"
        );

    }

}

async function saveEstimate(status){

    const clientId =
    document.getElementById(
        "estimateClientInput"
    ).value;

    const estimateNumber =
    document.getElementById(
        "estimateNumberInput"
    ).value.trim();

    const estimateTitle =
    document.getElementById(
        "estimateTitleInput"
    ).value.trim();

    const projectName =
    document.getElementById(
        "projectNameInput"
    ).value.trim();

    const referenceNumber =
    document.getElementById(
        "referenceNumberInput"
    ).value.trim();

    const purchaseOrder =
    document.getElementById(
        "purchaseOrderInput"
    ).value.trim();

    const issueDate =
    document.getElementById(
        "estimateIssueDateInput"
    ).value;

    const expiryDate =
    document.getElementById(
        "estimateExpiryDateInput"
    ).value;

    const taxPercent =
    Number(
        document.getElementById(
            "estimateTaxInput"
        ).value
    ) || 0;

    const discount =
    Number(
        document.getElementById(
            "estimateDiscountInput"
        ).value
    ) || 0;

    const shipping =
    Number(
        document.getElementById(
            "estimateShippingInput"
        ).value
    ) || 0;

    const customerNotes =
    document.getElementById(
        "customerNotesInput"
    ).value.trim();

    const terms =
    document.getElementById(
        "estimateTermsInput"
    ).value.trim();

    const validityMessage =
    document.getElementById(
        "validityMessageInput"
    ).value.trim();

    const signatureName =
    document.getElementById(
        "signatureNameInput"
    ).value.trim();

    const signatureTitle =
    document.getElementById(
        "signatureTitleInput"
    ).value.trim();

    const signatureImageInput =
    document.getElementById(
        "signatureImageInput"
    );

    const subtotal =
    calculateEstimateSubtotal();

    const taxAmount =
    subtotal * (taxPercent / 100);
    
    const estimateCurrencyInput =
    document.getElementById(
        "estimateCurrencyInput"
    );

const currencyCode =
    estimateCurrencyInput?.value || "";

const currencySymbol =
    estimateCurrencyInput
    ?.selectedOptions[0]
    ?.dataset.symbol || "";

    const grandTotal =
    subtotal +
    taxAmount +
    shipping -
    discount;

    const items = [];

    estimateItemsContainer
    .querySelectorAll(
        ".estimate-item-row"
    )
    .forEach(row => {

        const itemName =
        row.querySelector(
            ".estimate-item-name"
        ).value.trim();

        const quantity =
        Number(
            row.querySelector(
                ".estimate-item-quantity"
            ).value
        ) || 0;

        const rate =
        Number(
            row.querySelector(
                ".estimate-item-rate"
            ).value
        ) || 0;

        items.push({

            itemName,

            quantity,

            rate,

            total:
            quantity * rate

        });

    });

    if(!clientId){

        showToast(
            "Please select a client.",
            "info"
        );

        return;

    }

    if(!issueDate){

        showToast(
            "Issue date is required.",
            "warning"
        );

        return;

    }

    if(!expiryDate){

        showToast(
            "Expiry date is required.",
            "warning"
        );

        return;

    }

    if(items.length === 0){

        showToast(
            "Please add at least one item.",
            "info"
        );

        return;

    }

    if(grandTotal <= 0){

        showToast(
            "Estimate total must be greater than zero.",
            "warning"
        );

        return;

    }
    
    if (!currencyCode) {

    showToast(
        "Please select the estimate currency.",
        "warning"
    );

    return;

}

    try{

        if (editingEstimate) {

    saveEstimateButton.textContent =
        "Updating...";

} else {

    saveEstimateButton.textContent =
        "Saving...";

}

        let signatureImage;

        if(
            signatureImageInput &&
            signatureImageInput.files &&
            signatureImageInput.files.length > 0
        ){

            const file =
            signatureImageInput.files[0];

            const parseFile =
            new Parse.File(
                file.name,
                file
            );

            await parseFile.save();

            signatureImage =
            parseFile;

        }

        const estimateData = {

            clientId,

            issueDate,

            expiryDate,

            estimateTitle,

            projectName,

            referenceNumber,

            purchaseOrder,

            subtotal,

            taxPercent,

            taxAmount,

            discount,

            shipping,

            grandTotal,

            notes:
                customerNotes,

            customerNotes,

            terms,

            validityMessage,

            signatureName,

            signatureTitle,

            signatureImage,

            paymentDetails: {
                ...savedPaymentDetails
            },

            status,
            
            currencyCode,
            
            currencySymbol,

            items

        };

        if(editingEstimate){

            estimateData.estimateId =
            editingEstimateId;

        }else{

            estimateData.estimateNumber =
            estimateNumber;

        }

        let result;

        if(editingEstimate){

            result =
            await Parse.Cloud.run(
                "updateEstimate",
                estimateData
            );

        }else{

            result =
            await Parse.Cloud.run(
                "createEstimate",
                estimateData
            );

        }
        
        if (editingEstimate) {

    saveEstimateButton.textContent =
        "Update Estimate";

} else {

    saveEstimateButton.textContent =
        "Save Estimate";

}

        showEstimateResultModal(
    editingEstimate
        ? "Estimate Updated"
        : "Estimate Created",
    result.message ||
        (
            editingEstimate
                ? "Your estimate has been successfully updated."
                : "Your estimate has been successfully created."
        ),
    "Close",
    
);

        closeCreateEstimateModal();

        resetEstimateForm();

        editingEstimate = false;

        editingEstimateId = null;

        await loadEstimateStatistics();

        await loadEstimates();

    }

    catch(error){

    console.error(error);

    showEstimateResultModal(
        editingEstimate
            ? "Estimate Update Failed"
            : "Estimate Creation Failed",
        error.message ||
            "Unable to save estimate."

        
    );

}

    finally{

    saveEstimateButton.disabled = false;

    saveEstimateButton.textContent =
        editingEstimate
            ? "Update Estimate"
            : "Create Estimate";

    saveEstimateDraftButton.disabled = false;

}

}

async function loadEstimateStatistics(){
    
    totalEstimatesValue.textContent = "...";
pendingEstimatesValue.textContent = "...";
approvedEstimatesValue.textContent = "...";
estimatedValueValue.textContent = "...";

    try{

        const result =
        await Parse.Cloud.run(
            "getEstimateStatistics"
        );

        totalEstimatesValue.textContent =
        result.totalEstimates;

        pendingEstimatesValue.textContent =
        result.pendingEstimates;

        approvedEstimatesValue.textContent =
        result.approvedEstimates;
        
        
        estimatedValueValue.textContent =
        currencySymbol + Number(  result.estimatedValue || 0).toLocaleString(
    undefined,
    {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }
);
}

    catch(error){

        console.error(error);

        showToast(error.message, "error");

    }

}

async function confirmDeleteEstimate(){
    
    if(!deletingEstimateId){

    deleteEstimateButton.disabled = false;

    return;

}

  

    try{

        deleteEstimateButton.disabled = true;

        const result =
        await Parse.Cloud.run(

            "deleteEstimate",

            {

                estimateId:
                deletingEstimateId

            }

        );

        showToast(
            result.message, "info"
        );

        closeDeleteEstimateModal();

        if(

            selectedEstimate &&

            selectedEstimate.objectId ===
            deletingEstimateId

        ){

            selectedEstimate = null;

            selectedEstimateItems = [];

            closeEstimatePreview();

        }

        deletingEstimateId = null;

        await loadEstimateStatistics();

        await loadEstimates();

    }

    catch(error){

        console.error(error);

        showEstimateResultModal(
    "Delete Failed",
    error.message ||
        "Unable to delete this estimate."
        

    
);

    }

    finally{

        deleteEstimateButton.disabled = false;

    }

}

async function loadNotificationCount() {

    try {

        const result =
        await Parse.Cloud.run(
            "getNotificationCount"
        );

        if (result.unreadCount > 0) {

            notificationBadge.style.display =
                "flex";

            notificationBadge.textContent =
                result.unreadCount;

        }

        else {

            notificationBadge.style.display =
                "none";

        }

    }

    catch (error) {

        console.error(
            "Notification Error:",
            error
        );

    }

}

async function openCreateEstimateModal() {
    
    
    resetEstimateForm();
    
    document.getElementById("createEstimateTitle").textContent =
    "Create Estimate";
    
    saveEstimateButton.textContent =
    "Create Estimate";
    
    document.getElementById("createEstimateSubtitle").textContent =
    "Create a professional estimate for your client.";


    loadEstimateCurrencies();
    
    await loadEstimatePaymentMethod();

    await loadEstimateClients();

    await loadNextEstimateNumber();

    createEstimateModal.classList.add("show");

    createEstimateOverlay.classList.add("show");

    document.body.style.overflow = "hidden";

}

async function loadEstimateClients(
    search = ""
) {

    try {

        estimateClientPickerOptions.innerHTML = `
            <div class="client-picker-loading">
                Loading clients...
            </div>
        `;

        const result =
            await Parse.Cloud.run(
                "getClients",
                {
                    search:
                        search.trim(),

                    status:
                        "active",

                    sort:
                        "name",

                    page:
                        1,

                    limit:
                        100
                }
            );

        const clients =
            Array.isArray(
                result?.clients
            )
            ? result.clients
            : [];

        setEstimatePreviewClients(
            clients
        );

        renderEstimateClientOptions(
            clients
        );

    }
    catch (error) {

        console.error(
            "Estimate Client Load Error:",
            error
        );

        estimateClientPickerOptions.innerHTML = `
            <div class="client-picker-error">
                Unable to load clients.
            </div>
        `;

        showToast(
            error.message ||
            "Unable to load clients.",
            "error"
        );

    }

}

async function loadNextEstimateNumber() {

    try {

        const result =
        await Parse.Cloud.run(
            "getNextEstimateNumber"
        );

        estimateNumberInput.value =
            result.estimateNumber || "";

    }

    catch (error) {

        console.error(error);

        showToast(
            error.message ||
            "Unable to generate estimate number.",
            "error"
        );

    }

}

async function convertEstimateToInvoice(estimateId) {

    if (!estimateId) {

        showEstimateResultModal(
    "Conversion Failed",
    "The estimate ID is missing. Please close this window and try again."
);

        return;

    }

    try {

        const result =
            await Parse.Cloud.run(
                "convertEstimateToInvoice",
                {
                    estimateId: estimateId
                }
            );

        if (!result || !result.success) {

            throw new Error(
                result?.message ||
                "Unable to convert estimate."
            );

        }

        showEstimateResultModal(
    "Invoice Created",
    result.message ||
        "Your estimate has been successfully converted into an invoice."
);

        await Promise.all([

            loadEstimates(),

            loadEstimateStatistics()

        ]);



        // window.location.href =
        //     `invoices.html?id=${encodeURIComponent(result.invoiceId)}`;

    }

    catch (error) {

        console.error(
            "Convert Estimate Error:",
            error
        );

        showEstimateResultModal(
    "Invoice Conversion Failed",
    error.message ||
        "Unable to convert this estimate into an invoice."
);

    }

}

async function approveEstimate(estimateId){

    if(!estimateId){

        
        showEstimateResultModal(
    "Approval Failed",
    "The estimate ID is missing. Please close this window and try again."
);

        return;
    }

    console.log(
        "APPROVE ESTIMATE: sending",
        {
            estimateId
        }
    );

    try{

        if(approveEstimateButton){

            approveEstimateButton.disabled = true;

            approveEstimateButton.textContent =
                "Approving...";
        }

        const result =
            await Parse.Cloud.run(
                "approveEstimate",
                {
                    estimateId
                }
            );

        console.log(
            "APPROVE ESTIMATE: result",
            result
        );

        if(!result || !result.success){

            throw new Error(
                result?.message ||
                "Unable to approve estimate."
            );
        }

       showEstimateResultModal(
    "Estimate Approved",
    result.message ||
        "Your estimate has been approved successfully."
);

        await loadEstimateDetails(
            estimateId
        );

        await Promise.all([
            loadEstimateStatistics(),
            loadEstimates()
        ]);

        populateEstimatePreview();

    }
    catch(error){

        console.error(
            "Approve Estimate Error:",
            error
        );

       showEstimateResultModal(
    "Approval Failed",
    error.message ||
        "Unable to approve this estimate."
);

    }
    finally{

        if(approveEstimateButton){

            approveEstimateButton.disabled = false;

            approveEstimateButton.textContent =
                "Approve";
        }
    }
}

async function loadEstimates() {

    try {

        const result = await Parse.Cloud.run(

            "getEstimates",

            {

                page: currentPage,

                limit: pageLimit,

                search:
                estimateSearchInput.value.trim(),

                status:
                estimateStatusFilter.value,

                sort:
                sortEstimates.value

            }

        );

        estimates =
        result.estimates || [];

        totalPages =
        result.totalPages || 1;

        totalRecords =
        result.totalRecords || 0;

        renderEstimatesTable();

        updateTableFooter();
        
        updatePagination();

    }

    catch (error) {

        console.error(error);

        showToast(

            error.message ||

            "Failed to load estimates.",

            "error"

        );

    }

}

async function loadExportEstimates(){

    exportEstimateSelect.innerHTML = `
        <option value="">
            Select Estimate
        </option>
    `;

    console.log(
        "EXPORT: loading estimates"
    );

    try{

        const result =
            await Parse.Cloud.run(
                "getEstimates",
                {
                    page: 1,
                    limit: 100000,
                    search: "",
                    status: "",
                    sort: "newest"
                }
            );

        console.log(
            "EXPORT: getEstimates result:",
            result
        );

        const exportEstimates =
            result.estimates || [];

        console.log(
            "EXPORT: estimates received:",
            exportEstimates.length
        );

        exportEstimates.forEach(
            estimate => {

                console.log(
                    "EXPORT: adding estimate:",
                    estimate
                );

                const option =
                    document.createElement("option");

                option.value =
                    estimate.objectId;

                option.textContent =
                    `${estimate.estimateNumber} — ${estimate.clientName}`;

                exportEstimateSelect.appendChild(
                    option
                );

            }
        );

        console.log(
            "EXPORT: selector options:",
            exportEstimateSelect.options.length
        );

    }
    catch(error){

        console.error(
            "LOAD EXPORT ESTIMATES ERROR:",
            error
        );

        showToast(
            error.message ||
            "Failed to load estimates.",
            "error"
        );

    }

}

async function exportEstimatesPdf(estimateId) {
    
    if (!currentSubscriptionSettings) {

        await loadEstimateSubscriptionSettings();

    }

    if (!canExportEstimatePdf()) {

        return;

    }

    if (!estimateId) {

        showToast(
            "No estimate was selected.",
            "warning"
        );

        return;

    }

    let exportStarted = false;

    try {

        const paper =
            getEstimatePreviewElement();

        if (!paper) {

            showToast(
                "Estimate preview could not be found.",
                "error"
            );

            return;

        }

        const result =
            await loadEstimateDetails(
                estimateId
            );

        if (!result || !selectedEstimate) {

            showToast(
                "Could not load the selected estimate.",
                "error"
            );

            return;

        }

        if (
            !estimatePreviewState.initialized
        ) {

            await initializeEstimatePreview();

        }

        populateEstimatePreview();

        paper.classList.add(
            "estimate-export-mode"
        );

        exportStarted = true;

        if (document.fonts) {

            await document.fonts.ready;

        }

        const images =
            paper.querySelectorAll("img");

        await Promise.all(
            Array.from(images).map(
                image => {

                    if (
                        image.complete &&
                        image.naturalWidth > 0
                    ) {

                        return Promise.resolve();

                    }

                    return new Promise(
                        resolve => {

                            image.onload =
                                resolve;

                            image.onerror =
                                resolve;

                        }
                    );

                }
            )
        );

        await new Promise(resolve => {

            requestAnimationFrame(() => {

                requestAnimationFrame(resolve);

            });

        });

        const fileName =
            `${selectedEstimate.estimateNumber || "estimate"}.pdf`;

        const options = {

            margin: 0,

            filename: fileName,

            image: {
                type: "jpeg",
                quality: 1
            },

            html2canvas: {

                scale: 2,

                useCORS: true,

                allowTaint: false,

                backgroundColor: "#ffffff",

                logging: false,

                scrollX: 0,

                scrollY: 0,

                windowWidth:
                    paper.scrollWidth,

                windowHeight:
                    paper.scrollHeight

            },

            jsPDF: {

                unit: "mm",

                format: "a4",

                orientation: "portrait",

                compress: true

            },

            pagebreak: {

                mode: [
                    "css",
                    "legacy"
                ]

            }

        };

        await html2pdf()
            .set(options)
            .from(paper)
            .save();
            
        const exportResult =
    await Parse.Cloud.run(
        "recordPdfExport"
    );

if (!exportResult?.success) {

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

    updateEstimateExportButtonState();

}

        if (exportMenu) {

            exportMenu.classList.remove(
                "show"
            );

        }

        showToast(
            "Estimate PDF exported successfully.",
            "success"
        );

    }

    catch (error) {

        console.error(
            "Estimate PDF Export Error:",
            error
        );

        showToast(
            error.message ||
            "Unable to export estimate PDF.",
            "error"
        );

    }

    finally {

        if (exportStarted) {

            restoreEstimatePreviewAfterExport();

        }

    }

}

async function loadEstimatePaymentMethod() {

    try {

        const response =
            await Parse.Cloud.run(
                "getUserProfile"
            );

        if (
            !response ||
            !response.success ||
            !response.profile
        ) {

            savedPaymentDetails = {};

            displayEstimatePaymentMethod({});

            return;

        }

        const paymentDetails =
            response.profile.paymentDetails || {};

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

        displayEstimatePaymentMethod(
            savedPaymentDetails
        );

    }

    catch (error) {

        console.error(
            "Unable to load payment method:",
            error
        );

        savedPaymentDetails = {};

        displayEstimatePaymentMethod({});

    }

}

async function loadEstimateSubscriptionSettings() {

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

        updateEstimateExportButtonState();

        return result;

    } catch (error) {

        console.error(
            "Estimate subscription loading failed:",
            error
        );

        showToast(
            getErrorMessage(
                error,
                "Unable to load subscription information."
            ),
            "error"
        );

        return null;
    }
}

async function loadBusinessProfileSettings() {

    try {

        const result =
            await Parse.Cloud.run(
                "getBusinessProfile"
            );

        showClientImage =
            result &&
            result.profile &&
            result.profile.showClientImage !== false;

    }

    catch (error) {

        console.error(
            "Business Profile Settings Error:",
            error
        );

        showClientImage = true;

    }

}

async function initializeEstimatePreview() {

    try {


        await loadEstimatePreviewProfile();

        await loadEstimatePreviewTemplate();

        initializeEstimatePreviewDefaults();
        
        updateEstimateBusinessPreview();

        registerEstimatePreviewListeners();
        
        applyEstimateTemplate();

        estimatePreviewState.initialized = true;

    }

    catch (error) {

        console.error(error);

        showToast(
            error.message || error,
            "error"
        );

    }

}

async function loadEstimatePreviewProfile() {

    const response =
    await Parse.Cloud.run(
        "getUserProfile"
    );

    if (!response.success) {

        throw "Unable to load profile.";

    }

    const profile =
    response.profile;

    estimatePreviewState.userProfile =
    profile;

    estimatePreviewState.currencyCode =
    profile.currencyCode || "USD";

    estimatePreviewState.currencySymbol =
    profile.currencySymbol || "$";

    estimatePreviewState.logoUrl =
    profile.businessLogo
    ? profile.businessLogo
    : "";

    estimatePreviewState.primaryColor =
    profile.primaryColor || "#2563EB";

    estimatePreviewState.secondaryColor =
    profile.secondaryColor || "#FFFFFF";

}

async function loadEstimatePreviewTemplate() {

    const response =
    await Parse.Cloud.run(
        "getEstimateTemplate"
    );

    if (
        response.success &&
        response.exists
    ) {

        estimatePreviewState.template =
        response.settings || {};

    }

    else {

        estimatePreviewState.template = {};

    }

}

async function saveEstimateTemplate(section = "general") {

    if (estimateTemplateSaving) {

        return;

    }

    estimateTemplateSaving = true;

    try {

        await Parse.Cloud.run(

            "saveEstimateTemplate",

            {

                templateName: "Default",

                section,

                settings:
                estimatePreviewState.template

            }

        );

    }

    catch (error) {

        console.error(error);

        showToast(

            error.message || error,

            "error"

        );

    }

    finally {

        estimateTemplateSaving = false;

    }

}

async function exportAllEstimatesAsPdf() {

    if (!currentSubscriptionSettings) {

        await loadEstimateSubscriptionSettings();

    }

    if (!canExportEstimatePdf()) {

        return;

    }

    if (
        typeof html2canvas === "undefined"
    ) {

        showToast(
            "PDF rendering library is not loaded.",
            "error"
        );

        return;

    }

    if (
        typeof window.jspdf === "undefined" ||
        !window.jspdf.jsPDF
    ) {

        showToast(
            "PDF library is not loaded.",
            "error"
        );

        return;

    }

    let exportStarted = false;

    try {

        const firstPage =
            await Parse.Cloud.run(
                "getEstimates",
                {
                    page: 1,
                    limit: 100,
                    search: "",
                    status: "",
                    sort: "newest"
                }
            );

        const allEstimates =
            Array.isArray(firstPage?.estimates)
            ? [...firstPage.estimates]
            : [];

        const totalRecords =
            Number(
                firstPage?.totalRecords
            ) || allEstimates.length;

        const totalPages =
            Math.ceil(
                totalRecords / 100
            );

        for (
            let page = 2;
            page <= totalPages;
            page++
        ) {

            const pageResult =
                await Parse.Cloud.run(
                    "getEstimates",
                    {
                        page,
                        limit: 100,
                        search: "",
                        status: "",
                        sort: "newest"
                    }
                );

            if (
                Array.isArray(
                    pageResult?.estimates
                )
            ) {

                allEstimates.push(
                    ...pageResult.estimates
                );

            }

        }

        if (!allEstimates.length) {

            showToast(
                "There are no estimates to export.",
                "info"
            );

            return;

        }

        const paper =
            getEstimatePreviewElement();

        if (!paper) {

            throw new Error(
                "Estimate preview could not be found."
            );

        }

        if (
            !estimatePreviewState.initialized
        ) {

            await initializeEstimatePreview();

        }

        const {
            jsPDF
        } = window.jspdf;

        const pdf =
            new jsPDF(
                {
                    orientation: "portrait",
                    unit: "mm",
                    format: "a4",
                    compress: true
                }
            );

        let exportedCount = 0;

        for (
            const estimate of allEstimates
        ) {

            if (
                !estimate?.objectId
            ) {

                continue;

            }

            const result =
                await loadEstimateDetails(
                    estimate.objectId
                );

            if (
                !result ||
                !selectedEstimate
            ) {

                continue;

            }

            populateEstimatePreview();

            paper.classList.add(
                "estimate-export-mode"
            );

            exportStarted = true;

            if (document.fonts) {

                await document.fonts.ready;

            }

            const images =
                paper.querySelectorAll(
                    "img"
                );

            await Promise.all(
                Array.from(images).map(
                    image => {

                        if (
                            image.complete &&
                            image.naturalWidth > 0
                        ) {

                            return Promise.resolve();

                        }

                        return new Promise(
                            resolve => {

                                image.onload =
                                    resolve;

                                image.onerror =
                                    resolve;

                            }
                        );

                    }
                )
            );

            await new Promise(
                resolve => {

                    requestAnimationFrame(
                        () => {

                            requestAnimationFrame(
                                resolve
                            );

                        }
                    );

                }
            );

            const canvas =
                await html2canvas(
                    paper,
                    {
                        scale: 2,
                        useCORS: true,
                        allowTaint: false,
                        backgroundColor: "#ffffff",
                        logging: false,
                        scrollX: 0,
                        scrollY: 0,
                        windowWidth:
                            paper.scrollWidth,
                        windowHeight:
                            paper.scrollHeight
                    }
                );

            if (
                exportedCount > 0
            ) {

                pdf.addPage();

            }

            addEstimateCanvasToPdf(
                pdf,
                canvas
            );

            exportedCount++;

            paper.classList.remove(
                "estimate-export-mode"
            );

        }

        if (
            !exportedCount
        ) {

            throw new Error(
                "No estimates could be rendered for PDF export."
            );

        }

        pdf.save(
            "estimates.pdf"
        );

        const exportResult =
            await Parse.Cloud.run(
                "recordPdfExport"
            );

        if (
            !exportResult?.success
        ) {

            throw new Error(
                "Unable to record your PDF export."
            );

        }

        if (
            currentSubscriptionSettings?.usage?.exports
        ) {

            currentSubscriptionSettings
                .usage
                .exports
                .used =
                    exportResult.used;

            currentSubscriptionSettings
                .usage
                .exports
                .maximum =
                    exportResult.maximum;

            currentSubscriptionSettings
                .usage
                .exports
                .remaining =
                    exportResult.remaining;

            updateEstimateExportButtonState();

        }

        showToast(
            `${exportedCount} estimates exported as one PDF successfully.`,
            "success"
        );

    }
    catch (error) {

        console.error(
            "Estimate List PDF Export Error:",
            error
        );

        showToast(
            error.message ||
            "Unable to export estimates as PDF.",
            "error"
        );

    }
    finally {

        if (exportStarted) {

            restoreEstimatePreviewAfterExport();

        }

    }

}

async function duplicateEstimate(
    estimateId
) {

    if (!estimateId) {
        return;
    }

    try {

        const subscription =
            await Parse.Cloud.run(
                "getCurrentSubscription"
            );

        const estimateCount =
            subscription.usage.estimates.used;

        const maxEstimates =
            subscription.usage.estimates.maximum;

        if (
            maxEstimates !== -1 &&
            estimateCount >= maxEstimates
        ) {

            throw new Error(
                "You've reached your estimate limit. Upgrade your plan."
            );

        }

        const result =
            await Parse.Cloud.run(
                "duplicateEstimate",
                {
                    estimateId
                }
            );

        if (
            !result ||
            !result.success
        ) {

            throw new Error(
                result?.message ||
                "Unable to duplicate estimate."
            );

        }

        showToast(
            result.message ||
            "Estimate duplicated successfully.",
            "success"
        );

        await Promise.all([
            loadEstimateStatistics(),
            loadEstimates()
        ]);

    }
    catch (error) {

        console.error(
            "Duplicate Estimate Error:",
            error
        );

        showToast(
            error.message ||
            "Unable to duplicate estimate.",
            "error"
        );

    }

}

async function sendEstimateToClient(estimateId) {

    if (!estimateId) {

        showEstimateResultModal(
            "Send Estimate Failed",
            "The estimate ID is missing. Please close this window and try again."
        );

        return;
    }

    try {

        if (sendEstimateButton) {

            sendEstimateButton.disabled = true;

            sendEstimateButton.textContent =
                "Sending...";

        }

        const result =
            await Parse.Cloud.run(
                "sendEstimateToClient",
                {
                    estimateId
                }
            );

        console.log(
            "SEND ESTIMATE: result",
            result
        );

        if (!result || !result.success) {

            throw new Error(
                result?.message ||
                "Unable to send estimate."
            );

        }

        showEstimateResultModal(
            "Estimate Sent",
            result.message ||
            `Estimate sent successfully to ${result.sentTo || "the client"}.`
        );

        await loadEstimateDetails(
            estimateId
        );

        await Promise.all([
            loadEstimateStatistics(),
            loadEstimates()
        ]);

        populateEstimatePreview();

    }
    catch (error) {

        console.error(
            "Send Estimate Error:",
            error
        );

        showEstimateResultModal(
            "Send Estimate Failed",
            error.message ||
            "Unable to send this estimate to the client."
        );

    }
    finally {

        if (sendEstimateButton) {

            sendEstimateButton.disabled = false;

            sendEstimateButton.textContent =
                "Send Estimate";

        }

    }

}

exportEstimatesPdfButton.addEventListener(
    "click",
    async function(event){

        event.stopPropagation();

        await exportAllEstimatesAsPdf();

    }
);

estimatePreviewState.clients = [];

estimatePreviewState.items = [];

deleteEstimateButton.addEventListener(

    "click",

    confirmDeleteEstimate

);

cancelDeleteEstimateButton.addEventListener(

    "click",

    closeDeleteEstimateModal

);

deleteEstimateOverlay.addEventListener(

    "click",

    closeDeleteEstimateModal

);

saveEstimateButton.addEventListener(
    "click",
    function(){

        saveEstimate(
            "Draft"
        );

    }
);

saveEstimateDraftButton.addEventListener(
    "click",
    function(){

        saveEstimate(
            "Draft"
        );

    }
);

closeEstimatePreviewButton.addEventListener(
"click",
closeEstimatePreview
);

convertEstimate.addEventListener(
    "click",
    async function(event){

        event.stopPropagation();

        if(!selectedEstimate){

            return;

        }

        const estimateId =
            selectedEstimate.objectId;

        if(!estimateId){

            return;

        }

        await convertEstimateToInvoice(
            estimateId
        );

    }
);

if(approveEstimateButton){

    approveEstimateButton.addEventListener(
        "click",
        async function(){

            console.log(
                "APPROVE BUTTON CLICKED"
            );

            await approveEstimate(
                selectedEstimate?.objectId
            );

        }
    );

}

if (sendEstimateButton) {

    sendEstimateButton.addEventListener(
        "click",
        async function () {

            console.log(
                "SEND ESTIMATE BUTTON CLICKED"
            );

            await sendEstimateToClient(
                selectedEstimate?.objectId
            );

        }
    );

}

estimatePreviewOverlay.addEventListener(
"click",
closeEstimatePreview
);

sidebarOverlay.addEventListener("click", () => {

    sidebar.classList.remove("active");

    sidebarOverlay.classList.remove("active");

});

previousPageButton.addEventListener("click", () => {

    if (currentPage === 1) return;

    currentPage--;

    loadEstimates();

});

nextPageButton.addEventListener("click", () => {

    if (currentPage >= totalPages) return;

    currentPage++;

    loadEstimates();

});

pageOneButton.addEventListener("click", () => {

    loadEstimates();

});

pageTwoButton.addEventListener("click", () => {

    if (currentPage + 1 <= totalPages) {

        currentPage++;

        loadEstimates();

    }

});

pageThreeButton.addEventListener("click", () => {

    if (currentPage + 2 <= totalPages) {

        currentPage += 2;

        loadEstimates();

    }

});

estimateSearchInput.addEventListener("input", () => {

    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {

        currentPage = 1;

        loadEstimates();

    }, 400);

});

estimateStatusFilter.addEventListener("change", () => {

    currentPage = 1;

    loadEstimates();

});

sortEstimates.addEventListener("change", () => {

    currentPage = 1;

    loadEstimates();

});

createEstimateButton.addEventListener(
    "click",
    openCreateEstimateModal
);

emptyStateCreateEstimateButton.addEventListener(
    "click",
    openCreateEstimateModal
);

closeCreateEstimateButton.addEventListener(
    "click",
    closeCreateEstimateModal
);

cancelEstimateButton.addEventListener(
    "click",
    closeCreateEstimateModal
);

createEstimateOverlay.addEventListener(
    "click",
    closeCreateEstimateModal
);

addEstimateItemButton.addEventListener(
    "click",
    addEstimateItem
); 


printEstimatePdfButton.addEventListener(
    "click",
    async function(event){

        event.stopPropagation();

        if (!canExportEstimatePdf()) {

            return;

        }

        if(!selectedEstimate){

            return;

        }

        const estimateId =
            selectedEstimate.objectId;

        if(!estimateId){

            return;

        }

        await exportEstimatesPdf(
            estimateId
        );

    }
);

estimatesTableBody.addEventListener("click", async function (event) {

    const button = event.target.closest("button");

    if (!button) {

        return;

    }

    const estimateId = button.dataset.id;

    if (!estimateId) {

        return;

    }

    if (button.classList.contains("view-btn")) {

        await previewEstimate(estimateId);

        return;

    }

    if (button.classList.contains("edit-btn")) {

        await editEstimate(estimateId);

        return;

    }
    
    if (button.classList.contains("duplicate-btn")) {

    await duplicateEstimate(
        estimateId
    );

    return;

}

    if (button.classList.contains("delete-btn")) {

        await openDeleteEstimateModal(estimateId);

        return;

    }

    if (button.classList.contains("convert-btn")) {


    const estimate =
        estimates.find(
            item => item.objectId === estimateId
        );

    if (
        estimate &&
        estimate.status === "Converted"
    ) {

     showEstimateResultModal(
    "Already Converted",
    "This estimate has already been converted to an invoice."
);

        return;

    }

    await convertEstimateToInvoice(
        estimateId
    );

    return;

}
});

document.addEventListener(
    "click",
    function(event) {
        
        if (
            event.target.closest(
                "#setPaymentMethodButton"
            )
        ) {
            
            window.location.href =
                "profile.html?returnTo=estimate";
            
        }
        
    }
);

document.addEventListener(
    "click",
    function(event) {

        const button =
            event.target.closest(
                "#setPaymentMethodButton"
            );

        if (!button) {
            return;
        }

        sessionStorage.setItem(
            "returnToEstimate",
            "true"
        );

        window.location.href =
            "profile.html";

    }
);

window.addEventListener("resize", () => {

    if(window.innerWidth > 992){

        sidebar.classList.remove("active");

        sidebarOverlay.classList.remove("active");

    }

});

document.querySelectorAll(".sidebarItem").forEach(item => {

    item.addEventListener("click", () => {

        if (window.innerWidth <= 992) {

            sidebar.classList.remove("active");

            sidebarOverlay.classList.remove("active");

        }

    });

});

document.addEventListener(
"keydown",
function(e){

    if(e.key !== "Escape"){

        return;

    }

    profileDropdown?.classList.remove(
    "show"
    );

    closeEstimatePreview();

closeCreateEstimateModal();
});

document.addEventListener(
    "DOMContentLoaded",
    async function () {
        
        await loadBusinessProfileSettings();
        
        initializeTotalInputs();
        initializeEstimateClientPicker();
        
        await initializeEstimatePreview();
        
        await Promise.all([

            loadUserProfile(),

            loadNotificationCount(),
            
            loadEstimates(),
            
            loadEstimateClients(),
            
            loadEstimateStatistics(),
            
            loadEstimateSubscriptionSettings()
            
            
        ]);
        

    }
);