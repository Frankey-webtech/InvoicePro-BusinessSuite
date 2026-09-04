const historyTableBody =
    document.querySelector(".history-table tbody");

const paymentModalOverlay =
    document.querySelector(".subscriptionModalOverlay");

const closePaymentModal =
    document.querySelector(".closePaymentModal");

const closeBtn =
    document.querySelector(".closeBtn");

const receiptBtn =
    document.querySelector(".receiptBtn");

const printBtn =
    document.querySelector(".printBtn");

const rowsPerPage =
    document.getElementById("rowsPerPage");

const totalPayments =
    document.getElementById("totalPayments");

const totalSpent =
    document.getElementById("totalSpent");

const activePlan =
    document.getElementById("activePlan");

const activePlanBilling =
    document.getElementById("activePlanBilling");

const renewalDateCard =
    document.getElementById("renewalDateCard");

const renewalSmall =
    document.getElementById("renewalSmall");

const providerName =
    document.getElementById("providerName");

const paymentAmount =
    document.getElementById("modalPaymentAmount");

const paymentDescription =
    document.getElementById("paymentDescription");

const successBadge =
    document.getElementById("modalStatus");

const resultsText =
    document.querySelector(".results-text");

const previousPageButton =
    document.querySelector(".prev-page");

const currentPageButton =
    document.querySelector(".page-current");

const nextPageNumberButton =
    document.querySelector(".page-next-number");

const nextPageButton =
    document.querySelector(".next-page");

let payments = [];

let currentPayment = null;

let currentSubscription = null;

let currentPage = 1;

let rows = 6;

const currencySymbols = {
    NGN: "₦",
    USD: "$",
    GBP: "£",
    EUR: "€",
    CAD: "C$",
    AUD: "A$",
    ZAR: "R",
    GHS: "₵",
    KES: "KSh",
    UGX: "USh",
    TZS: "TSh",
    RWF: "FRw",
    XOF: "CFA",
    XAF: "FCFA",
    INR: "₹",
    JPY: "¥",
    CNY: "¥",
    AED: "د.إ",
    SAR: "﷼"
};

document.addEventListener("DOMContentLoaded", initializeSubscriptionHistory);

async function initializeSubscriptionHistory() {
    try {
        await loadCurrentSubscription();
        await loadSubscriptionHistory();
    } catch (error) {
        console.error(
            "Subscription History Error:",
            error
        );
    }
}

async function loadCurrentSubscription() {
    try {
        const response =
            await Parse.Cloud.run(
                "getCurrentSubscription"
            );

        if (
            !response ||
            response.success !== true
        ) {
            return;
        }

        currentSubscription = response;

        activePlan.textContent =
            response.plan || "Free";

        activePlanBilling.textContent =
            response.planBilling || "--";

        updateRenewalDisplay(
            response.renewalDate
        );

    } catch (error) {
        console.error(
            "Subscription Error:",
            error
        );
    }
}

function updateRenewalDisplay(renewalValue) {
    if (!renewalValue) {
        renewalDateCard.textContent = "--";
        renewalSmall.textContent = "No renewal";
        return;
    }

    const renewal =
        new Date(renewalValue);

    if (
        Number.isNaN(
            renewal.getTime()
        )
    ) {
        renewalDateCard.textContent = "--";
        renewalSmall.textContent = "No renewal";
        return;
    }

    renewalDateCard.textContent =
        formatDate(
            renewal,
            "short"
        );

    const today = new Date();

    const diff =
        Math.ceil(
            (
                renewal - today
            ) /
            (1000 * 60 * 60 * 24)
        );

    if (diff > 0) {
        renewalSmall.textContent =
            `In ${diff} days`;
    } else if (diff === 0) {
        renewalSmall.textContent =
            "Today";
    } else {
        renewalSmall.textContent =
            "Expired";
    }
}

