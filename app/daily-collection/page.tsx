"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/FormElements';
import { api } from '@/utils/api';
import { formatDate } from '@/utils/dateFormat';

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
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Only load data on initial mount with today's date
  useEffect(() => {
    const initialLoad = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await api.stats.getDailyCollection(fromDate, toDate) as ApiResponse;
        let filteredReceipts = data.receipts || [];
        
        // Apply category filter if not "All"
        if (selectedCategory !== 'All') {
          filteredReceipts = filteredReceipts.filter(record => {
            const testName = record.TestName?.toLowerCase() || '';
            switch (selectedCategory) {
              case 'USG':
                return testName.includes('usg') || testName.includes('ultrasound') || testName.includes('sonography');
              case 'X Ray':
                return testName.includes('x-ray') || testName.includes('xray') || testName.includes('x ray');
              case 'Lab':
                return testName.includes('lab') || testName.includes('blood') || testName.includes('urine') || 
                       testName.includes('test') || testName.includes('pathology');
              case 'IPD':
                return testName.includes('ipd') || testName.includes('inpatient');
              case 'OPD':
                return testName.includes('opd') || testName.includes('outpatient') || testName.includes('consultation');
              default:
                return true;
            }
          });
        }
        
        setCollections(filteredReceipts);
        
        // Calculate stats for filtered data
        // Calculate total expense by counting each day only once
        const groupedByDateInitial: { [key: string]: CollectionRecord[] } = {};
        filteredReceipts.forEach(record => {
          const date = record.BillDate.split(' ')[0];
          if (!groupedByDateInitial[date]) {
            groupedByDateInitial[date] = [];
          }
          groupedByDateInitial[date].push(record);
        });
        
        const totalExpenseAmountInitial = Object.keys(groupedByDateInitial).reduce((total, date) => {
          const dayRecords = groupedByDateInitial[date];
          const dayExpense = dayRecords.length > 0 ? (dayRecords[0].ExpenseAmount || 0) : 0;
          return total + dayExpense;
        }, 0);
        
        const filteredStats = {
          totalNetAmount: filteredReceipts.reduce((sum, record) => sum + (record.NetAmount || 0), 0),
          totalRefAmount: filteredReceipts.reduce((sum, record) => sum + (record.RefAmount || 0), 0),
          totalExpenseAmount: totalExpenseAmountInitial,
          netCollection: 0,
          totalTransactions: filteredReceipts.length,
          avgTransactionValue: 0,
          totalCollection: 0,
          cashAmount: 0,
          cardAmount: 0,
          upiAmount: 0,
          chequeAmount: 0
        };
        
        filteredStats.netCollection = filteredStats.totalNetAmount - filteredStats.totalRefAmount - filteredStats.totalExpenseAmount;
        filteredStats.avgTransactionValue = filteredStats.totalTransactions > 0 ? 
          filteredStats.totalNetAmount / filteredStats.totalTransactions : 0;
        
        setStats(filteredStats);
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

  // Refresh data when category changes
  useEffect(() => {
    if (collections.length > 0) {
      fetchDailyCollection();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const fetchDailyCollection = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.stats.getDailyCollection(fromDate, toDate) as ApiResponse;
      let filteredReceipts = data.receipts || [];
      
      // Apply category filter if not "All"
      if (selectedCategory !== 'All') {
        filteredReceipts = filteredReceipts.filter(record => {
          const testName = record.TestName?.toLowerCase() || '';
          switch (selectedCategory) {
            case 'USG':
              return testName.includes('usg') || testName.includes('ultrasound') || testName.includes('sonography');
            case 'X Ray':
              return testName.includes('x-ray') || testName.includes('xray') || testName.includes('x ray');
            case 'Lab':
              return testName.includes('lab') || testName.includes('blood') || testName.includes('urine') || 
                     testName.includes('test') || testName.includes('pathology');
            case 'IPD':
              return testName.includes('ipd') || testName.includes('inpatient');
            case 'OPD':
              return testName.includes('opd') || testName.includes('outpatient') || testName.includes('consultation');
            default:
              return true;
          }
        });
      }
      
      setCollections(filteredReceipts);
      
      // Recalculate stats for filtered data
      // Calculate total expense by counting each day only once
      const groupedByDate: { [key: string]: CollectionRecord[] } = {};
      filteredReceipts.forEach(record => {
        const date = record.BillDate.split(' ')[0];
        if (!groupedByDate[date]) {
          groupedByDate[date] = [];
        }
        groupedByDate[date].push(record);
      });
      
      const totalExpenseAmount = Object.keys(groupedByDate).reduce((total, date) => {
        const dayRecords = groupedByDate[date];
        const dayExpense = dayRecords.length > 0 ? (dayRecords[0].ExpenseAmount || 0) : 0;
        return total + dayExpense;
      }, 0);
      
      const filteredStats = {
        totalNetAmount: filteredReceipts.reduce((sum, record) => sum + (record.NetAmount || 0), 0),
        totalRefAmount: filteredReceipts.reduce((sum, record) => sum + (record.RefAmount || 0), 0),
        totalExpenseAmount: totalExpenseAmount,
        netCollection: 0, // Will be calculated
        totalTransactions: filteredReceipts.length,
        avgTransactionValue: 0, // Will be calculated
        totalCollection: 0,
        cashAmount: 0,
        cardAmount: 0,
        upiAmount: 0,
        chequeAmount: 0
      };
      
      filteredStats.netCollection = filteredStats.totalNetAmount - filteredStats.totalRefAmount - filteredStats.totalExpenseAmount;
      filteredStats.avgTransactionValue = filteredStats.totalTransactions > 0 ? 
        filteredStats.totalNetAmount / filteredStats.totalTransactions : 0;
      
      setStats(filteredStats);
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
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .clinic-header { display: flex; align-items: center; justify-content: center; margin-bottom: 15px; }
            .logo-section { margin-right: 20px; }
            .clinic-logo { width: 60px; height: 60px; object-fit: contain; }
            .clinic-info { text-align: center; }
            .clinic-info h1 { margin: 0; font-size: 28px; color: #0891b2; font-weight: bold; }
            .clinic-subtitle { margin: 5px 0 0 0; color: #0891b2; font-size: 14px; }
            .report-info { text-align: center; margin-top: 15px; }
            .report-info h2 { margin: 0 0 10px 0; font-size: 20px; color: #333; }
            .report-info p { margin: 5px 0; color: #666; }
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
            <div class="clinic-header">
              <div class="logo-section">
                <img src="/logo.png" alt="Siddhivinayak Logo" class="clinic-logo">
              </div>
              <div class="clinic-info">
                <h1>Siddhivinayak Ultrasound Centre</h1>
                <p class="clinic-subtitle">Diagnostic Ultrasound Imaging</p>
              </div>
            </div>
            <div class="report-info">
              <p>Date Range: ${fromDate === toDate ? 
                formatDate(fromDate) : 
                `${formatDate(fromDate)} to ${formatDate(toDate)}`
              }</p>
              <p>Test Category: ${selectedCategory} | Total Records: ${collections.length} | Generated: ${formatDate(new Date().toISOString())}</p>
            </div>
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
              <p>₹${(() => {
                // Calculate total expense by counting each day only once
                const groupedByDate: { [key: string]: CollectionRecord[] } = {};
                collections.forEach((record: CollectionRecord) => {
                  const date = record.BillDate.split(' ')[0];
                  if (!groupedByDate[date]) {
                    groupedByDate[date] = [];
                  }
                  groupedByDate[date].push(record);
                });
                
                return Object.keys(groupedByDate).reduce((total: number, date: string) => {
                  const dayRecords = groupedByDate[date];
                  const dayExpense = dayRecords.length > 0 ? (dayRecords[0].ExpenseAmount || 0) : 0;
                  return total + dayExpense;
                }, 0).toLocaleString();
              })()}</p>
            </div>
            <div class="stat-card purple">
              <h3>Net Collection</h3>
              <p>₹${(stats.totalNetAmount - stats.totalRefAmount - stats.totalExpenseAmount).toLocaleString()}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Day Wise</th>
                <th>Expense</th>
                <th>#</th>
                <th>Doctor Name</th>
                <th>Patient Name</th>
                <th>Bill Date</th>
                <th class="text-center">Age</th>
                <th class="text-center">Gender</th>
                <th class="text-right">Net Amount</th>
                <th class="text-right">Ref Amount</th>
                <th>User Name</th>
                <th class="text-center">Ref Paid</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              ${(() => {
                // Group collections by date
                const groupedByDate: { [key: string]: CollectionRecord[] } = {};
                collections.forEach(record => {
                  const date = record.BillDate.split(' ')[0];
                  if (!groupedByDate[date]) {
                    groupedByDate[date] = [];
                  }
                  groupedByDate[date].push(record);
                });

                let tableRows = '';
                let serialNumber = 1;

                Object.keys(groupedByDate).sort().forEach(date => {
                  const dayRecords = groupedByDate[date];
                  const dayNetTotal = dayRecords.reduce((sum, record) => sum + (record.NetAmount || 0), 0);
                  const dayRefTotal = dayRecords.reduce((sum, record) => sum + (record.RefAmount || 0), 0);
                  // Get expense amount from first record only (should be same for all records of the day)
                  const dayExpenseTotal = dayRecords.length > 0 ? (dayRecords[0].ExpenseAmount || 0) : 0;

                  dayRecords.forEach((record, index) => {
                    tableRows += 
                      '<tr>' +
                        '<td>' + (index === 0 ? formatDate(date) : '') + '</td>' +
                        '<td>' + (index === 0 ? dayExpenseTotal : '') + '</td>' +
                        '<td>' + serialNumber + '</td>' +
                        '<td>' + record.DoctorName + '</td>' +
                        '<td>' + record.PatientName + '</td>' +
                        '<td>' + formatDate(record.BillDate) + '</td>' +
                        '<td class="text-center">' + record.Age + '</td>' +
                        '<td class="text-center">' + record.Gender + '</td>' +
                        '<td class="text-right">' + record.NetAmount + '</td>' +
                        '<td class="text-right">' + record.RefAmount + '</td>' +
                        '<td>' + record.UserName + '</td>' +
                        '<td class="text-center">' + (record.isRefPaid ? 'Paid' : 'Unpaid') + '</td>' +
                        '<td>' + record.TestName + '</td>' +
                      '</tr>';
                    serialNumber++;
                  });

                  // Add day subtotal row
                  if (dayRecords.length > 1) {
                    tableRows += 
                      '<tr style="background-color: #fff3cd; font-weight: bold;">' +
                        '<td colspan="8" class="text-right">Day Total:</td>' +
                        '<td class="text-right">' + dayNetTotal + '</td>' +
                        '<td class="text-right">' + dayRefTotal + '</td>' +
                        '<td colspan="3"></td>' +
                      '</tr>';
                  }
                });

                return tableRows;
              })()}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="1" class="text-right"><strong>Grand Total</strong></td>
                <td class="text-right"><strong>${(() => {
                  // Calculate total expense by counting each day only once
                  const groupedByDate: { [key: string]: CollectionRecord[] } = {};
                  collections.forEach(record => {
                    const date = record.BillDate.split(' ')[0];
                    if (!groupedByDate[date]) {
                      groupedByDate[date] = [];
                    }
                    groupedByDate[date].push(record);
                  });
                  
                  return Object.keys(groupedByDate).reduce((total, date) => {
                    const dayRecords = groupedByDate[date];
                    const dayExpense = dayRecords.length > 0 ? (dayRecords[0].ExpenseAmount || 0) : 0;
                    return total + dayExpense;
                  }, 0);
                })()}</strong></td>
                <td colspan="6"></td>
                <td class="text-right"><strong>${stats.totalNetAmount}</strong></td>
                <td class="text-right"><strong>${stats.totalRefAmount}</strong></td>
                <td colspan="3"></td>
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
        <div className="space-y-4">
          {/* Date Range Filters */}
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
                {loading ? 'Loading...' : 'Search'}
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

          {/* Test Category Filter */}
          <div className="border-t pt-4">
            <div className="bg-yellow-100 px-4 py-2 rounded-md mb-3">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Select Test Category
              </label>
              <div className="flex flex-wrap gap-4">
                {['USG', 'X Ray', 'Lab', 'IPD', 'OPD', 'All'].map((category) => (
                  <label key={category} className="flex items-center">
                    <input
                      type="radio"
                      name="testCategory"
                      value={category}
                      checked={selectedCategory === category}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>
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
          <p className="text-xl font-bold text-red-600">₹{(() => {
            // Calculate total expense by counting each day only once
            const groupedByDate: { [key: string]: CollectionRecord[] } = {};
            collections.forEach((record: CollectionRecord) => {
              const date = record.BillDate.split(' ')[0];
              if (!groupedByDate[date]) {
                groupedByDate[date] = [];
              }
              groupedByDate[date].push(record);
            });
            
            return Object.keys(groupedByDate).reduce((total: number, date: string) => {
              const dayRecords = groupedByDate[date];
              const dayExpense = dayRecords.length > 0 ? (dayRecords[0].ExpenseAmount || 0) : 0;
              return total + dayExpense;
            }, 0).toLocaleString();
          })()}</p>
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
              `${formatDate(fromDate)}` : 
              `${formatDate(fromDate)} to ${formatDate(toDate)}`
            } • Category: {selectedCategory} • {collections.length} records
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
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Day Wise</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Expense</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">#</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Doctor Name</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Patient Name</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Bill Date</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-700">Age</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-700">Gender</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-700">Net Amount</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-700">Ref Amount</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-700">User Name</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-700">Ref Paid</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(() => {
                  // Group collections by date
                  const groupedByDate: { [key: string]: CollectionRecord[] } = {};
                  collections.forEach(record => {
                    const date = record.BillDate.split(' ')[0];
                    if (!groupedByDate[date]) {
                      groupedByDate[date] = [];
                    }
                    groupedByDate[date].push(record);
                  });

                  const rows: React.ReactNode[] = [];
                  let serialNumber = 1;
                  let globalIndex = 0;

                  Object.keys(groupedByDate).sort().forEach(date => {
                    const dayRecords = groupedByDate[date];
                    const dayNetTotal = dayRecords.reduce((sum, record) => sum + (record.NetAmount || 0), 0);
                    const dayRefTotal = dayRecords.reduce((sum, record) => sum + (record.RefAmount || 0), 0);
                    const dayExpenseTotal = dayRecords.length > 0 ? (dayRecords[0].ExpenseAmount || 0) : 0;

                    dayRecords.forEach((record, index) => {
                      rows.push(
                        <tr key={record.BillID} className={globalIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-3 py-2">{index === 0 ? formatDate(date) : ''}</td>
                          <td className="px-3 py-2">{index === 0 ? dayExpenseTotal : ''}</td>
                          <td className="px-3 py-2 font-medium text-blue-600">{serialNumber}</td>
                          <td className="px-3 py-2">{record.DoctorName}</td>
                          <td className="px-3 py-2 font-medium">{record.PatientName}</td>
                          <td className="px-3 py-2">{formatDate(record.BillDate)}</td>
                          <td className="px-3 py-2 text-center">{record.Age}</td>
                          <td className="px-3 py-2 text-center">{record.Gender}</td>
                          <td className="px-3 py-2 text-right font-semibold">{record.NetAmount}</td>
                          <td className="px-3 py-2 text-right">{record.RefAmount}</td>
                          <td className="px-3 py-2 text-center font-medium">{record.UserName}</td>
                          <td className="px-3 py-2 text-center">
                            {record.isRefPaid ? 'Paid' : 'Unpaid'}
                          </td>
                          <td className="px-3 py-2">{record.TestName}</td>
                        </tr>
                      );
                      serialNumber++;
                      globalIndex++;
                    });

                    // Add day subtotal row
                    if (dayRecords.length > 1) {
                      rows.push(
                        <tr key={`subtotal-${date}`} className="bg-yellow-100 font-bold">
                          <td colSpan={8} className="px-3 py-2 text-right">Day Total:</td>
                          <td className="px-3 py-2 text-right">{dayNetTotal}</td>
                          <td className="px-3 py-2 text-right">{dayRefTotal}</td>
                          <td colSpan={3}></td>
                        </tr>
                      );
                      globalIndex++;
                    }
                  });

                  return rows;
                })()}
              </tbody>
              <tfoot className="bg-gray-100 font-semibold">
                <tr>
                  <td colSpan={1} className="px-3 py-2 text-right">Grand Total:</td>
                  <td className="px-3 py-2 text-right font-bold">{(() => {
                    const groupedByDate: { [key: string]: CollectionRecord[] } = {};
                    collections.forEach((record: CollectionRecord) => {
                      const date = record.BillDate.split(' ')[0];
                      if (!groupedByDate[date]) {
                        groupedByDate[date] = [];
                      }
                      groupedByDate[date].push(record);
                    });
                    
                    return Object.keys(groupedByDate).reduce((total: number, date: string) => {
                      const dayRecords = groupedByDate[date];
                      const dayExpense = dayRecords.length > 0 ? (dayRecords[0].ExpenseAmount || 0) : 0;
                      return total + dayExpense;
                    }, 0);
                  })()}</td>
                  <td colSpan={6}></td>
                  <td className="px-3 py-2 text-right font-bold">{stats.totalNetAmount}</td>
                  <td className="px-3 py-2 text-right font-bold">{stats.totalRefAmount}</td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
