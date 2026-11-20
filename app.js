
/* ==========================================
   TEAM 4 - STUDENT BUDGET TRACKER
   Shared JavaScript File

   ASWIN: Transaction Management
   AAYUSH: Budget and Analytics
   SUSHANT: HTML and Dashboard
   BINAYA: Integration and Testing
========================================== */


/* ==========================================
   COMMON SECTION - DATA
========================================== */

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let monthlyBudget = Number(localStorage.getItem("monthlyBudget")) || 0;
let editingId = null;

transactions = transactions.map((item, index) => ({
    ...item,
    id: item.id || Date.now() + index,
    date: item.date || new Date().toISOString().slice(0, 10)
}));

const transactionForm = document.getElementById("transaction-form");
const budgetForm = document.getElementById("budget-form");

const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("transaction-date");

const transactionList = document.getElementById("transactions");

function saveData() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
    localStorage.setItem("monthlyBudget", monthlyBudget);
}


/* ==========================================
   ASWIN'S SECTION
   TRANSACTION MANAGEMENT

   1. Add transactions
   2. Edit transactions
   3. Delete transactions
   4. Validate inputs
   5. Display transaction history
========================================== */

// Add or update transaction

function handleTransaction(event) {
    event.preventDefault();

    const description = descriptionInput.value.trim();
    const amount = Number(amountInput.value);
    const type = typeInput.value;
    const category = categoryInput.value;
    const date = dateInput.value;

    if (!description || !Number.isFinite(amount) || amount <= 0 || !date) {
        showToast("Please enter valid transaction details.");
        return;
    }

    if (editingId !== null) {
        const item = transactions.find(t => t.id === editingId);

        if (item) {
            item.description = description;
            item.amount = amount;
            item.type = type;
            item.category = category;
            item.date = date;
        }

        showToast("Transaction updated!");
        editingId = null;
        document.getElementById("transaction-submit").textContent = "+ Add Transaction";
        document.getElementById("cancel-edit").hidden = true;
    } else {
        transactions.push({
            id: Date.now(),
            description,
            amount,
            type,
            category,
            date
        });

        showToast("Transaction added successfully!");
    }

    saveData();
    render();
    transactionForm.reset();
    dateInput.value = new Date().toISOString().slice(0, 10);
}


// Edit transaction

function editTransaction(id) {
    const item = transactions.find(t => t.id === id);

    if (!item) return;

    editingId = id;

    descriptionInput.value = item.description;
    amountInput.value = item.amount;
    typeInput.value = item.type;
    categoryInput.value = item.category;
    dateInput.value = item.date;

    document.getElementById("transaction-submit").textContent = "Save Changes";
    document.getElementById("cancel-edit").hidden = false;

    document.getElementById("transaction-form-section").scrollIntoView({
        behavior: "smooth"
    });
}


// Cancel editing

function cancelEdit() {
    editingId = null;
    transactionForm.reset();

    dateInput.value = new Date().toISOString().slice(0, 10);

    document.getElementById("transaction-submit").textContent = "+ Add Transaction";
    document.getElementById("cancel-edit").hidden = true;
}


// Delete transaction

function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);

    if (editingId === id) {
        cancelEdit();
    }

    saveData();
    render();

    showToast("Transaction deleted!");
}


// Display transaction history

