const ProjectClosure = require('../../models/pm/ProjectClosure');
const ProjectLessonsLearned = require('../../models/pm/ProjectLessonsLearned');
const Project = require('../../models/Project');
const { generateClosureReportPDF } = require('../../utils/pm/generateClosureReportPDF');

const getClosure = async (req, res, next) => {
  try {
    let closure = await ProjectClosure.findOne({ project: req.params.id })
      .populate('lessonsLearned');
    if (!closure) closure = {};
    res.json({ success: true, data: closure });
  } catch (err) { next(err); }
};

const initiateClosure = async (req, res, next) => {
  try {
    let closure = await ProjectClosure.findOne({ project: req.params.id });
    if (closure) return res.status(400).json({ success: false, message: 'Closure already initiated' });

    const project = await Project.findById(req.params.id);
    closure = await ProjectClosure.create({
      project: req.params.id,
      tenantId: req.user.tenantId,
      closureType: req.body.closureType || 'successful',
      financialClosure: {
        finalBudget: project.estimatedBudget,
        finalSpent: project.actualSpent,
        variance: (project.estimatedBudget || 0) - (project.actualSpent || 0),
      },
    });
    res.status(201).json({ success: true, data: closure });
  } catch (err) { next(err); }
};

const signOff = async (req, res, next) => {
  try {
    const closure = await ProjectClosure.findOne({ project: req.params.id });
    if (!closure) return res.status(404).json({ success: false, message: 'Closure not initiated' });
    Object.assign(closure.signOff, req.body);
    await closure.save();
    res.json({ success: true, data: closure });
  } catch (err) { next(err); }
};

const captureeLessonsLearned = async (req, res, next) => {
  try {
    req.body.project = req.params.id;
    req.body.tenantId = req.user.tenantId;
    const lessons = await ProjectLessonsLearned.create(req.body);

    // Link to closure
    await ProjectClosure.updateOne({ project: req.params.id }, { lessonsLearned: lessons._id });

    res.status(201).json({ success: true, data: lessons });
  } catch (err) { next(err); }
};

const finalizeClosure = async (req, res, next) => {
  try {
    const closure = await ProjectClosure.findOne({ project: req.params.id });
    if (!closure) return res.status(404).json({ success: false, message: 'Closure not initiated' });

    // Update project to completed
    await Project.updateOne(
      { _id: req.params.id },
      {
        currentPhase: 'closure',
        overallStatus: 'completed',
        actualEndDate: new Date(),
      }
    );

    res.json({ success: true, data: closure, message: 'Project closed successfully!' });
  } catch (err) { next(err); }
};

const getFinalReportPDF = async (req, res, next) => {
  try {
    const closure = await ProjectClosure.findOne({ project: req.params.id });
    if (!closure) return res.status(404).json({ success: false, message: 'Closure not found' });

    const project = await Project.findById(req.params.id).populate('client', 'name company');
    const lessons = await ProjectLessonsLearned.findOne({ project: req.params.id });

    const pdfBuffer = await generateClosureReportPDF(closure, project, lessons);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${project.projectCode}-closure-report.pdf"`);
    res.send(pdfBuffer);
  } catch (err) { next(err); }
};

module.exports = { getClosure, initiateClosure, signOff, captureeLessonsLearned, finalizeClosure, getFinalReportPDF };
