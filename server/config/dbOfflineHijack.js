const mongoose = require('mongoose');
const { dbState } = require('./db');
const dbJson = require('./dbJson');

const hijackModel = (modelName, jsonCollection) => {
  try {
    const Model = mongoose.model(modelName);

    Model.find = function(query) {
      return jsonCollection.find(query);
    };
    Model.findOne = function(query) {
      return jsonCollection.findOne(query);
    };
    Model.findById = function(id) {
      return jsonCollection.findById(id);
    };
    Model.create = function(doc) {
      return jsonCollection.create(doc);
    };
    Model.findByIdAndUpdate = function(id, update, options) {
      return jsonCollection.findByIdAndUpdate(id, update, options);
    };
    Model.findByIdAndDelete = function(id) {
      return jsonCollection.findByIdAndDelete(id);
    };
    Model.findOneAndUpdate = function(query, update, options) {
      const id = query._id;
      return jsonCollection.findByIdAndUpdate(id, update, options);
    };
    Model.findOneAndDelete = function(query) {
      const id = query._id;
      return jsonCollection.findByIdAndDelete(id);
    };
    Model.countDocuments = function(query) {
      return jsonCollection.countDocuments(query);
    };
    Model.aggregate = function(pipeline) {
      return jsonCollection.aggregate(pipeline);
    };
    console.log(`Successfully hijacked Mongoose model '${modelName}'`);
  } catch (err) {
    console.error(`Failed to hijack model '${modelName}':`, err.message);
  }
};

const hijackAll = () => {
  if (!dbState.isOffline) return;
  console.log('Hijacking Mongoose models for offline JSON database mode...');
  hijackModel('User', dbJson.users);
  hijackModel('Lead', dbJson.leads);
  hijackModel('Client', dbJson.clients);
  hijackModel('Campaign', dbJson.campaigns);
  hijackModel('WhatsAppMessage', dbJson.whatsappmessages);
  hijackModel('FacebookMessage', dbJson.facebookmessages);
  hijackModel('ClientNote', dbJson.clientnotes);
  hijackModel('LeadNote', dbJson.leadnotes);
  hijackModel('Tenant', dbJson.tenants);
  hijackModel('Task', dbJson.tasks);
  hijackModel('Expense', dbJson.expenses);
  hijackModel('ExpenseCategory', dbJson.expensecategories);
  hijackModel('Invoice', dbJson.invoices);
  hijackModel('Payment', dbJson.payments);
  hijackModel('Project', dbJson.projects);
  hijackModel('TimeLog', dbJson.timelogs);
  
  // HR Module Models Hijack
  hijackModel('Employee', dbJson.employees);
  hijackModel('Department', dbJson.departments);
  hijackModel('Designation', dbJson.designations);
  hijackModel('Attendance', dbJson.attendances);
  hijackModel('LeaveType', dbJson.leavetypes);
  hijackModel('Leave', dbJson.leaves);
  hijackModel('LeaveBalance', dbJson.leavebalances);
  hijackModel('Holiday', dbJson.holidays);
  hijackModel('Shift', dbJson.shifts);
  hijackModel('SalaryStructure', dbJson.salarystructures);
  hijackModel('Payroll', dbJson.payrolls);
  hijackModel('Appraisal', dbJson.appraisals);
};

module.exports = hijackAll;