async function loadSubscriptionHistory() {
    try {
        const response =
            await Parse.Cloud.run(
                "getSubscriptionPayments"
            );

        if (
            !response ||
            response.success !== true
        ) {
            payments = [];
            renderSubscriptionHistory();
            updateTableFooter();
            updatePagination();
            updateSummary();
            return;
        }

        payments =
            Array.isArray(
                response.payments
            )
                ? response.payments
                : [];

        currentPage = 1;

        updateSummary();
        renderSubscriptionHistory();
        updateTableFooter();
        updatePagination();

    } catch (error) {
        console.error(
            "Subscription Payment History Error:",
            error
        );

        payments = [];

        updateSummary();
        renderSubscriptionHistory();
        updateTableFooter();
        updatePagination();
    }
}

function updateSummary() {
    totalPayments.textContent =
        payments.length;

    const successfulPayments =
        payments.filter(
            payment =>
                normalizeStatus(
                    payment.status
                ) === "success"
        );

    let total = 0;

    successfulPayments.forEach(
        payment => {
            const amount =
                Number(payment.amount);

            if (
                Number.isFinite(amount)
            ) {
                total += amount;
            }
        }
    );

    const currencyCode =
        getPreferredCurrencyCode();

    totalSpent.textContent =
        formatMoney(
            total,
            currencyCode
        );
}

function getPreferredCurrencyCode() {
    const subscriptionCurrency =
        currentSubscription?.currency?.code;

    if (subscriptionCurrency) {
        return String(
            subscriptionCurrency
        ).toUpperCase();
    }

    const firstPayment =
        payments.find(
            payment =>
                payment.currency
        );

    return firstPayment
        ? String(
            firstPayment.currency
        ).toUpperCase()
        : "NGN";
}

function getCurrencySymbol(currencyCode) {
    const code =
        String(
            currencyCode || ""
        ).toUpperCase();

    if (
        currentSubscription?.currency?.code &&
        String(
            currentSubscription.currency.code
        ).toUpperCase() === code &&
        currentSubscription.currency.symbol
    ) {
        return currentSubscription.currency.symbol;
    }

    return currencySymbols[code] || `${code} `;
}

function formatMoney(
    amount,
    currencyCode
) {
    const numericAmount =
        Number(amount);

    if (
        !Number.isFinite(
            numericAmount
        )
    ) {
        return "--";
    }

    return (
        getCurrencySymbol(
            currencyCode
        ) +
        numericAmount.toLocaleString(
            "en-US",
            {
                minimumFractionDigits:
                    Number.isInteger(
                        numericAmount
                    )
                        ? 0
                        : 2,
                maximumFractionDigits: 2
            }
        )
    );
}

function normalizeStatus(status) {
    return String(
        status || ""
    )
        .trim()
        .toLowerCase();
}

function getStatusClass(status) {
    const normalized =
        normalizeStatus(status);

    if (
        normalized === "success" ||
        normalized === "successful" ||
        normalized === "paid" ||
        normalized === "completed"
    ) {
        return "success";
    }

    if (
        normalized === "pending" ||
        normalized === "processing"
    ) {
        return "pending";
    }

    if (
        normalized === "failed" ||
        normalized === "failure" ||
        normalized === "cancelled" ||
        normalized === "canceled"
    ) {
        return "failed";
    }

    return "pending";
}

function getStatusIcon(status) {
    const statusClass =
        getStatusClass(status);

    if (
        statusClass === "success"
    ) {
        return "ri-checkbox-circle-fill";
    }

    if (
        statusClass === "failed"
    ) {
        return "ri-close-circle-fill";
    }

    return "ri-time-fill";
}

