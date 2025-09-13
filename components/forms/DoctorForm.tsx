'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/FormElements';
import { validateForm, doctorFormSchema } from '@/utils/validation';
import { api, DoctorSummary } from '@/utils/api';

interface DoctorFormData {
  doctorId?: string;
  doctorName: string;
  isDeleted: number; // 0 = active, 1 = deleted
}

interface DoctorRecord {
  id: number;
  name: string;
  isDeleted: number; // 0 = active, 1 = deleted
}

export const DoctorForm: React.FC = () => {
  const [formData, setFormData] = useState<DoctorFormData>({
    doctorName: '',
    isDeleted: 0,
  });

  const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedDoctorIndex, setSelectedDoctorIndex] = useState<number>(-1);
  const [searchQuery, setSearchQuery] = useState('');

  // Load doctors from API
  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      // Load real data from API
      const doctorsData = await api.doctors.getAll();
      console.log('Loaded doctors from API:', doctorsData.length);
      
      // Convert API data to match DoctorRecord interface
      const convertedDoctors: DoctorRecord[] = doctorsData.map((doctor: DoctorSummary) => ({
        id: doctor.id,
        name: doctor.name,
        isDeleted: doctor.isDeleted // Keep as number (0 = active, 1 = deleted)
      }));
      
      setDoctors(convertedDoctors);
      console.log('Total doctors loaded:', convertedDoctors.length);
      console.log('Active doctors:', convertedDoctors.filter(d => d.isDeleted === 0).length);
    } catch (error) {
      console.error('Failed to load doctors:', error);
      setMessage('Failed to load doctors from API');
      
      // Fallback to empty array if API fails
      setDoctors([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    // Also clear doctorName error when name field changes
    if (name === 'doctorName' && errors.doctorName) {
      setErrors(prev => ({ ...prev, doctorName: '' }));
    }
  };

  const handleDoctorSelect = (doctor: DoctorRecord, index: number) => {
    setFormData({
      doctorId: String(doctor.id),
      doctorName: doctor.name,
      isDeleted: doctor.isDeleted,
    });
    setSelectedDoctorIndex(index);
    setMessage('');
    setErrors({});
  };

  const handleClear = () => {
    setFormData({
      doctorName: '',
      isDeleted: 0,
    });
    setSelectedDoctorIndex(-1);
    setMessage('');
    setErrors({});
  };

  const handleSave = async () => {
    if (!formData.doctorName.trim()) {
      setMessage('Doctor name is required');
      return;
    }

    // Validate form data
    const validationResult = validateForm(doctorFormSchema, {
      doctorName: formData.doctorName,
      isDeleted: formData.isDeleted === 1, // Convert number to boolean
    });

    if (!validationResult.success) {
      setErrors(validationResult.errors || {});
      setMessage('Please fix the validation errors');
      return;
    }

    setLoading(true);
    setMessage('');
    setErrors({});

    try {
      // Prepare data for API (backend expects { name, isDeleted })
      const apiData = {
        name: formData.doctorName,
        isDeleted: formData.isDeleted === 1
      };

      if (formData.doctorId) {
        // Update existing doctor
        await api.doctors.update(formData.doctorId, apiData);
        setMessage('Doctor updated successfully!');
      } else {
        // Create new doctor
        await api.doctors.create(apiData);
        setMessage('Doctor added successfully!');
      }

      // Reload the doctors list
      await loadDoctors();
      
      // Reset form
      handleClear();
    } catch (error) {
      console.error('Save failed:', error);
      setMessage(`Error saving doctor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors
    .filter(doctor => 
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => b.id - a.id); // Sort by ID in descending order

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-t-xl p-6 text-white">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-lg">👨‍⚕️</span>
          Doctor Management
        </h2>
        <p className="mt-2 text-emerald-100">Add, edit, and manage doctors in the system</p>
      </div>

      <div className="bg-white rounded-b-xl shadow-lg border border-gray-200">
        <div className="grid grid-cols-12 gap-8 p-6">
          {/* Left side - Doctor Form */}
          <div className="col-span-12 lg:col-span-5">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-6 h-6 bg-emerald-600 rounded-lg flex items-center justify-center text-white text-sm">
                  {formData.doctorId ? '✏️' : '➕'}
                </span>
                {formData.doctorId ? 'Edit Doctor' : 'Add New Doctor'}
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Doctor Name *
                  </label>
                  <input
                    type="text"
                    name="doctorName"
                    value={formData.doctorName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 transition-colors ${
                      errors.doctorName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter doctor name"
                  />
                  {errors.doctorName && (
                    <p className="mt-1 text-sm text-red-600">{errors.doctorName}</p>
                  )}
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <label className="flex items-start text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      name="isDeleted"
                      checked={formData.isDeleted === 1}
                      onChange={handleInputChange}
                      className="mr-3 mt-0.5 w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <span className="leading-relaxed">
                      Mark as deleted (will not appear in dropdown lists)
                    </span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 font-medium rounded-lg"
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
                      formData.doctorId ? 'Update Doctor' : 'Add Doctor'
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleClear}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 font-medium rounded-lg"
                  >
                    Clear
                  </Button>
                </div>

                {message && (
                  <div
                    className={`p-4 rounded-lg text-center font-medium ${
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

          {/* Right side - Doctors List */}
          <div className="col-span-12 lg:col-span-7">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Search Header */}
              <div className="bg-gray-50 p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">All Doctors</h3>
                  <span className="text-sm text-gray-500">
                    {filteredDoctors.length} of {doctors.length} doctors
                  </span>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
                  placeholder="Search doctors by name..."
                />
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 bg-emerald-50 p-3 text-sm font-medium text-emerald-800 border-b border-emerald-200">
                <div className="col-span-1">►</div>
                <div className="col-span-2">ID</div>
                <div className="col-span-6">Doctor Name</div>
                <div className="col-span-3 text-center">Status</div>
              </div>

              {/* Table Body */}
              <div className="max-h-96 overflow-y-auto">
                {filteredDoctors.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    {searchQuery ? 'No doctors found matching your search.' : 'No doctors found. Add your first doctor using the form.'}
                  </div>
                ) : (
                  filteredDoctors.map((doctor, index) => {
                    const isSelected = selectedDoctorIndex === index;
                    const rowClasses = `grid grid-cols-12 gap-2 p-3 text-sm border-b border-gray-100 hover:bg-emerald-50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-emerald-100 border-emerald-300' : ''
                    }`;
                    
                    return (
                      <div
                        key={doctor.id}
                        className={rowClasses}
                        onClick={() => handleDoctorSelect(doctor, index)}
                      >
                        <div className="col-span-1 text-emerald-600 font-medium">
                          {isSelected ? '►' : ''}
                        </div>
                        <div className="col-span-2 font-medium text-emerald-700">
                          {doctor.id}
                        </div>
                        <div className="col-span-6 font-medium text-gray-900">
                          {doctor.name}
                        </div>
                        <div className="col-span-3 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            doctor.isDeleted === 1
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {doctor.isDeleted === 1 ? 'Deleted' : 'Active'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer info */}
              <div className="bg-gray-50 px-4 py-3 text-xs text-gray-500 border-t border-gray-200 flex justify-between">
                <span>
                  Total: {doctors.length} doctors
                </span>
                <span>
                  Active: {doctors.filter(d => d.isDeleted === 0).length} | 
                  Deleted: {doctors.filter(d => d.isDeleted === 1).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};