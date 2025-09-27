'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';

interface ReferralRecord {
  id: number;
  doctorName: string;
  amount: number;
  patientName: string;
  date: string;
  originalDate: string;
  isPaid: boolean;
}

export default function ReferralAmountPage() {
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [doctors, setDoctors] = useState<Array<{id: number, name: string}>>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch referral data from receipts
      const [receiptsData, doctorsData] = await Promise.all([
        api.receipts.getAll(),
        api.doctors.getAll()
      ]);

      // Store doctors list for filter dropdown
      setDoctors(doctorsData.map(d => ({ id: d.id, name: d.name })));

      // Create doctor lookup map
      const doctorMap = new Map(doctorsData.map((d) => [d.id, d.name]));

      // Process receipts to extract referral information
      // Note: Backend returns more fields than defined in CashReceiptSummary type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const referralData: ReferralRecord[] = (receiptsData as any[])
        .filter((r) => r.RefAmount && r.RefAmount > 0 && r.DoctorID)
        .map((r) => {
          const billDate = new Date(r.BillDate);
          console.log('Processing referral:', {
            id: r.id,
            patientName: r.PatientName,
            originalBillDate: r.BillDate,
            parsedBillDate: billDate.toString(),
            formattedDate: billDate.toLocaleDateString(),
            isoDate: billDate.toISOString().split('T')[0]
          });
          
          return {
            id: r.id, // Use lowercase 'id' as returned by backend
            doctorName: doctorMap.get(r.DoctorID) || 'Unknown Doctor',
            amount: Number(r.RefAmount),
            patientName: r.PatientName,
            date: billDate.toLocaleDateString(), // Keep original for display
            originalDate: r.BillDate, // Store original date for filtering
            isPaid: r.isRefPaid === 1
          };
        });

      setReferrals(referralData);
    } catch {
      // Error fetching referral data
      setError('Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (id: number) => {
    if (updatingIds.has(id)) return; // Prevent double-clicks
    
    setUpdatingIds(prev => new Set(prev.add(id)));
    setError(''); // Clear any previous errors
    
    try {
      console.log(`Attempting to mark referral ${id} as paid...`);
      
      // First, fetch the existing receipt to get all required fields
      const existingReceipt = await api.receipts.getById(id);
      console.log('Fetched existing receipt:', existingReceipt);
      
      // Prepare the update payload with all existing data plus the new payment status
      const updatePayload = {
        PatientID: existingReceipt.PatientID || undefined,
        PatientName: existingReceipt.PatientName,
        BillDate: existingReceipt.BillDate,
        Discount: existingReceipt.Discount || 0,
        RefAmount: existingReceipt.RefAmount || 0,
        DoctorID: existingReceipt.DoctorID || undefined,
        isRefPaid: true, // This is the field we want to update
        Mobile: existingReceipt.Mobile || undefined,
        Age: existingReceipt.Age || undefined,
        Address: existingReceipt.Address || undefined,
        Gender: existingReceipt.Gender || undefined,
        RelationType: existingReceipt.RelationType || undefined,
        Relation: existingReceipt.Relation || undefined,
        items: existingReceipt.items || []
      };
      
      console.log('API call URL will be:', `https://hms-back-rosy.vercel.app/api/receipts/${id}`);
      console.log('API call payload:', updatePayload);
      
      // Call the API to update the receipt
      const result = await api.receipts.update(id, updatePayload);
      console.log('API update successful:', result);
      
      // Update local state
      setReferrals(prev => prev.map(r => r.id === id ? { ...r, isPaid: true } : r));
      
      // Show success message briefly
      setError(''); // Clear error if there was one
      
    } catch (error) {
      console.error('Error updating referral payment status:', error);
      console.error('Full error object:', error);
      
      // More detailed error message
      let errorMessage = 'Failed to update referral status';
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }
      
      setError(errorMessage);
      
      // Auto-clear error after 5 seconds
      setTimeout(() => setError(''), 5000);
    } finally {
      setUpdatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const getFilteredReferrals = () => {
    return referrals.filter(r => {
      // Status filter
      if (filter === 'paid' && !r.isPaid) return false;
      if (filter === 'unpaid' && r.isPaid) return false;
      
      // Date filter - fix inclusive date range filtering
      if (fromDate || toDate) {
        // Use the original date from backend for accurate comparison
        const referralDate = new Date(r.originalDate);
        const referralDateStr = referralDate.toISOString().split('T')[0]; // Get YYYY-MM-DD format
        
        // Debug logging
        console.log('Date comparison debug:', {
          displayDate: r.date,
          originalDate: r.originalDate,
          referralDate: referralDate.toString(),
          referralDateStr,
          fromDate,
          toDate,
          isValidFromDate: fromDate ? referralDateStr >= fromDate : true,
          isValidToDate: toDate ? referralDateStr <= toDate : true,
          passesFilter: (!fromDate || referralDateStr >= fromDate) && (!toDate || referralDateStr <= toDate)
        });
        
        if (fromDate) {
          if (referralDateStr < fromDate) return false;
        }
        
        if (toDate) {
          if (referralDateStr > toDate) return false;
        }
      }
      
      // Doctor filter
      if (selectedDoctor && r.doctorName !== selectedDoctor) return false;
      
      return true;
    });
  };

  const getTotalAmount = (isPaid = false) => {
    return getFilteredReferrals()
      .filter(r => r.isPaid === isPaid)
      .reduce((sum, r) => sum + r.amount, 0);
  };

  const clearFilters = () => {
    setFromDate('');
    setToDate('');
    setSelectedDoctor('');
    setFilter('all');
  };

  const handlePrint = () => {
    const filteredData = getFilteredReferrals();
    const totalPaid = getTotalAmount(true);
    const totalUnpaid = getTotalAmount(false);
    const totalAmount = totalPaid + totalUnpaid;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Referral Amount Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #16a34a; padding-bottom: 20px; }
            .header h1 { margin: 0; font-size: 24px; color: #16a34a; }
            .header p { margin: 5px 0; color: #666; }
            .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px; }
            .stat-card { padding: 15px; border: 1px solid #ddd; border-radius: 8px; text-align: center; }
            .stat-card h3 { margin: 0 0 8px 0; font-size: 14px; color: #666; }
            .stat-card p { margin: 0; font-size: 18px; font-weight: bold; }
            .stat-card.blue p { color: #2563eb; }
            .stat-card.green p { color: #16a34a; }
            .stat-card.gray p { color: #6b7280; }
            .filters-info { background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .filters-info h3 { margin: 0 0 10px 0; font-size: 16px; color: #374151; }
            .filters-info p { margin: 0; color: #6b7280; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f9fafb; font-weight: bold; }
            tbody tr:nth-child(even) { background-color: #f9fafb; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .status-paid { color: #16a34a; font-weight: bold; }
            .status-unpaid { color: #dc2626; font-weight: bold; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Referral Amount Report</h1>
            <p>Doctor Referral Commissions Management</p>
            <p>Generated: ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="filters-info">
            <h3>Applied Filters</h3>
            <p>
              ${fromDate || toDate ? `Date Range: ${fromDate || 'All'} to ${toDate || 'All'}` : 'Date Range: All dates'} | 
              Doctor: ${selectedDoctor || 'All doctors'} | 
              Status: ${filter === 'all' ? 'All statuses' : filter.charAt(0).toUpperCase() + filter.slice(1)} | 
              Total Records: ${filteredData.length}
            </p>
          </div>
          
          <div class="stats">
            <div class="stat-card blue">
              <h3>Total Unpaid</h3>
              <p>₹${totalUnpaid.toLocaleString()}</p>
            </div>
            <div class="stat-card green">
              <h3>Total Paid</h3>
              <p>₹${totalPaid.toLocaleString()}</p>
            </div>
            <div class="stat-card gray">
              <h3>Total Amount</h3>
              <p>₹${totalAmount.toLocaleString()}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Doctor Name</th>
                <th>Patient Name</th>
                <th class="text-right">Amount</th>
                <th class="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map(record => `
                <tr>
                  <td>${record.date}</td>
                  <td>${record.doctorName}</td>
                  <td>${record.patientName}</td>
                  <td class="text-right">₹${record.amount.toLocaleString()}</td>
                  <td class="text-center ${record.isPaid ? 'status-paid' : 'status-unpaid'}">
                    ${record.isPaid ? 'Paid' : 'Unpaid'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot style="background-color: #f3f4f6; font-weight: bold;">
              <tr>
                <td colspan="3" class="text-right"><strong>Total Amount:</strong></td>
                <td class="text-right"><strong>₹${totalAmount.toLocaleString()}</strong></td>
                <td></td>
              </tr>
              <tr>
                <td colspan="3" class="text-right">Paid:</td>
                <td class="text-right status-paid">₹${totalPaid.toLocaleString()}</td>
                <td></td>
              </tr>
              <tr>
                <td colspan="3" class="text-right">Unpaid:</td>
                <td class="text-right status-unpaid">₹${totalUnpaid.toLocaleString()}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading referral data...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <header className="bg-green-600 text-white px-6 py-4 rounded-t-md">
          <h1 className="text-2xl font-semibold">Referral Amount Management</h1>
          <p className="text-green-100 mt-1">Track and manage doctor referral commissions</p>
        </header>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 border-l-4 border-red-500">
            {error}
            <button 
              onClick={fetchData}
              className="ml-4 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        <section className="bg-white border border-gray-200 rounded-b-md p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-600">Total Unpaid</h3>
              <p className="text-2xl font-bold text-blue-900">₹{getTotalAmount(false).toLocaleString()}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-600">Total Paid</h3>
              <p className="text-2xl font-bold text-green-900">₹{getTotalAmount(true).toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-600">Total Referrals</h3>
              <p className="text-2xl font-bold text-gray-900">{referrals.length}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 space-y-4">
            {/* Date and Doctor Filters */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Filter Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Doctor
                  </label>
                  <select
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-sm"
                  >
                    <option value="">All Doctors</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.name}>
                        {doctor.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                  >
                    Clear Filters
                  </button>
                </div>
                <div>
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                  >
                    Print Report
                  </button>
                </div>
              </div>
            </div>

            {/* Status Filters */}
            <div className="flex space-x-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md ${
                  filter === 'all' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All ({getFilteredReferrals().length})
              </button>
              <button
                onClick={() => setFilter('unpaid')}
                className={`px-4 py-2 rounded-md ${
                  filter === 'unpaid' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Unpaid ({getFilteredReferrals().filter(r => !r.isPaid).length})
              </button>
              <button
                onClick={() => setFilter('paid')}
                className={`px-4 py-2 rounded-md ${
                  filter === 'paid' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Paid ({getFilteredReferrals().filter(r => r.isPaid).length})
              </button>
            </div>
          </div>

          {/* Referral List */}
          {getFilteredReferrals().length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No referrals found for the selected filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredReferrals().map((referral) => (
                    <tr key={referral.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {referral.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {referral.doctorName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {referral.patientName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ₹{referral.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          referral.isPaid 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {referral.isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {!referral.isPaid && (
                          <button
                            onClick={() => markAsPaid(referral.id)}
                            disabled={updatingIds.has(referral.id)}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                              updatingIds.has(referral.id)
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'text-green-600 hover:text-white hover:bg-green-600 border border-green-600'
                            }`}
                          >
                            {updatingIds.has(referral.id) ? 'Updating...' : 'Mark as Paid'}
                          </button>
                        )}
                        {referral.isPaid && (
                          <span className="text-gray-400 text-sm">Paid ✓</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