function escapeHtml(value) {
    return String(
        value ?? ""
    )
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function getDate(value) {
    if (!value) {
        return null;
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return null;
    }

    return date;
}

function formatDate(
    value,
    style = "short"
) {
    const date =
        value instanceof Date
            ? value
            : getDate(value);

    if (!date) {
        return "--";
    }

    return date.toLocaleDateString(
        "en-US",
        style === "long"
            ? {
                month: "long",
                day: "numeric",
                year: "numeric"
            }
            : {
                month: "short",
                day: "numeric",
                year: "numeric"
            }
    );
}

function formatTime(value) {
    const date =
        value instanceof Date
            ? value
            : getDate(value);

    if (!date) {
        return "--";
    }

    return date.toLocaleTimeString(
        "en-US",
        {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        }
    );
}

function renderSubscriptionHistory() {
    historyTableBody.innerHTML = "";

    const start =
        (currentPage - 1) * rows;

    const end =
        start + rows;

    const pagePayments =
        payments.slice(
            start,
            end
        );

    if (
        pagePayments.length === 0
    ) {
        historyTableBody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-history">
                    No subscription payment records found.
                </td>
            </tr>
        `;
        return;
    }

    pagePayments.forEach(
        payment => {
            const paymentDate =
                getDate(
                    payment.paymentDate ||
                    payment.paidAt
                );

            const renewalDate =
                getDate(
                    payment.renewalDate
                );

            const reference =
                String(
                    payment.reference || "--"
                );

            const shortReference =
                reference.length > 18
                    ? reference.substring(
                        0,
                        18
                    ) + "..."
                    : reference;

            const status =
                payment.status ||
                "Pending";

            const statusClass =
                getStatusClass(
                    status
                );

            const statusIcon =
                getStatusIcon(
                    status
                );

            const paymentMethod =
                payment.paymentMethod ||
                "Card";

            const row =
                document.createElement(
                    "tr"
                );

            row.innerHTML = `
                <td>
                    <div class="payment-date">
                        <strong>${escapeHtml(formatDate(paymentDate))}</strong>
                        <span>${escapeHtml(formatTime(paymentDate))}</span>
                    </div>
                </td>

                <td>
                    <div class="reference">
                        <span
                            class="reference-text"
                            title="${escapeHtml(reference)}"
                        >${escapeHtml(shortReference)}</span>
                        ${
                            reference !== "--"
                                ? `<button
                                    class="copyReference"
                                    type="button"
                                    data-reference="${escapeHtml(reference)}"
                                    aria-label="Copy payment reference"
                                ><i class="ri-file-copy-line"></i></button>`
                                : ""
                        }
                    </div>
                </td>

                <td>
                    ${escapeHtml(
                        payment.plan || "--"
                    )}
                </td>

                <td>
                    <strong>
                        ${escapeHtml(
                            formatMoney(
                                payment.amount,
                                payment.currency
                            )
                        )}
                    </strong>
                </td>

                <td>
                    ${escapeHtml(
                        payment.billing || "--"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        paymentMethod
                    )}
                </td>

                <td>
                    <span class="status ${statusClass}">
                        <i class="${statusIcon}"></i>
                        ${escapeHtml(status)}
                    </span>
                </td>

                <td>
                    ${
                        renewalDate
                            ? escapeHtml(
                                formatDate(
                                    renewalDate
                                )
                            )
                            : "--"
                    }
                </td>

                <td>
                    <button
                        class="view-btn"
                        type="button"
                        data-id="${escapeHtml(
                            payment.id || ""
                        )}"
                    >
                        <i class="ri-eye-line"></i>
                        View
                    </button>
                </td>
            `;

            historyTableBody.appendChild(
                row
            );
        }
    );

    attachCopyEvents();
    attachViewEvents();
}

function attachCopyEvents() {
    document
        .querySelectorAll(
            ".copyReference"
        )
        .forEach(
            button => {
                button.onclick =
                    async () => {
                        const reference =
                            button.dataset.reference;

                        if (!reference) {
                            return;
                        }

                        try {
                            await copyText(
                                reference
                            );

                            button.innerHTML =
                                '<i class="ri-check-line"></i>';

                            setTimeout(
                                () => {
                                    button.innerHTML =
                                        '<i class="ri-file-copy-line"></i>';
                                },
                                1200
                            );
                        } catch (error) {
                            console.error(
                                "Copy Reference Error:",
                                error
                            );
                        }
                    };
            }
        );
}

async function copyText(text) {
    if (
        navigator.clipboard &&
        window.isSecureContext
    ) {
        await navigator.clipboard.writeText(
            text
        );
        return;
    }

    const textarea =
        document.createElement(
            "textarea"
        );

    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";

    document.body.appendChild(
        textarea
    );

    textarea.focus();
    textarea.select();

    const copied =
        document.execCommand(
            "copy"
        );

    textarea.remove();

    if (!copied) {
        throw new Error(
            "Unable to copy reference."
        );
    }
}

function attachViewEvents() {
    document
        .querySelectorAll(
            ".view-btn"
        )
        .forEach(
            button => {
                button.onclick =
                    () => {
                        const payment =
                            payments.find(
                                item =>
                                    String(
                                        item.id
                                    ) ===
                                    String(
                                        button.dataset.id
                                    )
                            );

                        if (!payment) {
                            return;
                        }

                        currentPayment =
                            payment;

                        openSubscriptionModal(
                            payment
                        );
                    };
            }
        );
}

function openSubscriptionModal(
    payment
) {
    const status =
        payment.status ||
        "Pending";

    const statusClass =
        getStatusClass(
            status
        );

    const paymentDate =
        getDate(
            payment.paymentDate ||
            payment.paidAt
        );

    const paidAt =
        getDate(
            payment.paidAt ||
            payment.paymentDate
        );

    const renewalDate =
        getDate(
            payment.renewalDate
        );

    const provider =
        "Paystack";

    const method =
        payment.paymentMethod ||
        "Card";

    providerName.textContent =
        provider;

    paymentAmount.textContent =
        formatMoney(
            payment.amount,
            payment.currency
        );

    paymentDescription.textContent =
        `${
            payment.plan || "Subscription"
        } ${
            payment.billing || ""
        } Subscription`.trim();

    successBadge.className =
        `successBadge ${statusClass}`;

    successBadge.innerHTML =
        `<i class="${getStatusIcon(status)}"></i>${escapeHtml(status)}`;

    setText(
        "modalReference",
        payment.reference || "--"
    );

    setText(
        "modalTransactionId",
        payment.transactionId || "--"
    );

    setText(
        "modalPaymentProvider",
        provider
    );

    setText(
        "modalPlan",
        payment.plan || "--"
    );

    setText(
        "modalBilling",
        payment.billing || "--"
    );

    setText(
        "modalPaymentMethod",
        method
    );

    setText(
        "modalPaymentDate",
        formatDate(
            paymentDate,
            "long"
        )
    );

    setText(
        "modalPaymentTime",
        formatTime(paymentDate)
    );

    setText(
        "modalRenewalDate",
        renewalDate
            ? formatDate(
                renewalDate,
                "long"
            )
            : "--"
    );

    setText(
        "modalCurrency",
        payment.currency
            ? String(
                payment.currency
            ).toUpperCase()
            : "--"
    );

    setText(
        "modalTransactionFee",
        payment.transactionFee !==
            null &&
        payment.transactionFee !==
            undefined
            ? formatMoney(
                payment.transactionFee,
                "NGN"
            )
            : "--"
    );

    setText(
        "modalCustomerEmail",
        payment.customerEmail || "--"
    );

    setText(
        "modalAccountStatus",
        currentSubscription?.subscriptionStatus ||
        "--"
    );

    setTimeline(
        "timelineInitiatedDate",
        "timelineInitiatedTime",
        paymentDate
    );

    setTimeline(
        "timelineConfirmedDate",
        "timelineConfirmedTime",
        paidAt
    );

    setTimeline(
        "timelineActivatedDate",
        "timelineActivatedTime",
        paymentDate
    );

    setText(
        "timelineInitiatedTitle",
        "Payment Recorded"
    );

    setText(
        "timelineConfirmedTitle",
        statusClass === "success"
            ? "Payment Confirmed"
            : "Payment Status"
    );

    setText(
        "timelineActivatedTitle",
        statusClass === "success"
            ? "Subscription Activated"
            : "Subscription Status"
    );

    setText(
        "timelineMessage",
        statusClass === "success"
            ? "Payment was successfully recorded and the subscription was activated."
            : `Payment status: ${status}.`
    );

    setText(
        "modalReceiptReference",
        payment.reference || "--"
    );

    setText(
        "modalReceiptPlan",
        payment.plan
            ? `${payment.plan} ${payment.billing || ""} Subscription`.trim()
            : "--"
    );

    setText(
        "modalReceiptAmount",
        formatMoney(
            payment.amount,
            payment.currency
        )
    );

    setText(
        "modalReceiptProvider",
        provider
    );

    setText(
        "modalReceiptDate",
        formatDate(
            paymentDate,
            "long"
        )
    );

    paymentModalOverlay.style.display =
        "flex";

    paymentModalOverlay.classList.add(
        "active"
    );
}

function setTimeline(
    dateId,
    timeId,
    value
) {
    setText(
        dateId,
        formatDate(
            value,
            "long"
        )
    );

    setText(
        timeId,
        formatTime(value)
    );
}

function setText(
    id,
    value
) {
    const element =
        document.getElementById(id);

    if (!element) {
        return;
    }

    element.textContent =
        value === null ||
        value === undefined ||
        value === ""
            ? "--"
            : String(value);
}

function closeSubscriptionModal() {
    paymentModalOverlay.style.display =
        "none";

    paymentModalOverlay.classList.remove(
        "active"
    );

    currentPayment = null;
}

if (closePaymentModal) {
    closePaymentModal.onclick =
        closeSubscriptionModal;
}

if (closeBtn) {
    closeBtn.onclick =
        closeSubscriptionModal;
}

if (paymentModalOverlay) {
    paymentModalOverlay.onclick =
        event => {
            if (
                event.target ===
                paymentModalOverlay
            ) {
                closeSubscriptionModal();
            }
        };
}

document.addEventListener(
    "keydown",
    event => {
        if (
            event.key === "Escape"
        ) {
            closeSubscriptionModal();
        }
    }
);

if (rowsPerPage) {
    rowsPerPage.addEventListener(
        "change",
        function () {
            const selectedRows =
                Number(
                    this.value
                );

            rows =
                Number.isFinite(
                    selectedRows
                ) &&
                selectedRows > 0
                    ? selectedRows
                    : 6;

            currentPage = 1;

            renderSubscriptionHistory();
            updateTableFooter();
            updatePagination();
        }
    );
}

function updateTableFooter() {
    const start =
        payments.length === 0
            ? 0
            : (
                (currentPage - 1) *
                rows
            ) + 1;

    const end =
        Math.min(
            currentPage * rows,
            payments.length
        );

    resultsText.innerHTML =
        `Showing <strong>${start}</strong> to <strong>${end}</strong> of <strong>${payments.length}</strong> payments`;
}

function getTotalPages() {
    return Math.max(
        1,
        Math.ceil(
            payments.length /
            rows
        )
    );
}

function updatePagination() {
    const totalPages =
        getTotalPages();

    if (
        currentPage >
        totalPages
    ) {
        currentPage =
            totalPages;
    }

    previousPageButton.disabled =
        currentPage <= 1;

    nextPageButton.disabled =
        currentPage >= totalPages;

    currentPageButton.textContent =
        currentPage;

    currentPageButton.classList.add(
        "active"
    );

    const secondPage =
        currentPage <
        totalPages
            ? currentPage + 1
            : currentPage;

    nextPageNumberButton.textContent =
        secondPage;

    nextPageNumberButton.classList.toggle(
        "active",
        secondPage === currentPage
    );

    nextPageNumberButton.disabled =
        totalPages <= 1 ||
        secondPage === currentPage;

    previousPageButton.onclick =
        () => {
            if (
                currentPage <= 1
            ) {
                return;
            }

            currentPage--;

            renderSubscriptionHistory();
            updateTableFooter();
            updatePagination();
        };

    nextPageButton.onclick =
        () => {
            if (
                currentPage >=
                totalPages
            ) {
                return;
            }

            currentPage++;

            renderSubscriptionHistory();
            updateTableFooter();
            updatePagination();
        };

    currentPageButton.onclick =
        () => {
            currentPage =
                Number(
                    currentPageButton.textContent
                );

            renderSubscriptionHistory();
            updateTableFooter();
            updatePagination();
        };

    nextPageNumberButton.onclick =
        () => {
            if (
                secondPage ===
                currentPage
            ) {
                return;
            }

            currentPage =
                secondPage;

            renderSubscriptionHistory();
            updateTableFooter();
            updatePagination();
        };
}

if (receiptBtn) {
    receiptBtn.onclick =
        downloadReceipt;
}

if (printBtn) {
    printBtn.onclick =
        printReceipt;
}

function downloadReceipt() {
    if (!currentPayment) {
        return;
    }

    const reference =
        document.getElementById(
            "modalReceiptReference"
        )?.textContent || "--";

    const transactionId =
        document.getElementById(
            "modalTransactionId"
        )?.textContent || "--";

    const provider =
        document.getElementById(
            "modalReceiptProvider"
        )?.textContent || "Paystack";

    const plan =
        document.getElementById(
            "modalReceiptPlan"
        )?.textContent || "--";

    const billing =
        document.getElementById(
            "modalBilling"
        )?.textContent || "--";

    const method =
        document.getElementById(
            "modalPaymentMethod"
        )?.textContent || "Card";

    const amount =
        document.getElementById(
            "modalReceiptAmount"
        )?.textContent || "--";

    const date =
        document.getElementById(
            "modalReceiptDate"
        )?.textContent || "--";

    const renewal =
        document.getElementById(
            "modalRenewalDate"
        )?.textContent || "--";

    const receiptWindow =
        window.open(
            "",
            "_blank",
            "width=700,height=900"
        );

    if (!receiptWindow) {
        return;
    }

    receiptWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>InvoicePro Subscription Receipt</title>
            <meta charset="UTF-8">
            <style>
                body {
                    margin: 0;
                    padding: 40px;
                    background: #f8fafc;
                    font-family: Arial, sans-serif;
                    color: #10243e;
                }
                .receipt {
                    max-width: 600px;
                    margin: auto;
                    background: #ffffff;
                    padding: 35px;
                    border: 1px solid #dce5ef;
                    border-radius: 14px;
                }
                h1 {
                    margin: 0;
                    font-size: 25px;
                }
                .subtitle {
                    margin-top: 5px;
                    color: #64748b;
                }
                .line {
                    height: 1px;
                    background: #dce5ef;
                    margin: 25px 0;
                }
                .row {
                    display: flex;
                    justify-content: space-between;
                    gap: 20px;
                    padding: 11px 0;
                }
                .row span {
                    color: #64748b;
                }
                .row strong {
                    text-align: right;
                    overflow-wrap: anywhere;
                }
                .amount {
                    font-size: 24px;
                    margin: 20px 0;
                }
                .thanks {
                    text-align: center;
                    color: #64748b;
                    margin-top: 25px;
                }
                @media print {
                    body {
                        padding: 0;
                        background: #ffffff;
                    }
                    .receipt {
                        border: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="receipt">
                <h1>InvoicePro</h1>
                <div class="subtitle">Subscription Payment Receipt</div>
                <div class="line"></div>
                <div class="row">
                    <span>Payment Reference</span>
                    <strong>${escapeHtml(reference)}</strong>
                </div>
                <div class="row">
                    <span>Transaction ID</span>
                    <strong>${escapeHtml(transactionId)}</strong>
                </div>
                <div class="row">
                    <span>Provider</span>
                    <strong>${escapeHtml(provider)}</strong>
                </div>
                <div class="row">
                    <span>Subscription</span>
                    <strong>${escapeHtml(plan)}</strong>
                </div>
                <div class="row">
                    <span>Billing Cycle</span>
                    <strong>${escapeHtml(billing)}</strong>
                </div>
                <div class="row">
                    <span>Payment Method</span>
                    <strong>${escapeHtml(method)}</strong>
                </div>
                <div class="row">
                    <span>Payment Date</span>
                    <strong>${escapeHtml(date)}</strong>
                </div>
                <div class="row">
                    <span>Next Renewal</span>
                    <strong>${escapeHtml(renewal)}</strong>
                </div>
                <div class="line"></div>
                <div class="amount">${escapeHtml(amount)}</div>
                <div class="thanks">Thank you for your subscription payment!</div>
            </div>
        </body>
        </html>
    `);

    receiptWindow.document.close();

    receiptWindow.focus();

    setTimeout(
        () => {
            receiptWindow.print();
        },
        250
    );
}

function printReceipt() {
    downloadReceipt();
}
