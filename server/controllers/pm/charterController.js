const ProjectCharter = require('../../models/pm/ProjectCharter');
const Project = require('../../models/Project');
const { generateCharterPDF } = require('../../utils/pm/generateCharterPDF');

// GET /api/pm/projects/:id/charter
const getCharter = async (req, res, next) => {
  try {
    const charter = await ProjectCharter.findOne({ project: req.params.id })
      .populate('feasibilityStudy.performedBy', 'name')
      .populate('approvedBy', 'name email')
      .populate('stakeholders.userId', 'name email avatar');
    if (!charter) return res.status(404).json({ success: false, message: 'Charter not found' });
    res.json({ success: true, data: charter });
  } catch (err) { next(err); }
};

// PUT /api/pm/projects/:id/charter
const updateCharter = async (req, res, next) => {
  try {
    const charter = await ProjectCharter.findOneAndUpdate(
      { project: req.params.id },
      req.body,
      { new: true, runValidators: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, data: charter });
  } catch (err) { next(err); }
};

// POST /api/pm/projects/:id/charter/submit-for-approval
const submitCharterForApproval = async (req, res, next) => {
  try {
    const charter = await ProjectCharter.findOne({ project: req.params.id });
    if (!charter) return res.status(404).json({ success: false, message: 'Charter not found' });

    if (charter.charterStatus === 'approved' || charter.charterStatus === 'signed') {
      return res.status(400).json({ success: false, message: 'Charter is already approved' });
    }

    charter.charterStatus = 'in-review';
    await charter.save();

    res.json({ success: true, data: charter, message: 'Charter submitted for approval' });
  } catch (err) { next(err); }
};

// POST /api/pm/projects/:id/charter/approve
const approveCharter = async (req, res, next) => {
  try {
    const charter = await ProjectCharter.findOne({ project: req.params.id });
    if (!charter) return res.status(404).json({ success: false, message: 'Charter not found' });

    const { approved, rejectionReason } = req.body;

    if (approved) {
      charter.charterStatus = 'approved';
      charter.approvedBy = req.user._id;
      charter.approvedDate = new Date();
    } else {
      charter.charterStatus = 'rejected';
      charter.rejectionReason = rejectionReason || 'No reason provided';
    }

    await charter.save();

    res.json({
      success: true,
      data: charter,
      message: approved ? 'Charter approved successfully' : 'Charter rejected',
    });
  } catch (err) { next(err); }
};

// GET /api/pm/projects/:id/charter/pdf
const getCharterPDF = async (req, res, next) => {
  try {
    const charter = await ProjectCharter.findOne({ project: req.params.id })
      .populate('approvedBy', 'name');
    if (!charter) return res.status(404).json({ success: false, message: 'Charter not found' });

    const project = await Project.findById(req.params.id)
      .populate('client', 'name company');

    const pdfBuffer = await generateCharterPDF(charter, project);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${project.projectCode}-charter.pdf"`);
    res.send(pdfBuffer);
  } catch (err) { next(err); }
};

module.exports = { getCharter, updateCharter, submitCharterForApproval, approveCharter, getCharterPDF };
