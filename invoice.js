let invoices = [];
let currentPage = 1;
let totalPages = 1;
let totalRecords = 0;
const pageLimit = 10;
let invoiceSearchTimeout;
let editingInvoice = false;
let editingInvoiceId = null;
let selectedInvoice = null;
let selectedInvoiceClient = null;
let selectedInvoiceItems = [];
let invoiceCurrencyCode = "";
let invoiceCurrencySymbol = "$";
let invoicePaymentDetails = {};
let showClientImage = true;
let currentSubscriptionSettings = null;
let invoiceClientSearchTimer =
    null;
const DEFAULT_PROFILE_IMAGE = "logo.png";

const totalInvoicesCount =
    document.getElementById("totalInvoicesCount");

const totalInvoicesGrowth =
    document.getElementById("totalInvoicesGrowth");

const draftInvoicesCount =
    document.getElementById("draftInvoicesCount");

const draftInvoicesGrowth =
    document.getElementById("draftInvoicesGrowth");

const paidInvoicesCount =
    document.getElementById("paidInvoicesCount");

const paidInvoicesGrowth =
    document.getElementById("paidInvoicesGrowth");

const pendingInvoicesCount =
    document.getElementById("pendingInvoicesCount");

const pendingInvoicesGrowth =
    document.getElementById("pendingInvoicesGrowth");

const overdueInvoicesCount =
    document.getElementById("overdueInvoicesCount");

const overdueInvoicesGrowth =
    document.getElementById("overdueInvoicesGrowth");

const filterInvoicesBtn =
    document.getElementById("filterInvoicesBtn");

const exportInvoicesBtn =
    document.getElementById("exportInvoicesBtn");
    
const userFullName = document.getElementById("profileName");
    
const closeInvoicePreviewBtn =
    document.getElementById(
        "closeInvoicePreviewBtn"
    );
    
const previewBusinessName =
    document.getElementById("previewBusinessName");
    
const invoiceTableSearch =
    document.getElementById("invoiceTableSearch");

const statusFilter =
    document.getElementById("statusFilter");

const dateFilter =
    document.getElementById("dateFilter");

const sortFilter =
    document.getElementById("sortFilter");
    
const invoicePreviewOverlay =
    document.getElementById("invoicePreviewOverlay");

const invoicePreviewModal =
    document.getElementById("invoicePreviewModal");

const createInvoiceButton =
    document.getElementById("createInvoiceButton");

const invoiceTableBody =
    document.getElementById("invoiceTableBody");

const statusDropdown =
    document.getElementById("statusDropdown");

const emptyInvoiceState =
    document.getElementById("emptyInvoiceState");

const emptyCreateInvoiceBtn =
    document.getElementById("emptyCreateInvoiceBtn");

const paginationStart =
    document.getElementById("paginationStart");

const paginationEnd =
    document.getElementById("paginationEnd");

const paginationTotal =
    document.getElementById("paginationTotal");

const previousPageBtn =
    document.getElementById("previousPageBtn");

const paginationPages =
    document.getElementById("paginationPages");

const nextPageBtn =
    document.getElementById("nextPageBtn");

const createInvoiceOverlay =
    document.getElementById("createInvoiceOverlay");

const createInvoiceModal =
    document.getElementById("createInvoiceModal");

const closeCreateInvoiceButton =
    document.getElementById("closeCreateInvoiceButton");

const invoiceIdInput =
    document.getElementById("invoiceIdInput");

const invoiceTitleInput =
    document.getElementById("invoiceTitleInput");

const invoiceProjectNameInput =
    document.getElementById("invoiceProjectNameInput");

const invoiceReferenceNumberInput =
    document.getElementById("invoiceReferenceNumberInput");

const invoicePurchaseOrderInput =
    document.getElementById("invoicePurchaseOrderInput");

const invoiceNumberInput =
    document.getElementById("invoiceNumberInput");

const invoiceCurrencyInput =
    document.getElementById("invoiceCurrencyInput");

const invoiceClientInput =
    document.getElementById("invoiceClientInput");
    
const invoiceClientPicker =
    document.getElementById(
        "invoiceClientPicker"
    );

const invoiceClientPickerTrigger =
    document.getElementById(
        "invoiceClientPickerTrigger"
    );

const invoiceClientPickerSelected =
    document.getElementById(
        "invoiceClientPickerSelected"
    );

const invoiceClientPickerSearch =
    document.getElementById(
        "invoiceClientPickerSearch"
    );

const invoiceClientPickerOptions =
    document.getElementById(
        "invoiceClientPickerOptions"
    );

const invoiceIssueDateInput =
    document.getElementById("invoiceIssueDateInput");

const invoiceDueDateInput =
    document.getElementById("invoiceDueDateInput");

const invoicePaymentTermsInput =
    document.getElementById("invoicePaymentTermsInput");

const addInvoiceItemButton =
    document.getElementById("addInvoiceItemButton");

const invoiceItemsContainer =
    document.getElementById("invoiceItemsContainer");

const invoiceTaxInput =
    document.getElementById("invoiceTaxInput");

const invoiceDiscountInput =
    document.getElementById("invoiceDiscountInput");

const invoiceShippingInput =
    document.getElementById("invoiceShippingInput");

const invoiceSubtotal =
    document.getElementById("invoiceSubtotal");

const invoiceGrandTotal =
    document.getElementById("invoiceGrandTotal");

const invoicePaymentStatusInput =
    document.getElementById("invoicePaymentStatusInput");

const paymentAccountName =
    document.getElementById("paymentAccountName");

const paymentBankName =
    document.getElementById("paymentBankName");

const paymentProvider =
    document.getElementById("paymentProvider");

const paymentMethod =
    document.getElementById("paymentMethod");

const paymentAccountNumber =
    document.getElementById("paymentAccountNumber");

const paymentReference =
    document.getElementById("paymentReference");
    
const profileImage = document.getElementById("profileImage");

const paymentDueDays =
    document.getElementById("paymentDueDays");

const paymentInstructions =
    document.getElementById("paymentInstructions");

const invoicePaymentStatusSelect =
    document.getElementById("invoicePaymentStatusSelect");

const invoiceNotesInput =
    document.getElementById("invoiceNotesInput");

const invoiceTermsInput =
    document.getElementById("invoiceTermsInput");

const invoiceSignatureNameInput =
    document.getElementById("invoiceSignatureNameInput");

const invoiceSignatureTitleInput =
    document.getElementById("invoiceSignatureTitleInput");

const invoiceSignatureImageInput =
    document.getElementById("invoiceSignatureImageInput");

const invoiceSignaturePreview =
    document.getElementById("invoiceSignaturePreview");

const cancelInvoiceButton =
    document.getElementById("cancelInvoiceBtn");

const saveInvoiceDraftButton =
    document.getElementById("saveInvoiceDraftButton");

const saveInvoiceButton =
    document.getElementById("saveInvoiceButton");

const invoicePreviewCard =
    document.getElementById("invoicePreviewCard");

const refreshPreviewBtn =
    document.getElementById("refreshPreviewBtn");

const printPreviewBtn =
    document.getElementById("printPreviewBtn");

const previewZoomSelect =
    document.getElementById("previewZoomSelect");

const invoicePaper =
    document.getElementById("invoicePaper");

const previewCompanyLogo =
    document.getElementById("previewCompanyLogo");

const invoiceCompanyName =
    document.getElementById("invoiceCompanyName");

const previewBusinessAddress1 =
    document.getElementById("previewBusinessAddress1");

const previewBusinessAddress2 =
    document.getElementById("previewBusinessAddress2");

const previewBusinessPhone =
    document.getElementById("previewBusinessPhone");

const previewBusinessEmail =
    document.getElementById("previewBusinessEmail");

const previewBusinessWebsite =
    document.getElementById("previewBusinessWebsite");

const previewInvoiceTitle =
    document.getElementById("previewInvoiceTitle");

const previewInvoiceNumber =
    document.getElementById("previewInvoiceNumber");

const previewInvoiceDate =
    document.getElementById("previewInvoiceDate");

const previewDueDate =
    document.getElementById("previewDueDate");

const previewCustomerName =
    document.getElementById("previewCustomerName");

const previewCustomerCompany =
    document.getElementById("previewCustomerCompany");

const previewCustomerEmail =
    document.getElementById("previewCustomerEmail");

const previewCustomerPhone =
    document.getElementById("previewCustomerPhone");

const previewCustomerAddress1 =
    document.getElementById("previewCustomerAddress1");

const previewCustomerAddress2 =
    document.getElementById("previewCustomerAddress2");

const previewCustomerCity =
    document.getElementById("previewCustomerCity");

const previewCustomerCountry =
    document.getElementById("previewCustomerCountry");

const previewDetailsInvoiceNumber =
    document.getElementById("previewDetailsInvoiceNumber");

const previewDetailsIssueDate =
    document.getElementById("previewDetailsIssueDate");

const previewDetailsDueDate =
    document.getElementById("previewDetailsDueDate");

const previewInvoiceStatus =
    document.getElementById("previewInvoiceStatus");

const previewPaymentTerms =
    document.getElementById("previewPaymentTerms");

const previewCurrency =
    document.getElementById("previewCurrency");

const previewPurchaseOrder =
    document.getElementById("previewPurchaseOrder");

const previewReference =
    document.getElementById("previewReference");

const previewProjectName =
    document.getElementById("previewProjectName");

const previewItemsBody =
    document.getElementById("previewItemsBody");

const previewSubtotal =
    document.getElementById("previewSubtotal");

const previewDiscount =
    document.getElementById("previewDiscount");

const previewTax =
    document.getElementById("previewTax");

const previewShipping =
    document.getElementById("previewShipping");

const previewGrandTotal =
    document.getElementById("previewGrandTotal");

const previewDiscountRow =
    document.getElementById("previewDiscountRow");

const previewTaxRow =
    document.getElementById("previewTaxRow");

const previewShippingRow =
    document.getElementById("previewShippingRow");

const previewPaymentAccountName =
    document.getElementById("previewPaymentAccountName");

const previewPaymentBankName =
    document.getElementById("previewPaymentBankName");

const previewPaymentAccountNumber =
    document.getElementById("previewPaymentAccountNumber");

const previewPaymentProvider =
    document.getElementById("previewPaymentProvider");

const previewNotesSection =
    document.getElementById("previewNotesSection");

const previewNoteLine1 =
    document.getElementById("previewNoteLine1");

const previewTermsSection =
    document.getElementById("previewTermsSection");

const previewTerms =
    document.getElementById("previewTerms");

const previewSignatureName =
    document.getElementById("previewSignatureName");

const previewSignatureTitle =
    document.getElementById("previewSignatureTitle");

const previewSignatureImage =
    document.getElementById("previewSignatureImage");

const cancelInvoiceBtn =
    document.getElementById("cancelInvoiceButton");

const saveDraftBtn =
    document.getElementById("saveDraftBtn");

const downloadPdfBtn =
    document.getElementById("downloadPdfButton");

const sendInvoiceBtn =
    document.getElementById("sendInvoiceButton");

const saveInvoiceBtn =
    document.getElementById("saveInvoiceButton");

const pageLoadingOverlay =
    document.getElementById("pageLoadingOverlay");

const invoiceResultOverlay =
    document.getElementById("invoiceResultOverlay");

const invoiceResultTitle =
    document.getElementById("invoiceResultTitle");

const invoiceResultMessage =
    document.getElementById("invoiceResultMessage");

const invoiceResultButton =
    document.getElementById("invoiceResultButton");

const toastContainer =
    document.getElementById("toastContainer");

const profileMenuButton =
    document.getElementById("profileMenuButton");

const profileDropdown =
    document.getElementById("profileDropdown");

const createInvoiceTitle =
    document.getElementById("createInvoiceTitle");

const createInvoiceSubtitle =
    document.getElementById("createInvoiceSubtitle");
    
const invoiceExportWrapper =
    document.getElementById("invoiceExportWrapper");

const invoiceExportMenu =
    document.getElementById("invoiceExportMenu");

const exportInvoicesPdfBtn =
    document.getElementById("exportInvoicesPdfBtn");

const previewStatusBadge =
    document.getElementById("previewStatusBadge");
    
const invoiceLimitOverlay =
    document.getElementById("invoiceLimitOverlay");

const invoiceLimitModal =
    document.getElementById("invoiceLimitModal");

const invoiceLimitTitle =
    document.getElementById("invoiceLimitTitle");

const invoiceLimitMessage =
    document.getElementById("invoiceLimitMessage");

const invoiceLimitButton =
    document.getElementById("invoiceLimitButton");
    
const invoicePreviewState = {
    userProfile: null,
    initialized: false };

async function loadInvoiceStatistics() {
    try {
        const result =
            await Parse.Cloud.run(
                "getInvoiceStatistics"
            );

        totalInvoicesCount.textContent =
            result.totalInvoices || 0;

        draftInvoicesCount.textContent =
            result.draftInvoices || 0;

        paidInvoicesCount.textContent =
            result.paidInvoices || 0;

        pendingInvoicesCount.textContent =
            result.pendingInvoices || 0;

        overdueInvoicesCount.textContent =
            result.overdueInvoices || 0;

        totalInvoicesGrowth.textContent =
            `${Number(result.totalGrowth || 0).toFixed(1)}%`;

        draftInvoicesGrowth.textContent =
            `${Number(result.draftGrowth || 0).toFixed(1)}%`;

        paidInvoicesGrowth.textContent =
            `${Number(result.paidGrowth || 0).toFixed(1)}%`;

        pendingInvoicesGrowth.textContent =
            `${Number(result.pendingGrowth || 0).toFixed(1)}%`;

        overdueInvoicesGrowth.textContent =
            `${Number(result.overdueGrowth || 0).toFixed(1)}%`;
    } catch (error) {
        console.error(
            "Invoice Statistics Error:",
            error
        );
        showToast(
    "Unable to load invoice statistics.",
    "error"
);
    }
}

async function loadInvoices() {
    try {
        const result = await Parse.Cloud.run(
            "getInvoices",
            {
                page: currentPage,
                limit: pageLimit,
                search: invoiceTableSearch.value.trim(),
                status: statusFilter.value,
                date: dateFilter.value,
                sort: sortFilter.value
            }
        );

        invoices = result.invoices || [];
        totalPages = result.totalPages || 1;
        totalRecords = result.totalRecords || 0;

        await Promise.all(
            invoices.map(
                async invoice => {
                    if (
                        invoice?.clientImageUrl ||
                        !invoice?.objectId
                    ) {
                        return;
                    }

                    try {
                        const details =
                            await Parse.Cloud.run(
                                "getInvoiceDetails",
                                {
                                    invoiceId:
                                        invoice.objectId
                                }
                            );

                        if (
                            details?.client?.clientImageUrl
                        ) {
                            invoice.clientImageUrl =
                                details.client.clientImageUrl;
                        }
                    } catch (error) {
                        console.warn(
                            "Unable to load invoice client image:",
                            error
                        );
                    }
                }
            )
        );

        renderInvoiceTable();
        updateInvoiceTableState();
    } catch (error) {
        console.error(
            "Invoice Load Error:",
            error
        );
        showToast(
    "Unable to load invoices.",
    "error"
);

        invoices = [];
        totalPages = 1;
        totalRecords = 0;

        renderInvoiceTable();
        updateInvoiceTableState();
    }
}

