let currentPage = 1;

let totalPages = 1;

let editingClientId = null;

let currentSendInvoiceId = null;

let currentSendInvoiceData = null;

let isEditingClient = false;

let searchTimeout;

let clientToDelete = null;

let showClientImage = true; async function loadClientImageSetting() {
    
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
            "Client Image Setting Error:",
            error
        );
        
        showClientImage = true;
        
    }
    
}

const rowsPerPage = 10;

const clientSearchInput =
document.getElementById("clientSearchInput");

const viewAllClientEstimatesButton =
    document.getElementById(
        "viewAllClientEstimatesButton"
    );

const viewAllClientInvoicesButton =
    document.getElementById(
        "viewAllClientInvoicesButton"
    );

let currentlyViewedClientId = null;

let selectedClientForEstimateSend = null;

let clientEstimatesForSending = [];

let selectedEstimateForSending = null;

const profileImage = 
document.getElementById("profileImage");

const DEFAULT_PROFILE_IMAGE = 
     "profile.png";
     
     
const sendEstimateClientImage =
document.getElementById(
    "sendEstimateClientImage"
);

const sendEstimateClientImageFallback =
document.getElementById(
    "sendEstimateClientImageFallback"
);

const sendInvoiceClientImage =
document.getElementById(
    "sendInvoiceClientImage"
);

const sendInvoiceClientImageFallback =
document.getElementById(
    "sendInvoiceClientImageFallback"
);

const clientImageInput =
document.getElementById("clientImageInput");

const clientImagePreview =
document.getElementById("clientImagePreview");

const viewClientImage =
document.getElementById("viewClientImage");

const viewClientImageFallback =
document.getElementById("viewClientImageFallback");

let selectedClientImage = null;
 
const viewClientInvoicesCount =
document.getElementById(
    "viewClientInvoicesCount"
);

const sendEstimateOverlay = document.getElementById("sendEstimateOverlay");

const sendEstimateModal = document.getElementById("sendEstimateModal");

const closeSendEstimateButton = document.getElementById("closeSendEstimateButton");

const cancelSendEstimateButton = document.getElementById("cancelSendEstimateButton");

const confirmSendEstimateButton = document.getElementById("confirmSendEstimateButton");

const sendEstimateClientName = document.getElementById("sendEstimateClientName");

const sendEstimateClientEmail = document.getElementById("sendEstimateClientEmail");

const sendEstimateSelect = document.getElementById("sendEstimateSelect");

const previousPageButton =
document.getElementById("previousPageButton");

const nextPageButton =
document.getElementById("nextPageButton");

const pageOneButton =
document.getElementById("pageOneButton");

const pageTwoButton =
document.getElementById("pageTwoButton");

const pageThreeButton =
document.getElementById("pageThreeButton");

const totalClients =
document.getElementById("totalClientsValue");

const activeClients =
document.getElementById("activeClientsValue");

const inactiveClients =
document.getElementById("inactiveClientsValue");

const outstandingBalance =
document.getElementById("outstandingBalanceValue");

const sortClients =
document.getElementById("sortClients");

const statusFilter =
document.getElementById("statusFilter");

const clientsTableBody =
document.getElementById("clientsTableBody");

const addClientButton =
document.getElementById("addClientButton");

const createClientOverlay =
document.getElementById("createClientOverlay");

const createClientModal =
document.getElementById("createClientModal");

const closeClientModalButton =
document.getElementById("closeClientModalButton");

const cancelClientButton =
document.getElementById("cancelClientButton");

const saveClientButton =
document.getElementById("saveClientButton");

const clientModalTitle =
document.getElementById("clientModalTitle");

const contactPersonInput =
document.getElementById("contactPersonInput");

const companyNameInput =
document.getElementById("companyNameInput");

const clientEmailInput =
document.getElementById("clientEmailInput");

const clientPhoneInput =
document.getElementById("clientPhoneInput");

const clientTaxIdInput =
document.getElementById("clientTaxIdInput");

const billingAddressInput =
document.getElementById("billingAddressInput");

const billingAddressLine2Input =
document.getElementById("billingAddressLine2Input");

const billingCityStateZipInput =
document.getElementById("billingCityStateZipInput");

const billingCountryInput =
document.getElementById("billingCountryInput");

const viewTotalEstimatesCount =
document.getElementById(
    "viewTotalEstimatesCount"
);

const clientStatusInput =
document.getElementById("clientStatusInput");

const viewClientOverlay =
document.getElementById("viewClientOverlay");

const viewClientModal =
document.getElementById("viewClientModal");

const closeViewClientButton =
document.getElementById("closeViewClientButton");

const closeViewClientFooterButton =
document.getElementById("closeViewClientFooterButton");

const editViewedClientButton =
document.getElementById("editViewedClientButton");

const viewContactPerson =
document.getElementById("viewContactPerson");

const viewCompanyName =
document.getElementById("viewCompanyName");

const viewClientEmail =
document.getElementById("viewClientEmail");

const viewClientPhone =
document.getElementById("viewClientPhone");

const viewClientTaxId =
document.getElementById("viewClientTaxId");

const viewBillingAddressLine1 =
    document.getElementById(
        "viewBillingAddressLine1"
    );

const viewBillingAddressLine2 =
    document.getElementById(
        "viewBillingAddressLine2"
    );

const viewBillingCityStateZip =
    document.getElementById(
        "viewBillingCityStateZip"
    );

const viewBillingCountry =
    document.getElementById(
        "viewBillingCountry"
    );

const viewClientStatus =
document.getElementById("viewClientStatus");

const viewTotalInvoices =
document.getElementById("viewTotalInvoices");

const viewPaidInvoices = 
document.getElementById("viewPaidInvoices");

const viewPendingInvoices =
document.getElementById("viewPendingInvoices");

const viewOverdueInvoices =
document.getElementById("viewOverdueInvoices");

const viewTotalRevenue =
document.getElementById("viewTotalRevenue");

const viewLastInvoiceDate =
document.getElementById("viewLastInvoiceDate");

const viewOutstandingBalance =
document.getElementById("viewOutstandingBalance");

const toastContainer =
document.getElementById("toastContainer");

const pageLoader =
document.getElementById("pageLoader");

const deleteClientOverlay =
document.getElementById("deleteClientOverlay");

const deleteClientModal =
document.getElementById("deleteClientModal");

const confirmDeleteClient =
document.getElementById("confirmDeleteClient");

const cancelDeleteClient =
document.getElementById("cancelDeleteClient");

const startRecord =
document.getElementById("startRecord");

const endRecord =
document.getElementById("endRecord");

const totalRecords =
document.getElementById("totalRecords");

const sendEstimateSummary = 
document.getElementById("sendEstimateSummary");

const sendEstimateNumber =
document.getElementById("sendEstimateNumber");

const sendEstimateTitle =
document.getElementById("sendEstimateTitle");

const sendEstimateAmount = 
document.getElementById("sendEstimateAmount");

const sendEstimateStatus =
document.getElementById("sendEstimateStatus");

const sendEstimateMessage = 
document.getElementById("sendEstimateMessage");

const notificationButton =
document.getElementById("notificationButton");

const notificationBadge =
document.getElementById("notificationBadge");

const sendInvoiceOverlay =
    document.getElementById("sendInvoiceOverlay");

const sendInvoiceModal =
    document.getElementById("sendInvoiceModal");

const closeSendInvoiceButton =
    document.getElementById("closeSendInvoiceButton");

const cancelSendInvoiceButton =
    document.getElementById("cancelSendInvoiceButton");

const confirmSendInvoiceButton =
    document.getElementById("confirmSendInvoiceButton");

const sendInvoiceClientName =
    document.getElementById("sendInvoiceClientName");

const sendInvoiceClientEmail =
    document.getElementById("sendInvoiceClientEmail");

const sendInvoiceNumber =
    document.getElementById("sendInvoiceNumber");

const sendInvoiceTitle =
    document.getElementById("sendInvoiceTitle");

