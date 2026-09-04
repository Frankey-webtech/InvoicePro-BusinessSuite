let recurringInvoices = [];

const recurringStats =
    document.getElementById(
        "recurringStats"
    );

const totalRecurringInvoices =
    document.getElementById(
        "totalRecurringInvoices"
    );

const activeRecurringInvoices =
    document.getElementById(
        "activeRecurringInvoices"
    );

const totalInvoicesGenerated =
    document.getElementById(
        "totalInvoicesGenerated"
    );

const totalRecurringInvoiceValue =
    document.getElementById(
        "totalRecurringInvoiceValue"
    );

const recurringEmptyState =
    document.getElementById(
        "recurringEmptyState"
    );

const createRecurringInvoiceButton =
    document.getElementById(
        "createRecurringInvoiceButton"
    );

const createRecurringInvoiceTopButton =
    document.getElementById(
        "createRecurringInvoiceTopButton"
    );

const recurringPageActions =
    document.getElementById(
        "recurringPageActions"
    );

const recurringInvoiceList =
    document.getElementById(
        "recurringInvoiceList"
    );

const recurringInvoiceModal =
    document.getElementById(
        "recurringInvoiceModal"
    );

const recurringModalTitle =
    document.getElementById(
        "recurringModalTitle"
    );

const closeRecurringModal =
    document.getElementById(
        "closeRecurringModal"
    );

const sourceInvoice =
    document.getElementById(
        "sourceInvoice"
    );

const sourceInvoiceDropdown =
    document.getElementById(
        "sourceInvoiceDropdown"
    );

const sourceInvoiceTrigger =
    document.getElementById(
        "sourceInvoiceTrigger"
    );

const sourceInvoiceSelected =
    document.getElementById(
        "sourceInvoiceSelected"
    );

const sourceInvoiceMenu =
    document.getElementById(
        "sourceInvoiceMenu"
    );

const frequency =
    document.getElementById(
        "frequency"
    );

const startDate =
    document.getElementById(
        "startDate"
    );

const endDate =
    document.getElementById(
        "endDate"
    );

const autoSend =
    document.getElementById(
        "autoSend"
    );

const cancelRecurringInvoice =
    document.getElementById(
        "cancelRecurringInvoice"
    );

const saveRecurringInvoice =
    document.getElementById(
        "saveRecurringInvoice"
    );
    
async function loadRecurringInvoiceStatistics() {

    try {

        const result =
            await Parse.Cloud.run(
                "getRecurringInvoiceStatistics"
            );

        if (
            !result ||
            result.success !== true
        ) {

            throw new Error(
                "Unable to load recurring invoice statistics."
            );

        }

        totalRecurringInvoices.textContent =
            Number(
                result.totalRecurringInvoices
            ) || 0;

        activeRecurringInvoices.textContent =
            Number(
                result.activeRecurringInvoices
            ) || 0;

        totalInvoicesGenerated.textContent =
            Number(
                result.totalInvoicesGenerated
            ) || 0;

        const amount =
            Number(
                result.totalRecurringInvoiceValue
            ) || 0;

        const currencySymbol =
            result.currencySymbol || "";

        totalRecurringInvoiceValue.textContent =
            currencySymbol +
            amount.toLocaleString(
                undefined,
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );

    } catch (error) {

        totalRecurringInvoices.textContent =
            "0";

        activeRecurringInvoices.textContent =
            "0";

        totalInvoicesGenerated.textContent =
            "0";

        totalRecurringInvoiceValue.textContent =
            "0";

    }

}

async function loadRecurringInvoices() {

    try {

        const result =
            await Parse.Cloud.run(
                "getRecurringInvoices"
            );

        if (
            !result ||
            result.success !== true
        ) {

            throw new Error(
                "Unable to load recurring invoices."
            );

        }

        const invoices =
            Array.isArray(
                result.recurringInvoices
            )
                ? result.recurringInvoices
                : [];

        recurringInvoices =
            invoices;

        recurringInvoiceList.innerHTML =
            "";

        if (
            recurringInvoices.length === 0
        ) {

            recurringEmptyState.style.display =
                "block";

            return;

        }

        recurringEmptyState.style.display =
            "none";

        recurringInvoices.forEach(
            recurringInvoice => {

                const card =
                    createRecurringInvoiceCard(
                        recurringInvoice
                    );

                recurringInvoiceList.appendChild(
                    card
                );

            }
        );

    } catch (error) {

        recurringInvoices =
            [];

        recurringInvoiceList.innerHTML =
            "";

        recurringEmptyState.style.display =
            "block";

    }

}