function renderInvoiceTable() {
    invoiceTableBody.innerHTML = "";

    if (!invoices.length) {
        return;
    }

    invoices.forEach(invoice => {
        const row = document.createElement("tr");

        const status =
            invoice.status || "Draft";

        const statusClass =
            status.toLowerCase();

        const clientName =
            invoice.companyName ||
            invoice.contactPerson ||
            "No client";

        const clientInitials =
            getInvoiceClientInitials(
                clientName
            );

        const clientImageUrl =
            invoice.clientImageUrl || "";

const clientAvatar =
    showClientImage
        ? (
            clientImageUrl
                ? `
                    <img
                        src="${escapeInvoiceHtml(clientImageUrl)}"
                        class="client-table-avatar"
                        alt="${escapeInvoiceHtml(clientName)}"
                    >
                `
                : `
                    <div
                        class="client-table-avatar client-table-initials"
                    >
                        ${clientInitials}
                    </div>
                `
        )
        : "";

        const currencySymbol =
            invoice.currencySymbol || "$";

        const totalAmount =
            Number(invoice.totalAmount) || 0;

        row.innerHTML = `
            <td>
                <div class="invoice-number-cell">
                    <strong>
                        ${escapeInvoiceHtml(
                            invoice.invoiceNumber ||
                            "—"
                        )}
                    </strong>
                    ${
                        invoice.invoiceTitle
                            ? `
                            <span>
                                ${escapeInvoiceHtml(
                                    invoice.invoiceTitle
                                )}
                            </span>
                            `
                            : ""
                    }
                </div>
            </td>

           <td>
    <div class="client-table-info">
        ${clientAvatar}

        <div class="client-table-details">
                        <span>
                            ${escapeInvoiceHtml(
                                clientName
                            )}
                        </span>

                        ${
                            invoice.clientEmail
                                ? `
                                <small>
                                    ${escapeInvoiceHtml(
                                        invoice.clientEmail
                                    )}
                                </small>
                                `
                                : ""
                        }
                    </div>
                </div>
            </td>

            <td>
                ${currencySymbol}${totalAmount.toLocaleString(
                    undefined,
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }
                )}
            </td>

            <td>
    <span
        class="status-badge ${statusClass}"
        data-invoice-id="${invoice.objectId}">
        ${escapeInvoiceHtml(status)}
    </span>
</td>

            <td>
                ${formatInvoiceDate(
                    invoice.issueDate
                )}
            </td>

            <td>
                ${formatInvoiceDate(
                    invoice.dueDate
                )}
            </td>

            <td>
                <div class="table-actions">
                    <button
                        type="button"
                        class="action-btn view-btn"
                        data-invoice-id="${invoice.objectId}"
                        title="View">
                        <i class="ri-eye-line"></i>
                    </button>

                    <button
                        type="button"
                        class="action-btn edit-btn"
                        data-invoice-id="${invoice.objectId}"
                        title="Edit">
                        <i class="ri-edit-line"></i>
                    </button>
                    
                    <button
    type="button"
    class="action-btn duplicate-btn"
    data-invoice-id="${invoice.objectId}"
    title="Duplicate">
    <i class="ri-file-copy-line"></i>
</button>

                    <button
                        type="button"
                        class="action-btn delete-btn"
                        data-invoice-id="${invoice.objectId}"
                        title="Delete">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>
            </td>
        `;

        invoiceTableBody.appendChild(row);
    });
}

function updateInvoiceTableState() {
    const hasInvoices =
        invoices.length > 0;

    if (hasInvoices) {
        emptyInvoiceState.style.display =
            "none";
    } else {
        emptyInvoiceState.style.display =
            "flex";
    }

    const start =
        totalRecords === 0
            ? 0
            : (
                (currentPage - 1) *
                pageLimit
            ) + 1;

    const end =
        totalRecords === 0
            ? 0
            : Math.min(
                currentPage * pageLimit,
                totalRecords
            );

    paginationStart.textContent =
        start;

    paginationEnd.textContent =
        end;

    paginationTotal.textContent =
        totalRecords;

    renderInvoicePagination();
}

function getInvoiceClientInitials(name) {
    const value =
        (name || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (!value.length) {
        return "?";
    }

    if (value.length === 1) {
        return value[0]
            .substring(0, 2)
            .toUpperCase();
    }

    return (
        value[0][0] +
        value[value.length - 1][0]
    ).toUpperCase();
}

function formatInvoiceDate(value) {
    if (!value) {
        return "—";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "—";
    }

    return date.toLocaleDateString(
        undefined,
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}

function escapeInvoiceHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function applyInvoiceFilters() {
    currentPage = 1;
    loadInvoices();
}

function initializeInvoiceSearchFilterSort() {
    invoiceTableSearch.addEventListener(
        "input",
        () => {
            clearTimeout(
                invoiceSearchTimeout
            );

            invoiceSearchTimeout =
                setTimeout(() => {
                    currentPage = 1;
                    loadInvoices();
                }, 400);
        }
    );

    statusFilter.addEventListener(
        "change",
        () => {
            currentPage = 1;
            loadInvoices();
        }
    );

    dateFilter.addEventListener(
        "change",
        () => {
            currentPage = 1;
            loadInvoices();
        }
    );

    sortFilter.addEventListener(
        "change",
        () => {
            currentPage = 1;
            loadInvoices();
        }
    );
}

function initializeInvoiceFilterButton() {
    filterInvoicesBtn.addEventListener(
        "click",
        () => {
            statusFilter.focus();
        }
    );
}

function initializeInvoicePagination() {
    previousPageBtn.addEventListener(
        "click",
        () => {
            if (currentPage <= 1) {
                return;
            }

            currentPage--;
            loadInvoices();
        }
    );

    nextPageBtn.addEventListener(
        "click",
        () => {
            if (currentPage >= totalPages) {
                return;
            }

            currentPage++;
            loadInvoices();
        }
    );
}

function renderInvoicePagination() {
    paginationPages.innerHTML = "";

    if (totalPages <= 1) {
        previousPageBtn.disabled = true;
        nextPageBtn.disabled = true;
        return;
    }

    previousPageBtn.disabled =
        currentPage <= 1;

    nextPageBtn.disabled =
        currentPage >= totalPages;

    const pages = getInvoicePaginationPages();

    pages.forEach(page => {
        if (page === "...") {
            const span =
                document.createElement("span");

            span.className =
                "pagination-ellipsis";

            span.textContent = "...";

            paginationPages.appendChild(span);

            return;
        }

        const button =
            document.createElement("button");

        button.type = "button";
        button.className =
            "pagination-page";

        if (page === currentPage) {
            button.classList.add("active");
        }

        button.textContent = page;

        button.addEventListener(
            "click",
            () => {
                if (page === currentPage) {
                    return;
                }

                currentPage = page;
                loadInvoices();
            }
        );

        paginationPages.appendChild(button);
    });
}

function getInvoicePaginationPages() {
    if (totalPages <= 7) {
        return Array.from(
            {
                length: totalPages
            },
            (_, index) => index + 1
        );
    }

    const pages = [1];

    if (currentPage > 4) {
        pages.push("...");
    }

    const start =
        Math.max(
            2,
            currentPage - 1
        );

    const end =
        Math.min(
            totalPages - 1,
            currentPage + 1
        );

    for (
        let page = start;
        page <= end;
        page++
    ) {
        pages.push(page);
    }

    if (
        currentPage <
        totalPages - 3
    ) {
        pages.push("...");
    }

    pages.push(totalPages);

    return pages;
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

    } catch (error) {

        console.error(
            "Business Profile Settings Error:",
            error
        );

        showClientImage = true;

    }

}

async function openCreateInvoiceModal() {
    editingInvoice = false;
    editingInvoiceId = null;
    selectedInvoice = null;
    selectedInvoiceClient = null;
    selectedInvoiceItems = [];
    invoicePaymentDetails = {};

    resetInvoiceModal();

    createInvoiceTitle.textContent =
        "Create Invoice";

    createInvoiceSubtitle.textContent =
        "Create a professional invoice for your client.";

    createInvoiceModal.classList.add(
    "show"
);

createInvoiceOverlay.classList.add(
    "show"
);

    document.body.classList.add(
        "modal-open"
    );

    await loadNextInvoiceNumber();
    await loadInvoicePaymentInformation();
}

function closeCreateInvoiceModal() {
    createInvoiceModal.classList.remove(
        "show"
    );

    createInvoiceOverlay.classList.remove(
        "show"
    );

    document.body.classList.remove(
        "modal-open"
    );
}

async function openEditInvoiceModal(invoiceId) {
    if (!invoiceId) {
        return;
    }

    try {
        editingInvoice = true;
        editingInvoiceId = invoiceId;
        selectedInvoice = null;
        selectedInvoiceClient = null;
        selectedInvoiceItems = [];
        invoicePaymentDetails = {};

        resetInvoiceModal();

        createInvoiceTitle.textContent =
            "Edit Invoice";

        createInvoiceSubtitle.textContent =
            "Update the invoice details for your client.";

        createInvoiceModal.classList.add(
            "show"
        );

        createInvoiceOverlay.classList.add(
            "show"
        );

        document.body.classList.add(
            "modal-open"
        );

        const result =
            await Parse.Cloud.run(
                "getInvoiceDetails",
                {
                    invoiceId
                }
            );

        if (
            !result ||
            !result.invoice
        ) {
            throw new Error(
                result?.message ||
                "Unable to load invoice."
            );
        }

        const invoice =
            result.invoice;

        invoice.items =
            (result.items || []).map(
                item => ({
                    objectId:
                        item.objectId || "",

                    name:
                        item.description || "",

                    quantity:
                        item.quantity ?? 1,

                    rate:
                        item.unitPrice ?? 0,

                    total:
                        item.total ?? 0
                })
            );

        selectedInvoice =
            invoice;

        await populateInvoiceForm(
    invoice,
    result.client
);

        await loadInvoicePaymentInformation();

        updateInvoicePreview();

    } catch (error) {
        console.error(
            "Edit Invoice Error:",
            error
        );

        closeCreateInvoiceModal();

        showToast(
            error.message ||
            "Unable to load invoice for editing.",
            "error"
        );
    }
}

async function populateInvoiceForm(
    invoice,
    client
) {
    invoiceIdInput.value =
        invoice.objectId || "";

    invoiceTitleInput.value =
        invoice.invoiceTitle || "";

    invoiceProjectNameInput.value =
        invoice.projectName || "";

    invoiceReferenceNumberInput.value =
        invoice.referenceNumber || "";

    invoicePurchaseOrderInput.value =
        invoice.purchaseOrderNumber ||
        invoice.purchaseOrder ||
        "";

    invoiceNumberInput.value =
        invoice.invoiceNumber || "";

    invoiceIssueDateInput.value =
        formatInvoiceDateInput(
            new Date(invoice.issueDate)
        );

    invoiceDueDateInput.value =
        formatInvoiceDateInput(
            new Date(invoice.dueDate)
        );

    invoicePaymentTermsInput.value =
        invoice.paymentTerms || "";

    invoiceTaxInput.value =
        invoice.taxPercent ?? 0;

    invoiceDiscountInput.value =
        invoice.discount ?? 0;

    invoiceShippingInput.value =
        invoice.shipping ?? 0;

    const status =
        invoice.status || "Pending";

    invoicePaymentStatusInput.value =
        status;

    invoicePaymentStatusSelect.value =
        status;

    invoiceNotesInput.value =
        invoice.notes || "";

    invoiceTermsInput.value =
        invoice.termsConditions ||
        invoice.terms || "";

    invoiceSignatureNameInput.value =
        invoice.signatureName || "";

    invoiceSignatureTitleInput.value =
        invoice.signatureTitle || "";

    invoiceSignatureImageInput.value =
        "";

    const savedSignatureUrl =
        invoice.signatureImage ||
        invoice.signatureImageUrl ||
        "";

    invoiceSignaturePreview.dataset.savedUrl =
        savedSignatureUrl;

    invoiceSignaturePreview.src =
        savedSignatureUrl;

    invoiceSignaturePreview.style.display =
        savedSignatureUrl
            ? "block"
            : "none";

    await selectInvoiceCurrency(
        invoice.currencyCode ||
        invoice.currency ||
        ""
    );

    await loadInvoiceClients();

    selectInvoiceClient(
    invoice.clientId ||
    client?.objectId ||
    invoice.client?.objectId ||
    ""
);

    invoiceItemsContainer.innerHTML =
        "";

    const items =
        Array.isArray(invoice.items)
            ? invoice.items
            : [];

    items.forEach(item => {
        addInvoiceItem();

        const rows =
            invoiceItemsContainer.querySelectorAll(
                ".invoice-item-row"
            );

        const row =
            rows[rows.length - 1];

        row.querySelector(
            ".invoice-item-name"
        ).value =
            item.name || "";

        row.querySelector(
            ".invoice-item-quantity"
        ).value =
            item.quantity ?? 1;

        row.querySelector(
            ".invoice-item-rate"
        ).value =
            item.rate ?? 0;

        updateInvoiceItemRowTotal(
            row
        );
    });

    updateInvoiceDueDateMinimum();

    calculateInvoiceTotals();

    updateInvoicePreview();
}

async function selectInvoiceCurrency(currencyCode) {
    if (!currencyCode) {
        invoiceCurrencyInput.value = "";
        updateInvoiceCurrencyDisplay();
        return;
    }

    const option =
        Array.from(
            invoiceCurrencyInput.options
        ).find(
            option =>
                option.value === currencyCode
        );

    if (option) {
        invoiceCurrencyInput.value =
            currencyCode;

        updateInvoiceCurrencyDisplay();
    }
}

async function viewInvoice(invoiceId) {
    if (!invoiceId) {
        return;
    }

    try {
        const result =
            await Parse.Cloud.run(
                "getInvoiceDetails",
                {
                    invoiceId
                }
            );
        if (
            !result ||
            !result.invoice
        ) {
            throw new Error(
                result?.message ||
                "Unable to load invoice."
            );
        }
        
        if (result.client) {
            result.invoice.clientImageUrl =
                result.client.clientImageUrl || "";
        }

        const invoice =
            result.invoice;

        const items =
            Array.isArray(result.items)
                ? result.items
                : [];

        selectedInvoice =
            invoice;

        selectedInvoiceItems =
            items;

        invoiceIdInput.value =
            invoice.objectId || invoiceId;

        invoiceTitleInput.value =
            invoice.invoiceTitle || "";

        invoiceProjectNameInput.value =
            invoice.projectName || "";

        invoiceReferenceNumberInput.value =
            invoice.referenceNumber || "";

        invoicePurchaseOrderInput.value =
            invoice.purchaseOrder || "";

        invoiceNumberInput.value =
            invoice.invoiceNumber || "";

        invoiceIssueDateInput.value =
            invoice.issueDate
                ? formatInvoiceDateInput(
                    new Date(
                        invoice.issueDate
                    )
                )
                : "";

        invoiceDueDateInput.value =
            invoice.dueDate
                ? formatInvoiceDateInput(
                    new Date(
                        invoice.dueDate
                    )
                )
                : "";

        invoicePaymentTermsInput.value =
            invoice.paymentTerms || "";

        invoicePaymentStatusInput.value =
            invoice.status || "Draft";

        if (
            invoicePaymentStatusSelect
        ) {
            invoicePaymentStatusSelect.value =
                invoice.status || "Draft";
        }

        invoiceTaxInput.value =
            invoice.taxPercent ?? 0;

        invoiceDiscountInput.value =
            invoice.discount ?? 0;

        invoiceShippingInput.value =
            invoice.shipping ?? 0;

        invoiceNotesInput.value =
            invoice.notes || "";

        invoiceTermsInput.value =
            invoice.termsConditions ||
            invoice.terms ||
            "";

        invoiceSignatureNameInput.value =
            invoice.signatureName || "";

        invoiceSignatureTitleInput.value =
            invoice.signatureTitle || "";

        invoicePaymentDetails =
            invoice.paymentDetails || {};

        await selectInvoiceCurrency(
            invoice.currencyCode ||
            invoice.currency ||
            ""
        );

        selectedInvoiceClient = {
            objectId:
                invoice.clientId ||
                invoice.client?.objectId ||
                "",

            contactPerson:
                invoice.contactPerson ||
                invoice.client?.contactPerson ||
                "",

            companyName:
                invoice.companyName ||
                invoice.client?.companyName ||
                "",

            clientEmail:
                invoice.clientEmail ||
                invoice.client?.clientEmail ||
                "",

            clientPhone:
                invoice.clientPhone ||
                invoice.client?.clientPhone ||
                "",

            billingAddressLine1:
                invoice.billingAddressLine1 ||
                invoice.client?.billingAddressLine1 ||
                "",

            billingAddressLine2:
                invoice.billingAddressLine2 ||
                invoice.client?.billingAddressLine2 ||
                "",

            billingCityStateZip:
                invoice.billingCityStateZip ||
                invoice.client?.billingCityStateZip ||
                "",

            billingCountry:
                invoice.billingCountry ||
                invoice.client?.billingCountry ||
                ""
        };

        invoiceClientInput.value =
            selectedInvoiceClient.objectId;
            

        invoiceItemsContainer.innerHTML =
            "";

        items.forEach(item => {
            addInvoiceItem();

            const rows =
                invoiceItemsContainer.querySelectorAll(
                    ".invoice-item-row"
                );

            const row =
                rows[rows.length - 1];

            row.querySelector(
                ".invoice-item-name"
            ).value =
                item.description || "";

            row.querySelector(
                ".invoice-item-quantity"
            ).value =
                item.quantity ?? 1;

            row.querySelector(
                ".invoice-item-rate"
            ).value =
                item.unitPrice ?? 0;

            updateInvoiceItemRowTotal(
                row
            );
        });

        updateInvoiceCurrencyDisplay();

        calculateInvoiceTotals();

        updateInvoicePreview();

openInvoicePreviewModal();

    } catch (error) {
        console.error(
            "View Invoice Error:",
            error
        );

        showToast(
            error.message ||
            "Unable to load invoice preview.",
            "error"
        );
    }
}

async function updateInvoiceStatus(invoiceId, status) {
    if (!invoiceId || !status) {
        return;
    }

    try {
        showLoading();

        const result =
            await Parse.Cloud.run(
                "updateInvoiceStatus",
                {
                    invoiceId,
                    status
                }
            );

        if (
            !result ||
            result.success === false
        ) {
            throw new Error(
                result?.message ||
                "Unable to update invoice status."
            );
        }

        const invoice =
            invoices.find(
                item =>
                    item.objectId ===
                    invoiceId
            );

        if (invoice) {
            invoice.status =
                status;
        }

        await loadInvoices();

        await loadInvoiceStatistics();

        showToast(
            result.message ||
            "Invoice status updated successfully.",
            "success"
        );

    } catch (error) {
        console.error(
            "Update Invoice Status Error:",
            error
        );

        showToast(
            error.message ||
            "Unable to update invoice status.",
            "error"
        );
    } finally {
        hideLoading();
    }
}

function selectInvoiceClient(
    clientId
) {
    
    if (!clientId) {
        
        clearInvoiceClientPicker();
        
        return;
        
    }
    
    if (
        selectedInvoiceClient &&
        selectedInvoiceClient.objectId ===
        clientId
    ) {
        
        invoiceClientInput.value =
            clientId;
        
        invoiceClientPickerSelected.textContent =
            getInvoiceClientDisplayName(
                selectedInvoiceClient
            );
        
        return;
        
    }
    
    invoiceClientInput.value =
        clientId;
    
    invoiceClientPickerSelected.textContent =
        "Selected Client";
    
    loadInvoiceClients(
        ""
    );
    
}

async function deleteInvoice(invoiceId) {
    if (!invoiceId) {
        return;
    }

    const invoice =
        invoices.find(
            item => item.objectId === invoiceId
        );

    if (!invoice) {
        return;
    }

    const confirmed =
        confirm(
            `Are you sure you want to delete invoice ${invoice.invoiceNumber || ""}?`
        );

    if (!confirmed) {
        return;
    }

    try {
        await Parse.Cloud.run(
            "deleteInvoice",
            {
                invoiceId
            }
        );

        invoices =
            invoices.filter(
                item =>
                    item.objectId !==
                    invoiceId
            );

        await loadInvoices();
        await loadInvoiceStatistics();
showToast(
    "Invoice deleted successfully.",
    "success"
);
    } catch (error) {
        console.error(
            "Delete Invoice Error:",
            error
        );
        showToast(
    error.message ||
    "Unable to delete invoice.",
    "error"
);

    }
}

function resetInvoiceModal() {
    invoiceIdInput.value = "";

    invoiceTitleInput.value = "";
    invoiceProjectNameInput.value = "";
    invoiceReferenceNumberInput.value = "";
    invoicePurchaseOrderInput.value = "";
    invoiceNumberInput.value = "";
    invoiceCurrencyInput.value = "";
    clearInvoiceClientPicker();
    const today = formatInvoiceDateInput(new Date());
    invoiceIssueDateInput.value = today;
    invoiceDueDateInput.value = today;
    invoicePaymentTermsInput.value = "";
    invoiceTaxInput.value = "0";
    invoiceDiscountInput.value = "0";
    invoiceShippingInput.value = "0";
    invoiceItemsContainer.innerHTML = "";
    invoicePaymentStatusInput.value = "Pending";
    invoicePaymentStatusSelect.value = "Pending";
    invoiceNotesInput.value = "";
    invoiceTermsInput.value = "";
    invoiceSignatureNameInput.value = "";
    invoiceSignatureTitleInput.value = "";
    invoiceSignatureImageInput.value = "";
    invoiceSignaturePreview.src = "";
    invoiceSignaturePreview.style.display = "none";
    invoiceSignaturePreview.removeAttribute("data-saved-url");
    invoiceSubtotal.textContent = "0.00";
    invoiceGrandTotal.textContent = "0.00";
    invoicePaymentDetails = {};
    saveInvoiceDraftButton.disabled = false;
    saveInvoiceButton.disabled = false;
}

async function loadNextInvoiceNumber() {
    try {
        const result =
            await Parse.Cloud.run(
                "getNextInvoiceNumber"
            );

        if (
            result &&
            result.success &&
            result.invoiceNumber
        ) {
            invoiceNumberInput.value =
                result.invoiceNumber;
        }
    } catch (error) {
        console.error(
            "Invoice Number Error:",
            error
        );
    }
}

async function loadInvoicePaymentInformation() {
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
            invoicePaymentDetails = {};

            displayInvoicePaymentInformation(
                {}
            );

            return;
        }

        const paymentDetails =
            response.profile.paymentDetails || {};

        invoicePaymentDetails = {
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

        displayInvoicePaymentInformation(
            invoicePaymentDetails
        );
    } catch (error) {
        console.error(
            "Invoice Payment Information Error:",
            error
        );
        showToast(
    "Unable to load payment information.",
    "error"
);

        invoicePaymentDetails = {};

        displayInvoicePaymentInformation(
            {}
        );
    }
}