const sendInvoiceIssueDate =
    document.getElementById("sendInvoiceIssueDate");

const sendInvoiceDueDate =
    document.getElementById("sendInvoiceDueDate");

const sendInvoicePaymentTerms =
    document.getElementById("sendInvoicePaymentTerms");

const sendInvoiceCurrency =
    document.getElementById("sendInvoiceCurrency");

const sendInvoicePaymentStatus =
    document.getElementById("sendInvoicePaymentStatus");

const sendInvoiceAmount =
    document.getElementById("sendInvoiceAmount");

const sendInvoiceItems =
    document.getElementById("sendInvoiceItems");

const sendInvoiceSubtotal =
    document.getElementById("sendInvoiceSubtotal");

const sendInvoiceTax =
    document.getElementById("sendInvoiceTax");

const sendInvoiceDiscount =
    document.getElementById("sendInvoiceDiscount");

const sendInvoiceShipping =
    document.getElementById("sendInvoiceShipping");

const sendInvoiceGrandTotal =
    document.getElementById("sendInvoiceGrandTotal");

const sendInvoicePaymentAccountName =
    document.getElementById(
        "sendInvoicePaymentAccountName"
    );

const sendInvoicePaymentBankName =
    document.getElementById(
        "sendInvoicePaymentBankName"
    );

const sendInvoicePaymentProvider =
    document.getElementById(
        "sendInvoicePaymentProvider"
    );

const sendInvoicePaymentMethod =
    document.getElementById(
        "sendInvoicePaymentMethod"
    );

const sendInvoicePaymentAccountNumber =
    document.getElementById(
        "sendInvoicePaymentAccountNumber"
    );

const sendInvoicePaymentReference =
    document.getElementById(
        "sendInvoicePaymentReference"
    );

const sendInvoicePaymentDueDays =
    document.getElementById(
        "sendInvoicePaymentDueDays"
    );

const sendInvoicePaymentInstructions =
    document.getElementById(
        "sendInvoicePaymentInstructions"
    );

const sendInvoiceNotes =
    document.getElementById(
        "sendInvoiceNotes"
    );

const sendInvoiceTerms =
    document.getElementById(
        "sendInvoiceTerms"
    );

const sendInvoiceSignatureName =
    document.getElementById(
        "sendInvoiceSignatureName"
    );

const sendInvoiceSignatureTitle =
    document.getElementById(
        "sendInvoiceSignatureTitle"
    );

const sendInvoiceSignatureImage =
    document.getElementById(
        "sendInvoiceSignatureImage"
    );

const sendInvoiceMessage =
    document.getElementById(
        "sendInvoiceMessage"
    );
    
const profileDropdown =
document.getElementById("profileDropdown");

const profileMenuButton =
document.getElementById("profileMenBtn");

if(profileMenuButton){
profileMenuButton.addEventListener(
    "click",
    function (event) {

        event.stopPropagation();

        profileDropdown.classList.toggle(
            "show"
        );

    }
);
}

if (sendEstimateSelect) {
    
    sendEstimateSelect.addEventListener(
        "change",
        updateSelectedEstimateForSending
    );
    
}

function showLoader(){

    pageLoader.classList.add(
        "show"
    );

}

function hideLoader(){

    pageLoader.classList.remove(
        "show"
    );

}

function showToast(
message,
type="success"){

    const toast =
    document.createElement("div");

    toast.className =
    `toast ${type}`;

    toast.textContent =
    message;

    toastContainer.appendChild(
        toast
    );

    setTimeout(()=>{

        toast.remove();

    },3000);

}

function closeViewClientModal(){

    viewClientOverlay.classList.remove("show");

    viewClientModal.classList.remove("show");

}

function clearClientForm(){

    contactPersonInput.value = "";

    companyNameInput.value = "";

    clientEmailInput.value = "";

    clientPhoneInput.value = "";

    clientTaxIdInput.value = "";

    billingAddressInput.value = "";

billingAddressLine2Input.value = "";

billingCityStateZipInput.value = "";

billingCountryInput.value = "";

clientImageInput.value = "";

selectedClientImage = null;

resetClientImagePreview();

    clientStatusInput.value = "Active";

}

function openCreateClientModal(){

    editingClientId = null;

    isEditingClient = false;

    clearClientForm();

    clientModalTitle.textContent =
    "Add Client";

    saveClientButton.textContent =
    "Save Client";

    createClientOverlay.classList.add(
        "show"
    );

    createClientModal.classList.add(
        "show"
    );
    
    setTimeout(()=>{

    contactPersonInput.focus();

},100);

}

function closeCreateClientModal(){

    createClientOverlay.classList.remove(
        "show"
    );

    createClientModal.classList.remove(
        "show"
    );

}

function updatePagination(){

    previousPageButton.disabled =
    currentPage === 1;

    nextPageButton.disabled =
    currentPage >= totalPages;

    const pageButtons = [

        pageOneButton,

        pageTwoButton,

        pageThreeButton

    ];

    pageButtons.forEach(button=>{

        button.style.display = "none";

        button.classList.remove("active");

    });

    let startPage =
    Math.max(
        1,
        currentPage - 1
    );

    let endPage =
    Math.min(
        totalPages,
        startPage + 2
    );

    if(endPage - startPage < 2){

        startPage =
        Math.max(
            1,
            endPage - 2
        );

    }

    let index = 0;

    for(

        let page = startPage;

        page <= endPage;

        page++

    ){

        const button =
        pageButtons[index];

        button.style.display =
        "inline-flex";

        button.textContent =
        page;

        if(page === currentPage){

            button.classList.add(
                "active"
            );

        }

        index++;

    }

}

function getClientInitials(name){

    if(!name){

        return "?";

    }

    const words =
    name.trim().split(/\s+/);

    if(words.length === 1){

        return words[0]
        .charAt(0)
        .toUpperCase();

    }

    return (

        words[0].charAt(0) +

        words[words.length - 1].charAt(0)

    ).toUpperCase();

}

function closeDeleteClientModal(){

    deleteClientOverlay.classList.remove(
        "show"
    );

    deleteClientModal.classList.remove(
        "show"
    );

    clientToDelete = null;

}

function registerSendEstimateListeners() {
    
    if (sendEstimateSelect) {
        
        sendEstimateSelect.addEventListener(
            "change",
            handleSendEstimateSelection
        );
        
    }
    
    if (confirmSendEstimateButton) {
        
        confirmSendEstimateButton.addEventListener(
            "click",
            sendSelectedEstimate
        );
        
    }
    
    if (closeSendEstimateButton) {
        
        closeSendEstimateButton.addEventListener(
            "click",
            closeSendEstimateModal
        );
        
    }
    
    if (cancelSendEstimateButton) {
        
        cancelSendEstimateButton.addEventListener(
            "click",
            closeSendEstimateModal
        );
        
    }
    
    if (sendEstimateOverlay) {
        
        sendEstimateOverlay.addEventListener(
            "click",
            closeSendEstimateModal
        );
        
    }
    
}

function updateSelectedEstimateForSending() {
    
    if (!sendEstimateSelect) {
        
        return;
        
    }
    
    const estimateId =
        sendEstimateSelect.value;
    
    selectedEstimateForSending =
        clientEstimatesForSending.find(
            estimate =>
            estimate.objectId === estimateId
        );
    
    if (!selectedEstimateForSending) {
        
        clearSelectedEstimateForSending();
        
        return;
        
    }
    
    const estimate =
        selectedEstimateForSending;
    
    if (sendEstimateNumber) {
        
        sendEstimateNumber.textContent =
            estimate.estimateNumber || "-";
        
    }
    
    if (sendEstimateTitle) {
        
        sendEstimateTitle.textContent =
            estimate.title ||
            estimate.projectName ||
            "-";
        
    }
    
    if (sendEstimateAmount) {
        
        const currencySymbol =
            estimate.currencySymbol ||
            (
                typeof estimatePreviewState !== "undefined" &&
                estimatePreviewState.currencySymbol
            ) ||
            "$";
        
        sendEstimateAmount.textContent =
            currencySymbol +
            Number(
                estimate.grandTotal || 0
            ).toLocaleString(
                undefined,
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );
        
    }
    
    if (sendEstimateStatus) {
        
        sendEstimateStatus.textContent =
            estimate.status ||
            "Draft";
        
    }
    
    if (sendEstimateSummary) {
        
        sendEstimateSummary.style.display =
            "block";
        
    }
    
}

