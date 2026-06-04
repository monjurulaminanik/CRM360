const ProjectBudget = require('../../models/pm/ProjectBudget');
const ProjectExpense = require('../../models/pm/ProjectExpense');
const { calculateEVM, calculatePercentScheduled } = require('../../utils/pm/calculateEVM');
const Project = require('../../models/Project');

// GET /api/pm/projects/:id/budget
const getBudget = async (req, res, next) => {
  try {
    let budget = await ProjectBudget.findOne({ project: req.params.id });
    if (!budget) {
      budget = await ProjectBudget.create({ project: req.params.id, tenantId: req.user.tenantId });
    }
    res.json({ success: true, data: budget });
  } catch (err) { next(err); }
};

// PUT /api/pm/projects/:id/budget
const updateBudget = async (req, res, next) => {
  try {
    const budget = await ProjectBudget.findOneAndUpdate(
      { project: req.params.id },
      req.body,
      { new: true, runValidators: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, data: budget });
  } catch (err) { next(err); }
};

// GET /api/pm/projects/:id/budget/evm
const getEVM = async (req, res, next) => {
  try {
    const budget = await ProjectBudget.findOne({ project: req.params.id });
    if (!budget) return res.status(404).json({ success: false, message: 'Budget not found' });

    const project = await Project.findById(req.params.id);
    const percentScheduled = calculatePercentScheduled(project.startDate, project.targetEndDate);

    const evmData = calculateEVM({
      bac: budget.earnedValueData?.bac || budget.totalBudget,
      percentComplete: project.progressPercent || 0,
      percentScheduled,
      actualCost: budget.totalActual || 0,
    });

    // Save EVM data
    budget.earnedValueData = { ...budget.earnedValueData, ...evmData };
    budget.budgetHealth = evmData.healthStatus;
    await budget.save();

    res.json({ success: true, data: evmData });
  } catch (err) { next(err); }
};

// POST /api/pm/projects/:id/expenses
const createExpense = async (req, res, next) => {
  try {
    req.body.project = req.params.id;
    req.body.tenantId = req.user.tenantId;
    req.body.submittedBy = req.user._id;

    const expense = await ProjectExpense.create(req.body);

    // Update budget actuals
    const budget = await ProjectBudget.findOne({ project: req.params.id });
    if (budget) {
      const cat = budget.categories.find(c => c.name.toLowerCase() === expense.category);
      if (cat) {
        cat.actualAmount = (cat.actualAmount || 0) + expense.amount;
        await budget.save();
      }
    }

    // Update project actual spent
    await Project.updateOne(
      { _id: req.params.id },
      { $inc: { actualSpent: expense.amount } }
    );

    res.status(201).json({ success: true, data: expense });
  } catch (err) { next(err); }
};

// GET /api/pm/projects/:id/expenses
const getExpenses = async (req, res, next) => {
  try {
    const { category, status } = req.query;
    const query = { project: req.params.id };
    if (category) query.category = category;
    if (status) query.approvalStatus = status;

    const expenses = await ProjectExpense.find(query)
      .populate('submittedBy', 'name avatar')
      .populate('approvedBy', 'name')
      .sort({ date: -1 });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    res.json({ success: true, count: expenses.length, total, data: expenses });
  } catch (err) { next(err); }
};

module.exports = { getBudget, updateBudget, getEVM, createExpense, getExpenses };