async function openRecurringInvoiceModal() {

    recurringInvoiceModal.dataset.mode =
        "create";

    delete recurringInvoiceModal.dataset.recurringInvoiceId;

    recurringModalTitle.textContent =
        "Create Recurring Invoice";

    saveRecurringInvoice.textContent =
        "Create Recurring Invoice";

    if (sourceInvoice) {

        sourceInvoice.value =
            "";

        sourceInvoice.disabled =
            false;

    }

    if (sourceInvoiceSelected) {
        sourceInvoiceSelected.textContent =
            "Select an invoice";
    }

    if (sourceInvoiceTrigger) {
        sourceInvoiceTrigger.disabled =
            false;
    }

    if (sourceInvoiceDropdown) {
        sourceInvoiceDropdown.classList.remove(
            "open"
        );
    }

    if (sourceInvoiceTrigger) {
        sourceInvoiceTrigger.setAttribute(
            "aria-expanded",
            "false"
        );
    }

    if (frequency) {
        frequency.value = "";
    }

    if (startDate) {
        startDate.value = "";
    }

    if (endDate) {
        endDate.value = "";
    }

    if (autoSend) {
        autoSend.checked = true;
    }

    recurringInvoiceModal.classList.add(
        "active"
    );

    await loadRecurringInvoiceOptions();

}

function closeRecurringInvoiceModal() {

    recurringInvoiceModal.classList.remove(
        "active"
    );

}

