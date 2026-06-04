const ProjectMilestone = require('../../models/pm/ProjectMilestone');
const Project = require('../../models/Project');
const { syncMilestoneToInvoice } = require('../../utils/pm/syncMilestoneToInvoice');

const getMilestones = async (req, res, next) => {
  try {
    const milestones = await ProjectMilestone.find({ project: req.params.id })
      .populate('relatedTasks', 'name taskCode status')
      .populate('approvedBy', 'name')
      .populate('invoiceId')
      .sort({ targetDate: 1 });
    res.json({ success: true, count: milestones.length, data: milestones });
  } catch (err) { next(err); }
};

const createMilestone = async (req, res, next) => {
  try {
    req.body.project = req.params.id;
    req.body.tenantId = req.user.tenantId;
    req.body.createdBy = req.user._id;
    const milestone = await ProjectMilestone.create(req.body);
    res.status(201).json({ success: true, data: milestone });
  } catch (err) { next(err); }
};

const achieveMilestone = async (req, res, next) => {
  try {
    const milestone = await ProjectMilestone.findById(req.params.id);
    if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found' });

    milestone.status = 'achieved';
    milestone.actualDate = new Date();
    milestone.approvedBy = req.user._id;
    milestone.approvedDate = new Date();

    // Trigger invoice if payment-linked
    if (milestone.paymentTrigger && !milestone.invoiceId) {
      const project = await Project.findById(milestone.project);
      const invoice = await syncMilestoneToInvoice(milestone, project, req.user);
      if (invoice) {
        milestone.invoiceId = invoice._id;
        milestone.billedAt = new Date();
        // Link invoice to project
        await Project.updateOne({ _id: milestone.project }, { $addToSet: { linkedInvoices: invoice._id } });
      }
    }

    await milestone.save();
    res.json({ success: true, data: milestone, message: 'Milestone achieved!' });
  } catch (err) { next(err); }
};

module.exports = { getMilestones, createMilestone, achieveMilestone };
