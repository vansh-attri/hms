'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/FormElements';

export default function ReferralAmountPage() {
  const [doctor, setDoctor] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  const onSave = () => {
    if (!doctor || !amount) {
      setMessage('Please select doctor and amount');
      return;
    }
    setMessage('Saved (demo). Backend wiring next.');
    setDoctor('');
    setAmount('');
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <header className="bg-green-600 text-white px-4 py-3 rounded-t-md">
          <h1 className="text-lg font-semibold">Referral Amount</h1>
        </header>
        <section className="bg-white border border-gray-200 rounded-b-md p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Referring Doctor</label>
            <input value={doctor} onChange={(e) => setDoctor(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Doctor name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="pt-2">
            <Button onClick={onSave} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2">Save</Button>
          </div>
          {message && (
            <div className="text-sm text-green-700 bg-green-100 border border-green-200 rounded p-2">{message}</div>
          )}
        </section>
      </div>
    </main>
  );
}
