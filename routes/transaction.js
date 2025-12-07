const express = require('express');
const router = express.Router();
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Item = require('../models/Item');

// ----------------- 수입 -----------------
router.get('/income/:userId', async (req, res) => {
  try {
    const incomes = await Income.findAll({ where: { user_id: req.params.userId } });
    res.json(incomes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/income', async (req, res) => {
  try {
    const { user_id, category_id, amount, income_date, note } = req.body;
    const newIncome = await Income.create({ user_id, category_id, amount, income_date, note });
    res.json(newIncome);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------- 지출 -----------------
router.get('/expense/:userId', async (req, res) => {
  try {
    const expenses = await Expense.findAll({ where: { user_id: req.params.userId } });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/expense', async (req, res) => {
  try {
    const { user_id, category_id, amount, expense_date, note } = req.body;
    const newExpense = await Expense.create({ user_id, category_id, amount, expense_date, note });
    res.json(newExpense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------- 아이템 -----------------
router.get('/item/:userId', async (req, res) => {
  try {
    const items = await Item.findAll({ where: { user_id: req.params.userId } });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/item', async (req, res) => {
  try {
    const { user_id, category_id, name, price, purchase_date, quantity, expiration_date } = req.body;
    const newItem = await Item.create({ user_id, category_id, name, price, purchase_date, quantity, expiration_date });
    res.json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