function initializeCreateInvoiceModal() {
    createInvoiceButton.addEventListener(
        "click",
        openCreateInvoiceModal
    );

    emptyCreateInvoiceBtn.addEventListener(
        "click",
        openCreateInvoiceModal
    );

    closeCreateInvoiceButton.addEventListener(
        "click",
        closeCreateInvoiceModal
    );

    cancelInvoiceButton.addEventListener(
        "click",
        closeCreateInvoiceModal
    );

    createInvoiceOverlay.addEventListener(
        "click",
        closeCreateInvoiceModal
    );
    
    initializeInvoiceSaveWorkflow();
}

function initializeInvoiceForm() {
    loadInvoiceCurrencies();
    initializeInvoiceDates();
    initializeInvoicePaymentTerms();
    initializeInvoiceSignature();
    initializeInvoiceStatusFields();

    invoiceCurrencyInput.addEventListener(
        "change",
        updateInvoiceCurrencyDisplay
    );
}

function loadInvoiceCurrencies() {
    invoiceCurrencyInput.innerHTML = `
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

                option.value = code;

                option.textContent =
                    `${code} ${currency.symbol}`;

                option.dataset.symbol =
                    currency.symbol;

                invoiceCurrencyInput.appendChild(
                    option
                );
            }
        );
}

function initializeInvoiceDates() {
    const today =
        formatInvoiceDateInput(
            new Date()
        );

    invoiceIssueDateInput.value =
        today;

    invoiceDueDateInput.value =
        today;

    invoiceIssueDateInput.addEventListener(
        "change",
        updateInvoiceDueDateMinimum
    );

    updateInvoiceDueDateMinimum();
}

function updateInvoiceDueDateMinimum() {
    if (!invoiceIssueDateInput.value) {
        invoiceDueDateInput.removeAttribute(
            "min"
        );

        return;
    }

    invoiceDueDateInput.min =
        invoiceIssueDateInput.value;

    if (
        invoiceDueDateInput.value &&
        invoiceDueDateInput.value <
            invoiceIssueDateInput.value
    ) {
        invoiceDueDateInput.value =
            invoiceIssueDateInput.value;
    }
}

function initializeInvoicePaymentTerms() {
    invoicePaymentTermsInput.addEventListener(
        "change",
        updateInvoiceDueDateFromTerms
    );
}

function updateInvoiceDueDateFromTerms() {
    const terms =
        invoicePaymentTermsInput.value;

    if (!terms) {
        return;
    }

    if (
        !invoiceIssueDateInput.value
    ) {
        invoiceIssueDateInput.value =
            formatInvoiceDateInput(
                new Date()
            );
    }

    const issueDate =
        new Date(
            `${invoiceIssueDateInput.value}T00:00:00`
        );

    let daysToAdd = 0;

    if (terms === "Net 7") {
        daysToAdd = 7;
    }

    if (terms === "Net 14") {
        daysToAdd = 14;
    }

    if (terms === "Net 30") {
        daysToAdd = 30;
    }

    if (terms === "Net 60") {
        daysToAdd = 60;
    }

    const dueDate =
        new Date(issueDate);

    dueDate.setDate(
        dueDate.getDate() +
        daysToAdd
    );

    invoiceDueDateInput.value =
        formatInvoiceDateInput(
            dueDate
        );

    updateInvoiceDueDateMinimum();
}

function initializeInvoiceSignature() {
    invoiceSignatureImageInput.addEventListener(
        "change",
        handleInvoiceSignatureChange
    );
}

function handleInvoiceSignatureChange() {
    const file =
        invoiceSignatureImageInput.files?.[0];

    if (!file) {
        const savedSignatureUrl =
            invoiceSignaturePreview.dataset.savedUrl ||
            "";

        invoiceSignaturePreview.src =
            savedSignatureUrl;
        invoiceSignaturePreview.style.display =
            savedSignatureUrl
                ? "block"
                : "none";

        updateInvoicePreview();

        return;
    }

    const reader =
        new FileReader();

    reader.onload = event => {
        invoiceSignaturePreview.src =
            event.target.result;

        invoiceSignaturePreview.style.display =
            "block";
        updateInvoicePreview();
    };

    reader.readAsDataURL(file);
}

function initializeInvoiceStatusFields() {
    const allowedStatuses = [
        "Draft",
        "Pending",
        "Paid",
        "Overdue",
        "Cancelled"
    ];

    [
        invoicePaymentStatusInput,
        invoicePaymentStatusSelect
    ].forEach(select => {
        if (!select) {
            return;
        }

        Array.from(select.options).forEach(option => {
            if (!allowedStatuses.includes(option.value)) {
                option.remove();
            }
        });

        const currentValue = select.value;

        if (!allowedStatuses.includes(currentValue)) {
            select.value = "Pending";
        }
    });

    const synchronizeStatus = value => {
        const status = allowedStatuses.includes(value)
            ? value
            : "Pending";

        if (invoicePaymentStatusInput) {
            invoicePaymentStatusInput.value = status;
        }

        if (invoicePaymentStatusSelect) {
            invoicePaymentStatusSelect.value = status;
        }
    };

    if (invoicePaymentStatusSelect) {
        invoicePaymentStatusSelect.addEventListener(
            "change",
            () => {
                synchronizeStatus(
                    invoicePaymentStatusSelect.value
                );
            }
        );
    }

    if (invoicePaymentStatusInput) {
        invoicePaymentStatusInput.addEventListener(
            "change",
            () => {
                synchronizeStatus(
                    invoicePaymentStatusInput.value
                );
            }
        );
    }

    synchronizeStatus(
        invoicePaymentStatusSelect?.value ||
        invoicePaymentStatusInput?.value ||
        "Pending"
    );
}

function formatInvoiceDateInput(date) {
    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function validateInvoiceForm() {
    const clientId =
        invoiceClientInput.value;

    const issueDate =
        invoiceIssueDateInput.value;

    const dueDate =
        invoiceDueDateInput.value;

    const currencyCode =
        invoiceCurrencyInput.value;

    if (!clientId) {
        return {
            valid: false,
            message:
                "Please select a client."
        };
    }

    if (!issueDate) {
        return {
            valid: false,
            message:
                "Issue date is required."
        };
    }

    if (!dueDate) {
        return {
            valid: false,
            message:
                "Due date is required."
        };
    }

    if (
        new Date(dueDate) <
        new Date(issueDate)
    ) {
        return {
            valid: false,
            message:
                "Due date cannot be before the issue date."
        };
    }

    if (!currencyCode) {
        return {
            valid: false,
            message:
                "Please select the invoice currency."
        };
    }

    return {
        valid: true
    };
}

function initializeInvoiceClientSelection() {

    initializeInvoiceClientPicker();

}

function handleInvoiceClientSelection() {

    const clientId =
        invoiceClientInput.value;

    if (!clientId) {

        clearInvoiceClientPicker();

        return;

    }

    loadInvoiceClients(
        ""
    );

}

function updateInvoiceClientPreview(
    client
) {
    previewCustomerName.textContent =
        client.contactPerson ||
        "Client Name";

    previewCustomerCompany.textContent =
        client.companyName ||
        "Company Name";

    previewCustomerEmail.textContent =
        client.clientEmail ||
        "Client Email";

    previewCustomerPhone.textContent =
        client.clientPhone ||
        "Client Phone";
}

function clearInvoiceClientPreview() {
    setInvoicePreviewText(
        previewCustomerName,
        "-"
    );

    setInvoicePreviewText(
        previewCustomerCompany,
        "-"
    );

    setInvoicePreviewText(
        previewCustomerEmail,
        "-"
    );

    setInvoicePreviewText(
        previewCustomerPhone,
        "-"
    );

    setInvoicePreviewText(
        previewCustomerAddress1,
        "-"
    );

    setInvoicePreviewText(
        previewCustomerAddress2,
        "-"
    );

    setInvoicePreviewText(
        previewCustomerCity,
        "-"
    );

    setInvoicePreviewText(
        previewCustomerCountry,
        "-"
    );
}


function addInvoiceItem() {
    const row =
        document.createElement("div");

    row.className =
        "invoice-item-row";

    row.innerHTML = `
        <input
            type="text"
            class="invoice-item-name form-control"
            placeholder="Item name">

        <input
            type="number"
            class="invoice-item-quantity form-control"
            value="1"
            min="1"
            step="1">

        <input
            type="number"
            class="invoice-item-rate form-control"
            value="0"
            min="0"
            step="0.01">

        <input
            type="text"
            class="invoice-item-total form-control"
            value="${invoiceCurrencySymbol}0.00"
            readonly>

        <button
            type="button"
            class="remove-invoice-item">
            Remove
        </button>
    `;

    invoiceItemsContainer.appendChild(row);

    attachInvoiceItemEvents(row);

    calculateInvoiceTotals();
}

function attachInvoiceItemEvents(row) {
    const nameInput =
        row.querySelector(
            ".invoice-item-name"
        );

    const quantityInput =
        row.querySelector(
            ".invoice-item-quantity"
        );

    const rateInput =
        row.querySelector(
            ".invoice-item-rate"
        );

    const removeButton =
        row.querySelector(
            ".remove-invoice-item"
        );

    nameInput.addEventListener(
        "input",
        calculateInvoiceTotals
    );

    quantityInput.addEventListener(
        "input",
        () => {
            updateInvoiceItemRowTotal(
                row
            );
        }
    );

    rateInput.addEventListener(
        "input",
        () => {
            updateInvoiceItemRowTotal(
                row
            );
        }
    );

    removeButton.addEventListener(
        "click",
        () => {
            row.remove();

            calculateInvoiceTotals();
        }
    );
}

function updateInvoiceItemRowTotal(row) {
    const quantity =
        Number(
            row.querySelector(
                ".invoice-item-quantity"
            ).value
        ) || 0;

    const rate =
        Number(
            row.querySelector(
                ".invoice-item-rate"
            ).value
        ) || 0;

    const total =
        quantity * rate;

    row.querySelector(
        ".invoice-item-total"
    ).value =
        formatInvoiceMoney(total);

    calculateInvoiceTotals();
}

function calculateInvoiceSubtotal() {
    let subtotal = 0;

    const rows =
        invoiceItemsContainer.querySelectorAll(
            ".invoice-item-row"
        );

    rows.forEach(row => {
        const quantity =
            Number(
                row.querySelector(
                    ".invoice-item-quantity"
                ).value
            ) || 0;

        const rate =
            Number(
                row.querySelector(
                    ".invoice-item-rate"
                ).value
            ) || 0;

        subtotal +=
            quantity * rate;
    });

    return subtotal;
}

function calculateInvoiceTax(
    subtotal
) {
    const taxPercent =
        Number(
            invoiceTaxInput.value
        ) || 0;

    return (
        subtotal *
        (taxPercent / 100)
    );
}

function calculateInvoiceTotals() {
    const subtotal =
        calculateInvoiceSubtotal();

    const tax =
        calculateInvoiceTax(
            subtotal
        );

    const discount =
        Number(
            invoiceDiscountInput.value
        ) || 0;

    const shipping =
        Number(
            invoiceShippingInput.value
        ) || 0;

    const total =
        subtotal +
        tax +
        shipping -
        discount;

    invoiceSubtotal.textContent =
        formatInvoiceMoney(
            subtotal
        );

    invoiceGrandTotal.textContent =
        formatInvoiceMoney(
            Math.max(0, total)
        );

    updateAllInvoiceItemTotals();

    return {
        subtotal,
        taxPercent:
            Number(
                invoiceTaxInput.value
            ) || 0,
        tax,
        discount,
        shipping,
        totalAmount:
            Math.max(0, total)
    };
}

function refreshInvoicePreview() {
    try {
        updateAllInvoiceItemTotals();

        calculateInvoiceTotals();

        updateInvoicePreview();

        if (previewStatusBadge) {
            previewStatusBadge.textContent =
                "Updated";
        }

        setTimeout(() => {
            if (previewStatusBadge) {
                previewStatusBadge.textContent =
                    "Auto Updating";
            }
        }, 1500);

    } catch (error) {
        console.error(
            "Refresh Invoice Preview Error:",
            error
        );

        showToast(
            "Unable to refresh invoice preview.",
            "error"
        );
    }
}

function initializeInvoicePreviewRefresh() {
    if (!refreshPreviewBtn) {
        return;
    }

    refreshPreviewBtn.addEventListener(
        "click",
        refreshInvoicePreview
    );
}

function updateAllInvoiceItemTotals() {
    const rows =
        invoiceItemsContainer.querySelectorAll(
            ".invoice-item-row"
        );

    rows.forEach(row => {
        const quantity =
            Number(
                row.querySelector(
                    ".invoice-item-quantity"
                ).value
            ) || 0;

        const rate =
            Number(
                row.querySelector(
                    ".invoice-item-rate"
                ).value
            ) || 0;

        const total =
            quantity * rate;

        row.querySelector(
            ".invoice-item-total"
        ).value =
            formatInvoiceMoney(
                total
            );
    });
}

function getInvoiceItems() {
    const rows =
        invoiceItemsContainer.querySelectorAll(
            ".invoice-item-row"
        );

    return Array.from(
        rows
    ).map(row => {
        const name =
            row.querySelector(
                ".invoice-item-name"
            ).value.trim();

        const quantity =
            Number(
                row.querySelector(
                    ".invoice-item-quantity"
                ).value
            ) || 0;

        const rate =
            Number(
                row.querySelector(
                    ".invoice-item-rate"
                ).value
            ) || 0;

        return {
            name,
            quantity,
            rate,
            amount:
                quantity * rate
        };
    });
}

function formatInvoiceMoney(
    amount
) {
    return (
        invoiceCurrencySymbol +
        Number(
            amount || 0
        ).toLocaleString(
            undefined,
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )
    );
}

function initializeInvoiceItems() {
    addInvoiceItemButton.addEventListener(
        "click",
        addInvoiceItem
    );

    invoiceTaxInput.addEventListener(
        "input",
        calculateInvoiceTotals
    );

    invoiceDiscountInput.addEventListener(
        "input",
        calculateInvoiceTotals
    );

    invoiceShippingInput.addEventListener(
        "input",
        calculateInvoiceTotals
    );
}

function updateInvoiceCurrencyDisplay() {
    const option =
        invoiceCurrencyInput.options[
            invoiceCurrencyInput.selectedIndex
        ];

    invoiceCurrencyCode =
        invoiceCurrencyInput.value || "";

    invoiceCurrencySymbol =
        option?.dataset?.symbol ||
        "$";

    updateAllInvoiceItemTotals();

    calculateInvoiceTotals();
}

function displayInvoicePaymentInformation(
    paymentDetails
) {
    paymentAccountName.textContent =
        paymentDetails.accountName ||
        "-";

    paymentBankName.textContent =
        paymentDetails.bankName ||
        "-";

    paymentProvider.textContent =
        paymentDetails.paymentProvider ||
        "-";

    paymentMethod.textContent =
        paymentDetails.paymentMethod ||
        "-";

    paymentAccountNumber.textContent =
        paymentDetails.accountNumber ||
        "-";

    paymentReference.textContent =
        paymentDetails.paymentAccount ||
        paymentDetails.paymentLink ||
        "-";

    paymentDueDays.textContent =
        paymentDetails.paymentDueDays ||
        "-";

    paymentInstructions.textContent =
        paymentDetails.paymentInstructions ||
        "-";
}

function initializeInvoicePaymentInformation() {
    loadInvoicePaymentInformation();
}

function setInvoicePreviewText(element, value) {
    if (element) {
        element.textContent = value;
    }
}

function updateInvoiceBusinessPreview() {
    const profile =
        invoicePreviewState.userProfile;

    if (!profile) {
        return;
    }

    setInvoicePreviewText(
        invoiceCompanyName,
        profile.businessName ||
        profile.companyName ||
        "Invoice Pro"
    );

    setInvoicePreviewText(
        previewBusinessName,
        profile.businessName ||
        profile.companyName ||
        ""
    );

    setInvoicePreviewText(
        previewBusinessAddress1,
        profile.businessAddress ||
        profile.businessAddressLine1 ||
        ""
    );

    setInvoicePreviewText(
        previewBusinessAddress2,
        profile.businessAddressLine2 ||
        ""
    );

    setInvoicePreviewText(
        previewBusinessPhone,
        profile.businessPhone ||
        profile.phone ||
        ""
    );

    setInvoicePreviewText(
        previewBusinessEmail,
        profile.businessEmail ||
        profile.email ||
        ""
    );

    setInvoicePreviewText(
        previewBusinessWebsite,
        profile.businessWebsite ||
        profile.website ||
        ""
    );

    updateInvoiceBusinessLogo(profile);
}

function updateInvoiceBusinessLogo(profile) {
    const logo =
        document.getElementById(
            "previewCompanyLogo"
        );

    if (!logo) {
        return;
    }

    let logoUrl = "";

    const businessLogo =
        profile &&
        profile.businessLogo;

    if (
        businessLogo &&
        typeof businessLogo.url ===
            "function"
    ) {
        logoUrl =
            businessLogo.url();
    } else if (
        typeof businessLogo ===
        "string"
    ) {
        logoUrl =
            businessLogo;
    }

    if (logoUrl) {
        logo.src =
            logoUrl;

        logo.style.display =
            "block";
    } else {
        logo.removeAttribute(
            "src"
        );

        logo.style.display =
            "none";
    }
}

async function loadInvoicePreviewProfile() {
    const response =
        await Parse.Cloud.run(
            "getUserProfile"
        );

    if (
        !response ||
        !response.success ||
        !response.profile
    ) {
        invoicePreviewState.userProfile =
            null;

        return;
    }

    invoicePreviewState.userProfile =
        response.profile;
}

async function initializeInvoicePreview() {
    try {
        await loadInvoicePreviewProfile();

        updateInvoicePreview();

        invoicePreviewState.initialized =
            true;
    } catch (error) {
        console.error(
            "Invoice Preview Error:",
            error
        );
    }
}

function initializeInvoicePreviewModal() {
    if (
        closeInvoicePreviewBtn
    ) {
        closeInvoicePreviewBtn.addEventListener(
            "click",
            closeInvoicePreviewModal
        );
    }

    if (
        invoicePreviewOverlay
    ) {
        invoicePreviewOverlay.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    invoicePreviewOverlay
                ) {
                    closeInvoicePreviewModal();
                }

            }
        );
    }

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                invoicePreviewOverlay &&
                invoicePreviewOverlay.classList.contains(
                    "show"
                )
            ) {
                closeInvoicePreviewModal();
            }

        }
    );
}

function updateInvoiceHeaderPreview() {
    setInvoicePreviewText(
        previewInvoiceTitle,
        invoiceTitleInput?.value?.trim() ||
        "INVOICE"
    );

    setInvoicePreviewText(
        previewInvoiceNumber,
        invoiceNumberInput?.value ||
        "INV-000001"
    );

    setInvoicePreviewText(
        previewInvoiceDate,
        formatInvoicePreviewDate(
            invoiceIssueDateInput?.value
        )
    );

    setInvoicePreviewText(
        previewDueDate,
        formatInvoicePreviewDate(
            invoiceDueDateInput?.value
        )
    );
}

function updateInvoiceDetailsPreview() {
    setInvoicePreviewText(
        previewDetailsInvoiceNumber,
        invoiceNumberInput?.value ||
        "INV-000001"
    );

    setInvoicePreviewText(
        previewDetailsIssueDate,
        formatInvoicePreviewDate(
            invoiceIssueDateInput?.value
        )
    );

    setInvoicePreviewText(
        previewDetailsDueDate,
        formatInvoicePreviewDate(
            invoiceDueDateInput?.value
        )
    );

    setInvoicePreviewText(
        previewInvoiceStatus,
        invoicePaymentStatusInput?.value ||
        "Pending"
    );

    setInvoicePreviewText(
        previewPaymentTerms,
        invoicePaymentTermsInput?.value ||
        "-"
    );

    if (previewCurrency) {
        setInvoicePreviewText(
            previewCurrency,
            invoiceCurrencyCode ||
            invoiceCurrencyInput?.value ||
            "-"
        );
    }

    setInvoicePreviewText(
        previewPurchaseOrder,
        invoicePurchaseOrderInput?.value ||
        "-"
    );

    setInvoicePreviewText(
        previewReference,
        invoiceReferenceNumberInput?.value ||
        "-"
    );

    setInvoicePreviewText(
        previewProjectName,
        invoiceProjectNameInput?.value ||
        "-"
    );
}

function updateInvoiceCustomerPreview() {
    const client =
        selectedInvoiceClient;

    if (!client) {
        clearInvoiceClientPreview();

        return;
    }

    setInvoicePreviewText(
        previewCustomerName,
        client.contactPerson || "-"
    );

    setInvoicePreviewText(
        previewCustomerCompany,
        client.companyName || "-"
    );

    setInvoicePreviewText(
        previewCustomerEmail,
        client.clientEmail || "-"
    );

    setInvoicePreviewText(
        previewCustomerPhone,
        client.clientPhone || "-"
    );

    setInvoicePreviewText(
        previewCustomerAddress1,
        client.billingAddressLine1 || "-"
    );

    setInvoicePreviewText(
        previewCustomerAddress2,
        client.billingAddressLine2 || "-"
    );

    setInvoicePreviewText(
        previewCustomerCity,
        client.billingCityStateZip || "-"
    );

    setInvoicePreviewText(
        previewCustomerCountry,
        client.billingCountry || "-"
    );
}

function updateInvoiceItemsPreview() {
    if (!previewItemsBody) {
        return;
    }

    previewItemsBody.innerHTML = "";

    const items =
        getInvoiceItems();

    if (!items.length) {
        return;
    }

    items.forEach(item => {
        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>
                ${escapeInvoiceHtml(
                    item.name || "-"
                )}
            </td>

            <td>
                ${item.quantity}
            </td>

            <td>
                ${formatInvoiceMoney(
                    item.rate
                )}
            </td>

            <td>
                ${formatInvoiceMoney(
                    item.amount
                )}
            </td>
        `;

        previewItemsBody.appendChild(
            row
        );
    });
}

