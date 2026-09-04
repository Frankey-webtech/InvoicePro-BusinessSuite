"use strict";

const ReportsState = {
    subscription: null,
    exportUsage: null,
    invoices: [],
    estimates: [],
    estimatesStatistics: null,
    invoiceStatistics: null,
    invoiceStatus: null,
    revenueOverview: null,
    currencySymbol: "$",
    currencyCode: "USD",
    dateFilter: "6months",
    customStartDate: null,
    customEndDate: null,
    revenuePeriod: "6months",
    loading: false,
    showClientImage: true
};

const ReportsElements = {
    dateFilter: document.getElementById("reportsDateFilter"),
    customDateWrapper: document.getElementById("reportsCustomDateWrapper"),
    startDate: document.getElementById("reportsStartDate"),
    endDate: document.getElementById("reportsEndDate"),
    applyDate: document.getElementById("reportsApplyDateBtn"),
    filterStatus: document.getElementById("reportsFilterStatus"),

    refreshButton: document.getElementById("reportsRefreshBtn"),

    revenuePeriod: document.getElementById("reportsRevenuePeriod"),
    revenueChart: document.getElementById("reportsRevenueChart"),

    totalRevenue: document.getElementById("reportsTotalRevenue"),
    revenueGrowth: document.getElementById("reportsRevenueGrowth"),

    paidInvoices: document.getElementById("reportsPaidInvoices"),
    paidInvoiceAmount: document.getElementById("reportsPaidInvoiceAmount"),

    unpaidInvoices: document.getElementById("reportsUnpaidInvoices"),
    unpaidAmount: document.getElementById("reportsUnpaidAmount"),

    overdueInvoices: document.getElementById("reportsOverdueInvoices"),
    overdueAmount: document.getElementById("reportsOverdueAmount"),

    outstandingAmount: document.getElementById("reportsOutstandingAmount"),

    totalInvoices: document.getElementById("reportsTotalInvoices"),
    invoiceGrowth: document.getElementById("reportsInvoiceGrowth"),

    draftCount: document.getElementById("reportsDraftCount"),
    pendingCount: document.getElementById("reportsPendingCount"),
    paidCount: document.getElementById("reportsPaidCount"),
    overdueCount: document.getElementById("reportsOverdueCount"),

    paidProgress: document.getElementById("reportsPaidProgress"),
    pendingProgress: document.getElementById("reportsPendingProgress"),
    overdueProgress: document.getElementById("reportsOverdueProgress"),

    paidPercentage: document.getElementById("reportsPaidPercentage"),
    pendingPercentage: document.getElementById("reportsPendingPercentage"),
    overduePercentage: document.getElementById("reportsOverduePercentage"),

    clientRevenueList: document.getElementById("reportsClientRevenueList"),

    taxableRevenue: document.getElementById("reportsTaxableRevenue"),
    totalTax: document.getElementById("reportsTotalTax"),
    averageTax: document.getElementById("reportsAverageTax"),
    taxableInvoices: document.getElementById("reportsTaxableInvoices"),

    totalEstimates: document.getElementById("reportsTotalEstimates"),
    draftEstimates: document.getElementById("reportsDraftEstimates"),
    approvedEstimates: document.getElementById("reportsApprovedEstimates"),
    estimatedValue: document.getElementById("reportsEstimatedValue"),

    paymentMethods: document.getElementById("reportsPaymentMethods"),

    invoiceTableBody: document.getElementById("reportsInvoiceTableBody"),

    exportPdfButton: document.getElementById("reportsExportPdfBtn"),

    loadingOverlay: document.getElementById("reportsLoadingOverlay"),
    toast: document.getElementById("reportsToast"),
        estimateTableBody:
        document.getElementById(
            "reportsEstimateTableBody"
        ),

    exportEstimatePdfButton:
        document.getElementById(
            "reportsExportEstimatePdfBtn"
        ),
        
    draftProgress:
    document.getElementById(
        "reportsDraftProgress"
    ),

draftPercentage:
    document.getElementById(
        "reportsDraftPercentage"
    ),

};

const ReportsUpgradeElements = {
    overlay: document.getElementById(
        "reportsUpgradeOverlay"
    ),

    button: document.getElementById(
        "reportsUpgradeButton"
    )
};

function reportsShowLoading(show) {

    ReportsState.loading = show;

    if (!ReportsElements.loadingOverlay) {
        return;
    }

    ReportsElements.loadingOverlay.classList.toggle(
        "active",
        show
    );
}

function reportsShowToast(message) {

    if (!ReportsElements.toast) {
        return;
    }

    ReportsElements.toast.textContent = message;

    ReportsElements.toast.classList.add("show");

    clearTimeout(
        ReportsElements.toast._timer
    );

    ReportsElements.toast._timer = setTimeout(() => {

        ReportsElements.toast.classList.remove("show");

    }, 3000);
}

function reportsEscapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function reportsNumber(value) {

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : 0;
}

function reportsFormatMoney(value) {

    const amount = reportsNumber(value);

    return (
        ReportsState.currencySymbol || "$"
    ) +
    amount.toLocaleString(
        undefined,
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );
}

function reportsFormatDate(value) {

    if (!value) {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );
}

function reportsGetDateValue(value) {

    if (!value) {
        return null;
    }

    if (
        value instanceof Date
    ) {
        return value;
    }

    const date = new Date(value);

    return Number.isNaN(
        date.getTime()
    )
        ? null
        : date;
}

function reportsGetInvoiceDate(invoice) {

    return reportsGetDateValue(
        invoice.issueDate ||
        invoice.createdAt
    );
}

function reportsGetClientName(invoice) {

    return (
        invoice.clientName ||
        invoice.contactPerson ||
        invoice.companyName ||
        "Unknown Client"
    ).trim();
}

function reportsGetStatusClass(status) {

    const normalized =
        String(status || "Draft")
            .toLowerCase();

    if (
        normalized === "paid"
    ) {
        return "paid";
    }

    if (
        normalized === "pending"
    ) {
        return "pending";
    }

    if (
        normalized === "overdue"
    ) {
        return "overdue";
    }

    if (
        normalized === "cancelled"
    ) {
        return "cancelled";
    }

    return "draft";
}

function reportsNormalizeStatus(status) {

    const value =
        String(status || "Draft")
            .trim()
            .toLowerCase();

    if (value === "paid") {
        return "Paid";
    }

    if (value === "pending") {
        return "Pending";
    }

    if (value === "overdue") {
        return "Overdue";
    }

    if (value === "cancelled") {
        return "Cancelled";
    }

    return "Draft";
}

function reportsGetDateRange(filter) {

    const now = new Date();

    let start = null;
    let end = new Date(now);

    end.setHours(
        23,
        59,
        59,
        999
    );

    switch (filter) {

        case "30days":

            start = new Date(now);

            start.setDate(
                now.getDate() - 29
            );

            start.setHours(
                0,
                0,
                0,
                0
            );

            break;


        case "90days":

            start = new Date(now);

            start.setDate(
                now.getDate() - 89
            );

            start.setHours(
                0,
                0,
                0,
                0
            );

            break;


        case "6months":

            start = new Date(
                now.getFullYear(),
                now.getMonth() - 5,
                1
            );

            break;


        case "12months":

            start = new Date(
                now.getFullYear(),
                now.getMonth() - 11,
                1
            );

            break;


        case "thisYear":

            start = new Date(
                now.getFullYear(),
                0,
                1
            );

            break;


        case "all":

            start = null;

            break;


        case "custom":

            start =
                reportsGetDateValue(
                    ReportsState.customStartDate
                );

            end =
                reportsGetDateValue(
                    ReportsState.customEndDate
                );

            if (end) {

                end.setHours(
                    23,
                    59,
                    59,
                    999
                );

            }

            break;

    }

    return {
        start,
        end
    };
}

function reportsInvoiceIsInRange(
    invoice,
    start,
    end
) {

    const date =
        reportsGetInvoiceDate(
            invoice
        );

    if (!date) {
        return false;
    }

    if (
        start &&
        date < start
    ) {
        return false;
    }

    if (
        end &&
        date > end
    ) {
        return false;
    }

    return true;
}

function reportsGetFilteredInvoices() {

    const range =
        reportsGetDateRange(
            ReportsState.dateFilter
        );

    return ReportsState.invoices.filter(
        invoice =>
            reportsInvoiceIsInRange(
                invoice,
                range.start,
                range.end
            )
    );
}

function reportsGetEstimateDate(
    estimate
) {

    return reportsGetDateValue(
        estimate.issueDate ||
        estimate.createdDate
    );
}

function reportsEstimateIsInRange(
    estimate,
    start,
    end
) {

    const date =
        reportsGetEstimateDate(
            estimate
        );

    if (!date) {
        return false;
    }

    if (
        start &&
        date < start
    ) {
        return false;
    }

    if (
        end &&
        date > end
    ) {
        return false;
    }

    return true;
}

function reportsGetFilteredEstimates() {

    const range =
        reportsGetDateRange(
            ReportsState.dateFilter
        );

    return ReportsState.estimates.filter(
        estimate =>
            reportsEstimateIsInRange(
                estimate,
                range.start,
                range.end
            )
    );
}

function reportsNormalizeEstimateStatus(
    status
) {

    const value =
        String(status || "Draft")
            .trim()
            .toLowerCase();

    if (value === "approved") {
        return "Approved";
    }

    if (value === "rejected") {
        return "Rejected";
    }

    if (value === "converted") {
        return "Converted";
    }

    if (value === "expired") {
        return "Expired";
    }

    return "Draft";
}

function reportsGetEstimateStatusClass(
    status
) {

    const normalized =
        reportsNormalizeEstimateStatus(
            status
        );

    if (normalized === "Approved") {
        return "approved";
    }

    if (normalized === "Rejected") {
        return "rejected";
    }

    if (normalized === "Converted") {
        return "converted";
    }

    if (normalized === "Expired") {
        return "expired";
    }

    return "draft";
}

