
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

document.getElementById("search-transactions").addEventListener("input", renderTransactions);

document.getElementById("filter-type").addEventListener("change", renderTransactions)
