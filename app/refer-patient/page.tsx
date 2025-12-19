'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface ReferralFormData {
  patientName: string;
  relationType: string;
  relation: string;
  mobile: string;
  age: string;
  address: string;
  gender: string;
  doctorName: string;
}

// API function to submit referral
const submitReferral = async (formData: ReferralFormData) => {
  const API_BASE_URL = 'https://hms-back-rosy.vercel.app/api';
  
  const response = await fetch(`${API_BASE_URL}/referrals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      PatientName: formData.patientName,
      RelationType: formData.relationType,
      Relation: formData.relation,
      Mobile: formData.mobile,
      Age: formData.age,
      Address: formData.address,
      Gender: formData.gender,
      DoctorName: formData.doctorName,
      CreatedBy: 'Website Form'
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to submit referral' }));
    throw new Error(errorData.error || 'Failed to submit referral');
  }

  return response.json();
};

export default function ReferPatientPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ReferralFormData>({
    patientName: '',
    relationType: '',
    relation: '',
    mobile: '',
    age: '',
    address: '',
    gender: '',
    doctorName: ''
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

    if (!formData.doctorName.trim()) {
      newErrors.doctorName = 'Doctor name is required';
    }

    if (formData.mobile && !/^[0-9]{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Mobile number must be 10 digits';
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
      await submitReferral(formData);
      
      setMessage('Thank you! Your patient referral has been submitted successfully. We will contact you soon.');
      
      // Reset form after successful submission
      setFormData({
        patientName: '',
        relationType: '',
        relation: '',
        mobile: '',
        age: '',
        address: '',
        gender: '',
        doctorName: ''
      });
      
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to submit referral. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToHome = () => {
    router.push('/');
  };

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
                <p className="text-xs sm:text-sm text-gray-600">Patient Referral Form</p>
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
            <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-900">Patient Referral Form</h2>
            <p className="text-center text-sm sm:text-base text-gray-600 mt-2">
              Please fill out this form to refer a patient to our ultrasound centre
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-8 space-y-4 md:space-y-6">
            {/* Patient Name & Relation Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
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

              <div>
                <label htmlFor="relationType" className="block text-sm font-medium text-gray-700 mb-2">
                  Relation Type
                </label>
                <select
                  id="relationType"
                  name="relationType"
                  value={formData.relationType}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 min-h-[44px]"
                >
                  <option value="">Select Relation Type</option>
                  <option value="Wife of">Wife of</option>
                  <option value="Son of">Son of</option>
                  <option value="Daughter of">Daughter of</option>
                </select>
              </div>
            </div>

            {/* Relation & Mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label htmlFor="relation" className="block text-sm font-medium text-gray-700 mb-2">
                  Relation
                </label>
                <input
                  type="text"
                  id="relation"
                  name="relation"
                  value={formData.relation}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 min-h-[44px]"
                  placeholder="e.g., Father, Mother, Brother"
                />
              </div>

              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number
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
            </div>

            {/* Age & Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div>
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

            {/* Doctor Name */}
            <div>
              <label htmlFor="doctorName" className="block text-sm font-medium text-gray-700 mb-2">
                Doctor Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="doctorName"
                name="doctorName"
                value={formData.doctorName}
                onChange={handleInputChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 min-h-[44px]"
                placeholder="Enter referring doctor's name"
              />
              {errors.doctorName && (
                <p className="mt-1 text-sm text-red-600">{errors.doctorName}</p>
              )}
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
                  'Submit Referral'
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

        {/* Contact Info Footer */}
        <div className="mt-6 md:mt-8 bg-blue-50 rounded-xl p-4 sm:p-6 border border-blue-200">
          <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-3 md:mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-blue-600">📞</span>
              <div>
                <p className="font-medium text-blue-900">Phone</p>
                <p className="text-blue-700">(+91) 8307233058</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-600">✉️</span>
              <div>
                <p className="font-medium text-blue-900">Email</p>
                <p className="text-blue-700">siddhivinayakpalwal@gmail.com</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-600">📍</span>
              <div>
                <p className="font-medium text-blue-900">Location</p>
                <p className="text-blue-700">New, Sohna Rd, opposite Civil Hospital, Kalra Colony, Palwal, Haryana 121102</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
