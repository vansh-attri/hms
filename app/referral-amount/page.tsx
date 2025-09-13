'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';

interface ReferralRecord {
  id: number;
  doctorName: string;
  amount: number;
  patientName: string;
  date: string;
  isPaid: boolean;
}

export default function ReferralAmountPage() {
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());

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

      // Create doctor lookup map
      const doctorMap = new Map(doctorsData.map((d) => [d.id, d.name]));

      // Process receipts to extract referral information
      // Note: Backend returns more fields than defined in CashReceiptSummary type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const referralData: ReferralRecord[] = (receiptsData as any[])
        .filter((r) => r.RefAmount && r.RefAmount > 0 && r.DoctorID)
        .map((r) => ({
          id: r.ID,
          doctorName: doctorMap.get(r.DoctorID) || 'Unknown Doctor',
          amount: Number(r.RefAmount),
          patientName: r.PatientName,
          date: new Date(r.BillDate).toLocaleDateString(),
          isPaid: r.isRefPaid === 1
        }));

      setReferrals(referralData);
    } catch (error) {
      console.error('Error fetching referral data:', error);
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
      console.log('API call URL will be:', `http://localhost:5000/api/receipts/${id}`);
      console.log('API call payload:', { isRefPaid: true });
      
      // Call the API to update the receipt
      const result = await api.receipts.update(id, { isRefPaid: true });
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
      if (filter === 'paid') return r.isPaid;
      if (filter === 'unpaid') return !r.isPaid;
      return true;
    });
  };

  const getTotalAmount = (isPaid = false) => {
    return referrals
      .filter(r => r.isPaid === isPaid)
      .reduce((sum, r) => sum + r.amount, 0);
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
          <div className="mb-6">
            <div className="flex space-x-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md ${
                  filter === 'all' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All ({referrals.length})
              </button>
              <button
                onClick={() => setFilter('unpaid')}
                className={`px-4 py-2 rounded-md ${
                  filter === 'unpaid' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Unpaid ({referrals.filter(r => !r.isPaid).length})
              </button>
              <button
                onClick={() => setFilter('paid')}
                className={`px-4 py-2 rounded-md ${
                  filter === 'paid' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Paid ({referrals.filter(r => r.isPaid).length})
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
