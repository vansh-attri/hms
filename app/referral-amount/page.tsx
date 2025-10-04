'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/utils/api';
import { formatDate } from '@/utils/dateFormat';

interface ReferralRecord {
  id: number;
  doctorName: string;
  amount: number;
  patientName: string;
  date: string;
  originalDate: string;
  isPaid: boolean;
  age?: string | null;
  address?: string | null;
  gender?: string | null;
  netAmount?: number | null;
  testName?: string | null;
  userName?: string | null;
  totalAmount?: number | null;
  discount?: number | null;
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
  
  // Separate state for applied filters (used for API calls)
  const [appliedFromDate, setAppliedFromDate] = useState('');
  const [appliedToDate, setAppliedToDate] = useState('');
  const [appliedDoctor, setAppliedDoctor] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Prepare API filters using applied filter state
      const filters: { doctorId?: number; from?: string; to?: string } = {};
      if (appliedFromDate) filters.from = appliedFromDate;
      if (appliedToDate) filters.to = appliedToDate;
      if (appliedDoctor) {
        const doctor = doctors.find(d => d.name === appliedDoctor);
        if (doctor) filters.doctorId = doctor.id;
      }

      // Fetch referral data using the referrals API with date filtering
      const [referralsData, doctorsData] = await Promise.all([
        api.referrals.getAll(filters),
        api.doctors.getAll()
      ]);

      // Store doctors list for filter dropdown (only if not already set)
      if (doctors.length === 0) {
        setDoctors(doctorsData.map((d: { id: number; name: string }) => ({ id: d.id, name: d.name })));
      }

      // Process referrals data
      const referralData: ReferralRecord[] = referralsData.map((r) => {
        const billDate = new Date(r.BillDate);
        
        return {
          id: r.ReceiptID, // Use ReceiptID as returned by referrals API
          doctorName: r.DoctorName || 'Unknown Doctor',
          amount: Number(r.RefAmount || 0),
          patientName: r.PatientName || 'Unknown Patient',
          date: formatDate(billDate), // Keep original for display
          originalDate: r.BillDate, // Store original date for filtering
          isPaid: r.isRefPaid === 1,
          age: r.Age || null,
          address: r.Address || null,
          gender: r.Gender || null,
          netAmount: r.NetAmount ? Number(r.NetAmount) : null, // Now calculated as TotalAmount - Discount - RefAmount
          testName: r.TestName || null,
          userName: r.UserName || null,
          totalAmount: r.TotalAmount ? Number(r.TotalAmount) : null,
          discount: r.Discount ? Number(r.Discount) : null
        };
      });

