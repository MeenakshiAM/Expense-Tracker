let expenses = [];
let monthlyBudget = localStorage.getItem("monthlyBudget") ? parseFloat(localStorage.getItem("monthlyBudget")) : 0;
let editId = null;  // track the _id of the expense being edited
let expenseChart;

async function fetchExpenses() {
    try {
        const res = await fetch("http://localhost:5000/expenses");
        if (!res.ok) throw new Error("Server error");
        expenses = await res.json();
    } catch (error) {
        console.error("Could not fetch expenses:", error);
        alert("⚠ Could not connect to the server. Make sure the backend is running (node server.js).");
        return;
    }
    document.getElementById("monthlyBudget").value = monthlyBudget > 0 ? monthlyBudget : "";
    renderExpenses();
}

const toggle = document.getElementById("darkToggle");

if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark");
    toggle.checked = true;
}

toggle.addEventListener("change", function () {
    document.body.classList.toggle("dark");
    const icon = darkToggle.querySelector('.icon');

    // Update button icon based on mode
    if (document.body.classList.contains("dark")) {
        icon.textContent = '☀️';  // Sun for dark mode (to switch to light)
        localStorage.setItem("darkMode", "enabled");
    } else {
        icon.textContent = '🌙';  // Moon for light mode (to switch to dark)
        localStorage.setItem("darkMode", "disabled");
    }
});

function saveData() {
    localStorage.setItem("monthlyBudget", monthlyBudget);
}

function clearForm() {
    document.getElementById("name").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("date").value = "";
    document.getElementById("category").value = "Food";
    editId = null;
    // Reset button text back to "Add"
    const addBtn = document.querySelector("button[onclick='addExpense()']");
    if (addBtn) addBtn.textContent = "Add";
}

async function addExpense() {
    const name = document.getElementById("name").value.trim();
    const amount = parseFloat(document.getElementById("amount").value);
    const date = document.getElementById("date").value;
    const category = document.getElementById("category").value;

    // --- Input validation ---
    if (!name) {
        alert("Please enter an expense name.");
        return;
    }
    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount greater than 0.");
        return;
    }
    if (!date) {
        alert("Please select a date.");
        return;
    }

    const expense = { name, amount, date, category };

    try {
        if (editId) {
            // UPDATE existing expense
            const res = await fetch(`http://localhost:5000/expenses/${editId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(expense)
            });
            if (!res.ok) throw new Error("Update failed");
        } else {
            // CREATE new expense
            const res = await fetch("http://localhost:5000/expenses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(expense)
            });
            if (!res.ok) throw new Error("Save failed");
        }
    } catch (error) {
        console.error("Error saving expense:", error);
        alert("⚠ Failed to save expense. Is the backend running?");
        return;
    }

    clearForm();
    fetchExpenses();
}

function editExpense(index) {
    const exp = expenses[index];
    document.getElementById("name").value = exp.name;
    document.getElementById("amount").value = exp.amount;
    document.getElementById("date").value = exp.date;
    document.getElementById("category").value = exp.category;
    editId = exp._id;
    // Change button text to indicate editing
    const addBtn = document.querySelector("button[onclick='addExpense()']");
    if (addBtn) addBtn.textContent = "Update";
}

async function deleteExpense(id) {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
        const res = await fetch(`http://localhost:5000/expenses/${id}`, {
            method: "DELETE"
        });
        if (!res.ok) throw new Error("Delete failed");
    } catch (error) {
        console.error("Error deleting expense:", error);
        alert("⚠ Failed to delete expense.");
        return;
    }
    fetchExpenses();
}

function setBudget() {
    monthlyBudget = parseFloat(document.getElementById("monthlyBudget").value) || 0;
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
        filtered = filtered.filter(e => e.date && e.date.startsWith(month));

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
        document.getElementById("budgetWarning").style.color = "red";
    } else if (monthlyBudget && total >= monthlyBudget * 0.8) {
        document.getElementById("budgetWarning").textContent =
            "⚠ Approaching Monthly Budget (>= 80%)!";
        document.getElementById("budgetWarning").style.color = "orange";
    } else {
        document.getElementById("budgetWarning").textContent = "";
    }

    populateMonths();
    generateMonthlySummary();
    generatePieChart(month);
}

