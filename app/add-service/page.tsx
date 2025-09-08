'use client';

import React from 'react';
import { AddServiceForm } from '@/components/forms/AddServiceForm';
import { useRouter } from 'next/navigation';

export default function AddServicePage() {
  const router = useRouter();

  const handleServiceAdded = () => {
    // Optionally redirect to manage services or show success
    setTimeout(() => {
      router.push('/manage-services');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Add New Service</h1>
          <p className="text-gray-600">Register a new service in the system.</p>
        </div>
        
        <AddServiceForm onServiceAdded={handleServiceAdded} />
      </div>
    </div>
  );
}