      setReferrals(referralData);
    } catch (error) {
      console.error('Error fetching referral data:', error);
      setError('Failed to load referral data');
    } finally {
      setLoading(false);
    }
  }, [appliedFromDate, appliedToDate, appliedDoctor, doctors]);

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Re-fetch when applied filters change

  const applyFilters = () => {
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
    setAppliedDoctor(selectedDoctor);
    // fetchData will be called automatically due to useEffect dependency on applied filters
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
      // Status filter (only client-side filtering needed now)
      if (filter === 'paid' && !r.isPaid) return false;
      if (filter === 'unpaid' && r.isPaid) return false;
      
      return true;
    });
  };

  const getGroupedReferrals = () => {
    const filtered = getFilteredReferrals();
    const grouped: { [key: string]: ReferralRecord[] } = {};
    
    filtered.forEach(referral => {
      const doctorName = referral.doctorName || 'Unknown Doctor';
      if (!grouped[doctorName]) {
        grouped[doctorName] = [];
      }
      grouped[doctorName].push(referral);
    });
    
    // Sort each doctor's referrals by date (newest first)
    Object.keys(grouped).forEach(doctor => {
      grouped[doctor].sort((a, b) => new Date(b.originalDate).getTime() - new Date(a.originalDate).getTime());
    });
    
    return grouped;
  };

  const getDoctorTotals = (referrals: ReferralRecord[]) => {
    return {
      totalAmount: referrals.reduce((sum, r) => sum + r.amount, 0),
      totalNetAmount: referrals.reduce((sum, r) => sum + (r.netAmount || 0), 0),
      paidAmount: referrals.filter(r => r.isPaid).reduce((sum, r) => sum + r.amount, 0),
      unpaidAmount: referrals.filter(r => !r.isPaid).reduce((sum, r) => sum + r.amount, 0),
      totalRecords: referrals.length,
      paidRecords: referrals.filter(r => r.isPaid).length,
      unpaidRecords: referrals.filter(r => !r.isPaid).length,
    };
  };

  const getTotalAmount = (isPaid = false) => {
    return getFilteredReferrals()
      .filter(r => r.isPaid === isPaid)
      .reduce((sum, r) => sum + r.amount, 0);
  };

  const getTotalNetAmount = (isPaid = false) => {
    return getFilteredReferrals()
      .filter(r => r.isPaid === isPaid)
      .reduce((sum, r) => sum + (r.netAmount || 0), 0);
  };

  const clearFilters = () => {
    setFromDate('');
    setToDate('');
    setSelectedDoctor('');
    setFilter('all');
    // Clear applied filters to trigger API call
    setAppliedFromDate('');
    setAppliedToDate('');
    setAppliedDoctor('');
  };

  const handlePrint = () => {
    const groupedData = getGroupedReferrals();
    const totalPaid = getTotalAmount(true);
    const totalUnpaid = getTotalAmount(false);
    const totalAmount = totalPaid + totalUnpaid;
    const totalNetPaid = getTotalNetAmount(true);
    const totalNetUnpaid = getTotalNetAmount(false);
    const totalNetAmount = totalNetPaid + totalNetUnpaid;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { margin-bottom: 30px; border-bottom: 2px solid #16a34a; padding-bottom: 20px; }
            .clinic-header { display: flex; align-items: center; justify-content: center; margin-bottom: 15px; }
            .logo-section { margin-right: 20px; }
            .clinic-logo { width: 60px; height: 60px; object-fit: contain; }
            .clinic-info { text-align: center; }
            .clinic-info h1 { margin: 0; font-size: 28px; color: #0891b2; font-weight: bold; }
            .clinic-subtitle { margin: 5px 0 0 0; color: #0891b2; font-size: 14px; }
            .report-info { text-align: center; margin-top: 15px; }
            .report-info h2 { margin: 0 0 10px 0; font-size: 20px; color: #333; }
            .report-info p { margin: 5px 0; color: #666; }
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
            .doctor-section { margin-bottom: 30px; }
            .doctor-header { background-color: #e5e7eb; padding: 10px; font-weight: bold; font-size: 16px; border: 1px solid #d1d5db; }
            .doctor-subtotals { background-color: #f3f4f6; padding: 8px; font-size: 12px; border: 1px solid #d1d5db; border-top: none; }
            table { width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 10px; }
            th, td { border: 1px solid #ddd; padding: 4px; text-align: left; white-space: nowrap; }
            th { background-color: #f9fafb; font-weight: bold; font-size: 11px; }
            tbody tr:nth-child(even) { background-color: #f9fafb; }
            .address-col { max-width: 120px; white-space: normal; word-wrap: break-word; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .status-paid { color: #16a34a; font-weight: bold; }
            .status-unpaid { color: #dc2626; font-weight: bold; }
            .grand-total { background-color: #1f2937; color: white; font-weight: bold; padding: 15px; margin-top: 20px; text-align: center; font-size: 16px; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="clinic-header">
              <div class="logo-section">
                <img src="/logo.png" alt="Siddhivinayak Logo" class="clinic-logo">
              </div>
              <div class="clinic-info">
                <h1>Siddhivinayak Ultrasound Centre</h1>
                <p class="clinic-subtitle">Diagnostic Ultrasound Imaging</p>
              </div>
            </div>
          </div>
          
          <div class="filters-info">
            <h3>Applied Filters</h3>
            <p>
              ${appliedFromDate || appliedToDate ? `Date Range: ${appliedFromDate || 'All'} to ${appliedToDate || 'All'}` : 'Date Range: All dates'} | 
              Doctor: ${appliedDoctor || 'All doctors'} | 
              Status: ${filter === 'all' ? 'All statuses' : filter.charAt(0).toUpperCase() + filter.slice(1)} | 
              Total Records: ${Object.values(groupedData).flat().length}
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

          ${Object.keys(groupedData).sort().map(doctorName => {
            const doctorReferrals = groupedData[doctorName];
            const doctorTotals = getDoctorTotals(doctorReferrals);
            
            return `
              <div class="doctor-section">
                <div class="doctor-header">
                  ${doctorName}
                </div>
                <div class="doctor-subtotals">
                  Records: ${doctorTotals.totalRecords} | 
                  Ref Amount: ₹${doctorTotals.totalAmount.toLocaleString()} | 
                  Net Amount: ₹${doctorTotals.totalNetAmount.toLocaleString()} | 
                  Paid: ₹${doctorTotals.paidAmount.toLocaleString()} (${doctorTotals.paidRecords}) | 
                  Unpaid: ₹${doctorTotals.unpaidAmount.toLocaleString()} (${doctorTotals.unpaidRecords})
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Ref Amount</th>
                      <th>Patient Name</th>
                      <th>Bill Date</th>
                      <th>Age</th>
                      <th>Address</th>
                      <th>Gender</th>
                      <th>Net Amount (Total-Discount-Referral)</th>
                      <th>Test Name</th>
                      <th>User Name</th>
                      <th>Ref Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${doctorReferrals.map((record, index) => `
                      <tr>
                        <td class="text-center">${index + 1}</td>
                        <td class="text-right">₹${record.amount.toLocaleString()}</td>
                        <td>${record.patientName}</td>
                        <td>${record.date}</td>
                        <td class="text-center">${record.age || '-'}</td>
                        <td class="address-col">${record.address || '-'}</td>
                        <td class="text-center">${record.gender || '-'}</td>
                        <td class="text-right">₹${record.netAmount ? record.netAmount.toLocaleString() : '-'}</td>
                        <td>${record.testName || '-'}</td>
                        <td>${record.userName || '-'}</td>
                        <td class="text-center ${record.isPaid ? 'status-paid' : 'status-unpaid'}">
                          ${record.isPaid ? 'Paid' : 'Unpaid'}
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `;
          }).join('')}

          <div class="grand-total">
            Grand Total: ₹${totalAmount.toLocaleString()}
          </div>
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
            {/* Applied Filters Display */}
            {(appliedFromDate || appliedToDate || appliedDoctor) && (
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Active Filters:</h4>
                <div className="flex flex-wrap gap-2 text-sm text-blue-700">
                  {appliedFromDate && (
                    <span className="bg-blue-100 px-2 py-1 rounded">
                      From: {appliedFromDate}
                    </span>
                  )}
                  {appliedToDate && (
                    <span className="bg-blue-100 px-2 py-1 rounded">
                      To: {appliedToDate}
                    </span>
                  )}
                  {appliedDoctor && (
                    <span className="bg-blue-100 px-2 py-1 rounded">
                      Doctor: {appliedDoctor}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Date and Doctor Filters */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Filter Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
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
                    onClick={applyFilters}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                  >
                    Apply Filters
                  </button>
                </div>
                <div>
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                  >
                    Clear Filters
                  </button>
                </div>
                <div>
                  <button
                    onClick={handlePrint}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
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

          {/* Grouped Referral List */}
          {getFilteredReferrals().length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No referrals found for the selected filter.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.keys(getGroupedReferrals()).sort().map((doctorName) => {
                const doctorReferrals = getGroupedReferrals()[doctorName];
                const doctorTotals = getDoctorTotals(doctorReferrals);
                
                return (
                  <div key={doctorName} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    {/* Doctor Header */}
                    <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">{doctorName}</h3>
                        <div className="mt-2 sm:mt-0 flex flex-wrap gap-4 text-sm text-gray-600">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Records: {doctorTotals.totalRecords}
                          </span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                            Total: ₹{doctorTotals.totalAmount.toLocaleString()}
                          </span>
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                            Unpaid: ₹{doctorTotals.unpaidAmount.toLocaleString()} ({doctorTotals.unpaidRecords})
                          </span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                            Paid: ₹{doctorTotals.paidAmount.toLocaleString()} ({doctorTotals.paidRecords})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Doctor's Referrals Table */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              #
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Ref Amount
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Patient Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Bill Date
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Age
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Address
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Gender
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Net Amount
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Test Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              User Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Ref Paid
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {doctorReferrals.map((referral, index) => (
                            <tr key={referral.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {index + 1}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                                ₹{referral.amount.toLocaleString()}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {referral.patientName}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {referral.date}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {referral.age || '-'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                                {referral.address || '-'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {referral.gender || '-'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                ₹{referral.netAmount ? referral.netAmount.toLocaleString() : '-'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                                {referral.testName || '-'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {referral.userName || '-'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  referral.isPaid 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {referral.isPaid ? 'Paid' : 'Unpaid'}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
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
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
