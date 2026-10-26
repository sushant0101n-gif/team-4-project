et transactions = JSON.parse(
  localStorage.getItem("transactions") || "[]"
);

let monthlyBudget = Number(
  localStorage.getItem("monthlyBudget") || 0
);

const form = document.getElementById("transaction-form");
const list = document.getElementById("transactions");
const budgetForm = document.getElementById("budget-form");
const budgetInput = document.getElementById("budget-limit");

function render() {
  const income = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  document.getElementById("income").textContent =
    "₩" + income.toLocaleString();

  document.getElementById("expenses").textContent =
    "₩" + expenses.toLocaleString();

  document.getElementById("balance").textContent =
    "₩" + (income - expenses).toLocaleString();

  // Monthly budget information
  document.getElementById("budget-total").textContent =
    "₩" + monthlyBudget.toLocaleString();

  document.getElementById("budget-spent").textContent =
    "₩" + expenses.toLocaleString();

  const progress = document.getElementById("budget-progress");

  const percentage = monthlyBudget > 0
    ? (expenses / monthlyBudget) * 100
    : 0;

  progress.value = Math.min(percentage, 100);

  const message = document.getElementById("budget-message");

  if (monthlyBudget === 0) {
    message.textContent = "Set a budget to get started.";
  } else if (expenses > monthlyBudget) {
    message.textContent = "Budget exceeded! Try to reduce spending.";
  } else {
    message.textContent =
      "You have ₩" +
      (monthlyBudget - expenses).toLocaleString() +
      " remaining.";
  }

  // Display transaction history
  list.innerHTML = "";

  transactions.forEach((t, index) => {
    const item = document.createElement("li");

    item.textContent =
      `${t.description} (${t.category || "Other"}): ` +
      `${t.type === "income" ? "+" : "-"}₩${t.amount.toLocaleString()} `;

    const remove = document.createElement("button");
    remove.textContent = "Delete";
    remove.style.width = "auto";

    remove.addEventListener("click", () => {
      transactions.splice(index, 1);
      save();
    });

    item.appendChild(remove);
    list.appendChild(item);
  });
}

function save() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  render();
}

// Save monthly budget
budgetForm.addEventListener("submit", event => {
  event.preventDefault();

  const amount = Number(budgetInput.value);

  if (!Number.isFinite(amount) || amount <= 0) {
    alert("Please enter a budget greater than zero.");
    return;
  }

  monthlyBudget = amount;

  localStorage.setItem("monthlyBudget", String(monthlyBudget));

  render();
  budgetForm.reset();
});

// Add a transaction
form.addEventListener("submit", event => {
  event.preventDefault();

  const description =
    document.getElementById("description").value.trim();

  const amount =
    Number(document.getElementById("amount").value);

  const type =
    document.getElementById("type").value;

  const category =
    document.getElementById("category").value;

  if (!description || !Number.isFinite(amount) || amount <= 0) {
    alert("Please enter a description and an amount greater than zero.");
    return;
  }

  transactions.push({
    description,
    amount,
    type,
    category
  });

  save();
  form.reset();
});

render();
