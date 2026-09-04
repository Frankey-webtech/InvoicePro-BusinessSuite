async function loadAllUpcomingPayments() {

    const paymentsList =
        document.getElementById(
            "upcomingPaymentsList"
        );

    const paymentsCount =
        document.getElementById(
            "upcomingPaymentsCount"
        );

    const emptyState =
        document.getElementById(
            "upcomingPaymentsEmpty"
        );

    const errorState =
        document.getElementById(
            "upcomingPaymentsError"
        );

    const errorMessage =
        document.getElementById(
            "upcomingPaymentsErrorMessage"
        );

    if (!paymentsList) {
        return;
    }

    if (emptyState) {
        emptyState.style.display = "none";
    }

    if (errorState) {
        errorState.style.display = "none";
    }

    paymentsList.innerHTML = `

        <div class="upcomingPaymentLoading">

            <div class="upcomingPaymentLoadingIcon">
                <i class="ri-loader-4-line"></i>
            </div>

            <div>

                <h3>
                    Loading payments...
                </h3>

                <p>
                    Please wait while your upcoming payments are loaded.
                </p>

            </div>

        </div>

    `;

    try {

        const result =
    await Parse.Cloud.run(
        "getAllPendingInvoices"
    );

        if (
            !result ||
            result.success !== true
        ) {
            throw new Error(
                "Unable to load upcoming payments."
            );
        }

        const invoices =
            Array.isArray(result.invoices)
                ? result.invoices
                : [];

        if (paymentsCount) {

            paymentsCount.textContent =
                `${invoices.length} ${invoices.length === 1 ? "Payment" : "Payments"}`;

        }

        if (invoices.length === 0) {

            paymentsList.innerHTML = "";

            if (emptyState) {
                emptyState.style.display = "block";
            }

            return;
        }

        paymentsList.innerHTML = "";

        invoices.forEach(invoice => {

            const title =
                invoice.invoiceTitle ||
                invoice.invoiceNumber ||
                "Upcoming Payment";

            const invoiceNumber =
                invoice.invoiceNumber ||
                "";

            const projectName =
                invoice.projectName ||
                invoice.companyName ||
                "";

            const contactPerson =
                invoice.contactPerson ||
                "";

            const amount =
                invoice.totalAmount != null
                    ? `${invoice.currencySymbol || invoice.currencyCode || ""}${Number(invoice.totalAmount).toLocaleString()}`
                    : "Amount unavailable";

            const reminderMessage =
                invoice.reminderMessage ||
                "";

            let dueDate = "";

            if (invoice.dueDate) {

                const date =
                    new Date(
                        invoice.dueDate
                    );

                if (
                    !Number.isNaN(
                        date.getTime()
                    )
                ) {

                    dueDate =
                        date.toLocaleDateString(
                            undefined,
                            {
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                            }
                        );

                }

            }

            const card =
                document.createElement(
                    "div"
                );

            card.className =
    "upcomingPaymentCard";

card.dataset.invoiceId =
    invoice.invoiceId;

            card.innerHTML = `

                <div class="upcomingPaymentIndicator"></div>

                <div class="upcomingPaymentMain">

                    <div class="upcomingPaymentTop">

                        <div>

                            <h3 class="upcomingPaymentTitle">
                                ${title}
                            </h3>

                            ${
                                invoiceNumber
                                    ? `
                                        <p class="upcomingPaymentInvoice">
                                            Invoice ${invoiceNumber}
                                        </p>
                                    `
                                    : ""
                            }

                        </div>

                        <div class="upcomingPaymentAmount">
                            ${amount}
                        </div>

                    </div>

                    <div class="upcomingPaymentDetails">

                        ${
                            projectName
                                ? `
                                    <span class="upcomingPaymentDetail">
                                        <i class="ri-briefcase-4-line"></i>
                                        ${projectName}
                                    </span>
                                `
                                : ""
                        }

                        ${
                            contactPerson
                                ? `
                                    <span class="upcomingPaymentDetail">
                                        <i class="ri-user-line"></i>
                                        ${contactPerson}
                                    </span>
                                `
                                : ""
                        }

                        ${
                            dueDate
                                ? `
                                    <span class="upcomingPaymentDetail">
                                        <i class="ri-calendar-line"></i>
                                        ${dueDate}
                                    </span>
                                `
                                : ""
                        }

                    </div>

                    ${
                        reminderMessage
                            ? `
                                <div class="upcomingPaymentReminder">
                                    ${reminderMessage}
                                </div>
                            `
                            : ""
                    }

                    <div class="upcomingPaymentActions">

                        <button
                            type="button"
                            class="upcomingPaymentSendButton"
                            data-invoice-id="${invoice.invoiceId}"
                        >
                            <i class="ri-send-plane-line"></i>
                            <span>Send Invoice</span>
                        </button>

                    </div>

                </div>

            `;

            paymentsList.appendChild(
                card
            );
            
            card.addEventListener(
    "click",
    event => {

        if (
            event.target.closest(
                ".upcomingPaymentSendButton"
            )
        ) {
            return;
        }

        const invoiceId =
            card.dataset.invoiceId;

        if (!invoiceId) {
            return;
        }

        window.location.href =
            `invoice.html?viewInvoice=${encodeURIComponent(invoiceId)}`;

    }
);

        });

        const sendButtons =
            paymentsList.querySelectorAll(
                ".upcomingPaymentSendButton"
            );

        sendButtons.forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const invoiceId =
                        button.dataset.invoiceId;

                    if (!invoiceId) {
                        return;
                    }

                    await sendUpcomingInvoice(
                        invoiceId,
                        button
                    );

                }
            );

        });

    }
    catch (error) {

        console.error(
            "All Upcoming Payments Error:",
            error
        );

        paymentsList.innerHTML = "";

        if (paymentsCount) {
            paymentsCount.textContent =
                "Unable to load";
        }

        if (errorMessage) {

            errorMessage.textContent =
                error.message ||
                "Something went wrong while loading your upcoming payments.";

        }

        if (errorState) {
            errorState.style.display = "block";
        }

    }

}

