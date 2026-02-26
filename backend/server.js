// backend/server.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
console.log("Connecting to Atlas...");
mongoose.connect(
  "mongodb+srv://niyaaniyan6767_db_user:N22012005@expense-cluster.14dwk5n.mongodb.net/expenseDB?retryWrites=true&w=majority")
  .then(() => {
      console.log("MongoDB Connected");
      app.listen(5000, () => {
          console.log("Server running on port 5000");
      });
  })
  .catch(err => {
      console.log("Mongo Error:", err);
  });

// Schema
const expenseSchema = new mongoose.Schema({
    name: String,
    amount: Number,
    date: String,
    category: String
});

const Expense = mongoose.model("Expense", expenseSchema);

// POST /expenses
app.post("/expenses", async (req, res) => {
    try {
        console.log("Received:", req.body);

        const expense = new Expense(req.body);
        await expense.save();

        console.log("Saved to DB");

        res.json(expense);
    } catch (error) {
        console.error("Error saving:", error);
        res.status(500).json({ error: "Failed to save" });
    }
});

// GET /expenses
app.get("/expenses", async (req, res) => {
    const expenses = await Expense.find();
    res.json(expenses);
});

// DELETE /expenses/:id
app.delete("/expenses/:id", async (req, res) => {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
});

