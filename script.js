let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let monthlyBudget = localStorage.getItem("monthlyBudget") || 0;
let editIndex = -1;
let expenseChart;

const darkToggle = document.getElementById("darkToggle");

// Set initial icon based on saved mode
if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark");
    darkToggle.querySelector('.icon').textContent = '☀️';
} else {
    darkToggle.querySelector('.icon').textContent = '🌙';
}

darkToggle.addEventListener("click", function () {
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
    localStorage.setItem("expenses", JSON.stringify(expenses));
    localStorage.setItem("monthlyBudget", monthlyBudget);
}

function addExpense() {
    const name = document.getElementById("name").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const date = document.getElementById("date").value;
    const category = document.getElementById("category").value;

    if (!name || !amount || !date) {
        showNotification("Please fill all fields", "error");
        return;
    }

    if (editIndex === -1) {
        expenses.push({ name, amount, date, category });
    } else {
        expenses[editIndex] = { name, amount, date, category };
        editIndex = -1;
    }

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
    const modal = document.getElementById("confirmModal");
    const message = document.getElementById("confirmMessage");
    const yesBtn = document.getElementById("confirmYes");
    const noBtn = document.getElementById("confirmNo");

    message.textContent = "Delete this expense?";
    modal.style.display = "flex";

    yesBtn.onclick = function () {
        expenses.splice(index, 1);
        saveData();
        renderExpenses();
        modal.style.display = "none";
        showNotification("Expense deleted");
    };

    noBtn.onclick = function () {
        modal.style.display = "none";
    };
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
function showNotification(message, type = "success") {
    const notification = document.getElementById("notification");
    notification.textContent = message;
    notification.className = "notification show";

    if (type === "error") {
        notification.classList.add("error");
    }

    setTimeout(() => {
        notification.classList.remove("show");
    }, 3000);
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

renderExpenses();