function handleSendEstimateSelection() {
    
    updateSelectedEstimateForSending();
    
}

function clearSelectedEstimateForSending() {
    
    selectedEstimateForSending = null;
    
    
    if (sendEstimateNumber) {
        
        sendEstimateNumber.textContent =
            "-";
        
    }
    
    
    if (sendEstimateTitle) {
        
        sendEstimateTitle.textContent =
            "-";
        
    }
    
    
    if (sendEstimateAmount) {
        
        sendEstimateAmount.textContent =
            "-";
        
    }
    
    
    if (sendEstimateStatus) {
        
        sendEstimateStatus.textContent =
            "-";
        
    }
    
    
    if (sendEstimateSummary) {
        
        sendEstimateSummary.style.display =
            "none";
        
    }
    
}

function closeSendEstimateModal() {
    
    if (sendEstimateOverlay) {
        
        sendEstimateOverlay.classList.remove(
            "show"
        );
        
    }
    
    if (sendEstimateModal) {
        
        sendEstimateModal.classList.remove(
            "show"
        );
        
    }
    
    selectedClientForEstimateSend = null;
    
    clientEstimatesForSending = [];
    
    selectedEstimateForSending = null;
    
}

function renderClientEstimates(
    estimates,
    currencySymbol
) {

    const container =
        document.getElementById(
            "viewClientEstimatesList"
        );

    const totalElement =
        document.getElementById(
            "viewTotalEstimates"
        );

    if (!container) {
        return;
    }

    if (!Array.isArray(estimates)) {
        estimates = [];
    }

    if (totalElement) {
        totalElement.textContent =
            estimates.length;
    }

    if (estimates.length === 0) {

        container.innerHTML =
            `
            <div class="client-empty-estimates">

                <i class="ri-file-list-3-line"></i>

                <p>
                    No estimates for this client.
                </p>

            </div>
            `;

        return;
    }

    const previewEstimates =
        estimates.slice(0, 2);

    container.innerHTML =
        previewEstimates.map(
            function (estimate) {

                const amount =
                    Number(
                        estimate.grandTotal || 0
                    ).toLocaleString(
                        undefined,
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }
                    );

                const status =
                    estimate.status ||
                    "Draft";

                const statusClass =
                    status
                        .toLowerCase()
                        .replace(/\s+/g, "-");

                return `
    <div
        class="client-estimate-card"
        data-id="${estimate.objectId || ""}">

        <div class="client-estimate-info">

            <strong>
                ${estimate.estimateNumber || "-"}
            </strong>

            <span>
                ${
                    estimate.title ||
                    estimate.projectName ||
                    "Estimate"
                }
            </span>

        </div>

        <div class="client-estimate-amount">

            ${currencySymbol || ""}
            ${amount}

        </div>

        <span
            class="status-badge ${statusClass}">

            ${status}

        </span>

        <button
            type="button"
            class="send-client-estimate-button"
            data-id="${estimate.objectId || ""}">

            <i class="ri-send-plane-line"></i>

            Send Estimate

        </button>

    </div>
`;
}
        ).join("");

}

function renderClientInvoices(
    invoices,
    currencySymbol
) {

    const container =
        document.getElementById(
            "viewClientInvoicesList"
        );

    const totalElement =
        document.getElementById(
            "viewClientInvoicesCount"
        );

    if (!container) {
        return;
    }

    if (!Array.isArray(invoices)) {
        invoices = [];
    }

    if (totalElement) {
        totalElement.textContent =
            invoices.length;
    }

    if (invoices.length === 0) {

        container.innerHTML =
            `
            <div class="client-empty-invoices">

                <i class="ri-file-text-line"></i>

                <p>
                    No invoices for this client.
                </p>

            </div>
            `;

        return;
    }

    const previewInvoices =
        invoices.slice(0, 2);

    container.innerHTML =
        previewInvoices.map(
            function (invoice) {

                const amount =
                    Number(
                        invoice.totalAmount || 0
                    ).toLocaleString(
                        undefined,
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }
                    );

                const status =
                    invoice.status ||
                    "Draft";

                const statusClass =
                    status
                        .toLowerCase()
                        .replace(/\s+/g, "-");

                return `
    <div
        class="client-invoice-card"
        data-id="${invoice.objectId || ""}">

        <div class="client-invoice-info">

            <strong>
                ${invoice.invoiceNumber || "-"}
            </strong>

            <span>
                ${
                    invoice.invoiceTitle ||
                    invoice.projectName ||
                    "Invoice"
                }
            </span>

        </div>

        <div class="client-invoice-amount">

            ${currencySymbol || ""}
            ${amount}

        </div>

        <span
            class="status-badge ${statusClass}">

            ${status}

        </span>

        <button
            type="button"
            class="send-client-invoice-button"
            data-id="${invoice.objectId || ""}">

            <i class="ri-send-plane-line"></i>

            Send Invoice

        </button>

    </div>
`;

            }
        ).join("");

}

function setClientImagePreview(url){

    if(!url){

        resetClientImagePreview();

        return;

    }

    clientImagePreview.innerHTML = `

        <img
        src="${url}"
        alt="Client Image">

    `;

}

function resetClientImagePreview(){

    clientImagePreview.innerHTML = `

        <i class="ri-user-line"></i>

    `;

}

function registerSendEstimateListeners() {
    
    if (sendEstimateSelect) {
        
        sendEstimateSelect.addEventListener(
            "change",
            handleSendEstimateSelection
        );
        
    }
    
    if (confirmSendEstimateButton) {
        
        confirmSendEstimateButton.addEventListener(
            "click",
            sendSelectedEstimate
        );
        
    }
    
    if (closeSendEstimateButton) {
        
        closeSendEstimateButton.addEventListener(
            "click",
            closeSendEstimateModal
        );
        
    }
    
    if (cancelSendEstimateButton) {
        
        cancelSendEstimateButton.addEventListener(
            "click",
            closeSendEstimateModal
        );
        
    }
    
    if (sendEstimateOverlay) {
        
        sendEstimateOverlay.addEventListener(
            "click",
            closeSendEstimateModal
        );
        
    }
    
}

function setSendInvoiceText(
    id,
    value
){

    const element =
        document.getElementById(
            id
        );

    if(!element){
        return;
    }

    element.textContent =
        value === null ||
        value === undefined ||
        value === ""
            ? "-"
            : value;

}

function formatInvoiceDate(
    value
){

    if(!value){
        return "-";
    }

    const date =
        new Date(
            value
        );

    if(
        Number.isNaN(
            date.getTime()
        )
    ){

        return "-";

    }

    return date.toLocaleDateString(
        undefined,
        {
            year:
                "numeric",
            month:
                "short",
            day:
                "numeric"
        }
    );

}

function formatInvoiceMoney(
    value,
    currencySymbol
){

    const amount =
        Number(
            value || 0
        );

    return (
        currencySymbol || ""
    ) +
    amount.toLocaleString(
        undefined,
        {
            minimumFractionDigits:
                2,
            maximumFractionDigits:
                2
        }
    );

}

