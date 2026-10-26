
let transactions = JSON.parse(
  localStorage.getItem("transactions") || "[]"
);

const form = document.getElementById("transaction-form");
const list = document.getElementById("transactions");

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

  list.innerHTML = "";

  transactions.forEach((t, index) => {
    const item = document.createElement("li");
    item.textContent =
      `${t.description}: ${t.type === "income" ? "+" : "-"}₩${t.amount.toLocaleString()} `;

    const remove = document.createElement("button");
    remove.textContent = "Delete";
    remove.style.width = "auto";

    remove.onclick = () => {
      transactions.splice(index, 1);
      save();
    };

    item.appendChild(remove);
    list.appendChild(item);
  });
}

function save() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  render();
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const description =
    document.getElementById("description").value.trim();
  const amount =
    Number(document.getElementById("amount").value);
  const type = document.getElementById("type").value;

  if (!description || amount <= 0) return;

  transactions.push({ description, amount, type });
  save();
  form.reset();
});

render();