async function reportsCallCloud(functionName, params = {}) {

    return await Parse.Cloud.run(
        functionName,
        params
    );
}

async function reportsLoadAllEstimates() {

    const allEstimates = [];

    let page = 1;

    const limit = 100;

    let totalPages = 1;

    while (page <= totalPages) {

        const response =
            await reportsCallCloud(
                "getEstimates",
                {
                    search: "",
                    status: "",
                    sort: "newest",
                    page,
                    limit
                }
            );

        if (!response) {
            break;
        }

        const estimates =
            Array.isArray(
                response.estimates
            )
                ? response.estimates
                : [];

        allEstimates.push(
            ...estimates
        );

        totalPages =
            Number(
                response.totalPages
            ) || 1;

        if (
            estimates.length === 0
        ) {
            break;
        }

        page++;
    }

    return allEstimates;
}

async function reportsLoadAllInvoices() {

    const allInvoices = [];

    let page = 1;

    const limit = 100;

    let totalPages = 1;

    while (page <= totalPages) {

        const response =
            await reportsCallCloud(
                "getInvoices",
                {
                    search: "",
                    status: "all",
                    date: "all",
                    sort: "newest",
                    page,
                    limit
                }
            );

        if (!response) {
            break;
        }

        const invoices =
            Array.isArray(
                response.invoices
            )
                ? response.invoices
                : [];

        allInvoices.push(
            ...invoices
        );

        totalPages =
            Number(
                response.totalPages
            ) || 1;

        if (
            invoices.length === 0
        ) {
            break;
        }

        page++;
    }

    return allInvoices;
}

async function reportsLoadInvoiceStatistics() {

    try {

        return await reportsCallCloud(
            "getInvoiceStatistics"
        );

    } catch (error) {

        console.error(
            "Reports invoice statistics error:",
            error
        );

        return null;
    }
}

async function reportsLoadInvoiceStatus() {

    try {

        return await reportsCallCloud(
            "getInvoiceStatus"
        );

    } catch (error) {

        console.error(
            "Reports invoice status error:",
            error
        );

        return null;
    }
}

async function reportsLoadRevenueOverview(
    period = "6months"
) {

    try {

        return await reportsCallCloud(
            "getRevenueOverview",
            {
                period
            }
        );

    } catch (error) {

        console.error(
            "Reports revenue overview error:",
            error
        );

        return null;
    }
}

async function reportsLoadEstimateStatistics() {

    try {

        return await reportsCallCloud(
            "getEstimateStatistics"
        );

    } catch (error) {

        console.error(
            "Reports estimate statistics error:",
            error
        );

        return null;
    }
}

async function reportsLoadProfile() {

    try {

        const profile =
            await reportsCallCloud(
                "getUserProfile"
            );

        return profile || null;

    } catch (error) {

        console.error(
            "Reports profile error:",
            error
        );

        try {

            const dashboardProfile =
                await reportsCallCloud(
                    "getDashboardProfile"
                );

            return dashboardProfile || null;

        } catch (fallbackError) {

            console.error(
                "Reports dashboard profile error:",
                fallbackError
            );

            return null;
        }
    }
}

