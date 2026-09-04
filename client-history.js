const params =
    new URLSearchParams(
        window.location.search
    );

const clientId =
    params.get("clientId");

let historyType =
    params.get("type") === "invoices"
        ? "invoices"
        : "estimates";

const rowsPerPage = 10;

let estimates = [];
let invoices = [];

let estimatesCurrentPage = 1;
let invoicesCurrentPage = 1;

const clientName =
    document.getElementById(
        "clientName"
    );

const profileClientName =
    document.getElementById(
        "profileClientName"
    );

const clientImage =
    document.getElementById(
        "clientImage"
    );

const clientImageFallback =
    document.getElementById(
        "clientImageFallback"
    );

const clientInitials =
    document.getElementById(
        "clientInitials"
    );

const addressLine1 =
    document.getElementById(
        "addressLine1"
    );

const addressLine2 =
    document.getElementById(
        "addressLine2"
    );

const addressCityStateZip =
    document.getElementById(
        "addressCityStateZip"
    );

const addressCountry =
    document.getElementById(
        "addressCountry"
    );

const currentHistoryType =
    document.getElementById(
        "currentHistoryType"
    );

const historySwitchButton =
    document.getElementById(
        "historySwitchButton"
    );

const historySwitchText =
    document.getElementById(
        "historySwitchText"
    );

const estimatesSection =
    document.getElementById(
        "estimatesSection"
    );

const invoicesSection =
    document.getElementById(
        "invoicesSection"
    );

const estimateCount =
    document.getElementById(
        "estimateCount"
    );

const invoiceCount =
    document.getElementById(
        "invoiceCount"
    );

const estimatesTableBody =
    document.getElementById(
        "estimatesTableBody"
    );

const invoicesTableBody =
    document.getElementById(
        "invoicesTableBody"
    );

const estimatesEmpty =
    document.getElementById(
        "estimatesEmpty"
    );

const invoicesEmpty =
    document.getElementById(
        "invoicesEmpty"
    );

const estimatesPagination =
    document.getElementById(
        "estimatesPagination"
    );

const invoicesPagination =
    document.getElementById(
        "invoicesPagination"
    );

const estimatesPreviousButton =
    document.getElementById(
        "estimatesPreviousButton"
    );

const estimatesNextButton =
    document.getElementById(
        "estimatesNextButton"
    );

const invoicesPreviousButton =
    document.getElementById(
        "invoicesPreviousButton"
    );

const invoicesNextButton =
    document.getElementById(
        "invoicesNextButton"
    );

const estimatesPageNumbers =
    document.getElementById(
        "estimatesPageNumbers"
    );

const invoicesPageNumbers =
    document.getElementById(
        "invoicesPageNumbers"
    );

const pageLoader =
    document.getElementById(
        "pageLoader"
    );

const backButton =
    document.getElementById(
        "backButton"
    );


function showLoader() {

    pageLoader.classList.add(
        "show"
    );

}


function hideLoader() {

    pageLoader.classList.remove(
        "show"
    );

}


function getClientDisplayName(
    client
) {

    return (
        client.companyName ||
        client.contactPerson ||
        "Client"
    );

}


function getInitials(
    name
) {

    const words =
        String(
            name || "Client"
        )
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (!words.length) {
        return "CL";
    }

    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();

    }

    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();

}


function setClientProfile(
    client
) {

    const name =
        getClientDisplayName(
            client
        );

    clientName.textContent =
        name;

    profileClientName.textContent =
        name;

    clientInitials.textContent =
        getInitials(
            name
        );

    addressLine1.textContent =
        client.billingAddressLine1 ||
        "-";

    addressLine2.textContent =
        client.billingAddressLine2 ||
        "-";

    addressCityStateZip.textContent =
        client.billingCityStateZip ||
        "-";

    addressCountry.textContent =
        client.billingCountry ||
        "-";

    if (
        client.clientImageUrl
    ) {

        clientImage.src =
            client.clientImageUrl;

        clientImage.style.display =
            "block";

        clientImageFallback.style.display =
            "none";

    }
    else {

        clientImage.removeAttribute(
            "src"
        );

        clientImage.style.display =
            "none";

        clientImageFallback.style.display =
            "flex";

    }

}


