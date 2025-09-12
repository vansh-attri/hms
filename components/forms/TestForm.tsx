'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/FormElements';
import { api } from '@/utils/api';

interface TestFormData {
  testId?: string;
  testName: string;
  price: number;
  category: string;
  isDeleted: boolean;
}

interface TestRecord {
  ID: number;
  TestName: string;
  Price: number;
  Category: string;
  isDeleted: boolean;
}

const testCategories = [
  'Blood Tests',
  'Urine Tests',
  'USG',
  'X-Ray',
  'ECG',
  'Pathology',
  'Biochemistry',
  'Microbiology',
  'Radiology',
  'Cardiology',
  'Hormone Tests',
  'Diabetes',
  'Thyroid',
  'Liver Function',
  'Kidney Function',
];

const commonTests = [
  { name: 'USG Abdomen', category: 'USG', price: 1000 },
  { name: 'USG OBSTETRICS', category: 'USG', price: 1000 },
  { name: 'NT NB SCAN / LEVEL I', category: 'USG', price: 1800 },
  { name: 'LEVEL II', category: 'USG', price: 2500 },
  { name: 'Complete Blood Count (CBC)', category: 'Blood Tests', price: 300 },
  { name: 'Fasting Blood Sugar', category: 'Diabetes', price: 150 },
  { name: 'Lipid Profile', category: 'Blood Tests', price: 800 },
  { name: 'Liver Function Test', category: 'Liver Function', price: 600 },
  { name: 'Kidney Function Test', category: 'Kidney Function', price: 500 },
  { name: 'Thyroid Profile', category: 'Thyroid', price: 900 },
  { name: 'Urine Routine', category: 'Urine Tests', price: 200 },
  { name: 'ECG', category: 'ECG', price: 400 },
  { name: 'Chest X-Ray', category: 'X-Ray', price: 500 },
];