function escapeRecurringInvoiceHTML(
    value
) {

    return String(
        value ?? ""
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

function formatRecurringAmount(
    amount,
    currencySymbol
) {

    const numericAmount =
        Number(amount) || 0;

    return (
        escapeRecurringInvoiceHTML(
            currencySymbol || ""
        ) +
        numericAmount.toLocaleString()
    );

}

function getRecurringStatusClass(
    status
) {

    if (
        status === "Paused"
    ) {

        return "status-paused";

    }

    if (
        status === "Stopped"
    ) {

        return "status-stopped";

    }

    return "status-in-progress";

}

function createRecurringInvoiceCard(
    recurringInvoice
) {

    const recurringInvoiceId =
        recurringInvoice.id ||
        recurringInvoice.recurringInvoiceId ||
        "";

    const invoiceNumber =
        recurringInvoice.invoiceNumber ||
        "";

    const clientName =
        recurringInvoice.clientName ||
        "Unknown Client";

    const amount =
        recurringInvoice.totalAmount || 0;

    const currencySymbol =
        recurringInvoice.currencySymbol ||
        "";

    const frequency =
        recurringInvoice.frequency ||
        "";

    const status =
        recurringInvoice.status ||
        "In Progress";

    const statusClass =
        getRecurringStatusClass(
            status
        );

    const card =
        document.createElement(
            "article"
        );

    card.className =
        "recurring-card";

    card.dataset.recurringInvoiceId =
        recurringInvoiceId;

    card.innerHTML = `
        <div class="recurring-main">

            <div class="recurring-column">

                <div class="column-label">
                    Recurring Invoice
                </div>

                <div class="column-value">
                    ${escapeRecurringInvoiceHTML(
                        invoiceNumber
                    )}
                </div>

            </div>


            <div class="recurring-column">

                <div class="column-label">
                    Client
                </div>

                <div class="column-value">
                    ${escapeRecurringInvoiceHTML(
                        clientName
                    )}
                </div>

            </div>


            <div class="recurring-column">

                <div class="column-label">
                    Amount
                </div>

                <div class="column-value">
                    ${formatRecurringAmount(
                        amount,
                        currencySymbol
                    )}
                </div>

            </div>


            <div class="recurring-column">

                <div class="column-label">
                    Frequency
                </div>

                <div class="column-value">
                    ${escapeRecurringInvoiceHTML(
                        frequency
                    )}
                </div>

            </div>


            <div class="recurring-column">

                <div class="column-label">
                    Status
                </div>

                <button
                    type="button"
                    class="status-button ${statusClass}"
                    data-action="status"
                    data-recurring-invoice-id="${escapeRecurringInvoiceHTML(
                        recurringInvoiceId
                    )}"
                >
                    ${escapeRecurringInvoiceHTML(
                        status
                    )}
                </button>

                <div class="status-menu">
                </div>

            </div>


            <div class="recurring-actions">

                <button
                    type="button"
                    class="secondary-button"
                    data-action="view-all"
                    data-recurring-invoice-id="${escapeRecurringInvoiceHTML(
                        recurringInvoiceId
                    )}"
                >
                    View All
                </button>

                <button
                    type="button"
                    class="secondary-button"
                    data-action="edit"
                    data-recurring-invoice-id="${escapeRecurringInvoiceHTML(
                        recurringInvoiceId
                    )}"
                >
                    Edit
                </button>

            </div>

        </div>
    `;

    const statusMenu =
        card.querySelector(
            ".status-menu"
        );

    if (
        status === "In Progress"
    ) {

        statusMenu.innerHTML = `
            <button
                type="button"
                data-action="pause"
                data-recurring-invoice-id="${escapeRecurringInvoiceHTML(
                    recurringInvoiceId
                )}"
            >
                Pause
            </button>

            <button
                type="button"
                data-action="stop"
                data-recurring-invoice-id="${escapeRecurringInvoiceHTML(
                    recurringInvoiceId
                )}"
            >
                Stop
            </button>
        `;

    }

    if (
        status === "Paused"
    ) {

        statusMenu.innerHTML = `
            <button
                type="button"
                data-action="resume"
                data-recurring-invoice-id="${escapeRecurringInvoiceHTML(
                    recurringInvoiceId
                )}"
            >
                Resume
            </button>

            <button
                type="button"
                data-action="stop"
                data-recurring-invoice-id="${escapeRecurringInvoiceHTML(
                    recurringInvoiceId
                )}"
            >
                Stop
            </button>
        `;

    }

    const generatedContainer =
        document.createElement(
            "div"
        );

    generatedContainer.className =
        "generated-invoices";

    card.appendChild(
        generatedContainer
    );

    const viewAllButton =
        card.querySelector(
            '[data-action="view-all"]'
        );

    viewAllButton.addEventListener(
        "click",
        async () => {

            const isOpen =
                viewAllButton.dataset.viewOpen ===
                "true";

            if (isOpen) {

                generatedContainer.style.display =
                    "none";

                viewAllButton.textContent =
                    "View All";

                viewAllButton.dataset.viewOpen =
                    "false";

                return;

            }

            await viewGeneratedInvoices(
                recurringInvoiceId,
                generatedContainer,
                viewAllButton
            );

        }
    );
    
    const editButton =
    card.querySelector(
        '[data-action="edit"]'
    );

    editButton.addEventListener(
    "click",
    () => {

        openEditRecurringInvoiceModal(
            recurringInvoiceId
        );

    }
);

    return card;

}

function renderRecurringInvoices(
    invoices
) {

    recurringInvoices =
        Array.isArray(invoices)
            ? invoices
            : [];

    recurringInvoiceList.innerHTML =
        "";

    if (
        recurringInvoices.length === 0
    ) {

        recurringEmptyState.style.display =
            "block";

        recurringPageActions.style.display =
            "none";

        return;

    }

    recurringEmptyState.style.display =
        "none";

    recurringPageActions.style.display =
        "flex";

    recurringInvoices.forEach(
        recurringInvoice => {

            const card =
                createRecurringInvoiceCard(
                    recurringInvoice
                );

            recurringInvoiceList.appendChild(
                card
            );

        }
    );

}

async function loadRecurringInvoices() {

    try {

        const result =
            await Parse.Cloud.run(
                "getRecurringInvoices"
            );

        if (
            !result ||
            result.success !== true
        ) {

            throw new Error(
                "Unable to load recurring invoices."
            );

        }

        renderRecurringInvoices(
            result.recurringInvoices
        );

    } catch (error) {

        recurringInvoices = [];

        recurringInvoiceList.innerHTML =
            "";

        recurringEmptyState.style.display =
            "block";

    }

}

async function viewGeneratedInvoices(
    recurringInvoiceId,
    generatedContainer,
    button
) {

    if (
        !recurringInvoiceId ||
        !generatedContainer
    ) {
        return;
    }

    try {

        if (
            button
        ) {

            button.disabled = true;

        }

        const response =
            await Parse.Cloud.run(
                "getGeneratedInvoicesForRecurring",
                {
                    recurringInvoiceId:
                        recurringInvoiceId
                }
            );

        if (
            !response ||
            response.success !== true
        ) {

            throw new Error(
                "Unable to load generated invoices."
            );

        }

        const generatedInvoices =
            Array.isArray(
                response.generatedInvoices
            )
                ? response.generatedInvoices
                : [];

        const autoSend =
            response.autoSend !== false;

        generatedContainer.innerHTML = "";

        const header =
            document.createElement(
                "div"
            );

        header.className =
            "generated-header";

        const title =
            document.createElement(
                "h3"
            );

        title.textContent =
            "Generated Invoices";

        const tools =
            document.createElement(
                "div"
            );

        tools.className =
            "generated-tools";

        const outputActions =
            document.createElement(
                "div"
            );

        outputActions.className =
            "output-actions";

        const printButton =
            document.createElement(
                "button"
            );

        printButton.type =
            "button";

        printButton.className =
            "secondary-button";

        printButton.textContent =
            "Print";

        const pdfButton =
            document.createElement(
                "button"
            );

        pdfButton.type =
            "button";

        pdfButton.className =
            "secondary-button";

        pdfButton.textContent =
            "Export as PDF";

        outputActions.appendChild(
            printButton
        );

        outputActions.appendChild(
            pdfButton
        );

        tools.appendChild(
            outputActions
        );

        header.appendChild(
            title
        );

        header.appendChild(
            tools
        );

        generatedContainer.appendChild(
            header
        );

        const tableWrapper =
            document.createElement(
                "div"
            );

        tableWrapper.className =
            "invoice-table-wrapper";

        const table =
            document.createElement(
                "table"
            );

        table.className =
            "invoice-table";

        const thead =
            document.createElement(
                "thead"
            );

        const headerRow =
            document.createElement(
                "tr"
            );

        const headers = [
            "Invoice",
            "Client",
            "Amount",
            "Generated Date",
            "Status",
            "Action"
        ];

        headers.forEach(
            label => {

                const th =
                    document.createElement(
                        "th"
                    );

                th.textContent =
                    label;

                headerRow.appendChild(
                    th
                );

            }
        );

        thead.appendChild(
            headerRow
        );

        const tbody =
            document.createElement(
                "tbody"
            );

        generatedInvoices.forEach(
            invoice => {

                const row =
                    document.createElement(
                        "tr"
                    );

                const invoiceCell =
                    document.createElement(
                        "td"
                    );

                invoiceCell.className =
                    "invoice-number";

                invoiceCell.textContent =
                    invoice.invoiceNumber ||
                    "";

                const clientCell =
                    document.createElement(
                        "td"
                    );

                clientCell.textContent =
                    invoice.clientName ||
                    "Unknown Client";

                const amountCell =
                    document.createElement(
                        "td"
                    );

                const currencySymbol =
                    invoice.currencySymbol ||
                    "";

                const amount =
                    Number(
                        invoice.amount
                    ) || 0;

                amountCell.textContent =
                    currencySymbol +
                    amount.toLocaleString();

                const dateCell =
                    document.createElement(
                        "td"
                    );

                if (
                    invoice.generatedDate
                ) {

                    const generatedDate =
                        new Date(
                            invoice.generatedDate
                        );

                    dateCell.textContent =
                        generatedDate.toLocaleDateString(
                            undefined,
                            {
                                year: "numeric",
                                month: "long",
                                day: "numeric"
                            }
                        );

                } else {

                    dateCell.textContent =
                        "—";

                }

                const statusCell =
                    document.createElement(
                        "td"
                    );

                statusCell.textContent =
                    invoice.status ||
                    "";

                const actionCell =
                    document.createElement(
                        "td"
                    );

                if (
                    autoSend === false
                ) {

                    const sendButton =
                        document.createElement(
                            "button"
                        );

                    sendButton.type =
                        "button";

                    sendButton.className =
                        "send-button";

                    sendButton.textContent =
                        "Send";

                    sendButton.dataset.invoiceId =
                        invoice.id ||
                        "";

                    actionCell.appendChild(
                        sendButton
                    );

                } else {

                    actionCell.textContent =
                        "—";

                }

                row.appendChild(
                    invoiceCell
                );

                row.appendChild(
                    clientCell
                );

                row.appendChild(
                    amountCell
                );

                row.appendChild(
                    dateCell
                );

                row.appendChild(
                    statusCell
                );

                row.appendChild(
                    actionCell
                );

                tbody.appendChild(
                    row
                );

            }
        );

        if (
            generatedInvoices.length === 0
        ) {

            const emptyRow =
                document.createElement(
                    "tr"
                );

            const emptyCell =
                document.createElement(
                    "td"
                );

            emptyCell.colSpan = 6;

            emptyCell.textContent =
                "No invoices have been generated yet.";

            emptyRow.appendChild(
                emptyCell
            );

            tbody.appendChild(
                emptyRow
            );

        }
        
        const nextInvoiceRow =
    document.createElement(
        "tr"
    );

nextInvoiceRow.className =
    "next-invoice-row";

const nextInvoiceLabelCell =
    document.createElement(
        "td"
    );

nextInvoiceLabelCell.className =
    "next-invoice-label";

nextInvoiceLabelCell.textContent =
    "Next Invoice";

const nextInvoiceClientCell =
    document.createElement(
        "td"
    );

const nextInvoiceClient =
    response.clientName ||
    "";

nextInvoiceClientCell.textContent =
    nextInvoiceClient ||
    "—";

const nextInvoiceAmountCell =
    document.createElement(
        "td"
    );

const nextInvoiceCurrencySymbol =
    response.currencySymbol ||
    "";

const nextInvoiceAmount =
    Number(
        response.amount
    ) || 0;

nextInvoiceAmountCell.textContent =
    response.amount !== undefined &&
    response.amount !== null
        ? nextInvoiceCurrencySymbol +
          nextInvoiceAmount.toLocaleString()
        : "—";

const nextInvoiceDateCell =
    document.createElement(
        "td"
    );

nextInvoiceDateCell.className =
    "next-invoice-date";

if (
    response.nextGenerationDate
) {

    const nextDate =
        new Date(
            response.nextGenerationDate
        );

    nextInvoiceDateCell.textContent =
        nextDate.toLocaleDateString(
            undefined,
            {
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );

} else {

    nextInvoiceDateCell.textContent =
        "—";

}

const nextInvoiceStatusCell =
    document.createElement(
        "td"
    );

nextInvoiceStatusCell.textContent =
    "Scheduled";

const nextInvoiceActionCell =
    document.createElement(
        "td"
    );

nextInvoiceActionCell.textContent =
    "—";

nextInvoiceRow.appendChild(
    nextInvoiceLabelCell
);

nextInvoiceRow.appendChild(
    nextInvoiceClientCell
);

nextInvoiceRow.appendChild(
    nextInvoiceAmountCell
);

nextInvoiceRow.appendChild(
    nextInvoiceDateCell
);

nextInvoiceRow.appendChild(
    nextInvoiceStatusCell
);

nextInvoiceRow.appendChild(
    nextInvoiceActionCell
);

tbody.appendChild(
    nextInvoiceRow
);

        table.appendChild(
            thead
        );

        table.appendChild(
            tbody
        );

        tableWrapper.appendChild(
            table
        );

        generatedContainer.appendChild(
            tableWrapper
        );

        const autoSendSection =
            document.createElement(
                "div"
            );

        autoSendSection.className =
            "auto-send-section";

        const autoSendRow =
            document.createElement(
                "div"
            );

        autoSendRow.className =
            "auto-send-row";

        const autoSendContent =
            document.createElement(
                "div"
            );

        const autoSendTitle =
            document.createElement(
                "div"
            );

        autoSendTitle.className =
            "auto-send-title";

        autoSendTitle.textContent =
            "Automatically send invoices";

        const autoSendDescription =
            document.createElement(
                "div"
            );

        autoSendDescription.className =
            "auto-send-description";

        autoSendDescription.textContent =
            "Automatically send each generated invoice to the client's email. Turn this off to manually send invoices one by one.";

        autoSendContent.appendChild(
            autoSendTitle
        );

        autoSendContent.appendChild(
            autoSendDescription
        );

        const toggleLabel =
            document.createElement(
                "label"
            );

        toggleLabel.className =
            "toggle";

        const toggleInput =
            document.createElement(
                "input"
            );

        toggleInput.type =
            "checkbox";

        toggleInput.checked =
            autoSend;

        const toggleSlider =
            document.createElement(
                "span"
            );

        toggleSlider.className =
            "toggle-slider";

        toggleLabel.appendChild(
            toggleInput
        );

        toggleLabel.appendChild(
            toggleSlider
        );

        autoSendRow.appendChild(
            autoSendContent
        );

        autoSendRow.appendChild(
            toggleLabel
        );

        autoSendSection.appendChild(
            autoSendRow
        );

        generatedContainer.appendChild(
            autoSendSection
        );

        generatedContainer.style.display =
            "block";

        if (
            button
        ) {

            button.textContent =
                "Hide All";

            button.disabled =
                false;

            button.dataset.viewOpen =
                "true";

        }

    } catch (error) {

        generatedContainer.innerHTML = "";

        const errorMessage =
            document.createElement(
                "div"
            );

        errorMessage.textContent =
            error.message ||
            "Unable to load generated invoices.";

        generatedContainer.appendChild(
            errorMessage
        );

        generatedContainer.style.display =
            "block";

        if (
            button
        ) {

            button.disabled =
                false;

        }

    }

}

async function openEditRecurringInvoiceModal(
    recurringInvoiceId
) {

    await loadRecurringInvoiceOptions();

    const recurringInvoice =
        recurringInvoices.find(
            invoice =>
                invoice.id ===
                recurringInvoiceId
        );

    if (!recurringInvoice) {
        return;
    }

    recurringInvoiceModal.dataset.mode =
        "edit";

    recurringInvoiceModal.dataset.recurringInvoiceId =
        recurringInvoiceId;

    recurringModalTitle.textContent =
        "Edit Recurring Invoice";

    saveRecurringInvoice.textContent =
        "Update Recurring Invoice";

    if (sourceInvoice) {

        sourceInvoice.value =
            recurringInvoice.sourceInvoiceId ||
            "";

        sourceInvoice.disabled =
            true;

    }

    if (sourceInvoiceSelected) {

        const selectedOption =
            sourceInvoiceMenu
                ? sourceInvoiceMenu.querySelector(
                    `[data-value="${CSS.escape(
                        recurringInvoice.sourceInvoiceId || ""
                    )}"]`
                )
                : null;

        sourceInvoiceSelected.textContent =
            selectedOption
                ? selectedOption.textContent
                : "Select an invoice";

    }

    if (sourceInvoiceTrigger) {
        sourceInvoiceTrigger.disabled =
            true;

        sourceInvoiceTrigger.setAttribute(
            "aria-expanded",
            "false"
        );
    }

    if (sourceInvoiceDropdown) {
        sourceInvoiceDropdown.classList.remove(
            "open"
        );
    }

    if (frequency) {

        frequency.value =
            recurringInvoice.frequency ||
            "";

    }

    if (startDate) {

        startDate.value =
            formatDateForRecurringInput(
                recurringInvoice.startDate
            );

    }

    if (endDate) {

        endDate.value =
            formatDateForRecurringInput(
                recurringInvoice.endDate
            );

    }

    if (autoSend) {

        autoSend.checked =
            recurringInvoice.autoSend !== false;

    }

    recurringInvoiceModal.classList.add(
        "active"
    );

}

function formatDateForRecurringInput(
    date
) {

    if (!date) {
        return "";
    }

    const parsedDate =
        new Date(date);

    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {
        return "";
    }

    const year =
        parsedDate.getFullYear();

    const month =
        String(
            parsedDate.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            parsedDate.getDate()
        ).padStart(
            2,
            "0"
        );

    return (
        year +
        "-" +
        month +
        "-" +
        day
    );

}

async function saveOrUpdateRecurringInvoice() {

    const mode =
        recurringInvoiceModal.dataset.mode ||
        "create";

    const recurringInvoiceId =
        recurringInvoiceModal.dataset.recurringInvoiceId ||
        "";

    const selectedFrequency =
        frequency.value;

    const selectedStartDate =
        startDate.value;

    const selectedEndDate =
        endDate.value;

    const selectedAutoSend =
        autoSend.checked;

    if (!selectedFrequency) {
        return;
    }

    if (!selectedStartDate) {
        return;
    }

    try {

        saveRecurringInvoice.disabled =
            true;
            
        saveRecurringInvoice.textContent =
        mode === "edit"
            ? "Updating..."
            : "Creating...";

        if (mode === "edit") {

            const result =
                await Parse.Cloud.run(
                    "updateRecurringInvoice",
                    {
                        recurringInvoiceId:
                            recurringInvoiceId,

                        frequency:
                            selectedFrequency,

                        startDate:
                            selectedStartDate,

                        endDate:
                            selectedEndDate ||
                            null,

                        autoSend:
                            selectedAutoSend
                    }
                );

            if (
                !result ||
                result.success !== true
            ) {

                throw new Error(
                    "Unable to update recurring invoice."
                );

            }

        } else {

            const result =
                await Parse.Cloud.run(
                    "createRecurringInvoice",
                    {
                        invoiceId:
                            sourceInvoice.value,

                        frequency:
                            selectedFrequency,

                        startDate:
                            selectedStartDate,

                        endDate:
                            selectedEndDate ||
                            null,

                        autoSend:
                            selectedAutoSend
                    }
                );

            if (
                !result ||
                result.success !== true
            ) {

                throw new Error(
                    "Unable to create recurring invoice."
                );

            }

        }

        closeRecurringInvoiceModal();

        await Promise.all([
    loadRecurringInvoices(),
    loadRecurringInvoiceStatistics()
]);

    } catch (error) {

        alert(
            error.message ||
            "Unable to save recurring invoice."
        );

    } finally {

        saveRecurringInvoice.disabled =
            false;

    }

}

async function loadRecurringInvoiceOptions() {

    const invoiceInput =
        document.getElementById(
            "sourceInvoice"
        );

    const invoiceDropdown =
        document.getElementById(
            "sourceInvoiceDropdown"
        );

    const invoiceTrigger =
        document.getElementById(
            "sourceInvoiceTrigger"
        );

    const invoiceSelected =
        document.getElementById(
            "sourceInvoiceSelected"
        );

    const invoiceMenu =
        document.getElementById(
            "sourceInvoiceMenu"
        );

    if (
        !invoiceInput ||
        !invoiceDropdown ||
        !invoiceTrigger ||
        !invoiceSelected ||
        !invoiceMenu
    ) {
        return;
    }

    invoiceSelected.textContent =
        "Select Invoice";

    invoiceMenu.innerHTML =
        "";

    try {

        const result =
            await Parse.Cloud.run(
                "getInvoicesForRecurring"
            );

        if (
            !result ||
            result.success !== true
        ) {

            throw new Error(
                result?.message ||
                "Unable to load invoices."
            );

        }

        const invoices =
            Array.isArray(
                result.invoices
            )
                ? result.invoices
                : [];

        invoiceMenu.innerHTML =
            "";

        if (
            invoices.length === 0
        ) {

            invoiceSelected.textContent =
                "No invoices available";

            const emptyOption =
                document.createElement(
                    "div"
                );

            emptyOption.className =
                "custom-invoice-option placeholder";

            emptyOption.textContent =
                "No invoices available";

            invoiceMenu.appendChild(
                emptyOption
            );

            return;

        }

        invoices.forEach(
            invoice => {

                const option =
                    document.createElement(
                        "button"
                    );

                option.type =
                    "button";

                option.className =
                    "custom-invoice-option";

                option.setAttribute(
                    "role",
                    "option"
                );

                option.dataset.value =
                    invoice.id || "";

                const amount =
                    Number(
                        invoice.totalAmount
                    ) || 0;

                const currency =
                    invoice.currencySymbol ||
                    invoice.currencyCode ||
                    "";

                option.textContent =
                    `${invoice.invoiceNumber || "Invoice"} - ${invoice.clientName || "Unknown Client"} - ${currency}${amount.toLocaleString()}`;

                option.addEventListener(
                    "click",
                    function () {

                        invoiceInput.value =
                            invoice.id || "";

                        invoiceSelected.textContent =
                            option.textContent;

                        invoiceMenu
                            .querySelectorAll(
                                ".custom-invoice-option.selected"
                            )
                            .forEach(
                                selectedOption => {
                                    selectedOption.classList.remove(
                                        "selected"
                                    );
                                }
                            );

                        option.classList.add(
                            "selected"
                        );

                        invoiceDropdown.classList.remove(
                            "open"
                        );

                        invoiceTrigger.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                    }
                );

                invoiceMenu.appendChild(
                    option
                );

            }
        );

        invoiceTrigger.onclick =
            function () {

                if (
                    invoiceTrigger.disabled
                ) {
                    return;
                }

                const isOpen =
                    invoiceDropdown.classList.toggle(
                        "open"
                    );

                invoiceTrigger.setAttribute(
                    "aria-expanded",
                    String(isOpen)
                );

            };

    } catch (error) {

        invoiceSelected.textContent =
            error?.message ||
            "Unable to load invoices.";

        invoiceMenu.innerHTML =
            "";

        const errorOption =
            document.createElement(
                "div"
            );

        errorOption.className =
            "custom-invoice-option placeholder";

        errorOption.textContent =
            error?.message ||
            "Unable to load invoices.";

        invoiceMenu.appendChild(
            errorOption
        );

    }

}

async function updateRecurringStatus(
    recurringInvoiceId,
    action
) {

    if (!recurringInvoiceId) {
        return;
    }

    try {

        const result =
            await Parse.Cloud.run(
                "updateRecurringInvoiceStatus",
                {
                    recurringInvoiceId:
                        recurringInvoiceId,

                    action:
                        action
                }
            );

        if (!result?.success) {
            throw new Error(
                "Unable to update recurring invoice status."
            );
        }

        await loadRecurringInvoices();

        await loadRecurringInvoiceStatistics();

    } catch (error) {

        alert(
            error.message ||
            "Unable to update recurring invoice status."
        );

    }

}

async function checkRecurringInvoicePlanAccess() {

    try {

        const result =
            await Parse.Cloud.run(
                "getCurrentSubscription"
            );

        if (
            !result ||
            result.success !== true
        ) {
            throw new Error(
                "Unable to verify your current subscription."
            );
        }

        const currentSubscription =
            result.currentSubscription || {};

        const plan =
            String(
                currentSubscription.plan ||
                result.plan ||
                "Free"
            ).toLowerCase();

        if (
            plan === "free" ||
            plan === "starter"
        ) {

            showRecurringInvoiceUpgradeOverlay();

            return false;
        }

        return true;

    } catch (error) {

        console.error(
            "Subscription check error:",
            error
        );

        showRecurringInvoiceUpgradeOverlay();

        return false;
    }
}

const upgradeButton =
    document.getElementById(
        "upgradeButton"
    );

if (upgradeButton) {

    upgradeButton.addEventListener(
        "click",
        () => {

            window.location.href =
                "subscription.html";

        }
    );

}

if (typeof Parse !== "undefined") {

    checkRecurringInvoicePlanAccess();

} else {

    window.addEventListener(
        "load",
        checkRecurringInvoicePlanAccess
    );

}


document.addEventListener(
    "click",
    async event => {

        const actionButton =
            event.target.closest(
                ".status-menu button"
            );

        if (!actionButton) {
            return;
        }

        const action =
            actionButton.dataset.action;

        const recurringInvoiceId =
            actionButton.dataset.recurringInvoiceId;

        if (
            !action ||
            !recurringInvoiceId
        ) {
            return;
        }

        if (
            action === "stop"
        ) {

            const confirmed =
                confirm(
                    "Are you sure you want to stop this recurring invoice permanently?"
                );

            if (!confirmed) {
                return;
            }

        }

        await updateRecurringStatus(
            recurringInvoiceId,
            action
        );

    }
);

document.addEventListener(
    "click",
    event => {

        const statusButton =
            event.target.closest(
                ".status-button"
            );

        if (!statusButton) {

            if (
                !event.target.closest(
                    ".status-menu"
                )
            ) {

                document
                    .querySelectorAll(
                        ".status-menu"
                    )
                    .forEach(
                        menu => {
                            menu.style.display =
                                "none";
                        }
                    );

            }

            return;

        }

        const card =
            statusButton.closest(
                ".recurring-card"
            );

        if (!card) {
            return;
        }

        const menu =
            card.querySelector(
                ".status-menu"
            );

        if (!menu) {
            return;
        }

        document
            .querySelectorAll(
                ".status-menu"
            )
            .forEach(
                otherMenu => {

                    if (
                        otherMenu !== menu
                    ) {

                        otherMenu.style.display =
                            "none";

                    }

                }
            );

        menu.style.display =
            menu.style.display === "block"
                ? "none"
                : "block";

    }
);

createRecurringInvoiceButton.onclick = async function () {
        await openRecurringInvoiceModal();
    };

createRecurringInvoiceTopButton.onclick = async function () {
        await openRecurringInvoiceModal();
    };

loadRecurringInvoices();
loadRecurringInvoiceStatistics();

closeRecurringModal.addEventListener(
    "click",
    closeRecurringInvoiceModal
);

cancelRecurringInvoice.addEventListener(
    "click",
    closeRecurringInvoiceModal
);

saveRecurringInvoice.addEventListener(
    "click",
    saveOrUpdateRecurringInvoice
);