function renderTransactions() {
    const search = document.getElementById("search-transactions").value.toLowerCase();
    const typeFilter = document.getElementById("filter-type").value;

    const filtered = transactions.filter(item => {
        const matchesSearch = item.description.toLowerCase().includes(search) ||
            item.category.toLowerCase().includes(search);

        const matchesType = typeFilter === "all" || item.type === typeFilter;

        return matchesSearch && matchesType;
    });

    transactionList.innerHTML = "";

    if (filtered.length === 0) {
        const empty = document.createElement("li");
        empty.textContent = "No transactions found.";
        empty.className = "empty-chart";
        transactionList.appendChild(empty);
        return;
    }

    filtered.slice().sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach(item => {
            const li = document.createElement("li");
            li.className = "transaction-item";

            const info = document.createElement("div");
            info.className = "transaction-info";

            const name = document.createElement("strong");
            name.textContent = item.description;

            const details = document.createElement("small");
            details.textContent = `${item.category} • ${item.date}`;

            info.append(name, details);

            const amount = document.createElement("span");
            amount.className = item.type === "income" ? "income-text" : "expense-text";
            amount.textContent =
                `${item.type === "income" ? "+" : "-"}₩${item.amount.toLocaleString()}`;

            const actions = document.createElement("div");
            actions.className = "transaction-actions";

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.textContent = "Edit";
            editButton.addEventListener("click", () => editTransaction(item.id));

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", () => deleteTransaction(item.id));

            actions.append(editButton, deleteButton);
            li.append(info, amount, actions);
            transactionList.appendChild(li);
        });
}


// Transaction event listeners

transactionForm.addEventListener("submit", handleTransaction);

document.getElementById("cancel-edit").addEventListener("click", cancelEdit);
/* ==========================================
   AAYUSH'S SECTION
   BUDGET AND ANALYTICS

   1. Monthly budget
   2. Budget progress
   3. Budget warnings
   4. Category chart
   5. Monthly spending chart
========================================== */

// Get this month's expenses

function getMonthlyExpenses() {
    const now = new Date();

    return transactions.filter(item => {
        const date = new Date(item.date + "T00:00:00");

        return item.type === "expense" &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();
    }).reduce((sum, item) => sum + item.amount, 0);
}


// Save monthly budget

function updateBudget(event) {
    event.preventDefault();

    const value = Number(document.getElementById("budget-limit").value);

    if (!Number.isFinite(value) || value <= 0) {
        showToast("Please enter a valid budget.");
        return;
    }

    monthlyBudget = value;

    saveData();
    renderBudget();

    budgetForm.reset();
    showToast("Budget saved successfully!");
}

budgetForm.addEventListener("submit", updateBudget);


// Display budget progress

function renderBudget() {
    const spent = getMonthlyExpenses();
    const percentage = monthlyBudget > 0 ? (spent / monthlyBudget) * 100 : 0;

    document.getElementById("budget-total").textContent =
        `₩${monthlyBudget.toLocaleString()}`;

    document.getElementById("budget-spent").textContent =
        `₩${spent.toLocaleString()}`;

    const progress = document.getElementById("budget-progress");

    progress.value = Math.min(percentage, 100);

    document.getElementById("budget-percent").textContent =
        `${Math.round(percentage)}%`;

    const message = document.getElementById("budget-message");

    if (monthlyBudget === 0) {
        message.textContent = "Set a budget to get started.";
    } else if (percentage >= 100) {
        message.textContent = "Warning! You have exceeded your budget.";
    } else if (percentage >= 80) {
        message.textContent = "Careful! You are close to your budget limit.";
    } else {
        message.textContent = "Great! You are within your budget.";
    }
}


// Category spending chart

function renderCategoryChart() {
    const chart = document.getElementById("category-chart");
    const legend = document.getElementById("category-legend");

    const categories = {};

    transactions.forEach(item => {
        const date = new Date(item.date + "T00:00:00");
        const now = new Date();

        if (item.type === "expense" &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()) {

            categories[item.category] =
                (categories[item.category] || 0) + item.amount;
        }
    });

    const entries = Object.entries(categories);
    const total = entries.reduce((sum, item) => sum + item[1], 0);

    document.getElementById("chart-total").textContent =
        `₩${total.toLocaleString()}`;

    legend.innerHTML = "";

    if (total === 0) {
        chart.style.background = "#e8edf5";
        chart.setAttribute("aria-label", "No expense data available");

        legend.innerHTML = '<p class="empty-chart">Add expenses to see your spending breakdown.</p>';
        return;
    }

    const colors = ["#2563eb", "#14b8a6", "#f59e0b", "#ef4444",
        "#8b5cf6", "#ec4899", "#64748b", "#84cc16"];

    let current = 0;
    const parts = [];

    entries.forEach((item, index) => {
        const percentage = (item[1] / total) * 100;
        const end = current + percentage;

        parts.push(`${colors[index % colors.length]} ${current}% ${end}%`);
        current = end;

        const row = document.createElement("div");
        row.className = "legend-item";

        const color = document.createElement("span");
        color.className = "legend-color";
        color.style.backgroundColor = colors[index % colors.length];

        const name = document.createElement("span");
        name.textContent = item[0];

        const amount = document.createElement("strong");
        amount.textContent = `₩${item[1].toLocaleString()}`;

        row.append(color, name, amount);
        legend.appendChild(row);
    });

    chart.style.background = `conic-gradient(${parts.join(", ")})`;
    chart.setAttribute("aria-label", "Monthly expense category breakdown");
}