export const TestForm: React.FC = () => {
  const [formData, setFormData] = useState<TestFormData>({
    testName: '',
    price: 0,
    category: '',
    isDeleted: false,
  });

  const [tests, setTests] = useState<TestRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedTestIndex, setSelectedTestIndex] = useState<number>(-1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Load tests from API
  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      setLoading(true);
      const testsData = await api.tests.getAll();
      
      // Convert API response to match our TestRecord interface
      const convertedTests: TestRecord[] = testsData.map(test => ({
        ID: test.id,
        TestName: test.name,
        Price: test.price,
        Category: test.category || 'General',
        isDeleted: test.isDeleted
      }));
      
      setTests(convertedTests);
    } catch (error) {
      console.error('Failed to load tests:', error);
      setMessage('Failed to load tests from server');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
    }));
  };

  const handleTestSelect = (test: TestRecord, index: number) => {
    setFormData({
      testId: String(test.ID),
      testName: test.TestName,
      price: test.Price,
      category: test.Category,
      isDeleted: test.isDeleted,
    });
    setSelectedTestIndex(index);
    setMessage('');
  };

  const handleQuickAdd = (test: typeof commonTests[0]) => {
    setFormData(prev => ({
      ...prev,
      testName: test.name,
      category: test.category,
      price: test.price,
      isDeleted: false,
    }));
    setSelectedTestIndex(-1);
  };

  const handleClear = () => {
    setFormData({
      testName: '',
      price: 0,
      category: '',
      isDeleted: false,
    });
    setSelectedTestIndex(-1);
    setMessage('');
  };

  const handleSave = async () => {
    if (!formData.testName.trim()) {
      setMessage('Test name is required');
      return;
    }

    if (!formData.category.trim()) {
      setMessage('Category is required');
      return;
    }

    if (formData.price <= 0) {
      setMessage('Price must be greater than 0');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const testData = {
        name: formData.testName.trim(),
        price: formData.price,
        category: formData.category,
        isDeleted: formData.isDeleted
      };

      if (formData.testId) {
        // Update existing test
        await api.tests.update(formData.testId, testData);
        setMessage('Test updated successfully!');
      } else {
        // Create new test
        await api.tests.create(testData);
        setMessage('Test added successfully!');
      }

      // Reload tests list
      await loadTests();
      
      // Reset form
      handleClear();
    } catch (error) {
      console.error('Save failed:', error);
      setMessage('Error saving test data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!formData.testId) return;

    if (!confirm('Are you sure you want to delete this test?')) return;

    setLoading(true);
    try {
      await api.tests.delete(formData.testId);
      setMessage('Test deleted successfully!');
      
      // Reload tests list
      await loadTests();
      
      handleClear();
    } catch (error) {
      console.error('Delete failed:', error);
      setMessage('Error deleting test');
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.TestName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filterCategory || test.Category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-t-xl p-6 text-white">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-lg">🧪</span>
          Test Management
        </h2>
        <p className="mt-2 text-purple-100">Add, edit, and manage medical tests and diagnostic procedures</p>
      </div>

      <div className="bg-white rounded-b-xl shadow-lg border border-gray-200">
        <div className="grid grid-cols-12 gap-8 p-6">
          {/* Left side - Test Form */}
          <div className="col-span-12 xl:col-span-4">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-600 rounded-lg flex items-center justify-center text-white text-sm">
                  {formData.testId ? '✏️' : '➕'}
                </span>
                {formData.testId ? 'Edit Test' : 'Add New Test'}
              </h3>
              
              {/* Quick Add Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Add Common Tests</h4>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                  {commonTests.map((test, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickAdd(test)}
                      className="text-left p-2 rounded-md border border-gray-200 hover:bg-purple-50 hover:border-purple-300 transition-colors text-xs"
                    >
                      <div className="font-medium text-gray-900">{test.name}</div>
                      <div className="text-gray-500">₹{test.price} • {test.category}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Name *
                  </label>
                  <input
                    type="text"
                    name="testName"
                    value={formData.testName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                    placeholder="Enter test name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                  >
                    <option value="">Select Category</option>
                    {testCategories.map((category) => (
                      <option key={category} value={category}>{category}</option>
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
                    value={formData.price || ''}
                    onChange={handleInputChange}
                    min="0"
                    step="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                    placeholder="Enter price"
                  />
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <label className="flex items-start text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      name="isDeleted"
                      checked={formData.isDeleted}
                      onChange={handleInputChange}
                      className="mr-3 mt-0.5 w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
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
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 font-medium rounded-lg"
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
                      formData.testId ? 'Update Test' : 'Add Test'
                    )}
                  </Button>
                  
                  {formData.testId && (
                    <Button
                      onClick={handleDelete}
                      disabled={loading}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 font-medium rounded-lg"
                    >
                      Delete
                    </Button>
                  )}
                </div>

                <Button
                  onClick={handleClear}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 font-medium rounded-lg"
                >
                  Clear Form
                </Button>

                {message && (
                  <div
                    className={`p-4 rounded-lg text-center font-medium text-sm ${
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

          {/* Right side - Tests List */}
          <div className="col-span-12 xl:col-span-8">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Search Header */}
              <div className="bg-gray-50 p-4 border-b border-gray-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">All Tests</h3>
                  <span className="text-sm text-gray-500">
                    {filteredTests.length} of {tests.length} tests
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                    placeholder="Search tests by name..."
                  />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                  >
                    <option value="">All Categories</option>
                    {testCategories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 bg-purple-50 p-3 text-sm font-medium text-purple-800 border-b border-purple-200">
                <div className="col-span-1">►</div>
                <div className="col-span-1">ID</div>
                <div className="col-span-5">Test Name</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2">Price</div>
                <div className="col-span-1 text-center">Status</div>
              </div>

              {/* Table Body */}
              <div className="max-h-96 overflow-y-auto">
                {filteredTests.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    {searchQuery || filterCategory ? 'No tests found matching your filters.' : 'No tests found. Add your first test using the form.'}
                  </div>
                ) : (
                  filteredTests.map((test, index) => {
                    const isSelected = selectedTestIndex === index;
                    const rowClasses = `grid grid-cols-12 gap-2 p-3 text-sm border-b border-gray-100 hover:bg-purple-50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-purple-100 border-purple-300' : ''
                    }`;
                    
                    return (
                      <div
                        key={test.ID}
                        className={rowClasses}
                        onClick={() => handleTestSelect(test, index)}
                      >
                        <div className="col-span-1 text-purple-600 font-medium">
                          {isSelected ? '►' : ''}
                        </div>
                        <div className="col-span-1 font-medium text-purple-700">
                          {test.ID}
                        </div>
                        <div className="col-span-5 font-medium text-gray-900">
                          {test.TestName}
                        </div>
                        <div className="col-span-2 text-gray-600">
                          {test.Category}
                        </div>
                        <div className="col-span-2 font-medium text-gray-900">
                          ₹{test.Price}
                        </div>
                        <div className="col-span-1 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            test.isDeleted 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {test.isDeleted ? 'Deleted' : 'Active'}
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
                  Total: {tests.length} tests
                </span>
                <span>
                  Active: {tests.filter(t => !t.isDeleted).length} | 
                  Deleted: {tests.filter(t => t.isDeleted).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};