import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { CheckCircle, RefreshCw, XCircle, Calendar } from 'lucide-react';

const FeeManagement = () => {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'report'
  
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  
  // States
  const [feesList, setFeesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Report Stats
  const [reportStats, setReportStats] = useState({ totalExpected: 0, totalCollected: 0, totalPending: 0 });

  const loadFees = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      let endpoint = `/fees?month=${month}`;
      if (activeTab === 'pending') {
        endpoint = `/fees?month=${month}&status=pending`;
      }
      const { data } = await api.get(endpoint);
      setFeesList(data);
      
      // Calculate report statistics
      if (activeTab === 'report') {
        let expected = 0;
        let collected = 0;
        let pending = 0;
        data.forEach((f) => {
          expected += f.amount;
          if (f.status === 'paid') {
            collected += f.amount;
          } else {
            pending += f.amount;
          }
        });
        setReportStats({ totalExpected: expected, totalCollected: collected, totalPending: pending });
      }
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Failed to retrieve monthly fee structures.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFees();
  }, [month, activeTab]);

  const handleMarkAsPaid = async (feeId) => {
    if (!window.confirm('Mark this invoice as Paid?')) return;
    try {
      await api.put(`/fees/${feeId}`, { status: 'paid' });
      setMessage({ text: 'Payment status updated successfully.', type: 'success' });
      loadFees();
    } catch (error) {
      setMessage({ text: 'Failed to update payment status.', type: 'error' });
    }
  };



  return (
    <div className="flex-1 p-6 space-y-6 text-left max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-luna-blue">Fee Manager</h1>
          <p className="text-sm text-slate-500 font-semibold mt-0.5">
            Auto-calculated fee tiers: Grades 1-5 (₹200), Grades 6-7 (₹300), Grades 8-9 (₹400).
          </p>
        </div>

        {/* Tab Controls */}
        <div className="grid grid-cols-2 bg-slate-50 p-1 rounded-xl border border-slate-100 shrink-0 w-full sm:w-64">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'pending' ? 'bg-white text-luna-blue shadow-sm' : 'text-slate-500'
            }`}
          >
            Unpaid Dues
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'report' ? 'bg-white text-luna-blue shadow-sm' : 'text-slate-500'
            }`}
          >
            Collection Report
          </button>
        </div>
      </div>

      {/* Date selector */}
        <div className="flex items-center gap-3 bg-white p-4 border border-slate-100 rounded-2xl shadow-sm max-w-sm">
          <Calendar className="w-5 h-5 text-slate-450" />
          <span className="text-xs font-bold text-slate-500 uppercase">Select Month:</span>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-800 text-sm font-semibold focus:outline-none focus:border-luna-blue"
          />
        </div>

      {/* Message feedback */}
      {message.text && (
        <div
          className={`p-4 rounded-2xl border font-semibold text-sm flex justify-between items-center ${
            message.type === 'success'
              ? 'bg-green-50 border-green-150 text-green-700'
              : 'bg-red-50 border-red-150 text-red-700'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage({ text: '', type: '' })} className="p-1 rounded hover:bg-slate-200/50">
            <XCircle className="w-4 h-4 text-slate-405" />
          </button>
        </div>
      )}

      {/* Unpaid dues tab */}
      {activeTab === 'pending' && (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-lg">Outstanding Payments for {month}</h3>
          </div>

          {loading ? (
            <div className="text-center py-16 text-slate-400 font-semibold flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-luna-blue" />
              <span>Fetching outstanding ledgers...</span>
            </div>
          ) : feesList.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-semibold">
              All clear! No pending payments found for {month}.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">
                    <th className="px-6 py-4">Student Name</th>
                    <th className="px-6 py-4">Grade Standard</th>
                    <th className="px-6 py-4">Parent Name</th>
                    <th className="px-6 py-4">Phone Number</th>
                    <th className="px-6 py-4">Fee Dues</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-650">
                  {feesList.map((fee) => (
                    <tr key={fee._id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800">{fee.studentId?.name || 'Unknown Student'}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                          Grade {fee.studentId?.standard}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{fee.studentId?.parentName || '-'}</td>
                      <td className="px-6 py-4 text-slate-500">{fee.studentId?.parentPhone || '-'}</td>
                      <td className="px-6 py-4 text-luna-blue font-extrabold">₹{fee.amount}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleMarkAsPaid(fee._id)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-luna-green/10 text-luna-green rounded-xl text-xs font-bold hover:bg-luna-green/20 transition-colors border border-luna-green/20"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Mark Paid
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}


      {/* Collection Report Tab */}
      {activeTab === 'report' && (
        <div className="space-y-6">
          {/* Report summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Expected Revenue</span>
              <h3 className="text-3xl font-extrabold text-slate-800">₹{reportStats.totalExpected}</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">100% invoices generated</p>
            </div>
            
            <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Collected Revenue</span>
              <h3 className="text-3xl font-extrabold text-luna-green">₹{reportStats.totalCollected}</h3>
              <p className="text-[10px] text-luna-green font-bold mt-1 uppercase">
                {reportStats.totalExpected ? Math.round((reportStats.totalCollected / reportStats.totalExpected) * 100) : 0}% compliance rate
              </p>
            </div>

            <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Outstanding Revenue</span>
              <h3 className="text-3xl font-extrabold text-red-505 text-orange-600">₹{reportStats.totalPending}</h3>
              <p className="text-[10px] text-orange-650 font-bold mt-1 uppercase">Requires payment collection followups</p>
            </div>
          </div>

          {/* List of all invoices */}
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-lg">Invoice Audit Trail for {month}</h3>
            </div>

            {loading ? (
              <div className="text-center py-16 text-slate-400 font-semibold flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 animate-spin text-luna-blue" />
                <span>Formulating report logs...</span>
              </div>
            ) : feesList.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-semibold">
                No invoices found for {month}. Generate batch invoices first.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">
                      <th className="px-6 py-4">Student Name</th>
                      <th className="px-6 py-4">Standard</th>
                      <th className="px-6 py-4">Dues Amount</th>
                      <th className="px-6 py-4">Payment Date</th>
                      <th className="px-6 py-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-650">
                    {feesList.map((fee) => (
                      <tr key={fee._id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800">{fee.studentId?.name || 'Unknown Student'}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                            Grade {fee.studentId?.standard}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-extrabold text-slate-800">₹{fee.amount}</td>
                        <td className="px-6 py-4 text-slate-500">
                          {fee.paidDate ? new Date(fee.paidDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full ${
                            fee.status === 'paid'
                              ? 'bg-green-55 bg-green-50 text-green-700 border border-green-150'
                              : 'bg-yellow-50 text-yellow-700 border border-yellow-150'
                          }`}>
                            {fee.status === 'paid' ? 'Paid' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeManagement;
