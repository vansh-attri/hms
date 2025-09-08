'use client';

import React from 'react';
import { PatientRegistrationForm } from '@/components/forms/PatientRegistrationForm';

export default function AddPatientPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Patient Registration</h1>
          <p className="mt-2 text-gray-600">
            Register new patients and manage patient information
          </p>
        </div>
        
        <PatientRegistrationForm />
      </div>
    </div>
  );
}
