const ProjectMeeting = require('../../models/pm/ProjectMeeting');

const getMeetings = async (req, res, next) => {
  try {
    const { type } = req.query;
    const query = { project: req.params.id };
    if (type) query.type = type;
    const meetings = await ProjectMeeting.find(query)
      .populate('attendees', 'name avatar')
      .populate('actionItems.owner', 'name avatar')
      .populate('createdBy', 'name')
      .sort({ date: -1 });
    res.json({ success: true, count: meetings.length, data: meetings });
  } catch (err) { next(err); }
};

const createMeeting = async (req, res, next) => {
  try {
    req.body.project = req.params.id;
    req.body.tenantId = req.user.tenantId;
    req.body.createdBy = req.user._id;
    const meeting = await ProjectMeeting.create(req.body);
    await meeting.populate('attendees', 'name avatar');
    res.status(201).json({ success: true, data: meeting });
  } catch (err) { next(err); }
};

const updateMeeting = async (req, res, next) => {
  try {
    const meeting = await ProjectMeeting.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('attendees', 'name avatar')
      .populate('actionItems.owner', 'name avatar');
    if (!meeting) return res.status(404).json({ success: false, message: 'Meeting not found' });
    res.json({ success: true, data: meeting });
  } catch (err) { next(err); }
};

const addMinutes = async (req, res, next) => {
  try {
    const meeting = await ProjectMeeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ success: false, message: 'Meeting not found' });
    meeting.minutes = req.body.minutes;
    if (req.body.actionItems) meeting.actionItems.push(...req.body.actionItems);
    if (req.body.decisionsMade) meeting.decisionsMade.push(...req.body.decisionsMade);
    if (req.body.nextMeetingDate) meeting.nextMeetingDate = req.body.nextMeetingDate;
    await meeting.save();
    res.json({ success: true, data: meeting });
  } catch (err) { next(err); }
};

module.exports = { getMeetings, createMeeting, updateMeeting, addMinutes };
