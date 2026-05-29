const Job = require('../models/hr/Job');
const Candidate = require('../models/hr/Candidate');

// --- Jobs ---
const getJobs = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;
    const query = { tenantId: req.user.tenantId };
    
    if (status) query.status = status;
    if (search) query.title = { $regex: search, $options: 'i' };

    const jobs = await Job.find(query)
      .populate('department', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
      
    res.json({ success: true, count: jobs.length, data: jobs });
  } catch (err) { next(err); }
};

const createJob = async (req, res, next) => {
  try {
    req.body.createdBy = req.user._id;
    req.body.tenantId = req.user.tenantId;
    const job = await Job.create(req.body);
    res.status(201).json({ success: true, data: job });
  } catch (err) { next(err); }
};

const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, data: job });
  } catch (err) { next(err); }
};

const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    // Cleanup candidates
    await Candidate.deleteMany({ jobId: req.params.id });
    res.json({ success: true, message: 'Job deleted' });
  } catch (err) { next(err); }
};

// --- Candidates ---
const getCandidates = async (req, res, next) => {
  try {
    const { jobId, status } = req.query;
    const query = { tenantId: req.user.tenantId };
    if (jobId) query.jobId = jobId;
    if (status) query.status = status;

    const candidates = await Candidate.find(query)
      .populate('jobId', 'title')
      .sort({ appliedAt: -1 });
      
    res.json({ success: true, count: candidates.length, data: candidates });
  } catch (err) { next(err); }
};

const addCandidate = async (req, res, next) => {
  try {
    req.body.tenantId = req.user.tenantId;
    const candidate = await Candidate.create(req.body);
    await candidate.populate('jobId', 'title');
    res.status(201).json({ success: true, data: candidate });
  } catch (err) { next(err); }
};

const updateCandidateStatus = async (req, res, next) => {
  try {
    const candidate = await Candidate.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      { status: req.body.status },
      { new: true }
    );
    if (!candidate) return res.status(404).json({ success: false, message: 'Candidate not found' });
    res.json({ success: true, data: candidate });
  } catch (err) { next(err); }
};

const deleteCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.findOneAndDelete({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!candidate) return res.status(404).json({ success: false, message: 'Candidate not found' });
    res.json({ success: true, message: 'Candidate deleted' });
  } catch (err) { next(err); }
};

module.exports = { getJobs, createJob, updateJob, deleteJob, getCandidates, addCandidate, updateCandidateStatus, deleteCandidate };
