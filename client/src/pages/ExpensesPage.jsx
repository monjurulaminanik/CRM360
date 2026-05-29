import { useState, useEffect } from 'react';
import { DollarSign, Plus, Search, CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getExpenses, createExpense, getCategories } from '../services/expenseService';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [expRes, catRes] = await Promise.all([getExpenses(), getCategories()]);
      if (expRes.success) setExpenses(expRes.data);
      if (catRes.success) setCategories(catRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAmount || !newCategoryId) return;
    
    try {
      const newExp = {
        title: newTitle,
        amount: Number(newAmount),
        categoryId: newCategoryId,
        status: 'pending',
      };
      
      const res = await createExpense(newExp);
      if (res.success) {
        setExpenses([res.data, ...expenses]);
        setNewTitle('');
        setNewAmount('');
        setNewCategoryId('');
        setShowAddModal(false);
        toast.success('Expense submitted successfully!');
      }
    } catch (error) {
      toast.error('Failed to submit expense');
    }
  };

  const filteredExpenses = expenses.filter(exp => 
    (exp.title.toLowerCase().includes(search.toLowerCase())) &&
    (filterStatus === 'all' || exp.status === filterStatus)
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid': 
      case 'approved': return 'bg-green-50 text-green-600 border-green-100';
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-red-50 text-red-600 border-red-100';
    }
  };

  return (
    <div className="page-container animate-fade-in font-sans">
      
      <div className="section-header">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" /> Expenses
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Manage business expenses and track financial outflows.</p>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary gap-1.5 text-xs"
        >
          <Plus className="h-4 w-4" /> Submit Expense
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
          <input
            className="input pl-9 text-xs"
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input sm:w-40 text-xs"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="paid">Paid</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
      <div className="card p-0 overflow-hidden shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-gray-400 border-b border-gray-100 font-bold uppercase tracking-wider">
                <th className="p-4">Date</th>
                <th className="p-4">Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Amount</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredExpenses.map((exp) => (
                <tr key={exp._id} className="hover:bg-slate-50/50 transition-colors duration-150">
                  <td className="p-4 text-gray-500">{new Date(exp.date).toLocaleDateString()}</td>
                  <td className="p-4 font-semibold text-gray-700">{exp.title}</td>
                  <td className="p-4 text-gray-500">{exp.categoryId?.name || 'Uncategorized'}</td>
                  <td className="p-4 font-bold text-gray-800">
                    {exp.amount.toLocaleString()} {exp.currency}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${getStatusBadge(exp.status)}`}>
                      {exp.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
              {!filteredExpenses.length && (
                <tr>
                  <td colSpan="5" className="text-center p-8 text-gray-400 font-medium">
                    No expenses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-gray-100 shadow-modal space-y-4">
            <h3 className="text-sm font-bold text-gray-800">Submit New Expense</h3>
            
            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div className="form-group">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Expense Title</label>
                <input
                  required
                  className="input text-xs"
                  placeholder="e.g. Server Hosting"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Amount</label>
                  <input
                    required
                    type="number"
                    className="input text-xs"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Category</label>
                  <select
                    required
                    className="input text-xs"
                    value={newCategoryId}
                    onChange={(e) => setNewCategoryId(e.target.value)}
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary h-8 text-xs px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary h-8 text-xs px-4"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
