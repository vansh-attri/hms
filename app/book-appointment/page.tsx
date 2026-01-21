'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface AppointmentFormData {
  patientName: string;
  relationType: string;
  relation: string;
  mobile: string;
  email: string;
  age: string;
  address: string;
  gender: string;
  preferredDate: string;
  preferredTime: string;
  appointmentType: string;
  notes: string;
}

// API function to submit appointment
const submitAppointment = async (formData: AppointmentFormData) => {
  const API_BASE_URL = 'http://localhost:5001/api';
  
  const response = await fetch(`${API_BASE_URL}/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      PatientName: formData.patientName,
      RelationType: formData.relationType,
      Relation: formData.relation,
      Mobile: formData.mobile,
      Email: formData.email,
      Age: formData.age,
      Address: formData.address,
      Gender: formData.gender,
      PreferredDate: formData.preferredDate,
      PreferredTime: formData.preferredTime,
      AppointmentType: formData.appointmentType,
      Notes: formData.notes,
      Status: 'Pending',
      CreatedBy: 'Website Form'
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to submit appointment' }));
    throw new Error(errorData.error || 'Failed to submit appointment');
  }

  return response.json();
};

export default function BookAppointmentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<AppointmentFormData>({
    patientName: '',
    relationType: 'Wife of',
    relation: '',
    mobile: '',
    email: '',
    age: '',
    address: '',
    gender: 'Female',
    preferredDate: '',
    preferredTime: '',
    appointmentType: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.patientName.trim()) {
      newErrors.patientName = 'Patient name is required';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[0-9]{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Mobile number must be 10 digits';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.preferredDate) {
      newErrors.preferredDate = 'Preferred date is required';
    }

    if (!formData.appointmentType) {
      newErrors.appointmentType = 'Please select appointment type';
    }

    if (formData.age && (isNaN(Number(formData.age)) || Number(formData.age) < 0 || Number(formData.age) > 150)) {
      newErrors.age = 'Please enter a valid age';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      await submitAppointment(formData);
      
      setMessage('Thank you! Your appointment request has been submitted successfully. We will contact you shortly to confirm your appointment.');
      
      // Reset form after successful submission
      setFormData({
        patientName: '',
        relationType: 'Wife of',
        relation: '',
        mobile: '',
        email: '',
        age: '',
        address: '',
        gender: 'Female',
        preferredDate: '',
        preferredTime: '',
        appointmentType: '',
        notes: ''
      });
      
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to submit appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Image 
                src="/logo.png" 
                alt="Siddhivinayak Ultrasound Centre" 
                width={40} 
                height={40}
                className="rounded-lg w-8 h-8 sm:w-10 sm:h-10"
              />
              <div>
                <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">Siddhivinayak Ultrasound Centre</h1>
                <p className="text-xs sm:text-sm text-gray-600">Book Appointment</p>
              </div>
            </div>
            <button
              onClick={handleBackToHome}
              className="flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Back</span>
            </button>
          </div>
        </div>
      </header>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="px-4 sm:px-6 md:px-8 py-4 md:py-6 border-b border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-900">Book Your Appointment</h2>
            <p className="text-center text-sm sm:text-base text-gray-600 mt-2">
              Fill out the form below and we will get back to you with confirmation
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-8 space-y-4 md:space-y-6">
            {/* Patient Information Section */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Patient Information</h3>
              
              {/* Patient Name */}
              <div className="mb-3 md:mb-4">
                <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="patientName"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleInputChange}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 min-h-[44px] ${
                    errors.patientName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter patient's full name"
                />
                {errors.patientName && (
                  <p className="mt-1 text-sm text-red-600">{errors.patientName}</p>
                )}
              </div>

              {/* Relation Type and Relation Name */}
              <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 mb-3 md:mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Patient Relation Details</h4>
                
                <div className="mb-3 md:mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Relation Type</label>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="relationType"
                        value="Wife of"
                        checked={formData.relationType === 'Wife of'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 bg-white border-gray-300 focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        Wife of <span className="text-gray-500">(W/o)</span>
                      </span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="relationType"
                        value="Daughter of"
                        checked={formData.relationType === 'Daughter of'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 bg-white border-gray-300 focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        Daughter of <span className="text-gray-500">(D/o)</span>
                      </span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="relationType"
                        value="Son of"
                        checked={formData.relationType === 'Son of'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 bg-white border-gray-300 focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        Son of <span className="text-gray-500">(S/o)</span>
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor="relation" className="block text-sm font-medium text-gray-700 mb-2">
                    {formData.relationType === 'Wife of' ? "Husband's Name" : "Father's Name"}
                  </label>
                  <input
                    type="text"
                    id="relation"
                    name="relation"
                    value={formData.relation}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 min-h-[44px]"
                    placeholder={`Enter ${formData.relationType === 'Wife of' ? "husband's" : "father's"} full name`}
                  />
                </div>
              </div>

              {/* Contact Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-4">
                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 min-h-[44px] ${
                      errors.mobile ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="10-digit mobile number"
                  />
                  {errors.mobile && (
                    <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 min-h-[44px] ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Age & Gender */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 min-h-[44px] ${
                      errors.age ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter age"
                    min="0"
                    max="150"
                  />
                  {errors.age && (
                    <p className="mt-1 text-sm text-red-600">{errors.age}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 min-h-[44px]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Address */}
              <div className="mt-3 md:mt-4">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 min-h-[44px]"
                  placeholder="Enter complete address"
                />
              </div>
            </div>

            {/* Appointment Details Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Appointment Details</h3>
              
              {/* Appointment Type */}
              <div className="mb-3 md:mb-4">
                <label htmlFor="appointmentType" className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="appointmentType"
                  name="appointmentType"
                  value={formData.appointmentType}
                  onChange={handleInputChange}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 min-h-[44px] ${
                    errors.appointmentType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Appointment Type</option>
                  <option value="Pregnancy Ultrasound">Pregnancy Ultrasound</option>
                  <option value="General Ultrasound">General Ultrasound</option>
                  <option value="Fetal Echocardiography">Fetal Echocardiography</option>
                  <option value="Doppler Study">Doppler Study</option>
                  <option value="Small Parts Scan">Small Parts Scan (Breast, Thyroid, etc.)</option>
                  <option value="Gynecology Scan">Gynecology Scan (TVS, Ovulation Study)</option>
                  <option value="Other">Other</option>
                </select>
                {errors.appointmentType && (
                  <p className="mt-1 text-sm text-red-600">{errors.appointmentType}</p>
                )}
              </div>

              {/* Preferred Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="preferredDate"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleInputChange}
                    min={today}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 min-h-[44px] ${
                      errors.preferredDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.preferredDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.preferredDate}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Time (Optional)
                  </label>
                  <input
                    type="time"
                    id="preferredTime"
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 min-h-[44px]"
                  />
                </div>
              </div>

              {/* Additional Notes */}
              <div className="mt-3 md:mt-4">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes / Special Requirements
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 min-h-[44px]"
                  placeholder="Please mention any specific requirements or health concerns..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 md:pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-colors min-h-[44px] ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Book Appointment'
                )}
              </button>
            </div>

            {/* Success/Error Message */}
            {message && (
              <div className={`p-4 rounded-lg ${
                message.includes('successfully') 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message}
              </div>
            )}
          </form>
        </div>

        {/* Important Notice */}
        <div className="mt-6 md:mt-8 bg-yellow-50 rounded-xl p-4 sm:p-6 border border-yellow-200">
          <h3 className="text-base sm:text-lg font-semibold text-yellow-900 mb-2 flex items-center">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Important Notice
          </h3>
          <p className="text-sm text-yellow-800">
            This is an appointment request. Our team will contact you within 24 hours to confirm your appointment slot. 
            Please ensure your contact details are correct.
          </p>
        </div>

        {/* Contact Info Footer */}
        <div className="mt-6 md:mt-8 bg-blue-50 rounded-xl p-4 sm:p-6 border border-blue-200">
          <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-3 md:mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-blue-600">📞</span>
              <div>
                <p className="font-medium text-blue-900">Phone</p>
                <p className="text-blue-700">(+91) 9896416790</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-600">✉️</span>
              <div>
                <p className="font-medium text-blue-900">Email</p>
                <p className="text-blue-700">drvirenderultrasoundcentre@gmail.com</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-600">📍</span>
              <div>
                <p className="font-medium text-blue-900">Location</p>
                <p className="text-blue-700">Punhana mode, Palwal, Haryana</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
