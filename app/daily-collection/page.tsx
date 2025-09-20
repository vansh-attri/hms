"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/FormElements';
import { api } from '@/utils/api';

interface ApiResponse {
  receipts: CollectionRecord[];
  stats: CollectionStats;
}

interface CollectionRecord {
  BillID: number;
  BillDate: string;
  PatientName: string;
  TestName: string;
  DoctorName: string;
  NetAmount: number;
  RefAmount: number;
  Age: string;
  Address: string;
  Gender: string;
  UserName: string;
  isRefPaid: boolean;
  ExpenseAmount: number;
  timestamp: string;
  collectedBy: string;
}

interface CollectionStats {
  totalNetAmount: number;
  totalRefAmount: number;
  totalExpenseAmount: number;
  netCollection: number;
  totalTransactions: number;
  avgTransactionValue: number;
  totalCollection: number;
  cashAmount: number;
  cardAmount: number;
  upiAmount: number;
  chequeAmount: number;
}

export default function DailyCollectionPage() {
  const [collections, setCollections] = useState<CollectionRecord[]>([]);
  const [stats, setStats] = useState<CollectionStats>({
    totalNetAmount: 0,
    totalRefAmount: 0,
    totalExpenseAmount: 0,
    netCollection: 0,
    totalTransactions: 0,
    avgTransactionValue: 0,
    totalCollection: 0,
    cashAmount: 0,
    cardAmount: 0,
    upiAmount: 0,
    chequeAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);

  // Only load data on initial mount with today's date
  useEffect(() => {
    const initialLoad = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await api.stats.getDailyCollection(fromDate, toDate) as ApiResponse;
        setCollections(data.receipts || []);
        setStats(data.stats || {
          totalNetAmount: 0,
          totalRefAmount: 0,
          totalExpenseAmount: 0,
          netCollection: 0,
          totalTransactions: 0,
          avgTransactionValue: 0,
          totalCollection: 0,
          cashAmount: 0,
          cardAmount: 0,
          upiAmount: 0,
          chequeAmount: 0
        });
      } catch (error) {
        console.error('Error fetching daily collection:', error);
        setError('Failed to load daily collection data');
        setCollections([]);
      } finally {
        setLoading(false);
      }
    };
    
    initialLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array for initial load only

  const fetchDailyCollection = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.stats.getDailyCollection(fromDate, toDate) as ApiResponse;
      setCollections(data.receipts || []);
      setStats(data.stats || {
        totalNetAmount: 0,
        totalRefAmount: 0,
        totalExpenseAmount: 0,
        netCollection: 0,
        totalTransactions: 0,
        avgTransactionValue: 0,
        totalCollection: 0,
        cashAmount: 0,
        cardAmount: 0,
        upiAmount: 0,
        chequeAmount: 0
      });
    } catch (error) {
      console.error('Error fetching daily collection:', error);
      setError('Failed to load daily collection data');
      setCollections([]);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['BillID', 'BillDate', 'PatientName', 'TestName', 'DoctorName', 'NetAmount', 'RefAmount', 'Age', 'Address', 'Gender', 'UserName', 'isRefPaid', 'ExpenseAmount'],
      ...collections.map(item => [
        item.BillID.toString(),
        item.BillDate,
        item.PatientName,
        item.TestName,
        item.DoctorName,
        item.NetAmount.toString(),
        item.RefAmount.toString(),
        item.Age,
        item.Address,
        item.Gender,
        item.UserName,
        item.isRefPaid ? 'Yes' : 'No',
        item.ExpenseAmount.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-collection-${fromDate}-to-${toDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="py-6 flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading daily collection...</div>
      </div>
    );
  }

  return (
    <div className="py-6">
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          {error}
          <button 
            onClick={fetchDailyCollection}
            className="ml-4 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Daily Collection</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <Button
              onClick={fetchDailyCollection}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-sm"
            >
              {loading ? 'Loading...' : 'Apply Filter'}
            </Button>
          </div>
          <div>
            <Button
              onClick={exportToCSV}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm"
            >
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-sm text-gray-600">Total Net Amount</p>
          <p className="text-xl font-bold text-blue-600">₹{stats.totalNetAmount.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-sm text-gray-600">Total Ref Amount</p>
          <p className="text-xl font-bold text-green-600">₹{stats.totalRefAmount.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-sm text-gray-600">Total Expenses</p>
          <p className="text-xl font-bold text-red-600">₹{stats.totalExpenseAmount.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-sm text-gray-600">Net Collection</p>
          <p className="text-xl font-bold text-purple-600">₹{stats.netCollection.toLocaleString()}</p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Daily Collection Report</h3>
          <p className="text-sm text-gray-600">
            {fromDate === toDate ? 
              `${new Date(fromDate).toLocaleDateString()}` : 
              `${new Date(fromDate).toLocaleDateString()} to ${new Date(toDate).toLocaleDateString()}`
            } • {collections.length} records
          </p>
        </div>

        {collections.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No collections found for the selected date range.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">BillID</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">BillDate</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">PatientName</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">TestName</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">DoctorName</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-700">NetAmount</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-700">RefAmount</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-700">Age</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Address</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-700">Gender</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-700">UserName</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-700">isRefPaid</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-700">ExpenseAmount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {collections.map((record, index) => (
                  <tr key={record.BillID} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2 font-medium text-blue-600">{record.BillID}</td>
                    <td className="px-3 py-2">{record.BillDate}</td>
                    <td className="px-3 py-2 font-medium">{record.PatientName}</td>
                    <td className="px-3 py-2">{record.TestName}</td>
                    <td className="px-3 py-2">{record.DoctorName}</td>
                    <td className="px-3 py-2 text-right font-semibold">{record.NetAmount}</td>
                    <td className="px-3 py-2 text-right">{record.RefAmount}</td>
                    <td className="px-3 py-2 text-center">{record.Age}</td>
                    <td className="px-3 py-2 truncate max-w-32" title={record.Address}>{record.Address}</td>
                    <td className="px-3 py-2 text-center">{record.Gender}</td>
                    <td className="px-3 py-2 text-center font-medium">{record.UserName}</td>
                    <td className="px-3 py-2 text-center">
                      {record.isRefPaid ? '☑' : '☐'}
                    </td>
                    <td className="px-3 py-2 text-right font-medium">{record.ExpenseAmount}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100 font-semibold">
                <tr>
                  <td colSpan={5} className="px-3 py-2 text-right">Total:</td>
                  <td className="px-3 py-2 text-right font-bold">{stats.totalNetAmount}</td>
                  <td className="px-3 py-2 text-right font-bold">{stats.totalRefAmount}</td>
                  <td colSpan={5}></td>
                  <td className="px-3 py-2 text-right font-bold">{stats.totalExpenseAmount}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
