'use client';

import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Card, 
  InputField, 
  Alert, 
  LoadingSpinner,
  FormGrid,
  FormSection 
} from '@/components/ui/FormElements';
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
      // Loaded doctors from API
      
      // Convert API data to match DoctorRecord interface
      const convertedDoctors: DoctorRecord[] = doctorsData.map((doctor: DoctorSummary) => ({
        id: doctor.id,
        name: doctor.name,
        isDeleted: doctor.isDeleted // Keep as number (0 = active, 1 = deleted)
      }));
      
      setDoctors(convertedDoctors);
      // Doctors loaded successfully
    } catch {
      // Failed to load doctors
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
    } catch {
      // Save failed
      setMessage('Error saving doctor data');
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
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <Card className="mb-4 sm:mb-6">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-t-xl p-4 sm:p-6 text-white">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 sm:gap-3">
            <span className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 rounded-lg flex items-center justify-center text-base sm:text-lg">👨‍⚕️</span>
            Doctor Management
          </h2>
          <p className="mt-2 text-sm sm:text-base text-emerald-100">Add, edit, and manage doctors in the system</p>
        </div>

        <FormGrid>
          {/* Left side - Doctor Form */}
          <div className="lg:col-span-5">
            <Card className="bg-gray-50">
              <FormSection 
                title={`${formData.doctorId ? '✏️ Edit Doctor' : '➕ Add New Doctor'}`}
              >
                <div className="space-y-4 sm:space-y-6">
                  <InputField
                    label="Doctor Name"
                    name="doctorName"
                    value={formData.doctorName}
                    onChange={handleInputChange}
                    placeholder="Enter doctor name"
                    error={errors.doctorName}
                    required
                  />

                  <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
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

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      onClick={handleSave}
                      disabled={loading}
                      variant="primary"
                      className="flex-1"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <LoadingSpinner size="sm" />
                          Saving...
                        </span>
                      ) : (
                        formData.doctorId ? 'Update Doctor' : 'Add Doctor'
                      )}
                    </Button>
                    
                    <Button
                      onClick={handleClear}
                      variant="secondary"
                    >
                      Clear
                    </Button>
                  </div>

                  {message && (
                    <Alert
                      type={message.includes('success') ? 'success' : 'error'}
                      message={message}
                    />
                  )}
                </div>
              </FormSection>
            </Card>
          </div>

          {/* Right side - Doctors List */}
          <div className="lg:col-span-7">
            <Card>
              {/* Search Header */}
              <div className="bg-gray-50 p-3 sm:p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">All Doctors</h3>
                  <span className="text-sm text-gray-500">
                    {filteredDoctors.length} of {doctors.length} doctors
                  </span>
                </div>
                <InputField
                  label="Search Doctors"
                  name="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search doctors by name..."
                />
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 bg-emerald-50 p-2 sm:p-3 text-xs sm:text-sm font-medium text-emerald-800 border-b border-emerald-200">
                <div className="col-span-1">ID</div>
                <div className="col-span-7 sm:col-span-8">Doctor Name</div>
                <div className="col-span-4 sm:col-span-3">Status</div>
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
                    const rowClasses = `grid grid-cols-12 gap-2 p-2 sm:p-3 text-xs sm:text-sm border-b border-gray-100 hover:bg-emerald-50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-emerald-100 border-emerald-300' : ''
                    }`;
                    
                    return (
                      <div
                        key={doctor.id}
                        className={rowClasses}
                        onClick={() => handleDoctorSelect(doctor, index)}
                      >
                        <div className="col-span-1 text-emerald-600 font-medium hidden sm:block">
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
            </Card>
          </div>
        </FormGrid>
      </Card>
    </div>
  );
};