const Expense = require('../models/Expense');
const ExpenseCategory = require('../models/ExpenseCategory');

const getCategories = async (req, res, next) => {
  try {
    const categories = await ExpenseCategory.find({ tenantId: req.user.tenantId });
    res.json({ success: true, data: categories });
  } catch (err) { next(err); }
};

const createCategory = async (req, res, next) => {
  try {
    req.body.createdBy = req.user._id;
    req.body.tenantId = req.user.tenantId;
    const category = await ExpenseCategory.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (err) { next(err); }
};

const getExpenses = async (req, res, next) => {
  try {
    const { status, categoryId, search, page = 1, limit = 50 } = req.query;
    const query = { tenantId: req.user.tenantId };
    
    if (status) query.status = status;
    if (categoryId) query.categoryId = categoryId;
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const expenses = await Expense.find(query)
      .populate('categoryId', 'name')
      .populate('submittedBy', 'name avatar')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
      
    res.json({ success: true, count: expenses.length, data: expenses });
  } catch (err) { next(err); }
};

const getExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, tenantId: req.user.tenantId })
      .populate('categoryId', 'name')
      .populate('submittedBy', 'name email avatar')
      .populate('approvedBy', 'name');
      
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, data: expense });
  } catch (err) { next(err); }
};

const createExpense = async (req, res, next) => {
  try {
    req.body.submittedBy = req.user._id;
    req.body.tenantId = req.user.tenantId;
    const expense = await Expense.create(req.body);
    await expense.populate('categoryId', 'name');
    res.status(201).json({ success: true, data: expense });
  } catch (err) { next(err); }
};

const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      req.body,
      { new: true, runValidators: true }
    ).populate('categoryId', 'name');
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, data: expense });
  } catch (err) { next(err); }
};

const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, message: 'Expense deleted' });
  } catch (err) { next(err); }
};

module.exports = { getCategories, createCategory, getExpenses, getExpense, createExpense, updateExpense, deleteExpense };