// Monthly spending chart

function renderMonthlyChart() {
    const chart = document.getElementById("monthly-chart");
    chart.innerHTML = "";

    const months = [];

    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setDate(1);
        date.setMonth(date.getMonth() - i);

        const month = date.getMonth();
        const year = date.getFullYear();

        const total = transactions.filter(item => {
            const itemDate = new Date(item.date + "T00:00:00");

            return item.type === "expense" &&
                itemDate.getMonth() === month &&
                itemDate.getFullYear() === year;
        }).reduce((sum, item) => sum + item.amount, 0);

        months.push({
            label: date.toLocaleString("en", { month: "short" }),
            total
        });
    }

    const max = Math.max(...months.map(item => item.total), 1);

    months.forEach(item => {
        const column = document.createElement("div");
        column.className = "month-column";

        const amount = document.createElement("span");
        amount.textContent = item.total > 0
            ? `₩${item.total.toLocaleString()}`
            : "₩0";

        const bar = document.createElement("div");
        bar.className = "month-bar";
        bar.style.height = `${Math.max((item.total / max) * 140, 4)}px`;

        const label = document.createElement("small");
        label.textContent = item.label;

        column.append(amount, bar, label);
        chart.appendChild(column);
    });
}


/* ==========================================
   COMMON SECTION
   SUMMARY AND RENDERING
========================================== */

function renderSummary() {
    const income = transactions
        .filter(item => item.type === "income")
        .reduce((sum, item) => sum + item.amount, 0);

    const expenses = transactions
        .filter(item => item.type === "expense")
        .reduce((sum, item) => sum + item.amount, 0);

    document.getElementById("balance").textContent =
        `₩${(income - expenses).toLocaleString()}`;

    document.getElementById("income").textContent =
        `₩${income.toLocaleString()}`;

    document.getElementById("expenses").textContent =
        `₩${expenses.toLocaleString()}`;
}


// Update everything

function render() {
    renderSummary();
    renderTransactions();
    renderBudget();
    renderCategoryChart();
    renderMonthlyChart();
}


/* ==========================================
   EXTRA FEATURES
   DARK MODE, DATE, TOAST, SHORTCUT
========================================== */

// Toast notification

function showToast(message) {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}


// Set today's date

document.getElementById("today-date").textContent =
    new Date().toLocaleDateString("en", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });

dateInput.value = new Date().toISOString().slice(0, 10);


// Dark mode

const themeButton = document.getElementById("theme-toggle");

if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
    themeButton.textContent = "☀️";
    themeButton.setAttribute("aria-label", "Switch to light mode");
}

themeButton.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    const dark = document.body.classList.contains("dark-mode");

    localStorage.setItem("darkMode", dark);
    themeButton.textContent = dark ? "☀️" : "🌙";
    themeButton.setAttribute(
        "aria-label",
        dark ? "Switch to light mode" : "Switch to dark mode"
    );
});


// Add transaction shortcut

document.getElementById("add-shortcut").addEventListener("click", () => {
    document.getElementById("transaction-form-section").scrollIntoView({
        behavior: "smooth"
    });

    descriptionInput.focus();
});


/* ==========================================
   INITIALIZE APPLICATION
========================================== */

render();


document.getElementById("search-transactions").addEventListener("input", renderTransactions);

document.getElementById("filter-type").addEventListener("change", renderTransactions)
