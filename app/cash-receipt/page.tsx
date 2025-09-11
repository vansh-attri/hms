'use client';

import React, { useState } from 'react';
import { Button, FormSection } from '@/components/ui/FormElements';

interface TestOption {
  id: string;
  name: string;
  price: number;
  selected: boolean;
}

interface CashReceiptData {
  billNo: string;
  patientNo: string;
  patientName: string;
  title: 'W/o' | 'D/o' | 'S/o';
  ageSex: string;
  mobileNo: string;
  date: string;
  address: string;
  referenceDoctor: string;
  isIPD: boolean;
  selectedTests: TestOption[];
  totalDiscount: number;
  totalAmount: number;
}

export default function CashReceiptPage() {
  const [receiptData, setReceiptData] = useState<CashReceiptData>({
    billNo: 'BILL' + Date.now(),
    patientNo: '',
    patientName: '',
    title: 'W/o',
    ageSex: '',
    mobileNo: '',
    date: new Date().toISOString().split('T')[0],
    address: '',
    referenceDoctor: 'AW AZADWATI KAKRIPUR',
    isIPD: false,
    selectedTests: [],
    totalDiscount: 0,
    totalAmount: 0,
  });

  const [availableTests] = useState<TestOption[]>([
    { id: '1', name: 'ABDOMEN + NECK -2500', price: 2500, selected: false },
    { id: '2', name: 'ARTERIAL DOPPLER SINGLE LIMB-2000', price: 2000, selected: false },
    { id: '3', name: 'ARTERIAL+VENOUS DOPPLER SINGLE LIMB-4000', price: 4000, selected: false },
    { id: '4', name: 'B SCAN-1500', price: 1500, selected: false },
    { id: '5', name: 'BREAST-1500', price: 1500, selected: false },
    { id: '6', name: 'CAROTID DOPPLER-2500', price: 2500, selected: false },
    { id: '7', name: 'COLOUR DOPPLER-2500', price: 2500, selected: false },
    { id: '8', name: 'EMERGENCY-2000', price: 2000, selected: false },
    { id: '9', name: 'FETAL ECHO-4000', price: 4000, selected: false },
    { id: '10', name: 'LEVEL II-2500', price: 2500, selected: false },
    { id: '11', name: 'LOCAL PARTS-1500', price: 1500, selected: false },
    { id: '12', name: 'NT NB SCAN-1800', price: 1800, selected: false },
    { id: '13', name: 'OBS+ABD-1500', price: 1500, selected: false },
    { id: '14', name: 'OBSTETRIC-2500', price: 2500, selected: false },
    { id: '15', name: 'OVULATION-3500', price: 3500, selected: false },
  ]);

  const doctors = [
    'AW AZADWATI KAKRIPUR',
    'Dr. Virender Kumar',
    'Dr. Rajesh Sharma',
    'Dr. Priya Singh'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setReceiptData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTestSelection = (testId: string) => {
    const test = availableTests.find(t => t.id === testId);
    if (!test) return;

    setReceiptData(prev => {
      const isAlreadySelected = prev.selectedTests.some(t => t.id === testId);
      let newSelectedTests;
      
      if (isAlreadySelected) {
        newSelectedTests = prev.selectedTests.filter(t => t.id !== testId);
      } else {
        newSelectedTests = [...prev.selectedTests, { ...test, selected: true }];
      }

      const newTotalAmount = newSelectedTests.reduce((sum, t) => sum + t.price, 0) - prev.totalDiscount;

      return {
        ...prev,
        selectedTests: newSelectedTests,
        totalAmount: newTotalAmount
      };
    });
  };

  const searchBill = () => {
    console.log('Searching for bill:', receiptData.billNo);
  };

  const searchPatient = () => {
    console.log('Searching for patient:', receiptData.patientNo);
  };

  const newReceipt = () => {
    setReceiptData({
      billNo: 'BILL' + Date.now(),
      patientNo: '',
      patientName: '',
      title: 'W/o',
      ageSex: '',
      mobileNo: '',
      date: new Date().toISOString().split('T')[0],
      address: '',
      referenceDoctor: 'AW AZADWATI KAKRIPUR',
      isIPD: false,
      selectedTests: [],
      totalDiscount: 0,
      totalAmount: 0,
    });
  };

  const handleSave = () => {
    console.log('Saving receipt:', receiptData);
    alert('Receipt saved successfully!');
  };

  return (
  <div className="py-4">
      <div className="">
        <FormSection title="📋 New Cash Receipt">
          {/* First Row - Bill No */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-end">
            <div>
              <label className="text-sm font-medium text-gray-700">Bill No.</label>
              <input
                type="text"
                name="billNo"
                value={receiptData.billNo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={searchBill} className="bg-blue-600 hover:bg-blue-700 text-white px-4">
                Search Bill
              </Button>
              <Button onClick={newReceipt} className="bg-green-600 hover:bg-green-700 text-white px-4">
                New Receipt
              </Button>
            </div>
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  name="isIPD"
                  checked={receiptData.isIPD}
                  onChange={handleInputChange}
                  className="mr-2 w-4 h-4"
                />
                Is IPD
              </label>
            </div>
          </div>

          {/* Second Row - Patient No */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-end">
            <div>
              <label className="text-sm font-medium text-gray-700">Patient No</label>
              <input
                type="text"
                name="patientNo"
                value={receiptData.patientNo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={searchPatient} className="bg-blue-600 hover:bg-blue-700 text-white px-4">
                Search Patient
              </Button>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                name="date"
                value={receiptData.date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              />
            </div>
          </div>

          {/* Third Row - Patient Name */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-end">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Patient Name</label>
              <input
                type="text"
                name="patientName"
                value={receiptData.patientName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Address</label>
              <textarea
                name="address"
                value={receiptData.address}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>

          {/* Fourth Row - Title Radio Buttons */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-6">
              {(['W/o', 'D/o', 'S/o'] as const).map((title) => (
                <label key={title} className="flex items-center text-sm">
                  <input
                    type="radio"
                    name="title"
                    value={title}
                    checked={receiptData.title === title}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  {title}
                </label>
              ))}
            </div>
          </div>

          {/* Fifth Row - Age/Sex and Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-end">
            <div>
              <label className="text-sm font-medium text-gray-700">Age/Sex</label>
              <input
                type="text"
                name="ageSex"
                value={receiptData.ageSex}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="25/M"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Reference Doctor</label>
              <select
                name="referenceDoctor"
                value={receiptData.referenceDoctor}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              >
                {doctors.map((doctor, index) => (
                  <option key={index} value={doctor}>{doctor}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sixth Row - Mobile No */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 items-end">
            <div>
              <label className="text-sm font-medium text-gray-700">Mobile No</label>
              <input
                type="tel"
                name="mobileNo"
                value={receiptData.mobileNo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>

          {/* Test Details Section */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left side - Test Selection */}
            <div className="col-span-12 lg:col-span-6">
              <div className="bg-gray-50 p-4 rounded border">
                <h3 className="text-sm font-semibold mb-3">Test Details</h3>
                <div className="mb-3">
                  <label className="text-sm font-medium text-gray-700">Select Test Name :</label>
                  <select 
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm mt-1"
                    onChange={(e) => {
                      const testId = e.target.value;
                      if (testId) handleTestSelection(testId);
                    }}
                    value=""
                  >
                    <option value="">ABDOMEN + NECK -2500</option>
                    {availableTests.map((test) => (
                      <option key={test.id} value={test.id}>
                        {test.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Available Tests List */}
                <div className="border border-gray-300 rounded max-h-40 overflow-y-auto">
                  {availableTests.map((test) => (
                    <div key={test.id} className="flex items-center p-2 border-b border-gray-200 hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={receiptData.selectedTests.some(t => t.id === test.id)}
                        onChange={() => handleTestSelection(test.id)}
                        className="mr-2"
                      />
                      <span className="text-sm flex-1">{test.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side - Summary */}
            <div className="col-span-12 lg:col-span-6">
              <div className="space-y-4">
                <div className="text-right">
                  <div className="mb-2">
                    <label className="text-sm font-medium text-gray-700">Total Discount :</label>
                    <input
                      type="number"
                      name="totalDiscount"
                      value={receiptData.totalDiscount}
                      onChange={(e) => {
                        const discount = Number(e.target.value);
                        setReceiptData(prev => ({
                          ...prev,
                          totalDiscount: discount,
                          totalAmount: prev.selectedTests.reduce((sum, t) => sum + t.price, 0) - discount
                        }));
                      }}
                      className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm w-20 text-right"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700">Total Amount :</label>
                    <input
                      type="number"
                      value={receiptData.totalAmount}
                      readOnly
                      className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm w-20 text-right bg-gray-100"
                    />
                  </div>
                </div>

                {/* Selected Tests Display */}
                {receiptData.selectedTests.length > 0 && (
                  <div className="border border-gray-300 rounded p-3">
                    <h4 className="text-sm font-semibold mb-2">Selected Tests:</h4>
                    {receiptData.selectedTests.map((test) => (
                      <div key={test.id} className="flex justify-between text-sm py-1">
                        <span>{test.name}</span>
                        <span>₹{test.price}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6 text-center">
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              Save
            </Button>
          </div>
        </FormSection>
      </div>
    </div>
  );
}