function renderSendInvoiceItems(
    items,
    currencySymbol
){

    const container =
        document.getElementById(
            "sendInvoiceItems"
        );

    if(!container){
        return;
    }

    if(
        !Array.isArray(items) ||
        !items.length
    ){

        container.innerHTML =
            `
            <div class="send-invoice-empty-items">
                No invoice items available.
            </div>
            `;

        return;

    }

    container.innerHTML =
        items.map(
            function(item, index){

                const description =
                    item.description ||
                    "Item";

                const quantity =
                    Number(
                        item.quantity || 0
                    );

                const unitPrice =
                    Number(
                        item.unitPrice || 0
                    );

                const total =
                    Number(
                        item.total ||
                        quantity * unitPrice
                    );

                return `
                    <div class="send-invoice-item-row">

                        <div class="send-invoice-item-number">
                            ${index + 1}
                        </div>

                        <div class="send-invoice-item-description">
                            ${escapeSendInvoiceHtml(
                                description
                            )}
                        </div>

                        <div class="send-invoice-item-quantity">
                            ${quantity}
                        </div>

                        <div class="send-invoice-item-price">
                            ${formatInvoiceMoney(
                                unitPrice,
                                currencySymbol
                            )}
                        </div>

                        <div class="send-invoice-item-total">
                            ${formatInvoiceMoney(
                                total,
                                currencySymbol
                            )}
                        </div>

                    </div>
                `;

            }
        ).join("");

}

function populateSendInvoicePayment(
    paymentDetails
){

    setSendInvoiceText(
        "sendInvoicePaymentAccountName",
        paymentDetails.accountName ||
        paymentDetails.account_name ||
        "-"
    );

    setSendInvoiceText(
        "sendInvoicePaymentBankName",
        paymentDetails.bankName ||
        paymentDetails.bank_name ||
        "-"
    );

    setSendInvoiceText(
        "sendInvoicePaymentProvider",
        paymentDetails.paymentProvider ||
        paymentDetails.provider ||
        "-"
    );

    setSendInvoiceText(
        "sendInvoicePaymentMethod",
        paymentDetails.paymentMethod ||
        paymentDetails.method ||
        "-"
    );

    setSendInvoiceText(
        "sendInvoicePaymentAccountNumber",
        paymentDetails.accountNumber ||
        paymentDetails.account_number ||
        "-"
    );

    setSendInvoiceText(
        "sendInvoicePaymentReference",
        paymentDetails.paymentReference ||
        paymentDetails.reference ||
        "-"
    );

    setSendInvoiceText(
        "sendInvoicePaymentDueDays",
        paymentDetails.paymentDueDays ||
        paymentDetails.dueDays ||
        "-"
    );

    setSendInvoiceText(
        "sendInvoicePaymentInstructions",
        paymentDetails.paymentInstructions ||
        paymentDetails.instructions ||
        "-"
    );

}

function hasPaymentDetails(
    paymentDetails
){

    if(
        !paymentDetails ||
        typeof paymentDetails !==
            "object"
    ){

        return false;

    }

    return Object.values(
        paymentDetails
    ).some(
        function(value){

            return (
                value !== null &&
                value !== undefined &&
                String(
                    value
                ).trim() !== ""
            );

        }
    );

}

function updateSendInvoiceSectionVisibility(
    id,
    visible
){

    const section =
        document.getElementById(
            id
        );

    if(!section){
        return;
    }

    section.style.display =
        visible
            ? ""
            : "none";

}

function escapeSendInvoiceHtml(
    value
){

    return String(
        value || ""
    )
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

}

function closeSendInvoiceModal(){

    const modal =
        document.getElementById(
            "sendInvoiceModal"
        );

    const overlay =
        document.getElementById(
            "sendInvoiceOverlay"
        );

    if(modal){

        modal.classList.remove(
            "show"
        );

        delete modal.dataset.invoiceId;

    }

    if(overlay){

        overlay.classList.remove(
            "show"
        );

    }

    document.body.classList.remove(
        "send-invoice-modal-open"
    );

}

async function openSendEstimateModal(estimateId) {
    
    try {
        
        showLoader();
        
        const result =
            await Parse.Cloud.run(
                "getEstimateDetails",
                {
                    estimateId: estimateId
                }
            );
        
        if (
            !result ||
            !result.estimate
        ) {
            
            throw new Error(
                "Unable to load estimate."
            );
            
        }
        
        const estimate =
            result.estimate;
        
        const client =
            result.client;
        
        if (!client) {
            
            throw new Error(
                "Client information is missing."
            );
            
        }
        
        if (!client.clientEmail) {
            
            throw new Error(
                "This client does not have an email address."
            );
            
        }
        
        selectedClientForEstimateSend =
            client;
        
        const clientResult =
            await Parse.Cloud.run(
                "getClientDetails",
                {
                    clientId: client.objectId
                }
            );
        
        if (
            !clientResult ||
            !clientResult.client
        ) {
            
            throw new Error(
                "Unable to load client estimates."
            );
            
        }
        
        const allEstimates =
            clientResult.client.estimates || [];
        
        clientEstimatesForSending =
            allEstimates.filter(
                item => !item.sentAt
            );
        
        if (
            clientEstimatesForSending.length === 0
        ) {
            
            throw new Error(
                "There are no unsent estimates available for this client."
            );
            
        }
        
        if (sendEstimateClientName) {
            
            sendEstimateClientName.textContent =
                client.contactPerson ||
                client.companyName ||
                "Client";
            
        }
        
        if (sendEstimateClientImage) {

    if (client.clientImageUrl) {

        sendEstimateClientImage.src =
            client.clientImageUrl;

        sendEstimateClientImage.style.display =
            "block";

        if (sendEstimateClientImageFallback) {

            sendEstimateClientImageFallback.style.display =
                "none";

        }

    } else {

        sendEstimateClientImage.removeAttribute(
            "src"
        );

        sendEstimateClientImage.style.display =
            "none";

        if (sendEstimateClientImageFallback) {

            sendEstimateClientImageFallback.style.display =
                "block";

        }

    }

}
        
        if (sendEstimateClientEmail) {
            
            sendEstimateClientEmail.textContent =
                client.clientEmail;
            
        }
        
        if (sendEstimateSelect) {
            
            sendEstimateSelect.innerHTML = `
                <option value="">
                    Select an estimate
                </option>
            `;
            
            clientEstimatesForSending.forEach(
                item => {
                    
                    const option =
                        document.createElement(
                            "option"
                        );
                    
                    option.value =
                        item.objectId;
                    
                    option.textContent =
                        `${item.estimateNumber || "Estimate"} — ${
                            item.title ||
                            item.projectName ||
                            "Untitled Estimate"
                        }`;
                    
                    sendEstimateSelect.appendChild(
                        option
                    );
                    
                }
            );
            
            const matchingEstimate =
                clientEstimatesForSending.find(
                    item =>
                    item.objectId === estimateId
                );
            
            if (matchingEstimate) {
                
                sendEstimateSelect.value =
                    estimateId;
                
                updateSelectedEstimateForSending();
                
            }
            else {
                
                clearSelectedEstimateForSending();
                
            }
            
        }
        
        if (sendEstimateOverlay) {
            
            sendEstimateOverlay.classList.add(
                "show"
            );
            
        }
        
        if (sendEstimateModal) {
            
            sendEstimateModal.classList.add(
                "show"
            );
            
        }
        
    }
    catch (error) {
        
        console.error(
            "Open Send Estimate Error:",
            error
        );
        
        showToast(
            error.message ||
            "Unable to prepare estimate for sending.",
            "error"
        );
        
    }
    finally {
        
        hideLoader();
        
    }
    
}

