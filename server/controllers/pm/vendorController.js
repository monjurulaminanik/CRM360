const ProjectVendor = require('../../models/pm/ProjectVendor');

const getVendors = async (req, res, next) => {
  try {
    const vendors = await ProjectVendor.find({ project: req.params.id }).sort({ createdAt: -1 });
    res.json({ success: true, count: vendors.length, data: vendors });
  } catch (err) { next(err); }
};

const createVendor = async (req, res, next) => {
  try {
    req.body.project = req.params.id;
    req.body.tenantId = req.user.tenantId;
    const vendor = await ProjectVendor.create(req.body);
    res.status(201).json({ success: true, data: vendor });
  } catch (err) { next(err); }
};

const updateVendor = async (req, res, next) => {
  try {
    const vendor = await ProjectVendor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    res.json({ success: true, data: vendor });
  } catch (err) { next(err); }
};

module.exports = { getVendors, createVendor, updateVendor };
