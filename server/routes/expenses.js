const express = require('express');
const router = express.Router();
const { getCategories, createCategory, getExpenses, getExpense, createExpense, updateExpense, deleteExpense } = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/categories', getCategories);
router.post('/categories', createCategory);

router.get('/', getExpenses);
router.get('/:id', getExpense);
router.post('/', createExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
