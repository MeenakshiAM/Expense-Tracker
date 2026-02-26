let expenses = [];
let monthlyBudget = 0;
let editIndex = -1;
let expenseChart;
async function fetchExpenses() {
    const res = await fetch("http://localhost:5000/expenses");
    expenses = await res.json();
    renderExpenses();
}
const toggle = document.getElementById("darkToggle");

if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark");
    toggle.checked = true;
}

toggle.addEventListener("change", function () {
    document.body.classList.toggle("dark");
    localStorage.setItem("darkMode",
        document.body.classList.contains("dark") ? "enabled" : "disabled"
    );
});

function saveData() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
    localStorage.setItem("monthlyBudget", monthlyBudget);
}

async function addExpense() {
    const name = document.getElementById("name").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const date = document.getElementById("date").value;
    const category = document.getElementById("category").value;

    const expense = { name, amount, date, category };

    await fetch("http://localhost:5000/expenses", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(expense)
    });

    fetchExpenses();  // 🔥 reload from backend
}

function editExpense(index) {
    const exp = expenses[index];
    document.getElementById("name").value = exp.name;
    document.getElementById("amount").value = exp.amount;
    document.getElementById("date").value = exp.date;
    document.getElementById("category").value = exp.category;
    editIndex = index;
}

async function deleteExpense(id) {
    await fetch(`http://localhost:5000/expenses/${id}`, {
        method: "DELETE"
    });

    fetchExpenses();
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
                    <button onclick="deleteExpense('${exp._id}')">Delete</button>
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
    generatePieChart(month);
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
        monthlyTotals[month] = (monthlyTotals[month] || 0) + exp.amount;
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

function generatePieChart(selectedMonth) {
    if (expenseChart) expenseChart.destroy();

    let monthExpenses = selectedMonth && selectedMonth !== "All"
        ? expenses.filter(e => e.date.startsWith(selectedMonth))
        : expenses;

    const categoryTotals = {};

    monthExpenses.forEach(exp => {
        categoryTotals[exp.category] =
            (categoryTotals[exp.category] || 0) + exp.amount;
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    const ctx = document.getElementById("expenseChart").getContext("2d");

    expenseChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: labels,
            datasets: [{
                data: data
            }]
        },
        options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
        tooltip: {
            callbacks: {
                label: function(context) {
                    let total = data.reduce((a, b) => a + b, 0);
                    let value = context.raw;
                    let percentage = ((value / total) * 100).toFixed(1);
                    return `${context.label}: ₹${value} (${percentage}%)`;
                }
            }
        }
    }
}
    });
}

fetchExpenses();