const Project = require('../../models/Project');

/**
 * Generate the next project code in sequence: DIT-PRJ-001, DIT-PRJ-002, etc.
 * This is also handled by the Project model pre-save hook, but this utility
 * can be used for preview/display before creation.
 */
const generateProjectCode = async () => {
  const mongoose = require('mongoose');
  const Counter = mongoose.model('Counter');

  const counter = await Counter.findByIdAndUpdate(
    'projectCode',
    { $inc: { seq: 0 } }, // Just read, don't increment
    { new: true, upsert: true }
  );

  const nextSeq = (counter.seq || 0) + 1;
  return `DIT-PRJ-${String(nextSeq).padStart(3, '0')}`;
};

module.exports = { generateProjectCode };
