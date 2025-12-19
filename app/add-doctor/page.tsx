'use client';

import React from 'react';
import { DoctorForm } from '@/components/forms/DoctorForm';

export default function AddDoctorPage() {
  return (
    <div className="py-3 sm:py-4">
      <div className="mb-3 sm:mb-4">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Doctor Management</h1>
        <p className="mt-1 text-sm sm:text-base text-gray-600">
          Add, edit, and manage doctors in the system
        </p>
      </div>
      
      <DoctorForm />
    </div>
  );
}