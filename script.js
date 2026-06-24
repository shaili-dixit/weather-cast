let totalSalary = 0;
let expenseList = [];
let expenseChart;
const salaryInput = document.getElementById("salaryInput");
const expenseNameInput = document.getElementById("expenseName");
const expenseAmountInput = document.getElementById("expenseAmount");

const addExpenseBtn = document.getElementById("addExpenseBtn");

const salaryDisplay = document.getElementById("salaryDisplay");
const expenseDisplay = document.getElementById("expenseDisplay");
const balanceDisplay = document.getElementById("balanceDisplay");
const downloadBtn = document.getElementById("downloadBtn");

downloadBtn.addEventListener("click", generatePDF);

const expenseTableBody = document.getElementById("expenseTableBody");

const themeToggle = document.getElementById("themeToggle");

addExpenseBtn.addEventListener(
    "click",
    addExpense
);

function updateChart() {
    let totalExpenses = 0;
    expenseList.forEach((expense) => {
        totalExpenses += expense.amount;
    });
    let remainingBalance = totalSalary - totalExpenses;
    // Prevent negative values from entering chart
    if (remainingBalance < 0) {
        remainingBalance = 0;
    }
    const ctx = document.getElementById("expenseChart");
    if (expenseChart) {
        expenseChart.destroy();
    }
    expenseChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Expenses", "Remaining Balance"],
            datasets: [{
                data: [totalExpenses, remainingBalance],
                backgroundColor: [
                    "#ff6384",
                    "#36a2eb"
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });
}

function saveData() {
    localStorage.setItem(
        "salary",
        JSON.stringify(totalSalary)
    );

    localStorage.setItem(
        "expenses",
        JSON.stringify(expenseList)
    );
}

function loadData() {
    totalSalary =
        JSON.parse(
            localStorage.getItem("salary")
        ) || 0;

    expenseList =
        JSON.parse(
            localStorage.getItem("expenses")
        ) || [];

    renderExpenses();
    updateSummary();
    updateChart();
}

function addExpense() {
    const salaryValue =
        Number(salaryInput.value);
    const expenseName =
        expenseNameInput.value.trim();
    const expenseAmount =
        Number(expenseAmountInput.value);
    if (
        salaryValue <= 0 ||
        expenseName === "" ||
        expenseAmount <= 0
    ) {

        alert(
            "Please enter valid inputs."
        );
        return;
    }
    totalSalary = salaryValue;

    const expense = {

        name: expenseName,
        amount: expenseAmount
    };

    expenseList.push(expense);
    saveData();
    renderExpenses();
    updateSummary();
    updateChart();
    clearInputs();

}

function renderExpenses() {
    expenseTableBody.innerHTML = "";
    expenseList.forEach((expense, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${expense.name}</td>
            <td>₹${expense.amount}</td>
            <td>
                <button class="delete-btn"
                    onclick="deleteExpense(${index})">
                    🗑
                </button>
            </td>
        `;
        expenseTableBody.appendChild(row);
    });
}

function deleteExpense(index) {
    expenseList.splice(index, 1);
    saveData();
    renderExpenses();
    updateSummary();
    updateChart();
}

function updateSummary() {
    let totalExpenses = 0;
    expenseList.forEach(
        (expense) => {
            totalExpenses += expense.amount;
        }
    );
    const remainingBalance =
        totalSalary - totalExpenses;
    salaryDisplay.textContent =
        `₹${totalSalary}`;
    expenseDisplay.textContent =
        `₹${totalExpenses}`;
    balanceDisplay.textContent =
        `₹${remainingBalance}`;
    const warningBanner =
        document.getElementById("warning-banner");
    if (remainingBalance < 0) {
        balanceDisplay.style.color = "red";
        warningBanner.style.display = "block";
        warningBanner.innerHTML =
            `⚠ Budget exceeded by ₹${Math.abs(remainingBalance)}`;
    } else if (
        remainingBalance <= totalSalary * 0.1
        &&
        remainingBalance > 0
    ) {
        balanceDisplay.style.color = "orange";
        warningBanner.style.display = "block";
        warningBanner.style.background = "#f59e0b";
        warningBanner.innerHTML =
            `⚠ Low Balance! Only ₹${remainingBalance} remaining`;
    } else {
        balanceDisplay.style.color = "#47ccf0";
        warningBanner.style.display = "none";
    }
}

function clearInputs() {
    expenseNameInput.value = "";
    expenseAmountInput.value = "";
}

themeToggle.addEventListener("click", toggleTheme);

function toggleTheme() {
    document.body.classList.toggle("dark-theme");
    if (document.body.classList.contains("dark-theme")) {
        themeToggle.innerHTML = "☀️";
    }else {
        themeToggle.innerHTML = "🌙";
    }
    localStorage.setItem(
        "theme",
        document.body.classList.contains("dark-theme")
            ? "dark"
            : "light"
    );
}

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-theme");
    themeToggle.innerHTML = "☀️";
}

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    // Calculate totals
    let totalExpenses = expenseList.reduce(
        (sum, expense) => sum + expense.amount,
        0
    );
    let remainingBalance = totalSalary - totalExpenses;
    doc.setFontSize(18);
    doc.text("Cash Flow Report", 70, 20);
    doc.setFontSize(12);
    doc.text(`Salary: ₹${totalSalary}`, 20, 40);
    doc.text(`Total Expenses: ₹${totalExpenses}`, 20, 50);
    doc.text(`Remaining Balance: ₹${remainingBalance}`, 20, 60);
    let y = 80;
    doc.text("Expense History", 20, y);
    y += 10;
    expenseList.forEach((expense) => {
        doc.text(
            `${expense.name}: ₹${expense.amount}`,
            20,
            y
        );
        y += 10;
    });
    doc.save("CashFlowReport.pdf");
}

loadData();
document
    .getElementById("resetBtn")
    .addEventListener("click", resetDashboard);
function resetDashboard() {
    totalSalary = 0;
    expenseList = [];
    localStorage.clear();
    renderExpenses();
    updateSummary();
    updateChart();
}