function updateInvoiceTotalsPreview() {
    const totals =
        calculateInvoiceTotals();

    setInvoicePreviewText(
        previewSubtotal,
        formatInvoiceMoney(
            totals.subtotal
        )
    );

    setInvoicePreviewText(
        previewDiscount,
        formatInvoiceMoney(
            totals.discount
        )
    );

    setInvoicePreviewText(
        previewTax,
        formatInvoiceMoney(
            totals.tax
        )
    );

    setInvoicePreviewText(
        previewShipping,
        formatInvoiceMoney(
            totals.shipping
        )
    );

    setInvoicePreviewText(
        previewGrandTotal,
        formatInvoiceMoney(
            totals.totalAmount
        )
    );

    if (previewDiscountRow) {
        previewDiscountRow.style.display =
            totals.discount > 0
                ? ""
                : "none";
    }

    if (previewTaxRow) {
        previewTaxRow.style.display =
            totals.tax > 0
                ? ""
                : "none";
    }

    if (previewShippingRow) {
        previewShippingRow.style.display =
            totals.shipping > 0
                ? ""
                : "none";
    }
}

function updateInvoicePaymentPreview() {
    const payment =
        invoicePaymentDetails || {};

    setInvoicePreviewText(
        previewPaymentAccountName,
        payment.accountName || "-"
    );

    setInvoicePreviewText(
        previewPaymentBankName,
        payment.bankName || "-"
    );

    setInvoicePreviewText(
        previewPaymentAccountNumber,
        payment.accountNumber || "-"
    );

    setInvoicePreviewText(
        previewPaymentProvider,
        payment.paymentProvider || "-"
    );
}