async function sendSelectedEstimate() {
    
    if (!selectedClientForEstimateSend) {
        
        showToast(
            "Client information is missing.",
            "error"
        );
        
        return;
        
    }
    
    if (!selectedEstimateForSending) {
        
        showToast(
            "Please select an estimate.",
            "error"
        );
        
        return;
        
    }
    
    if (!selectedClientForEstimateSend.clientEmail) {
        
        showToast(
            "This client does not have an email address.",
            "error"
        );
        
        return;
        
    }
    
    const estimateId =
        selectedEstimateForSending.objectId;
    
    const message =
        sendEstimateMessage ?
        sendEstimateMessage.value.trim() :
        "";
    
    try {
        
        showLoader();
        
        if (confirmSendEstimateButton) {
            
            confirmSendEstimateButton.addEventListener(
                "click",
                confirmSendEstimate
            );
            
            confirmSendEstimateButton.disabled =
                true;
            
            confirmSendEstimateButton.textContent =
                "Sending...";
            
        }
        
        const result =
            await Parse.Cloud.run(
                "sendEstimateToClient",
                {
                    estimateId: estimateId,
                    message: message
                }
            );
        
        if (
            !result ||
            result.success !== true
        ) {
            
            throw new Error(
                result?.message ||
                "Unable to send estimate."
            );
            
        }
        
        showToast(
            result.message ||
            "Estimate sent successfully.",
            "success"
        );
        
        closeSendEstimateModal();
        
        if (selectedClientForEstimateSend?.objectId) {
            
            await openViewClientModal(
                selectedClientForEstimateSend.objectId
            );
            
        }
        
    }
    catch (error) {
        
        console.error(
            "Send Estimate Error:",
            error
        );
        
        showToast(
            error.message ||
            "Unable to send estimate.",
            "error"
        );
        
    }
    finally {
        
        hideLoader();
        
        if (confirmSendEstimateButton) {
            
            confirmSendEstimateButton.disabled =
                false;
            
            confirmSendEstimateButton.innerHTML = `
                <i class="ri-send-plane-line"></i>
                Send Estimate
            `;
            
        }
        
    }
    
}

async function confirmSendEstimate() {
    
    if (!selectedEstimateForSending) {
        
        showToast(
            "Please select an estimate to send.",
            "error"
        );
        
        return;
        
    }
    
    const estimateId =
        selectedEstimateForSending.objectId;
    
    if (!estimateId) {
        
        showToast(
            "Estimate ID is missing.",
            "error"
        );
        
        return;
        
    }
    
    const clientId =
        selectedClientForEstimateSend ?
        selectedClientForEstimateSend.objectId :
        null;
    
    if (!clientId) {
        
        showToast(
            "Client information is missing.",
            "error"
        );
        
        return;
        
    }
    
    const message =
        sendEstimateMessage ?
        sendEstimateMessage.value.trim() :
        "";
    
    try {
        
        if (confirmSendEstimateButton) {
            
            confirmSendEstimateButton.disabled =
                true;
            
            confirmSendEstimateButton.innerHTML =
                `
                    <i class="ri-loader-4-line ri-spin"></i>
                    Sending...
                `;
            
        }
        
        showLoader();
        
        const result =
            await Parse.Cloud.run(
                "sendEstimateToClient",
                {
                    
                    estimateId: estimateId,
                    
                    message: message
                    
                }
            );
        
        if (
            !result ||
            !result.success
        ) {
            
            throw new Error(
                result?.message ||
                "Unable to send estimate."
            );
            
        }
        
        showToast(
            result.message ||
            "Estimate sent successfully.",
            "success"
        );
        
        closeSendEstimateModal();
        
        await openViewClientModal(
            clientId
        );
        
    }
    
    catch (error) {
        
        console.error(
            "Confirm Send Estimate Error:",
            error
        );
        
        showToast(
            error.message ||
            "Unable to send estimate.",
            "error"
        );
        
    }
    
    finally {
        
        hideLoader();

        if (confirmSendEstimateButton) {
            
            confirmSendEstimateButton.disabled =
                false;
            
            confirmSendEstimateButton.innerHTML =
                `
                    <i class="ri-send-plane-line"></i>
                    Send Estimate
                `;
            
        }
        
    }
    
}

async function openViewClientModal(clientId) {

    currentlyViewedClientId = clientId;

    try {

        showLoader();

        const result =
            await Parse.Cloud.run(
                "getClientDetails",
                {
                    clientId: clientId
                }
            );

        if(!result){

            throw new Error(
                "No response received from getClientDetails."
            );

        }

        if(!result.client){

            throw new Error(
                "Client data is missing from getClientDetails response."
            );

        }

        const client =
            result.client;
            
            if(client.clientImageUrl){

    viewClientImage.src =
    client.clientImageUrl;

    viewClientImage.style.display =
    "block";

    viewClientImageFallback.style.display =
    "none";

}else{

    viewClientImage.removeAttribute(
        "src"
    );

    viewClientImage.style.display =
    "none";

    viewClientImageFallback.style.display =
    "flex";

}

        viewContactPerson.textContent =
            client.contactPerson || "-";

        viewCompanyName.textContent =
            client.companyName || "-";

        viewClientEmail.textContent =
            client.clientEmail || "-";

        viewClientPhone.textContent =
            client.clientPhone || "-";

        viewClientTaxId.textContent =
            client.clientTaxId || "-";

viewBillingAddressLine1.textContent =
    client.billingAddressLine1 || "-";

viewBillingAddressLine2.textContent =
    client.billingAddressLine2 || "-";

viewBillingCityStateZip.textContent =
    client.billingCityStateZip || "-";

viewBillingCountry.textContent =
    client.billingCountry || "-";

        viewClientStatus.textContent =
            client.status || "-";

        viewTotalInvoices.textContent =
            client.totalInvoices ?? 0;
            
        viewTotalEstimatesCount.textContent =
    (client.estimates || []).length;

        viewPaidInvoices.textContent =
            client.paidInvoices ?? 0;

        viewPendingInvoices.textContent =
            client.pendingInvoices ?? 0;

        viewOverdueInvoices.textContent =
            client.overdueInvoices ?? 0;

        viewTotalRevenue.textContent =
            (result.currencySymbol || "") +
            Number(
                client.totalRevenue || 0
            ).toLocaleString();

        viewLastInvoiceDate.textContent =
            client.lastInvoiceDate
                ? new Date(
                    client.lastInvoiceDate
                  ).toLocaleDateString()
                : "-";

        viewOutstandingBalance.textContent =
            (result.currencySymbol || "") +
            Number(
                client.outstandingBalance || 0
            ).toLocaleString();

        editViewedClientButton.dataset.id =
            client.objectId;
            
            renderClientEstimates(
client.estimates || [],
result.currencySymbol || ""
);

            renderClientInvoices(
                client.invoices || [],
                result.currencySymbol || ""
            );

        viewClientOverlay.classList.add(
            "show"
        );

        viewClientModal.classList.add(
            "show"
        );

    }

    catch(error){

        console.error(
            "View Client Error:",
            error
        );

        showToast(
            error.message ||
            "Unable to load client details.",
            "error"
        );

    }

    finally{

        hideLoader();

    }

}

async function openEditClientModal(clientId){

    try{

        const result =
        await Parse.Cloud.run(
        "getClientDetails",
        {

            clientId

        });

        const client =
        result.client;
        
        selectedClientImage = null;

clientImageInput.value = "";

setClientImagePreview(
    client.clientImageUrl || ""
);

        editingClientId =
        client.objectId;

        isEditingClient = true;

        contactPersonInput.value =
        client.contactPerson || "";

        companyNameInput.value =
        client.companyName || "";

        clientEmailInput.value =
        client.clientEmail || "";

        clientPhoneInput.value =
        client.clientPhone || "";

        clientTaxIdInput.value =
        client.clientTaxId || "";

        billingAddressInput.value =
client.billingAddressLine1 || "";

billingAddressLine2Input.value =
client.billingAddressLine2 || "";

billingCityStateZipInput.value =
client.billingCityStateZip || "";

billingCountryInput.value =
client.billingCountry || "";

        clientStatusInput.value =
        client.status || "Active";

        clientModalTitle.textContent =
        "Edit Client";

        saveClientButton.textContent =
        "Update Client";

        createClientOverlay.classList.add(
            "show"
        );

        createClientModal.classList.add(
            "show"
        );
        
        setTimeout(()=>{

    contactPersonInput.focus();

},100);

    }

    catch(error){

        showToast(
    error.message,
    "error"
);

    }

}