async function sendUpcomingInvoice(
    invoiceId,
    button
) {

    if (
        !invoiceId ||
        !button
    ) {
        return;
    }

    const originalContent =
        button.innerHTML;

    button.disabled = true;

    button.innerHTML = `
        <i class="ri-loader-4-line"></i>
        <span>Sending...</span>
    `;

    try {

        const result =
            await Parse.Cloud.run(
                "sendInvoiceToClient",
                {
                    invoiceId:
                        invoiceId
                }
            );

        if (
            !result ||
            result.success !== true
        ) {
            throw new Error(
                "Unable to send invoice."
            );
        }

        button.innerHTML = `
            <i class="ri-check-line"></i>
            <span>Sent Successfully</span>
        `;

        button.classList.add(
            "sent"
        );

        setTimeout(
            () => {

                button.disabled = false;

                button.innerHTML =
                    originalContent;

                button.classList.remove(
                    "sent"
                );

            },
            3000
        );

    }
    catch (error) {

        console.error(
            "Send Upcoming Invoice Error:",
            error
        );

        button.disabled = false;

        button.innerHTML = `
            <i class="ri-error-warning-line"></i>
            <span>Send Failed</span>
        `;

        button.classList.add(
            "error"
        );

        setTimeout(
            () => {

                button.innerHTML =
                    originalContent;

                button.classList.remove(
                    "error"
                );

            },
            3000
        );

    }

}

const retryUpcomingPayments =
    document.getElementById(
        "retryUpcomingPayments"
    );

if (retryUpcomingPayments) {

    retryUpcomingPayments.addEventListener(
        "click",
        loadAllUpcomingPayments
    );

}

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadAllUpcomingPayments();

    }
);