async function reportsLoadSubscriptionSettings() {

    try {

        const result =
            await reportsCallCloud(
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

        ReportsState.subscription =
            result;

        ReportsState.exportUsage =
            result?.usage?.exports ||
            null;

        reportsUpdateExportButtonState();

        return result;

    } catch (error) {

        console.error(
            "Reports subscription loading error:",
            error
        );

        ReportsState.subscription =
            null;

        ReportsState.exportUsage =
            null;

        reportsUpdateExportButtonState();

        throw error;
    }
}

async function reportsExportEstimatePDF() {

    const exportUsage =
        ReportsState.exportUsage ||
        (
            ReportsState.subscription?.usage?.exports
        );

    if (!exportUsage) {

        reportsShowToast(
            "Unable to verify your PDF export limit."
        );

        return;

    }

    if (
        exportUsage.maximum === undefined ||
        exportUsage.maximum === null
    ) {

        reportsShowToast(
            "PDF exports are not available on your current plan."
        );

        return;

    }

    if (
        exportUsage.maximum !== -1 &&
        Number(exportUsage.remaining) <= 0
    ) {

        reportsUpdateExportButtonState();

        reportsShowToast(
            "You have reached the PDF export limit for your current plan."
        );

        return;

    }

    const rows =
        reportsGetEstimateExportRows();

    if (!rows.length) {

        reportsShowToast(
            "There are no estimates to export."
        );

        return;

    }

    const html =
        reportsBuildEstimatePDFHTML();

    const printWindow =
        window.open(
            "",
            "_blank",
            "width=1100,height=800"
        );

    if (!printWindow) {

        reportsShowToast(
            "Please allow pop-ups to export the PDF."
        );

        return;

    }

    try {

        printWindow.document.open();

        printWindow.document.write(
            html
        );

        printWindow.document.close();

        const cancelButton =
            printWindow.document.getElementById(
                "exportCancelButton"
            );

        if (cancelButton) {

            cancelButton.addEventListener(
                "click",
                () => {
                    printWindow.close();
                }
            );

        }

        const exportResult =
            await reportsCallCloud(
                "recordPdfExport"
            );

        if (!exportResult?.success) {

            printWindow.close();

            throw new Error(
                "Unable to record your PDF export."
            );

        }

        ReportsState.exportUsage = {
            ...ReportsState.exportUsage,
            used: exportResult.used,
            maximum: exportResult.maximum,
            remaining: exportResult.remaining
        };

        if (ReportsState.subscription) {

            ReportsState.subscription.usage = {
                ...ReportsState.subscription.usage,
                exports: {
                    ...ReportsState.subscription.usage?.exports,
                    used: exportResult.used,
                    maximum: exportResult.maximum,
                    remaining: exportResult.remaining
                }
            };

        }

        reportsUpdateExportButtonState();

        printWindow.onload = () => {

            printWindow.scrollTo(
                0,
                0
            );

            setTimeout(
                () => {

                    printWindow.scrollTo(
                        0,
                        0
                    );

                    printWindow.focus();

                    printWindow.print();

                },
                350
            );

            printWindow.onafterprint = () => {

                setTimeout(
                    () => {

                        printWindow.close();

                    },
                    300
                );

            };

        };

        reportsShowToast(
            "Estimate PDF export opened for printing."
        );

        const checkExportWindow =
            setInterval(
                () => {

                    if (
                        printWindow.closed
                    ) {

                        clearInterval(
                            checkExportWindow
                        );

                        window.location.reload();

                    }

                },
                500
            );

    } catch (error) {

        console.error(
            "Estimate PDF export failed:",
            error
        );

        if (
            !printWindow.closed
        ) {

            printWindow.close();

        }

        reportsShowToast(
            error.message ||
            "Unable to export the estimate PDF."
        );

        reportsUpdateExportButtonState();

    }

}

async function reportsExportPDF() {

    const button =
        ReportsElements.exportPdfButton;

    const exportUsage =
        ReportsState.exportUsage ||
        (
            ReportsState.subscription?.usage?.exports
        );

    if (!exportUsage) {

        reportsShowToast(
            "Unable to verify your PDF export limit."
        );

        return;

    }

    if (
        exportUsage.maximum === undefined ||
        exportUsage.maximum === null
    ) {

        reportsShowToast(
            "PDF exports are not available on your current plan."
        );

        return;

    }

    if (
        exportUsage.maximum !== -1 &&
        Number(exportUsage.remaining) <= 0
    ) {

        reportsUpdateExportButtonState();

        reportsShowToast(
            "You have reached the PDF export limit for your current plan."
        );

        return;

    }

    const rows =
        reportsGetExportRows();

    if (!rows.length) {

        reportsShowToast(
            "There are no invoices to export."
        );

        return;

    }

    const html =
        reportsBuildPDFHTML();

    const printWindow =
        window.open(
            "",
            "_blank",
            "width=1100,height=800"
        );

    if (!printWindow) {

        reportsShowToast(
            "Please allow pop-ups to export the PDF."
        );

        return;

    }

    try {

        printWindow.document.open();

        printWindow.document.write(
            html
        );

        printWindow.document.close();

        const cancelButton =
            printWindow.document.getElementById(
                "exportCancelButton"
            );

        if (cancelButton) {

            cancelButton.addEventListener(
                "click",
                () => {
                    printWindow.close();
                }
            );

        }

        const exportResult =
            await reportsCallCloud(
                "recordPdfExport"
            );

        if (!exportResult?.success) {

            printWindow.close();

            throw new Error(
                "Unable to record your PDF export."
            );

        }

        ReportsState.exportUsage = {
            ...ReportsState.exportUsage,
            used: exportResult.used,
            maximum: exportResult.maximum,
            remaining: exportResult.remaining
        };

        if (ReportsState.subscription) {

            ReportsState.subscription.usage = {
                ...ReportsState.subscription.usage,
                exports: {
                    ...ReportsState.subscription.usage?.exports,
                    used: exportResult.used,
                    maximum: exportResult.maximum,
                    remaining: exportResult.remaining
                }
            };

        }

        reportsUpdateExportButtonState();

        printWindow.onload = () => {

            printWindow.scrollTo(
                0,
                0
            );

            setTimeout(
                () => {

                    printWindow.scrollTo(
                        0,
                        0
                    );

                    printWindow.focus();

                    printWindow.print();

                },
                350
            );

            printWindow.onafterprint = () => {

                setTimeout(
                    () => {

                        printWindow.close();

                    },
                    300
                );

            };

        };

        reportsShowToast(
            "PDF export opened for printing."
        );

        const checkExportWindow =
            setInterval(
                () => {

                    if (
                        printWindow.closed
                    ) {

                        clearInterval(
                            checkExportWindow
                        );

                        window.location.reload();

                    }

                },
                500
            );

    } catch (error) {

        console.error(
            "Reports PDF export failed:",
            error
        );

        if (
            !printWindow.closed
        ) {

            printWindow.close();

        }

        reportsShowToast(
            error.message ||
            "Unable to export the PDF."
        );

        reportsUpdateExportButtonState();

    }

}

async function reportsLoadBusinessProfile() {

    try {

        const response =
            await Parse.Cloud.run(
                "getBusinessProfile"
            );

        const profile =
            response &&
            response.profile
                ? response.profile
                : null;

        ReportsState.showClientImage =
            profile
                ? profile.showClientImage !== false
                : true;

        return profile;

    } catch (error) {

        console.error(
            "Reports business profile error:",
            error
        );

        ReportsState.showClientImage =
            true;

        return null;

    }

}

function reportsBuildPDFHTML() {

    const rows =
        reportsGetExportRows();


    const summary =
        reportsCalculateSummary();


    let tableRows = "";


    rows.forEach(row => {

        tableRows += `
            <tr>

                <td>
                    ${reportsEscapeHtml(row.invoice)}
                </td>

              <td>
    <div class="report-client-cell${ReportsState.showClientImage ? "" : " no-client-image"}">

${
    ReportsState.showClientImage
        ? (
            row.clientImageUrl
                ? `
                    <img
                        class="report-client-image"
                        src="${reportsEscapeHtml(row.clientImageUrl)}"
                        alt="${reportsEscapeHtml(row.client)}"
                        onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
                    >

                    <span
                        class="report-client-initials"
                        style="display:none;"
                    >
                        ${reportsEscapeHtml(row.clientInitials)}
                    </span>
                `
                : `
                    <span class="report-client-initials">
                        ${reportsEscapeHtml(row.clientInitials)}
                    </span>
                `
        )
        : ""
}

        <span class="report-client-name">
            ${reportsEscapeHtml(row.client)}
        </span>

    </div>
</td>

                <td>
                    ${reportsEscapeHtml(row.issueDate)}
                </td>

                <td>
                    ${reportsEscapeHtml(row.dueDate)}
                </td>

                <td>
                    ${reportsEscapeHtml(row.status)}
                </td>

                <td>
                    ${reportsEscapeHtml(
                        reportsFormatMoney(
                            row.tax
                        )
                    )}
                </td>

                <td>
                    ${reportsEscapeHtml(
                        reportsFormatMoney(
                            row.total
                        )
                    )}
                </td>

            </tr>
        `;

    });


    return `
        <!DOCTYPE html>

        <html>

        <head>

            <meta charset="UTF-8">

            <title>Invoice Report</title>

            <style>

    * {
        box-sizing: border-box;
    }

    @page {
        size: A4;
        margin: 12mm;
    }

    body {
        margin: 0;
        padding: 28px;
        font-family: Arial, sans-serif;
        color: #0f172a;
        background: #f1f3f5;
    }

    .header {
        background: #ffffff;
        border-radius: 14px;
        border-bottom: 4px solid #0b1f45;
        padding: 18px 20px;
        margin-bottom: 20px;
    }

    h1 {
        margin: 0;
        color: #0b1f45;
        font-size: 26px;
        line-height: 1.2;
    }

    .date {
        margin-top: 7px;
        color: #64748b;
        font-size: 12px;
    }

    .summary {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        gap: 12px;
        width: 100%;
        margin-bottom: 20px;
    }

    .summary-card {
        flex: 1 1 0;
        min-width: 0;
        background: #e9edf2;
        border: 1px solid #d7dde5;
        border-radius: 14px;
        padding: 14px 12px;
        overflow: hidden;
    }

    .summary-label {
        color: #64748b;
        font-size: 10px;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.2;
    }

    .summary-value {
        margin-top: 6px;
        color: #0b1f45;
        font-size: 16px;
        font-weight: bold;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.2;
    }

.invoice-card {
    width: 100%;
    background: #e9edf2;
    border: 1px solid #d7dde5;
    border-radius: 14px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}

.invoice-card table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    table-layout: fixed;
}

.invoice-card thead th {
    background: #0b1f45;
    color: #ffffff;
    padding: 10px 8px;
    font-size: 9px;
    font-weight: 600;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: middle;
}

.invoice-card tbody {
    background: #e9edf2;
}

.invoice-card tbody tr {
    background: #e9edf2;
}

.invoice-card tbody td {
    background: #e9edf2;
    color: #334155;
    padding: 10px 8px;
    border-bottom: 1px solid #d2d8e0;
    font-size: 9px;
    line-height: 1.3;
    vertical-align: middle;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    height: 38px;
}

.invoice-card tbody tr:last-child td {
    border-bottom: none;
}

.invoice-card tbody tr:nth-child(even) td {
    background: #e5e9ee;
}

.invoice-card tbody tr:hover td {
    background: #dde3ea;
}

.report-invoice-number {
    display: block;
    width: 100%;
    max-width: 100%;
    font-weight: 600;
    color: #0b1f45;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.report-client-name {
    display: block;
    width: 100%;
    max-width: 100%;
    color: #334155;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.report-status {
    display: inline-block;
    max-width: 100%;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.invoice-card tbody td strong {
    color: #0b1f45;
    white-space: nowrap;
}

@media screen and (max-width: 600px) {

    .invoice-card {
        width: 100%;
        border-radius: 12px;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
    }

    .invoice-card table {
        width: 100%;
        min-width: 700px;
        table-layout: fixed;
    }

    .invoice-card thead th {
        padding: 8px 6px;
        font-size: 8px;
        height: 34px;
    }

    .invoice-card tbody tr {
        height: 38px;
    }

    .invoice-card tbody td {
        padding: 9px 7px;
        font-size: 8px;
        line-height: 1.2;
        height: 38px;
        vertical-align: middle;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        border-bottom: 1px solid #d2d8e0;
    }

    .report-invoice-number,
    .report-client-name,
    .report-status {
        display: block;
        width: 100%;
        max-width: 100%;
        font-size: 8px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .report-invoice-number {
        font-weight: 600;
    }

    .report-client-name {
        font-weight: 400;
    }

    .report-status {
        font-weight: 600;
    }

    .invoice-card tbody td strong {
        font-size: 8px;
        white-space: nowrap;
    }

}

.export-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
}

.export-action-button {
    border: none;
    border-radius: 8px;
    padding: 9px 16px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
}

.export-cancel-button {
    background: #e2e8f0;
    color: #334155;
}

.export-cancel-button:hover {
    background: #cbd5e1;
}

@media print {

    .export-actions {
        display: none;
    }

}

.footer {
    margin-top: 20px;
    padding: 12px 4px 0;
    border-top: 1px solid #d7dde5;
    color: #64748b;
    font-size: 9px;
    line-height: 1.4;
    text-align: left;
}

html {
    margin: 0;
    padding: 0;
}

body {
    margin: 0;
    padding: 28px;
    min-height: 100vh;
    overflow-x: hidden;
    overflow-y: auto;
}

.invoice-card {
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
    display: block;
}

.summary-card {
    min-width: 0;
    overflow: hidden;
}

.summary-value {
    font-size: 14px;
    line-height: 1.2;
    white-space: nowrap;
    overflow: visible;
    text-overflow: clip;
    letter-spacing: -0.3px;
}

@media screen and (max-width: 600px) {

    html {
        margin: 0;
        padding: 0;
    }

    body {
        padding: 14px;
        min-height: 100vh;
        overflow-x: hidden;
        overflow-y: auto;
    }

    .summary {
        gap: 7px;
    }

    .summary-card {
        padding: 10px 6px;
        min-width: 0;
        overflow: hidden;
    }

    .summary-label {
        font-size: 7px;
    }

    .summary-value {
        font-size: 9px;
        line-height: 1.15;
        white-space: nowrap;
        overflow: visible;
        text-overflow: clip;
        letter-spacing: -0.4px;
    }

    .invoice-card {
        width: 100%;
        max-width: 100%;
        margin: 0 auto;
        border-radius: 12px;
    }

    .footer {
        margin-top: 14px;
        padding: 9px 3px 0;
        font-size: 8px;
        line-height: 1.4;
        text-align: left;
    }

}

.report-client-cell {
    display: flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
}

.report-client-image,
.report-client-initials {
    width: 24px;
    height: 24px;
    min-width: 24px;
    border-radius: 50%;
}

.report-client-image {
    display: block;
    object-fit: cover;
}

.report-client-initials {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #dbe4f0;
    color: #0b1f45;
    font-size: 8px;
    font-weight: 700;
    line-height: 1;
}

.report-client-cell .report-client-name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
}

</style>

        </head>

        <body>

            <div class="header">

                <h1>
                    Invoice Report
                </h1>

                <div class="date">
                    Generated:
                    ${reportsEscapeHtml(
                        new Date().toLocaleString()
                    )}
                </div>

            </div>


            <div class="summary">

                <div class="summary-card">

                    <div class="summary-label">
                        Total Invoices
                    </div>

                    <div class="summary-value">
                        ${summary.totalInvoices}
                    </div>

                </div>


                <div class="summary-card">

                    <div class="summary-label">
                        Total Revenue
                    </div>

                    <div class="summary-value">
                        ${reportsEscapeHtml(
                            reportsFormatMoney(
                                summary.totalRevenue
                            )
                        )}
                    </div>

                </div>


                <div class="summary-card">

                    <div class="summary-label">
                        Paid Invoices
                    </div>

                    <div class="summary-value">
                        ${summary.paidCount}
                    </div>

                </div>


                <div class="summary-card">

                    <div class="summary-label">
                        Outstanding
                    </div>

                    <div class="summary-value">
                        ${reportsEscapeHtml(
                            reportsFormatMoney(
                                summary.outstandingAmount
                            )
                        )}
                    </div>

                </div>

            </div>


<div class="invoice-card">

    <table>

        <thead>

                    <tr>

                        <th>Invoice</th>

                        <th>Client</th>

                        <th>Issue Date</th>

                        <th>Due Date</th>

                        <th>Status</th>

                        <th>Tax</th>

                        <th>Total</th>

                    </tr>
                    
                    </thead>


                <tbody>

                    ${tableRows}

                </tbody>

    </table>

</div>


            <div class="export-actions">

                <button
                    type="button"
                    class="export-action-button export-cancel-button"
                    id="exportCancelButton"
                >
                    Cancel
                </button>

            </div>

            <div class="footer">

                Invoice Report

            </div>

        </body>

        </html>
    `;

}

function reportsUpdateExportButtonState() {

    const buttons = [
        ReportsElements.exportPdfButton,
        ReportsElements.exportEstimatePdfButton
    ];

    const exportUsage =
        ReportsState.exportUsage;

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

            button.textContent =
                "Export";

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
            `Export (${remaining} left)`;

        button.title =
            `${remaining} PDF exports remaining`;

    });

}

