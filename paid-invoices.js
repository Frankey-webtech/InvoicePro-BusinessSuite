"use strict";

const totalPaidAmountElement =
    document.getElementById("total-paid-amount");

const paidInvoiceCountElement =
    document.getElementById("paid-invoice-count");

const loadingElement =
    document.getElementById("paid-invoices-loading");

const errorElement =
    document.getElementById("paid-invoices-error");

const errorMessageElement =
    document.getElementById("paid-invoices-error-message");

const emptyElement =
    document.getElementById("paid-invoices-empty");

const invoicesContainer =
    document.getElementById("paid-invoices-container");

const invoicesList =
    document.getElementById("paid-invoices-list");

const retryButton =
    document.getElementById("retry-paid-invoices");

const invoiceTemplate =
    document.getElementById("paid-invoice-template");

function showLoading() {
    loadingElement.style.display = "flex";
    errorElement.style.display = "none";
    emptyElement.style.display = "none";
    invoicesContainer.style.display = "none";
}

function showError(message) {
    loadingElement.style.display = "none";
    errorElement.style.display = "flex";
    emptyElement.style.display = "none";
    invoicesContainer.style.display = "none";
    
    errorMessageElement.textContent =
        message || "Unable to load paid invoices.";
}

function showEmpty() {
    loadingElement.style.display = "none";
    errorElement.style.display = "none";
    emptyElement.style.display = "flex";
    invoicesContainer.style.display = "none";
}

function showInvoices() {
    loadingElement.style.display = "none";
    errorElement.style.display = "none";
    emptyElement.style.display = "none";
    invoicesContainer.style.display = "block";
}

function formatAmount(
    amount,
    currencyCode,
    currencySymbol
) {
    const numericAmount =
        Number(amount) || 0;

    if (currencyCode) {
        try {
            return new Intl.NumberFormat(
                undefined,
                {
                    style: "currency",
                    currency: currencyCode,
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            ).format(numericAmount);
        } catch (error) {
            return `${currencySymbol || ""}${numericAmount.toFixed(2)}`;
        }
    }

    return `${currencySymbol || ""}${numericAmount.toFixed(2)}`;
}

function formatDate(dateValue) {
    if (!dateValue) {
        return "—";
    }

    const date =
        new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat(
        undefined,
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    ).format(date);
}

function createInvoiceRow(invoice) {
    const row =
        invoiceTemplate.content
        .firstElementChild
        .cloneNode(true);
    
    const invoiceNumber =
        row.querySelector(".invoice-number");
    
    const invoiceTitle =
        row.querySelector(".invoice-title");
    
    const companyName =
        row.querySelector(".company-name");
    
    const contactPerson =
        row.querySelector(".contact-person");
    
    const invoiceAmount =
        row.querySelector(".invoice-amount");
    
    const invoiceDueDate =
        row.querySelector(".invoice-due-date");
    
    invoiceNumber.textContent =
        invoice.invoiceNumber || "Invoice";
    
    invoiceTitle.textContent =
        invoice.invoiceTitle ||
        invoice.projectName ||
        "—";
    
    companyName.textContent =
        invoice.companyName ||
        "—";
    
    contactPerson.textContent =
        invoice.contactPerson ||
        "—";
    
    invoiceAmount.textContent =
        formatAmount(
            invoice.totalAmount,
            invoice.currencyCode,
            invoice.currencySymbol
        );
    
    invoiceDueDate.textContent =
        formatDate(invoice.dueDate);
    
    if (invoice.objectId) {
        row.dataset.invoiceId =
            invoice.objectId;
        
        row.style.cursor =
            "pointer";
        
        row.addEventListener(
            "click",
            () => {
                window.location.href =
                    `invoice.html?invoiceId=${encodeURIComponent(invoice.objectId)}`;
            }
        );
    }
    
    return row;
}

function renderInvoices(invoices) {
    invoicesList.innerHTML = "";

    invoices.forEach(
        (invoice) => {
            const row =
                createInvoiceRow(invoice);

            invoicesList.appendChild(row);
        }
    );
}

function updateSummary(response) {
    const invoices =
        Array.isArray(response.invoices)
            ? response.invoices
            : [];

    paidInvoiceCountElement.textContent =
        response.count !== undefined
            ? response.count
            : invoices.length;

    const totalAmount =
        Number(response.totalPaidAmount) || 0;

    let currencyCode = "";
    let currencySymbol = "";

    if (invoices.length > 0) {
        currencyCode =
            invoices[0].currencyCode || "";

        currencySymbol =
            invoices[0].currencySymbol || "";
    }

    totalPaidAmountElement.textContent =
        formatAmount(
            totalAmount,
            currencyCode,
            currencySymbol
        );
}

async function loadPaidInvoices() {
    showLoading();

    try {
        const response =
            await Parse.Cloud.run(
                "paidInvoices"
            );

        if (
            !response ||
            response.success !== true
        ) {
            throw new Error(
                "The paid invoices request was unsuccessful."
            );
        }

        const invoices =
            Array.isArray(response.invoices)
                ? response.invoices
                : [];

        updateSummary(response);

        if (invoices.length === 0) {
            renderInvoices([]);
            showEmpty();
            return;
        }

        renderInvoices(invoices);
        showInvoices();

    } catch (error) {
        console.error(
            "Error loading paid invoices:",
            error
        );

        showError(
            error.message ||
            "Unable to load paid invoices. Please try again."
        );
    }
}

showLoading();

retryButton.addEventListener(
    "click",
    loadPaidInvoices
);


document.addEventListener(
    "DOMContentLoaded",
    () => {
        loadPaidInvoices();
    }
);