'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/FormElements';

interface CashReceiptFormData {
  receiptId?: string;
  patientName: string;
  billDate: string;
  userName: string;
  orgID: number;
  relationType: 'W/o' | 'D/o' | 'S/o';
  relation: string;
  mobile: string;
  age: string;
  address: string;
  gender: 'Male' | 'Female' | 'Other';
  totalAmount: number;
  discount: number;
  netAmount: number;
  netAmountWords: string;
  refAmount: number;
  doctorID: number;
  isRefPaid: boolean;
  patientID?: number;
  isIPD: boolean;
  isDischarged: boolean;
  selectedTests: SelectedTest[];
}

interface SelectedTest {
  testId: number;
  testName: string;
  price: number;
  quantity: number;
  amount: number;
  isPrintable: boolean;
}

interface TestOption {
  ID: number;
  TestName: string;
  Price: number;
  Category: string;
  isDeleted: boolean;
}

interface DoctorOption {
  ID: number;
  DoctorName: string;
  isDeleted: boolean;
}

interface PatientOption {
  id: number;
  name: string;
  Mobile: string;
  Age: string;
  Gender: string;
  Address: string;
  RelationType: string;
  Relation: string;
  DoctorID: number;
}

export const CashReceiptForm: React.FC = () => {
  const [formData, setFormData] = useState<CashReceiptFormData>({
    patientName: '',
    billDate: new Date().toISOString().slice(0, 16),
    userName: 'admin',
    orgID: 1,
    relationType: 'W/o',
    relation: '',
    mobile: '',
    age: '',
    address: '',
    gender: 'Male',
    totalAmount: 0,
    discount: 0,
    netAmount: 0,
    netAmountWords: '',
    refAmount: 0,
    doctorID: 0,
    isRefPaid: false,
    isIPD: false,
    isDischarged: true,
    selectedTests: [],
  });

  const [tests, setTests] = useState<TestOption[]>([]);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searchPatientQuery, setSearchPatientQuery] = useState('');
  const [searchTestQuery, setSearchTestQuery] = useState('');
  const [showPatientSearch, setShowPatientSearch] = useState(false);

  // Load data from APIs
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Mock data for tests
      const mockTests: TestOption[] = [
        { ID: 289, TestName: 'USG Abdomen', Price: 1000, Category: 'USG', isDeleted: false },
        { ID: 290, TestName: 'USG OBSTETRICS', Price: 1000, Category: 'USG', isDeleted: false },
        { ID: 291, TestName: 'NT NB SCAN / LEVEL I', Price: 1800, Category: 'USG', isDeleted: false },
        { ID: 292, TestName: 'LEVEL II', Price: 2500, Category: 'USG', isDeleted: false },
        { ID: 293, TestName: 'Complete Blood Count (CBC)', Price: 300, Category: 'Blood Tests', isDeleted: false },
        { ID: 294, TestName: 'Fasting Blood Sugar', Price: 150, Category: 'Diabetes', isDeleted: false },
        { ID: 295, TestName: 'Lipid Profile', Price: 800, Category: 'Blood Tests', isDeleted: false },
        { ID: 296, TestName: 'Liver Function Test', Price: 600, Category: 'Liver Function', isDeleted: false },
      ];

      // Mock data for doctors
      const mockDoctors: DoctorOption[] = [
        { ID: 1594, DoctorName: 'Dr. Virender Kumar', isDeleted: false },
        { ID: 1595, DoctorName: 'SELF', isDeleted: false },
        { ID: 1596, DoctorName: 'MALIK HOSPITAL', isDeleted: false },
        { ID: 1597, DoctorName: 'SIDDHIVINAYAK', isDeleted: false },
      ];

      // Mock data for patients
      const mockPatients: PatientOption[] = [
        { id: 1, name: 'John Doe', Mobile: '9876543210', Age: '35', Gender: 'Male', Address: '123 Main St', RelationType: 'S/o', Relation: 'Ram Doe', DoctorID: 1594 },
        { id: 2, name: 'Jane Smith', Mobile: '9876543211', Age: '28', Gender: 'Female', Address: '456 Oak Ave', RelationType: 'D/o', Relation: 'Robert Smith', DoctorID: 1595 },
        { id: 3, name: 'Mike Johnson', Mobile: '9876543212', Age: '45', Gender: 'Male', Address: '789 Pine St', RelationType: 'S/o', Relation: 'David Johnson', DoctorID: 1596 },
      ];

      setTests(mockTests);
      setDoctors(mockDoctors);
      setPatients(mockPatients);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      setMessage('Failed to load initial data');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
    }));
  };

  const handlePatientSelect = (patient: PatientOption) => {
    setFormData(prev => ({
      ...prev,
      patientID: patient.id,
      patientName: patient.name,
      mobile: patient.Mobile,
      age: patient.Age,
      gender: patient.Gender as 'Male' | 'Female' | 'Other',
      address: patient.Address,
      relationType: patient.RelationType as 'W/o' | 'D/o' | 'S/o',
      relation: patient.Relation,
      doctorID: patient.DoctorID,
    }));
    setShowPatientSearch(false);
    setSearchPatientQuery('');
  };

  const handleTestSelect = (test: TestOption) => {
    const isAlreadySelected = formData.selectedTests.some(t => t.testId === test.ID);
    if (isAlreadySelected) return;

    const newTest: SelectedTest = {
      testId: test.ID,
      testName: test.TestName,
      price: test.Price,
      quantity: 1,
      amount: test.Price,
      isPrintable: true,
    };

    setFormData(prev => {
      const newSelectedTests = [...prev.selectedTests, newTest];
      const newTotalAmount = newSelectedTests.reduce((sum, t) => sum + t.amount, 0);
      const newNetAmount = newTotalAmount - prev.discount;

      return {
        ...prev,
        selectedTests: newSelectedTests,
        totalAmount: newTotalAmount,
        netAmount: newNetAmount,
        netAmountWords: numberToWords(newNetAmount),
      };
    });
  };

  const handleTestRemove = (testId: number) => {
    setFormData(prev => {
      const newSelectedTests = prev.selectedTests.filter(t => t.testId !== testId);
      const newTotalAmount = newSelectedTests.reduce((sum, t) => sum + t.amount, 0);
      const newNetAmount = newTotalAmount - prev.discount;

      return {
        ...prev,
        selectedTests: newSelectedTests,
        totalAmount: newTotalAmount,
        netAmount: newNetAmount,
        netAmountWords: numberToWords(newNetAmount),
      };
    });
  };

  const handleQuantityChange = (testId: number, quantity: number) => {
    if (quantity < 1) return;

    setFormData(prev => {
      const newSelectedTests = prev.selectedTests.map(test => {
        if (test.testId === testId) {
          return { ...test, quantity, amount: test.price * quantity };
        }
        return test;
      });

      const newTotalAmount = newSelectedTests.reduce((sum, t) => sum + t.amount, 0);
      const newNetAmount = newTotalAmount - prev.discount;

      return {
        ...prev,
        selectedTests: newSelectedTests,
        totalAmount: newTotalAmount,
        netAmount: newNetAmount,
        netAmountWords: numberToWords(newNetAmount),
      };
    });
  };

  const handleDiscountChange = (discount: number) => {
    setFormData(prev => {
      const newNetAmount = prev.totalAmount - discount;
      return {
        ...prev,
        discount,
        netAmount: newNetAmount,
        netAmountWords: numberToWords(newNetAmount),
      };
    });
  };

  const handleClear = () => {
    setFormData({
      patientName: '',
      billDate: new Date().toISOString().slice(0, 16),
      userName: 'admin',
      orgID: 1,
      relationType: 'W/o',
      relation: '',
      mobile: '',
      age: '',
      address: '',
      gender: 'Male',
      totalAmount: 0,
      discount: 0,
      netAmount: 0,
      netAmountWords: '',
      refAmount: 0,
      doctorID: 0,
      isRefPaid: false,
      isIPD: false,
      isDischarged: true,
      selectedTests: [],
    });
    setMessage('');
    setSearchPatientQuery('');
    setShowPatientSearch(false);
  };

  const handleSave = async () => {
    if (!formData.patientName.trim()) {
      setMessage('Patient name is required');
      return;
    }

    if (formData.selectedTests.length === 0) {
      setMessage('At least one test must be selected');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setMessage('Cash receipt saved successfully!');
      
      // In a real implementation, this would call the actual API
      // to save both tbl_cashreceipt and tbl_cashreceipt_details
      
      // Reset form after successful save
      handleClear();
    } catch (error) {
      console.error('Save failed:', error);
      setMessage('Error saving cash receipt');
    } finally {
      setLoading(false);
    }
  };

  const numberToWords = (num: number): string => {
    // Simple implementation - in real app, use a proper library
    return `Rupees ${num} only`;
  };

  const filteredTests = tests.filter(test => 
    !test.isDeleted && 
    test.TestName.toLowerCase().includes(searchTestQuery.toLowerCase())
  );

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchPatientQuery.toLowerCase()) ||
    patient.Mobile.includes(searchPatientQuery)
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-t-xl p-6 text-white">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-lg">🧾</span>
          Cash Receipt Management
        </h2>
        <p className="mt-2 text-green-100">Create and manage patient cash receipts with multiple tests</p>
        <div className="mt-4 flex gap-6 text-sm">
          <div className="bg-white/20 rounded-lg px-3 py-2">
            <span className="font-medium">Total Amount: ₹{formData.totalAmount}</span>
          </div>
          <div className="bg-white/20 rounded-lg px-3 py-2">
            <span className="font-medium">Net Amount: ₹{formData.netAmount}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-b-xl shadow-lg border border-gray-200">
        <div className="p-6 space-y-8">
          {/* Patient Information Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Patient Information</h3>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowPatientSearch(!showPatientSearch)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  {showPatientSearch ? 'Hide Search' : 'Search Patient'}
                </Button>
                <Button
                  onClick={handleClear}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                >
                  New Receipt
                </Button>
              </div>
            </div>

            {/* Patient Search */}
            {showPatientSearch && (
              <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Search Existing Patient</h4>
                <input
                  type="text"
                  value={searchPatientQuery}
                  onChange={(e) => setSearchPatientQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                  placeholder="Search by name or mobile number..."
                />
                {searchPatientQuery && (
                  <div className="mt-3 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                    {filteredPatients.map((patient) => (
                      <div
                        key={patient.id}
                        onClick={() => handlePatientSelect(patient)}
                        className="p-3 border-b border-gray-100 hover:bg-green-50 cursor-pointer transition-colors"
                      >
                        <div className="font-medium text-gray-900">{patient.name}</div>
                        <div className="text-sm text-gray-500">
                          {patient.Mobile} • {patient.Age} years • {patient.Gender}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient ID
                    </label>
                    <input
                      type="number"
                      name="patientID"
                      value={formData.patientID || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                      placeholder="Auto-filled"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bill Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      name="billDate"
                      value={formData.billDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                    placeholder="Enter patient name"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Relation</label>
                    <div className="space-y-2">
                      {(['W/o', 'D/o', 'S/o'] as const).map((type) => (
                        <label key={type} className="flex items-center">
                          <input
                            type="radio"
                            name="relationType"
                            value={type}
                            checked={formData.relationType === type}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-green-600 focus:ring-green-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Relation Name</label>
                    <input
                      type="text"
                      name="relation"
                      value={formData.relation}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                      placeholder="Father's/Husband's name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                    <input
                      type="text"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                      placeholder="Age"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mobile</label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                      placeholder="Mobile number"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                    placeholder="Enter complete address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reference Doctor</label>
                  <select
                    name="doctorID"
                    value={formData.doctorID}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                  >
                    <option value={0}>Select Doctor</option>
                    {doctors.filter(d => !d.isDeleted).map((doctor) => (
                      <option key={doctor.ID} value={doctor.ID}>
                        {doctor.DoctorName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Referral Amount</label>
                    <input
                      type="number"
                      name="refAmount"
                      value={formData.refAmount}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-end space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        name="isIPD"
                        checked={formData.isIPD}
                        onChange={handleInputChange}
                        className="mr-2 w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      Is IPD Patient
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Test Selection Section */}
          <div className="grid grid-cols-12 gap-8">
            {/* Left side - Test Selection */}
            <div className="col-span-12 xl:col-span-6">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Selection</h3>
                
                <div className="mb-4">
                  <input
                    type="text"
                    value={searchTestQuery}
                    onChange={(e) => setSearchTestQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                    placeholder="Search tests..."
                  />
                </div>

                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                  {filteredTests.map((test) => (
                    <div
                      key={test.ID}
                      onClick={() => handleTestSelect(test)}
                      className="p-3 border-b border-gray-100 hover:bg-green-50 cursor-pointer transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-900">{test.TestName}</div>
                          <div className="text-sm text-gray-500">{test.Category}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-green-600">₹{test.Price}</div>
                          <div className="text-xs text-gray-500">ID: {test.ID}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side - Selected Tests & Summary */}
            <div className="col-span-12 xl:col-span-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Tests & Billing</h3>
                
                {/* Selected Tests */}
                <div className="mb-6">
                  {formData.selectedTests.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No tests selected. Click on tests from the left panel to add them.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-40 overflow-y-auto">
                      {formData.selectedTests.map((test) => (
                        <div key={test.testId} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{test.testName}</div>
                            <div className="text-sm text-gray-500">₹{test.price} each</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={test.quantity}
                              onChange={(e) => handleQuantityChange(test.testId, parseInt(e.target.value) || 1)}
                              min="1"
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                            />
                            <span className="font-medium text-gray-900 w-16 text-right">₹{test.amount}</span>
                            <Button
                              onClick={() => handleTestRemove(test.testId)}
                              className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 text-xs rounded"
                            >
                              ✕
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Billing Summary */}
                <div className="border-t border-gray-200 pt-6 space-y-4">
                  <div className="flex justify-between text-lg font-medium">
                    <span>Total Amount:</span>
                    <span>₹{formData.totalAmount}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Discount:</span>
                    <input
                      type="number"
                      value={formData.discount}
                      onChange={(e) => handleDiscountChange(Number(e.target.value) || 0)}
                      min="0"
                      max={formData.totalAmount}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-right"
                    />
                  </div>
                  
                  <div className="flex justify-between text-xl font-bold text-green-600 border-t border-gray-200 pt-4">
                    <span>Net Amount:</span>
                    <span>₹{formData.netAmount}</span>
                  </div>
                  
                  {formData.netAmountWords && (
                    <div className="text-sm text-gray-600 italic">
                      Amount in words: {formData.netAmountWords}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center pt-6 border-t border-gray-200">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 font-medium rounded-lg"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving Receipt...
                </span>
              ) : (
                'Save Cash Receipt'
              )}
            </Button>
            
            <Button
              onClick={handleClear}
              className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 font-medium rounded-lg"
            >
              Clear Form
            </Button>
          </div>

          {/* Message */}
          {message && (
            <div className={`p-4 rounded-lg text-center font-medium ${
              message.includes('success')
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};