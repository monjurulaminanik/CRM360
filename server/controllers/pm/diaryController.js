const ProjectDiary = require('../../models/pm/ProjectDiary');

const getDiaryEntries = async (req, res, next) => {
  try {
    const query = { project: req.params.id };
    if (req.query.date) {
      const d = new Date(req.query.date);
      query.date = { $gte: new Date(d.setHours(0, 0, 0, 0)), $lt: new Date(d.setHours(23, 59, 59, 999)) };
    }
    const entries = await ProjectDiary.find(query)
      .populate('author', 'name avatar')
      .sort({ date: -1 });
    res.json({ success: true, count: entries.length, data: entries });
  } catch (err) { next(err); }
};

const createDiaryEntry = async (req, res, next) => {
  try {
    req.body.project = req.params.id;
    req.body.tenantId = req.user.tenantId;
    req.body.author = req.user._id;
    if (!req.body.date) req.body.date = new Date();
    const entry = await ProjectDiary.create(req.body);
    await entry.populate('author', 'name avatar');
    res.status(201).json({ success: true, data: entry });
  } catch (err) { next(err); }
};

const updateDiaryEntry = async (req, res, next) => {
  try {
    const entry = await ProjectDiary.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('author', 'name avatar');
    if (!entry) return res.status(404).json({ success: false, message: 'Diary entry not found' });
    res.json({ success: true, data: entry });
  } catch (err) { next(err); }
};

module.exports = { getDiaryEntries, createDiaryEntry, updateDiaryEntry };
