import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { hrService } from '../services/hrService';
import api from '../services/api';
import { 
  Users, Clock, Calendar, ShieldCheck, Play, Square, 
  Plus, Check, X, FileText, CheckCircle2, UserPlus, Sparkles,
  DollarSign, Award, RefreshCw, MapPin, Building, Briefcase,
  PlusCircle, CreditCard, ChevronRight, Download, BarChart2, Info
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function HRPage() {
  const { user } = useAuthStore();
  const isAdminOrHR = user && (user.role === 'admin' || user.role === 'manager' || user.role === 'hr');

  // Tabs state: overview, employees, leaves, payroll, appraisals
  const [activeTab, setActiveTab] = useState('overview');

  // Dashboard Stats state
  const [stats, setStats] = useState({
    totalEmployees: 0,
    onLeaveToday: 0,
    lateArrivalsToday: 0,
    presentToday: 0,
    absentToday: 0,
    birthdaysThisMonth: [],
    activeShiftsCount: 0,
    totalDepartments: 0,
  });

  // State arrays from MERN backend
  const [employees, setEmployees] = useState([]);
  const [attendanceToday, setAttendanceToday] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [appraisals, setAppraisals] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  // Form inputs / modal states
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [showAddLeaveModal, setShowAddLeaveModal] = useState(false);
  const [showAddPayrollModal, setShowAddPayrollModal] = useState(false);
  const [showAddAppraisalModal, setShowAddAppraisalModal] = useState(false);

  // 1. Employee Form state
  const [empFirstName, setEmpFirstName] = useState('');
  const [empLastName, setEmpLastName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empGender, setEmpGender] = useState('male');
  const [empDOB, setEmpDOB] = useState('1998-05-15');
  const [empAddress, setEmpAddress] = useState('Mirpur-10, Dhaka');
  const [empEmergencyName, setEmpEmergencyName] = useState('Rahima Begum');
  const [empEmergencyPhone, setEmpEmergencyPhone] = useState('+8801987654321');
  const [empEmergencyRelation, setEmpEmergencyRelation] = useState('Mother');
  const [empJoiningDate, setEmpJoiningDate] = useState('2026-05-01');
  const [empEmploymentType, setEmpEmploymentType] = useState('full-time');
  const [empWorkLocation, setEmpWorkLocation] = useState('office');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedShift, setSelectedShift] = useState('');

  // Department / Shift creation state
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptDesc, setDeptDesc] = useState('');

  const [showAddShiftModal, setShowAddShiftModal] = useState(false);
  const [shiftName, setShiftName] = useState('');
  const [shiftStartTime, setShiftStartTime] = useState('09:00');
  const [shiftEndTime, setShiftEndTime] = useState('18:00');
  const [shiftBreakDuration, setShiftBreakDuration] = useState('60');
  const [shiftLateMarkAfter, setShiftLateMarkAfter] = useState('15');

  // 2. Leave Form state
  const [selectedLeaveType, setSelectedLeaveType] = useState('');
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  // 3. Payroll Form state
  const [selectedEmpForPayroll, setSelectedEmpForPayroll] = useState('');
  const [payrollMonth, setPayrollMonth] = useState('5');
  const [payrollYear, setPayrollYear] = useState('2026');
  const [payrollBonus, setPayrollBonus] = useState('0');
  const [payrollTax, setPayrollTax] = useState('0');
  const [payrollOvertime, setPayrollOvertime] = useState('0');

  // 4. Appraisal Form state
  const [selectedEmpForAppraisal, setSelectedEmpForAppraisal] = useState('');
  const [appraisalStart, setAppraisalStart] = useState('2026-01-01');
  const [appraisalEnd, setAppraisalEnd] = useState('2026-12-31');
  const [kpi1Title, setKpi1Title] = useState('Sales / Client Conversion Rate');
  const [kpi1Target, setKpi1Target] = useState('25%');
  const [kpi1Achieved, setKpi1Achieved] = useState('28%');
  const [kpi1Score, setKpi1Score] = useState('4');
  const [kpi2Title, setKpi2Title] = useState('Campaign ROAS Margin');
  const [kpi2Target, setKpi2Target] = useState('3.5x');
  const [kpi2Achieved, setKpi2Achieved] = useState('4.0x');
  const [kpi2Score, setKpi2Score] = useState('5');
  const [selfRating, setSelfRating] = useState('4');
  const [reviewerRating, setReviewerRating] = useState('4');

  // Clock In / Out State (persisted in localStorage)
  const [isCheckedIn, setIsCheckedIn] = useState(localStorage.getItem('isCheckedIn') === 'true');
  const [checkInTime, setCheckInTime] = useState(localStorage.getItem('checkInTime') || '');
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Core ticking clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check-In duration calculator
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

  // Load MERN data from services
  const loadHRData = async () => {
    setIsRefreshing(true);
    try {
      // 1. Dashboard statistics
      if (isAdminOrHR) {
        const statsRes = await hrService.getDashboardStats();
        if (statsRes.data.success) setStats(statsRes.data.data);
      }

      // 2. Employees Directory
      if (isAdminOrHR) {
        const empRes = await hrService.getEmployees({});
        if (empRes.data.success) setEmployees(empRes.data.data);
      }

      // 3. Today's Attendance logs
      const attRes = await hrService.getAttendanceHistory({ startDate: new Date().toISOString().slice(0, 10) });
      if (attRes.data.success) setAttendanceToday(attRes.data.data);

      // 4. Leaves list
      const leavesRes = await hrService.getLeaves({});
      if (leavesRes.data.success) setLeaves(leavesRes.data.data);

      // 5. Leave types
      const typesRes = await hrService.getLeaveTypes();
      if (typesRes.data.success) {
        setLeaveTypes(typesRes.data.data);
        if (typesRes.data.data.length > 0) {
          setSelectedLeaveType(typesRes.data.data[0]._id);
        }
      }

      // 6. Payroll ledger
      const payrollRes = await hrService.getPayrollRecords({});
      if (payrollRes.data.success) setPayrollRecords(payrollRes.data.data);

      // 7. Performance Appraisals
      const appraisalRes = await hrService.getAppraisals({});
      if (appraisalRes.data.success) setAppraisals(appraisalRes.data.data);

      // 8. Shifts, Departments, and Designations
      const shiftRes = await hrService.getShifts();
      if (shiftRes.data.success) {
        setShifts(shiftRes.data.data);
        if (shiftRes.data.data.length > 0) setSelectedShift(shiftRes.data.data[0]._id);
      }

      const deptRes = await hrService.getDepartments();
      if (deptRes.data.success) {
        setDepartments(deptRes.data.data);
        if (deptRes.data.data.length > 0) setSelectedDept(deptRes.data.data[0]._id);
      }

    } catch (err) {
      console.error('Error fetching HR backend statistics:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadHRData();
  }, [user]);

  // Handle Clock In (calls check-in endpoint!)
  const handleClockIn = async () => {
    try {
      // Fetch GPS position if available
      let gpsLocation = undefined;
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            gpsLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            await triggerCheckIn(gpsLocation);
          },
          async () => {
            await triggerCheckIn(undefined); // proceed without GPS
          }
        );
      } else {
        await triggerCheckIn(undefined);
      }
    } catch (err) {
      toast.error('Check-in failed: Server offline.');
    }
  };

  const triggerCheckIn = async (location) => {
    try {
      const res = await hrService.checkIn(location);
      if (res.data.success) {
        const now = new Date().toISOString();
        localStorage.setItem('isCheckedIn', 'true');
        localStorage.setItem('checkInTime', now);
        setIsCheckedIn(true);
        setCheckInTime(now);
        toast.success('Shift started! Checked-in successfully on port 5000.');
        loadHRData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed.');
    }
  };

  // Handle Clock Out
  const handleClockOut = async () => {
    try {
      const res = await hrService.checkOut(undefined);
      if (res.data.success) {
        localStorage.removeItem('isCheckedIn');
        localStorage.removeItem('checkInTime');
        setIsCheckedIn(false);
        setCheckInTime('');
        toast.success(`Checked out! Worked today: ${elapsedTime}`);
        loadHRData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-out failed.');
    }
  };

  // Create Department
  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    if (!deptName || !deptCode) {
      toast.error('Please fill in department name and code.');
      return;
    }
    try {
      const payload = {
        name: deptName,
        code: deptCode.toUpperCase(),
        description: deptDesc,
      };
      const res = await hrService.createDepartment(payload);
      if (res.data.success) {
        toast.success(`Department "${deptName}" created successfully!`);
        setShowAddDeptModal(false);
        setDeptName('');
        setDeptCode('');
        setDeptDesc('');
        loadHRData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create department.');
    }
  };

  // Create Shift
  const handleCreateShift = async (e) => {
    e.preventDefault();
    if (!shiftName || !shiftStartTime || !shiftEndTime) {
      toast.error('Please fill in shift name, start, and end times.');
      return;
    }
    try {
      const payload = {
        name: shiftName,
        startTime: shiftStartTime,
        endTime: shiftEndTime,
        breakDuration: Number(shiftBreakDuration) || 60,
        lateMarkAfter: Number(shiftLateMarkAfter) || 15,
        workingDays: [1, 2, 3, 4, 5],
      };
      const res = await hrService.createShift(payload);
      if (res.data.success) {
        toast.success(`Shift "${shiftName}" created successfully!`);
        setShowAddShiftModal(false);
        setShiftName('');
        setShiftStartTime('09:00');
        setShiftEndTime('18:00');
        setShiftBreakDuration('60');
        setShiftLateMarkAfter('15');
        loadHRData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create shift.');
    }
  };

  // Register Employee
  const handleRegisterEmployee = async (e) => {
    e.preventDefault();
    if (!empFirstName || !empLastName || !empEmail || !empPhone) {
      toast.error('Please fill in name, email, and phone number.');
      return;
    }

    try {
      const payload = {
        firstName: empFirstName,
        lastName: empLastName,
        email: empEmail.toLowerCase(),
        phone: empPhone,
        gender: empGender,
        dateOfBirth: empDOB,
        presentAddress: empAddress,
        emergencyContactName: empEmergencyName,
        emergencyContactPhone: empEmergencyPhone,
        emergencyContactRelation: empEmergencyRelation,
        joiningDate: empJoiningDate,
        employmentType: empEmploymentType,
        workLocation: empWorkLocation,
        department: selectedDept || undefined,
        shift: selectedShift || undefined,
      };

      const res = await hrService.createEmployee(payload);
      if (res.data.success) {
        toast.success(`Employee ${empFirstName} ${empLastName} registered successfully!`);
        setShowAddEmpModal(false);
        setEmpFirstName('');
        setEmpLastName('');
        setEmpEmail('');
        setEmpPhone('');
        loadHRData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    }
  };

  // Submit Leave Request
  const handleRequestLeave = async (e) => {
    e.preventDefault();
    if (!leaveStartDate || !leaveEndDate || !leaveReason) {
      toast.error('All fields are required.');
      return;
    }

    try {
      const payload = {
        leaveType: selectedLeaveType,
        startDate: leaveStartDate,
        endDate: leaveEndDate,
        reason: leaveReason,
      };

      const res = await hrService.applyLeave(payload);
      if (res.data.success) {
        toast.success('Leave application submitted for approval.');
        setShowAddLeaveModal(false);
        setLeaveReason('');
        loadHRData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Leave request failed.');
    }
  };

  // Approve / Reject leaves
  const handleLeaveApproval = async (id, action, reason = '') => {
    try {
      if (action === 'approved') {
        const res = await hrService.approveLeave(id);
        if (res.data.success) {
          toast.success('Leave application approved successfully.');
          loadHRData();
        }
      } else {
        const comment = reason || prompt('Please enter rejection reason:');
        if (!comment) return;
        const res = await hrService.rejectLeave(id, comment);
        if (res.data.success) {
          toast.success('Leave application rejected.');
          loadHRData();
        }
      }
    } catch (err) {
      toast.error('Approval update failed.');
    }
  };

  // Generate Payroll Sheet
  const handleGeneratePayroll = async (e) => {
    e.preventDefault();
    if (!selectedEmpForPayroll) {
      toast.error('Please select an employee.');
      return;
    }

    try {
      const payload = {
        employee: selectedEmpForPayroll,
        month: Number(payrollMonth),
        year: Number(payrollYear),
        bonus: Number(payrollBonus) || 0,
        taxDeducted: Number(payrollTax) || 0,
        overtime: Number(payrollOvertime) || 0,
      };

      const res = await hrService.generatePayroll(payload);
      if (res.data.success) {
        toast.success('Payroll draft sheets compiled successfully!');
        setShowAddPayrollModal(false);
        loadHRData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to compile payroll.');
    }
  };

  // Mark Payroll as Paid
  const handleProcessPayroll = async (id) => {
    try {
      const res = await hrService.processPayroll(id, {
        status: 'paid',
        paymentMethod: 'bkash',
        transactionRef: `TXN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      });
      if (res.data.success) {
        toast.success('Salary processed and marked as PAID!');
        loadHRData();
      }
    } catch (err) {
      toast.error('Payroll processing failed.');
    }
  };

  // Download Payslip PDF (directly handles auth headers and blob streaming)
  const handleDownloadPayslip = async (id, empId, m, y) => {
    try {
      toast.loading('Compiling payslip and downloading PDF...', { id: 'pdf' });
      
      const response = await api.get(`/hr/payroll/${id}/payslip`, { responseType: 'blob' });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `payslip-${empId}-${m}-${y}.pdf`;
      link.click();
      
      toast.success('Payslip PDF downloaded successfully!', { id: 'pdf' });
    } catch (err) {
      toast.error('Failed to compile payslip PDF', { id: 'pdf' });
    }
  };

  // Create Appraisal Performance Review
  const handleCreateAppraisal = async (e) => {
    e.preventDefault();
    if (!selectedEmpForAppraisal) {
      toast.error('Please select an employee.');
      return;
    }

    try {
      const payload = {
        employee: selectedEmpForAppraisal,
        reviewer: employees.find(emp => emp.userId?._id === user._id)?._id || selectedEmpForAppraisal, // default fallback
        reviewPeriodStart: appraisalStart,
        reviewPeriodEnd: appraisalEnd,
        kpis: [
          { title: kpi1Title, target: kpi1Target, achieved: kpi1Achieved, score: Number(kpi1Score), weight: 1 },
          { title: kpi2Title, target: kpi2Target, achieved: kpi2Achieved, score: Number(kpi2Score), weight: 1 }
        ],
        selfRating: Number(selfRating),
        reviewerRating: Number(reviewerRating),
        strengths: 'Excellent target focus, prompt WhatsApp communications response times.',
        areasOfImprovement: 'Needs minor optimization on server speed lighthouse audits.',
        status: 'completed'
      };

      const res = await hrService.createAppraisal(payload);
      if (res.data.success) {
        toast.success('Appraisal Performance Review compiled successfully!');
        setShowAddAppraisalModal(false);
        loadHRData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit appraisal.');
    }
  };

  return (
    <div className="page-container animate-fade-in font-sans pb-12 space-y-6">
      
      {/* Header */}
      <div className="section-header">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="h-6 w-6 text-primary animate-pulse" /> HR Operational Dashboard
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Manage employee shifts, attendance IP/GPS locks, leave allocations, BDT payroll payslips, and KPI appraisals.</p>
        </div>

        <button 
          onClick={loadHRData} 
          disabled={isRefreshing}
          className="btn-secondary w-9 h-9 p-0 flex items-center justify-center hover:text-primary transition-all duration-300 shadow-sm shrink-0"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* ── METRICS DASHBOARD CARDS ── */}
      {isAdminOrHR && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4.5 bg-gradient-to-br from-blue-50/20 to-white border border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400">Total Staff</span>
              <h3 className="text-xl font-extrabold text-primary mt-1">{stats.totalEmployees} Employees</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </div>

          <div className="card p-4.5 bg-gradient-to-br from-green-50/20 to-white border border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400">Active Shift Today</span>
              <h3 className="text-xl font-extrabold text-success mt-1">{stats.presentToday} Present</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-50 text-success flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>

          <div className="card p-4.5 bg-gradient-to-br from-amber-50/20 to-white border border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400">Time-off Today</span>
              <h3 className="text-xl font-extrabold text-amber-500 mt-1">{stats.onLeaveToday} On Leave</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Calendar className="h-5 w-5" />
            </div>
          </div>

          <div className="card p-4.5 bg-gradient-to-br from-red-50/20 to-white border border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400">Late Mark Arrivals</span>
              <h3 className="text-xl font-extrabold text-red-500 mt-1">{stats.lateArrivalsToday} Late Today</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </div>
        </div>
      )}

      {/* ── TABS BAR ── */}
      <div className="card !p-0 overflow-hidden shadow-sm border border-gray-100">
        <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-thin bg-slate-50/30">
          {[
            { key: 'overview', label: 'Overview & Clocking', icon: Clock },
            isAdminOrHR && { key: 'employees', label: 'Employees Directory', icon: UserPlus },
            { key: 'leaves', label: 'Leaves Manager', icon: Calendar },
            { key: 'payroll', label: 'BDT Payroll Ledger', icon: DollarSign },
            { key: 'appraisals', label: 'Performance Appraisals', icon: Award }
          ].filter(Boolean).map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-5 py-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                  active 
                    ? 'border-primary text-primary bg-white shadow-2xs' 
                    : 'border-transparent text-gray-500 hover:text-dark hover:bg-slate-50/50'
                }`}
              >
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TAB CONTENTS ── */}
      
      {/* 1. OVERVIEW & CLOCKING */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Shift Clock widget */}
          <div className="card bg-white p-5 flex flex-col justify-between shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
              <Clock className="h-5 w-5 text-primary animate-pulse" />
              <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Clock In Command</h3>
            </div>

            <div className="text-center py-6 space-y-2.5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Time</p>
              <h1 className="text-3xl font-heading font-extrabold text-gray-800 tracking-tight leading-none">
                {currentTime}
              </h1>
              
              {isCheckedIn && (
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 mt-4 space-y-1 animate-slide-down">
                  <span className="text-[9px] uppercase font-bold text-gray-400">Total Shift Elapsed</span>
                  <h2 className="text-2xl font-bold text-primary font-heading tracking-widest">{elapsedTime}</h2>
                </div>
              )}
            </div>

            <div>
              {isCheckedIn ? (
                <button
                  onClick={handleClockOut}
                  className="w-full btn-primary bg-red-500 hover:bg-red-600 h-10 text-xs font-semibold gap-2 shadow-sm rounded-xl"
                >
                  <Square className="h-4.5 w-4.5 fill-white" /> Clock Out Shift
                </button>
              ) : (
                <button
                  onClick={handleClockIn}
                  className="w-full btn-primary h-10 text-xs font-semibold gap-2 shadow-sm rounded-xl"
                >
                  <Play className="h-4.5 w-4.5 fill-white animate-pulse" /> Clock In Shift
                </button>
              )}
            </div>
          </div>

          {/* Today's attendance list */}
          <div className="lg:col-span-2 card p-5 shadow-sm border border-gray-100 flex flex-col h-full bg-white">
            <div className="flex justify-between items-center pb-2 border-b border-gray-50 mb-4">
              <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Today's Team Attendance (MERN Synced)</h3>
              <span className="text-[10px] text-gray-400 font-semibold">{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>

            <div className="overflow-x-auto flex-1 scrollbar-thin">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                    <th className="p-3">Employee</th>
                    <th className="p-3">Check In</th>
                    <th className="p-3">Check Out</th>
                    <th className="p-3">Total Hours</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {attendanceToday.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-semibold text-gray-800 flex items-center gap-2">
                        <div className="w-6.5 h-6.5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px]">
                          {log.employee?.firstName?.charAt(0) || 'E'}
                        </div>
                        <div>
                          <p>{log.employee?.firstName} {log.employee?.lastName}</p>
                          <p className="text-[9px] text-gray-400 font-mono">{log.employee?.employeeId}</p>
                        </div>
                      </td>
                      <td className="p-3 text-gray-500 font-mono">
                        {log.checkIn ? new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="p-3 text-gray-500 font-mono">
                        {log.checkOut ? new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active'}
                      </td>
                      <td className="p-3 font-semibold text-gray-700 font-mono">
                        {log.workingHours ? `${log.workingHours} hrs` : 'Calculating...'}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`inline-block text-[9px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                          log.status === 'present' 
                            ? 'bg-green-50 text-green-600 border-green-100'
                            : log.status === 'late'
                              ? 'bg-amber-50 text-amber-600 border-amber-100'
                              : 'bg-red-50 text-red-600 border-red-100'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {attendanceToday.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center p-8 text-gray-400 font-medium">
                        No team attendance records logged today. Click "Clock In Shift" to log first check-in!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. EMPLOYEES DIRECTORY */}
      {activeTab === 'employees' && isAdminOrHR && (
        <div className="card p-5 shadow-sm border border-gray-100 space-y-4 bg-white animate-fade-in">
          <div className="flex justify-between items-center pb-2 border-b border-gray-50 flex-wrap gap-2">
            <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Registered Corporate Employees</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowAddDeptModal(true)}
                className="btn-secondary gap-1 text-xs h-8 px-3 border border-gray-200 flex items-center"
              >
                <Building className="h-3.5 w-3.5 text-gray-500" /> + Dept
              </button>
              <button 
                onClick={() => setShowAddShiftModal(true)}
                className="btn-secondary gap-1 text-xs h-8 px-3 border border-gray-200 flex items-center"
              >
                <Clock className="h-3.5 w-3.5 text-gray-500" /> + Shift
              </button>
              <button 
                onClick={() => setShowAddEmpModal(true)}
                className="btn-primary gap-1 text-xs h-8 px-3 flex items-center"
              >
                <UserPlus className="h-4 w-4" /> Add Employee
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="p-3">Emp ID</th>
                  <th className="p-3">Full Name</th>
                  <th className="p-3">Email & Contact</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Location & Type</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono font-bold text-primary">{emp.employeeId}</td>
                    <td className="p-3 font-semibold text-gray-800 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-100 text-gray-700 font-bold flex items-center justify-center text-[10px]">
                        {emp.firstName.charAt(0)}
                      </div>
                      {emp.firstName} {emp.lastName}
                    </td>
                    <td className="p-3 text-gray-500">
                      <p>{emp.email}</p>
                      <p className="text-[10px] text-gray-400 font-semibold">{emp.phone}</p>
                    </td>
                    <td className="p-3 text-gray-600 font-medium">{emp.department?.name || 'Operations'}</td>
                    <td className="p-3">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold text-gray-600 uppercase mr-1">{emp.workLocation}</span>
                      <span className="text-[10px] font-semibold text-gray-400 uppercase">{emp.employmentType}</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border bg-green-50 text-green-600 border-green-100 uppercase">
                        {emp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. LEAVES MANAGER */}
      {activeTab === 'leaves' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          
          {/* Leave Submission box */}
          <div className="card p-5 bg-white shadow-sm border border-gray-100 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-50">
              <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="h-4.5 w-4.5 text-primary" /> Request Time Off
              </h3>
              <button 
                onClick={() => setShowAddLeaveModal(true)}
                className="btn-primary text-xs h-8 px-3"
              >
                Apply Leave
              </button>
            </div>

            <p className="text-xs text-gray-500 leading-normal">
              Click the button above to request time-off. Leave balance days will automatically exclude corporate weekends and calendar public holidays.
            </p>

            <div className="border-t border-gray-50 pt-3 space-y-2">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Leave Balance Rules</h4>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                {leaveTypes.map((type) => (
                  <div key={type._id} className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex justify-between items-center">
                    <span className="text-gray-600">{type.name}</span>
                    <span style={{ color: type.color }}>{type.daysAllowedPerYear} days</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Leaves Applications list */}
          <div className="lg:col-span-2 card p-5 shadow-sm border border-gray-100 flex flex-col h-full bg-white">
            <div className="flex justify-between items-center pb-2 border-b border-gray-50 mb-4">
              <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Leaves Review Queue (MERN Synced)</h3>
            </div>

            <div className="space-y-3.5 flex-1 overflow-y-auto max-h-[350px] scrollbar-thin">
              {leaves.map((leave) => (
                <div key={leave._id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-bold text-gray-800">
                        {leave.employee?.firstName} {leave.employee?.lastName}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                        {leave.leaveType?.name || 'Sick Leave'} · Duration: {leave.totalDays} charged working days
                      </p>
                    </div>

                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                      leave.status === 'approved' 
                        ? 'bg-green-50 text-green-600 border-green-100' 
                        : leave.status === 'rejected'
                          ? 'bg-red-50 text-red-600 border-red-100'
                          : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {leave.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-500 italic">
                    "{leave.reason}"
                  </p>

                  {leave.status === 'pending' && isAdminOrHR && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleLeaveApproval(leave._id, 'approved')}
                        className="flex-1 btn-primary h-8 text-[10px] gap-1 bg-success hover:bg-emerald-600 border-none shadow-xs text-white flex items-center justify-center font-bold"
                      >
                        <Check className="h-3.5 w-3.5" /> Approve Leave
                      </button>
                      <button
                        onClick={() => handleLeaveApproval(leave._id, 'rejected')}
                        className="flex-1 btn-secondary h-8 text-[10px] gap-1 hover:bg-red-50 hover:text-red-500 border border-gray-200"
                      >
                        <X className="h-3.5 w-3.5" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {leaves.length === 0 && (
                <div className="text-center py-12 text-gray-400 font-medium">
                  No leave requests submitted in the database queue.
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* 4. BDT PAYROLL LEDGER */}
      {activeTab === 'payroll' && (
        <div className="card p-5 shadow-sm border border-gray-100 space-y-4 bg-white animate-fade-in">
          <div className="flex justify-between items-center pb-2 border-b border-gray-50">
            <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1">
              <DollarSign className="h-4.5 w-4.5 text-primary" /> Monthly Payroll Sheets (৳ BDT)
            </h3>
            {isAdminOrHR && (
              <button 
                onClick={() => setShowAddPayrollModal(true)}
                className="btn-primary gap-1 text-xs h-8 px-3 bg-gradient-to-r from-primary to-blue-600 border-none text-white font-semibold"
              >
                <PlusCircle className="h-4 w-4" /> Generate Payroll
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="p-3">Employee</th>
                  <th className="p-3">Period</th>
                  <th className="p-3">Attendance</th>
                  <th className="p-3">Deductions & Tax</th>
                  <th className="p-3">Net Take-Home</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payrollRecords.map((pay) => (
                  <tr key={pay._id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-gray-800">
                      {pay.employee?.firstName} {pay.employee?.lastName}
                      <p className="text-[9px] text-gray-400 font-mono mt-0.5">{pay.employee?.employeeId}</p>
                    </td>
                    <td className="p-3 font-semibold text-gray-600">Month: {pay.month} / {pay.year}</td>
                    <td className="p-3 text-[10px] text-gray-500">
                      <p>Working: {pay.workingDays} days</p>
                      <p className="text-success font-semibold">Present: {pay.presentDays} days</p>
                    </td>
                    <td className="p-3 text-[10px] text-gray-500">
                      <p>Deductions: ৳{pay.totalDeductions.toLocaleString('en-IN')}</p>
                      <p className="text-red-500">Tax: ৳{pay.taxDeducted.toLocaleString('en-IN')}</p>
                    </td>
                    <td className="p-3 font-extrabold text-primary text-sm font-heading">
                      ৳{pay.netSalary.toLocaleString('en-IN')}
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
                    <td className="p-3">
                      <div className="flex gap-1.5 items-center justify-center">
                        {pay.status === 'draft' && isAdminOrHR && (
                          <button
                            onClick={() => handleProcessPayroll(pay._id)}
                            className="bg-primary hover:bg-blue-600 text-white text-[9px] font-bold px-2.5 py-1 rounded border-none shadow-xs"
                          >
                            Mark Paid
                          </button>
                        )}
                        <button
                          onClick={() => handleDownloadPayslip(pay._id, pay.employee?.employeeId, pay.month, pay.year)}
                          className="btn-secondary h-7 px-2 text-[9px] font-bold gap-1 flex items-center border border-gray-200"
                        >
                          <Download className="h-3 w-3" /> Payslip PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {payrollRecords.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center p-8 text-gray-400 font-medium">
                      No monthly payroll sheets compiled. Select "Generate Payroll" to compile first draft.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. PERFORMANCE APPRAISALS */}
      {activeTab === 'appraisals' && (
        <div className="card p-5 shadow-sm border border-gray-100 space-y-4 bg-white animate-fade-in">
          <div className="flex justify-between items-center pb-2 border-b border-gray-50">
            <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1">
              <Award className="h-4.5 w-4.5 text-primary" /> KPI Performance Reviews
            </h3>
            {isAdminOrHR && (
              <button 
                onClick={() => setShowAddAppraisalModal(true)}
                className="btn-primary gap-1 text-xs h-8 px-3"
              >
                <Plus className="h-4 w-4" /> Create Appraisal
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="p-3">Employee</th>
                  <th className="p-3">Reviewer</th>
                  <th className="p-3">KPI Targets</th>
                  <th className="p-3">Overall Rating</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {appraisals.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-gray-800">
                      {app.employee?.firstName} {app.employee?.lastName}
                      <p className="text-[9px] text-gray-400 font-mono mt-0.5">{app.employee?.employeeId}</p>
                    </td>
                    <td className="p-3 text-gray-600 font-medium">
                      {app.reviewer?.firstName} {app.reviewer?.lastName || 'CEO Anik'}
                    </td>
                    <td className="p-3 space-y-1">
                      {app.kpis?.map((kpi, idx) => (
                        <div key={idx} className="text-[10px] text-gray-500 bg-slate-50 p-1.5 rounded border border-slate-100 max-w-xs">
                          <p className="font-bold text-gray-700">{kpi.title}</p>
                          <p className="text-[9px] mt-0.5">Target: {kpi.target} · Achieved: {kpi.achieved} · Score: <span className="font-bold text-primary">{kpi.score}/5</span></p>
                        </div>
                      ))}
                    </td>
                    <td className="p-3">
                      <div className="bg-primary/5 p-2 rounded-xl border border-primary/10 text-center w-max">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block leading-none">KPI Score</span>
                        <span className="text-base font-extrabold text-primary font-heading mt-1 block">{app.overallScore || 'N/A'}/5</span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border bg-slate-100 text-gray-500 uppercase border-slate-200">
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {appraisals.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center p-8 text-gray-400 font-medium">
                      No performance appraisals scored yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL 1: REGISTER EMPLOYEE ── */}
      {showAddEmpModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 border border-gray-100 shadow-modal my-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-50 pb-2">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1">
                <UserPlus className="h-4.5 w-4.5 text-primary" /> Register New Corporate Employee
              </h3>
              <button onClick={() => setShowAddEmpModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <form onSubmit={handleRegisterEmployee} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">First Name</label>
                  <input required className="input h-9" placeholder="e.g. Ariful" value={empFirstName} onChange={(e) => setEmpFirstName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Last Name</label>
                  <input required className="input h-9" placeholder="e.g. Islam" value={empLastName} onChange={(e) => setEmpLastName(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Contact Email</label>
                  <input type="email" required className="input h-9" placeholder="e.g. arif@dawatit.com" value={empEmail} onChange={(e) => setEmpEmail(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Phone Number</label>
                  <input required className="input h-9" placeholder="e.g. +8801712345678" value={empPhone} onChange={(e) => setEmpPhone(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Gender</label>
                  <select className="input h-9" value={empGender} onChange={(e) => setEmpGender(e.target.value)}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Date of Birth</label>
                  <input type="date" required className="input h-9" value={empDOB} onChange={(e) => setEmpDOB(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Joining Date</label>
                  <input type="date" required className="input h-9" value={empJoiningDate} onChange={(e) => setEmpJoiningDate(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Assign Department</label>
                    <button
                      type="button"
                      onClick={() => setShowAddDeptModal(true)}
                      className="text-[10px] text-primary hover:text-blue-700 font-bold flex items-center gap-0.5 transition-colors"
                    >
                      <Plus className="h-3 w-3" /> New
                    </button>
                  </div>
                  <select className="input h-9" value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
                    {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                    {departments.length === 0 && <option value="">No departments available</option>}
                  </select>
                </div>
                <div className="form-group">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Assign Work Shift</label>
                    <button
                      type="button"
                      onClick={() => setShowAddShiftModal(true)}
                      className="text-[10px] text-primary hover:text-blue-700 font-bold flex items-center gap-0.5 transition-colors"
                    >
                      <Plus className="h-3 w-3" /> New
                    </button>
                  </div>
                  <select className="input h-9" value={selectedShift} onChange={(e) => setSelectedShift(e.target.value)}>
                    {shifts.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.startTime}-{s.endTime})</option>)}
                    {shifts.length === 0 && <option value="">No shifts available</option>}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Employment Type</label>
                  <select className="input h-9" value={empEmploymentType} onChange={(e) => setEmpEmploymentType(e.target.value)}>
                    <option value="full-time">Full-Time</option>
                    <option value="part-time">Part-Time</option>
                    <option value="contract">Contract</option>
                    <option value="intern">Intern</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Work Location</label>
                  <select className="input h-9" value={empWorkLocation} onChange={(e) => setEmpWorkLocation(e.target.value)}>
                    <option value="office">Office Desk</option>
                    <option value="remote">Remote (WFA)</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Emergency Relation</label>
                  <input required className="input h-9" placeholder="Mother" value={empEmergencyRelation} onChange={(e) => setEmpEmergencyRelation(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Emergency Contact Name</label>
                  <input required className="input h-9" placeholder="e.g. Rahima Begum" value={empEmergencyName} onChange={(e) => setEmpEmergencyName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Emergency Phone</label>
                  <input required className="input h-9" placeholder="+8801987654321" value={empEmergencyPhone} onChange={(e) => setEmpEmergencyPhone(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Present Address Details</label>
                <input required className="input h-9" placeholder="Mirpur-10, Dhaka, Bangladesh" value={empAddress} onChange={(e) => setEmpAddress(e.target.value)} />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-50">
                <button type="button" onClick={() => setShowAddEmpModal(false)} className="btn-secondary h-9 px-4">Cancel</button>
                <button type="submit" className="btn-primary h-9 px-4">Register Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: REQUEST TIME OFF ── */}
      {showAddLeaveModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-gray-100 shadow-modal space-y-4">
            <div className="flex justify-between items-center border-b border-gray-50 pb-2">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1">
                <Calendar className="h-4.5 w-4.5 text-primary" /> Apply for Time-Off (Leave)
              </h3>
              <button onClick={() => setShowAddLeaveModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRequestLeave} className="space-y-4 text-xs">
              <div className="form-group">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Select Leave Category</label>
                <select className="input h-9 font-semibold" value={selectedLeaveType} onChange={(e) => setSelectedLeaveType(e.target.value)}>
                  {leaveTypes.map(type => <option key={type._id} value={type._id}>{type.name} ({type.daysAllowedPerYear} days allowed)</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Start Date</label>
                  <input type="date" required className="input h-9" value={leaveStartDate} onChange={(e) => setLeaveStartDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">End Date</label>
                  <input type="date" required className="input h-9" value={leaveEndDate} onChange={(e) => setLeaveEndDate(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Reason / Details</label>
                <textarea required className="w-full border border-gray-300 rounded-lg p-3 h-24 focus:outline-none focus:ring-1 focus:ring-primary resize-none" placeholder="Provide description..." value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddLeaveModal(false)} className="btn-secondary h-9 px-4">Cancel</button>
                <button type="submit" className="btn-primary h-9 px-4">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: GENERATE MONTHLY PAYROLL ── */}
      {showAddPayrollModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-gray-100 shadow-modal space-y-4">
            <div className="flex justify-between items-center border-b border-gray-50 pb-2">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1">
                <DollarSign className="h-4.5 w-4.5 text-primary" /> Compile Monthly Payroll Sheet
              </h3>
              <button onClick={() => setShowAddPayrollModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleGeneratePayroll} className="space-y-4 text-xs">
              <div className="form-group">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Select Employee</label>
                <select className="input h-9" value={selectedEmpForPayroll} onChange={(e) => setSelectedEmpForPayroll(e.target.value)}>
                  <option value="">-- Choose Employee --</option>
                  {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName} ({emp.employeeId})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Select Month</label>
                  <select className="input h-9" value={payrollMonth} onChange={(e) => setPayrollMonth(e.target.value)}>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i+1} value={i+1}>{new Date(2026, i, 1).toLocaleString('default', { month: 'long' })}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Select Year</label>
                  <select className="input h-9" value={payrollYear} onChange={(e) => setPayrollYear(e.target.value)}>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Bonus (৳)</label>
                  <input type="number" className="input h-9" placeholder="0" value={payrollBonus} onChange={(e) => setPayrollBonus(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Tax Deduct (৳)</label>
                  <input type="number" className="input h-9" placeholder="0" value={payrollTax} onChange={(e) => setPayrollTax(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Overtime (hrs)</label>
                  <input type="number" className="input h-9" placeholder="0" value={payrollOvertime} onChange={(e) => setPayrollOvertime(e.target.value)} />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddPayrollModal(false)} className="btn-secondary h-9 px-4">Cancel</button>
                <button type="submit" className="btn-primary h-9 px-4">Compile Payroll</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 4: CREATE KPI APPRAISAL ── */}
      {showAddAppraisalModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-gray-100 shadow-modal my-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-50 pb-2">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1">
                <Award className="h-4.5 w-4.5 text-primary" /> Create KPI Performance Review
              </h3>
              <button onClick={() => setShowAddAppraisalModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAppraisal} className="space-y-4 text-xs">
              <div className="form-group">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Select Subject Employee</label>
                <select className="input h-9" value={selectedEmpForAppraisal} onChange={(e) => setSelectedEmpForAppraisal(e.target.value)}>
                  <option value="">-- Choose Employee --</option>
                  {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName} ({emp.employeeId})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Review Period Start</label>
                  <input type="date" required className="input h-9" value={appraisalStart} onChange={(e) => setAppraisalStart(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Review Period End</label>
                  <input type="date" required className="input h-9" value={appraisalEnd} onChange={(e) => setAppraisalEnd(e.target.value)} />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">KPI Target 1</p>
                <div className="form-group">
                  <label className="text-[9px] font-bold uppercase text-gray-400">KPI Metric Title</label>
                  <input required className="input h-8 bg-white" value={kpi1Title} onChange={(e) => setKpi1Title(e.target.value)} />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="form-group">
                    <label className="text-[9px] font-bold uppercase text-gray-400">Target</label>
                    <input className="input h-8 bg-white" value={kpi1Target} onChange={(e) => setKpi1Target(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="text-[9px] font-bold uppercase text-gray-400">Achieved</label>
                    <input className="input h-8 bg-white" value={kpi1Achieved} onChange={(e) => setKpi1Achieved(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="text-[9px] font-bold uppercase text-gray-400">Score (1-5)</label>
                    <input type="number" min="1" max="5" className="input h-8 bg-white" value={kpi1Score} onChange={(e) => setKpi1Score(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">KPI Target 2</p>
                <div className="form-group">
                  <label className="text-[9px] font-bold uppercase text-gray-400">KPI Metric Title</label>
                  <input required className="input h-8 bg-white" value={kpi2Title} onChange={(e) => setKpi2Title(e.target.value)} />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="form-group">
                    <label className="text-[9px] font-bold uppercase text-gray-400">Target</label>
                    <input className="input h-8 bg-white" value={kpi2Target} onChange={(e) => setKpi2Target(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="text-[9px] font-bold uppercase text-gray-400">Achieved</label>
                    <input className="input h-8 bg-white" value={kpi2Achieved} onChange={(e) => setKpi2Achieved(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="text-[9px] font-bold uppercase text-gray-400">Score (1-5)</label>
                    <input type="number" min="1" max="5" className="input h-8 bg-white" value={kpi2Score} onChange={(e) => setKpi2Score(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Self Rating (1-5)</label>
                  <input type="number" min="1" max="5" className="input h-9" value={selfRating} onChange={(e) => setSelfRating(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Reviewer Rating (1-5)</label>
                  <input type="number" min="1" max="5" className="input h-9" value={reviewerRating} onChange={(e) => setReviewerRating(e.target.value)} />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddAppraisalModal(false)} className="btn-secondary h-9 px-4">Cancel</button>
                <button type="submit" className="btn-primary h-9 px-4">Compile Appraisal</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ── MODAL 5: REGISTER NEW DEPARTMENT ── */}
      {showAddDeptModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[60] animate-fade-in p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-gray-100 shadow-modal space-y-4">
            <div className="flex justify-between items-center border-b border-gray-50 pb-2">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                <Building className="h-4.5 w-4.5 text-primary" /> Register New Department
              </h3>
              <button onClick={() => setShowAddDeptModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDepartment} className="space-y-4 text-xs">
              <div className="form-group">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Department Name</label>
                <input
                  required
                  className="input h-9"
                  placeholder="e.g. Technology & Engineering"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Department Code</label>
                <input
                  required
                  className="input h-9 uppercase"
                  placeholder="e.g. TECH"
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Description</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-3 h-20 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  placeholder="Describe the department's focus..."
                  value={deptDesc}
                  onChange={(e) => setDeptDesc(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-50">
                <button type="button" onClick={() => setShowAddDeptModal(false)} className="btn-secondary h-9 px-4">Cancel</button>
                <button type="submit" className="btn-primary h-9 px-4">Create Department</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 6: CREATE WORK SHIFT ── */}
      {showAddShiftModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[60] animate-fade-in p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-gray-100 shadow-modal space-y-4">
            <div className="flex justify-between items-center border-b border-gray-50 pb-2">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                <Clock className="h-4.5 w-4.5 text-primary" /> Create Shift Schedule
              </h3>
              <button onClick={() => setShowAddShiftModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateShift} className="space-y-4 text-xs">
              <div className="form-group">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Shift Name</label>
                <input
                  required
                  className="input h-9"
                  placeholder="e.g. Night Shift"
                  value={shiftName}
                  onChange={(e) => setShiftName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Start Time</label>
                  <input
                    type="time"
                    required
                    className="input h-9 font-semibold"
                    value={shiftStartTime}
                    onChange={(e) => setShiftStartTime(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">End Time</label>
                  <input
                    type="time"
                    required
                    className="input h-9 font-semibold"
                    value={shiftEndTime}
                    onChange={(e) => setShiftEndTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Break Duration (mins)</label>
                  <input
                    type="number"
                    required
                    className="input h-9"
                    value={shiftBreakDuration}
                    onChange={(e) => setShiftBreakDuration(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Late Mark After (mins)</label>
                  <input
                    type="number"
                    required
                    className="input h-9"
                    value={shiftLateMarkAfter}
                    onChange={(e) => setShiftLateMarkAfter(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-50">
                <button type="button" onClick={() => setShowAddShiftModal(false)} className="btn-secondary h-9 px-4">Cancel</button>
                <button type="submit" className="btn-primary h-9 px-4">Create Shift</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