async function loadClients(){

    try{

        const result =
        await Parse.Cloud.run(
        "getClients",
        {

            search:
            clientSearchInput.value.trim(),

            status:
            statusFilter.value || "all",

            sort:
            sortClients.value,

            page:
            currentPage,

            limit:
            rowsPerPage

        });

        clientsTableBody.innerHTML = "";
        
        if(result.clients.length === 0){

    clientsTableBody.innerHTML = `

<tr>

<td colspan="7">

<div class="empty-state">

<i class="ri-user-search-line empty-state-icon"></i>

    <h3>
        No Clients Yet
    </h3>

    <p>
        You haven't added any clients yet.
        Start by creating your first client.
    </p>

    <button
    class="empty-state-btn"
    id="emptyStateAddClientButton">

        + Add Client

    </button>

</div>

</td>

</tr>

`;

    document
    .getElementById(
        "emptyStateAddClientButton"
    )
    .addEventListener(
        "click",
        openCreateClientModal
    );

} else {

    result.clients.forEach(client => {

        clientsTableBody.innerHTML += `

<tr>

<td>

<div class="client-info">

${
    showClientImage
    ?
    `
    <div
        class="client-avatar"
        data-initial="${(
            client.contactPerson ||
            "C"
        ).charAt(0).toUpperCase()}"
    >

        ${
            client.clientImageUrl
            ?
            `
            <img
                src="${client.clientImageUrl}"
                alt="${client.contactPerson || "Client"}">
            `
            :
            getClientInitials(
                client.contactPerson
            )
        }

    </div>
    `
    :
    ""
}

    <div class="client-name-wrapper">

        <h4>
            ${client.contactPerson || "-"}
        </h4>

        <span>
            ${client.companyName || "-"}
        </span>

    </div>

</div>

</td>

<td>
${client.clientEmail || "-"}
</td>

<td>
${client.clientPhone || "-"}
</td>

<td>
${client.totalEstimates || 0}
</td>

<td>
${client.totalInvoices || 0}
</td>

<td>
${result.currencySymbol}${Number(
    client.outstandingBalance
).toLocaleString()}
</td>

<td>

<span class="status-badge ${client.status.toLowerCase()}">
${client.status}
</span>

</td>

<td>

<button
class="action-btn view-client-btn"
data-id="${client.objectId}">
    <i class="ri-eye-line"></i>
</button>

<button
class="action-btn edit-client-btn"
data-id="${client.objectId}">
    <i class="ri-edit-line"></i>
</button>

<button
class="action-btn delete-client-btn"
data-id="${client.objectId}">
    <i class="ri-delete-bin-line"></i>
</button>

</td>

</tr>

`;

    });

}

        totalRecords.textContent =
        result.totalRecords;
        
        totalPages = result.totalPages || 1;
        updatePagination();

        startRecord.textContent =
        result.totalRecords === 0
        ? 0
        : ((currentPage - 1) *
        rowsPerPage) + 1;

        endRecord.textContent =
        Math.min(
            currentPage *
            rowsPerPage,
            result.totalRecords
        );
        
document
.querySelectorAll(".edit-client-btn")
.forEach(button=>{

    
button.addEventListener(
        "click",
        ()=>{

            openEditClientModal(

                button.dataset.id

            );

        }
    );
});

document
.querySelectorAll(".delete-client-btn")
.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            clientToDelete =
                button.dataset.id;

            deleteClientOverlay.classList.add(
                "show"
            );

            deleteClientModal.classList.add(
                "show"
            );

        }
    );

});



           

document
.querySelectorAll(".view-client-btn")
.forEach(button=>{

    button.addEventListener(
    "click",
    ()=>{

        openViewClientModal(

            button.dataset.id

        );

    });

});

await loadClientStatistics();

    }

    catch(error){

        showToast(
    error.message,
    "error"
);

    }

}

async function loadClientStatistics(){

    try{

        const result =
        await Parse.Cloud.run(
            "getClientStatistics"
        );

        totalClients.textContent =
        result.totalClients;

        activeClients.textContent =
        result.activeClients;

        inactiveClients.textContent =
        result.inactiveClients;

        outstandingBalance.textContent =

        result.currencySymbol +

        Number(
            result.outstandingBalance
        ).toLocaleString();

    }

    catch(error){

        console.error(error);

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

        showToast(
            error.message ||
            "Unable to load notifications.",
            "error"
        );

    }

}

async function loadClientImageSetting(){

    try{

        const result =
            await Parse.Cloud.run(
                "getBusinessProfile"
            );

        showClientImage =
            result &&
            result.profile &&
            result.profile.showClientImage !== false;

    }
    catch(error){

        console.error(
            "Client Image Setting Error:",
            error
        );

        showClientImage = true;

    }

}

async function openSendInvoiceModal(
    invoiceId
){

    try{

        showLoader();

        const result =
            await Parse.Cloud.run(
                "getInvoiceDetails",
                {
                    invoiceId:
                        invoiceId
                }
            );

        if(
            !result ||
            !result.invoice
        ){

            throw new Error(
                "Unable to load invoice details."
            );

        }

        const invoice =
            result.invoice;

        const client =
            result.client || {};

        const items =
            Array.isArray(
                result.items
            )
                ? result.items
                : [];

        const paymentDetails =
            result.paymentDetails ||
            invoice.paymentDetails ||
            {};

        const currencySymbol =
            result.currencySymbol ||
            invoice.currencySymbol ||
            "";

        const clientName =
            client.contactPerson ||
            client.companyName ||
            invoice.contactPerson ||
            invoice.companyName ||
            "Client";

        const clientEmail =
            client.clientEmail ||
            invoice.clientEmail ||
            "";

        setSendInvoiceText(
            "sendInvoiceClientName",
            clientName
        );
        
        if (sendInvoiceClientImage) {

    if (client.clientImageUrl) {

        sendInvoiceClientImage.src =
            client.clientImageUrl;

        sendInvoiceClientImage.style.display =
            "block";

        if (sendInvoiceClientImageFallback) {

            sendInvoiceClientImageFallback.style.display =
                "none";

        }

    } else {

        sendInvoiceClientImage.removeAttribute(
            "src"
        );

        sendInvoiceClientImage.style.display =
            "none";

        if (sendInvoiceClientImageFallback) {

            sendInvoiceClientImageFallback.style.display =
                "block";

        }

    }

}

        setSendInvoiceText(
            "sendInvoiceClientEmail",
            clientEmail || "-"
        );

        setSendInvoiceText(
            "sendInvoiceNumber",
            invoice.invoiceNumber || "-"
        );

        setSendInvoiceText(
            "sendInvoiceTitle",
            invoice.invoiceTitle ||
            invoice.projectName ||
            "Invoice"
        );

        setSendInvoiceText(
            "sendInvoiceIssueDate",
            formatInvoiceDate(
                invoice.issueDate
            )
        );

        setSendInvoiceText(
            "sendInvoiceDueDate",
            formatInvoiceDate(
                invoice.dueDate
            )
        );

        setSendInvoiceText(
            "sendInvoicePaymentTerms",
            invoice.paymentTerms || "-"
        );

        setSendInvoiceText(
            "sendInvoiceCurrency",
            invoice.currencyCode
                ? invoice.currencyCode +
                  " (" +
                  currencySymbol +
                  ")"
                : currencySymbol || "-"
        );

        setSendInvoiceText(
            "sendInvoicePaymentStatus",
            invoice.status || "Draft"
        );

        setSendInvoiceText(
            "sendInvoiceAmount",
            formatInvoiceMoney(
                invoice.totalAmount,
                currencySymbol
            )
        );

        renderSendInvoiceItems(
            items,
            currencySymbol
        );

        setSendInvoiceText(
            "sendInvoiceSubtotal",
            formatInvoiceMoney(
                invoice.subtotal,
                currencySymbol
            )
        );

        setSendInvoiceText(
            "sendInvoiceTax",
            formatInvoiceMoney(
                invoice.tax,
                currencySymbol
            )
        );

        setSendInvoiceText(
            "sendInvoiceDiscount",
            formatInvoiceMoney(
                invoice.discount,
                currencySymbol
            )
        );

        setSendInvoiceText(
            "sendInvoiceShipping",
            formatInvoiceMoney(
                invoice.shipping,
                currencySymbol
            )
        );

        setSendInvoiceText(
            "sendInvoiceGrandTotal",
            formatInvoiceMoney(
                invoice.totalAmount,
                currencySymbol
            )
        );

        populateSendInvoicePayment(
            paymentDetails
        );

        setSendInvoiceText(
            "sendInvoiceNotes",
            invoice.notes || "-"
        );

        setSendInvoiceText(
            "sendInvoiceTerms",
            invoice.termsConditions || "-"
        );

        setSendInvoiceText(
            "sendInvoiceSignatureName",
            invoice.signatureName || "-"
        );

        setSendInvoiceText(
            "sendInvoiceSignatureTitle",
            invoice.signatureTitle || "-"
        );

        const signatureImage =
            document.getElementById(
                "sendInvoiceSignatureImage"
            );

        if(signatureImage){

            if(invoice.signatureImage){

                signatureImage.src =
                    invoice.signatureImage;

                signatureImage.style.display =
                    "block";

            }else{

                signatureImage.removeAttribute(
                    "src"
                );

                signatureImage.style.display =
                    "none";

            }

        }

        updateSendInvoiceSectionVisibility(
            "sendInvoicePaymentSection",
            hasPaymentDetails(
                paymentDetails
            )
        );

        updateSendInvoiceSectionVisibility(
            "sendInvoiceNotesSection",
            !!(
                invoice.notes &&
                String(
                    invoice.notes
                ).trim()
            )
        );

        updateSendInvoiceSectionVisibility(
            "sendInvoiceTermsSection",
            !!(
                invoice.termsConditions &&
                String(
                    invoice.termsConditions
                ).trim()
            )
        );

        updateSendInvoiceSectionVisibility(
            "sendInvoiceSignatureSection",
            !!(
                invoice.signatureName ||
                invoice.signatureTitle ||
                invoice.signatureImage
            )
        );

        const message =
            document.getElementById(
                "sendInvoiceMessage"
            );

        if(message){

            message.value = "";

        }

        const modal =
            document.getElementById(
                "sendInvoiceModal"
            );

        if(!modal){

            throw new Error(
                "Send invoice modal was not found."
            );

        }

        modal.dataset.invoiceId =
            invoiceId;

        const overlay =
            document.getElementById(
                "sendInvoiceOverlay"
            );

        if(overlay){

            overlay.classList.add(
                "show"
            );

        }

        modal.classList.add(
            "show"
        );

        document.body.classList.add(
            "send-invoice-modal-open"
        );

    }

    catch(error){

        console.error(
            "Open Send Invoice Error:",
            error
        );

        showToast(
            error.message ||
            "Unable to load invoice.",
            "error"
        );

    }

    finally{

        hideLoader();

    }

}