function updateInvoiceNotesPreview() {
    setInvoicePreviewText(
        previewNoteLine1,
        invoiceNotesInput?.value?.trim() ||
        ""
    );

    setInvoicePreviewText(
        previewTerms,
        invoiceTermsInput?.value?.trim() ||
        ""
    );
}

function updateInvoiceSignaturePreview() {
    setInvoicePreviewText(
        previewSignatureName,
        invoiceSignatureNameInput?.value?.trim() ||
        ""
    );

    setInvoicePreviewText(
        previewSignatureTitle,
        invoiceSignatureTitleInput?.value?.trim() ||
        ""
    );

    const imageFile =
        invoiceSignatureImageInput?.files?.[0];

    if (imageFile) {
        const reader =
            new FileReader();

        reader.onload = event => {
            if (previewSignatureImage) {
                previewSignatureImage.src =
                    event.target.result;

                previewSignatureImage.style.display =
                    "block";
            }
        };

        reader.readAsDataURL(
            imageFile
        );

        return;
    }

    const savedSignatureUrl =
        invoiceSignaturePreview?.dataset?.savedUrl ||
        "";

    if (savedSignatureUrl) {
        if (previewSignatureImage) {
            previewSignatureImage.src =
                savedSignatureUrl;

            previewSignatureImage.style.display =
                "block";
        }
        return;
    }

    if (previewSignatureImage) {
        previewSignatureImage.src = "";
        previewSignatureImage.style.display =
            "none";
    }
}

function updateInvoicePreview() {
    try {
        updateInvoiceBusinessPreview();
        updateInvoiceHeaderPreview();
        updateInvoiceDetailsPreview();
        updateInvoiceCustomerPreview();
        updateInvoiceItemsPreview();
        updateInvoiceTotalsPreview();
        updateInvoicePaymentPreview();
        updateInvoiceNotesPreview();
        updateInvoiceSignaturePreview();
    } catch (error) {
        console.error(
            "Invoice Preview Error:",
            error
        );
    }
}

function initializeInvoicePreviewListeners() {
    [
        invoiceTitleInput,
        invoiceNumberInput,
        invoiceIssueDateInput,
        invoiceDueDateInput,
        invoicePaymentStatusInput,
        invoicePaymentTermsInput,
        invoiceCurrencyInput,
        invoicePurchaseOrderInput,
        invoiceReferenceNumberInput,
        invoiceProjectNameInput,
        invoiceNotesInput,
        invoiceTermsInput,
        invoiceSignatureNameInput,
        invoiceSignatureTitleInput
    ].forEach(input => {
        if (!input) {
            return;
        }

        input.addEventListener(
            "input",
            updateInvoicePreview
        );

        input.addEventListener(
            "change",
            updateInvoicePreview
        );
        
        
    });
    
if (sendInvoiceBtn) {
    sendInvoiceBtn.addEventListener(
        "click",
        async () => {
            if (
                !selectedInvoice ||
                !selectedInvoice.objectId
            ) {
                showToast(
                    "Invoice ID is missing.",
                    "error"
                );

                return;
            }

            await openSendInvoiceModal(
                selectedInvoice.objectId
            );
        }
    );
}
}

function formatInvoicePreviewDate(
    value
) {
    if (!value) {
        return "-";
    }

    const date =
        new Date(
            `${value}T00:00:00`
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "-";
    }

    return date.toLocaleDateString(
        undefined,
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}

async function duplicateInvoice(invoiceId) {

    if (!invoiceId) {
        return;
    }

    try {

        const subscription =
            await Parse.Cloud.run(
                "getCurrentSubscription"
            );

        const invoiceCount =
            subscription.usage.invoices.used;

        const maxInvoices =
            subscription.usage.invoices.maximum;

        if (
            maxInvoices !== -1 &&
            invoiceCount >= maxInvoices
        ) {
            throw new Error(
                "You've reached your invoice limit. Upgrade your plan."
            );
        }

        const result =
            await Parse.Cloud.run(
                "duplicateInvoice",
                {
                    invoiceId
                }
            );

        if (
            !result ||
            result.success === false
        ) {
            throw new Error(
                result?.message ||
                "Unable to duplicate invoice."
            );
        }

        await loadInvoices();

        await loadInvoiceStatistics();

        showToast(
            result.message ||
            "Invoice duplicated successfully.",
            "success"
        );

    } catch (error) {

        console.error(
            "Duplicate Invoice Error:",
            error
        );

        showToast(
            error.message ||
            "Unable to duplicate invoice.",
            "error"
        );

    }

}

async function createInvoiceExportCanvas() {
    if (!invoicePaper) {
        throw new Error("Invoice preview is not available.");
    }

    updateInvoicePreview();

    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    const exportContainer = document.createElement("div");
    const exportPaper = invoicePaper.cloneNode(true);
    const paperWidth = invoicePaper.getBoundingClientRect().width || invoicePaper.offsetWidth || 820;

    exportContainer.style.position = "fixed";
    exportContainer.style.left = "-100000px";
    exportContainer.style.top = "0";
    exportContainer.style.width = `${paperWidth}px`;
    exportContainer.style.minHeight = "0";
    exportContainer.style.height = "auto";
    exportContainer.style.margin = "0";
    exportContainer.style.padding = "0";
    exportContainer.style.background = "#ffffff";
    exportContainer.style.overflow = "visible";
    exportContainer.style.zIndex = "-1";
    exportContainer.style.pointerEvents = "none";

    exportPaper.style.transform = "none";
    exportPaper.style.transformOrigin = "top left";
    exportPaper.style.margin = "0";
    exportPaper.style.marginBottom = "0";
    exportPaper.style.width = `${paperWidth}px`;
    exportPaper.style.maxWidth = "none";
    exportPaper.style.maxHeight = "none";
    exportPaper.style.height = "auto";
    exportPaper.style.overflow = "visible";

    exportContainer.appendChild(exportPaper);
    document.body.appendChild(exportContainer);

    try {
        const images = Array.from(exportPaper.querySelectorAll("img"));

        await Promise.all(
            images.map(image => {
                if (image.complete && image.naturalWidth > 0) {
                    return Promise.resolve();
                }

                return new Promise(resolve => {
                    const finish = () => resolve();
                    image.addEventListener("load", finish, { once: true });
                    image.addEventListener("error", finish, { once: true });
                });
            })
        );

        await new Promise(resolve => requestAnimationFrame(resolve));

        return await html2canvas(exportPaper, {
            scale: 2,
            useCORS: true,
            allowTaint: false,
            backgroundColor: "#ffffff",
            logging: false,
            imageTimeout: 15000,
            width: Math.ceil(exportPaper.scrollWidth),
            height: Math.ceil(exportPaper.scrollHeight),
            windowWidth: Math.ceil(exportPaper.scrollWidth),
            windowHeight: Math.ceil(exportPaper.scrollHeight),
            scrollX: 0,
            scrollY: 0
        });
    } finally {
        exportContainer.remove();
    }
}

function addInvoiceCanvasToPdf(pdf, canvas) {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imageWidth = pageWidth;
    const pixelsPerPdfPage = Math.floor(canvas.width * pageHeight / pageWidth);
    let offsetY = 0;
    let pageNumber = 0;

    while (offsetY < canvas.height) {
        const sliceHeight = Math.min(pixelsPerPdfPage, canvas.height - offsetY);
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceHeight;

        const context = pageCanvas.getContext("2d");
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
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

        if (pageNumber > 0) {
            pdf.addPage();
        }

        const imageHeight = sliceHeight * imageWidth / canvas.width;

        pdf.addImage(
            pageCanvas.toDataURL("image/jpeg", 0.98),
            "JPEG",
            0,
            0,
            imageWidth,
            imageHeight,
            undefined,
            "FAST"
        );

        offsetY += sliceHeight;
        pageNumber++;
    }
}

async function downloadInvoicePdf() {
    if (!invoicePaper) {
        return;
    }

    if (!currentSubscriptionSettings) {
        await loadInvoiceSubscriptionSettings();
    }

    if (!canExportInvoicePdf()) {
        return;
    }

    try {
        if (typeof html2canvas === "undefined") {
            throw new Error("PDF rendering library is not loaded.");
        }

        if (typeof window.jspdf === "undefined" || !window.jspdf.jsPDF) {
            throw new Error("PDF library is not loaded.");
        }

        const canvas = await createInvoiceExportCanvas();
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
            compress: true
        });

        addInvoiceCanvasToPdf(pdf, canvas);

        const invoiceNumber = invoiceNumberInput.value.trim() || "invoice";
        const safeFileName = invoiceNumber.replace(/[^a-z0-9-_]/gi, "_");

        pdf.save(`${safeFileName}.pdf`);

        await recordInvoicePdfExport();

        showToast("Invoice PDF generated successfully.", "success");
    } catch (error) {
        console.error("Invoice PDF Error:", error);
        showToast(
            error.message || "Unable to export the invoice as PDF.",
            "error"
        );
    }
}

function initializeInvoiceTableActions() {
    document.addEventListener(
        "click",
        async event => {

            const statusButton =
                event.target.closest(
                    "#statusDropdown button[data-status]"
                );

            if (statusButton) {
                const invoiceId =
                    statusDropdown.dataset.invoiceId;

                const status =
                    statusButton.dataset.status;

                if (!invoiceId) {
                    return;
                }

                statusDropdown.classList.remove(
                    "active"
                );

                await updateInvoiceStatus(
                    invoiceId,
                    status
                );

                return;
            }

            const statusTrigger =
                event.target.closest(
                    ".status-badge"
                );

            if (statusTrigger) {
                const invoiceId =
                    statusTrigger.dataset.invoiceId;

                if (!invoiceId) {
                    return;
                }

                statusDropdown.dataset.invoiceId =
                    invoiceId;

                const rect =
                    statusTrigger.getBoundingClientRect();

                const dropdownWidth =
                    statusDropdown.offsetWidth || 130;

                const dropdownHeight =
                    statusDropdown.offsetHeight || 154;

                let left =
                    rect.left;

                let top =
                    rect.bottom + 6;

                if (
                    left + dropdownWidth >
                    window.innerWidth - 10
                ) {
                    left =
                        window.innerWidth -
                        dropdownWidth -
                        10;
                }

                if (
                    top + dropdownHeight >
                    window.innerHeight - 10
                ) {
                    top =
                        rect.top -
                        dropdownHeight -
                        6;
                }

                statusDropdown.style.position =
                    "fixed";

                statusDropdown.style.left =
                    `${Math.max(left, 10)}px`;

                statusDropdown.style.top =
                    `${Math.max(top, 10)}px`;

                statusDropdown.classList.add(
                    "active"
                );

                return;
            }

            const sendButton =
                event.target.closest(
                    ".send-client-invoice-button"
                );

            if (sendButton) {
                const invoiceId =
                    sendButton.dataset.id;

                await openSendInvoiceModal(
                    invoiceId
                );

                return;
            }

            const viewButton =
                event.target.closest(
                    ".view-btn"
                );

            if (viewButton) {
                const invoiceId =
                    viewButton.dataset.invoiceId;

                await viewInvoice(
                    invoiceId
                );

                return;
            }

            const editButton =
                event.target.closest(
                    ".edit-btn"
                );

            if (editButton) {
                const invoiceId =
                    editButton.dataset.invoiceId;

                openEditInvoiceModal(
                    invoiceId
                );

                return;
            }

            const deleteButton =
                event.target.closest(
                    ".delete-btn"
                );

            if (deleteButton) {
                const invoiceId =
                    deleteButton.dataset.invoiceId;

                await deleteInvoice(
                    invoiceId
                );

                return;
            }

            const duplicateButton =
                event.target.closest(
                    ".duplicate-btn"
                );

            if (duplicateButton) {
                const invoiceId =
                    duplicateButton.dataset.invoiceId;

                await duplicateInvoice(
                    invoiceId
                );
            }

            if (
                statusDropdown &&
                statusDropdown.classList.contains(
                    "active"
                ) &&
                !event.target.closest(
                    "#statusDropdown"
                ) &&
                !event.target.closest(
                    ".status-badge"
                )
            ) {
                statusDropdown.classList.remove(
                    "active"
                );
            }
        }
    );
}

