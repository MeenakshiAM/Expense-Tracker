let expenses = [];
let total = 0;

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
    const confirmed = confirm(`Are you sure you want to delete "${expenses[index].name}"?`);
    if (!confirmed) return;

    total -= expenses[index].amount;
    expenses.splice(index, 1);
    updateUI();
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