'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/FormElements';
import { api, CashReceiptSummary, DashboardStats } from '@/utils/api';
import { formatDate } from '@/utils/dateFormat';

interface LocalDashboardStats {
  totalPatients: number;
  todayRevenue: number;
  totalTests: number;
  totalDoctors: number;
  totalExpenses: number;
  unpaidReferrals: number;
  paidReferrals: number;
  todaysNetCollection: number;
  recentTransactions: Array<{
    id: number;
    patientName: string;
    amount: number;
    date: string;
    type: string;
  }>;
}





interface Transaction {
  id: number;
  patientName: string;
  amount: number;
  date: string;
  type: string;
}



export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<LocalDashboardStats>({
    totalPatients: 0,
    todayRevenue: 0,
    totalTests: 0,
    totalDoctors: 0,
    totalExpenses: 0,
    unpaidReferrals: 0,
    paidReferrals: 0,
    todaysNetCollection: 0,
    recentTransactions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch dashboard stats from the backend API
      const dashboardStats: DashboardStats = await api.stats.getDashboardStats();
      
      // Get recent transactions
      let recentTransactions: Transaction[] = [];
      try {
        const receiptsData = await api.receipts.getAll();
        
        // Get recent transactions (last 5) - using CashReceiptSummary type
        recentTransactions = (receiptsData as CashReceiptSummary[])
          .sort((a, b) => new Date(b.BillDate).getTime() - new Date(a.BillDate).getTime())
          .slice(0, 5)
          .map((r) => ({
            id: r.ReceiptID,
            patientName: r.PatientName,
            amount: r.NetAmount || 0,
            date: formatDate(r.BillDate),
            type: 'Receipt'
          }));
      } catch (err) {
        console.warn('Could not fetch receipts:', err);
      }

      setStats({
        totalPatients: dashboardStats.totalPatients,
        todayRevenue: dashboardStats.todaysRevenue,
        totalTests: dashboardStats.totalTests,
        totalDoctors: dashboardStats.totalDoctors,
        totalExpenses: dashboardStats.todaysExpenseAmount || 0,
        unpaidReferrals: dashboardStats.pendingReferralAmount,
        paidReferrals: dashboardStats.paidReferralAmount || 0,
        todaysNetCollection: dashboardStats.todaysNetCollection || 0,
        recentTransactions
      });
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError('Failed to load dashboard data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Hospital Management Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Manage patients, services, and reports efficiently</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="mt-12 text-center">
            <div className="text-lg text-gray-600">Loading dashboard data...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mt-12 bg-red-100 text-red-700 p-4 rounded-md">
            {error}
            <button 
              onClick={fetchDashboardData}
              className="ml-4 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Dashboard Stats */}
        {!loading && !error && (
          <>
            {/* Key Metrics */}
            <div className="mt-8 md:mt-12">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Key Metrics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <Card className="p-4 sm:p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalPatients}</div>
                  <div className="text-gray-600">Total Patients</div>
                </Card>
                                <Card className="p-4 sm:p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">{stats.totalPatients}</div>
                  <div className="text-sm sm:text-base text-gray-600">Total Patients</div>
                </Card>
                <Card className="p-4 sm:p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">₹{stats.todayRevenue.toLocaleString()}</div>
                  <div className="text-sm sm:text-base text-gray-600">Today&apos;s Revenue</div>
                </Card>
                <Card className="p-4 sm:p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-2">{stats.totalTests}</div>
                  <div className="text-sm sm:text-base text-gray-600">Total Tests</div>
                </Card>
                <Card className="p-4 sm:p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="text-2xl sm:text-3xl font-bold text-orange-600 mb-2">{stats.totalDoctors}</div>
                  <div className="text-sm sm:text-base text-gray-600">Active Doctors</div>
                </Card>
              </div>
            </div>

            {/* Financial Overview */}
            <div className="mt-8 md:mt-12">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Financial Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <Card className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Today&apos;s Collection</h3>
                    <span className="text-xl sm:text-2xl">💰</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-green-600 mb-2">₹{stats.todaysNetCollection.toLocaleString()}</div>
                  <p className="text-gray-600 text-xs sm:text-sm">Net collection</p>
                </Card>
                <Card className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Today&apos;s Expenses</h3>
                    <span className="text-xl sm:text-2xl">💸</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-red-600 mb-2">₹{stats.totalExpenses.toLocaleString()}</div>
                  <p className="text-gray-600 text-xs sm:text-sm">Daily expenses</p>
                </Card>
                <Card className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Paid Referrals</h3>
                    <span className="text-xl sm:text-2xl">✅</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-2">₹{stats.paidReferrals.toLocaleString()}</div>
                  <p className="text-gray-600 text-xs sm:text-sm">Referrals paid today</p>
                </Card>
                <Card className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Unpaid Referrals</h3>
                    <span className="text-xl sm:text-2xl">⚠️</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-yellow-600 mb-2">₹{stats.unpaidReferrals.toLocaleString()}</div>
                  <p className="text-gray-600 text-xs sm:text-sm">Pending referral payments</p>
                  <button 
                    onClick={() => navigateTo('/referral-amount')}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Details →
                  </button>
                </Card>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="mt-8 md:mt-12">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Transactions</h2>
                <button 
                  onClick={() => navigateTo('/daily-collection')}
                  className="text-sm sm:text-base text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All →
                </button>
              </div>
              <Card className="overflow-hidden">
                {stats.recentTransactions.length === 0 ? (
                  <div className="p-4 sm:p-6 text-center text-gray-500 text-sm sm:text-base">
                    No recent transactions found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Patient
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                            Date
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                            Type
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {stats.recentTransactions.map((transaction) => (
                          <tr key={transaction.id} className="hover:bg-gray-50">
                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm font-medium text-gray-900">
                              <div className="whitespace-nowrap">{transaction.patientName}</div>
                              <div className="text-xs text-gray-500 sm:hidden mt-1">{transaction.date}</div>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                              {transaction.date}
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                              {transaction.type}
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-semibold text-right text-green-600">
                              ₹{transaction.amount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>

          </>
        )}
      </div>
    </div>
  );
}