function reportsApplyCurrency(
    response
) {

    if (!response) {
        return;
    }

    if (
        response.currencySymbol
    ) {

        ReportsState.currencySymbol =
            response.currencySymbol;

    }

    if (
        response.currencyCode
    ) {

        ReportsState.currencyCode =
            response.currencyCode;

    }
}

async function reportsLoadData() {

    reportsShowLoading(true);

    try {

        const [
            invoices,
            estimates,
            invoiceStatistics,
            invoiceStatus,
            revenueOverview,
            estimateStatistics
        ] = await Promise.all([

            reportsLoadAllInvoices(),

            reportsLoadAllEstimates(),

            reportsLoadInvoiceStatistics(),

            reportsLoadInvoiceStatus(),

            reportsLoadRevenueOverview(
                ReportsState.revenuePeriod
            ),

            reportsLoadEstimateStatistics()

        ]);

        ReportsState.invoices =
            Array.isArray(invoices)
                ? invoices
                : [];

        ReportsState.estimates =
            Array.isArray(estimates)
                ? estimates
                : [];

        ReportsState.invoiceStatistics =
            invoiceStatistics;

        ReportsState.invoiceStatus =
            invoiceStatus;

        ReportsState.revenueOverview =
            revenueOverview;

        ReportsState.estimatesStatistics =
            estimateStatistics;

        reportsApplyCurrency(
            revenueOverview
        );

        if (
            !ReportsState.currencySymbol &&
            ReportsState.invoices.length
        ) {

            const firstInvoice =
                ReportsState.invoices[0];

            ReportsState.currencySymbol =
                firstInvoice.currencySymbol ||
                "$";

            ReportsState.currencyCode =
                firstInvoice.currencyCode ||
                "USD";

        }

        if (
            ReportsState.estimates.length &&
            (
                !ReportsState.currencySymbol ||
                ReportsState.currencySymbol === "$"
            )
        ) {

            const firstEstimate =
                ReportsState.estimates[0];

            ReportsState.currencySymbol =
                firstEstimate.currencySymbol ||
                ReportsState.currencySymbol ||
                "$";

            ReportsState.currencyCode =
                firstEstimate.currencyCode ||
                ReportsState.currencyCode ||
                "USD";

        }

        reportsRenderAll();

    } catch (error) {

        console.error(
            "Reports load error:",
            error
        );

        reportsShowToast(
            error.message ||
            "Unable to load reports."
        );

    } finally {

        reportsShowLoading(false);

    }
}

function reportsRenderAll() {

    reportsRenderSummary();

    reportsRenderInvoiceStatistics();

    reportsRenderRevenueChart();

    reportsRenderClientRevenue();

    reportsRenderTaxSummary();

    reportsRenderPaymentMethods();

    reportsRenderEstimateStatistics();

    reportsRenderInvoiceTable();

    reportsRenderEstimateTable();

    reportsUpdateFilterStatus();

}

function reportsCalculateSummary() {

    const invoices =
        reportsGetFilteredInvoices();


    let totalRevenue = 0;

    let paidAmount = 0;

    let pendingAmount = 0;

    let overdueAmount = 0;

    let draftAmount = 0;

    let paidCount = 0;

    let pendingCount = 0;

    let overdueCount = 0;

    let draftCount = 0;


    invoices.forEach(invoice => {

        const amount =
            reportsNumber(
                invoice.totalAmount
            );

        const status =
            reportsNormalizeStatus(
                invoice.status
            );


        if (
            status === "Paid"
        ) {

            paidCount++;

            paidAmount += amount;

            totalRevenue += amount;

        }


        else if (
            status === "Pending"
        ) {

            pendingCount++;

            pendingAmount += amount;

        }


        else if (
            status === "Overdue"
        ) {

            overdueCount++;

            overdueAmount += amount;

        }


        else if (
            status === "Draft"
        ) {

            draftCount++;

            draftAmount += amount;

        }

    });


    return {

        totalInvoices:
            invoices.length,

        totalRevenue,

        paidCount,

        paidAmount,

        pendingCount,

        pendingAmount,

        overdueCount,

        overdueAmount,

        draftCount,

        draftAmount,

        unpaidCount:
            pendingCount +
            overdueCount,

        outstandingAmount:
            pendingAmount +
            overdueAmount

    };
}

function reportsRenderSummary() {

    const summary =
        reportsCalculateSummary();


    ReportsElements.totalRevenue.textContent =
        reportsFormatMoney(
            summary.totalRevenue
        );


    ReportsElements.paidInvoices.textContent =
        summary.paidCount;


    ReportsElements.paidInvoiceAmount.textContent =
        reportsFormatMoney(
            summary.paidAmount
        );


    ReportsElements.unpaidInvoices.textContent =
        summary.unpaidCount;


    ReportsElements.unpaidAmount.textContent =
        reportsFormatMoney(
            summary.pendingAmount
        ) +
        " outstanding";


    ReportsElements.overdueInvoices.textContent =
        summary.overdueCount;


    ReportsElements.overdueAmount.textContent =
        reportsFormatMoney(
            summary.overdueAmount
        ) +
        " overdue";


    ReportsElements.outstandingAmount.textContent =
        reportsFormatMoney(
            summary.outstandingAmount
        );


    ReportsElements.totalInvoices.textContent =
        summary.totalInvoices;


    if (
        ReportsState.invoiceStatistics
    ) {

        ReportsElements.invoiceGrowth.textContent =
            ReportsState.invoiceStatistics
                .totalGrowth ||
            "--";

    } else {

        ReportsElements.invoiceGrowth.textContent =
            "--";

    }


    if (
        ReportsState.invoiceStatistics
    ) {

        ReportsElements.revenueGrowth.textContent =
            ReportsState.invoiceStatistics
                .paidGrowth ||
            "--";

    } else {

        ReportsElements.revenueGrowth.textContent =
            "--";

    }

}

function reportsRenderInvoiceStatistics() {
    
    const summary =
        reportsCalculateSummary();
    
    const total =
        summary.draftCount +
        summary.pendingCount +
        summary.paidCount +
        summary.overdueCount;
    
    ReportsElements.draftCount.textContent =
        summary.draftCount;
    
    ReportsElements.pendingCount.textContent =
        summary.pendingCount;
    
    ReportsElements.paidCount.textContent =
        summary.paidCount;
    
    ReportsElements.overdueCount.textContent =
        summary.overdueCount;
    
    let draftPercentage = 0;
    
    let paidPercentage = 0;
    
    let pendingPercentage = 0;
    
    let overduePercentage = 0;
    
    if (total > 0) {
        
        draftPercentage =
            Math.round(
                (
                    summary.draftCount /
                    total
                ) *
                100
            );
        
        pendingPercentage =
            Math.round(
                (
                    summary.pendingCount /
                    total
                ) *
                100
            );
        
        paidPercentage =
            Math.round(
                (
                    summary.paidCount /
                    total
                ) *
                100
            );
        
        overduePercentage =
            Math.round(
                (
                    summary.overdueCount /
                    total
                ) *
                100
            );
        
    }
    
    ReportsElements.draftProgress.style.width =
        `${draftPercentage}%`;
    
    ReportsElements.pendingProgress.style.width =
        `${pendingPercentage}%`;
    
    ReportsElements.paidProgress.style.width =
        `${paidPercentage}%`;
    
    ReportsElements.overdueProgress.style.width =
        `${overduePercentage}%`;
    
    ReportsElements.draftPercentage.textContent =
        `${draftPercentage}%`;
    
    ReportsElements.pendingPercentage.textContent =
        `${pendingPercentage}%`;
    
    ReportsElements.paidPercentage.textContent =
        `${paidPercentage}%`;
    
    ReportsElements.overduePercentage.textContent =
        `${overduePercentage}%`;
        
    const pendingPosition =
    draftPercentage;

const paidPosition =
    draftPercentage +
    pendingPercentage;

const overduePosition =
    draftPercentage +
    pendingPercentage +
    paidPercentage;

document.documentElement.style.setProperty(
    "--pending-position",
    `${pendingPosition}%`
);

document.documentElement.style.setProperty(
    "--paid-position",
    `${paidPosition}%`
);

document.documentElement.style.setProperty(
    "--overdue-position",
    `${overduePosition}%`
);
    
}