async function sendInvoiceToClient(
    button
){
    const modal =
        document.getElementById(
            "sendInvoiceModal"
        );

    if(!modal){

        showToast(
            "Send invoice modal was not found.",
            "error"
        );

        return;

    }

    const invoiceId =
        modal.dataset.invoiceId;

    if(!invoiceId){

        showToast(
            "Invoice ID is missing.",
            "error"
        );

        return;

    }

    const messageElement =
        document.getElementById(
            "sendInvoiceMessage"
        );

    const message =
        messageElement
            ? messageElement.value.trim()
            : "";

    if(button.disabled){

        return;

    }

    try{

        button.disabled =
            true;

        const originalContent =
            button.innerHTML;

        button.dataset.originalContent =
            originalContent;

        button.innerHTML =
            `
            <i class="ri-loader-4-line ri-spin"></i>
            Sending...
            `;

        const result =
            await Parse.Cloud.run(
                "sendInvoiceToClient",
                {
                    invoiceId:
                        invoiceId,

                    message:
                        message
                }
            );

        if(
            !result ||
            result.success !== true
        ){

            throw new Error(
                result &&
                result.message
                    ? result.message
                    : "Invoice could not be sent."
            );

        }

        closeSendInvoiceModal();

        showToast(
            result.message ||
            "Invoice sent successfully.",
            "success"
        );

        const sentButton =
            document.querySelector(
                '.send-client-invoice-button[data-id="' +
                invoiceId +
                '"]'
            );

        if(sentButton){

            const parent =
                sentButton.parentElement;

            if(parent){

                sentButton.outerHTML =
                    `
                    <span class="invoice-sent-label">
                        Sent
                    </span>
                    `;

            }

        }

    }

    catch(error){

        console.error(
            "Send Invoice Error:",
            error
        );

        showToast(
            error.message ||
            "Unable to send invoice.",
            "error"
        );

        button.disabled =
            false;

        button.innerHTML =
            button.dataset.originalContent ||
            `
            <i class="ri-send-plane-line"></i>
            Send Invoice
            `;

    }

}

if (viewAllClientEstimatesButton) {
    
    viewAllClientEstimatesButton.addEventListener(
        "click",
        function() {
            
            if (!currentlyViewedClientId) {
                
                showToast(
                    "Client ID is missing.",
                    "error"
                );
                
                return;
            }
            
            window.location.href =
                "client-history.html?clientId=" +
                encodeURIComponent(
                    currentlyViewedClientId
                ) +
                "&type=estimates";
            
        }
    );
    
}

if (viewAllClientInvoicesButton) {
    
    viewAllClientInvoicesButton.addEventListener(
        "click",
        function() {
            
            if (!currentlyViewedClientId) {
                
                showToast(
                    "Client ID is missing.",
                    "error"
                );
                
                return;
            }
            
            window.location.href =
                "client-history.html?clientId=" +
                encodeURIComponent(
                    currentlyViewedClientId
                ) +
                "&type=invoices";
            
        }
    );
    
}

addClientButton.addEventListener(
    "click",
    openCreateClientModal
);

cancelDeleteClient.addEventListener(
"click",
closeDeleteClientModal
);

deleteClientOverlay.addEventListener(
"click",
closeDeleteClientModal
);

closeClientModalButton.addEventListener(
    "click",
    closeCreateClientModal
);

cancelClientButton.addEventListener(
    "click",
    closeCreateClientModal
);

createClientOverlay.addEventListener(
    "click",
    closeCreateClientModal
);

clientSearchInput.addEventListener(
"input",
()=>{

    clearTimeout(searchTimeout);

    searchTimeout =
    setTimeout(()=>{

        currentPage = 1;

        loadClients();

    },300);

});

statusFilter.addEventListener(
"change",
()=>{

    currentPage = 1;

    loadClients();

});

sortClients.addEventListener(
"change",
()=>{

    currentPage = 1;

    loadClients();

});

