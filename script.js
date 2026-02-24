
let expenses = [];
let total = 0;
let budget = 0;

window.onload = function () {
  const storedExpenses = localStorage.getItem("expenses");
  if (storedExpenses) {
    expenses = JSON.parse(storedExpenses);
    total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    updateUI();
  }
};

function setBudget() {
  const budgetInput = document.getElementById("budget-amount");
  const newBudget = parseFloat(budgetInput.value);

  if (isNaN(newBudget) || newBudget <= 0) {
    alert("Please enter a valid positive budget amount.");
    return;
  }

  budget = newBudget;
  alert(`Budget set to ₹${budget}`);
  budgetInput.value = "";
}

function addExpense() {
  const nameInput = document.getElementById("expense-name");
  const amountInput = document.getElementById("expense-amount");

  const name = nameInput.value.trim();
  const amount = parseFloat(amountInput.value);

  if (name === "" || isNaN(amount) || amount <= 0) {
    alert(
      "Please enter a valid expense name and a positive amount greater than 0."
    );
    return;
  }

  expenses.push({ name, amount });
  total += amount;

  updateUI();
  saveExpenses();

  nameInput.value = "";
  amountInput.value = "";

  if (budget > 0) {
    checkBudget();
  }
}

function updateUI() {
  const expenseList = document.getElementById("expense-list");
  const totalAmount = document.getElementById("total-amount");

  expenseList.innerHTML = "";

  expenses.forEach((expense, index) => {
    const li = document.createElement("li");
    li.innerHTML = `${expense.name}: ₹${expense.amount.toFixed(2)} 
                        <button class="delete-btn" onclick="removeExpense(${index})">X</button>`;
    expenseList.appendChild(li);
  });

  totalAmount.textContent = total.toFixed(2);
}

function removeExpense(index) {
  const confirmed = confirm(
    `Are you sure you want to delete \"${expenses[index].name}\"?`
  );
  if (!confirmed) return;

  total -= expenses[index].amount;
  expenses.splice(index, 1);
  updateUI();
  saveExpenses();
}

function saveExpenses() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

function checkBudget() {
  if (total > budget) {
    alert(`⚠ Warning! Your expenses have exceeded your budget of ₹${budget}.`);
  }
}

const themeToggleBtn = document.getElementById("theme-toggle");
themeToggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  if (document.body.classList.contains("dark-mode")) {
    themeToggleBtn.textContent = "☀ Light Mode";
  } else {
    themeToggleBtn.textContent = "🌙 Dark Mode";
  }
});

function toggleChat() {
  const chat = document.getElementById("chatContainer");
  chat.style.display = chat.style.display === "flex" ? "none" : "flex";
}

function sendMessage() {
  const inputField = document.getElementById("userInput");
  const message = inputField.value.trim();
  if (!message) return;

  appendMessage("You", message);

  setTimeout(() => {
    const reply = getBotResponse(message);
    appendMessage("Assistant", reply);
  }, 500);

  inputField.value = "";
}

function appendMessage(sender, message) {
  const chatBody = document.getElementById("chatBody");
  const msg = document.createElement("p");
  msg.innerHTML = `<strong>${sender}:</strong> ${message}`;
  chatBody.appendChild(msg);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function getBotResponse(input) {
  input = input.toLowerCase();

  if (input.includes("total") || input.includes("spend")) {
    return `Your total recorded expense is ₹${total.toFixed(2)}.`;
  }

  if (input.includes("save") || input.includes("saving")) {
    return "Tip: Follow the 50-30-20 budgeting rule to manage your finances effectively.";
  }

  if (input.includes("budget")) {
    return "Set a monthly limit and review your expenses weekly.";
  }

  if (input.includes("help")) {
    return "You can ask me about total expenses, saving tips, or budgeting advice.";
  }

  return "I'm here to help you track and improve your spending habits.";
}