function reportsGetRevenueByMonth(
    invoices,
    period = ReportsState.revenuePeriod
) {

    const now = new Date();

    let monthCount = 6;

    if (period === "30days") {
        monthCount = 1;
    }

    if (period === "6months") {
        monthCount = 6;
    }

    if (period === "12months") {
        monthCount = 12;
    }


    const months = [];

    if (period === "30days") {

        const start = new Date(now);

        start.setDate(
            now.getDate() - 29
        );

        start.setHours(
            0,
            0,
            0,
            0
        );


        const end = new Date(now);

        end.setHours(
            23,
            59,
            59,
            999
        );


        let total = 0;

        invoices.forEach(invoice => {

            const date =
                reportsGetInvoiceDate(
                    invoice
                );

            if (!date) {
                return;
            }

            if (
                date < start ||
                date > end
            ) {
                return;
            }

            if (
                reportsNormalizeStatus(
                    invoice.status
                ) !== "Paid"
            ) {
                return;
            }

            total += reportsNumber(
                invoice.totalAmount
            );

        });


        return [
            {
                label: "30 days",
                value: total
            }
        ];
    }


    for (
        let i = monthCount - 1;
        i >= 0;
        i--
    ) {

        const date = new Date(
            now.getFullYear(),
            now.getMonth() - i,
            1
        );

        months.push({
            year: date.getFullYear(),
            month: date.getMonth(),
            label: date.toLocaleDateString(
                undefined,
                {
                    month: "short"
                }
            ),
            value: 0
        });

    }


    invoices.forEach(invoice => {

        if (
            reportsNormalizeStatus(
                invoice.status
            ) !== "Paid"
        ) {
            return;
        }


        const date =
            reportsGetInvoiceDate(
                invoice
            );

        if (!date) {
            return;
        }


        const matchingMonth =
            months.find(item =>
                item.year ===
                    date.getFullYear() &&
                item.month ===
                    date.getMonth()
            );


        if (!matchingMonth) {
            return;
        }


        matchingMonth.value +=
            reportsNumber(
                invoice.totalAmount
            );

    });


    return months;
}

function reportsRenderRevenueChart() {

    const chart =
        ReportsElements.revenueChart;

    if (!chart) {
        return;
    }


    const data =
        reportsGetRevenueByMonth(
            reportsGetFilteredInvoices(),
            ReportsState.revenuePeriod
        );


    if (!data.length) {

        chart.innerHTML = `
            <div class="reports-empty-state">
                <i class="ri-bar-chart-2-line"></i>
                <p>No revenue data available.</p>
            </div>
        `;

        return;
    }


    const maxValue =
        Math.max(
            ...data.map(
                item =>
                    reportsNumber(
                        item.value
                    )
            ),
            1
        );


    chart.innerHTML =
        data.map(item => {

            const value =
                reportsNumber(
                    item.value
                );


            const percentage =
                value > 0
                    ? Math.max(
                        (value / maxValue) * 100,
                        3
                    )
                    : 2;


            return `
                <div class="revenue-chart-column">

                    <div class="revenue-chart-bar-area">

                        <div
                            class="revenue-chart-bar"
                            style="height:${percentage}%"
                        >

                            <div class="revenue-chart-tooltip">
                                ${reportsFormatMoney(value)}
                            </div>

                        </div>

                    </div>

                    <span class="revenue-chart-label">
                        ${reportsEscapeHtml(item.label)}
                    </span>

                </div>
            `;

        }).join("");
}

function reportsCalculateClientRevenue() {

    const invoices =
        reportsGetFilteredInvoices();


    const clients = {};


    invoices.forEach(invoice => {

        if (
            reportsNormalizeStatus(
                invoice.status
            ) !== "Paid"
        ) {
            return;
        }


        const client =
            reportsGetClientName(
                invoice
            );


        const amount =
            reportsNumber(
                invoice.totalAmount
            );


        if (!clients[client]) {

            clients[client] = {
                name: client,
                amount: 0,
                invoices: 0
            };

        }


        clients[client].amount += amount;

        clients[client].invoices++;

    });


    return Object.values(clients)
        .sort(
            (a, b) =>
                b.amount - a.amount
        );
}

function reportsRenderClientRevenue() {

    const container =
        ReportsElements.clientRevenueList;


    if (!container) {
        return;
    }


    const clients =
        reportsCalculateClientRevenue();


    if (!clients.length) {

        container.innerHTML = `
            <div class="reports-empty-state">
                <i class="ri-bar-chart-2-line"></i>
                <p>No revenue data available.</p>
            </div>
        `;

        return;
    }


    const topClients =
        clients.slice(0, 7);


    const maximum =
        Math.max(
            ...topClients.map(
                client =>
                    client.amount
            ),
            1
        );


    container.innerHTML =
        topClients.map(client => {

            const percentage =
                Math.max(
                    (
                        client.amount /
                        maximum
                    ) * 100,
                    3
                );


            return `
                <div class="client-revenue-row">

                    <div
                        class="client-revenue-name"
                        title="${reportsEscapeHtml(client.name)}"
                    >
                        ${reportsEscapeHtml(client.name)}
                    </div>

                    <div class="client-revenue-track">

                        <div
                            class="client-revenue-fill"
                            style="width:${percentage}%"
                        ></div>

                    </div>

                    <div class="client-revenue-value">
                        ${reportsFormatMoney(client.amount)}
                    </div>

                </div>
            `;

        }).join("");
}

async function reportsChangeRevenuePeriod(
    period
) {

    ReportsState.revenuePeriod =
        period;


    try {

        const revenueOverview =
            await reportsLoadRevenueOverview(
                period
            );


        ReportsState.revenueOverview =
            revenueOverview;


        reportsApplyCurrency(
            revenueOverview
        );


        reportsRenderRevenueChart();


    } catch (error) {

        console.error(
            "Revenue period error:",
            error
        );

        reportsShowToast(
            "Unable to update revenue chart."
        );

    }

}

function reportsBindRevenueEvents() {

    if (
        !ReportsElements.revenuePeriod
    ) {
        return;
    }


    ReportsElements.revenuePeriod.addEventListener(
        "change",
        async event => {

            const period =
                event.target.value;


            ReportsState.revenuePeriod =
                period;


            await reportsChangeRevenuePeriod(
                period
            );

        }
    );

}

function reportsGetStatisticValue(
    source,
    keys,
    fallback = 0
) {

    if (
        !source ||
        typeof source !== "object"
    ) {
        return fallback;
    }


    for (
        const key of keys
    ) {

        if (
            source[key] !== undefined &&
            source[key] !== null
        ) {

            return source[key];

        }

    }


    return fallback;

}

function reportsRenderEstimateStatistics() {

    const data =
        ReportsState.estimatesStatistics ||
        ReportsState.estimates;

    if (!data) {

        ReportsElements.totalEstimates.textContent =
            "0";

        ReportsElements.draftEstimates.textContent =
            "0";

        ReportsElements.approvedEstimates.textContent =
            "0";

        ReportsElements.estimatedValue.textContent =
            reportsFormatMoney(0);

        return;

    }

    const statistics =
        data.statistics ||
        data.stats ||
        data;

    const total =
        reportsNumber(
            reportsGetStatisticValue(
                statistics,
                [
                    "totalEstimates",
                    "total",
                    "count"
                ]
            )
        );

    const draft =
        reportsNumber(
            reportsGetStatisticValue(
                statistics,
                [
                    "pendingEstimates",
                    "draftEstimates",
                    "draft",
                    "draftCount"
                ]
            )
        );

    const approved =
        reportsNumber(
            reportsGetStatisticValue(
                statistics,
                [
                    "approvedEstimates",
                    "approved",
                    "approvedCount"
                ]
            )
        );

    const value =
        reportsNumber(
            reportsGetStatisticValue(
                statistics,
                [
                    "estimatedValue",
                    "totalValue",
                    "totalAmount",
                    "amount"
                ]
            )
        );

    ReportsElements.totalEstimates.textContent =
        total;

    ReportsElements.draftEstimates.textContent =
        draft;

    ReportsElements.approvedEstimates.textContent =
        approved;

    ReportsElements.estimatedValue.textContent =
        reportsFormatMoney(
            value
        );

}

function reportsGetPaymentMethod(
    invoice
) {

    const paymentDetails =
        invoice.paymentDetails;


    if (
        paymentDetails &&
        typeof paymentDetails === "object"
    ) {

        return (
            paymentDetails.paymentMethod ||
            paymentDetails.method ||
            paymentDetails.type ||
            ""
        );

    }


    return (
        invoice.paymentMethod ||
        invoice.payment_method ||
        invoice.method ||
        ""
    );

}

