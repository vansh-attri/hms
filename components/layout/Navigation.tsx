'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Navigation: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    {
      id: 'add-patient',
      label: 'Add Patient',
      href: '/add-patient',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      bgColor: 'bg-blue-100 hover:bg-blue-200',
      iconColor: 'text-blue-600',
    },
    {
      id: 'cash-receipt',
      label: 'Cash Receipt',
      href: '/cash-receipt',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
        </svg>
      ),
      bgColor: 'bg-green-100 hover:bg-green-200',
      iconColor: 'text-green-600',
    },
    {
      id: 'add-test',
      label: 'Add Test',
      href: '/add-test',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      bgColor: 'bg-purple-100 hover:bg-purple-200',
      iconColor: 'text-purple-600',
    },
    {
      id: 'add-doctor',
      label: 'Add Doctor',
      href: '/add-doctor',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      bgColor: 'bg-red-100 hover:bg-red-200',
      iconColor: 'text-red-600',
    },
    {
      id: 'daily-expenses',
      label: 'Daily Expenses',
      href: '/daily-expenses',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-yellow-100 hover:bg-yellow-200',
      iconColor: 'text-yellow-600',
    },
    {
      id: 'referral-amount',
      label: 'Referral Amount',
      href: '/referral-amount',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      bgColor: 'bg-indigo-100 hover:bg-indigo-200',
      iconColor: 'text-indigo-600',
    },
    {
      id: 'daily-collection',
      label: 'Daily Collection Report',
      href: '/daily-collection',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      bgColor: 'bg-pink-100 hover:bg-pink-200',
      iconColor: 'text-pink-600',
    },
  ];

  return (
    <>
      {/* Header with hospital name */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Hospital Management System</h1>
              <p className="text-blue-100">Dr. Virender Ultrasound and Hospital</p>
            </div>
            <div className="text-right">
              <p className="text-blue-100">Welcome, Admin</p>
              <p className="text-sm text-blue-200">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation modules */}
      <nav className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 py-4">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`
                  ${item.bgColor} ${item.iconColor}
                  p-4 rounded-lg text-center transition-all duration-200 transform hover:scale-105 hover:shadow-md
                  ${pathname === item.href ? 'ring-2 ring-blue-500 shadow-lg' : ''}
                `}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className={item.iconColor}>
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {item.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Dashboard link */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link
              href="/"
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                ${pathname === '/' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              Dashboard
            </Link>
            <Link
              href="/manage-patients"
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                ${pathname === '/manage-patients' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              Manage Patients
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
