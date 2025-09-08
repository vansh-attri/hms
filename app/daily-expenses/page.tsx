'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/FormElements';

interface Expense {
  id: string;
  expenseDate: string;
  amount: number;
  remarks: string;
  userName: string;
  dateCreated: string;
}

export default function DailyExpensesPage() {
  const [expenseNumber] = useState('0');
  const [selectedDate, setSelectedDate] = useState('2025-09-09');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [remarks, setRemarks] = useState('');
  const [message, setMessage] = useState('');

  const [expenses] = useState<Expense[]>([
    {
      id: '1',
      expenseDate: '7/19/2025',
      amount: 60,
      remarks: 'BEAKFAST',
      userName: 'admin',
      dateCreated: '7/19/2025'
    },
    {
      id: '2',
      expenseDate: '7/19/2025',
      amount: 100,
      remarks: 'PETROL',
      userName: 'admin',
      dateCreated: '7/19/2025'
    },
    {
      id: '3',
      expenseDate: '7/21/2025',
      amount: 1300,
      remarks: 'JELLY',
      userName: 'YASH',
      dateCreated: '7/21/2025'
    }
  ]);

  const handleSave = () => {
    if (!expenseAmount || !remarks.trim()) {
      setMessage('Please enter expense amount and remarks');
      return;
    }

    console.log('Saving expense:', {
      expenseNumber,
      selectedDate,
      expenseAmount: Number(expenseAmount),
      remarks,
      userName: 'admin'
    });

    setMessage('Expense saved successfully!');
    setExpenseAmount('');
    setRemarks('');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-4">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-blue-500 text-white px-4 py-2 rounded-t-md">
          <h2 className="text-lg font-semibold">💰 Daily Expense</h2>
        </div>

        <div className="bg-white border border-gray-300 rounded-b-md">
          <div className="p-8">
            <div className="grid grid-cols-12 gap-8">
              {/* Left side - Add Expense Form */}
              <div className="col-span-5">
                <div className="space-y-8">
                  <div>
                    <label className="block text-gray-800 font-semibold text-base mb-3">
                      Expense Number
                    </label>
                    <input
                      type="text"
                      value={expenseNumber}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-300 rounded-md text-gray-900 text-base font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-800 font-semibold text-base mb-3">
                      Select Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-800 font-semibold text-base mb-3">
                      Expense Amount
                    </label>
                    <input
                      type="number"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-base"
                      placeholder="Enter amount"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-800 font-semibold text-base mb-3">
                      Remarks/Item
                    </label>
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-base"
                      placeholder="Enter remarks or item description"
                    />
                  </div>

                  <div className="flex justify-center">
                    <Button
                      onClick={handleSave}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-12 py-3 text-lg font-bold shadow-lg"
                    >
                      Save Expense
                    </Button>
                  </div>

                  {message && (
                    <div className={`p-4 rounded-md text-center font-semibold ${
                      message.includes('success') 
                        ? 'bg-green-100 text-green-800 border-2 border-green-200' 
                        : 'bg-red-100 text-red-800 border-2 border-red-200'
                    }`}>
                      {message}
                    </div>
                  )}
                </div>
              </div>

            {/* Right side - Expense List */}
            <div className="col-span-7">
              <div className="border border-gray-300 rounded">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-1 bg-gray-100 p-2 text-sm font-medium border-b border-gray-300">
                  <div className="col-span-1">►</div>
                  <div className="col-span-1">ID</div>
                  <div className="col-span-2">ExpenseDate</div>
                  <div className="col-span-2">Amount</div>
                  <div className="col-span-2">Remarks</div>
                  <div className="col-span-2">UserName</div>
                  <div className="col-span-2">dateCreated</div>
                </div>

                {/* Table Body */}
                <div className="max-h-80 overflow-y-auto">
                  {expenses.map((expense, index) => (
                    <div 
                      key={expense.id} 
                      className={`grid grid-cols-12 gap-1 p-2 text-sm border-b border-gray-200 hover:bg-blue-50 cursor-pointer ${
                        index === 0 ? 'bg-blue-100' : ''
                      }`}
                    >
                      <div className="col-span-1">
                        {index === 0 && '►'}
                      </div>
                      <div className="col-span-1 font-medium text-blue-600">
                        {expense.id}
                      </div>
                      <div className="col-span-2">
                        {expense.expenseDate}
                      </div>
                      <div className="col-span-2">
                        {expense.amount}
                      </div>
                      <div className="col-span-2">
                        {expense.remarks}
                      </div>
                      <div className="col-span-2">
                        {expense.userName}
                      </div>
                      <div className="col-span-2">
                        {expense.dateCreated}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer info */}
              <div className="mt-2 text-xs text-gray-500">
                Total expenses: {expenses.length} | Total amount: ₹{expenses.reduce((sum, exp) => sum + exp.amount, 0)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
