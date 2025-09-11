'use client';

import React from 'react';
import { Dashboard } from '@/components/dashboard/Dashboard';

export default function Home() {
  // Simple dashboard stats (in a real app, these would come from API)
  const dashboardStats = {
    totalPatients: 1247,
    totalServices: 23,
    activeServices: 18,
    recentPatientsCount: 15
  };

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
