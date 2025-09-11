'use client';

import React, { useState } from 'react';
import { Button, FormSection } from '@/components/ui/FormElements';

export default function DailyExpensesPage() {
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState('');
  const [remarks, setRemarks] = useState('');
  const [message, setMessage] = useState('');

  const onSave = () => {
    if (!amount || !remarks.trim()) {
      setMessage('Please enter amount and remarks');
      return;
    }
    setMessage('Saved (demo). Backend wiring next.');
    setAmount('');
    setRemarks('');
  };

  return (
  <main className="py-4">
      <div className="max-w-3xl">
        <FormSection title="Daily Expenses">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} className="w-full border rounded px-3 py-2" rows={3} />
          </div>
          <div className="pt-2">
            <Button onClick={onSave} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2">Save</Button>
          </div>
          {message && (
            <div className="text-sm text-green-700 bg-green-100 border border-green-200 rounded p-2">{message}</div>
          )}
  </FormSection>
      </div>
    </main>
  );
}
