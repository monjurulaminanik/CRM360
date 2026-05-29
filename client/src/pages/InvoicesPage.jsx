import { useState, useEffect } from 'react';
import { 
  FileText, Plus, Search, DollarSign, CheckCircle2, Clock, 
  XCircle, ArrowUpRight, Receipt, Loader2, Trash2, Printer, 
  Download, Edit2, AlertCircle, ShoppingBag, Trash, HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getInvoices, createInvoice, updateInvoice, deleteInvoice } from '../services/invoiceService';
import { clientService } from '../services/clientService';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  
  // New invoice state
  const [newClientId, setNewClientId] = useState('');
  const [newCurrency, setNewCurrency] = useState('USD');
  const [newDueDate, setNewDueDate] = useState('');
  const [newNotes, setNewNotes] = useState('');
  
  // Interactive Line Items state for full stack billing constructor
  const [lineItems, setLineItems] = useState([
    { description: 'Custom Development & branding retainer', quantity: 1, rate: 1200 }
  ]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [invRes, cliRes] = await Promise.all([getInvoices(), clientService.getAll()]);
      if (invRes.success) setInvoices(invRes.data);
      if (cliRes.success) setClients(cliRes.data);
    } catch (error) {
      toast.error('Failed to fetch billing data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute stats dynamically from the current invoices state in real-time
  const getDynamicStats = () => {
    let collectedUSD = 0, collectedBDT = 0;
    let pendingUSD = 0, pendingBDT = 0;
    let overdueUSD = 0, overdueBDT = 0;

    (invoices || []).forEach(inv => {
      const amt = Number(inv.amount || 0);
      const status = inv.status || 'pending';
      if (status === 'paid') {
        if (inv.currency === 'USD') collectedUSD += amt;
        else collectedBDT += amt;
      } else if (status === 'pending') {
        if (inv.currency === 'USD') pendingUSD += amt;
        else pendingBDT += amt;
      } else if (status === 'overdue') {
        if (inv.currency === 'USD') overdueUSD += amt;
        else overdueBDT += amt;
      }
    });

    return {
      collected: collectedUSD > 0 || collectedBDT === 0 ? `$${collectedUSD.toLocaleString()} / ৳${collectedBDT.toLocaleString()}` : `৳${collectedBDT.toLocaleString()}`,
      pending: pendingUSD > 0 || pendingBDT === 0 ? `$${pendingUSD.toLocaleString()} / ৳${pendingBDT.toLocaleString()}` : `৳${pendingBDT.toLocaleString()}`,
      overdue: overdueUSD > 0 || overdueBDT === 0 ? `$${overdueUSD.toLocaleString()} / ৳${overdueBDT.toLocaleString()}` : `৳${overdueBDT.toLocaleString()}`
    };
  };

  const stats = getDynamicStats();

  // Handle line item construction changes
  const handleLineItemChange = (index, field, value) => {
    const updated = [...lineItems];
    if (field === 'description') {
      updated[index].description = value;
    } else {
      updated[index][field] = Number(value) || 0;
    }
    setLineItems(updated);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, rate: 0 }]);
  };

  const removeLineItem = (index) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, idx) => idx !== index));
  };

  // Compute billing summary on the fly
  const getSubtotal = () => lineItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const getGrandTotal = () => getSubtotal();

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!newClientId || lineItems.length === 0) return;
    
    try {
      const calculatedAmount = getGrandTotal();
      const finalLineItems = lineItems.map(item => ({
        ...item,
        amount: item.quantity * item.rate
      }));

      const newInv = {
        clientId: newClientId,
        dueDate: newDueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], // default 7 days due
        amount: calculatedAmount,
        currency: newCurrency,
        lineItems: finalLineItems,
        notes: newNotes,
        status: 'pending'
      };
      
      const res = await createInvoice(newInv);
      if (res.success) {
        setInvoices([res.data, ...(invoices || [])]);
        setNewClientId('');
        setNewNotes('');
        setLineItems([{ description: 'Custom Development & branding retainer', quantity: 1, rate: 1200 }]);
        setShowAddModal(false);
        toast.success('Invoice generated successfully! 💳');
      }
    } catch (error) {
      toast.error('Failed to create invoice');
    }
  };

  const handleStatusChange = async (id, nextStatus) => {
    try {
      const res = await updateInvoice(id, { status: nextStatus });
      if (res.success) {
        setInvoices((invoices || []).map(inv => inv._id === id ? res.data : inv));
        if (selectedInvoice && selectedInvoice._id === id) {
          setSelectedInvoice(res.data);
        }
        toast.success(`Invoice marked as ${nextStatus.toUpperCase()}!`);
      }
    } catch (error) {
      toast.error('Failed to update invoice status');
    }
  };

  const handleDeleteInvoice = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this invoice? This will wipe associated balance records.')) return;
    
    try {
      const res = await deleteInvoice(id);
      if (res.success) {
        setInvoices((invoices || []).filter(inv => inv._id !== id));
        setSelectedInvoice(null);
        toast.success('Invoice deleted completely');
      }
    } catch (error) {
      toast.error('Failed to delete invoice');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid': return 'bg-emerald-50 text-emerald-600 border-emerald-150/40';
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-150/40';
      default: return 'bg-red-50 text-red-600 border-red-150/40';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle2 className="h-3.5 w-3.5" />;
      case 'pending': return <Clock className="h-3.5 w-3.5" />;
      default: return <XCircle className="h-3.5 w-3.5" />;
    }
  };

  const getCurrencySymbol = (curr) => {
    switch (curr) {
      case 'BDT': return '৳';
      case 'EUR': return '€';
      default: return '$';
    }
  };

  const filteredInvoices = (invoices || []).filter(inv => 
    ((inv.clientId?.name || '').toLowerCase().includes(search.toLowerCase()) || 
     (inv.invoiceNumber || '').toLowerCase().includes(search.toLowerCase())) &&
    (filterStatus === 'all' || (inv.status || 'pending') === filterStatus)
  );

  return (
    <div className="page-container animate-fade-in font-sans space-y-6">
      
      {/* Header */}
      <div className="section-header">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Receipt className="h-6 w-6 text-primary" /> Dynamic Invoice Cockpit
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Manage corporate billings, issue print-ready PDF invoices, and calculate collections in real time.</p>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary gap-1.5 text-xs h-10 px-5 shadow-sm shadow-primary/10"
        >
          <Plus className="h-4.5 w-4.5" /> Generate Billing Invoice
        </button>
      </div>

      {/* Corporate Billing Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        <div className="card flex items-center justify-between p-5 bg-gradient-to-br from-emerald-500/5 to-transparent border border-emerald-500/10">
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Collections (Paid)</span>
            <h3 className="text-base font-extrabold text-emerald-600 mt-1.5 truncate max-w-[200px]">{stats.collected}</h3>
            <p className="text-[9px] text-emerald-500 mt-1 font-semibold">↑ Active client cashflows</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="h-5.5 w-5.5" />
          </div>
        </div>

        <div className="card flex items-center justify-between p-5 bg-gradient-to-br from-amber-500/5 to-transparent border border-amber-500/10">
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Receivables (Pending)</span>
            <h3 className="text-base font-extrabold text-amber-600 mt-1.5 truncate max-w-[200px]">{stats.pending}</h3>
            <p className="text-[9px] text-amber-500 mt-1 font-semibold">⏱️ Invoices in grace periods</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Clock className="h-5.5 w-5.5" />
          </div>
        </div>

        <div className="card flex items-center justify-between p-5 bg-gradient-to-br from-red-500/5 to-transparent border border-red-500/10">
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Arrears (Overdue)</span>
            <h3 className="text-base font-extrabold text-red-600 mt-1.5 truncate max-w-[200px]">{stats.overdue}</h3>
            <p className="text-[9px] text-red-500 mt-1 font-semibold">🚨 Requires immediate outreach</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center">
            <XCircle className="h-5.5 w-5.5" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-gray-400" />
          <input
            className="input pl-10 text-xs h-10 w-full"
            placeholder="Search by Invoice # (e.g. INV-2026-0001) or Client Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input sm:w-48 text-xs h-10"
        >
          <option value="all">All Invoices</option>
          <option value="paid">🟢 Paid Invoices</option>
          <option value="pending">🟡 Pending Invoices</option>
          <option value="overdue">🔴 Overdue Invoices</option>
        </select>
      </div>

      {/* Billing Ledger Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
      <div className="card p-0 overflow-hidden border border-slate-100 shadow-2xs rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 text-slate-400 border-b border-slate-100 font-bold uppercase tracking-widest text-[9px]">
                <th className="p-4">Invoice Number</th>
                <th className="p-4">Client Detail</th>
                <th className="p-4">Issue Date</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Actions & Lifecycle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/70">
              {filteredInvoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-slate-50/40 transition-colors duration-150 group">
                  {/* Invoice # */}
                  <td className="p-4 font-extrabold text-gray-800 flex items-center gap-2">
                    <FileText className="h-4.5 w-4.5 text-slate-400 group-hover:text-primary transition-colors" /> 
                    <span>{inv.invoiceNumber}</span>
                  </td>
                  
                  {/* Client */}
                  <td className="p-4">
                    <div className="font-bold text-gray-800">{inv.clientId?.name || 'Unknown Client'}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{inv.clientId?.company || 'Personal Client'}</div>
                  </td>
                  
                  {/* Issue Date */}
                  <td className="p-4 text-gray-500 font-medium">{new Date(inv.issueDate).toLocaleDateString()}</td>
                  
                  {/* Due Date */}
                  <td className="p-4 text-gray-500 font-medium">{new Date(inv.dueDate).toLocaleDateString()}</td>
                  
                  {/* Amount */}
                  <td className="p-4 font-extrabold text-slate-800 text-sm">
                    {getCurrencySymbol(inv.currency)} {inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  
                  {/* Status */}
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-[10px] font-bold ${getStatusBadge(inv.status || 'pending')}`}>
                      {getStatusIcon(inv.status || 'pending')} {(inv.status || 'pending').toUpperCase()}
                    </span>
                  </td>
                  
                  {/* Lifecycle Controls */}
                  <td className="p-4 text-center">
                    <div className="flex items-center gap-2 justify-center">
                      <button 
                        onClick={() => setSelectedInvoice(inv)}
                        className="btn-secondary h-7.5 px-3.5 text-[10px] font-bold gap-1 cursor-pointer"
                      >
                        Receipt <ArrowUpRight className="h-3 w-3" />
                      </button>

                      {/* Dropdown status update for fast invoicing workflow */}
                      <select
                        value={inv.status || 'pending'}
                        onChange={(e) => handleStatusChange(inv._id, e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg p-1 text-[10px] font-bold text-slate-600 focus:outline-none cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                      </select>

                      {/* Trash action for invoice ledger */}
                      <button 
                        onClick={() => handleDeleteInvoice(inv._id)}
                        className="p-1 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Delete Invoice"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!filteredInvoices.length && (
                <tr>
                  <td colSpan="7" className="text-center p-12 text-slate-400 font-bold bg-white">
                    No billing invoices match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* ── STUNNING PRINT-READY INVOICE DETAIL VIEW MODAL ── */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 border border-slate-100 shadow-modal max-h-[90vh] overflow-y-auto relative space-y-6">
            
            {/* Header controls */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                <Receipt className="h-5 w-5 text-primary" /> Invoice Summary View
              </h3>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="btn-secondary h-8 px-3 text-xs gap-1.5 cursor-pointer hover:bg-slate-100"
                >
                  <Printer className="h-3.5 w-3.5" /> Print Details
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="w-8 h-8 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Print Section Canvas */}
            <div id="print-area" className="space-y-6 relative p-2">
              
              {/* PAID / PENDING Diagonal Glow Stamp */}
              <div className="absolute right-4 top-2 select-none pointer-events-none transform rotate-12 opacity-85">
                {selectedInvoice.status === 'paid' ? (
                  <div className="border-4 border-emerald-500 text-emerald-600 font-extrabold text-sm uppercase tracking-widest px-4 py-1.5 rounded-xl bg-emerald-50/80 shadow-md">
                    PAID RECEIPT
                  </div>
                ) : (selectedInvoice.status || 'pending') === 'pending' ? (
                  <div className="border-4 border-amber-500 text-amber-600 font-extrabold text-sm uppercase tracking-widest px-4 py-1.5 rounded-xl bg-amber-50/80 shadow-md">
                    BALANCE DUE
                  </div>
                ) : (
                  <div className="border-4 border-red-500 text-red-600 font-extrabold text-sm uppercase tracking-widest px-4 py-1.5 rounded-xl bg-red-50/80 shadow-md">
                    OVERDUE
                  </div>
                )}
              </div>

              {/* Invoice details layout grid */}
              <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="font-black text-lg text-primary tracking-tight">DAWAT IT</div>
                  <p className="text-[10px] text-gray-400 leading-relaxed font-semibold">
                    Dawat IT & Consultancy Ltd.<br />
                    Mirpur-10, Dhaka-1216, Bangladesh<br />
                    billing@dawatit.com · www.dawatit.com
                  </p>
                </div>

                <div className="text-right space-y-1">
                  <div className="text-xs font-bold text-gray-800">INVOICE SPECIFICATION</div>
                  <h4 className="font-extrabold text-primary text-base leading-none mt-1">{selectedInvoice.invoiceNumber}</h4>
                  <div className="text-[10px] text-gray-400 pt-1">
                    Issued: {new Date(selectedInvoice.issueDate).toLocaleDateString()}<br />
                    Due Date: <span className="font-bold text-slate-800">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Client addresses specification */}
              <div className="bg-slate-50/80 border border-slate-100 p-4.5 rounded-2xl grid grid-cols-2 gap-4 text-[11px]">
                <div className="space-y-1 border-r border-slate-200/50 pr-4">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Billed To (Recipient):</span>
                  <div className="font-bold text-slate-800 text-xs">{selectedInvoice.clientId?.name || 'N/A'}</div>
                  <div className="text-slate-500">{selectedInvoice.clientId?.company || 'Personal Retainer'}</div>
                  <div className="text-slate-400 truncate">{selectedInvoice.clientId?.email || 'N/A'}</div>
                </div>

                <div className="space-y-1 pl-2">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Payment Overview:</span>
                  <div className="text-slate-500">Method: WhatsApp Online API Transfer</div>
                  <div className="text-slate-500">Status: <span className="font-bold capitalize">{selectedInvoice.status || 'pending'}</span></div>
                  <div className="text-slate-500 font-bold mt-1 text-xs">
                    Grand Total: {getCurrencySymbol(selectedInvoice.currency)} {selectedInvoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Detailed items ledger */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Billing Line Items</span>
                
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 font-bold uppercase tracking-wider text-[9px] text-slate-500">
                      <th className="p-3">Item Description</th>
                      <th className="p-3 text-center w-16">Qty</th>
                      <th className="p-3 text-right w-28">Unit Rate</th>
                      <th className="p-3 text-right w-32">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(selectedInvoice.lineItems || []).map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-semibold text-slate-800">{item.description}</td>
                        <td className="p-3 text-center font-mono">{item.quantity}</td>
                        <td className="p-3 text-right font-mono">{getCurrencySymbol(selectedInvoice.currency)} {item.rate.toLocaleString()}</td>
                        <td className="p-3 text-right font-bold text-slate-800 font-mono">
                          {getCurrencySymbol(selectedInvoice.currency)} {(item.quantity * item.rate).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total amount summary calculation */}
              <div className="border-t border-slate-100 pt-4 flex flex-col items-end text-xs space-y-2 font-semibold">
                <div className="flex justify-between w-64 border-t border-slate-200 pt-2 text-sm font-extrabold text-slate-800">
                  <span>Grand Total Paid:</span>
                  <span className="font-mono">{getCurrencySymbol(selectedInvoice.currency)} {selectedInvoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Notes block */}
              {selectedInvoice.notes && (
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-[10px] text-gray-500 leading-relaxed">
                  <span className="font-extrabold text-slate-700 uppercase tracking-wide block mb-1">Billing Notes:</span>
                  "{selectedInvoice.notes}"
                </div>
              )}

            </div>

            {/* Modal Bottom Actions */}
            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => handleDeleteInvoice(selectedInvoice._id)}
                className="btn-secondary text-red-500 hover:text-red-600 hover:bg-red-50 h-9.5 px-4 text-xs font-bold gap-1 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" /> Void (Delete) Invoice
              </button>

              <div className="flex gap-2">
                {selectedInvoice.status !== 'paid' && (
                  <button
                    onClick={() => handleStatusChange(selectedInvoice._id, 'paid')}
                    className="btn-primary bg-emerald-600 hover:bg-emerald-700 h-9.5 px-5 text-xs font-bold gap-1 cursor-pointer shadow-sm shadow-emerald-500/10"
                  >
                    Mark as Paid (Confirm Receipt)
                  </button>
                )}
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="btn-secondary h-9.5 px-5 text-xs font-bold cursor-pointer"
                >
                  Close Receipt
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── ADVANCED DYNAMIC BILLING CONSTRUCTOR MODAL ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-7 border border-slate-100 shadow-modal max-h-[90vh] overflow-y-auto space-y-5">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                <Receipt className="h-5 w-5 text-primary animate-pulse" /> Dynamic Invoicing Builder
              </h3>
              <p className="text-[10px] text-gray-400 mt-1">Add client products, hourly rates, or items. Estimates and taxes update in real time.</p>
            </div>
            
            <form onSubmit={handleCreateInvoice} className="space-y-4">
              {/* Client select */}
              <div className="form-group">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Billing Recipient Client</label>
                <select
                  required
                  className="input text-xs h-10 rounded-xl"
                  value={newClientId}
                  onChange={(e) => setNewClientId(e.target.value)}
                >
                  <option value="">Select a Client</option>
                  {clients.map(c => (
                    <option key={c._id} value={c._id}>{c.name} ({c.company || 'Personal'})</option>
                  ))}
                </select>
              </div>

              {/* Currency & Due Date specification */}
              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Currency</label>
                  <select 
                    value={newCurrency} 
                    onChange={(e) => setNewCurrency(e.target.value)}
                    className="input text-xs h-10 rounded-xl"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="BDT">BDT (৳)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Due Date</label>
                  <input
                    type="date"
                    className="input text-xs h-10 rounded-xl"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                  />
                </div>
              </div>

              {/* ── LINE ITEMS INTERACTIVE BUILDER ── */}
              <div className="border-t border-slate-100 pt-3.5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Billing Line Items</span>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="text-[10px] font-bold text-primary hover:text-primary-dark transition-colors flex items-center gap-1 px-2.5 py-1.5 bg-primary-light/50 rounded-xl cursor-pointer"
                  >
                    + Add New Line Item
                  </button>
                </div>

                <div className="space-y-2.5">
                  {lineItems.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {/* Description */}
                      <input
                        required
                        className="input text-xs flex-1 !h-8 rounded-lg"
                        placeholder="Item or service description..."
                        value={item.description}
                        onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                      />

                      {/* Quantity */}
                      <input
                        required
                        type="number"
                        min="1"
                        className="input text-xs w-14 text-center !h-8 rounded-lg font-mono"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                      />

                      {/* Rate */}
                      <div className="relative w-24">
                        <span className="absolute left-2.5 top-2 text-[10px] font-mono text-gray-400 pointer-events-none">
                          {getCurrencySymbol(newCurrency)}
                        </span>
                        <input
                          required
                          type="number"
                          min="0"
                          className="input text-xs pl-6 !h-8 rounded-lg font-mono text-right"
                          placeholder="Rate"
                          value={item.rate}
                          onChange={(e) => handleLineItemChange(index, 'rate', e.target.value)}
                        />
                      </div>

                      {/* Remove item button */}
                      <button
                        type="button"
                        onClick={() => removeLineItem(index)}
                        disabled={lineItems.length === 1}
                        className="text-slate-300 hover:text-red-500 disabled:opacity-30 cursor-pointer p-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-time calculated invoice estimates summary */}
              <div className="bg-slate-50 border border-slate-100 p-4.5 rounded-2xl flex flex-col items-end text-xs space-y-2">
                <div className="flex justify-between w-full text-xs font-extrabold text-slate-800">
                  <span>Calculated Grand Total Amount:</span>
                  <span className="font-mono">{getCurrencySymbol(newCurrency)} {getGrandTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Notes input */}
              <div className="form-group">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Invoice Terms & Notes (Optional)</label>
                <textarea
                  className="w-full rounded-xl border border-slate-200 text-xs p-2.5 focus:ring-1 focus:ring-primary focus:outline-none resize-none font-medium h-16"
                  placeholder="e.g. Please clear this invoice within 7 days. Thanks!"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                />
              </div>

              {/* Modal footer control buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary h-9.5 px-5 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary h-9.5 px-6 text-xs font-bold rounded-xl cursor-pointer shadow-sm shadow-primary/10"
                >
                  Issue Invoice Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
