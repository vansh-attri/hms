'use client';

import React, { useState, useEffect } from 'react';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { api } from '@/utils/api';

export default function Home() {
  const [dashboardStats, setDashboardStats] = useState({
    totalPatients: 0,
    totalServices: 0,
    activeServices: 0,
    recentPatientsCount: 0,
    todaysRevenue: 0,
    monthlyTotalRevenue: 0,
    pendingReferralAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const stats = await api.stats.getDashboard();
      setDashboardStats({
        totalPatients: stats.totalPatients || 0,
        totalServices: stats.totalTests || 0,
        activeServices: stats.totalDoctors || 0,
        recentPatientsCount: stats.recentPatientsCount || 0,
        todaysRevenue: stats.todaysRevenue || 0,
        monthlyTotalRevenue: stats.monthlyTotalRevenue || 0,
        pendingReferralAmount: stats.pendingReferralAmount || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-4 flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4">
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
        <button 
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-600">Welcome to the Hospital Management System</p>
      </div>
      <Dashboard stats={dashboardStats} />
    </div>
  );
}
