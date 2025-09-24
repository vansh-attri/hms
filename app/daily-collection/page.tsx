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

  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Daily Collection Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .header h1 { margin: 0; font-size: 24px; color: #2563eb; }
            .header p { margin: 5px 0; color: #666; }
            .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
            .stat-card { padding: 15px; border: 1px solid #ddd; border-radius: 8px; text-align: center; }
            .stat-card h3 { margin: 0 0 8px 0; font-size: 14px; color: #666; }
            .stat-card p { margin: 0; font-size: 18px; font-weight: bold; }
            .stat-card.blue p { color: #2563eb; }
            .stat-card.green p { color: #16a34a; }
            .stat-card.red p { color: #dc2626; }
            .stat-card.purple p { color: #9333ea; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f9fafb; font-weight: bold; }
            tbody tr:nth-child(even) { background-color: #f9fafb; }
            tfoot { background-color: #f3f4f6; font-weight: bold; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Daily Collection Report</h1>
            <p>Date Range: ${fromDate === toDate ? 
              new Date(fromDate).toLocaleDateString() : 
              `${new Date(fromDate).toLocaleDateString()} to ${new Date(toDate).toLocaleDateString()}`
            }</p>
            <p>Total Records: ${collections.length} | Generated: ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="stats">
            <div class="stat-card blue">
              <h3>Total Net Amount</h3>
              <p>₹${stats.totalNetAmount.toLocaleString()}</p>
            </div>
            <div class="stat-card green">
              <h3>Total Ref Amount</h3>
              <p>₹${stats.totalRefAmount.toLocaleString()}</p>
            </div>
            <div class="stat-card red">
              <h3>Total Expenses</h3>
              <p>₹${stats.totalExpenseAmount.toLocaleString()}</p>
            </div>
            <div class="stat-card purple">
              <h3>Net Collection</h3>
              <p>₹${stats.netCollection.toLocaleString()}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Bill ID</th>
                <th>Date</th>
                <th>Patient Name</th>
                <th>Test Name</th>
                <th>Doctor</th>
                <th class="text-right">Net Amount</th>
                <th class="text-right">Ref Amount</th>
                <th class="text-center">Age</th>
                <th>Address</th>
                <th class="text-center">Gender</th>
                <th>User</th>
                <th class="text-center">Ref Paid</th>
                <th class="text-right">Expense</th>
              </tr>
            </thead>
            <tbody>
              ${collections.map(record => `
                <tr>
                  <td>${record.BillID}</td>
                  <td>${record.BillDate}</td>
                  <td>${record.PatientName}</td>
                  <td>${record.TestName}</td>
                  <td>${record.DoctorName}</td>
                  <td class="text-right">₹${record.NetAmount}</td>
                  <td class="text-right">₹${record.RefAmount}</td>
                  <td class="text-center">${record.Age}</td>
                  <td>${record.Address}</td>
                  <td class="text-center">${record.Gender}</td>
                  <td>${record.UserName}</td>
                  <td class="text-center">${record.isRefPaid ? 'Yes' : 'No'}</td>
                  <td class="text-right">₹${record.ExpenseAmount}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="5" class="text-right"><strong>Total:</strong></td>
                <td class="text-right"><strong>₹${stats.totalNetAmount}</strong></td>
                <td class="text-right"><strong>₹${stats.totalRefAmount}</strong></td>
                <td colspan="5"></td>
                <td class="text-right"><strong>₹${stats.totalExpenseAmount}</strong></td>
              </tr>
            </tfoot>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
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
              onClick={handlePrint}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm"
            >
              Print Report
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
