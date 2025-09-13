'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/FormElements';
import { api } from '@/utils/api';

interface ExpenseFormData {
  expenseId?: string;
  expenseDate: string;
  amount: number;
  remarks: string;
  userName: string;
}

interface ExpenseRecord {
  ID: number;
  ExpenseDate: string;
  Amount: number;
  Remarks: string;
  UserName: string;
}

export const ExpenseForm: React.FC = () => {
  const [formData, setFormData] = useState<ExpenseFormData>({
    expenseDate: new Date().toISOString().split('T')[0],
    amount: 0,
    remarks: '',
    userName: 'admin', // Default user, could be from auth context
  });

  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedExpenseIndex, setSelectedExpenseIndex] = useState<number>(-1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Load expenses from API
  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const expensesData = await api.expenses.getAll();
      
      // Convert API response to match our ExpenseRecord interface
      const convertedExpenses: ExpenseRecord[] = expensesData.map(expense => ({
        ID: expense.ID,
        ExpenseDate: expense.ExpenseDate,
        Amount: expense.Amount,
        Remarks: expense.Remarks || '',
        UserName: expense.UserName || ''
      }));
      
      setExpenses(convertedExpenses);
    } catch (error) {
      console.error('Failed to load expenses:', error);
      setMessage('Failed to load expenses from server');
      
      // Fallback to empty array if API fails
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleExpenseSelect = (expense: ExpenseRecord, index: number) => {
    setFormData({
      expenseId: String(expense.ID),
      expenseDate: expense.ExpenseDate,
      amount: expense.Amount,
      remarks: expense.Remarks,
      userName: expense.UserName,
    });
    setSelectedExpenseIndex(index);
    setMessage('');
  };

  const handleClear = () => {
    setFormData({
      expenseDate: new Date().toISOString().split('T')[0],
      amount: 0,
      remarks: '',
      userName: 'admin',
    });
    setSelectedExpenseIndex(-1);
    setMessage('');
  };

  const handleSave = async () => {
    if (!formData.remarks.trim()) {
      setMessage('Remarks are required');
      return;
    }

    if (formData.amount <= 0) {
      setMessage('Amount must be greater than 0');
      return;
    }

    if (!formData.expenseDate) {
      setMessage('Expense date is required');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Prepare data for API (backend expects specific field names)
      const expenseData = {
        ExpenseDate: formData.expenseDate,
        Amount: formData.amount,
        Remarks: formData.remarks.trim(),
        UserName: formData.userName.trim() || 'admin'
      };

      if (formData.expenseId) {
        // Update existing expense
        await api.expenses.update(formData.expenseId, expenseData);
        setMessage('Expense updated successfully!');
      } else {
        // Create new expense
        await api.expenses.create(expenseData);
        setMessage('Expense added successfully!');
      }

      // Reload expenses list
      await loadExpenses();
      
      // Reset form
      handleClear();
    } catch (error) {
      console.error('Save failed:', error);
      setMessage(`Error saving expense: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!formData.expenseId) return;

    if (!confirm('Are you sure you want to delete this expense?')) return;

    setLoading(true);
    try {
      await api.expenses.delete(formData.expenseId);
      setMessage('Expense deleted successfully!');
      
      // Reload expenses list
      await loadExpenses();
      
      handleClear();
    } catch (error) {
      console.error('Delete failed:', error);
      setMessage(`Error deleting expense: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.Remarks.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         expense.UserName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = !filterDate || expense.ExpenseDate === filterDate;
    return matchesSearch && matchesDate;
  });

  const todayTotal = expenses
    .filter(expense => expense.ExpenseDate === new Date().toISOString().split('T')[0])
    .reduce((sum, expense) => sum + expense.Amount, 0);

  const selectedDateTotal = filterDate ? 
    expenses
      .filter(expense => expense.ExpenseDate === filterDate)
      .reduce((sum, expense) => sum + expense.Amount, 0) : 0;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-t-xl p-6 text-white">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-lg">💰</span>
          Daily Expense Management
        </h2>
        <p className="mt-2 text-orange-100">Track and manage daily expenses and expenditures</p>
        <div className="mt-4 flex gap-6 text-sm">
          <div className="bg-white/20 rounded-lg px-3 py-2">
            <span className="font-medium">Today&apos;s Total: ₹{todayTotal}</span>
          </div>
          {selectedDateTotal > 0 && (
            <div className="bg-white/20 rounded-lg px-3 py-2">
              <span className="font-medium">Selected Date Total: ₹{selectedDateTotal}</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-b-xl shadow-lg border border-gray-200">
        <div className="grid grid-cols-12 gap-8 p-6">
          {/* Left side - Expense Form */}
          <div className="col-span-12 xl:col-span-4">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 bg-orange-600 rounded-lg flex items-center justify-center text-white text-sm">
                  {formData.expenseId ? '✏️' : '➕'}
                </span>
                {formData.expenseId ? 'Edit Expense' : 'Add New Expense'}
              </h3>
              
              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expense Date *
                  </label>
                  <input
                    type="date"
                    name="expenseDate"
                    value={formData.expenseDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount || ''}
                    onChange={handleInputChange}
                    min="0"
                    step="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks *
                  </label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                    placeholder="Enter expense details..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User Name
                  </label>
                  <input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                    placeholder="Enter user name"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 font-medium rounded-lg"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      formData.expenseId ? 'Update Expense' : 'Add Expense'
                    )}
                  </Button>
                  
                  {formData.expenseId && (
                    <Button
                      onClick={handleDelete}
                      disabled={loading}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 font-medium rounded-lg"
                    >
                      Delete
                    </Button>
                  )}
                </div>

                <Button
                  onClick={handleClear}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 font-medium rounded-lg"
                >
                  Clear Form
                </Button>

                {message && (
                  <div
                    className={`p-4 rounded-lg text-center font-medium text-sm ${
                      message.includes('success')
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {message}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right side - Expenses List */}
          <div className="col-span-12 xl:col-span-8">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Search Header */}
              <div className="bg-gray-50 p-4 border-b border-gray-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">All Expenses</h3>
                  <span className="text-sm text-gray-500">
                    {filteredExpenses.length} of {expenses.length} expenses
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                    placeholder="Search by remarks or user..."
                  />
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                  />
                </div>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 bg-orange-50 p-3 text-sm font-medium text-orange-800 border-b border-orange-200">
                <div className="col-span-1">►</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-4">Remarks</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-2">User</div>
                <div className="col-span-1">ID</div>
              </div>

              {/* Table Body */}
              <div className="max-h-96 overflow-y-auto">
                {filteredExpenses.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    {searchQuery || filterDate ? 'No expenses found matching your filters.' : 'No expenses found. Add your first expense using the form.'}
                  </div>
                ) : (
                  filteredExpenses.map((expense, index) => {
                    const isSelected = selectedExpenseIndex === index;
                    const rowClasses = `grid grid-cols-12 gap-2 p-3 text-sm border-b border-gray-100 hover:bg-orange-50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-orange-100 border-orange-300' : ''
                    }`;
                    
                    return (
                      <div
                        key={expense.ID}
                        className={rowClasses}
                        onClick={() => handleExpenseSelect(expense, index)}
                      >
                        <div className="col-span-1 text-orange-600 font-medium">
                          {isSelected ? '►' : ''}
                        </div>
                        <div className="col-span-2 font-medium text-gray-900">
                          {new Date(expense.ExpenseDate).toLocaleDateString()}
                        </div>
                        <div className="col-span-4 text-gray-900">
                          {expense.Remarks}
                        </div>
                        <div className="col-span-2 font-medium text-gray-900">
                          ₹{expense.Amount}
                        </div>
                        <div className="col-span-2 text-gray-600">
                          {expense.UserName}
                        </div>
                        <div className="col-span-1 text-orange-600 font-medium">
                          {expense.ID}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer info */}
              <div className="bg-gray-50 px-4 py-3 text-xs text-gray-500 border-t border-gray-200 flex justify-between">
                <span>
                  Total: {expenses.length} expenses
                </span>
                <span>
                  Total Amount: ₹{expenses.reduce((sum, exp) => sum + exp.Amount, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};