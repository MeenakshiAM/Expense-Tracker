let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let monthlyBudget = localStorage.getItem("monthlyBudget") || 0;
let editIndex = -1;

const toggle = document.getElementById("darkToggle");

/* Dark Mode Load */
if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark");
    toggle.checked = true;
}

toggle.addEventListener("change", function () {
    if (this.checked) {
        document.body.classList.add("dark");
        localStorage.setItem("darkMode", "enabled");
    } else {
        document.body.classList.remove("dark");
        localStorage.setItem("darkMode", "disabled");
    }
});

function saveData() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
    localStorage.setItem("monthlyBudget", monthlyBudget);
}

function addExpense() {
    const name = document.getElementById("name").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const date = document.getElementById("date").value;
    const category = document.getElementById("category").value;

    if (!name || !amount || !date) {
        alert("Please fill all fields");
        return;
    }

    if (editIndex === -1) {
        expenses.push({ name, amount, date, category });
    } else {
        expenses[editIndex] = { name, amount, date, category };
        editIndex = -1;
    }

    clearForm();
    saveData();
    renderExpenses();
}

function editExpense(index) {
    const exp = expenses[index];

    document.getElementById("name").value = exp.name;
    document.getElementById("amount").value = exp.amount;
    document.getElementById("date").value = exp.date;
    document.getElementById("category").value = exp.category;

    editIndex = index;
}

function deleteExpense(index) {
    if (confirm("Are you sure you want to delete this expense?")) {
        expenses.splice(index, 1);
        saveData();
        renderExpenses();
    }
}

function clearForm() {
    document.getElementById("name").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("date").value = "";
}

function setBudget() {
    monthlyBudget = parseFloat(document.getElementById("monthlyBudget").value);
    saveData();
    renderExpenses();
}

function applyFilters() {
    renderExpenses();
}

function renderExpenses() {
    const list = document.getElementById("expenseList");
    list.innerHTML = "";

    let filtered = [...expenses];

    const search = document.getElementById("search").value.toLowerCase();
    const month = document.getElementById("monthFilter").value;
    const category = document.getElementById("categoryFilter").value;
    const sort = document.getElementById("sortOption").value;

    if (search)
        filtered = filtered.filter(e => e.name.toLowerCase().includes(search));

    if (month !== "All")
        filtered = filtered.filter(e => e.date.startsWith(month));

    if (category !== "All")
        filtered = filtered.filter(e => e.category === category);

    if (sort === "dateAsc")
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    else if (sort === "dateDesc")
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    else if (sort === "category")
        filtered.sort((a, b) => a.category.localeCompare(b.category));

    let total = 0;

    filtered.forEach((exp, index) => {
        total += exp.amount;

        list.innerHTML += `
            <tr>
                <td>${exp.name}</td>
                <td>₹${exp.amount}</td>
                <td>${exp.date}</td>
                <td>${exp.category}</td>
                <td>
                    <button onclick="editExpense(${index})">Edit</button>
                    <button onclick="deleteExpense(${index})">Delete</button>
                </td>
            </tr>
        `;
    });

    document.getElementById("totalAmount").textContent = total;

    if (monthlyBudget && total > monthlyBudget) {
        document.getElementById("budgetWarning").textContent =
            "⚠ Monthly Budget Exceeded!";
    } else {
        document.getElementById("budgetWarning").textContent = "";
    }

    populateMonths();
    generateMonthlySummary();
}

function populateMonths() {
    const select = document.getElementById("monthFilter");
    const months = [...new Set(expenses.map(e => e.date.slice(0, 7)))];

    select.innerHTML = `<option value="All">All Months</option>`;
    months.forEach(m => {
        select.innerHTML += `<option value="${m}">${m}</option>`;
    });
}

function generateMonthlySummary() {
    const summaryTable = document.getElementById("monthlySummary");
    summaryTable.innerHTML = "";

    const monthlyTotals = {};

    expenses.forEach(exp => {
        const month = exp.date.slice(0, 7);
        if (!monthlyTotals[month]) monthlyTotals[month] = 0;
        monthlyTotals[month] += exp.amount;
    });

    for (let month in monthlyTotals) {
        summaryTable.innerHTML += `
            <tr>
                <td>${month}</td>
                <td>₹${monthlyTotals[month]}</td>
            </tr>
        `;
    }
}

renderExpenses();