import React, { useState, useEffect } from 'react';
import { 
  Clock, Calendar, DollarSign, Award, ShieldAlert,
  Play, Square, RefreshCw, LogOut, FileText, CheckCircle2,
  Building, MapPin, Briefcase, Download, Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { hrService } from '../services/hrService';
import { useAuthStore } from '../store/authStore';

export default function EmployeeDashboardPage() {
  const { user } = useAuthStore();

  // Employee details and logs state
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [attendanceToday, setAttendanceToday] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [appraisals, setAppraisals] = useState([]);

  // States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(localStorage.getItem('isCheckedIn') === 'true');
  const [checkInTime, setCheckInTime] = useState(localStorage.getItem('checkInTime') || '');
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Form states for leave application
  const [showApplyLeaveModal, setShowApplyLeaveModal] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Clock ticking
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Elapsed time tracker
  useEffect(() => {
    let timer;
    if (isCheckedIn && checkInTime) {
      const updateTimer = () => {
        const start = new Date(checkInTime);
        const now = new Date();
        const diff = now - start;
        const hrs = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const mins = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        const secs = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        setElapsedTime(`${hrs}:${mins}:${secs}`);
      };
      updateTimer();
      timer = setInterval(updateTimer, 1000);
    } else {
      setElapsedTime('00:00:00');
    }
    return () => clearInterval(timer);
  }, [isCheckedIn, checkInTime]);

  const loadEmployeeData = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      // 1. Get employee profile details matching logged-in user email
      const empRes = await hrService.getEmployees({});
      if (empRes.data.success) {
        const myEmp = empRes.data.data.find(emp => emp.email === user.email);
        if (myEmp) {
          setEmployeeDetails(myEmp);
          
          // 2. Fetch leave balance
          const balRes = await hrService.getLeaveBalances(myEmp._id);
          if (balRes.data.success) setLeaveBalances(balRes.data.data);
        }
      }

      // 3. Fetch attendance history
      const attRes = await hrService.getAttendanceHistory({});
      if (attRes.data.success) {
        // filter for current employee
        const myAtt = attRes.data.data.filter(log => log.employee?.email === user.email);
        setAttendanceToday(myAtt);
      }

      // 4. Fetch leaves applied
      const leavesRes = await hrService.getLeaves({});
      if (leavesRes.data.success) {
        const myLeaves = leavesRes.data.data.filter(l => l.employee?.email === user.email);
        setLeaves(myLeaves);
      }

      // 5. Fetch leave types
      const typesRes = await hrService.getLeaveTypes();
      if (typesRes.data.success) {
        setLeaveTypes(typesRes.data.data);
        if (typesRes.data.data.length > 0) setSelectedLeaveType(typesRes.data.data[0]._id);
      }

      // 6. Fetch payroll records
      const payrollRes = await hrService.getPayrollRecords({});
      if (payrollRes.data.success) {
        const myPayrolls = payrollRes.data.data.filter(p => p.employee?.email === user.email);
        setPayrollRecords(myPayrolls);
      }

      // 7. Fetch performance reviews
      const appraisalsRes = await hrService.getAppraisals({});
      if (appraisalsRes.data.success) {
        const myAppraisals = appraisalsRes.data.data.filter(a => a.employee?.email === user.email);
        setAppraisals(myAppraisals);
      }

    } catch (err) {
      console.error('Failed to load employee portal logs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      loadEmployeeData();
    }
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadEmployeeData(false);
  };

  // Clock-in
  const handleClockIn = async () => {
    try {
      const res = await hrService.checkIn(undefined);
      if (res.data.success) {
        const now = new Date().toISOString();
        localStorage.setItem('isCheckedIn', 'true');
        localStorage.setItem('checkInTime', now);
        setIsCheckedIn(true);
        setCheckInTime(now);
        toast.success('Shift started! Checked-in successfully.');
        loadEmployeeData(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in command failed.');
    }
  };

  // Clock-out
  const handleClockOut = async () => {
    try {
      const res = await hrService.checkOut(undefined);
      if (res.data.success) {
        localStorage.removeItem('isCheckedIn');
        localStorage.removeItem('checkInTime');
        setIsCheckedIn(false);
        setCheckInTime('');
        toast.success(`Checked out! Shift worked: ${elapsedTime}`);
        loadEmployeeData(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-out command failed.');
    }
  };

  // Apply Leave
  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) {
      toast.error('Please specify dates and reason.');
      return;
    }

    try {
      toast.loading('Submitting leave application...', { id: 'leave' });
      const payload = {
        leaveType: selectedLeaveType,
        startDate,
        endDate,
        reason
      };
      const res = await hrService.applyLeave(payload);
      if (res.data.success) {
        toast.success('Leave request submitted to HR manager!', { id: 'leave' });
        setShowApplyLeaveModal(false);
        setReason('');
        loadEmployeeData(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit leave request.', { id: 'leave' });
    }
  };

  // Payslip Download PDF
  const handleDownloadPayslip = async (id, m, y) => {
    try {
      toast.loading('Compiling payslip and downloading PDF...', { id: 'pdf' });
      const response = await api.get(`/hr/payroll/${id}/payslip`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `payslip-${user.name.replace(/\s+/g, '')}-${m}-${y}.pdf`;
      link.click();
      toast.success('Payslip downloaded!', { id: 'pdf' });
    } catch (err) {
      toast.error('Failed to compile payslip PDF.', { id: 'pdf' });
    }
  };

  return (
    <div className="page-container animate-fade-in font-sans space-y-6 pb-12">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-800 to-indigo-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-heading font-black leading-none text-white">Welcome back, {user?.name}!</h2>
          <p className="text-xs text-indigo-200 mt-1">Here is your live employee shift command cockpit.</p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button 
            onClick={handleRefresh} 
            disabled={refreshing}
            className="btn-secondary p-0 w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 hover:bg-white/20 border-none text-white"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <span className="bg-indigo-600 border border-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm flex items-center">
            {employeeDetails?.employmentType || 'Full-time'} Employee
          </span>
        </div>
      </div>

      {/* Overview Dashboard columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Shift Command + History */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Shift clock widget */}
          <div className="card bg-white p-5 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="text-center py-4 border-r border-slate-50">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Current Time</span>
              <h1 className="text-3xl font-heading font-extrabold text-slate-800 tracking-tight leading-none mt-2">
                {currentTime}
              </h1>

              {isCheckedIn && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 mt-4 space-y-0.5 animate-slide-down">
                  <span className="text-[9px] uppercase font-black text-indigo-400 tracking-wider">Shift Running</span>
                  <h2 className="text-xl font-black text-primary font-heading tracking-widest leading-none mt-1">{elapsedTime}</h2>
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Operational Clock In</h4>
                <p className="text-[10px] text-slate-400 mt-1">Start your work hours logging for your assigned shift: {employeeDetails?.shift?.name || 'Morning Shift'}.</p>
              </div>

              <div>
                {isCheckedIn ? (
                  <button
                    onClick={handleClockOut}
                    className="w-full btn-primary bg-red-500 hover:bg-red-600 h-9.5 text-xs font-semibold gap-2 shadow-sm rounded-xl"
                  >
                    <Square size={13} className="fill-white" /> Clock Out Shift
                  </button>
                ) : (
                  <button
                    onClick={handleClockIn}
                    className="w-full btn-primary h-9.5 text-xs font-semibold gap-2 shadow-sm rounded-xl"
                  >
                    <Play size={13} className="fill-white animate-pulse" /> Clock In Shift
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Attendance History */}
          <div className="card bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-50 pb-2">
              My Attendance Logs (MERN Synced)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-150">
                    <th className="p-3">Date</th>
                    <th className="p-3">Shift Logged</th>
                    <th className="p-3">Check In</th>
                    <th className="p-3">Check Out</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendanceToday.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-semibold text-slate-800">
                        {new Date(log.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="p-3 text-slate-500 font-medium">{log.shift?.name || 'Morning Shift'}</td>
                      <td className="p-3 text-slate-500 font-mono">
                        {log.checkIn ? new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="p-3 text-slate-500 font-mono">
                        {log.checkOut ? new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active'}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`inline-block text-[9px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                          log.status === 'present' 
                            ? 'bg-green-50 text-green-600 border-green-100'
                            : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {attendanceToday.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center p-8 text-slate-400 font-medium">
                        No check-in records found for this period. Click "Clock In Shift" to log your first work hour!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Leave Balance + Actions */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="card bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-primary font-black text-base shadow-sm shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-800 leading-tight">{user.name}</h4>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">{employeeDetails?.department?.name || 'Operations'} · {employeeDetails?.employeeId || 'EMP-...'}</p>
            </div>
          </div>

          {/* Time Off Balance */}
          <div className="card bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-50 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Time-off Ledger
              </h3>
              <button
                onClick={() => setShowApplyLeaveModal(true)}
                className="text-[10px] font-bold text-primary bg-primary-light hover:bg-primary hover:text-white border border-primary/10 rounded-lg px-2.5 py-1 transition-all"
              >
                + Request Leave
              </button>
            </div>

            {/* Leave type items list */}
            <div className="space-y-2">
              {leaveBalances.map((bal) => (
                <div key={bal._id} className="flex justify-between items-center text-xs p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <div>
                    <p className="font-bold text-slate-800">{bal.leaveType?.name || 'Leave'}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Allocated: {bal.leaveType?.daysAllowedPerYear} days</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-800">{bal.daysAllowed - bal.daysUsed}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Remaining</p>
                  </div>
                </div>
              ))}
              {leaveBalances.length === 0 && (
                <div className="text-center p-4 text-slate-400">
                  Loading allocations...
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* SECONDARY ROW: Payroll Ledger + Appraisal Review */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Payroll Ledger */}
        <div className="card bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-50 pb-2">
            My Salary Ledger & BDT Payslips
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-150">
                  <th className="p-3">Cycle Month</th>
                  <th className="p-3">Salary Paid</th>
                  <th className="p-3">Tax Deduction</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Payslip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payrollRecords.map((pay) => (
                  <tr key={pay._id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-800">
                      {pay.month}/{pay.year}
                    </td>
                    <td className="p-3 text-slate-600 font-bold font-mono">
                      ৳{pay.netSalary.toLocaleString()} BDT
                    </td>
                    <td className="p-3 text-slate-400 font-mono">
                      ৳{pay.taxDeducted.toLocaleString()} BDT
                    </td>
                    <td className="p-3 text-center">
                      <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                        pay.status === 'paid'
                          ? 'bg-green-50 text-green-600 border-green-100'
                          : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {pay.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {pay.status === 'paid' ? (
                        <button
                          onClick={() => handleDownloadPayslip(pay._id, pay.month, pay.year)}
                          className="p-1 rounded-lg text-slate-500 hover:text-primary hover:bg-slate-50 transition-colors"
                          title="Download Payslip PDF"
                        >
                          <Download size={14} />
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-300 font-medium">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
                {payrollRecords.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center p-8 text-slate-400 font-medium">
                      No payroll records generated yet for this account workspace.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Performance Appraisal */}
        <div className="card bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-50 pb-2">
            My Performance Appraisals & Scorecards
          </h3>

          <div className="space-y-4">
            {appraisals.map((app) => (
              <div key={app._id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Review Period Scorecard</h4>
                    <p className="text-[9px] text-slate-400 mt-0.5">Period: {new Date(app.reviewPeriodStart).toLocaleDateString()} to {new Date(app.reviewPeriodEnd).toLocaleDateString()}</p>
                  </div>
                  <span className="bg-indigo-50 border border-indigo-100 text-primary font-black text-xs px-2.5 py-1 rounded-xl">
                    Score: {app.reviewerRating}/5
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                  <div className="bg-white p-2.5 border border-slate-100 rounded-xl space-y-1">
                    <span className="font-bold text-slate-400 block uppercase tracking-wide">Strengths Identified</span>
                    <p className="text-slate-600 leading-normal">{app.strengths}</p>
                  </div>
                  <div className="bg-white p-2.5 border border-slate-100 rounded-xl space-y-1">
                    <span className="font-bold text-slate-400 block uppercase tracking-wide">Areas of Optimization</span>
                    <p className="text-slate-600 leading-normal">{app.areasOfImprovement}</p>
                  </div>
                </div>
              </div>
            ))}
            {appraisals.length === 0 && (
              <div className="p-8 text-center text-slate-400 font-medium">
                No performance appraisals compiled yet for your account workspace.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* MODAL: Apply Leave Request */}
      {showApplyLeaveModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden border border-slate-100 animate-scale-up">
            <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-heading font-black text-sm uppercase tracking-wide">Apply Time-off Request</h3>
                <p className="text-[10px] text-indigo-200 mt-0.5">Submits application directly to HR administrator</p>
              </div>
              <button onClick={() => setShowApplyLeaveModal(false)} className="text-slate-400 hover:text-white">
                <Square size={13} className="fill-white rotate-45" />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Leave Category</label>
                <select
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                  value={selectedLeaveType}
                  onChange={(e) => setSelectedLeaveType(e.target.value)}
                >
                  {leaveTypes.map((t) => (
                    <option key={t._id} value={t._id}>{t.name} (Code: {t.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Start Date</label>
                  <input
                    type="date"
                    className="w-full text-xs rounded-xl border border-slate-200 p-2 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">End Date</label>
                  <input
                    type="date"
                    className="w-full text-xs rounded-xl border border-slate-200 p-2 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Application Statement</label>
                <textarea
                  placeholder="Explain details..."
                  className="w-full rounded-xl border border-slate-200 p-3 h-24 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 focus:outline-none resize-none"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full btn-primary h-9.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                >
                  Submit Time-off Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