function reportsRenderInvoiceTable() {

    const tbody =
        ReportsElements.invoiceTableBody;

    if (!tbody) {
        return;
    }


    const invoices =
        reportsGetFilteredInvoices();


    if (!invoices.length) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="reports-table-empty"
                >
                    No invoices found for the selected period.
                </td>
            </tr>
        `;

        return;
    }


    const sortedInvoices =
        [...invoices].sort(
            (a, b) => {

                const dateA =
                    reportsGetInvoiceDate(a);

                const dateB =
                    reportsGetInvoiceDate(b);


                if (!dateA && !dateB) {
                    return 0;
                }

                if (!dateA) {
                    return 1;
                }

                if (!dateB) {
                    return -1;
                }


                return dateB - dateA;

            }
        );


    tbody.innerHTML =
        sortedInvoices.map(
            invoice => {

                const invoiceNumber =
                    invoice.invoiceNumber ||
                    invoice.number ||
                    "—";


                const clientName =
                    reportsGetClientName(
                        invoice
                    );
                    
                const clientImageUrl =
    invoice.clientImageUrl ||
    "";

const clientInitials =
    clientName
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(name => name.charAt(0).toUpperCase())
        .join("") ||
    "?";


                const issueDate =
                    reportsFormatDate(
                        invoice.issueDate ||
                        invoice.createdAt
                    );


                const dueDate =
                    reportsFormatDate(
                        invoice.dueDate
                    );


                const status =
                    reportsNormalizeStatus(
                        invoice.status
                    );


                const statusClass =
                    reportsGetStatusClass(
                        status
                    );


                const tax =
                    reportsGetInvoiceTax(
                        invoice
                    );


                const total =
                    reportsNumber(
                        invoice.totalAmount
                    );


                return `
                    <tr>

                        <td>
                            <span class="report-invoice-number">
                                ${reportsEscapeHtml(invoiceNumber)}
                            </span>
                        </td>

<td>
    <div class="report-client-cell${ReportsState.showClientImage ? "" : " no-client-image"}">

        ${
            ReportsState.showClientImage
                ? (
                    clientImageUrl
                        ? `
                            <img
                                class="report-client-image"
                                src="${reportsEscapeHtml(clientImageUrl)}"
                                alt="${reportsEscapeHtml(clientName)}"
                                onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
                            >

                            <span
                                class="report-client-initials"
                                style="display:none;"
                            >
                                ${reportsEscapeHtml(clientInitials)}
                            </span>
                        `
                        : `
                            <span class="report-client-initials">
                                ${reportsEscapeHtml(clientInitials)}
                            </span>
                        `
                )
                : ""
        }

        <span
            class="report-client-name"
            title="${reportsEscapeHtml(clientName)}"
        >
            ${reportsEscapeHtml(clientName)}
        </span>

    </div>
</td>

                        <td>
                            ${reportsEscapeHtml(issueDate)}
                        </td>

                        <td>
                            ${reportsEscapeHtml(dueDate)}
                        </td>

                        <td>

                            <span
                                class="report-status ${statusClass}"
                            >
                                ${reportsEscapeHtml(status)}
                            </span>

                        </td>

                        <td>
                            ${reportsFormatMoney(tax)}
                        </td>

                        <td>
                            <strong>
                                ${reportsFormatMoney(total)}
                            </strong>
                        </td>

                    </tr>
                `;

            }
        ).join("");

}

function reportsRenderEstimateTable() {

    const tbody =
        ReportsElements.estimateTableBody;

    if (!tbody) {
        return;
    }

    const estimates =
        reportsGetFilteredEstimates();

    if (!estimates.length) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="reports-table-empty"
                >
                    No estimates found for the selected period.
                </td>
            </tr>
        `;

        return;
    }

    const sortedEstimates =
        [...estimates].sort(
            (a, b) => {

                const dateA =
                    reportsGetEstimateDate(a);

                const dateB =
                    reportsGetEstimateDate(b);

                if (!dateA && !dateB) {
                    return 0;
                }

                if (!dateA) {
                    return 1;
                }

                if (!dateB) {
                    return -1;
                }

                return dateB - dateA;

            }
        );

    tbody.innerHTML =
        sortedEstimates.map(
            estimate => {

                const estimateNumber =
                    estimate.estimateNumber ||
                    "—";

                const clientName =
                    estimate.clientName ||
                    "Unknown Client";
                    
                const clientImageUrl =
    estimate.clientImageUrl ||
    "";

const clientInitials =
    clientName
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(name => name.charAt(0).toUpperCase())
        .join("") ||
    "?";

                const issueDate =
                    reportsFormatDate(
                        estimate.issueDate ||
                        estimate.createdDate
                    );

                const expiryDate =
                    reportsFormatDate(
                        estimate.expiryDate
                    );

                const status =
                    reportsNormalizeEstimateStatus(
                        estimate.status
                    );

                const statusClass =
                    reportsGetEstimateStatusClass(
                        status
                    );

                const tax =
                    reportsNumber(
                        estimate.taxAmount
                    );

                const total =
                    reportsNumber(
                        estimate.grandTotal
                    );

                return `
                    <tr>

                        <td>
                            <span class="report-invoice-number">
                                ${reportsEscapeHtml(
                                    estimateNumber
                                )}
                            </span>
                        </td>
<td>
    <div class="report-client-cell${ReportsState.showClientImage ? "" : " no-client-image"}">

        ${
            ReportsState.showClientImage
                ? (
                    clientImageUrl
                        ? `
                            <img
                                class="report-client-image"
                                src="${reportsEscapeHtml(clientImageUrl)}"
                                alt="${reportsEscapeHtml(clientName)}"
                                onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
                            >

                            <span
                                class="report-client-initials"
                                style="display:none;"
                            >
                                ${reportsEscapeHtml(clientInitials)}
                            </span>
                        `
                        : `
                            <span class="report-client-initials">
                                ${reportsEscapeHtml(clientInitials)}
                            </span>
                        `
                )
                : ""
        }

        <span
            class="report-client-name"
            title="${reportsEscapeHtml(clientName)}"
        >
            ${reportsEscapeHtml(clientName)}
        </span>

    </div>
</td>

                        <td>
                            ${reportsEscapeHtml(
                                issueDate
                            )}
                        </td>

                        <td>
                            ${reportsEscapeHtml(
                                expiryDate
                            )}
                        </td>

                        <td>

                            <span
                                class="report-status ${statusClass}"
                            >
                                ${reportsEscapeHtml(
                                    status
                                )}
                            </span>

                        </td>

                        <td>
                            ${reportsFormatMoney(
                                tax
                            )}
                        </td>

                        <td>
                            <strong>
                                ${reportsFormatMoney(
                                    total
                                )}
                            </strong>
                        </td>

                    </tr>
                `;

            }
        ).join("");

}

function reportsGetExportRows() {

    const invoices =
        reportsGetExportInvoices();


    return invoices.map(invoice => {
        
    const clientName =
    reportsGetClientName(
        invoice
    );

const clientImageUrl =
    invoice.clientImageUrl ||
    "";

const clientInitials =
    clientName
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(name => name.charAt(0).toUpperCase())
        .join("") ||
    "?";

        return {

            invoice:
                invoice.invoiceNumber ||
                invoice.number ||
                "",

            client:
                reportsGetClientName(
                    invoice
                ),
                
            clientImageUrl:
                clientImageUrl,

            clientInitials:
                clientInitials,

            issueDate:
                reportsFormatDate(
                    invoice.issueDate ||
                    invoice.createdAt
                ),

            dueDate:
                reportsFormatDate(
                    invoice.dueDate
                ),

            status:
                reportsNormalizeStatus(
                    invoice.status
                ),

            tax:
                reportsGetInvoiceTax(
                    invoice
                ),

            total:
                reportsNumber(
                    invoice.totalAmount
                )

        };

    });

}

function reportsGetExportEstimates() {

    return reportsGetFilteredEstimates()
        .slice()
        .sort((a, b) => {

            const dateA =
                reportsGetEstimateDate(a);

            const dateB =
                reportsGetEstimateDate(b);

            if (!dateA && !dateB) {
                return 0;
            }

            if (!dateA) {
                return 1;
            }

            if (!dateB) {
                return -1;
            }

            return dateB - dateA;

        });

}

function reportsGetEstimateExportRows() {

    const estimates =
        reportsGetExportEstimates();

    return estimates.map(
        estimate => {
            
            const clientName =
    estimate.clientName ||
    "Unknown Client";

const clientImageUrl =
    estimate.clientImageUrl ||
    "";

const clientInitials =
    clientName
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(name => name.charAt(0).toUpperCase())
        .join("") ||
    "?";

            return {

                estimate:
                    estimate.estimateNumber ||
                    "",

                client:
                    estimate.clientName ||
                    "Unknown Client",
                    
                clientImageUrl:
                    clientImageUrl,

                clientInitials:
                   clientInitials,


                issueDate:
                    reportsFormatDate(
                        estimate.issueDate ||
                        estimate.createdDate
                    ),

                expiryDate:
                    reportsFormatDate(
                        estimate.expiryDate
                    ),

                status:
                    reportsNormalizeEstimateStatus(
                        estimate.status
                    ),

                tax:
                    reportsNumber(
                        estimate.taxAmount
                    ),

                total:
                    reportsNumber(
                        estimate.grandTotal
                    )

            };

        }
    );

}

