let expenses = [];
let total = 0;

function addExpense() {
    const nameInput = document.getElementById("expense-name");
    const amountInput = document.getElementById("expense-amount");
    
    const name = nameInput.value.trim();
    const amount = parseFloat(amountInput.value);

    if (name === "" || isNaN(amount) || amount <= 0) {
        alert("Please enter a valid expense name and amount.");
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
    total -= expenses[index].amount;
    expenses.splice(index, 1);
    updateUI();
}