saveClientButton.addEventListener(
"click",
async()=>{

    const contactPerson =
    contactPersonInput.value.trim();

    const companyName =
    companyNameInput.value.trim();

    const clientEmail =
    clientEmailInput.value.trim();

    const clientPhone =
    clientPhoneInput.value.trim();

    const clientTaxId =
    clientTaxIdInput.value.trim();

    const billingAddressLine1 =
billingAddressInput.value.trim();

const billingAddressLine2 =
billingAddressLine2Input.value.trim();

const billingCityStateZip =
billingCityStateZipInput.value.trim();

const billingCountry =
billingCountryInput.value.trim();

    const status =
    clientStatusInput.value;

    if(!contactPerson){

        showToast(
        "Please enter the contact person."
        );

        contactPersonInput.focus();

        return;

    }
    
    if(clientEmail){

    const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!emailPattern.test(clientEmail)){

        showToast(
            "Please enter a valid email address.",
            "error"
        );

        clientEmailInput.focus();

        return;

    }

}
    
    if(clientPhone){

    const phonePattern =
    /^[0-9+\-\s()]{7,20}$/;

    if(!phonePattern.test(clientPhone)){

        showToast(
            "Please enter a valid phone number.",
            "error"
        );

        clientPhoneInput.focus();

        return;

    }

}
    
    if(contactPerson.length > 100){

    showToast(
        "Contact person name is too long.",
        "error"
    );

    contactPersonInput.focus();

    return;

}
    
    if(companyName.length > 120){

    showToast(
        "Company name is too long.",
        "error"
    );

    companyNameInput.focus();

    return;

}
    
    if(billingAddressLine1.length > 200){

    showToast(
        "Address Line 1 is too long.",
        "error"
    );

    billingAddressInput.focus();

    return;

}

if(billingAddressLine2.length > 200){

    showToast(
        "Address Line 2 is too long.",
        "error"
    );

    billingAddressLine2Input.focus();

    return;

}

if(billingCityStateZip.length > 200){

    showToast(
        "City, State / ZIP is too long.",
        "error"
    );

    billingCityStateZipInput.focus();

    return;

}

if(billingCountry.length > 100){

    showToast(
        "Country name is too long.",
        "error"
    );

    billingCountryInput.focus();

    return;

}
    
    saveClientButton.disabled = true;

    saveClientButton.textContent =
    "Saving...";
    

    try{
        
        showLoader();
        
        let clientImage = null;

if(selectedClientImage){

    clientImage =
    new Parse.File(
        selectedClientImage.name,
        selectedClientImage
    );

    await clientImage.save();

}

let result;

if (isEditingClient) {

    result =
        await Parse.Cloud.run(
            "updateClient",
            {
                clientId:
                    editingClientId,

                contactPerson,

                companyName,

                clientEmail,

                clientPhone,

                clientTaxId,

                billingAddressLine1,

                billingAddressLine2,

                billingCityStateZip,

                billingCountry,

                clientImage,

                status
            }
        );

} else {

    const subscription =
        await Parse.Cloud.run(
            "getCurrentSubscription"
        );

    const clientCount =
        subscription.usage.clients.used;

    const maxClients =
        subscription.usage.clients.maximum;

    if (
        maxClients !== -1 &&
        clientCount >= maxClients
    ) {

        throw new Error(
            "You've reached your client limit. Upgrade your plan."
        );

    }

    result =
        await Parse.Cloud.run(
            "createClient",
            {
                contactPerson,

                companyName,

                clientEmail,

                clientPhone,

                clientTaxId,

                billingAddressLine1,

                billingAddressLine2,

                billingCityStateZip,

                billingCountry,

                clientImage,

                status
            }
        );

}

        showToast(
    result.message,
    "success"
);

        closeCreateClientModal();

       await loadClients();

    }

    catch(error){
        
        showLoader();

        showToast(
    error.message,
    "error"
);
    }

    finally{
        
        hideLoader();

        saveClientButton.disabled =
        false;

        saveClientButton.textContent =
isEditingClient
? "Update Client"
: "Save Client";

    }

});

previousPageButton.addEventListener(
"click",
()=>{

    if(currentPage > 1){

        currentPage--;

        loadClients();

    }

});

nextPageButton.addEventListener(
"click",
()=>{

    if(currentPage < totalPages){

        currentPage++;

        loadClients();

    }

});

closeViewClientButton.addEventListener(
"click",
closeViewClientModal
);

closeViewClientFooterButton.addEventListener(
"click",
closeViewClientModal
);

viewClientOverlay.addEventListener(
"click",
closeViewClientModal
);

editViewedClientButton.addEventListener(
"click",
()=>{

    closeViewClientModal();

    openEditClientModal(

        editViewedClientButton.dataset.id

    );

});

confirmDeleteClient.addEventListener(
    "click",
    async () => {

        if (!clientToDelete) {
            return;
        }

        confirmDeleteClient.disabled = true;

        try {

            showLoader();

            const result =
                await Parse.Cloud.run(
                    "deleteClient",
                    {
                        clientId:
                            clientToDelete
                    }
                );

            showToast(
                result.message,
                "success"
            );

            closeDeleteClientModal();

            await loadClients();

        }

        catch(error) {

            showToast(
                error.message,
                "error"
            );

        }

        finally {

            hideLoader();

            confirmDeleteClient.disabled =
                false;

        }

    }
);

clientImageInput.addEventListener(
    "change",
    () => {

        const file =
        clientImageInput.files[0];

        if (!file) {

            selectedClientImage = null;

            resetClientImagePreview();

            return;

        }

        if (!file.type.startsWith("image/")) {

            showToast(
                "Please select a valid image.",
                "error"
            );

            clientImageInput.value = "";

            selectedClientImage = null;

            resetClientImagePreview();

            return;

        }

        if (file.size > 5 * 1024 * 1024) {

            showToast(
                "Client image must be 5MB or smaller.",
                "error"
            );

            clientImageInput.value = "";

            selectedClientImage = null;

            resetClientImagePreview();

            return;

        }

        selectedClientImage = file;

        const reader =
        new FileReader();

        reader.onload = function(event){

            clientImagePreview.innerHTML = `

                <img
                src="${event.target.result}"
                alt="Client Image">

            `;

        };

        reader.readAsDataURL(file);

    }
);

document.addEventListener(
    "click",
    function(event){

        const sendButton =
            event.target.closest(
                ".send-client-estimate-button"
            );

        if(!sendButton){
            return;
        }

        const estimateId =
            sendButton.dataset.id;

        if(!estimateId){

            showToast(
                "Estimate ID is missing.",
                "error"
            );

            return;
        }

        openSendEstimateModal(
            estimateId
        );

    }
);

document.addEventListener(
    "keydown",
    function(event){

        if(
            event.key !== "Escape"
        ){

            return;

        }

        const modal =
            document.getElementById(
                "sendInvoiceModal"
            );

        if(
            modal &&
            modal.classList.contains(
                "show"
            )
        ){

            closeSendInvoiceModal();

        }

    }
);

document.addEventListener(
    "click",
    function(event){

        if(
            event.target.closest(
                "#closeSendInvoiceButton"
            )
        ){

            closeSendInvoiceModal();

            return;

        }

        if(
            event.target.closest(
                "#cancelSendInvoiceButton"
            )
        ){

            closeSendInvoiceModal();

            return;

        }

        if(
            event.target.closest(
                "#sendInvoiceOverlay"
            )
        ){

            closeSendInvoiceModal();

            return;

        }

        const confirmButton =
            event.target.closest(
                "#confirmSendInvoiceButton"
            );

        if(confirmButton){

            sendInvoiceToClient(
                confirmButton
            );

        }

    }
);

document.addEventListener(
    "click",
    function(event){

        const sendButton =
            event.target.closest(
                ".send-client-invoice-button"
            );

        if(!sendButton){
            return;
        }

        const invoiceId =
            sendButton.dataset.id;

        if(!invoiceId){

            showToast(
                "Invoice ID is missing.",
                "error"
            );

            return;
        }

        openSendInvoiceModal(
            invoiceId
        );

    }
);

document.addEventListener(
"keydown",
(event)=>{

    if(event.key === "Escape"){

        if(createClientModal.classList.contains("show")){

            closeCreateClientModal();

        }

        if(deleteClientModal.classList.contains("show")){

            closeDeleteClientModal();

        }

    }

});

document.addEventListener(
"keydown",
(event)=>{

    if(event.ctrlKey && event.key.toLowerCase() === "n"){

        event.preventDefault();

        openCreateClientModal();

    }

});

[
    contactPersonInput,
    companyNameInput,
    clientEmailInput,
    clientPhoneInput,
    clientTaxIdInput
].forEach(input=>{

    input.addEventListener(
    "keydown",
    (event)=>{

        if(event.key === "Enter"){

            event.preventDefault();

            saveClientButton.click();

        }

    });

});

[
    pageOneButton,
    pageTwoButton,
    pageThreeButton
].forEach(button=>{

    button.addEventListener(
    "click",
    ()=>{

        currentPage =
        Number(button.textContent);

        loadClients();

    });

});

    loadClientImageSetting()

    loadClients();
    
    loadNotificationCount();
    
    registerSendEstimateListeners();
    
    