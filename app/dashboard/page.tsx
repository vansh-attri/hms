'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/FormElements';

export default function DashboardPage() {
  const router = useRouter();

  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Hospital Management Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage patients, services, and reports efficiently</p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Patient Management */}
          <div className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateTo('/add-patient')}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
                <span className="text-blue-600 text-sm font-medium">Quick Access</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Patient</h3>
              <p className="text-gray-600 text-sm">Register new patients to the system</p>
            </Card>
          </div>

          <div className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateTo('/manage-patients')}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📋</span>
                </div>
                <span className="text-green-600 text-sm font-medium">Management</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Patients</h3>
              <p className="text-gray-600 text-sm">View and edit patient information</p>
            </Card>
          </div>

          {/* Financial Management */}
          <div className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateTo('/cash-receipt')}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
                <span className="text-yellow-600 text-sm font-medium">Billing</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cash Receipt</h3>
              <p className="text-gray-600 text-sm">Generate bills and receipts</p>
            </Card>
          </div>

          <div className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateTo('/daily-collection')}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <span className="text-purple-600 text-sm font-medium">Reports</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Daily Collection</h3>
              <p className="text-gray-600 text-sm">View daily revenue reports</p>
            </Card>
          </div>

          {/* Services Management */}
          <div className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateTo('/add-doctor')}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">👨‍⚕️</span>
                </div>
                <span className="text-red-600 text-sm font-medium">Staff</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Doctor</h3>
              <p className="text-gray-600 text-sm">Register new doctors</p>
            </Card>
          </div>

          <div className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateTo('/add-test')}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🧪</span>
                </div>
                <span className="text-indigo-600 text-sm font-medium">Services</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Test</h3>
              <p className="text-gray-600 text-sm">Manage test services</p>
            </Card>
          </div>

          <div className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateTo('/add-service')}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⚕️</span>
                </div>
                <span className="text-teal-600 text-sm font-medium">Services</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Service</h3>
              <p className="text-gray-600 text-sm">Add medical services</p>
            </Card>
          </div>

          <div className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateTo('/daily-expenses')}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">💸</span>
                </div>
                <span className="text-orange-600 text-sm font-medium">Finance</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Daily Expenses</h3>
              <p className="text-gray-600 text-sm">Track daily expenses</p>
            </Card>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">---</div>
              <div className="text-gray-600">Total Patients</div>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">---</div>
              <div className="text-gray-600">Today&apos;s Revenue</div>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">---</div>
              <div className="text-gray-600">Services Available</div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}