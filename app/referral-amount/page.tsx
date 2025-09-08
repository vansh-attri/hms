'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/FormElements';

interface ReferralRecord {
  id: string;
  referringDoctorId: string;
  referringDoctorName: string;
  receiptNumber: string;
  patientName: string;
  referralDate: string;
  amount: number;
  userName: string;
  dateCreated: string;
}

export default function ReferralAmountPage() {
  const [referralNumber] = useState('0');
  const [selectedDate, setSelectedDate] = useState('2025-09-09');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [patientName, setPatientName] = useState('');
  const [referralAmount, setReferralAmount] = useState('');
  const [message, setMessage] = useState('');

  const [referringDoctors] = useState([
    { id: '1', name: 'Dr. Smith John' },
    { id: '2', name: 'Dr. Sarah Wilson' },
    { id: '3', name: 'Dr. Mike Johnson' },
    { id: '4', name: 'Dr. Emily Davis' },
  ]);

  const [referralRecords] = useState<ReferralRecord[]>([
    {
      id: '1',
      referringDoctorId: '1',
      referringDoctorName: 'Dr. Smith John',
      receiptNumber: 'R-001',
      patientName: 'John Doe',
      referralDate: '7/19/2025',
      amount: 500,
      userName: 'admin',
      dateCreated: '7/19/2025'
    },
    {
      id: '2',
      referringDoctorId: '2',
      referringDoctorName: 'Dr. Sarah Wilson',
      receiptNumber: 'R-002',
      patientName: 'Jane Smith',
      referralDate: '7/20/2025',
      amount: 750,
      userName: 'admin',
      dateCreated: '7/20/2025'
    },
    {
      id: '3',
      referringDoctorId: '1',
      referringDoctorName: 'Dr. Smith John',
      receiptNumber: 'R-003',
      patientName: 'Mike Brown',
      referralDate: '7/21/2025',
      amount: 300,
      userName: 'YASH',
      dateCreated: '7/21/2025'
    }
  ]);

  const handleSave = () => {
    if (!selectedDoctor || !receiptNumber.trim() || !patientName.trim() || !referralAmount) {
      setMessage('Please fill all required fields');
      return;
    }

    const selectedDoctorObj = referringDoctors.find(d => d.id === selectedDoctor);
    
    console.log('Saving referral:', {
      referralNumber,
      selectedDate,
      referringDoctorId: selectedDoctor,
      referringDoctorName: selectedDoctorObj?.name,
      receiptNumber,
      patientName,
      amount: Number(referralAmount),
      userName: 'admin'
    });

    setMessage('Referral amount saved successfully!');
    setSelectedDoctor('');
    setReceiptNumber('');
    setPatientName('');
    setReferralAmount('');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-4">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-green-500 text-white px-4 py-2 rounded-t-md">
          <h2 className="text-lg font-semibold">👨‍⚕️ Referral Amount</h2>
        </div>

        <div className="bg-white border border-gray-300 rounded-b-md">
          <div className="p-8">
            <div className="grid grid-cols-12 gap-8">
              {/* Left side - Add Referral Form */}
              <div className="col-span-5">
                <div className="space-y-8">
                  <div>
                    <label className="block text-gray-800 font-semibold text-base mb-3">
                      Referral Number
                    </label>
                    <input
                      type="text"
                      value={referralNumber}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-300 rounded-md text-gray-900 text-base font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-800 font-semibold text-base mb-3">
                      Referral Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-800 font-semibold text-base mb-3">
                      Referring Doctor
                    </label>
                    <select
                      value={selectedDoctor}
                      onChange={(e) => setSelectedDoctor(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 text-base"
                    >
                      <option value="">Select Doctor</option>
                      {referringDoctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-800 font-semibold text-base mb-3">
                      Receipt Number
                    </label>
                    <input
                      type="text"
                      value={receiptNumber}
                      onChange={(e) => setReceiptNumber(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 text-base"
                      placeholder="Enter receipt number"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-800 font-semibold text-base mb-3">
                      Patient Name
                    </label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 text-base"
                      placeholder="Enter patient name"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-800 font-semibold text-base mb-3">
                      Referral Amount
                    </label>
                    <input
                      type="number"
                      value={referralAmount}
                      onChange={(e) => setReferralAmount(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 text-base"
                      placeholder="Enter amount"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="flex justify-center">
                    <Button
                      onClick={handleSave}
                      className="bg-green-500 hover:bg-green-600 text-white px-12 py-3 text-lg font-bold shadow-lg"
                    >
                      Save Referral
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

            {/* Right side - Referral Records List */}
            <div className="col-span-7">
              <div className="border border-gray-300 rounded">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-1 bg-gray-100 p-2 text-sm font-medium border-b border-gray-300">
                  <div className="col-span-1">►</div>
                  <div className="col-span-1">ID</div>
                  <div className="col-span-2">ReferringDoctor</div>
                  <div className="col-span-1">Receipt</div>
                  <div className="col-span-2">PatientName</div>
                  <div className="col-span-1">Date</div>
                  <div className="col-span-1">Amount</div>
                  <div className="col-span-1">User</div>
                  <div className="col-span-2">Created</div>
                </div>

                {/* Table Body */}
                <div className="max-h-80 overflow-y-auto">
                  {referralRecords.map((record, index) => (
                    <div 
                      key={record.id} 
                      className={`grid grid-cols-12 gap-1 p-2 text-sm border-b border-gray-200 hover:bg-green-50 cursor-pointer ${
                        index === 0 ? 'bg-green-100' : ''
                      }`}
                    >
                      <div className="col-span-1">
                        {index === 0 && '►'}
                      </div>
                      <div className="col-span-1 font-medium text-green-600">
                        {record.id}
                      </div>
                      <div className="col-span-2 text-xs">
                        {record.referringDoctorName}
                      </div>
                      <div className="col-span-1 text-xs">
                        {record.receiptNumber}
                      </div>
                      <div className="col-span-2 text-xs">
                        {record.patientName}
                      </div>
                      <div className="col-span-1 text-xs">
                        {record.referralDate}
                      </div>
                      <div className="col-span-1">
                        ₹{record.amount}
                      </div>
                      <div className="col-span-1 text-xs">
                        {record.userName}
                      </div>
                      <div className="col-span-2 text-xs">
                        {record.dateCreated}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer info */}
              <div className="mt-2 text-xs text-gray-500">
                Total referrals: {referralRecords.length} | Total amount: ₹{referralRecords.reduce((sum, record) => sum + record.amount, 0)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