function populateMonths() {
    const select = document.getElementById("monthFilter");
    const months = [...new Set(expenses.filter(e => e.date).map(e => e.date.slice(0, 7)))];

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
        if (!exp.date) return;
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
        ? expenses.filter(e => e.date && e.date.startsWith(selectedMonth))
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
                        label: function (context) {
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

function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Get current filter state
    const month = document.getElementById("monthFilter").value;
    const category = document.getElementById("categoryFilter").value;
    const total = document.getElementById("totalAmount").textContent;

    // Filter expenses same as renderExpenses
    let filtered = [...expenses];
    const search = document.getElementById("search").value.toLowerCase();

    if (search)
        filtered = filtered.filter(e => e.name.toLowerCase().includes(search));
    if (month !== "All")
        filtered = filtered.filter(e => e.date && e.date.startsWith(month));
    if (category !== "All")
        filtered = filtered.filter(e => e.category === category);

    const sort = document.getElementById("sortOption").value;
    if (sort === "dateAsc")
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    else if (sort === "dateDesc")
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    else if (sort === "category")
        filtered.sort((a, b) => a.category.localeCompare(b.category));

    // --- Title ---
    doc.setFontSize(20);
    doc.setTextColor(46, 125, 50);
    doc.text("Expense Tracker Report", 14, 20);

    // --- Report info ---
    doc.setFontSize(10);
    doc.setTextColor(100);
    const reportDate = new Date().toLocaleDateString("en-IN", {
        year: "numeric", month: "long", day: "numeric"
    });
    doc.text("Generated: " + reportDate, 14, 28);
    const filterLabel = month !== "All" ? "Month: " + month : "All Months";
    const catLabel = category !== "All" ? " | Category: " + category : "";
    doc.text("Filters: " + filterLabel + catLabel, 14, 34);

    // --- Total ---
    doc.setFontSize(13);
    doc.setTextColor(0);
    doc.text("Total: \u20b9" + total, 14, 44);

    // --- Budget status ---
    if (monthlyBudget > 0) {
        const totalNum = parseFloat(total);
        doc.setFontSize(10);
        if (totalNum > monthlyBudget) {
            doc.setTextColor(211, 47, 47);
            doc.text("Budget: \u20b9" + monthlyBudget + " \u2014 EXCEEDED", 14, 50);
        } else if (totalNum >= monthlyBudget * 0.8) {
            doc.setTextColor(245, 124, 0);
            doc.text("Budget: \u20b9" + monthlyBudget + " \u2014 Approaching limit (>= 80%)", 14, 50);
        } else {
            doc.setTextColor(46, 125, 50);
            doc.text("Budget: \u20b9" + monthlyBudget + " \u2014 Within limit", 14, 50);
        }
    }

    // --- Expense table ---
    if (filtered.length === 0) {
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text("No expenses to display for the selected filters.", 14, 62);
    } else {
        const tableData = filtered.map(function (exp) {
            return [exp.name, "\u20b9" + exp.amount, exp.date || "N/A", exp.category];
        });

        doc.autoTable({
            startY: monthlyBudget > 0 ? 56 : 50,
            head: [["Name", "Amount", "Date", "Category"]],
            body: tableData,
            theme: "striped",
            headStyles: { fillColor: [46, 125, 50] },
            styles: { fontSize: 9 }
        });
    }

    // --- Category summary ---
    const categoryTotals = {};
    filtered.forEach(function (exp) {
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    if (Object.keys(categoryTotals).length > 0) {
        const catData = Object.entries(categoryTotals).map(function (entry) {
            return [entry[0], "\u20b9" + entry[1]];
        });
        const startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 70;

        doc.setFontSize(13);
        doc.setTextColor(0);
        doc.text("Category Summary", 14, startY);

        doc.autoTable({
            startY: startY + 4,
            head: [["Category", "Total"]],
            body: catData,
            theme: "grid",
            headStyles: { fillColor: [21, 101, 192] },
            styles: { fontSize: 9 }
        });
    }

    // --- Footer on every page ---
    const pageCount = doc.internal.getNumberOfPages();
    for (var i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            "Expense Tracker \u2014 Page " + i + " of " + pageCount,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: "center" }
        );
    }

    // --- Save ---
    const filename = month !== "All" ? "expenses_" + month + ".pdf" : "expenses_report.pdf";
    doc.save(filename);
}

fetchExpenses();