function initializeInvoicePdfDownload() {
    if (!downloadPdfBtn) {
        return;
    }

    downloadPdfBtn.addEventListener(
        "click",
        downloadInvoicePdf
    );
}

function showToast(
    message,
    type = "info",
    duration = 3000
) {
    console.log(
        `[Toast: ${type}]`,
        message
    );

    if (!toastContainer) {
        return;
    }

    const toast =
        document.createElement("div");

    toast.className =
        `toast ${type}`;

    const messageElement =
        document.createElement("span");

    messageElement.textContent =
        message;

    const closeElement =
        document.createElement("span");

    closeElement.className =
        "toastClose";

    closeElement.innerHTML =
        "&times;";

    toast.appendChild(
        messageElement
    );

    toast.appendChild(
        closeElement
    );

    toastContainer.appendChild(
        toast
    );

    let removed = false;

    const removeToast = () => {
        if (removed) {
            return;
        }

        removed = true;

        toast.style.animation =
            "toastOut .3s forwards";

        setTimeout(() => {
            toast.remove();
        }, 300);
    };

    closeElement.addEventListener(
        "click",
        removeToast
    );

    setTimeout(
        removeToast,
        duration
    );
}

function openInvoicePreviewModal() {
    if (
        !invoicePreviewOverlay ||
        !invoicePreviewModal ||
        !invoicePreviewCard
    ) {
        return;
    }

    if (
        invoicePreviewCard.parentElement !==
        invoicePreviewModal
    ) {
        invoicePreviewModal.appendChild(
            invoicePreviewCard
        );
    }

    invoicePreviewOverlay.classList.add(
    "show"
);

invoicePreviewOverlay.setAttribute(
    "aria-hidden",
    "false"
);

document.body.classList.add(
    "invoice-preview-open"
);
}

async function closeInvoicePreviewModal() {
    if (!invoicePreviewOverlay) {
        return;
    }


    invoicePreviewOverlay.classList.remove(
        "show"
    );

    invoicePreviewOverlay.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "invoice-preview-open"
    );
}

async function loadInvoiceForExport(
    invoice,
    items
) {
    selectedInvoice =
        invoice;

    selectedInvoiceItems =
        items;

    invoiceIdInput.value =
        invoice.objectId || "";

    invoiceTitleInput.value =
        invoice.invoiceTitle || "";

    invoiceProjectNameInput.value =
        invoice.projectName || "";

    invoiceReferenceNumberInput.value =
        invoice.referenceNumber || "";

    invoicePurchaseOrderInput.value =
        invoice.purchaseOrder || "";

    invoiceNumberInput.value =
        invoice.invoiceNumber || "";

    invoiceIssueDateInput.value =
        invoice.issueDate
            ? formatInvoiceDateInput(
                new Date(
                    invoice.issueDate
                )
            )
            : "";

    invoiceDueDateInput.value =
        invoice.dueDate
            ? formatInvoiceDateInput(
                new Date(
                    invoice.dueDate
                )
            )
            : "";

    invoicePaymentTermsInput.value =
        invoice.paymentTerms || "";

    invoicePaymentStatusInput.value =
        invoice.status || "Draft";

    if (
        invoicePaymentStatusSelect
    ) {
        invoicePaymentStatusSelect.value =
            invoice.status || "Draft";
    }

    invoiceTaxInput.value =
        invoice.taxPercent || 0;

    invoiceDiscountInput.value =
        invoice.discount || 0;

    invoiceShippingInput.value =
        invoice.shipping || 0;

    invoiceNotesInput.value =
        invoice.notes || "";

    invoiceTermsInput.value =
        invoice.termsConditions || "";

    invoiceSignatureNameInput.value =
        invoice.signatureName || "";

    invoiceSignatureTitleInput.value =
        invoice.signatureTitle || "";

    invoicePaymentDetails =
        invoice.paymentDetails || {};

    invoiceCurrencyCode =
        invoice.currencyCode || "USD";

    invoiceCurrencySymbol =
        invoice.currencySymbol || "$";

    selectedInvoiceClient = {
        objectId:
            invoice.clientId || "",

        contactPerson:
            invoice.contactPerson || "",

        companyName:
            invoice.companyName || "",

        clientEmail:
            invoice.clientEmail || "",

        clientPhone:
            invoice.clientPhone || "",

        billingAddressLine1:
            invoice.billingAddressLine1 || "",

        billingAddressLine2:
            invoice.billingAddressLine2 || "",

        billingCityStateZip:
            invoice.billingCityStateZip || "",

        billingCountry:
            invoice.billingCountry || ""
    };

    invoiceClientInput.value =
        selectedInvoiceClient.objectId;
        
    

    invoiceCurrencyInput.value =
        invoice.currencyCode || "";

    invoiceItemsContainer.innerHTML =
        "";

    items.forEach(
        item => {
            addInvoiceItem();

            const rows =
                invoiceItemsContainer.querySelectorAll(
                    ".invoice-item-row"
                );

            const row =
                rows[
                    rows.length - 1
                ];

            const nameInput =
                row.querySelector(
                    ".invoice-item-name"
                );

            const quantityInput =
                row.querySelector(
                    ".invoice-item-quantity"
                );

            const rateInput =
                row.querySelector(
                    ".invoice-item-rate"
                );

            if (nameInput) {
                nameInput.value =
                    item.description || "";
            }

            if (quantityInput) {
                quantityInput.value =
                    item.quantity || 1;
            }

            if (rateInput) {
                rateInput.value =
                    item.unitPrice || 0;
            }

            updateInvoiceItemRowTotal(
                row
            );
        }
    );

    updateInvoiceCurrencyDisplay();

    calculateInvoiceTotals();

    updateInvoicePreview();
}

function canExportInvoicePdf() {
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

function updateInvoiceExportButtonState() {
    const buttons = [
        exportInvoicesPdfBtn,
        downloadPdfBtn
    ];

    const exportUsage =
        currentSubscriptionSettings?.usage?.exports;

    if (!exportUsage) {
        return;
    }

    const maximum =
        exportUsage.maximum;

    buttons.forEach(button => {
        if (!button) {
            return;
        }

        if (maximum === -1) {
            button.disabled = false;
            return;
        }

        if (
            maximum === undefined ||
            maximum === null
        ) {
            button.disabled = true;
            return;
        }

        const remaining =
            Number(exportUsage.remaining);

        if (
            Number.isNaN(remaining) ||
            remaining <= 0
        ) {
            button.disabled = true;
            return;
        }

        button.disabled = false;
    });

    if (exportInvoicesPdfBtn) {
        if (maximum === -1) {
            exportInvoicesPdfBtn.querySelector("span")?.replaceChildren(
                document.createTextNode("Export as PDF")
            );
        } else if (
            maximum !== undefined &&
            maximum !== null
        ) {
            const remaining =
                Number(exportUsage.remaining);

            exportInvoicesPdfBtn.querySelector("span")?.replaceChildren(
                document.createTextNode(
                    remaining > 0
                        ? `Export as PDF (${remaining} left)`
                        : "Export as PDF (Limit Reached)"
                )
            );
        }
    }
}

function getInvoiceClientDisplayName(
    client
) {

    return (
        client.contactPerson ||
        client.companyName ||
        client.clientEmail ||
        "Unnamed Client"
    );

}

function renderInvoiceClientOptions(
    clients
) {

    if (!clients.length) {

        invoiceClientPickerOptions.innerHTML = `
            <div class="client-picker-empty">
                No clients found.
            </div>
        `;

        return;

    }

    invoiceClientPickerOptions.innerHTML =
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
                invoiceClientInput.value ===
                client.objectId
            ) {

                button.classList.add(
                    "selected"
                );

            }

            const name =
                getInvoiceClientDisplayName(
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
                            getInvoiceClientInitials(
                                name
                            );

                    };

                avatar.appendChild(
                    image
                );

            }
            else {

                avatar.textContent =
                    getInvoiceClientInitials(
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

                    selectInvoiceClientObject(
                        client
                    );

                }
            );

            invoiceClientPickerOptions.appendChild(
                button
            );

        }
    );

}

function selectInvoiceClientObject(
    client
) {

    if (!client) {

        clearInvoiceClientPicker();

        return;

    }

    invoiceClientInput.value =
        client.objectId || "";

    selectedInvoiceClient = {
        objectId:
            client.objectId || "",

        contactPerson:
            client.contactPerson || "",

        companyName:
            client.companyName || "",

        clientEmail:
            client.clientEmail || "",

        clientPhone:
            client.clientPhone || "",

        clientImageUrl:
            client.clientImageUrl || "",

        billingAddressLine1:
            client.billingAddressLine1 || "",

        billingAddressLine2:
            client.billingAddressLine2 || "",

        billingCityStateZip:
            client.billingCityStateZip || "",

        billingCountry:
            client.billingCountry || ""
    };

    invoiceClientPickerSelected.textContent =
        getInvoiceClientDisplayName(
            client
        );

    updateInvoiceClientPreview(
        selectedInvoiceClient
    );

    closeInvoiceClientPicker();

}

function clearInvoiceClientPicker() {

    invoiceClientInput.value =
        "";

    selectedInvoiceClient =
        null;

    invoiceClientPickerSelected.textContent =
        "Select Client";

    clearInvoiceClientPreview();

}

function closeInvoiceClientPicker() {
    
    invoiceClientPicker.classList.remove(
        "open"
    );
    
    invoiceClientPickerOptions.innerHTML =
        "";
    
    invoiceClientPickerSearch.value =
        "";
    
}

function toggleInvoiceClientPicker() {
    
    const isOpen =
        invoiceClientPicker.classList.contains(
            "open"
        );
    
    if (isOpen) {
        
        closeInvoiceClientPicker();
        
        return;
        
    }
    
    invoiceClientPicker.classList.add(
        "open"
    );
    
    invoiceClientPickerSearch.value =
        "";
    
    invoiceClientPickerSearch.focus();
    
    loadInvoiceClients(
        ""
    );
    
}

function initializeInvoiceClientPicker() {

    invoiceClientPickerTrigger.addEventListener(
        "click",
        toggleInvoiceClientPicker
    );

    invoiceClientPickerSearch.addEventListener(
        "input",
        () => {

            clearTimeout(
                invoiceClientSearchTimer
            );

            invoiceClientSearchTimer =
                setTimeout(
                    () => {

                        loadInvoiceClients(
                            invoiceClientPickerSearch.value
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
                invoiceClientPicker.contains(
                    event.target
                )
            ) {

                return;

            }

            closeInvoiceClientPicker();

        }
    );

}

async function loadInvoiceClients(
    search = ""
) {

    try {

        invoiceClientPickerOptions.innerHTML = `
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

        renderInvoiceClientOptions(
            clients
        );

    }
    catch (error) {

        console.error(
            "Invoice Client Load Error:",
            error
        );

        invoiceClientPickerOptions.innerHTML = `
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

async function loadInvoiceSubscriptionSettings() {
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

        updateInvoiceExportButtonState();

        return result;
    } catch (error) {
        console.error(
            "Invoice subscription loading failed:",
            error
        );

        showToast(
            error.message ||
            "Unable to load subscription information.",
            "error"
        );

        return null;
    }
}

async function recordInvoicePdfExport() {
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

        updateInvoiceExportButtonState();
    }

    return exportResult;
}

async function exportInvoicesAsPdf() {
    if (!invoicePaper) {
        return;
    }

    if (!currentSubscriptionSettings) {
        await loadInvoiceSubscriptionSettings();
    }

    if (!canExportInvoicePdf()) {
        return;
    }

    try {
        if (typeof html2canvas === "undefined") {
            throw new Error("PDF rendering library is not loaded.");
        }

        if (typeof window.jspdf === "undefined" || !window.jspdf.jsPDF) {
            throw new Error("PDF library is not loaded.");
        }

        const firstPage = await Parse.Cloud.run("getInvoices", {
            page: 1,
            limit: 100,
            search: "",
            status: "all",
            date: "all",
            sort: "newest"
        });

        const allInvoices = Array.isArray(firstPage?.invoices)
            ? [...firstPage.invoices]
            : [];

        const totalRecords = Number(firstPage?.totalRecords) || allInvoices.length;
        const totalPages = Math.ceil(totalRecords / 100);

        for (let page = 2; page <= totalPages; page++) {
            const pageResult = await Parse.Cloud.run("getInvoices", {
                page,
                limit: 100,
                search: "",
                status: "all",
                date: "all",
                sort: "newest"
            });

            if (Array.isArray(pageResult?.invoices)) {
                allInvoices.push(...pageResult.invoices);
            }
        }

        if (!allInvoices.length) {
            showToast("There are no invoices to export.", "info");
            return;
        }

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
            compress: true
        });

        let exportedCount = 0;

        for (const invoice of allInvoices) {
            if (!invoice?.objectId) {
                continue;
            }

            const result = await Parse.Cloud.run("getInvoiceDetails", {
                invoiceId: invoice.objectId
            });

            if (!result?.invoice) {
                continue;
            }

            if (result.client) {
                result.invoice.clientImageUrl = result.client.clientImageUrl;
            }

            await loadInvoiceForExport(
                result.invoice,
                Array.isArray(result.items) ? result.items : []
            );

            const canvas = await createInvoiceExportCanvas();

            if (exportedCount > 0) {
                pdf.addPage();
            }

            addInvoiceCanvasToPdf(pdf, canvas);
            exportedCount++;
        }

        if (!exportedCount) {
            throw new Error("No invoices could be rendered for PDF export.");
        }

        pdf.save("invoices.pdf");

        await recordInvoicePdfExport();

        showToast(
            `${exportedCount} invoices exported as one PDF successfully.`,
            "success"
        );
    } catch (error) {
        console.error("Invoice List PDF Export Error:", error);
        showToast(
            error.message || "Unable to export invoices as PDF.",
            "error"
        );
    }
}

function initializeInvoiceExport() {
    if (
        !exportInvoicesBtn ||
        !invoiceExportMenu
    ) {
        return;
    }

    exportInvoicesBtn.addEventListener(
        "click",
        event => {
            event.stopPropagation();

            invoiceExportMenu.classList.toggle(
                "active"
            );
        }
    );

    document.addEventListener(
        "click",
        event => {
            if (
                invoiceExportWrapper &&
                !invoiceExportWrapper.contains(
                    event.target
                )
            ) {
                invoiceExportMenu.classList.remove(
                    "active"
                );
            }
        }
    );

    exportInvoicesPdfBtn.addEventListener(
        "click",
        async () => {
            invoiceExportMenu.classList.remove(
                "active"
            );

            await exportInvoicesAsPdf();
        }
    );

}

async function printInvoicePreview() {
    await downloadInvoicePdf();
}

function initializeInvoicePrint() {
    if (!printPreviewBtn) {
        return;
    }

    printPreviewBtn.addEventListener(
        "click",
        printInvoicePreview
    );
}

