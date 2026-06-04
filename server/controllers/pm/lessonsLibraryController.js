const ProjectLessonsLearned = require('../../models/pm/ProjectLessonsLearned');

// GET /api/pm/lessons
const searchLessons = async (req, res, next) => {
  try {
    const { category, search, projectType } = req.query;
    const query = { tenantId: req.user.tenantId, visibleInLibrary: true };

    const lessons = await ProjectLessonsLearned.find(query)
      .populate('project', 'name projectCode projectType')
      .populate('lessons.capturedBy', 'name')
      .sort({ captureDate: -1 });

    let allLessons = [];
    lessons.forEach(ll => {
      (ll.lessons || []).forEach(l => {
        if (category && l.category !== category) return;
        if (search && !l.description?.toLowerCase().includes(search.toLowerCase())) return;
        if (projectType && ll.project?.projectType !== projectType) return;
        allLessons.push({
          ...l.toObject(),
          projectName: ll.project?.name,
          projectCode: ll.project?.projectCode,
          projectType: ll.project?.projectType,
          captureDate: ll.captureDate,
        });
      });
    });

    res.json({ success: true, count: allLessons.length, data: allLessons });
  } catch (err) { next(err); }
};

// GET /api/pm/lessons/categories
const getLessonCategories = async (req, res, next) => {
  try {
    const categories = [
      'process', 'people', 'tools', 'vendors', 'communication',
      'estimation', 'risk', 'quality', 'stakeholder',
    ];
    res.json({ success: true, data: categories });
  } catch (err) { next(err); }
};

module.exports = { searchLessons, getLessonCategories };
