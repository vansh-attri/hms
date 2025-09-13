'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/FormElements';
import { api } from '@/utils/api';

interface DashboardStats {
  totalPatients: number;
  totalServices: number;
  activeServices: number;
  recentPatientsCount: number;
  todaysRevenue: number;
  monthlyTotalRevenue: number;
  pendingReferralAmount: number;
}

interface DashboardProps {
  stats: DashboardStats;
}

interface RecentActivity {
  id?: number;
  type: string;
  description?: string;
  timestamp?: string;
  amount?: number;
  action: string;
  patientName: string;
  time: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivities();
  }, []);

  const fetchRecentActivities = async () => {
    try {
      setActivitiesLoading(true);
      const activities = await api.stats.getRecentActivities(4);
      setRecentActivities(activities);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      // Fallback to static data if API fails
      setRecentActivities([
        { action: 'New patient registration', patientName: 'Loading...', time: 'Just now', type: 'patient' },
        { action: 'Payment received', patientName: 'Loading...', time: 'Few minutes ago', type: 'payment' }
      ]);
    } finally {
      setActivitiesLoading(false);
    }
  };
  const quickActions = [
    {
      title: 'Add New Patient',
      description: 'Register a new patient in the system',
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      href: '/add-patient',
      buttonText: 'Add Patient',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
    },
    {
      title: 'Create Cash Receipt',
      description: 'Generate receipt for patient payments',
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
        </svg>
      ),
      href: '/cash-receipt',
      buttonText: 'Cash Receipt',
      bgColor: 'bg-green-50 hover:bg-green-100',
    },
    {
      title: 'Add New Test',
      description: 'Add medical tests and procedures',
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      href: '/add-test',
      buttonText: 'Add Test',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
    },
    {
      title: 'Add New Doctor',
      description: 'Create a doctor profile and availability',
      icon: (
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      href: '/add-doctor',
      buttonText: 'Add Doctor',
      bgColor: 'bg-red-50 hover:bg-red-100',
    },
  ];

  const statCards = [
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      change: '+12.5%',
      changeType: 'positive',
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      title: 'Today&apos;s Revenue',
      value: `₹${stats.todaysRevenue.toLocaleString()}`,
      change: '+8.2%',
      changeType: 'positive',
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      title: 'Active Services',
      value: stats.activeServices,
      change: '+2',
      changeType: 'positive',
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
    {
      title: 'Pending Referrals',
      value: `₹${stats.pendingReferralAmount.toLocaleString()}`,
      change: '+₹2,400',
      changeType: 'neutral',
      icon: (
        <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
  ];

  // recentActivities is now managed by useState above

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'patient':
        return <div className="w-2 h-2 bg-blue-400 rounded-full"></div>;
      case 'payment':
        return <div className="w-2 h-2 bg-green-400 rounded-full"></div>;
      case 'test':
        return <div className="w-2 h-2 bg-purple-400 rounded-full"></div>;
      case 'referral':
        return <div className="w-2 h-2 bg-orange-400 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">HMS Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome to Dr. Virender Ultrasound and Hospital Management System</p>
        <div className="mt-4 text-sm text-gray-500">
          Today: {new Date().toLocaleDateString('en-IN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`${card.bgColor} ${card.borderColor} border rounded-lg p-6 transition-transform duration-200 hover:scale-105 hover:shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-xs font-medium ${
                    card.changeType === 'positive' ? 'text-green-600' : 
                    card.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {card.change}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className="flex-shrink-0 ml-4">
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className={`${action.bgColor} rounded-lg p-6 transition-all duration-200 hover:shadow-lg transform hover:scale-105 border border-gray-200`}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex-shrink-0">
                  {action.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {action.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {action.description}
                  </p>
                  <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
                    {action.buttonText}
                    <svg className="ml-2 -mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Reports and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Activity">
          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                {activitiesLoading ? 'Loading activities...' : 'No recent activities'}
              </div>
            ) : (
              recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-2">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.patientName}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-6">
            <Link
              href="/manage-patients"
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              View all activities →
            </Link>
          </div>
        </Card>

        <Card title="Quick Reports">
          <div className="space-y-4">
            <Link
              href="/daily-collection"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Daily Collection Report</h4>
                  <p className="text-sm text-gray-600">View today&apos;s revenue and payments</p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
            
            <Link
              href="/referral-amount"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Referral Amount List</h4>
                  <p className="text-sm text-gray-600">Track doctor commissions</p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
            
            <Link
              href="/daily-expenses"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Daily Expenses</h4>
                  <p className="text-sm text-gray-600">Manage hospital expenses</p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