function formatAmount(
    amount,
    symbol
) {

    return (
        symbol +
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


function getStatusClass(
    status
) {

    return String(
        status || "Draft"
    )
    .toLowerCase()
    .replace(/\s+/g, "-");

}


function renderEstimateRows() {

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                estimates.length /
                rowsPerPage
            )
        );

    if (
        estimatesCurrentPage >
        totalPages
    ) {

        estimatesCurrentPage =
            totalPages;

    }

    const start =
        (
            estimatesCurrentPage -
            1
        ) *
        rowsPerPage;

    const end =
        start +
        rowsPerPage;

    const pageItems =
        estimates.slice(
            start,
            end
        );

    estimateCount.textContent =
        estimates.length;

    if (!estimates.length) {

        estimatesTableBody.innerHTML =
            "";

        estimatesEmpty.style.display =
            "block";

        estimatesPagination.style.display =
            "none";

        return;

    }

    estimatesEmpty.style.display =
        "none";

    estimatesTableBody.innerHTML =
        pageItems.map(
            function (
                estimate
            ) {

                const status =
                    estimate.status ||
                    "Draft";

                return `
                    <tr>

                        <td>
                            <span class="document-number">
                                ${
                                    estimate.estimateNumber ||
                                    "-"
                                }
                            </span>
                        </td>

                        <td>
                            <span class="document-title">
                                ${
                                    estimate.estimateTitle ||
                                    estimate.projectName ||
                                    "Estimate"
                                }
                            </span>
                        </td>

                        <td>
                            <span class="document-amount">
                                ${
                                    formatAmount(
                                        estimate.grandTotal,
                                        estimate.currencySymbol || ""
                                    )
                                }
                            </span>
                        </td>

                        <td>
                            <span
                                class="status-badge ${getStatusClass(status)}">

                                ${status}

                            </span>
                        </td>

                    </tr>
                `;

            }
        ).join("");

    renderPagination(
        estimatesCurrentPage,
        totalPages,
        estimatesPageNumbers,
        estimatesPreviousButton,
        estimatesNextButton,
        function (
            page
        ) {

            estimatesCurrentPage =
                page;

            renderEstimateRows();

        }
    );

}


function renderInvoiceRows() {

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                invoices.length /
                rowsPerPage
            )
        );

    if (
        invoicesCurrentPage >
        totalPages
    ) {

        invoicesCurrentPage =
            totalPages;

    }

    const start =
        (
            invoicesCurrentPage -
            1
        ) *
        rowsPerPage;

    const end =
        start +
        rowsPerPage;

    const pageItems =
        invoices.slice(
            start,
            end
        );

    invoiceCount.textContent =
        invoices.length;

    if (!invoices.length) {

        invoicesTableBody.innerHTML =
            "";

        invoicesEmpty.style.display =
            "block";

        invoicesPagination.style.display =
            "none";

        return;

    }

    invoicesEmpty.style.display =
        "none";

    invoicesTableBody.innerHTML =
        pageItems.map(
            function (
                invoice
            ) {

                const status =
                    invoice.status ||
                    "Draft";

                return `
                    <tr>

                        <td>
                            <span class="document-number">
                                ${
                                    invoice.invoiceNumber ||
                                    "-"
                                }
                            </span>
                        </td>

                        <td>
                            <span class="document-title">
                                ${
                                    invoice.invoiceTitle ||
                                    invoice.projectName ||
                                    "Invoice"
                                }
                            </span>
                        </td>

                        <td>
                            <span class="document-amount">
                                ${
                                    formatAmount(
                                        invoice.totalAmount,
                                        invoice.currencySymbol || ""
                                    )
                                }
                            </span>
                        </td>

                        <td>
                            <span
                                class="status-badge ${getStatusClass(status)}">

                                ${status}

                            </span>
                        </td>

                    </tr>
                `;

            }
        ).join("");

    renderPagination(
        invoicesCurrentPage,
        totalPages,
        invoicesPageNumbers,
        invoicesPreviousButton,
        invoicesNextButton,
        function (
            page
        ) {

            invoicesCurrentPage =
                page;

            renderInvoiceRows();

        }
    );

}


