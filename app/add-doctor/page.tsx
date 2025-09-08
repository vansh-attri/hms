'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/FormElements';

interface Doctor {
  doctorId: string;
  doctorName: string;
  isDeleted: boolean;
}

export default function AddDoctorPage() {
  const [doctorName, setDoctorName] = useState('');
  const [isDeleted, setIsDeleted] = useState(false);
  const [message, setMessage] = useState('');

  const [doctors] = useState<Doctor[]>([
    { doctorId: '1635', doctorName: 'AW AZADWATI KAKRIPUR', isDeleted: false },
    { doctorId: '1678', doctorName: 'AW BABI KAKRIPUR', isDeleted: false },
    { doctorId: '1629', doctorName: 'AW BABI KAKRIPUR', isDeleted: false },
    { doctorId: '1658', doctorName: 'AW BABI KAKRIPUR', isDeleted: false },
    { doctorId: '1776', doctorName: 'AW BALA KAKRIPUR', isDeleted: false },
    { doctorId: '1638', doctorName: 'AW BEE KAKRIPUR', isDeleted: false },
    { doctorId: '1651', doctorName: 'AW BER KAKRIPUR', isDeleted: false },
    { doctorId: '1652', doctorName: 'AW DAY KAKRIPUR', isDeleted: false },
    { doctorId: '1626', doctorName: 'AW GEET KAKRIPUR', isDeleted: false },
    { doctorId: '1657', doctorName: 'AW HEM KAKRIPUR', isDeleted: false },
    { doctorId: '1740', doctorName: 'AW JAG KAKRIPUR', isDeleted: false },
    { doctorId: '1752', doctorName: 'AW KAIL KAKRIPUR', isDeleted: false },
    { doctorId: '1634', doctorName: 'AW KAML KAKRIPUR', isDeleted: false },
    { doctorId: '1784', doctorName: 'AW KAVI KAKRIPUR', isDeleted: false },
    { doctorId: '1745', doctorName: 'AW KUS KAKRIPUR', isDeleted: false },
    { doctorId: '1627', doctorName: 'AW KUS KAKRIPUR', isDeleted: false },
    { doctorId: '1741', doctorName: 'AW LAXM KAKRIPUR', isDeleted: false },
    { doctorId: '1696', doctorName: 'AW MANI KAKRIPUR', isDeleted: false },
    { doctorId: '1771', doctorName: 'AW MITH KAKRIPUR', isDeleted: false },
    { doctorId: '1630', doctorName: 'AW MUK KAKRIPUR', isDeleted: false },
  ]);

  const handleSave = () => {
    if (doctorName.trim()) {
      console.log('Saving doctor:', {
        doctorName: doctorName,
        isDeleted: isDeleted
      });
      setMessage('Doctor saved successfully!');
      setDoctorName('');
      setIsDeleted(false);
    } else {
      setMessage('Please enter doctor name');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-4">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-blue-500 text-white px-4 py-2 rounded-t-md">
          <h2 className="text-lg font-semibold">👨‍⚕️ Add New Doctor Name</h2>
        </div>

        <div className="bg-white border border-gray-300 rounded-b-md">
          <div className="p-8">
            <div className="grid grid-cols-12 gap-8">
              {/* Left side - Add Doctor Form */}
              <div className="col-span-5">
                <div className="space-y-8">
                  <div>
                    <label className="block text-gray-800 font-semibold text-base mb-3">
                      Enter Doctor Name
                    </label>
                    <input
                      type="text"
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-base"
                      placeholder="Enter doctor name"
                    />
                  </div>

                  <div>
                    <label className="flex items-start text-base font-semibold text-gray-800">
                      <input
                        type="checkbox"
                        checked={isDeleted}
                        onChange={(e) => setIsDeleted(e.target.checked)}
                        className="mr-3 mt-1 w-5 h-5 text-blue-600 focus:ring-blue-500 border-2 border-gray-300 rounded"
                      />
                      <span className="leading-relaxed">
                        Delete (This doctor will not appear on entry form dropdown list)
                      </span>
                    </label>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      onClick={handleSave}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-12 py-3 text-lg font-bold shadow-lg"
                    >
                      Save Doctor
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

            {/* Right side - Doctor List */}
            <div className="col-span-7">
              <div className="border border-gray-300 rounded">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 bg-gray-100 p-2 text-sm font-medium border-b border-gray-300">
                  <div className="col-span-1">►</div>
                  <div className="col-span-3">DoctorID</div>
                  <div className="col-span-6">DoctorName</div>
                  <div className="col-span-2">isDeleted</div>
                </div>

                {/* Table Body */}
                <div className="max-h-80 overflow-y-auto">
                  {doctors.map((doctor, index) => (
                    <div 
                      key={doctor.doctorId} 
                      className={`grid grid-cols-12 gap-2 p-2 text-sm border-b border-gray-200 hover:bg-blue-50 cursor-pointer ${
                        index === 0 ? 'bg-blue-100' : ''
                      }`}
                    >
                      <div className="col-span-1">
                        {index === 0 && '►'}
                      </div>
                      <div className="col-span-3 font-medium text-blue-600">
                        {doctor.doctorId}
                      </div>
                      <div className="col-span-6">
                        {doctor.doctorName}
                      </div>
                      <div className="col-span-2 text-center">
                        <input
                          type="checkbox"
                          checked={doctor.isDeleted}
                          readOnly
                          className="cursor-pointer"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer info */}
              <div className="mt-2 text-xs text-gray-500">
                Total doctors: {doctors.length} | Active: {doctors.filter(d => !d.isDeleted).length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

