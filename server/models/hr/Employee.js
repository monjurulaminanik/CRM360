const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
      sparse: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    alternatePhone: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    maritalStatus: {
      type: String,
      enum: ['single', 'married', 'widowed', 'divorced'],
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    nationalId: {
      type: String,
      trim: true,
    },
    passport: {
      type: String,
      trim: true,
    },
    presentAddress: {
      type: String,
      required: true,
    },
    permanentAddress: {
      type: String,
    },
    emergencyContactName: {
      type: String,
      required: true,
    },
    emergencyContactPhone: {
      type: String,
      required: true,
    },
    emergencyContactRelation: {
      type: String,
      required: true,
    },
    profilePhoto: {
      type: String,
    },
    designation: {
      type: String, // Storing designation title for convenience or ref
    },
    designationRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Designation',
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    reportingTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    },
    joiningDate: {
      type: Date,
      required: true,
    },
    probationEndDate: {
      type: Date,
    },
    confirmationDate: {
      type: Date,
    },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'intern'],
      default: 'full-time',
    },
    workLocation: {
      type: String,
      enum: ['office', 'remote', 'hybrid'],
      default: 'office',
    },
    shift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shift',
    },
    status: {
      type: String,
      enum: ['active', 'on-leave', 'terminated', 'resigned'],
      default: 'active',
    },
    exitDate: {
      type: Date,
    },
    exitReason: {
      type: String,
    },
    bankName: {
      type: String,
    },
    bankAccountNumber: {
      type: String,
    },
    bankBranch: {
      type: String,
    },
    routingNumber: {
      type: String,
    },
    mobileBanking: {
      bkash: String,
      nagad: String,
      rocket: String,
    },
    documents: [
      {
        name: String,
        type: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    skills: [{ type: String, trim: true }],
    notes: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for fullName
EmployeeSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

EmployeeSchema.index({ employeeId: 1 });
EmployeeSchema.index({ email: 1 });
EmployeeSchema.index({ department: 1 });
EmployeeSchema.index({ status: 1 });

module.exports = mongoose.model('Employee', EmployeeSchema);