function updateInvoicePreviewZoom() {
    if (
        !previewZoomSelect ||
        !invoicePaper
    ) {
        return;
    }

    const zoom =
        Number(
            previewZoomSelect.value
        ) || 100;

    const baseScale =
        zoom / 100;

    const isMobile =
        window.innerWidth <= 768;

    if (isMobile) {
        const availableWidth =
            previewDocumentArea
                ? previewDocumentArea.clientWidth - 24
                : window.innerWidth - 24;

        const paperWidth =
            invoicePaper.offsetWidth || 794;

        const fitScale =
            availableWidth / paperWidth;

        const finalScale =
            Math.min(
                baseScale,
                fitScale
            );

        invoicePaper.style.transform =
            `scale(${finalScale})`;

        invoicePaper.style.transformOrigin =
            "top center";

        invoicePaper.style.marginBottom =
            `${Math.max(
                0,
                (finalScale - 1) * invoicePaper.offsetHeight
            )}px`;

        return;
    }

    invoicePaper.style.transform =
        `scale(${baseScale})`;

    invoicePaper.style.transformOrigin =
        "top center";

    invoicePaper.style.marginBottom =
        `${Math.max(
            0,
            (baseScale - 1) * 100
        )}%`;
}

function initializeInvoicePreviewZoom() {
    if (!previewZoomSelect) {
        return;
    }

    previewZoomSelect.addEventListener(
        "change",
        updateInvoicePreviewZoom
    );

    updateInvoicePreviewZoom();
}

async function openSendInvoiceModal(invoiceId) {
    const modal =
        document.getElementById(
            "sendInvoiceModal"
        );

    if (!modal) {
        showToast(
            "Send invoice modal was not found.",
            "error"
        );

        return;
    }

    if (!invoiceId) {
        showToast(
            "Invoice ID is missing.",
            "error"
        );

        return;
    }

    try {
        const result =
    await Parse.Cloud.run(
        "getInvoiceDetails",
        {
            invoiceId
        }
    );

        if (
            !result ||
            !result.invoice
        ) {
            throw new Error(
                result?.message ||
                "Unable to load invoice details."
            );
        }

        const invoice =
            result.invoice;

        const items =
            result.items || [];

        modal.dataset.invoiceId =
            invoiceId;

        document.getElementById(
            "sendInvoiceClientName"
        ).textContent =
            invoice.companyName ||
            invoice.contactPerson ||
            "-";

        document.getElementById(
            "sendInvoiceClientEmail"
        ).textContent =
            invoice.clientEmail ||
            "-";
          
        const sendInvoiceClientImage =
    document.getElementById(
        "sendInvoiceClientImage"
    );

const sendInvoiceClientImageFallback =
    document.querySelector(
        "#sendInvoiceModal #sendInvoiceClientImageFallbackIcon"
    );

const clientImageUrl =
    invoice.clientImageUrl ||
    (
        result.client &&
        result.client.clientImageUrl
    ) ||
    "";

if (sendInvoiceClientImage) {
    const clientImageContainer =
        sendInvoiceClientImage.parentElement;

    if (clientImageContainer) {
        clientImageContainer.style.overflow =
            "hidden";

        clientImageContainer.style.borderRadius =
            "50%";
    }

    sendInvoiceClientImage.style.width =
        "100%";

    sendInvoiceClientImage.style.height =
        "100%";

    sendInvoiceClientImage.style.objectFit =
        "cover";

    sendInvoiceClientImage.style.borderRadius =
        "50%";

    if (clientImageUrl) {
        sendInvoiceClientImage.src =
            clientImageUrl;

        sendInvoiceClientImage.style.setProperty(
            "display",
            "block",
            "important"
        );

        if (
            sendInvoiceClientImageFallback
        ) {
            sendInvoiceClientImageFallback.style.setProperty(
                "display",
                "none",
                "important"
            );
        }
    } else {
        sendInvoiceClientImage.removeAttribute(
            "src"
        );

        sendInvoiceClientImage.style.setProperty(
            "display",
            "none",
            "important"
        );

        if (
            sendInvoiceClientImageFallback
        ) {
            sendInvoiceClientImageFallback.style.setProperty(
                "display",
                "flex",
                "important"
            );
        }
    }
}

        document.getElementById(
            "sendInvoiceNumber"
        ).textContent =
            invoice.invoiceNumber ||
            "-";

        document.getElementById(
            "sendInvoiceTitle"
        ).textContent =
            invoice.invoiceTitle ||
            "-";

        document.getElementById(
            "sendInvoiceIssueDate"
        ).textContent =
            formatInvoiceDate(
                invoice.issueDate
            );

        document.getElementById(
            "sendInvoiceDueDate"
        ).textContent =
            formatInvoiceDate(
                invoice.dueDate
            );

        document.getElementById(
            "sendInvoicePaymentTerms"
        ).textContent =
            invoice.paymentTerms ||
            "-";

        document.getElementById(
            "sendInvoiceCurrency"
        ).textContent =
            invoice.currencyCode ||
            "-";

        document.getElementById(
            "sendInvoicePaymentStatus"
        ).textContent =
            invoice.status ||
            "-";
            
            const paymentDetails =
    result.paymentDetails ||
    invoice.paymentDetails ||
    {};

const sendInvoicePaymentAccountName =
    document.getElementById(
        "sendInvoicePaymentAccountName"
    );

if (sendInvoicePaymentAccountName) {
    sendInvoicePaymentAccountName.textContent =
        paymentDetails.accountName ||
        "-";
}

const sendInvoicePaymentBankName =
    document.getElementById(
        "sendInvoicePaymentBankName"
    );

if (sendInvoicePaymentBankName) {
    sendInvoicePaymentBankName.textContent =
        paymentDetails.bankName ||
        "-";
}

const sendInvoicePaymentProvider =
    document.getElementById(
        "sendInvoicePaymentProvider"
    );

if (sendInvoicePaymentProvider) {
    sendInvoicePaymentProvider.textContent =
        paymentDetails.paymentProvider ||
        "-";
}

const sendInvoicePaymentMethod =
    document.getElementById(
        "sendInvoicePaymentMethod"
    );

if (sendInvoicePaymentMethod) {
    sendInvoicePaymentMethod.textContent =
        paymentDetails.paymentMethod ||
        "-";
}

const sendInvoicePaymentAccountNumber =
    document.getElementById(
        "sendInvoicePaymentAccountNumber"
    );

if (sendInvoicePaymentAccountNumber) {
    sendInvoicePaymentAccountNumber.textContent =
        paymentDetails.accountNumber ||
        "-";
}

const sendInvoicePaymentReference =
    document.getElementById(
        "sendInvoicePaymentReference"
    );

if (sendInvoicePaymentReference) {
    sendInvoicePaymentReference.textContent =
        paymentDetails.paymentReference ||
        paymentDetails.referenceNumber ||
        paymentDetails.paymentAccount ||
        paymentDetails.paymentLink ||
        "-";
}

const sendInvoicePaymentDueDays =
    document.getElementById(
        "sendInvoicePaymentDueDays"
    );

if (sendInvoicePaymentDueDays) {
    const paymentTerms =
        paymentDetails.paymentTerms || "";

    const paymentDueDays =
        paymentDetails.paymentDueDays || "";

    const paymentTermsLabels = {
        due_on_receipt: "Due on Receipt",
        "7_days": "Due in 7 Days",
        "15_days": "Due in 15 Days",
        "30_days": "Due in 30 Days",
        "60_days": "Due in 60 Days",
        "90_days": "Due in 90 Days"
    };

    sendInvoicePaymentDueDays.textContent =
        paymentDueDays
            ? `Due in ${paymentDueDays} Days`
            : paymentTermsLabels[paymentTerms] ||
              "-";
}

const sendInvoicePaymentInstructions =
    document.getElementById(
        "sendInvoicePaymentInstructions"
    );

if (sendInvoicePaymentInstructions) {
    sendInvoicePaymentInstructions.textContent =
        paymentDetails.paymentInstructions ||
        "-";
}

        const currencySymbol =
            invoice.currencySymbol ||
            "";

        const totalAmount =
            Number(
                invoice.totalAmount
            ) || 0;

        document.getElementById(
            "sendInvoiceAmount"
        ).textContent =
            `${currencySymbol}${totalAmount.toLocaleString(
                undefined,
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            )}`;

        const itemsContainer =
            document.getElementById(
                "sendInvoiceItems"
            );

        itemsContainer.innerHTML =
            "";

        items.forEach(item => {
            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "send-invoice-item";

            row.innerHTML =
                `
                <span>
                    ${item.description || "-"}
                </span>

                <span>
                    ${item.quantity || 0}
                </span>

                <strong>
                    ${currencySymbol}${(
                        Number(
                            item.total
                        ) || 0
                    ).toLocaleString(
                        undefined,
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }
                    )}
                </strong>
                `;

            itemsContainer.appendChild(
                row
            );
        });

        document.getElementById(
            "sendInvoiceSubtotal"
        ).textContent =
            `${currencySymbol}${(
                Number(
                    invoice.subtotal
                ) || 0
            ).toLocaleString(
                undefined,
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            )}`;

        document.getElementById(
            "sendInvoiceTax"
        ).textContent =
            `${currencySymbol}${(
                Number(
                    invoice.taxAmount
                ) || 0
            ).toLocaleString(
                undefined,
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            )}`;

        document.getElementById(
            "sendInvoiceDiscount"
        ).textContent =
            `${currencySymbol}${(
                Number(
                    invoice.discount
                ) || 0
            ).toLocaleString(
                undefined,
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            )}`;

        document.getElementById(
            "sendInvoiceShipping"
        ).textContent =
            `${currencySymbol}${(
                Number(
                    invoice.shipping
                ) || 0
            ).toLocaleString(
                undefined,
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            )}`;

        document.getElementById(
            "sendInvoiceGrandTotal"
        ).textContent =
            `${currencySymbol}${totalAmount.toLocaleString(
                undefined,
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            )}`;

        document.getElementById(
            "sendInvoiceNotes"
        ).textContent =
            invoice.notes ||
            "-";

        document.getElementById(
            "sendInvoiceTerms"
        ).textContent =
            invoice.termsConditions ||
            "-";

        document.getElementById(
            "sendInvoiceSignatureName"
        ).textContent =
            invoice.signatureName ||
            "-";

        document.getElementById(
            "sendInvoiceSignatureTitle"
        ).textContent =
            invoice.signatureTitle ||
            "-";

        const sendInvoiceSignatureImage =
            document.getElementById(
                "sendInvoiceSignatureImage"
            );

        const sendInvoiceSignatureUrl =
            invoice.signatureImage ||
            "";

        if (sendInvoiceSignatureImage) {
            if (sendInvoiceSignatureUrl) {
                sendInvoiceSignatureImage.src =
                    sendInvoiceSignatureUrl;
                sendInvoiceSignatureImage.style.display =
                    "block";
            } else {
                sendInvoiceSignatureImage.removeAttribute(
                    "src"
                );
                sendInvoiceSignatureImage.style.display =
                    "none";
            }
        }

        const message =
            document.getElementById(
                "sendInvoiceMessage"
            );

        if (message) {
            message.value =
                "";
        }

        const sendButton =
            document.getElementById(
                "confirmSendInvoiceButton"
            );

        if (sendButton) {
            sendButton.disabled =
                false;

            sendButton.innerHTML =
                `
                <i class="ri-send-plane-line"></i>
                Send Invoice
                `;
        }

        modal.classList.add(
            "show"
        );

        const overlay =
            document.getElementById(
                "sendInvoiceOverlay"
            );

        if (overlay) {
            overlay.classList.add(
                "show"
            );
        }

    } catch (error) {
        console.error(
            "Open Send Invoice Modal Error:",
            error
        );

        showToast(
            error.message ||
            "Unable to prepare invoice for sending.",
            "error"
        );
    }
}

function closeSendInvoiceModal() {
    const modal =
        document.getElementById(
            "sendInvoiceModal"
        );

    const overlay =
        document.getElementById(
            "sendInvoiceOverlay"
        );

    if (modal) {
        modal.classList.remove(
            "show"
        );

        delete modal.dataset.invoiceId;
    }

    if (overlay) {
        overlay.classList.remove(
            "show"
        );
    }
}

function showInvoiceResultModal(
    title,
    message,
    buttonText = "",
    buttonAction = null
) {
    if (invoiceResultTitle) {
        invoiceResultTitle.textContent =
            title;
    }

    if (invoiceResultMessage) {
        invoiceResultMessage.textContent =
            message;
    }

    if (invoiceResultButton) {
        if (buttonText) {
            invoiceResultButton.textContent =
                buttonText;

            invoiceResultButton.style.display =
                "inline-block";

            invoiceResultButton.onclick =
                buttonAction || null;
        } else {
            invoiceResultButton.style.display =
                "none";

            invoiceResultButton.onclick =
                null;
        }
    }

    if (invoiceResultOverlay) {
        invoiceResultOverlay.classList.add(
            "show"
        );
    }
}

async function sendInvoiceToClient(button) {
    const modal =
        document.getElementById(
            "sendInvoiceModal"
        );

    if (!modal) {
        showToast(
            "Send invoice modal was not found.",
            "error"
        );

        return;
    }

    const invoiceId =
        modal.dataset.invoiceId;

    if (!invoiceId) {
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

    if (
        !button ||
        button.disabled
    ) {
        return;
    }

    try {
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
                    invoiceId,
                    message
                }
            );

        if (
            !result ||
            result.success !== true
        ) {
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

        if (sentButton) {
            sentButton.outerHTML =
                `
                <span class="invoice-sent-label">
                    Sent
                </span>
                `;
        }

    } catch (error) {
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
            
        showInvoiceResultModal(
    "Business Plan Required",
    error?.message ||
    "This feature is only available on the Business plan or above.",
    "Upgrade Plan",
    () => {
        window.location.href =
            "subscription.html?section=subscription";
    }
);

        button.innerHTML =
            button.dataset.originalContent ||
            `
            <i class="ri-send-plane-line"></i>
            Send Invoice
            `;
    }
}

function initializeSendInvoiceModal() {
    const confirmButton =
        document.getElementById(
            "confirmSendInvoiceButton"
        );

    const closeButton =
        document.getElementById(
            "closeSendInvoiceButton"
        );

    const cancelButton =
        document.getElementById(
            "cancelSendInvoiceButton"
        );

    const overlay =
        document.getElementById(
            "sendInvoiceOverlay"
        );

    if (confirmButton) {
        confirmButton.addEventListener(
            "click",
            () => {
                sendInvoiceToClient(
                    confirmButton
                );
            }
        );
    }

    if (closeButton) {
        closeButton.addEventListener(
            "click",
            closeSendInvoiceModal
        );
    }

    if (cancelButton) {
        cancelButton.addEventListener(
            "click",
            closeSendInvoiceModal
        );
    }

    if (overlay) {
        overlay.addEventListener(
            "click",
            closeSendInvoiceModal
        );
    }
}

