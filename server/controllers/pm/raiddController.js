const RAIDDLog = require('../../models/pm/RAIDDLog');

// GET /api/pm/projects/:id/raidd
const getRAIDD = async (req, res, next) => {
  try {
    const { type, status, owner, priority } = req.query;
    let raidd = await RAIDDLog.findOne({ project: req.params.id })
      .populate('entries.raisedBy', 'name avatar')
      .populate('entries.owner', 'name avatar')
      .populate('entries.decidedBy', 'name avatar');

    if (!raidd) {
      raidd = await RAIDDLog.create({ project: req.params.id, tenantId: req.user.tenantId, entries: [] });
    }

    let entries = raidd.entries || [];
    if (type) entries = entries.filter(e => e.type === type);
    if (status) entries = entries.filter(e => e.status === status);
    if (owner) entries = entries.filter(e => e.owner?._id?.toString() === owner);
    if (priority) entries = entries.filter(e => e.priority === priority);

    // Summary stats
    const stats = {
      total: raidd.entries.length,
      byType: {},
      byStatus: {},
      overdue: 0,
    };
    raidd.entries.forEach(e => {
      stats.byType[e.type] = (stats.byType[e.type] || 0) + 1;
      stats.byStatus[e.status] = (stats.byStatus[e.status] || 0) + 1;
      if (e.targetDate && new Date(e.targetDate) < new Date() && e.status === 'open') stats.overdue++;
    });

    res.json({ success: true, data: entries, stats });
  } catch (err) { next(err); }
};

// POST /api/pm/projects/:id/raidd
const addRAIDDEntry = async (req, res, next) => {
  try {
    let raidd = await RAIDDLog.findOne({ project: req.params.id });
    if (!raidd) {
      raidd = await RAIDDLog.create({ project: req.params.id, tenantId: req.user.tenantId, entries: [] });
    }

    req.body.raisedBy = req.user._id;
    raidd.entries.push(req.body);
    await raidd.save();

    const newEntry = raidd.entries[raidd.entries.length - 1];
    res.status(201).json({ success: true, data: newEntry });
  } catch (err) { next(err); }
};

// PUT /api/pm/raidd/:entryId
const updateRAIDDEntry = async (req, res, next) => {
  try {
    const { entryId } = req.params;
    const raidd = await RAIDDLog.findOne({ 'entries.entryId': entryId });
    if (!raidd) return res.status(404).json({ success: false, message: 'RAIDD entry not found' });

    const entry = raidd.entries.find(e => e.entryId === entryId);
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });

    Object.assign(entry, req.body);
    await raidd.save();

    res.json({ success: true, data: entry });
  } catch (err) { next(err); }
};

// DELETE /api/pm/raidd/:entryId
const deleteRAIDDEntry = async (req, res, next) => {
  try {
    const { entryId } = req.params;
    const raidd = await RAIDDLog.findOne({ 'entries.entryId': entryId });
    if (!raidd) return res.status(404).json({ success: false, message: 'RAIDD entry not found' });

    raidd.entries = raidd.entries.filter(e => e.entryId !== entryId);
    await raidd.save();

    res.json({ success: true, message: 'Entry deleted' });
  } catch (err) { next(err); }
};

module.exports = { getRAIDD, addRAIDDEntry, updateRAIDDEntry, deleteRAIDDEntry };