function renderPagination(
    currentPage,
    totalPages,
    pageContainer,
    previousButton,
    nextButton,
    onPageChange
) {

    pageContainer.innerHTML =
        "";

    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        const button =
            document.createElement(
                "button"
            );

        button.type =
            "button";

        button.className =
            "pagination-page";

        button.textContent =
            page;

        if (
            page === currentPage
        ) {

            button.classList.add(
                "active"
            );

        }

        button.addEventListener(
            "click",
            function () {

                onPageChange(
                    page
                );

            }
        );

        pageContainer.appendChild(
            button
        );

    }

    previousButton.disabled =
        currentPage <= 1;

    nextButton.disabled =
        currentPage >= totalPages;

    previousButton.onclick =
        function () {

            if (
                currentPage >
                1
            ) {

                onPageChange(
                    currentPage - 1
                );

            }

        };

    nextButton.onclick =
        function () {

            if (
                currentPage <
                totalPages
            ) {

                onPageChange(
                    currentPage + 1
                );

            }

        };

    if (
        totalPages <= 1
    ) {

        pageContainer.parentElement.style.display =
            "none";

    }
    else {

        pageContainer.parentElement.style.display =
            "flex";

    }

}


function arrangeHistorySections() {

    if (
        historyType ===
        "invoices"
    ) {

        estimatesSection.style.display =
            "none";

        invoicesSection.style.display =
            "block";

        currentHistoryType.textContent =
            "Invoices";

        historySwitchText.textContent =
            "View All Estimates";

    }
    else {

        estimatesSection.style.display =
            "block";

        invoicesSection.style.display =
            "none";

        currentHistoryType.textContent =
            "Estimates";

        historySwitchText.textContent =
            "View All Invoices";

    }

}


function revealOtherHistory() {

    if (
        historyType ===
        "estimates"
    ) {

        historyType =
            "invoices";

    }
    else {

        historyType =
            "estimates";

    }

    arrangeHistorySections();

}


async function loadClientHistory() {

    if (!clientId) {

        clientName.textContent =
            "Client Not Found";

        profileClientName.textContent =
            "Client Not Found";

        estimatesTableBody.innerHTML =
            "";

        invoicesTableBody.innerHTML =
            "";

        return;

    }

    try {

        showLoader();

        const result =
            await Parse.Cloud.run(
                "getClientHistory",
                {
                    clientId: clientId
                }
            );

        if (
            !result ||
            !result.client
        ) {

            throw new Error(
                "Client information could not be loaded."
            );

        }

        const client =
            result.client;


        setClientProfile(
            client
        );

        estimates =
    Array.isArray(
        result.estimates
    )
        ? result.estimates
        : [];

invoices =
    Array.isArray(
        result.invoices
    )
        ? result.invoices
        : [];

        renderEstimateRows();

        renderInvoiceRows();

        arrangeHistorySections();

    }
    catch (error) {

        console.error(
            "Client History Error:",
            error
        );

        estimatesTableBody.innerHTML =
            `
            <tr>
                <td colspan="4">
                    <div class="history-error">
                        ${
                            error.message ||
                            "Unable to load estimates."
                        }
                    </div>
                </td>
            </tr>
            `;

        invoicesTableBody.innerHTML =
            `
            <tr>
                <td colspan="4">
                    <div class="history-error">
                        ${
                            error.message ||
                            "Unable to load invoices."
                        }
                    </div>
                </td>
            </tr>
            `;

    }
    finally {

        hideLoader();

    }

}


backButton.addEventListener(
    "click",
    function () {

        window.location.href =
            "clients.html";

    }
);


historySwitchButton.addEventListener(
    "click",
    revealOtherHistory
);


loadClientHistory();