async function uploadInvoiceSignature() {
    const file =
        invoiceSignatureImageInput.files?.[0];

    if (!file) {
        return "";
    }

    const parseFile =
        new Parse.File(
            file.name,
            file
        );

    await parseFile.save();

    return parseFile;
}

function collectInvoiceSaveData(statusOverride) {
    const totals =
        calculateInvoiceTotals();

    const rawItems =
        getInvoiceItems();

    const items =
        rawItems.map(item => ({
            description:
                item.name,

            quantity:
                Number(item.quantity) || 0,

            unitPrice:
                Number(item.rate) || 0,

            total:
                Number(item.amount) || 0
        }));

    const client =
        selectedInvoiceClient || {};

    const selectedStatus =
        statusOverride ||
        invoicePaymentStatusSelect.value ||
        invoicePaymentStatusInput.value ||
        "Pending";

    const paymentDetails = {
        ...(invoicePaymentDetails || {})
    };

    return {
        clientId:
            invoiceClientInput.value,

        invoiceTitle:
            invoiceTitleInput.value.trim(),

        projectName:
            invoiceProjectNameInput.value.trim(),

        referenceNumber:
            invoiceReferenceNumberInput.value.trim(),

        purchaseOrder:
            invoicePurchaseOrderInput.value.trim(),

        issueDate:
            invoiceIssueDateInput.value,

        dueDate:
            invoiceDueDateInput.value,

        validityMessage:
            "",

        customerNotes:
            "",

        currencyCode:
            invoiceCurrencyInput.value,

        currencySymbol:
            invoiceCurrencySymbol,

        status:
            selectedStatus,

        contactPerson:
            client.contactPerson || "",

        companyName:
            client.companyName || "",

        clientEmail:
            client.clientEmail || "",

        clientPhone:
            client.clientPhone || "",

        clientTaxId:
            client.clientTaxId || "",

        billingAddress:
            [
                client.billingAddressLine1,
                client.billingAddressLine2,
                client.billingCityStateZip,
                client.billingCountry
            ]
                .filter(Boolean)
                .join(", "),

        billingAddressLine1:
            client.billingAddressLine1 || "",

        billingAddressLine2:
            client.billingAddressLine2 || "",

        billingCityStateZip:
            client.billingCityStateZip || "",

        billingCountry:
            client.billingCountry || "",

        items,

        subtotal:
            totals.subtotal,

        taxPercent:
            totals.taxPercent,

        tax:
            totals.tax,

        discount:
            totals.discount,

        shipping:
            totals.shipping,

        totalAmount:
            totals.totalAmount,

        paymentTerms:
            invoicePaymentTermsInput.value,

        paymentDetails,

        notes:
            invoiceNotesInput.value.trim(),

        termsConditions:
            invoiceTermsInput.value.trim(),

        signatureName:
            invoiceSignatureNameInput.value.trim(),

        signatureTitle:
            invoiceSignatureTitleInput.value.trim()
    };
}

async function saveInvoice(statusOverride) {
    const validation =
        validateInvoiceForm();

    if (!validation.valid) {
        showToast(
            validation.message,
            "error"
        );

        return;
    }

    const totals =
        calculateInvoiceTotals();

    const rawItems =
        getInvoiceItems();

    if (!rawItems.length) {
        showToast(
            "At least one invoice item is required.",
            "error"
        );

        return;
    }

    const invalidItem =
        rawItems.find(
            item =>
                !item.name ||
                Number(item.quantity) <= 0 ||
                Number(item.rate) < 0
        );

    if (invalidItem) {
        showToast(
            "Please complete all invoice items correctly.",
            "error"
        );

        return;
    }

    if (
        Number(totals.totalAmount) <= 0
    ) {
        showToast(
            "Invoice total must be greater than zero.",
            "error"
        );

        return;
    }

    const buttons = [
    saveInvoiceDraftButton,
    saveInvoiceButton
];

if (saveInvoiceButton) {
    saveInvoiceButton.disabled = true;

    const saveText =
        saveInvoiceButton.querySelector("span");

    if (saveText) {
        saveText.textContent = "Saving...";
    }
}

if (saveInvoiceDraftButton) {
    saveInvoiceDraftButton.disabled = true;
}
    try {
        showLoading();

        const data =
            collectInvoiceSaveData(
                statusOverride
            );

        const signatureFile =
            await uploadInvoiceSignature();

        data.signatureImage =
            signatureFile;

        let result;

if (
    editingInvoice &&
    editingInvoiceId
) {
    result =
        await Parse.Cloud.run(
            "updateInvoice",
            {
                invoiceId:
                    editingInvoiceId,
                ...data
            }
        );
} else {

    const subscription =
        await Parse.Cloud.run(
            "getCurrentSubscription"
        );

    const invoiceCount =
        subscription.usage.invoices.used;

    const maxInvoices =
        subscription.usage.invoices.maximum;

    if (
        maxInvoices !== -1 &&
        invoiceCount >= maxInvoices
    ) {
        throw new Error(
            "You've reached your invoice limit. Upgrade your plan."
        );
    }

    result =
        await Parse.Cloud.run(
            "createInvoice",
            data
        );
}

        if (
            !result ||
            result.success === false
        ) {
            throw new Error(
                result?.message ||
                "Unable to save invoice."
            );
        }

        currentPage = 1;

        closeCreateInvoiceModal();

        resetInvoiceModal();

        await loadInvoices();

        await loadInvoiceStatistics();

        showToast(
            result.message ||
            (
                editingInvoice
                    ? "Invoice updated successfully."
                    : "Invoice created successfully."
            ),
            "success"
        );

        editingInvoice =
            false;

        editingInvoiceId =
            null;

        selectedInvoice =
            null;

        selectedInvoiceClient =
            null;

        selectedInvoiceItems =
            [];

    } catch (error) {
        console.error(
            "Save Invoice Error:",
            error
        );

        showToast(
            error.message ||
            "Unable to save invoice.",
            "error"
        );
        
        handleInvoiceBackendError(
    error,
    "Unable to save invoice."
);

    } finally {
        hideLoading();

        buttons.forEach(
    button => {
        if (button) {
            button.disabled = false;
        }
    }
);

if (saveInvoiceButton) {
    const saveText =
        saveInvoiceButton.querySelector("span");

    if (saveText) {
        saveText.textContent = "Save Invoice";
    }
}
    }
}

function initializeInvoiceSaveWorkflow() {
    if (saveInvoiceButton) {
    saveInvoiceButton.addEventListener(
        "click",
        async () => {
            await saveInvoice(
                "Pending"
            );
        }
    );
}

    if (saveInvoiceDraftButton) {
    saveInvoiceDraftButton.addEventListener(
        "click",
        async () => {
            await saveInvoiceDraft();
        }
    );
}
}

function collectInvoiceDraftData() {
    const totals = calculateInvoiceTotals();
    const rawItems = getInvoiceItems();
    const client = selectedInvoiceClient || {};

    const items = rawItems.map(item => ({
        description: item.name || "",
        quantity: Number(item.quantity) || 0,
        unitPrice: Number(item.rate) || 0,
        total: Number(item.amount) || 0
    }));

    return {
        clientId: invoiceClientInput.value || "",
        invoiceTitle: invoiceTitleInput.value.trim(),
        projectName: invoiceProjectNameInput.value.trim(),
        referenceNumber: invoiceReferenceNumberInput.value.trim(),
        purchaseOrder: invoicePurchaseOrderInput.value.trim(),
        issueDate: invoiceIssueDateInput.value || "",
        dueDate: invoiceDueDateInput.value || "",
        currencyCode: invoiceCurrencyInput.value || "",
        currencySymbol: invoiceCurrencySymbol || "$",
        status: "Draft",
        contactPerson: client.contactPerson || "",
        companyName: client.companyName || "",
        clientEmail: client.clientEmail || "",
        clientPhone: client.clientPhone || "",
        clientTaxId: client.clientTaxId || "",
        billingAddress: [
            client.billingAddressLine1,
            client.billingAddressLine2,
            client.billingCityStateZip,
            client.billingCountry
        ].filter(Boolean).join(", "),
        billingAddressLine1: client.billingAddressLine1 || "",
        billingAddressLine2: client.billingAddressLine2 || "",
        billingCityStateZip: client.billingCityStateZip || "",
        billingCountry: client.billingCountry || "",
        items,
        subtotal: Number(totals.subtotal) || 0,
        taxPercent: Number(totals.taxPercent) || 0,
        tax: Number(totals.tax) || 0,
        discount: Number(totals.discount) || 0,
        shipping: Number(totals.shipping) || 0,
        totalAmount: Number(totals.totalAmount) || 0,
        paymentTerms: invoicePaymentTermsInput.value || "",
        paymentDetails: {
            ...(invoicePaymentDetails || {})
        },
        notes: invoiceNotesInput.value.trim(),
        termsConditions: invoiceTermsInput.value.trim(),
        signatureName: invoiceSignatureNameInput.value.trim(),
        signatureTitle: invoiceSignatureTitleInput.value.trim()
    };
}

async function saveInvoiceDraft() {
    const buttons = [
        saveInvoiceDraftButton,
        saveInvoiceButton
    ];

    buttons.forEach(button => {
        if (button) {
            button.disabled = true;
        }
    });

    try {
        showLoading();

        const data = collectInvoiceDraftData();

        let result;

if (editingInvoice && editingInvoiceId) {
    result = await Parse.Cloud.run(
        "updateInvoice",
        {
            invoiceId: editingInvoiceId,
            ...data
        }
    );
} else {

    const subscription =
        await Parse.Cloud.run(
            "getCurrentSubscription"
        );

    const invoiceCount =
        subscription.usage.invoices.used;

    const maxInvoices =
        subscription.usage.invoices.maximum;

    if (
        maxInvoices !== -1 &&
        invoiceCount >= maxInvoices
    ) {
        throw new Error(
            "You've reached your invoice limit. Upgrade your plan."
        );
    }

    result = await Parse.Cloud.run(
        "createInvoice",
        data
    );
}

        if (!result || result.success === false) {
            throw new Error(
                result?.message ||
                "Unable to save invoice draft."
            );
        }

        currentPage = 1;

        await loadInvoices();
        await loadInvoiceStatistics();

        closeCreateInvoiceModal();
        resetInvoiceModal();

        editingInvoice = false;
        editingInvoiceId = null;
        selectedInvoice = null;
        selectedInvoiceClient = null;
        selectedInvoiceItems = [];

        showToast(
            result.message ||
            "Invoice draft saved successfully.",
            "success"
        );

    } catch (error) {
        console.error(
            "Save Invoice Draft Error:",
            error
        );

        showToast(
            error.message ||
            "Unable to save invoice draft.",
            "error"
        );
        
        handleInvoiceBackendError(
    error,
    "Unable to save invoice draft"
);

    } finally {
        hideLoading();

        buttons.forEach(button => {
            if (button) {
                button.disabled = false;
            }
        });
    }
}

function isInvoiceLimitError(error) {
    const message =
        error?.message ||
        error?.error ||
        "";

    return message
        .toLowerCase()
        .includes(
            "invoice limit"
        );
}

function showInvoiceLimitModal() {
    if (!invoiceLimitOverlay) {
        return;
    }

    if (invoiceLimitTitle) {
        invoiceLimitTitle.textContent =
            "Invoice Limit Reached";
    }

    if (invoiceLimitMessage) {
        invoiceLimitMessage.textContent =
            "You've reached your invoice limit. Upgrade your plan.";
    }

    invoiceLimitOverlay.classList.add(
        "active"
    );

    if (invoiceLimitModal) {
        invoiceLimitModal.classList.add(
            "active"
        );
    }
}

function showLoading(message = "Please wait...") {
    const loadingOverlay = document.getElementById("loadingOverlay");
    const loadingText = document.querySelector(".loading-text");

    if (!loadingOverlay) return;

    if (loadingText) {
        loadingText.textContent = message;
    }

    loadingOverlay.classList.add("active");
}

function hideLoading() {
    const loadingOverlay = document.getElementById("loadingOverlay");

    if (!loadingOverlay) return;

    loadingOverlay.classList.remove("active");
}

function closeInvoiceLimitModal() {
    if (invoiceLimitOverlay) {
        invoiceLimitOverlay.classList.remove(
            "active"
        );
    }

    if (invoiceLimitModal) {
        invoiceLimitModal.classList.remove(
            "active"
        );
    }
}

function initializeInvoiceLimitModal() {
    if (invoiceLimitButton) {
        invoiceLimitButton.addEventListener(
            "click",
            () => {
                closeInvoiceLimitModal();

                window.location.href =
                    "subscription.html?section=subscription";
            }
        );
    }

    if (invoiceLimitOverlay) {
        invoiceLimitOverlay.addEventListener(
            "click",
            event => {
                if (
                    event.target ===
                    invoiceLimitOverlay
                ) {
                    closeInvoiceLimitModal();
                }
            }
        );
    }
}

function handleInvoiceBackendError(
    error,
    fallbackMessage
) {
    console.error(
        "Invoice Backend Error:",
        error
    );

    if (
        isInvoiceLimitError(error)
    ) {
        showInvoiceLimitModal();

        return true;
    }

    showToast(
        error?.message ||
        fallbackMessage ||
        "Something went wrong.",
        "error"
    );

    return false;
}

async function initializeInvoicePage() {
    initializeCreateInvoiceModal();
    initializeInvoiceForm();
    initializeInvoiceClientSelection();
    initializeInvoiceItems();
    initializeInvoiceSearchFilterSort();

    if (filterInvoicesBtn) {
        initializeInvoiceFilterButton();
    }

    initializeInvoicePagination();
    initializeInvoiceTableActions();
    initializeInvoicePreviewListeners();
    initializeInvoicePreviewRefresh();
    initializeInvoicePdfDownload();
    initializeInvoiceExport();
    initializeInvoicePrint();
    initializeInvoicePreviewZoom();
    initializeInvoicePreviewModal();

    await loadBusinessProfileSettings();
    await loadInvoiceSubscriptionSettings();
    await loadInvoiceClients();
    await loadInvoiceStatistics();
    await loadInvoices();
    await initializeInvoicePreview();
    initializeSendInvoiceModal();
    showToast("Page Loaded Successfully");
        const params =
        new URLSearchParams(
            window.location.search
        );

    const invoiceId =
        params.get("invoiceId");

    if (invoiceId) {
        await viewInvoice(invoiceId);
    }

}

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await initializeInvoicePage();

        const params =
            new URLSearchParams(
                window.location.search
            );

        const invoiceId =
            params.get(
                "viewInvoice"
            );

        if (invoiceId) {

            await viewInvoice(
                invoiceId
            );

        }

    }
);

window.addEventListener(
    "resize",
    updateInvoicePreviewZoom
);