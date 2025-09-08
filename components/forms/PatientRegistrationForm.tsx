'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/FormElements';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
}

interface PatientFormData {
  patientId: string;
  patientName: string;
  title: 'W/o' | 'D/o' | 'S/o';
  age: string;
  sex: 'Male' | 'Female' | 'Other';
  mobileNo: string;
  date: string;
  address: string;
  referenceDoctor: string;
}

export const PatientRegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState<PatientFormData>({
    patientId: '',
    patientName: '',
    title: 'W/o',
    age: '',
    sex: 'Male',
    mobileNo: '',
    date: new Date().toISOString().split('T')[0],
    address: '',
    referenceDoctor: '',
  });

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Sample doctors data - replace with API call
  useEffect(() => {
    setDoctors([
      { id: '1', name: 'Dr. AW AZADWATI KAKRIPUR', specialization: 'Ultrasound' },
      { id: '2', name: 'Dr. Virender Kumar', specialization: 'General Medicine' },
      { id: '3', name: 'Dr. Rajesh Sharma', specialization: 'Cardiology' },
      { id: '4', name: 'Dr. Priya Singh', specialization: 'Gynecology' },
    ]);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = () => {
    // Implement patient search functionality
    console.log('Searching for patient:', formData.patientId);
  };

  const handleNewReceipt = () => {
    // Reset form for new receipt
    setFormData({
      patientId: '',
      patientName: '',
      title: 'W/o',
      age: '',
      sex: 'Male',
      mobileNo: '',
      date: new Date().toISOString().split('T')[0],
      address: '',
      referenceDoctor: '',
    });
    setMessage('');
  };

  const handleAddReferredPatient = () => {
    // Add functionality for referred patient
    console.log('Adding referred patient');
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage('Patient registered successfully!');
      console.log('Patient data saved:', formData);
    } catch {
      setMessage('Error saving patient data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
        <h2 className="text-xl font-bold">📋 Patient Registration</h2>
      </div>

      {/* Form Content */}
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Patient ID Row */}
            <div className="flex items-center space-x-4">
              <label className="text-gray-800 font-semibold text-base w-28 flex-shrink-0">Patient ID:</label>
              <div className="flex flex-1 space-x-3">
                <input
                  type="text"
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-base"
                  placeholder="Enter Patient ID"
                />
                <Button 
                  onClick={handleSearch}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-semibold"
                >
                  Search
                </Button>
              </div>
            </div>

            {/* Patient Name */}
            <div className="flex items-center space-x-4">
              <label className="text-gray-800 font-semibold text-base w-28 flex-shrink-0">Patient Name:</label>
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleInputChange}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-base"
                placeholder="Enter patient name"
              />
            </div>

            {/* Title Radio Buttons */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-800 font-semibold text-base w-28 flex-shrink-0">Title:</span>
              <div className="flex space-x-8">
                {(['W/o', 'D/o', 'S/o'] as const).map((title) => (
                  <label key={title} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="title"
                      value={title}
                      checked={formData.title === title}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-2 border-gray-300"
                    />
                    <span className="text-gray-800 font-medium text-base">{title}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Age/Sex Row */}
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center space-x-4">
                <label className="text-gray-800 font-semibold text-base w-16 flex-shrink-0">Age:</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-base"
                  placeholder="Age"
                />
              </div>
              <div className="flex items-center space-x-4">
                <label className="text-gray-800 font-semibold text-base w-12 flex-shrink-0">Sex:</label>
                <select
                  name="sex"
                  value={formData.sex}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-base"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Mobile Number */}
            <div className="flex items-center space-x-4">
              <label className="text-gray-800 font-semibold text-base w-28 flex-shrink-0">Mobile No:</label>
              <input
                type="tel"
                name="mobileNo"
                value={formData.mobileNo}
                onChange={handleInputChange}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-base"
                placeholder="Enter mobile number"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Action Buttons Row */}
            <div className="flex justify-end space-x-4 mb-6">
              <Button 
                onClick={handleNewReceipt}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 font-semibold"
              >
                New Receipt
              </Button>
              <Button 
                onClick={handleAddReferredPatient}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 font-semibold"
              >
                Add Referred Patient
              </Button>
            </div>

            {/* Date */}
            <div className="flex items-center space-x-4">
              <label className="text-gray-800 font-semibold text-base w-16 flex-shrink-0">Date:</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-base"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-gray-800 font-semibold text-base mb-3">Address:</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-base"
                placeholder="Enter address"
              />
            </div>

            {/* Reference Doctor */}
            <div>
              <label className="block text-gray-800 font-semibold text-base mb-3">Reference Doctor:</label>
              <select
                name="referenceDoctor"
                value={formData.referenceDoctor}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-base"
              >
                <option value="">Select Doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-600 mt-2 font-medium">
                Manually select the Doctor Name from dropdown for referred patient
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center mt-10">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-16 py-4 text-lg font-bold shadow-lg"
          >
            {loading ? 'Saving...' : 'Save Patient'}
          </Button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mt-6 p-4 rounded-md text-center font-semibold ${
            message.includes('success') 
              ? 'bg-green-100 text-green-800 border-2 border-green-200' 
              : 'bg-red-100 text-red-800 border-2 border-red-200'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};
