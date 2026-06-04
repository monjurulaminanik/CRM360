const Invoice = require('../../models/Invoice');

/**
 * When a milestone with paymentTrigger=true is achieved,
 * create/update an invoice line item for the linked project.
 *
 * @param {Object} milestone - The achieved ProjectMilestone document
 * @param {Object} project - The parent Project document
 * @param {Object} user - The user who triggered this
 */
const syncMilestoneToInvoice = async (milestone, project, user) => {
  if (!milestone.paymentTrigger) return null;

  const paymentAmount = milestone.paymentAmount ||
    (milestone.paymentPercent && project.estimatedBudget
      ? (project.estimatedBudget * milestone.paymentPercent / 100)
      : 0);

  if (paymentAmount <= 0) return null;

  // Check if invoice already exists for this milestone
  if (milestone.invoiceId) {
    return null; // Already billed
  }

  try {
    // Generate invoice number
    const lastInvoice = await Invoice.findOne({ tenantId: project.tenantId })
      .sort({ createdAt: -1 })
      .select('invoiceNumber');

    let nextNum = 1;
    if (lastInvoice?.invoiceNumber) {
      const match = lastInvoice.invoiceNumber.match(/(\d+)$/);
      if (match) nextNum = parseInt(match[1]) + 1;
    }
    const invoiceNumber = `INV-${String(nextNum).padStart(4, '0')}`;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 15); // 15-day payment terms

    const invoice = await Invoice.create({
      tenantId: project.tenantId,
      invoiceNumber,
      clientId: project.client,
      issueDate: new Date(),
      dueDate,
      amount: paymentAmount,
      currency: project.currency || 'BDT',
      status: 'pending',
      lineItems: [{
        description: `Milestone: ${milestone.name} — Project: ${project.name} (${project.projectCode})`,
        quantity: 1,
        rate: paymentAmount,
        amount: paymentAmount,
      }],
      notes: `Auto-generated from project milestone achievement.\nProject: ${project.projectCode}\nMilestone: ${milestone.name}`,
      createdBy: user._id,
    });

    return invoice;
  } catch (err) {
    console.error('Failed to sync milestone to invoice:', err);
    return null;
  }
};

module.exports = { syncMilestoneToInvoice };