function reportsBuildEstimatePDFHTML() {

    const rows =
        reportsGetEstimateExportRows();

    const estimates =
        reportsGetFilteredEstimates();

    const totalValue =
        estimates.reduce(
            (sum, estimate) =>
                sum +
                reportsNumber(
                    estimate.grandTotal
                ),
            0
        );

    const approvedCount =
        estimates.filter(
            estimate =>
                reportsNormalizeEstimateStatus(
                    estimate.status
                ) === "Approved"
        ).length;

    const draftCount =
        estimates.filter(
            estimate =>
                reportsNormalizeEstimateStatus(
                    estimate.status
                ) === "Draft"
        ).length;

    let tableRows = "";

    rows.forEach(row => {

        tableRows += `
            <tr>

                <td>
                    ${reportsEscapeHtml(
                        row.estimate
                    )}
                </td>

               <td>
    <div class="report-client-cell${ReportsState.showClientImage ? "" : " no-client-image"}">

${
    ReportsState.showClientImage
        ? (
            row.clientImageUrl
                ? `
                    <img
                        class="report-client-image"
                        src="${reportsEscapeHtml(row.clientImageUrl)}"
                        alt="${reportsEscapeHtml(row.client)}"
                        onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
                    >

                    <span
                        class="report-client-initials"
                        style="display:none;"
                    >
                        ${reportsEscapeHtml(row.clientInitials)}
                    </span>
                `
                : `
                    <span class="report-client-initials">
                        ${reportsEscapeHtml(row.clientInitials)}
                    </span>
                `
        )
        : ""
}

        <span class="report-client-name">
            ${reportsEscapeHtml(row.client)}
        </span>

    </div>
</td>

                <td>
                    ${reportsEscapeHtml(
                        row.issueDate
                    )}
                </td>

                <td>
                    ${reportsEscapeHtml(
                        row.expiryDate
                    )}
                </td>

                <td>
                    ${reportsEscapeHtml(
                        row.status
                    )}
                </td>

                <td>
                    ${reportsEscapeHtml(
                        reportsFormatMoney(
                            row.tax
                        )
                    )}
                </td>

                <td>
                    ${reportsEscapeHtml(
                        reportsFormatMoney(
                            row.total
                        )
                    )}
                </td>

            </tr>
        `;

    });

    return `
        <!DOCTYPE html>

        <html>

        <head>

            <meta charset="UTF-8">

            <title>Estimate Report</title>

            <style>

                * {
                    box-sizing: border-box;
                }

                @page {
                    size: A4;
                    margin: 12mm;
                }

                body {
                    margin: 0;
                    padding: 28px;
                    font-family: Arial, sans-serif;
                    color: #0f172a;
                    background: #f1f3f5;
                }

                .header {
                    background: #ffffff;
                    border-radius: 14px;
                    border-bottom: 4px solid #0b1f45;
                    padding: 18px 20px;
                    margin-bottom: 20px;
                }

                h1 {
                    margin: 0;
                    color: #0b1f45;
                    font-size: 26px;
                    line-height: 1.2;
                }

                .date {
                    margin-top: 7px;
                    color: #64748b;
                    font-size: 12px;
                }

                .summary {
                    display: flex;
                    flex-direction: row;
                    flex-wrap: nowrap;
                    gap: 12px;
                    width: 100%;
                    margin-bottom: 20px;
                }

                .summary-card {
                    flex: 1 1 0;
                    min-width: 0;
                    background: #e9edf2;
                    border: 1px solid #d7dde5;
                    border-radius: 14px;
                    padding: 14px 12px;
                    overflow: hidden;
                }

                .summary-label {
                    color: #64748b;
                    font-size: 10px;
                    font-weight: 600;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    line-height: 1.2;
                }

                .summary-value {
                    margin-top: 6px;
                    color: #0b1f45;
                    font-size: 16px;
                    font-weight: bold;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    line-height: 1.2;
                }

                .estimate-card {
                    width: 100%;
                    background: #e9edf2;
                    border: 1px solid #d7dde5;
                    border-radius: 14px;
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                }

                .estimate-card table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                    table-layout: fixed;
                }

                .estimate-card thead th {
                    background: #0b1f45;
                    color: #ffffff;
                    padding: 10px 8px;
                    font-size: 9px;
                    font-weight: 600;
                    text-align: left;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    vertical-align: middle;
                }

                .estimate-card tbody {
                    background: #e9edf2;
                }

                .estimate-card tbody tr {
                    background: #e9edf2;
                }

                .estimate-card tbody td {
                    background: #e9edf2;
                    color: #334155;
                    padding: 10px 8px;
                    border-bottom: 1px solid #d2d8e0;
                    font-size: 9px;
                    line-height: 1.3;
                    vertical-align: middle;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    height: 38px;
                }

                .estimate-card tbody tr:last-child td {
                    border-bottom: none;
                }

                .estimate-card tbody tr:nth-child(even) td {
                    background: #e5e9ee;
                }

                .estimate-card tbody td strong {
                    color: #0b1f45;
                    white-space: nowrap;
                }
                
                .export-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
}

.export-action-button {
    border: none;
    border-radius: 8px;
    padding: 9px 16px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
}

.export-cancel-button {
    background: #e2e8f0;
    color: #334155;
}

.export-cancel-button:hover {
    background: #cbd5e1;
}

@media print {

    .export-actions {
        display: none;
    }

}

.report-client-cell {
    display: flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
}

.report-client-image,
.report-client-initials {
    width: 24px;
    height: 24px;
    min-width: 24px;
    border-radius: 50%;
}

.report-client-image {
    display: block;
    object-fit: cover;
}

.report-client-initials {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #dbe4f0;
    color: #0b1f45;
    font-size: 8px;
    font-weight: 700;
    line-height: 1;
}

.report-client-cell .report-client-name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
}

                .footer {
                    margin-top: 20px;
                    padding: 12px 4px 0;
                    border-top: 1px solid #d7dde5;
                    color: #64748b;
                    font-size: 9px;
                    line-height: 1.4;
                    text-align: left;
                }

                @media screen and (max-width: 600px) {

                    body {
                        padding: 14px;
                    }

                    .summary {
                        gap: 7px;
                    }

                    .summary-card {
                        padding: 10px 6px;
                    }

                    .summary-label {
                        font-size: 7px;
                    }

                    .summary-value {
                        font-size: 9px;
                    }

                    .estimate-card {
                        border-radius: 12px;
                    }

                    .estimate-card table {
                        min-width: 700px;
                    }

                    .estimate-card thead th {
                        padding: 8px 6px;
                        font-size: 8px;
                    }

                    .estimate-card tbody td {
                        padding: 9px 7px;
                        font-size: 8px;
                    }

                }

            </style>

        </head>

        <body>

            <div class="header">

                <h1>
                    Estimate Report
                </h1>

                <div class="date">
                    Generated:
                    ${reportsEscapeHtml(
                        new Date().toLocaleString()
                    )}
                </div>

            </div>

            <div class="summary">

                <div class="summary-card">

                    <div class="summary-label">
                        Total Estimates
                    </div>

                    <div class="summary-value">
                        ${estimates.length}
                    </div>

                </div>

                <div class="summary-card">

                    <div class="summary-label">
                        Estimated Value
                    </div>

                    <div class="summary-value">
                        ${reportsEscapeHtml(
                            reportsFormatMoney(
                                totalValue
                            )
                        )}
                    </div>

                </div>

                <div class="summary-card">

                    <div class="summary-label">
                        Approved
                    </div>

                    <div class="summary-value">
                        ${approvedCount}
                    </div>

                </div>

                <div class="summary-card">

                    <div class="summary-label">
                        Draft
                    </div>

                    <div class="summary-value">
                        ${draftCount}
                    </div>

                </div>

            </div>

            <div class="estimate-card">

                <table>

                    <thead>

                        <tr>

                            <th>Estimate</th>

                            <th>Client</th>

                            <th>Issue Date</th>

                            <th>Expiry Date</th>

                            <th>Status</th>

                            <th>Tax</th>

                            <th>Total</th>

                        </tr>

                    </thead>

                    <tbody>

                        ${tableRows}

                    </tbody>

                </table>

            </div>

            <div class="export-actions">

                <button
                    type="button"
                    class="export-action-button export-cancel-button"
                    id="exportCancelButton"
                >
                    Cancel
                </button>

            </div>
                        <div class="footer">

                Estimate Report

            </div>

        </body>

        </html>
    `;

}

function reportsCalculatePaymentMethods() {

    const invoices =
        reportsGetFilteredInvoices();


    const methods = {};


    invoices.forEach(invoice => {

        if (
            reportsNormalizeStatus(
                invoice.status
            ) !== "Paid"
        ) {
            return;
        }


        const method =
            reportsGetPaymentMethod(
                invoice
            );


        if (!method) {
            return;
        }


        const normalized =
            String(method)
                .trim();


        if (!normalized) {
            return;
        }


        const amount =
            reportsNumber(
                invoice.totalAmount
            );


        if (!methods[normalized]) {

            methods[normalized] = {
                name: normalized,
                amount: 0,
                count: 0
            };

        }


        methods[normalized].amount +=
            amount;

        methods[normalized].count++;

    });


    return Object.values(methods)
        .sort(
            (a, b) =>
                b.amount - a.amount
        );

}

function reportsRenderPaymentMethods() {

    const container =
        ReportsElements.paymentMethods;


    if (!container) {
        return;
    }


    const methods =
        reportsCalculatePaymentMethods();


    if (!methods.length) {

        container.innerHTML = `
            <div class="reports-empty-state">
                <i class="ri-bank-card-line"></i>
                <p>
                    Payment method data is not available
                    in the loaded invoice records.
                </p>
            </div>
        `;

        return;
    }


    const maximum =
        Math.max(
            ...methods.map(
                method =>
                    method.amount
            ),
            1
        );


    container.innerHTML =
        methods.map(method => {

            const percentage =
                Math.max(
                    (
                        method.amount /
                        maximum
                    ) * 100,
                    3
                );


            return `
                <div class="payment-method-row">

                    <div class="payment-method-top">

                        <span class="payment-method-name">
                            ${reportsEscapeHtml(method.name)}
                        </span>

                        <span class="payment-method-value">
                            ${reportsFormatMoney(method.amount)}
                        </span>

                    </div>

                    <div class="payment-method-track">

                        <div
                            class="payment-method-fill"
                            style="width:${percentage}%"
                        ></div>

                    </div>

                </div>
            `;

        }).join("");

}

function reportsGetInvoiceTax(invoice) {

    const directTax =
        reportsNumber(
            invoice.tax
        );

    if (directTax > 0) {
        return directTax;
    }


    const subtotal =
        reportsNumber(
            invoice.subtotal
        );

    const taxPercent =
        reportsNumber(
            invoice.taxPercent
        );


    if (
        subtotal > 0 &&
        taxPercent > 0
    ) {

        return (
            subtotal *
            taxPercent /
            100
        );

    }


    return 0;
}

