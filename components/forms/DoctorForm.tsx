'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/FormElements';
import { validateForm, doctorFormSchema } from '@/utils/validation';

interface DoctorFormData {
  doctorId?: string;
  doctorName: string;
  isDeleted: boolean;
}

interface DoctorRecord {
  ID: number;
  DoctorName: string;
  isDeleted: boolean;
}

export const DoctorForm: React.FC = () => {
  const [formData, setFormData] = useState<DoctorFormData>({
    doctorName: '',
    isDeleted: false,
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
      // For now, use mock data that matches the database structure
      // In a real implementation, this would call the actual API
      const mockDoctors: DoctorRecord[] = [
        { ID: 1594, DoctorName: 'Dr. Virender Kumar', isDeleted: false },
        { ID: 1595, DoctorName: 'SELF', isDeleted: false },
        { ID: 1596, DoctorName: 'MALIK HOSPITAL', isDeleted: false },
        { ID: 1597, DoctorName: 'SIDDHIVINAYAK', isDeleted: false },
        { ID: 1598, DoctorName: 'AW BABI KAKRIPUR', isDeleted: false },
        { ID: 1599, DoctorName: 'AW GEET KAKRIPUR', isDeleted: false },
        { ID: 1600, DoctorName: 'DR.LALIT DHATIR', isDeleted: false },
      ];
      setDoctors(mockDoctors);
    } catch (error) {
      console.error('Failed to load doctors:', error);
      setMessage('Failed to load doctors');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDoctorSelect = (doctor: DoctorRecord, index: number) => {
    setFormData({
      doctorId: String(doctor.ID),
      doctorName: doctor.DoctorName,
      isDeleted: doctor.isDeleted,
    });
    setSelectedDoctorIndex(index);
    setMessage('');
    setErrors({});
  };

  const handleClear = () => {
    setFormData({
      doctorName: '',
      isDeleted: false,
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
      name: formData.doctorName,
      isDeleted: formData.isDeleted,
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
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (formData.doctorId) {
        setMessage('Doctor updated successfully!');
      } else {
        setMessage('Doctor added successfully!');
      }

      // In a real implementation, this would call the actual API
      // and reload the doctors list
      
      // Reset form
      handleClear();
    } catch (error) {
      console.error('Save failed:', error);
      setMessage('Error saving doctor data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!formData.doctorId) return;

    if (!confirm('Are you sure you want to delete this doctor?')) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage('Doctor deleted successfully!');
      
      // In a real implementation, this would call the actual API
      // and reload the doctors list
      
      handleClear();
    } catch (error) {
      console.error('Delete failed:', error);
      setMessage('Error deleting doctor');
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor => 
    doctor.DoctorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter doctor name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <label className="flex items-start text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      name="isDeleted"
                      checked={formData.isDeleted}
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
                  
                  {formData.doctorId && (
                    <Button
                      onClick={handleDelete}
                      disabled={loading}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 font-medium rounded-lg"
                    >
                      Delete
                    </Button>
                  )}
                  
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
                        key={doctor.ID}
                        className={rowClasses}
                        onClick={() => handleDoctorSelect(doctor, index)}
                      >
                        <div className="col-span-1 text-emerald-600 font-medium">
                          {isSelected ? '►' : ''}
                        </div>
                        <div className="col-span-2 font-medium text-emerald-700">
                          {doctor.ID}
                        </div>
                        <div className="col-span-6 font-medium text-gray-900">
                          {doctor.DoctorName}
                        </div>
                        <div className="col-span-3 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            doctor.isDeleted 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {doctor.isDeleted ? 'Deleted' : 'Active'}
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
                  Active: {doctors.filter(d => !d.isDeleted).length} | 
                  Deleted: {doctors.filter(d => d.isDeleted).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};