'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/FormElements';

interface ReferralData {
  id: string;
  doctorName: string;
  patientName: string;
  patientId: string;
  serviceProvided: string;
  serviceAmount: number;
  referralPercentage: number;
  referralAmount: number;
  date: string;
  status: 'Pending' | 'Paid' | 'Cancelled';
  paymentDate?: string;
}

interface ReferralSummary {
  [doctorName: string]: {
    totalAmount: number;
    pendingAmount: number;
    paidAmount: number;
    count: number;
  };
}

export default function ReferralAmountPage() {
  const [referrals, setReferrals] = useState<ReferralData[]>([
    {
      id: '1',
      doctorName: 'Dr. AW AZADWATI KAKRIPUR',
      patientName: 'John Doe',
      patientId: 'P001',
      serviceProvided: 'Ultrasound Scan',
      serviceAmount: 1500,
      referralPercentage: 20,
      referralAmount: 300,
      date: '2025-09-09',
      status: 'Pending',
    },
    {
      id: '2',
      doctorName: 'Dr. Virender Kumar',
      patientName: 'Jane Smith',
      patientId: 'P002',
      serviceProvided: 'Blood Test',
      serviceAmount: 800,
      referralPercentage: 15,
      referralAmount: 120,
      date: '2025-09-08',
      status: 'Paid',
      paymentDate: '2025-09-09',
    },
  ]);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Paid' | 'Cancelled'>('All');

  const handleStatusChange = (id: string, newStatus: 'Pending' | 'Paid' | 'Cancelled') => {
    setReferrals(prev => prev.map(referral => 
      referral.id === id 
        ? { 
            ...referral, 
            status: newStatus,
            paymentDate: newStatus === 'Paid' ? new Date().toISOString().split('T')[0] : undefined
          }
        : referral
    ));
  };

  const getFilteredReferrals = () => {
    return referrals.filter(referral => {
      const dateMatch = !selectedDate || referral.date === selectedDate;
      const doctorMatch = !selectedDoctor || referral.doctorName === selectedDoctor;
      const statusMatch = statusFilter === 'All' || referral.status === statusFilter;
      
      return dateMatch && doctorMatch && statusMatch;
    });
  };

  const getReferralSummary = (): ReferralSummary => {
    const summary: ReferralSummary = {};
    
    getFilteredReferrals().forEach(referral => {
      if (!summary[referral.doctorName]) {
        summary[referral.doctorName] = {
          totalAmount: 0,
          pendingAmount: 0,
          paidAmount: 0,
          count: 0,
        };
      }
      
      summary[referral.doctorName].totalAmount += referral.referralAmount;
      summary[referral.doctorName].count += 1;
      
      if (referral.status === 'Pending') {
        summary[referral.doctorName].pendingAmount += referral.referralAmount;
      } else if (referral.status === 'Paid') {
        summary[referral.doctorName].paidAmount += referral.referralAmount;
      }
    });
    
    return summary;
  };

  const getTotalPending = () => {
    return getFilteredReferrals()
      .filter(r => r.status === 'Pending')
      .reduce((sum, r) => sum + r.referralAmount, 0);
  };

  const getTotalPaid = () => {
    return getFilteredReferrals()
      .filter(r => r.status === 'Paid')
      .reduce((sum, r) => sum + r.referralAmount, 0);
  };

  const getUniqueDoctors = () => {
    return [...new Set(referrals.map(r => r.doctorName))];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'text-yellow-600 bg-yellow-100';
      case 'Paid': return 'text-green-600 bg-green-100';
      case 'Cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Referral Amount List</h1>
          <p className="mt-2 text-gray-600">
            Track and manage doctor referral commissions
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-lg font-medium mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Doctor
              </label>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Doctors</option>
                {getUniqueDoctors().map((doctor) => (
                  <option key={doctor} value={doctor}>{doctor}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'All' | 'Pending' | 'Paid' | 'Cancelled')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSelectedDate('');
                  setSelectedDoctor('');
                  setStatusFilter('All');
                }}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pending</p>
                <p className="text-2xl font-bold text-gray-900">₹{getTotalPending().toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Paid</p>
                <p className="text-2xl font-bold text-gray-900">₹{getTotalPaid().toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                <p className="text-2xl font-bold text-gray-900">{getFilteredReferrals().length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Doctor-wise Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-lg font-medium mb-4">Doctor-wise Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Doctor Name</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Referrals</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Total Amount</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Pending</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Paid</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(getReferralSummary()).map(([doctor, summary]) => (
                  <tr key={doctor}>
                    <td className="border border-gray-300 px-4 py-2 font-medium">{doctor}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{summary.count}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">₹{summary.totalAmount.toLocaleString()}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right text-yellow-600">₹{summary.pendingAmount.toLocaleString()}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right text-green-600">₹{summary.paidAmount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Referral List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="bg-indigo-600 text-white px-4 py-2 rounded-t-lg -mx-6 -mt-6 mb-6">
            <h2 className="text-xl font-semibold">📋 Referral Details</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Doctor</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Patient</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Service</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Service Amount</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">%</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Referral Amount</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Status</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredReferrals().map((referral) => (
                  <tr key={referral.id}>
                    <td className="border border-gray-300 px-4 py-2">
                      {new Date(referral.date).toLocaleDateString()}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{referral.doctorName}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {referral.patientName}
                      <br />
                      <span className="text-xs text-gray-500">({referral.patientId})</span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{referral.serviceProvided}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">₹{referral.serviceAmount.toLocaleString()}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{referral.referralPercentage}%</td>
                    <td className="border border-gray-300 px-4 py-2 text-right font-semibold">₹{referral.referralAmount.toLocaleString()}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(referral.status)}`}>
                        {referral.status}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      <div className="flex space-x-1">
                        {referral.status === 'Pending' && (
                          <Button
                            onClick={() => handleStatusChange(referral.id, 'Paid')}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1"
                          >
                            Mark Paid
                          </Button>
                        )}
                        {referral.status !== 'Cancelled' && (
                          <Button
                            onClick={() => handleStatusChange(referral.id, 'Cancelled')}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
