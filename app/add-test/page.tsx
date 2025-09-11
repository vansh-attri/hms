'use client';

import React, { useState } from 'react';
import { Button, CheckboxField, FormGrid, FormSection } from '@/components/ui/FormElements';

interface TestData {
  testId: string;
  testName: string;
  category: string;
  price: number;
  normalRange: string;
  unit: string;
  description: string;
  preparationInstructions: string;
  isActive: boolean;
}

interface TestCategories {
  [key: string]: string;
}

export default function AddTestPage() {
  const [testData, setTestData] = useState<TestData>({
    testId: '',
    testName: '',
    category: '',
    price: 0,
    normalRange: '',
    unit: '',
    description: '',
    preparationInstructions: '',
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const testCategories: TestCategories = {
    'blood': 'Blood Tests',
    'urine': 'Urine Tests',
    'imaging': 'Imaging Tests',
    'cardiac': 'Cardiac Tests',
    'hormone': 'Hormone Tests',
    'liver': 'Liver Function',
    'kidney': 'Kidney Function',
    'thyroid': 'Thyroid Function',
    'diabetes': 'Diabetes Tests',
    'ultrasound': 'Ultrasound',
  };

  const commonTests = [
    { name: 'Complete Blood Count (CBC)', category: 'blood', price: 300, unit: 'cells/mcL' },
    { name: 'Fasting Blood Sugar', category: 'diabetes', price: 150, unit: 'mg/dL' },
    { name: 'Lipid Profile', category: 'blood', price: 800, unit: 'mg/dL' },
    { name: 'Liver Function Test', category: 'liver', price: 600, unit: 'U/L' },
    { name: 'Kidney Function Test', category: 'kidney', price: 500, unit: 'mg/dL' },
    { name: 'Thyroid Profile', category: 'thyroid', price: 900, unit: 'mIU/L' },
    { name: 'Urine Routine', category: 'urine', price: 200, unit: '' },
    { name: 'ECG', category: 'cardiac', price: 400, unit: '' },
    { name: 'Chest X-Ray', category: 'imaging', price: 500, unit: '' },
    { name: 'Abdominal Ultrasound', category: 'ultrasound', price: 1200, unit: '' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setTestData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setTestData(prev => ({ ...prev, [name]: checked }));
  };

  const handleQuickAdd = (test: typeof commonTests[0]) => {
    setTestData(prev => ({
      ...prev,
      testName: test.name,
      category: test.category,
      price: test.price,
      unit: test.unit,
      testId: 'TEST' + Date.now(),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage('Test added successfully!');
      
      // Reset form
      setTestData({
        testId: '',
        testName: '',
        category: '',
        price: 0,
        normalRange: '',
        unit: '',
        description: '',
        preparationInstructions: '',
        isActive: true,
      });
    } catch {
      setMessage('Error adding test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="py-4">
      <div className="">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add Medical Test</h1>
          <p className="mt-2 text-gray-600">
            Add new medical tests and diagnostic procedures
          </p>
        </div>

  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Add Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium mb-4 text-gray-900">Quick Add Common Tests</h3>
              <div className="space-y-2">
                {commonTests.map((test, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAdd(test)}
                    className="w-full text-left p-3 rounded-md border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200"
                  >
                    <div className="font-medium text-sm text-gray-900">{test.name}</div>
                    <div className="text-xs text-gray-500">₹{test.price} • {testCategories[test.category]}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-2">
            <FormSection title="🧪 Add Test" description="Add new medical tests and diagnostic procedures">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <FormGrid cols={2}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Test ID
                    </label>
                    <input
                      type="text"
                      name="testId"
                      value={testData.testId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Auto-generated if empty"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Test Name *
                    </label>
                    <input
                      type="text"
                      name="testName"
                      value={testData.testName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter test name"
                    />
                  </div>
                </FormGrid>

                <FormGrid cols={2}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={testData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select Category</option>
                      {Object.entries(testCategories).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={testData.price || ''}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter price"
                    />
                  </div>
                </FormGrid>

                <FormGrid cols={2}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Normal Range
                    </label>
                    <input
                      type="text"
                      name="normalRange"
                      value={testData.normalRange}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., 70-100 mg/dL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit
                    </label>
                    <input
                      type="text"
                      name="unit"
                      value={testData.unit}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., mg/dL, cells/mcL"
                    />
                  </div>
                </FormGrid>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={testData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter test description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preparation Instructions
                  </label>
                  <textarea
                    name="preparationInstructions"
                    value={testData.preparationInstructions}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Fasting required for 12 hours"
                  />
                </div>

                <CheckboxField
                  name="isActive"
                  checked={testData.isActive}
                  onChange={handleCheckboxChange}
                  label="Test is active and available for booking"
                />

                {/* Submit Button */}
                <div className="flex justify-center space-x-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
                  >
                    {loading ? 'Adding Test...' : 'Add Test'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setTestData({
                      testId: '',
                      testName: '',
                      category: '',
                      price: 0,
                      normalRange: '',
                      unit: '',
                      description: '',
                      preparationInstructions: '',
                      isActive: true,
                    })}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3"
                  >
                    Clear Form
                  </Button>
                </div>

                {/* Message */}
                {message && (
                  <div className={`mt-4 p-3 rounded-md text-center ${
                    message.includes('success') 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : 'bg-red-100 text-red-700 border border-red-200'
                  }`}>
                    {message}
                  </div>
                )}
              </form>
            </FormSection>
          </div>
        </div>
      </div>
    </div>
  );
}
