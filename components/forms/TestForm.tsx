'use client';

import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Card, 
  InputField, 
  SelectField, 
  Alert, 
  LoadingSpinner,
  FormGrid,
  FormSection 
} from '@/components/ui/FormElements';
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
  isDeleted: boolean; // Should be boolean, not number
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
        isDeleted: Boolean(test.isDeleted) // Convert number to boolean
      }));
      
      setTests(convertedTests);
    } catch {
      // Failed to load tests
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
      isDeleted: Boolean(test.isDeleted), // Ensure boolean type
    });
    setSelectedTestIndex(index);
    setMessage('');
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
        isDeleted: Boolean(formData.isDeleted) // Convert to boolean to match backend validation
      };

      // Attempting to save test

      if (formData.testId) {
        // Update existing test
        // Updating test
        await api.tests.update(formData.testId, testData);
        setMessage('Test updated successfully!');
      } else {
        // Create new test
        // Creating new test
        await api.tests.create(testData);
        setMessage('Test added successfully!');
      }

      // Reload tests list
      await loadTests();
      
      // Reset form
      handleClear();
    } catch (error) {
      // Save failed
      let errorMessage = 'Error saving test data';
      
      if (error instanceof Error) {
        // Error handling
        
        // Check for specific error types
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Network error: Cannot connect to server. Please ensure the backend server is running.';
        } else if (error.message.includes('HTTP 404')) {
          errorMessage = 'Test not found. It may have been deleted by another user.';
        } else if (error.message.includes('HTTP 400')) {
          errorMessage = `Invalid data: ${error.message}`;
        } else if (error.message.includes('HTTP 500')) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = tests
    .filter(test => {
      const matchesSearch = test.TestName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !filterCategory || test.Category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => b.ID - a.ID); // Sort by ID in descending order

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Card>
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-t-xl p-6 text-white">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-lg">🧪</span>
            Test Management
          </h2>
          <p className="mt-2 text-purple-100">Add, edit, and manage medical tests and diagnostic procedures</p>
        </div>

        <FormGrid>
          {/* Left side - Test Form */}
          <div className="xl:col-span-4">
            <Card className="bg-gray-50">
              <FormSection 
                title={`${formData.testId ? '✏️ Edit Test' : '➕ Add New Test'}`}
              >
                <div className="space-y-6">
                  <InputField
                    label="Test Name"
                    name="testName"
                    value={formData.testName}
                    onChange={handleInputChange}
                    placeholder="Enter test name"
                    required
                  />

                  <SelectField
                    label="Category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    options={testCategories.map(cat => ({ value: cat, label: cat }))}
                    required
                  />

                  <InputField
                    label="Price (₹)"
                    name="price"
                    type="number"
                    value={formData.price || ''}
                    onChange={handleInputChange}
                    placeholder="Enter price"
                    required
                  />

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
                      variant="primary"
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <LoadingSpinner size="sm" />
                          Saving...
                        </span>
                      ) : (
                        formData.testId ? 'Update Test' : 'Add Test'
                      )}
                    </Button>
                  </div>

                  <Button
                    onClick={handleClear}
                    variant="secondary"
                    className="w-full"
                  >
                    Clear Form
                  </Button>

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

          {/* Right side - Tests List */}
          <div className="xl:col-span-8">
            <Card>
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
            </Card>
          </div>
        </FormGrid>
      </Card>
    </div>
  );
};