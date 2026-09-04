(function () {
    "use strict";
    
    const DEFAULT_PROFILE_IMAGE = "profile.png";

    const state = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        search: "",
        category: "",
        vendor: "",
        period: "this_month",
        dateFrom: "",
        dateTo: "",
        sort: "date_desc",
        expenses: [],
        selectedExpenseId: null,
        selectedExpense: null,
        editingExpenseId: null,
        currencySymbol: "₦",
        currencyCode: "NGN",
        currentUser: null,
        receiptFile: null,
        existingReceipt: null,
        removeReceipt: false,
        loading: false
    };

    const $ = id => document.getElementById(id);

    function getCurrentUser() {
        const user = Parse.User.current();

        if (!user) {
            throw new Error("User must be logged in.");
        }

        return user;
    }

    function getUserCurrency(user) {
        const currencySymbol = user.get("currencySymbol");
        const currencyCode = user.get("currencyCode");

        state.currencySymbol =
            typeof currencySymbol === "string" && currencySymbol.trim()
                ? currencySymbol.trim()
                : "₦";

        state.currencyCode =
            typeof currencyCode === "string" && currencyCode.trim()
                ? currencyCode.trim().toUpperCase()
                : "NGN";

        if ($("expenseCurrencySymbol")) {
            $("expenseCurrencySymbol").textContent = state.currencySymbol;
        }
    }

    function formatMoney(value) {
        const amount = Number(value) || 0;

        try {
            return new Intl.NumberFormat(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount);
        } catch (error) {
            return amount.toFixed(2);
        }
    }

    function formatCurrency(value) {
        return state.currencySymbol + formatMoney(value);
    }

    function formatCurrencyWithCode(value) {
        return state.currencySymbol + formatMoney(value) + " " + state.currencyCode;
    }

    function formatDate(value) {
        if (!value) {
            return "-";
        }

        const date = value instanceof Date ? value : new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "-";
        }

        return new Intl.DateTimeFormat(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric"
        }).format(date);
    }

    function formatDateInput(value) {
        if (!value) {
            return "";
        }

        const date = value instanceof Date ? value : new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function escapeHTML(value) {
        const div = document.createElement("div");
        div.textContent = value == null ? "" : String(value);
        return div.innerHTML;
    }

    function showToast(message, type) {
        const container = $("toastContainer");

        if (!container) {
            return;
        }

        const toast = document.createElement("div");

        toast.className = "toast";

        if (type) {
            toast.classList.add(`toast-${type}`);
        }

        toast.innerHTML = `
            <div class="toast-icon">
                <i class="${
                    type === "error"
                        ? "ri-error-warning-line"
                        : type === "warning"
                        ? "ri-alert-line"
                        : "ri-checkbox-circle-line"
                }"></i>
            </div>
            <div class="toast-message">${escapeHTML(message)}</div>
            <button type="button" class="toast-close">
                <i class="ri-close-line"></i>
            </button>
        `;

        container.appendChild(toast);

        const closeButton = toast.querySelector(".toast-close");

        if (closeButton) {
            closeButton.addEventListener("click", () => {
                toast.remove();
            });
        }

        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 4000);
    }

    function showLoading(show) {
        state.loading = show;

        const loading = $("expensesLoadingState");
        const empty = $("expensesEmptyState");
        const tableBody = $("expensesTableBody");

        if (loading) {
            loading.style.display = show ? "flex" : "none";
        }

        if (show) {
            if (empty) {
                empty.style.display = "none";
            }

            if (tableBody) {
                tableBody.style.display = "";
            }
        }
    }

    function showFormError(message) {
        const error = $("expenseFormError");

        if (!error) {
            return;
        }

        error.textContent = message || "";
        error.style.display = message ? "block" : "none";
    }

    function clearFormError() {
        showFormError("");
    }

    function setButtonLoading(button, loading, loadingText) {
        if (!button) {
            return;
        }

        if (loading) {
            button.dataset.originalHTML = button.innerHTML;
            button.disabled = true;

            button.innerHTML = `
                <i class="ri-loader-4-line ri-spin"></i>
                <span>${escapeHTML(loadingText || "Saving...")}</span>
            `;
        } else {
            button.disabled = false;

            if (button.dataset.originalHTML) {
                button.innerHTML = button.dataset.originalHTML;
                delete button.dataset.originalHTML;
            }
        }
    }

    function openModal(element) {
        if (!element) {
            return;
        }

        element.classList.add("show");
        document.body.classList.add("modal-open");
    }

    function closeModal(element) {
        if (!element) {
            return;
        }

        element.classList.remove("show");

        const activeModals = document.querySelectorAll(".modal-overlay.active");

        if (!activeModals.length) {
            document.body.classList.remove("modal-open");
        }
    }

    function resetReceiptState() {
        state.receiptFile = null;
        state.existingReceipt = null;
        state.removeReceipt = false;

        const input = $("expenseReceipt");
        const preview = $("receiptPreview");

        if (input) {
            input.value = "";
        }

        if (preview) {
            preview.style.display = "none";
        }

        if ($("receiptFileName")) {
            $("receiptFileName").textContent = "receipt.pdf";
        }

        if ($("receiptFileSize")) {
            $("receiptFileSize").textContent = "0 KB";
        }
    }

    function showReceiptPreview(file) {
        const preview = $("receiptPreview");

        if (!preview || !file) {
            return;
        }

        if ($("receiptFileName")) {
            $("receiptFileName").textContent = file.name;
        }

        if ($("receiptFileSize")) {
            $("receiptFileSize").textContent = formatFileSize(file.size);
        }

        preview.style.display = "flex";
    }

    function showExistingReceiptPreview(file) {
        const preview = $("receiptPreview");

        if (!preview || !file) {
            return;
        }

        const name =
            typeof file.name === "string" && file.name
                ? file.name
                : "Receipt";

        if ($("receiptFileName")) {
            $("receiptFileName").textContent = name;
        }

        if ($("receiptFileSize")) {
            $("receiptFileSize").textContent = "Attached receipt";
        }

        preview.style.display = "flex";
    }

    function formatFileSize(bytes) {
        const size = Number(bytes) || 0;

        if (size < 1024) {
            return size + " B";
        }

        if (size < 1024 * 1024) {
            return (size / 1024).toFixed(1) + " KB";
        }

        return (size / (1024 * 1024)).toFixed(1) + " MB";
    }

    function getReceiptURL(receipt) {
        if (!receipt) {
            return "";
        }

        if (typeof receipt.url === "function") {
            return receipt.url() || "";
        }

        if (typeof receipt.url === "string") {
            return receipt.url;
        }

        return "";
    }

    function getReceiptName(receipt) {
        if (!receipt) {
            return "Receipt";
        }

        if (typeof receipt.name === "string" && receipt.name) {
            return receipt.name;
        }

        return "Receipt";
    }

    function populateCategorySelect(categories) {
        const select = $("expenseCategoryFilter");

        if (!select) {
            return;
        }

        const currentValue = state.category;

        select.innerHTML = `
            <option value="">All Categories</option>
        `;

        const uniqueCategories = Array.from(
            new Set(
                (Array.isArray(categories) ? categories : [])
                    .filter(Boolean)
                    .map(category => String(category).trim())
                    .filter(Boolean)
            )
        ).sort((a, b) => a.localeCompare(b));

        uniqueCategories.forEach(category => {
            const option = document.createElement("option");

            option.value = category;
            option.textContent = category;

            select.appendChild(option);
        });

        select.value = currentValue;
    }

    function populateExpenseCategoryOptions(selectedValue) {
        const select = $("expenseCategory");

        if (!select) {
            return;
        }

        const existingValues = Array.from(select.options).map(
            option => option.value
        );

        if (
            selectedValue &&
            !existingValues.includes(selectedValue)
        ) {
            const option = document.createElement("option");

            option.value = selectedValue;
            option.textContent = selectedValue;

            select.appendChild(option);
        }

        if (selectedValue !== undefined) {
            select.value = selectedValue;
        }
    }

    function renderExpenses() {
        const tableBody = $("expensesTableBody");
        const emptyState = $("expensesEmptyState");

        if (!tableBody) {
            return;
        }

        tableBody.innerHTML = "";

        if (!state.expenses.length) {
            if (emptyState) {
                emptyState.style.display = "flex";
            }

            renderPagination();
            return;
        }

        if (emptyState) {
            emptyState.style.display = "none";
        }

        state.expenses.forEach(expense => {
            const row = document.createElement("tr");

            const amount = Number(expense.amount) || 0;
            const category = escapeHTML(expense.category || "Other");
            const vendor = escapeHTML(expense.vendor || "-");
            const description = escapeHTML(
                expense.description || "Expense"
            );

            const receiptURL = getReceiptURL(expense.receipt);
            const receiptName = escapeHTML(
                getReceiptName(expense.receipt)
            );

            row.innerHTML = `
                <td>
                    <div class="expense-name-cell">
                        <div class="expense-row-icon">
                            <i class="ri-wallet-3-line"></i>
                        </div>
                        <div class="expense-name-content">
                            <strong>${description}</strong>
                            ${
                                expense.description
                                    ? `<span>${category}</span>`
                                    : ""
                            }
                        </div>
                    </div>
                </td>

                <td>
                    <span class="expense-category-badge">
                        ${category}
                    </span>
                </td>

                <td>
                    ${vendor}
                </td>

                <td>
                    ${formatDate(expense.date)}
                </td>

                <td>
                    <strong class="expense-amount">
                        ${formatCurrency(amount)}
                    </strong>
                </td>

                <td>
                    ${
                        receiptURL
                            ? `
                                <button
                                    type="button"
                                    class="receipt-table-btn"
                                    data-receipt-url="${escapeHTML(receiptURL)}"
                                    data-receipt-name="${receiptName}"
                                >
                                    <i class="ri-file-text-line"></i>
                                    Receipt
                                </button>
                            `
                            : `
                                <span class="no-receipt">
                                    None
                                </span>
                            `
                    }
                </td>

                <td>
                    <div class="expense-row-actions">

                        <button
                            type="button"
                            class="expense-action-btn"
                            data-action="view"
                            data-expense-id="${expense.id}"
                            title="View"
                        >
                            <i class="ri-eye-line"></i>
                        </button>

                        <button
                            type="button"
                            class="expense-action-btn"
                            data-action="edit"
                            data-expense-id="${expense.id}"
                            title="Edit"
                        >
                            <i class="ri-edit-line"></i>
                        </button>

                        <button
                            type="button"
                            class="expense-action-btn danger"
                            data-action="delete"
                            data-expense-id="${expense.id}"
                            title="Delete"
                        >
                            <i class="ri-delete-bin-line"></i>
                        </button>

                    </div>
                </td>
            `;

            tableBody.appendChild(row);
        });

        renderPagination();
    }

    function renderPagination() {
        const info = $("expensePaginationInfo");
        const pageNumbers = $("expensePageNumbers");
        const previous = $("expensePrevPage");
        const next = $("expenseNextPage");

        const total = state.total;
        const page = state.page;
        const limit = state.limit;
        const totalPages = state.totalPages;

        if (info) {
            if (!total) {
                info.textContent = "Showing 0 of 0 expenses";
            } else {
                const start = (page - 1) * limit + 1;
                const end = Math.min(page * limit, total);

                info.textContent =
                    `Showing ${start}-${end} of ${total} expenses`;
            }
        }

        if (previous) {
            previous.disabled = page <= 1;
        }

        if (next) {
            next.disabled =
                totalPages === 0 || page >= totalPages;
        }

        if (!pageNumbers) {
            return;
        }

        pageNumbers.innerHTML = "";

        if (totalPages <= 1) {
            return;
        }

        const pages = getPaginationPages(page, totalPages);

        pages.forEach(pageNumber => {
            if (pageNumber === "...") {
                const span = document.createElement("span");

                span.className = "pagination-ellipsis";
                span.textContent = "...";

                pageNumbers.appendChild(span);
                return;
            }

            const button = document.createElement("button");

            button.type = "button";
            button.className = "page-number";

            if (pageNumber === page) {
                button.classList.add("active");
            }

            button.textContent = pageNumber;

            button.addEventListener("click", () => {
                if (pageNumber !== state.page) {
                    state.page = pageNumber;
                    loadExpenses();
                }
            });

            pageNumbers.appendChild(button);
        });
    }

    function getPaginationPages(current, total) {
        if (total <= 7) {
            return Array.from(
                { length: total },
                (_, index) => index + 1
            );
        }

        const pages = [1];

        if (current > 4) {
            pages.push("...");
        }

        const start = Math.max(2, current - 1);
        const end = Math.min(total - 1, current + 1);

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (current < total - 3) {
            pages.push("...");
        }

        pages.push(total);

        return pages;
    }
    
    async function enforceExpensePlanAccess() {
    const response = await Parse.Cloud.run(
        "getCurrentSubscription"
    );

    if (!response || !response.success) {
        throw new Error(
            "Unable to verify your subscription."
        );
    }

    const plan =
        String(response.plan || "Free").trim().toLowerCase();

    const allowedPlans = [
        "business",
        "enterprise"
    ];

    if (allowedPlans.includes(plan)) {
        return true;
    }

    const lock = $("expensePlanLock");

    if (lock) {
        lock.classList.add("show");
    }

    document.body.classList.add("expense-page-locked");

    return false;
}

    async function loadExpenses() {
        showLoading(true);

        try {
            const response = await Parse.Cloud.run("getExpenses", {
                page: state.page,
                limit: state.limit,
                search: state.search,
                category: state.category,
                vendor: state.vendor,
                dateFrom: state.dateFrom,
                dateTo: state.dateTo,
                sort: state.sort
            });

            const data = response || {};

            state.expenses = Array.isArray(data.expenses)
                ? data.expenses
                : [];

            const pagination = data.pagination || {};

            state.page = Number(pagination.page) || state.page;
            state.limit = Number(pagination.limit) || state.limit;
            state.total = Number(pagination.total) || 0;
            state.totalPages =
                Number(pagination.totalPages) || 0;

            renderExpenses();

            if ($("expenseRecordCount")) {
                $("expenseRecordCount").textContent =
                    state.total;
            }
        } catch (error) {
            console.error("Load Expenses Error:", error);

            state.expenses = [];
            state.total = 0;
            state.totalPages = 0;

            renderExpenses();

            showToast(
                error.message || "Unable to load expenses.",
                "error"
            );
        } finally {
            showLoading(false);
        }
    }

    async function loadCategories() {
        try {
            const response = await Parse.Cloud.run(
                "getExpenseCategories"
            );

            populateCategorySelect(
                response && Array.isArray(response.categories)
                    ? response.categories
                    : []
            );
        } catch (error) {
            console.error(
                "Load Expense Categories Error:",
                error
            );

            showToast(
                error.message ||
                    "Unable to load expense categories.",
                "error"
            );
        }
    }

    async function loadStatistics() {
        try {
            const response = await Parse.Cloud.run(
                "getExpenseStatistics"
            );

            const statistics =
                response && response.statistics
                    ? response.statistics
                    : {};

            const totalExpenses =
                Number(statistics.totalExpenses) || 0;

            const currentMonthTotal =
                Number(statistics.currentMonthTotal) || 0;

            const percentageChange =
                Number(statistics.percentageChange) || 0;

            const expenseCount =
                Number(statistics.expenseCount) || 0;

            const currentMonthCount =
                Number(statistics.currentMonthCount) || 0;

            if ($("totalExpenses")) {
                $("totalExpenses").textContent =
                    formatCurrency(totalExpenses);
            }

            if ($("monthlyExpenses")) {
                $("monthlyExpenses").textContent =
                    formatCurrency(currentMonthTotal);
            }

            if ($("monthlyExpenseChange")) {
                $("monthlyExpenseChange").textContent =
                    formatPercentage(percentageChange);
            }

            if ($("totalExpenseCount")) {
                $("totalExpenseCount").textContent =
                    expenseCount +
                    (expenseCount === 1
                        ? " expense"
                        : " expenses");
            }

            if ($("weeklyExpenses") || $("weeklyExpenseCount")) {
                await loadSummary();
            }
        } catch (error) {
            console.error(
                "Load Expense Statistics Error:",
                error
            );

            showToast(
                error.message ||
                    "Unable to load expense statistics.",
                "error"
            );
        }
    }

    function formatPercentage(value) {
        const number = Number(value) || 0;

        if (Math.abs(number) < 0.01) {
            return "0%";
        }

        const formatted =
            number % 1 === 0
                ? number.toFixed(0)
                : number.toFixed(2);

        return (number > 0 ? "+" : "") + formatted + "%";
    }

    async function loadSummary() {
        try {
            const response = await Parse.Cloud.run(
                "getExpenseSummary"
            );

            const summary =
                response && response.summary
                    ? response.summary
                    : {};

            const week =
                Number(summary.week) || 0;

            const expenseCount =
                Number(summary.expenseCount) || 0;

            if ($("weeklyExpenses")) {
                $("weeklyExpenses").textContent =
                    formatCurrency(week);
            }

            if ($("weeklyExpenseCount")) {
                $("weeklyExpenseCount").textContent =
                    expenseCount +
                    (expenseCount === 1
                        ? " expense"
                        : " expenses");
            }

            if ($("totalExpenses")) {
                $("totalExpenses").textContent =
                    formatCurrency(
                        Number(summary.total) || 0
                    );
            }

            if ($("totalExpenseCount")) {
                $("totalExpenseCount").textContent =
                    expenseCount +
                    (expenseCount === 1
                        ? " expense"
                        : " expenses");
            }
        } catch (error) {
            console.error(
                "Load Expense Summary Error:",
                error
            );
        }
    }

    async function loadProfitReport() {
        try {
            const response = await Parse.Cloud.run(
                "getProfitReport",
                {
                    dateFrom: getReportDateFrom(),
                    dateTo: getReportDateTo()
                }
            );

            const report =
                response && response.report
                    ? response.report
                    : {};

            const revenue =
                Number(report.totalRevenue) || 0;

            const expenses =
                Number(report.totalExpenses) || 0;

            const profit =
                Number(report.profit) || 0;

            if ($("profitValue")) {
                $("profitValue").textContent =
                    formatCurrency(profit);
            }

            if ($("reportProfitValue")) {
                $("reportProfitValue").textContent =
                    formatCurrency(profit);
            }

            if ($("reportRevenueValue")) {
                $("reportRevenueValue").textContent =
                    formatCurrency(revenue);
            }

            if ($("reportExpensesValue")) {
                $("reportExpensesValue").textContent =
                    formatCurrency(expenses);
            }
        } catch (error) {
            console.error(
                "Load Profit Report Error:",
                error
            );

            showToast(
                error.message ||
                    "Unable to load profit report.",
                "error"
            );
        }
    }

    function getReportDateFrom() {
        const input = $("reportDateFrom");

        if (input && input.value) {
            return input.value;
        }

        const now = new Date();

        return `${now.getFullYear()}-01-01`;
    }

    function getReportDateTo() {
        const input = $("reportDateTo");

        if (input && input.value) {
            return input.value;
        }

        return formatDateInput(new Date());
    }

    async function loadExpenseReport() {
        try {
            const response = await Parse.Cloud.run(
                "getExpenseReport",
                {
                    dateFrom: getReportDateFrom(),
                    dateTo: getReportDateTo()
                }
            );

            const report =
                response && response.report
                    ? response.report
                    : {};

            renderCategoryReport(
                report.byCategory || {}
            );

            renderMonthlyReport(
                report.byMonth || {}
            );
        } catch (error) {
            console.error(
                "Load Expense Report Error:",
                error
            );

            showToast(
                error.message ||
                    "Unable to generate expense report.",
                "error"
            );
        }
    }

    function renderCategoryReport(byCategory) {
        const container = $("expenseCategoryReport");

        if (!container) {
            return;
        }

        container.innerHTML = "";

        const entries = Object.entries(byCategory)
            .filter(([, value]) => Number(value) !== 0)
            .sort((a, b) => Number(b[1]) - Number(a[1]));

        if (!entries.length) {
            container.innerHTML = `
                <div class="report-empty">
                    No category data available.
                </div>
            `;

            return;
        }

        const total = entries.reduce(
            (sum, [, amount]) =>
                sum + Number(amount || 0),
            0
        );

        entries.forEach(([category, amount]) => {
            const numericAmount =
                Number(amount) || 0;

            const percentage =
                total > 0
                    ? (numericAmount / total) * 100
                    : 0;

            const item =
                document.createElement("div");

            item.className = "report-list-item";

            item.innerHTML = `
                <div class="report-item-main">
                    <div class="report-item-icon">
                        <i class="ri-price-tag-3-line"></i>
                    </div>

                    <div class="report-item-info">
                        <strong>
                            ${escapeHTML(category)}
                        </strong>

                        <span>
                            ${percentage.toFixed(1)}%
                        </span>
                    </div>
                </div>

                <strong class="report-item-value">
                    ${formatCurrency(numericAmount)}
                </strong>
            `;

            container.appendChild(item);
        });
    }

    function renderMonthlyReport(byMonth) {
        const container = $("expenseMonthlyReport");

        if (!container) {
            return;
        }

        container.innerHTML = "";

        const entries = Object.entries(byMonth)
            .sort((a, b) =>
                a[0].localeCompare(b[0])
            );

        if (!entries.length) {
            container.innerHTML = `
                <div class="report-empty">
                    No monthly data available.
                </div>
            `;

            return;
        }

        entries.forEach(([month, amount]) => {
            const numericAmount =
                Number(amount) || 0;

            const label = formatMonthLabel(month);

            const item =
                document.createElement("div");

            item.className = "report-list-item";

            item.innerHTML = `
                <div class="report-item-main">
                    <div class="report-item-icon">
                        <i class="ri-calendar-line"></i>
                    </div>

                    <div class="report-item-info">
                        <strong>
                            ${escapeHTML(label)}
                        </strong>
                    </div>
                </div>

                <strong class="report-item-value">
                    ${formatCurrency(numericAmount)}
                </strong>
            `;

            container.appendChild(item);
        });
    }

    function formatMonthLabel(value) {
        const parts = String(value).split("-");

        if (parts.length !== 2) {
            return value;
        }

        const year = Number(parts[0]);
        const month = Number(parts[1]);

        if (!year || !month) {
            return value;
        }

        const date = new Date(year, month - 1, 1);

        return new Intl.DateTimeFormat(undefined, {
            month: "long",
            year: "numeric"
        }).format(date);
    }

    function openAddExpenseModal() {
        state.editingExpenseId = null;

        clearExpenseForm();

        if ($("expenseModalTitle")) {
            $("expenseModalTitle").textContent =
                "Add Expense";
        }

        if ($("expenseModalSubtitle")) {
            $("expenseModalSubtitle").textContent =
                "Record a new business expense.";
        }

        if ($("saveExpenseBtn")) {
            $("saveExpenseBtn").innerHTML = `
                <i class="ri-save-line"></i>
                <span>Save Expense</span>
            `;
        }

        const today = formatDateInput(new Date());

        if ($("expenseDate")) {
            $("expenseDate").value = today;
        }

        if ($("expenseCategory")) {
            $("expenseCategory").value = "";
        }

        openModal($("expenseModalOverlay"));
    }

    function clearExpenseForm() {
        const form = $("expenseForm");

        if (form) {
            form.reset();
        }

        if ($("expenseId")) {
            $("expenseId").value = "";
        }

        if ($("expenseAmount")) {
            $("expenseAmount").value = "";
        }

        if ($("expenseVendor")) {
            $("expenseVendor").value = "";
        }

        if ($("expenseDescription")) {
            $("expenseDescription").value = "";
        }

        if ($("expenseDate")) {
            $("expenseDate").value =
                formatDateInput(new Date());
        }

        resetReceiptState();
        clearFormError();
    }

    async function openEditExpense(expenseId) {
        if (!expenseId) {
            return;
        }

        try {
            showToast("Loading expense...", "info");

            const response = await Parse.Cloud.run(
                "getExpenseDetails",
                {
                    expenseId
                }
            );

            const expense =
                response && response.expense
                    ? response.expense
                    : null;

            if (!expense) {
                throw new Error(
                    "Expense details were not returned."
                );
            }

            state.editingExpenseId = expense.id;

            fillExpenseForm(expense);

            if ($("expenseModalTitle")) {
                $("expenseModalTitle").textContent =
                    "Edit Expense";
            }

            if ($("expenseModalSubtitle")) {
                $("expenseModalSubtitle").textContent =
                    "Update your expense information.";
            }

            if ($("saveExpenseBtn")) {
                $("saveExpenseBtn").innerHTML = `
                    <i class="ri-save-line"></i>
                    <span>Update Expense</span>
                `;
            }

            openModal($("expenseModalOverlay"));
        } catch (error) {
            console.error(
                "Open Edit Expense Error:",
                error
            );

            showToast(
                error.message ||
                    "Unable to load expense.",
                "error"
            );
        }
    }

    function fillExpenseForm(expense) {
        clearFormError();
        resetReceiptState();

        if ($("expenseId")) {
            $("expenseId").value = expense.id || "";
        }

        if ($("expenseAmount")) {
            $("expenseAmount").value =
                Number(expense.amount) || 0;
        }

        if ($("expenseDate")) {
            $("expenseDate").value =
                formatDateInput(expense.date);
        }

        if ($("expenseCategory")) {
            populateExpenseCategoryOptions(
                expense.category || "Other"
            );
        }

        if ($("expenseVendor")) {
            $("expenseVendor").value =
                expense.vendor || "";
        }

        if ($("expenseDescription")) {
            $("expenseDescription").value =
                expense.description || "";
        }

        if (expense.receipt) {
            state.existingReceipt =
                expense.receipt;

            showExistingReceiptPreview(
                expense.receipt
            );
        }
    }

    async function saveExpense(event) {
        event.preventDefault();

        clearFormError();

        const amount = $("expenseAmount")
            ? $("expenseAmount").value
            : "";

        const date = $("expenseDate")
            ? $("expenseDate").value
            : "";

        const category = $("expenseCategory")
            ? $("expenseCategory").value
            : "";

        const vendor = $("expenseVendor")
            ? $("expenseVendor").value.trim()
            : "";

        const description = $("expenseDescription")
            ? $("expenseDescription").value.trim()
            : "";

        if (!amount) {
            showFormError(
                "Please enter the expense amount."
            );
            return;
        }

        if (Number(amount) < 0) {
            showFormError(
                "Expense amount cannot be negative."
            );
            return;
        }

        if (!date) {
            showFormError(
                "Please select the expense date."
            );
            return;
        }

        if (!category) {
            showFormError(
                "Please select an expense category."
            );
            return;
        }

        const button = $("saveExpenseBtn");

        setButtonLoading(
            button,
            true,
            state.editingExpenseId
                ? "Updating..."
                : "Saving..."
        );

        try {
            let receipt = null;

            if (state.receiptFile) {
                receipt = await createParseFile(
                    state.receiptFile
                );
            }

            const params = {
                amount: Number(amount),
                date,
                category,
                vendor,
                description
            };

            if (receipt) {
                params.receipt = receipt;
            }

            if (state.editingExpenseId) {
                params.expenseId =
                    state.editingExpenseId;

                if (state.removeReceipt) {
                    params.removeReceipt = true;
                }

                await Parse.Cloud.run(
                    "updateExpense",
                    params
                );

                showToast(
                    "Expense updated successfully.",
                    "success"
                );
            } else {
                await Parse.Cloud.run(
                    "createExpense",
                    params
                );

                showToast(
                    "Expense created successfully.",
                    "success"
                );
            }

            closeModal($("expenseModalOverlay"));

            state.page = 1;

            await Promise.all([
                loadExpenses(),
                loadCategories(),
                loadStatistics(),
                loadProfitReport(),
                loadExpenseReport()
            ]);
        } catch (error) {
            console.error(
                "Save Expense Error:",
                error
            );

            showFormError(
                error.message ||
                    "Unable to save expense."
            );
        } finally {
            setButtonLoading(button, false);
        }
    }

    async function createParseFile(file) {
        if (!(file instanceof File)) {
            throw new Error(
                "Invalid receipt file."
            );
        }

        const maxSize =
            10 * 1024 * 1024;

        if (file.size > maxSize) {
            throw new Error(
                "Receipt file must be 10 MB or smaller."
            );
        }

        const allowedTypes = [
            "image/png",
            "image/jpeg",
            "image/jpg",
            "application/pdf"
        ];

        if (
            file.type &&
            !allowedTypes.includes(file.type)
        ) {
            throw new Error(
                "Receipt must be a PNG, JPG, JPEG or PDF file."
            );
        }

        const parseFile = new Parse.File(
            file.name,
            file
        );

        await parseFile.save({
            useMasterKey: false
        });

        return parseFile;
    }

    async function openExpenseDetails(expenseId) {
        if (!expenseId) {
            return;
        }

        try {
            const response = await Parse.Cloud.run(
                "getExpenseDetails",
                {
                    expenseId
                }
            );

            const expense =
                response && response.expense
                    ? response.expense
                    : null;

            if (!expense) {
                throw new Error(
                    "Expense details were not returned."
                );
            }

            state.selectedExpenseId =
                expense.id;

            state.selectedExpense =
                expense;

            renderExpenseDetails(expense);

            openModal($("expenseDetailsOverlay"));
        } catch (error) {
            console.error(
                "Expense Details Error:",
                error
            );

            showToast(
                error.message ||
                    "Unable to load expense details.",
                "error"
            );
        }
    }

    function renderExpenseDetails(expense) {
        if ($("detailsExpenseAmount")) {
            $("detailsExpenseAmount").textContent =
                formatCurrency(expense.amount);
        }

        if ($("detailsExpenseCategory")) {
            $("detailsExpenseCategory").textContent =
                expense.category || "Other";
        }

        if ($("detailsExpenseDate")) {
            $("detailsExpenseDate").textContent =
                formatDate(expense.date);
        }

        if ($("detailsExpenseVendor")) {
            $("detailsExpenseVendor").textContent =
                expense.vendor || "-";
        }

        if ($("detailsExpenseDescription")) {
            $("detailsExpenseDescription").textContent =
                expense.description ||
                "No description provided.";
        }

        const receipt =
            expense.receipt || null;

        const receiptURL =
            getReceiptURL(receipt);

        const receiptPreview =
            $("detailsReceiptPreview");

        const receiptName =
            $("detailsReceiptName");

        const receiptLabel =
            $("detailsExpenseReceipt");

        if (receiptURL) {
            if (receiptLabel) {
                receiptLabel.textContent =
                    getReceiptName(receipt);
            }

            if (receiptName) {
                receiptName.textContent =
                    getReceiptName(receipt);
            }

            if (receiptPreview) {
                receiptPreview.style.display =
                    "flex";
            }
        } else {
            if (receiptLabel) {
                receiptLabel.textContent =
                    "No receipt";
            }

            if (receiptPreview) {
                receiptPreview.style.display =
                    "none";
            }
        }
    }

    async function deleteExpense(expenseId) {
        if (!expenseId) {
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to delete this expense? This action cannot be undone."
        );

        if (!confirmed) {
            return;
        }

        try {
            await Parse.Cloud.run(
                "deleteExpense",
                {
                    expenseId
                }
            );

            showToast(
                "Expense deleted successfully.",
                "success"
            );

            if (
                state.selectedExpenseId ===
                expenseId
            ) {
                closeModal(
                    $("expenseDetailsOverlay")
                );

                state.selectedExpenseId = null;
                state.selectedExpense = null;
            }

            if (
                state.expenses.length === 1 &&
                state.page > 1
            ) {
                state.page--;
            }

            await Promise.all([
                loadExpenses(),
                loadCategories(),
                loadStatistics(),
                loadProfitReport(),
                loadExpenseReport()
            ]);
        } catch (error) {
            console.error(
                "Delete Expense Error:",
                error
            );

            showToast(
                error.message ||
                    "Unable to delete expense.",
                "error"
            );
        }
    }

    function openReceipt(receipt) {
        const url = getReceiptURL(receipt);

        if (!url) {
            showToast(
                "No receipt is attached to this expense.",
                "warning"
            );

            return;
        }

        window.open(
            url,
            "_blank",
            "noopener,noreferrer"
        );
    }

    function handleTableClick(event) {
        const actionButton =
            event.target.closest(
                "[data-action]"
            );

        if (actionButton) {
            const action =
                actionButton.dataset.action;

            const expenseId =
                actionButton.dataset.expenseId;

            if (action === "view") {
                openExpenseDetails(expenseId);
            }

            if (action === "edit") {
                openEditExpense(expenseId);
            }

            if (action === "delete") {
                deleteExpense(expenseId);
            }

            return;
        }

        const receiptButton =
            event.target.closest(
                ".receipt-table-btn"
            );

        if (receiptButton) {
            const url =
                receiptButton.dataset.receiptUrl;

            if (url) {
                window.open(
                    url,
                    "_blank",
                    "noopener,noreferrer"
                );
            }
        }
    }

    function formatDateInputValue(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function getPeriodDates(period) {
        const now = new Date();
        let from;
        let to = new Date(now);

        if (period === "this_month") {
            from = new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (period === "last_month") {
            from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            to = new Date(now.getFullYear(), now.getMonth(), 0);
        } else if (period === "last_2_months") {
            from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        } else if (period === "last_3_months") {
            from = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        } else if (period === "last_6_months") {
            from = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        } else if (period === "this_year") {
            from = new Date(now.getFullYear(), 0, 1);
        } else if (period === "all_time") {
            return {
                dateFrom: "",
                dateTo: ""
            };
        } else {
            return {
                dateFrom: $("expenseDateFrom") ? $("expenseDateFrom").value : "",
                dateTo: $("expenseDateTo") ? $("expenseDateTo").value : ""
            };
        }

        return {
            dateFrom: formatDateInputValue(from),
            dateTo: formatDateInputValue(to)
        };
    }

    function updateExpensePeriodDates() {
        const periodSelect = $("expensePeriodFilter");

        if (!periodSelect) {
            return;
        }

        const period = periodSelect.value || "this_month";
        state.period = period;

        const custom = period === "custom";
        const fromGroup = $("expenseCustomDateFromGroup");
        const toGroup = $("expenseCustomDateToGroup");

        if (fromGroup) {
            fromGroup.style.display = custom ? "" : "none";
        }

        if (toGroup) {
            toGroup.style.display = custom ? "" : "none";
        }

        if (!custom) {
            const dates = getPeriodDates(period);
            state.dateFrom = dates.dateFrom;
            state.dateTo = dates.dateTo;

            if ($("expenseDateFrom")) {
                $("expenseDateFrom").value = dates.dateFrom;
            }

            if ($("expenseDateTo")) {
                $("expenseDateTo").value = dates.dateTo;
            }
        }
    }

    function applyFilters() {
        state.page = 1;

        const periodSelect = $("expensePeriodFilter");
        state.period = periodSelect
            ? periodSelect.value || "this_month"
            : "this_month";

        const dates = getPeriodDates(state.period);

        state.dateFrom = dates.dateFrom;
        state.dateTo = dates.dateTo;

        state.vendor = $("expenseVendorFilter")
            ? $("expenseVendorFilter").value.trim()
            : "";

        loadExpenses();
    }

    function clearFilters() {
        state.search = "";
        state.category = "";
        state.vendor = "";
        state.period = "this_month";
        state.page = 1;

        if ($("expenseSearchInput")) {
            $("expenseSearchInput").value = "";
        }

        if ($("expenseCategoryFilter")) {
            $("expenseCategoryFilter").value = "";
        }

        if ($("expensePeriodFilter")) {
            $("expensePeriodFilter").value = "this_month";
        }

        if ($("expenseVendorFilter")) {
            $("expenseVendorFilter").value = "";
        }

        updateExpensePeriodDates();
        loadExpenses();
    }

    function handleSearch() {
        state.search =
            $("expenseSearchInput")
                ? $("expenseSearchInput").value.trim()
                : "";

        state.page = 1;

        loadExpenses();
    }

    function debounce(fn, delay) {
        let timeout;

        return function () {
            clearTimeout(timeout);

            timeout = setTimeout(
                () => fn.apply(this, arguments),
                delay
            );
        };
    }

    function setDefaultReportDates() {
        const now = new Date();

        const firstDay = new Date(
            now.getFullYear(),
            now.getMonth(),
            1
        );

        if ($("reportDateFrom") &&
            !$("reportDateFrom").value) {
            $("reportDateFrom").value =
                formatDateInput(firstDay);
        }

        if ($("reportDateTo") &&
            !$("reportDateTo").value) {
            $("reportDateTo").value =
                formatDateInput(now);
        }
    }

    function handleReceiptSelection(event) {
        const file =
            event.target.files &&
            event.target.files[0];

        if (!file) {
            return;
        }

        state.receiptFile = file;
        state.removeReceipt = false;

        showReceiptPreview(file);
    }

    function removeReceipt() {
        state.receiptFile = null;

        const input = $("expenseReceipt");

        if (input) {
            input.value = "";
        }

        if (state.existingReceipt) {
            state.removeReceipt = true;
        } else {
            state.removeReceipt = false;
        }

        const preview = $("receiptPreview");

        if (preview) {
            preview.style.display = "none";
        }
    }

    function toggleFilterPanel() {
        const panel =
            $("expenseFilterPanel");

        if (!panel) {
            return;
        }

        const isVisible =
            panel.classList.contains("active");

        panel.classList.toggle(
            "active",
            !isVisible
        );
    }

    function handleCategoryChange() {
        state.category =
            $("expenseCategoryFilter")
                ? $("expenseCategoryFilter").value
                : "";

        state.page = 1;

        loadExpenses();
    }

    function handleSortChange() {
        state.sort =
            $("expenseSortSelect")
                ? $("expenseSortSelect").value
                : "date_desc";

        state.page = 1;

        loadExpenses();
    }

    function goToPreviousPage() {
        if (state.page <= 1) {
            return;
        }

        state.page--;

        loadExpenses();
    }

    function goToNextPage() {
        if (
            state.totalPages &&
            state.page >= state.totalPages
        ) {
            return;
        }

        state.page++;

        loadExpenses();
    }

    async function generateReport() {
        const button =
            $("generateExpenseReportBtn");

        if (button) {
            button.disabled = true;
        }

        try {
            await Promise.all([
                loadExpenseReport(),
                loadProfitReport()
            ]);

            showToast(
                "Expense reports updated.",
                "success"
            );
        } catch (error) {
            console.error(
                "Generate Report Error:",
                error
            );
        } finally {
            if (button) {
                button.disabled = false;
            }
        }
    }

    function handleViewProfitReport() {
        const section =
            document.querySelector(
                ".reports-section"
            );

        if (section) {
            section.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

        generateReport();
    }
    
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

        const profile = response.profile;
        

        let imageURL = DEFAULT_PROFILE_IMAGE;

        if (profile.profileImage) {

            if (typeof profile.profileImage === "string") {

                imageURL = profile.profileImage;

            } else if (profile.profileImage.url) {

                imageURL = profile.profileImage.url();

            }

        }

        headerUserImage.src = imageURL;
        console.log("profile image loaded successfully");
        
    } catch (error) {
      console.log(error)
    }
    }

    function setupEvents() {
        const addExpenseBtn =
            $("addExpenseBtn");

        const emptyAddExpenseBtn =
            $("emptyAddExpenseBtn");

        const closeExpenseModal =
            $("closeExpenseModal");

        const cancelExpenseBtn =
            $("cancelExpenseBtn");

        const closeExpenseDetails =
            $("closeExpenseDetails");

        const expenseForm =
            $("expenseForm");

        const expenseTableBody =
            $("expensesTableBody");

        const expenseFilterBtn =
            $("expenseFilterBtn");

        const applyExpenseFilters =
            $("applyExpenseFilters");

        const clearExpenseFilters =
            $("clearExpenseFilters");

        const searchInput =
            $("expenseSearchInput");

        const clearSearch =
            $("clearExpenseSearch");

        const categoryFilter =
            $("expenseCategoryFilter");

        const periodFilter =
            $("expensePeriodFilter");

        const sortSelect =
            $("expenseSortSelect");

        const previousPage =
            $("expensePrevPage");

        const nextPage =
            $("expenseNextPage");

        const receiptBrowseBtn =
            $("receiptBrowseBtn");

        const receiptInput =
            $("expenseReceipt");

        const removeReceiptBtn =
            $("removeReceiptBtn");

        const editExpenseFromDetails =
            $("editExpenseFromDetails");

        const deleteExpenseFromDetails =
            $("deleteExpenseFromDetails");

        const openExpenseReceiptBtn =
            $("openExpenseReceiptBtn");

        const generateExpenseReportBtn =
            $("generateExpenseReportBtn");

        const viewProfitReportBtn =
            $("viewProfitReportBtn");
            
        const expensePlanUpgradeBtn =
    $("expensePlanUpgradeBtn");

if (expensePlanUpgradeBtn) {
    expensePlanUpgradeBtn.addEventListener(
        "click",
        () => {
            window.location.href = "subscription.html";
        }
    );
}

        if (addExpenseBtn) {
            addExpenseBtn.addEventListener(
                "click",
                openAddExpenseModal
            );
        }

        if (emptyAddExpenseBtn) {
            emptyAddExpenseBtn.addEventListener(
                "click",
                openAddExpenseModal
            );
        }

        if (closeExpenseModal) {
            closeExpenseModal.addEventListener(
                "click",
                () =>
                    closeModal(
                        $("expenseModalOverlay")
                    )
            );
        }

        if (cancelExpenseBtn) {
            cancelExpenseBtn.addEventListener(
                "click",
                () =>
                    closeModal(
                        $("expenseModalOverlay")
                    )
            );
        }

        if (closeExpenseDetails) {
            closeExpenseDetails.addEventListener(
                "click",
                () =>
                    closeModal(
                        $("expenseDetailsOverlay")
                    )
            );
        }

        if (expenseForm) {
            expenseForm.addEventListener(
                "submit",
                saveExpense
            );
        }

        if (expenseTableBody) {
            expenseTableBody.addEventListener(
                "click",
                handleTableClick
            );
        }

        if (expenseFilterBtn) {
            expenseFilterBtn.addEventListener(
                "click",
                toggleFilterPanel
            );
        }

        if (applyExpenseFilters) {
            applyExpenseFilters.addEventListener(
                "click",
                applyFilters
            );
        }

        if (clearExpenseFilters) {
            clearExpenseFilters.addEventListener(
                "click",
                clearFilters
            );
        }

        if (searchInput) {
            searchInput.addEventListener(
                "input",
                debounce(handleSearch, 400)
            );
        }

        if (clearSearch) {
            clearSearch.addEventListener(
                "click",
                () => {
                    if (searchInput) {
                        searchInput.value = "";
                    }

                    state.search = "";
                    state.page = 1;

                    loadExpenses();
                }
            );
        }

        if (categoryFilter) {
            categoryFilter.addEventListener(
                "change",
                handleCategoryChange
            );
        }

        if (periodFilter) {
            periodFilter.addEventListener(
                "change",
                () => {
                    updateExpensePeriodDates();

                    if (periodFilter.value !== "custom") {
                        state.page = 1;
                        loadExpenses();
                    }
                }
            );
        }

        if (sortSelect) {
            sortSelect.addEventListener(
                "change",
                handleSortChange
            );
        }

        if (previousPage) {
            previousPage.addEventListener(
                "click",
                goToPreviousPage
            );
        }

        if (nextPage) {
            nextPage.addEventListener(
                "click",
                goToNextPage
            );
        }

        if (receiptBrowseBtn) {
            receiptBrowseBtn.addEventListener(
                "click",
                () => {
                    if (receiptInput) {
                        receiptInput.click();
                    }
                }
            );
        }

        if (receiptInput) {
            receiptInput.addEventListener(
                "change",
                handleReceiptSelection
            );
        }

        if (removeReceiptBtn) {
            removeReceiptBtn.addEventListener(
                "click",
                removeReceipt
            );
        }

        if (editExpenseFromDetails) {
            editExpenseFromDetails.addEventListener(
                "click",
                () => {
                    if (
                        state.selectedExpenseId
                    ) {
                        const id =
                            state.selectedExpenseId;

                        closeModal(
                            $("expenseDetailsOverlay")
                        );

                        openEditExpense(id);
                    }
                }
            );
        }

        if (deleteExpenseFromDetails) {
            deleteExpenseFromDetails.addEventListener(
                "click",
                () => {
                    if (
                        state.selectedExpenseId
                    ) {
                        deleteExpense(
                            state.selectedExpenseId
                        );
                    }
                }
            );
        }

        if (openExpenseReceiptBtn) {
            openExpenseReceiptBtn.addEventListener(
                "click",
                () => {
                    if (
                        state.selectedExpense &&
                        state.selectedExpense.receipt
                    ) {
                        openReceipt(
                            state.selectedExpense
                                .receipt
                        );
                    }
                }
            );
        }

        if (generateExpenseReportBtn) {
            generateExpenseReportBtn.addEventListener(
                "click",
                generateReport
            );
        }

        if (viewProfitReportBtn) {
            viewProfitReportBtn.addEventListener(
                "click",
                handleViewProfitReport
            );
        }

        const reportDateFrom =
            $("reportDateFrom");

        const reportDateTo =
            $("reportDateTo");

        if (reportDateFrom) {
            reportDateFrom.addEventListener(
                "change",
                generateReport
            );
        }

        if (reportDateTo) {
            reportDateTo.addEventListener(
                "change",
                generateReport
            );
        }

        const overlay =
            $("expenseModalOverlay");

        if (overlay) {
            overlay.addEventListener(
                "click",
                event => {
                    if (
                        event.target === overlay
                    ) {
                        closeModal(overlay);
                    }
                }
            );
        }

        const detailsOverlay =
            $("expenseDetailsOverlay");

        if (detailsOverlay) {
            detailsOverlay.addEventListener(
                "click",
                event => {
                    if (
                        event.target ===
                        detailsOverlay
                    ) {
                        closeModal(
                            detailsOverlay
                        );
                    }
                }
            );
        }

        document.addEventListener(
            "keydown",
            event => {
                if (event.key !== "Escape") {
                    return;
                }

                closeModal(
                    $("expenseModalOverlay")
                );

                closeModal(
                    $("expenseDetailsOverlay")
                );
            }
        );
    }

    async function initialize() {
    try {
        if (typeof Parse === "undefined") {
            throw new Error(
                "Parse SDK is not loaded."
            );
        }

        const user = getCurrentUser();

        state.currentUser = user;

        getUserCurrency(user);

        if ($("expensePeriodFilter")) {
            $("expensePeriodFilter").value =
                state.period || "this_month";
        }

        updateExpensePeriodDates();

        setupEvents();

        const hasAccess =
            await enforceExpensePlanAccess();

        if (!hasAccess) {
            return;
        }

        setDefaultReportDates();

        loadUserProfile();

        if ($("expenseCurrencySymbol")) {
            $("expenseCurrencySymbol").textContent =
                state.currencySymbol;
        }

        await Promise.all([
            loadExpenses(),
            loadCategories(),
            loadStatistics(),
            loadProfitReport(),
            loadExpenseReport()
        ]);
    } catch (error) {
        console.error(
            "Expenses Page Initialization Error:",
            error
        );

        showToast(
            error.message ||
                "Unable to initialize expenses page.",
            "error"
        );
    }
}


    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            initialize
        );
    } else {
        initialize();
    }
    
    console.log("expenses has been loaded ");

})();