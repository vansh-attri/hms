'use client';

import React from 'react';
import { PatientRegistrationForm } from '@/components/forms/PatientRegistrationForm';

export default function AddPatientPage() {
  return (
    <div className="py-4">
      <div className="">
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-gray-900">Patient Registration</h1>
          <p className="mt-1 text-gray-600">
            Register new patients and manage patient information
          </p>
        </div>
        
        <PatientRegistrationForm />
      </div>
    </div>
  );
}
