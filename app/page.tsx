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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome to the Hospital Management System
          </p>
        </div>
        
        <Dashboard stats={dashboardStats} />
      </div>
    </div>
  );
}
