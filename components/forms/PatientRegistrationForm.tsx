'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/FormElements';
import { doctorAPI, patientAPI } from '@/utils/api';

interface DoctorOption { id: number; name: string }
type PatientSearchRow = Awaited<ReturnType<typeof patientAPI.search>>[number];

interface PatientFormData {
  patientId: string;
  patientName: string;
  relationType: 'W/o' | 'D/o' | 'S/o';
  relation: string;
  age: string;
  gender: 'Male' | 'Female' | 'Other';
  mobile: string;
  address: string;
  doctorId: string;
  createdBy: string;
}

export const PatientRegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState<PatientFormData>({
    patientId: '',
    patientName: '',
    relationType: 'W/o',
    relation: '',
    age: '',
    gender: 'Male',
    mobile: '',
    address: '',
    doctorId: '',
    createdBy: 'web',
  });

  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PatientSearchRow[]>([]);
  const [searching, setSearching] = useState(false);

  // Load doctors from API
  useEffect(() => {
    doctorAPI.getAll()
      .then(rows => setDoctors(rows.map(d => ({ id: d.id, name: d.name })))).catch(() => setDoctors([]));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const rows = await patientAPI.search({ 
        name: /\D/.test(searchQuery) ? searchQuery : undefined, 
        mobile: /^\d+$/.test(searchQuery) ? searchQuery : undefined, 
        limit: 20 
      });
      setSearchResults(rows);
    } catch {
      setMessage('Error searching patients');
    } finally {
      setSearching(false);
    }
  };

  const applyPatientToForm = (row: PatientSearchRow) => {
    setFormData(prev => ({
      ...prev,
      patientId: String(row.id),
      patientName: row.name || '',
      relationType: (row.RelationType as 'W/o' | 'D/o' | 'S/o' | null) || 'W/o',
      relation: row.Relation || '',
      age: row.Age ? String(row.Age) : '',
      gender: (row.Gender as 'Male' | 'Female' | 'Other' | null) || 'Male',
      mobile: row.Mobile || '',
      address: row.Address || '',
      doctorId: row.DoctorID ? String(row.DoctorID) : '',
    }));
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleClear = () => {
    setFormData({
      patientId: '',
      patientName: '',
      relationType: 'W/o',
      relation: '',
      age: '',
      gender: 'Male',
      mobile: '',
      address: '',
      doctorId: '',
      createdBy: 'web',
    });
    setMessage('');
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleSave = async () => {
    if (!formData.patientName.trim()) {
      setMessage('Patient name is required');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const payload = {
        name: formData.patientName,
        RelationType: formData.relationType,
        Relation: formData.relation,
        Mobile: formData.mobile || null,
        Age: formData.age || null,
        Address: formData.address || null,
        Gender: formData.gender,
        DoctorID: formData.doctorId ? Number(formData.doctorId) : null,
        CreatedBy: formData.createdBy,
      } as const;
      const created = await patientAPI.create(payload);
      setFormData(prev => ({ ...prev, patientId: String(created.PatientID) }));
      setMessage('Patient registered successfully!');
    } catch {
      setMessage('Error saving patient data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-xl p-6 text-white">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-lg">👤</span>
          Patient Registration
        </h2>
        <p className="mt-2 text-blue-100">Add new patients to the system</p>
      </div>

      <div className="bg-white rounded-b-xl shadow-lg border border-gray-200">
        {/* Search Section */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Existing Patient</h3>
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Search by name or mobile number..."
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={searching || !searchQuery.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              {searching ? 'Searching...' : 'Search'}
            </Button>
            {searchQuery && (
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
              >
                Clear
              </Button>
            )}
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-4 bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700">
                Found {searchResults.length} patient(s)
              </div>
              <div className="max-h-64 overflow-y-auto">
                {searchResults.map((row) => (
                  <div
                    key={row.id}
                    onClick={() => applyPatientToForm(row)}
                    className="p-4 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">{row.name}</div>
                        <div className="text-sm text-gray-500">
                          {row.Age && `${row.Age} years`} {row.Gender && `• ${row.Gender}`} {row.Mobile && `• ${row.Mobile}`}
                        </div>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">ID: {row.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Form Section */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Patient Information</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Patient Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Name *
                </label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Enter patient full name"
                />
              </div>

              {/* Relation Type & Name */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Relation</label>
                  <div className="space-y-2">
                    {(['W/o', 'D/o', 'S/o'] as const).map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="radio"
                          name="relationType"
                          value={type}
                          checked={formData.relationType === type}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Relation Name</label>
                  <input
                    type="text"
                    name="relation"
                    value={formData.relation}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Father's/Husband's name"
                  />
                </div>
              </div>

              {/* Age & Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Age"
                    min="0"
                    max="150"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Enter complete address"
                />
              </div>

              {/* Reference Doctor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reference Doctor</label>
                <select
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Patient ID Display */}
              {formData.patientId && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-green-700 mb-1">Patient ID</label>
                  <div className="text-lg font-mono text-green-800">{formData.patientId}</div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex-1 sm:flex-none"
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
                'Save Patient'
              )}
            </Button>
            
            <Button
              onClick={handleClear}
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium"
            >
              Clear Form
            </Button>
          </div>

          {/* Message */}
          {message && (
            <div className={`mt-6 p-4 rounded-lg text-center font-medium ${
              message.includes('success') 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