function reportsCalculateTaxSummary() {

    const invoices =
        reportsGetFilteredInvoices();


    let taxableRevenue = 0;

    let totalTax = 0;

    let taxableInvoices = 0;

    let taxRateTotal = 0;

    let taxRateCount = 0;


    invoices.forEach(invoice => {

        const subtotal =
            reportsNumber(
                invoice.subtotal
            );


        const total =
            reportsNumber(
                invoice.totalAmount
            );


        const tax =
            reportsGetInvoiceTax(
                invoice
            );


        if (
            tax > 0
        ) {

            taxableInvoices++;

            totalTax += tax;


            if (subtotal > 0) {

                taxableRevenue +=
                    subtotal;

            } else {

                taxableRevenue +=
                    Math.max(
                        total - tax,
                        0
                    );

            }


            const taxPercent =
                reportsNumber(
                    invoice.taxPercent
                );


            if (
                taxPercent > 0
            ) {

                taxRateTotal +=
                    taxPercent;

                taxRateCount++;

            }

        }

    });


    const averageTax =
        taxRateCount > 0
            ? taxRateTotal /
              taxRateCount
            : (
                taxableRevenue > 0
                    ? (
                        totalTax /
                        taxableRevenue
                    ) *
                    100
                    : 0
            );


    return {

        taxableRevenue,

        totalTax,

        taxableInvoices,

        averageTax

    };

}

function reportsRenderTaxSummary() {

    const summary =
        reportsCalculateTaxSummary();


    ReportsElements.taxableRevenue.textContent =
        reportsFormatMoney(
            summary.taxableRevenue
        );


    ReportsElements.totalTax.textContent =
        reportsFormatMoney(
            summary.totalTax
        );


    ReportsElements.averageTax.textContent =
        `${summary.averageTax.toFixed(2)}%`;


    ReportsElements.taxableInvoices.textContent =
        summary.taxableInvoices;

}

function reportsUpdateFilterStatus() {

    const element =
        ReportsElements.filterStatus;


    if (!element) {
        return;
    }


    const filter =
        ReportsState.dateFilter;


    const labels = {

        "30days":
            "Last 30 days",

        "90days":
            "Last 90 days",

        "6months":
            "Last 6 months",

        "12months":
            "Last 12 months",

        "thisYear":
            "This year",

        "all":
            "All time",

        "custom":
            "Custom range"

    };


    element.textContent =
        labels[filter] ||
        "Selected period";

}

function reportsApplyCustomDateFilter() {

    const start =
        ReportsElements.startDate.value;


    const end =
        ReportsElements.endDate.value;


    if (!start || !end) {

        reportsShowToast(
            "Select both start and end dates."
        );

        return false;

    }


    const startDate =
        new Date(
            `${start}T00:00:00`
        );


    const endDate =
        new Date(
            `${end}T23:59:59`
        );


    if (
        Number.isNaN(
            startDate.getTime()
        ) ||
        Number.isNaN(
            endDate.getTime()
        )
    ) {

        reportsShowToast(
            "Invalid date range."
        );

        return false;

    }


    if (
        startDate > endDate
    ) {

        reportsShowToast(
            "Start date cannot be after end date."
        );

        return false;

    }


    ReportsState.customStartDate =
        startDate;


    ReportsState.customEndDate =
        endDate;


    ReportsState.dateFilter =
        "custom";


    reportsRenderAll();

    return true;

}

function reportsSetDateFilter(
    filter
) {

    ReportsState.dateFilter =
        filter;


    reportsSyncDateFilterUI();


    if (
        filter === "custom"
    ) {
        return;
    }


    reportsRenderAll();

}

function reportsSetDefaultDates() {

    const today =
        new Date();


    const end =
        new Date(today);


    const start =
        new Date(
            today.getFullYear(),
            today.getMonth() - 5,
            1
        );


    const formatDate =
        date => {

            const year =
                date.getFullYear();


            const month =
                String(
                    date.getMonth() + 1
                ).padStart(
                    2,
                    "0"
                );


            const day =
                String(
                    date.getDate()
                ).padStart(
                    2,
                    "0"
                );


            return `${year}-${month}-${day}`;

        };


    ReportsElements.startDate.value =
        formatDate(start);


    ReportsElements.endDate.value =
        formatDate(end);

}

function reportsBindDateFilterEvents() {

    if (
        ReportsElements.dateFilter
    ) {

        ReportsElements.dateFilter.addEventListener(
            "change",
            event => {

                reportsSetDateFilter(
                    event.target.value
                );

            }
        );

    }


    if (
        ReportsElements.applyDate
    ) {

        ReportsElements.applyDate.addEventListener(
            "click",
            () => {

                reportsApplyCustomDateFilter();

            }
        );

    }

}

function reportsSyncDateFilterUI() {

    if (
        ReportsElements.dateFilter
    ) {

        ReportsElements.dateFilter.value =
            ReportsState.dateFilter;

    }


    if (
        ReportsElements.customDateWrapper
    ) {

        ReportsElements.customDateWrapper.classList.toggle(
            "active",
            ReportsState.dateFilter === "custom"
        );

    }

}

function reportsBindRefreshEvent() {

    if (
        !ReportsElements.refreshButton
    ) {
        return;
    }


    ReportsElements.refreshButton.addEventListener(
        "click",
        async () => {

            if (
                ReportsState.loading
            ) {
                return;
            }


            await reportsLoadData();


            reportsShowToast(
                "Reports refreshed successfully."
            );

        }
    );

}

function reportsBindExportEvents() {

    if (
        ReportsElements.exportPdfButton
    ) {

        ReportsElements.exportPdfButton.addEventListener(
            "click",
            () => {

                reportsExportPDF();

            }
        );

    }

    if (
        ReportsElements.exportEstimatePdfButton
    ) {

        ReportsElements.exportEstimatePdfButton.addEventListener(
            "click",
            () => {

                reportsExportEstimatePDF();

            }
        );

    }

}

function reportsBindMobileMenu() {

    const button =
        document.getElementById(
            "reportsMobileMenuBtn"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            if (
                typeof window.toggleSidebar ===
                "function"
            ) {

                window.toggleSidebar();

                return;

            }


            const sidebar =
                document.querySelector(
                    ".sidebar"
                );


            if (
                sidebar
            ) {

                sidebar.classList.toggle(
                    "active"
                );

            }

        }
    );

}

function reportsBindGlobalEvents() {

    reportsBindDateFilterEvents();

    reportsBindRevenueEvents();

    reportsBindRefreshEvent();

    reportsBindExportEvents();

    reportsBindMobileMenu();

}

async function reportsInitializeUI() {

    ReportsState.dateFilter =
        "6months";

    ReportsState.revenuePeriod =
        "6months";

    reportsSetDefaultDates();

    reportsSyncDateFilterUI();

    if (ReportsElements.dateFilter) {

        ReportsElements.dateFilter.value =
            "6months";

    }

    if (ReportsElements.revenuePeriod) {

        ReportsElements.revenuePeriod.value =
            "6months";

    }

    reportsUpdateFilterStatus();

    const hasAccess =
        await reportsCheckSubscriptionAccess();

    if (!hasAccess) {
        return false;
    }
    
    await reportsLoadBusinessProfile();


    await reportsLoadData();

    return true;
}

async function reportsInitialize() {

    try {

        reportsBindGlobalEvents();

        await reportsInitializeUI();

    } catch (error) {

        console.error(
            "Reports initialization error:",
            error
        );

        reportsShowLoading(false);

        reportsShowToast(
            error.message ||
            "Unable to initialize reports."
        );

    }

}

function reportsGetExportInvoices() {

    return reportsGetFilteredInvoices()
        .slice()
        .sort((a, b) => {

            const dateA =
                reportsGetInvoiceDate(a);

            const dateB =
                reportsGetInvoiceDate(b);


            if (!dateA && !dateB) {
                return 0;
            }

            if (!dateA) {
                return 1;
            }

            if (!dateB) {
                return -1;
            }

            return dateB - dateA;

        });

}

function reportsDownloadFile(
    content,
    fileName,
    mimeType
) {

    const blob =
        new Blob(
            [content],
            {
                type: mimeType
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href = url;

    link.download =
        fileName;

    link.style.display =
        "none";


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    setTimeout(
        () => {

            URL.revokeObjectURL(
                url
            );

        },
        1000
    );

}

function reportsGetExportDateLabel() {

    const filter =
        ReportsState.dateFilter;


    const labels = {

        "30days":
            "last-30-days",

        "90days":
            "last-90-days",

        "6months":
            "last-6-months",

        "12months":
            "last-12-months",

        "thisYear":
            "this-year",

        "all":
            "all-time",

        "custom":
            "custom-range"

    };


    return (
        labels[filter] ||
        "report"
    );

}

async function reportsCheckSubscriptionAccess() {

    try {

        const response =
            await reportsLoadSubscriptionSettings();

        const currentSubscription =
            response?.currentSubscription;

        const plan =
            String(
                currentSubscription?.plan ||
                response?.plan ||
                "Free"
            )
                .trim()
                .toLowerCase();

        if (
            plan === "free" ||
            plan === "starter"
        ) {

            reportsShowUpgradeOverlay();

            return false;

        }

        reportsHideUpgradeOverlay();

        return true;

    } catch (error) {

        console.error(
            "Reports subscription check error:",
            error
        );

        return true;

    }

}

function reportsShowUpgradeOverlay() {

    if (
        !ReportsUpgradeElements.overlay
    ) {
        return;
    }

    ReportsUpgradeElements.overlay.classList.add(
        "active"
    );

    ReportsUpgradeElements.overlay.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow =
        "hidden";

}

function reportsHideUpgradeOverlay() {

    if (
        !ReportsUpgradeElements.overlay
    ) {
        return;
    }

    ReportsUpgradeElements.overlay.classList.remove(
        "active"
    );

    ReportsUpgradeElements.overlay.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow =
        "";

}

function reportsBindUpgradeButton() {

    if (
        !ReportsUpgradeElements.button
    ) {
        return;
    }

    ReportsUpgradeElements.button.addEventListener(
        "click",
        () => {

            window.location.href =
                "subscription.html";

        }
    );

}

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        reportsInitialize
    );

} else {

    reportsInitialize();

}
