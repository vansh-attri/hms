"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/FormElements';

interface CollectionData {
  id: string;
  date: string;
  patientId: string;
  patientName: string;
  services: string[];
  amount: number;
  paymentMethod: 'Cash' | 'Card' | 'UPI' | 'Cheque';
  receiptNo: string;
  collectedBy: string;
  timestamp: string;
}

interface DailyStats {
  totalCollection: number;
  totalTransactions: number;
  cashAmount: number;
  cardAmount: number;
  upiAmount: number;
  chequeAmount: number;
  avgTransactionValue: number;
}

export default function DailyCollectionPage() {
  const [collections] = useState<CollectionData[]>([
    {
      id: '1',
      date: '2025-09-09',
      patientId: 'P001',
      patientName: 'John Doe',
      services: ['Ultrasound Scan', 'Blood Test'],
      amount: 2300,
      paymentMethod: 'Cash',
      receiptNo: 'RCP001',
      collectedBy: 'Admin',
      timestamp: '09:30 AM'
    },
    {
      id: '2',
      date: '2025-09-09',
      patientId: 'P002',
      patientName: 'Jane Smith',
      services: ['X-Ray', 'Consultation'],
      amount: 1500,
      paymentMethod: 'UPI',
      receiptNo: 'RCP002',
      collectedBy: 'Admin',
      timestamp: '11:15 AM'
    },
    {
      id: '3',
      date: '2025-09-09',
      patientId: 'P003',
      patientName: 'Mike Johnson',
      services: ['Blood Test', 'ECG'],
      amount: 800,
      paymentMethod: 'Card',
      receiptNo: 'RCP003',
      collectedBy: 'Admin',
      timestamp: '02:45 PM'
    },
  ]);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentFilter, setPaymentFilter] = useState<'All' | 'Cash' | 'Card' | 'UPI' | 'Cheque'>('All');
  const [sortBy, setSortBy] = useState<'time' | 'amount' | 'patient'>('time');

  const getFilteredCollections = () => {
    let filtered = collections.filter(collection => collection.date === selectedDate);
    
    if (paymentFilter !== 'All') {
      filtered = filtered.filter(collection => collection.paymentMethod === paymentFilter);
    }

    // Sort collections
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.amount - a.amount;
        case 'patient':
          return a.patientName.localeCompare(b.patientName);
        case 'time':
        default:
          return a.timestamp.localeCompare(b.timestamp);
      }
    });

    return filtered;
  };

  const getDailyStats = (): DailyStats => {
    const dayCollections = getFilteredCollections();
    
    const stats: DailyStats = {
      totalCollection: 0,
      totalTransactions: dayCollections.length,
      cashAmount: 0,
      cardAmount: 0,
      upiAmount: 0,
      chequeAmount: 0,
      avgTransactionValue: 0,
    };

    dayCollections.forEach(collection => {
      stats.totalCollection += collection.amount;
      
      switch (collection.paymentMethod) {
        case 'Cash':
          stats.cashAmount += collection.amount;
          break;
        case 'Card':
          stats.cardAmount += collection.amount;
          break;
        case 'UPI':
          stats.upiAmount += collection.amount;
          break;
        case 'Cheque':
          stats.chequeAmount += collection.amount;
          break;
      }
    });

    stats.avgTransactionValue = stats.totalTransactions > 0 ? stats.totalCollection / stats.totalTransactions : 0;

    return stats;
  };

  const exportToCSV = () => {
    const filteredData = getFilteredCollections();
    const csvContent = [
      ['Date', 'Time', 'Receipt No', 'Patient ID', 'Patient Name', 'Services', 'Amount', 'Payment Method', 'Collected By'],
      ...filteredData.map(item => [
        item.date,
        item.timestamp,
        item.receiptNo,
        item.patientId,
        item.patientName,
        item.services.join('; '),
        item.amount.toString(),
        item.paymentMethod,
        item.collectedBy
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-collection-${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const printReport = () => {
    window.print();
  };

  const stats = getDailyStats();

  return (
    <div className="py-6">
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Daily Collection Report</h1>
          <p className="mt-2 text-gray-600">
            Track daily revenue and payment collections
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value as typeof paymentFilter)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="All">All Methods</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="time">Time</option>
                <option value="amount">Amount</option>
                <option value="patient">Patient Name</option>
              </select>
            </div>
            <div>
              <Button
                onClick={exportToCSV}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Export CSV
              </Button>
            </div>
            <div>
              <Button
                onClick={printReport}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Print Report
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-pink-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Collection</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalCollection.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Transaction</p>
                <p className="text-2xl font-bold text-gray-900">₹{Math.round(stats.avgTransactionValue).toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cash Collection</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.cashAmount.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method Breakdown */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-lg font-medium mb-4">Payment Method Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">₹{stats.cashAmount.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Cash</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">₹{stats.cardAmount.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Card</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">₹{stats.upiAmount.toLocaleString()}</div>
              <div className="text-sm text-gray-600">UPI</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">₹{stats.chequeAmount.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Cheque</div>
            </div>
          </div>
        </div>

        {/* Detailed Collection List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="bg-pink-600 text-white px-4 py-2 rounded-t-lg -mx-6 -mt-6 mb-6">
            <h2 className="text-xl font-semibold">
              📊 Collection Details - {new Date(selectedDate).toLocaleDateString()}
            </h2>
          </div>

          {getFilteredCollections().length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No collections found for the selected date and filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Time</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Receipt No</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Patient</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Services</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Amount</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Payment Method</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Collected By</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredCollections().map((collection) => (
                    <tr key={collection.id}>
                      <td className="border border-gray-300 px-4 py-2">{collection.timestamp}</td>
                      <td className="border border-gray-300 px-4 py-2 font-medium">{collection.receiptNo}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div>
                          <div className="font-medium">{collection.patientName}</div>
                          <div className="text-xs text-gray-500">{collection.patientId}</div>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="text-sm">
                          {collection.services.map((service, index) => (
                            <div key={index} className="text-gray-700">{service}</div>
                          ))}
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right font-semibold">
                        ₹{collection.amount.toLocaleString()}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          collection.paymentMethod === 'Cash' ? 'bg-green-100 text-green-700' :
                          collection.paymentMethod === 'Card' ? 'bg-blue-100 text-blue-700' :
                          collection.paymentMethod === 'UPI' ? 'bg-purple-100 text-purple-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {collection.paymentMethod}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">{collection.collectedBy}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-semibold">
                    <td colSpan={4} className="border border-gray-300 px-4 py-2 text-right">Total:</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      ₹{getFilteredCollections().reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                    </td>
                    <td colSpan={2} className="border border-gray-300 px-4 py-2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
