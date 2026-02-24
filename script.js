let expenses = [];
let total = 0;
let budget = 0;

window.onload = function () {
  const storedExpenses = localStorage.getItem("expenses");
  if (storedExpenses) {
    expenses = JSON.parse(storedExpenses);
    total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }
  document.getElementById('expense-date').valueAsDate = new Date(); // Set default date
  applyFilters(); // Apply default filters on load
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
  const dateInput = document.getElementById("expense-date");
  const categoryInput = document.getElementById("expense-category");

  const name = nameInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const date = dateInput.value;
  const category = categoryInput.value;

  if (name === "" || isNaN(amount) || amount <= 0 || date === "" || category === "") {
    alert("Please fill in all fields.");
    return;
  }

  expenses.push({ name, amount, date, category });
  total += amount;

  applyFilters();
  saveExpenses();

  nameInput.value = "";
  amountInput.value = "";
  document.getElementById('expense-date').valueAsDate = new Date();
  categoryInput.value = "";

  if (budget > 0) {
    checkBudget();
  }
}

function updateUI(filteredExpenses) {
  const expenseList = document.getElementById("expense-list");
  const totalAmount = document.getElementById("total-amount");

  expenseList.innerHTML = "";

  const displayExpenses = filteredExpenses || expenses;

  displayExpenses.forEach((expense) => {
    const li = document.createElement("li");
    const originalIndex = expenses.indexOf(expense);
    li.innerHTML = `
            <span>${expense.name} - ${expense.category} - ${expense.date} - ₹${expense.amount.toFixed(2)}</span>
            <div>
                <button class="edit-btn" onclick="editExpense(${originalIndex})">✏️</button>
                <button class="delete-btn" onclick="removeExpense(${originalIndex})">X</button>
            </div>
        `;
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
  applyFilters();
  saveExpenses();
}

function editExpense(index) {
    const expenseList = document.getElementById('expense-list');
    const li = Array.from(expenseList.children).find(child => child.querySelector(`.edit-btn[onclick="editExpense(${index})"]`));
    if(!li) return;

    const expense = expenses[index];

    // Switch to editing UI
    li.classList.add('editing');
    const template = document.getElementById('edit-template');
    li.innerHTML = template.content.firstElementChild.innerHTML;

    // Populate fields and set listeners
    const nameInput = li.querySelector('.edit-name');
    const amountInput = li.querySelector('.edit-amount');
    const dateInput = li.querySelector('.edit-date');
    const categoryInput = li.querySelector('.edit-category');

    nameInput.value = expense.name;
    amountInput.value = expense.amount;
    dateInput.value = expense.date;
    categoryInput.value = expense.category;

    li.querySelector('.save-btn').onclick = () => saveExpense(index);
    li.querySelector('.cancel-btn').onclick = () => applyFilters();
}

function saveExpense(index) {
  const expenseList = document.getElementById("expense-list");
  const li = expenseList.children[index];
  const nameInput = li.querySelector(".edit-name");
  const amountInput = li.querySelector(".edit-amount");
  const dateInput = li.querySelector(".edit-date");
  const categoryInput = li.querySelector(".edit-category");

  const newName = nameInput.value.trim();
  const newAmount = parseFloat(amountInput.value);
  const newDate = dateInput.value;
  const newCategory = categoryInput.value;

  if (newName === "" || isNaN(newAmount) || newAmount <= 0 || newDate === "" || newCategory === "") {
    alert("Please fill in all fields.");
    return;
  }

  total = total - expenses[index].amount + newAmount;
  expenses[index] = { name: newName, amount: newAmount, date: newDate, category: newCategory };

  applyFilters();
  saveExpenses();
}

function applyFilters() {
    const searchTerm = document.getElementById('search-bar').value.toLowerCase();
    const filterCategory = document.getElementById('filter-category').value;
    const sortBy = document.getElementById('sort-by').value;

    let filteredExpenses = expenses.filter(expense => {
        const nameMatch = expense.name.toLowerCase().includes(searchTerm);
        const categoryMatch = filterCategory === 'all' || expense.category === filterCategory;
        return nameMatch && categoryMatch;
    });

    switch (sortBy) {
        case 'date-desc':
            filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'date-asc':
            filteredExpenses.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'amount-desc':
            filteredExpenses.sort((a, b) => b.amount - a.amount);
            break;
        case 'amount-asc':
            filteredExpenses.sort((a, b) => a.amount - b.amount);
            break;
    }

    updateUI(filteredExpenses);
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
