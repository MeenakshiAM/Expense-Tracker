let expenses = [];
let total = 0;
let budget = 0; // User sets this via input

// --- Set Budget dynamically ---
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

// --- Add Expense ---
function addExpense() {
    const nameInput = document.getElementById("expense-name");
    const amountInput = document.getElementById("expense-amount");
    
    const name = nameInput.value.trim();
    const amount = parseFloat(amountInput.value);

    if (name === "" || isNaN(amount) || amount <= 0) {
        alert("Please enter a valid expense name and a positive amount greater than 0.");
        return;
    }

    expenses.push({ name, amount });
    total += amount;

    updateUI();
    
    nameInput.value = "";
    amountInput.value = "";

    // ✅ Check budget if user has set one
    if (budget > 0) {
        checkBudget();
    }
}

// --- Update UI ---
function updateUI() {
    const expenseList = document.getElementById("expense-list");
    const totalAmount = document.getElementById("total-amount");
    
    expenseList.innerHTML = "";

    expenses.forEach((expense, index) => {
        const li = document.createElement("li");
        li.classList.add("fade-in"); // 👈 animation added
        li.innerHTML = `${expense.name}: ₹${expense.amount.toFixed(2)} 
                        <button class="delete-btn" onclick="removeExpense(${index})">X</button>`;
        expenseList.appendChild(li);
    });

    totalAmount.textContent = total.toFixed(2);
}

// --- Remove Expense ---
function removeExpense(index) {
    const confirmed = confirm(`Are you sure you want to delete "${expenses[index].name}"?`);
    if (!confirmed) return;

    const expenseList = document.getElementById("expense-list");
    const item = expenseList.children[index];

    item.classList.add("fade-out"); // 👈 add fade-out animation

    // Wait for animation before removing
    setTimeout(() => {
        total -= expenses[index].amount;
        expenses.splice(index, 1);
        updateUI();
    }, 300); // matches animation duration
}

// --- Check Budget ---
function checkBudget() {
    if (total > budget) {
        alert(`⚠ Warning! Your expenses have exceeded your budget of ₹${budget}.`);
    }
}

// --- Dark Mode Toggle ---
const themeToggleBtn = document.getElementById("theme-toggle");
themeToggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    if (document.body.classList.contains("dark-mode")) {
        themeToggleBtn.textContent = "☀ Light Mode";
    } else {
        themeToggleBtn.textContent = "🌙 Dark Mode";
    }
});
// ===== Smart Expense Assistant =====

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

  let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  let total = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);

  if (input.includes("total") || input.includes("spend")) {
    return `Your total recorded expense is ₹${total}.`;
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
