'use client';

import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Card, 
  InputField
} from '@/components/ui/FormElements';
import { api, patientAPI, receiptAPI, CashReceiptSearchResult, CashReceiptSummary } from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';

type PatientSearchRow = Awaited<ReturnType<typeof patientAPI.search>>[number];

interface BillItem {
  testId: number;
  TestName: string;
  Quantity: number;
  CreatedDate: string;
}

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
  id: number;
  name: string;
  isDeleted: number; // 0 = active, 1 = deleted
}

export const CashReceiptForm: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<CashReceiptFormData>({
    patientName: '',
    billDate: new Date().toISOString().slice(0, 16),
    userName: user?.username || 'admin',
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
    isDischarged: false, // Should be false (0) by default
    selectedTests: [],
  });

  const [tests, setTests] = useState<TestOption[]>([]);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [searchPatientResults, setSearchPatientResults] = useState<PatientSearchRow[]>([]);
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [searchTestQuery, setSearchTestQuery] = useState('');

  
  // Bill Search functionality
  const [showBillSearch, setShowBillSearch] = useState(false);
  const [searchBillQuery, setSearchBillQuery] = useState('');
  const [searchBillResults, setSearchBillResults] = useState<CashReceiptSearchResult[]>([]);
  const [searchingBills, setSearchingBills] = useState(false);
  
  // Print functionality
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  // Load data from APIs
  useEffect(() => {
    loadInitialData();
  }, []);

  // Update username when user changes
  useEffect(() => {
    if (user?.username) {
      setFormData(prev => ({
        ...prev,
        userName: user.username
      }));
    }
  }, [user?.username]);

  // Close print dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showPrintPreview && !(event.target as Element).closest('.print-dropdown')) {
        setShowPrintPreview(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPrintPreview]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load real data from APIs
      const [testsData, doctorsData] = await Promise.all([
        api.tests.getAll().catch(() => []),
        api.doctors.getAll().catch(() => [])
      ]);

      // Convert tests data to match TestOption interface
      const convertedTests: TestOption[] = testsData.map(test => ({
        ID: test.id,
        TestName: test.name,
        Price: test.price,
        Category: test.category || 'General',
        isDeleted: test.isDeleted
      }));

      // Convert doctors data to match DoctorOption interface
      const convertedDoctors: DoctorOption[] = doctorsData.map(doctor => ({
        id: doctor.id,
        name: doctor.name,
        isDeleted: doctor.isDeleted // Keep as number (0 = active, 1 = deleted)
      }));

      setTests(convertedTests);
      setDoctors(convertedDoctors);
    } catch {
      setMessage('Unable to load system data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    // Clear validation error for this field
    setValidationErrors(prev => ({
      ...prev,
      [name]: ''
    }));
    
    // If patient name is manually changed, clear patient selection
    if (name === 'patientName' && formData.patientID) {
      setFormData(prev => ({
        ...prev,
        patientID: undefined,
        patientName: value,
        mobile: '',
        age: '',
        address: '',
        gender: 'Male',
        relationType: 'W/o',
        relation: ''
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? 0 : Number(value)) : value)
    }));
    
    // Validate mobile number specifically
    if (name === 'mobile' && value) {
      validateMobile(value);
    }
  };

  const validateMobile = (mobile: string) => {
    if (mobile && !/^[0-9]{10}$/.test(mobile)) {
      setValidationErrors(prev => ({
        ...prev,
        mobile: 'Mobile number must be exactly 10 digits'
      }));
      return false;
    }
    setValidationErrors(prev => ({
      ...prev,
      mobile: ''
    }));
    return true;
  };

  const handleRefAmountChange = (value: string) => {
    const refAmount = value === '' ? 0 : Number(value) || 0;
    setFormData(prev => ({
      ...prev,
      refAmount
    }));
  };



  // Live search function for patient name field
  const handleLivePatientSearch = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchPatientResults([]);
      return;
    }
    
    setSearchingPatients(true);
    try {
      const rows = await patientAPI.search({ 
        name: /\D/.test(query) ? query : undefined, 
        mobile: /^\d+$/.test(query) ? query : undefined, 
        limit: 10 
      });
      setSearchPatientResults(rows);
    } catch {
      // Search failed silently
    } finally {
      setSearchingPatients(false);
    }
  };

  // Debounced search effect for live search
  useEffect(() => {
    if (!formData.patientID) { // Only search if no patient is selected
      const timer = setTimeout(() => {
        handleLivePatientSearch(formData.patientName);
      }, 300); // 300ms delay

      return () => clearTimeout(timer);
    } else {
      setSearchPatientResults([]); // Clear results if patient is already selected
    }
  }, [formData.patientName, formData.patientID]);

  const applyPatientToForm = (row: PatientSearchRow) => {
    setFormData(prev => ({
      ...prev,
      patientID: row.id,
      patientName: row.name || '',
      mobile: row.Mobile || '',
      age: row.Age ? String(row.Age) : '',
      gender: (row.Gender as 'Male' | 'Female' | 'Other') || 'Male',
      address: row.Address || '',
      relationType: (row.RelationType as 'W/o' | 'D/o' | 'S/o') || 'W/o',
      relation: row.Relation || '',
      doctorID: row.DoctorID || 1594,
    }));
    setSearchPatientResults([]);
  };

  // Bill search function
  const handleBillSearch = async () => {
    if (!searchBillQuery.trim()) return;
    
    setSearchingBills(true);
    try {
      const results = await receiptAPI.search(searchBillQuery.trim(), 20);
      setSearchBillResults(results);
    } catch {
      // Bill search failed silently
      setMessage('Error searching bills');
    } finally {
      setSearchingBills(false);
    }
  };

  const applyBillToForm = async (bill: CashReceiptSearchResult) => {
    try {
      setLoading(true);
      
      // Get full bill details including items
      const fullBill = await receiptAPI.getById(bill.id);
      
      // Update form with bill data
      setFormData(prev => ({
        ...prev,
        receiptId: String(bill.id),
        patientID: bill.PatientID || undefined,
        patientName: bill.PatientName || '',
        billDate: bill.BillDate ? new Date(bill.BillDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        mobile: bill.Mobile || '',
        age: bill.Age || '',
        address: bill.Address || '',
        gender: (bill.Gender as 'Male' | 'Female' | 'Other') || 'Male',
        relationType: (bill.RelationType as 'W/o' | 'D/o' | 'S/o') || 'W/o',
        relation: bill.Relation || '',
        doctorID: bill.DoctorID || 0,
        discount: bill.Discount || 0,
        totalAmount: bill.TotalAmount || 0,
        netAmount: bill.NetAmount || 0,
        netAmountWords: numberToWords(bill.NetAmount || 0),
        refAmount: bill.RefAmount || 0,
        isRefPaid: bill.isRefPaid || false,
        selectedTests: fullBill.items ? fullBill.items.map((item: BillItem) => ({
          testId: item.testId,
          testName: item.TestName,
          price: bill.Rate || 0, // Use the rate from the receipt
          quantity: item.Quantity,
          amount: (bill.Rate || 0) * item.Quantity,
          isPrintable: true,
        })) : []
      }));
      
      // Close search
      setSearchBillResults([]);
      setSearchBillQuery('');
      setShowBillSearch(false);
      setMessage(`Loaded bill #${bill.id} for editing`);
      
    } catch {
      // Error loading bill details - fail silently
      setMessage('Error loading bill details');
    } finally {
      setLoading(false);
    }
  };

  const handleTestSelect = (test: TestOption) => {
    const isAlreadySelected = formData.selectedTests.some(t => t.testId === test.ID);
    if (isAlreadySelected) return;

    const newTest: SelectedTest = {
      testId: test.ID,
      testName: test.TestName,
      price: test.Price,
      quantity: 1,
      amount: test.Price * 1, // Ensure correct calculation
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

  const handleDiscountChange = (value: string) => {
    const discount = value === '' ? 0 : Number(value) || 0;
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
      receiptId: undefined,
      patientName: '',
      billDate: new Date().toISOString().slice(0, 16),
      userName: user?.username || 'admin',
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
      isDischarged: false, // Set to false (0) as default
      selectedTests: [],
    });
    setMessage('');
    setSearchBillQuery('');
    setShowBillSearch(false);
  };

  const handlePrintBill = (showPreview = false) => {
    // Check if there's data to print
    if (!formData.patientName.trim()) {
      setMessage('No receipt data to print. Please save a receipt first.');
      return;
    }

    // Create print content
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cash Receipt - ${formData.receiptId || 'New'}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.4;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .receipt-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .receipt-id {
            font-size: 14px;
            color: #666;
          }
          .patient-info {
            margin-bottom: 20px;
          }
          .info-row {
            display: flex;
            margin-bottom: 8px;
          }
          .info-label {
            font-weight: bold;
            width: 140px;
            flex-shrink: 0;
          }
          .info-value {
            flex: 1;
          }
          .tests-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .tests-table th,
          .tests-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          .tests-table th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          .tests-table .number-cell {
            text-align: right;
          }
          .billing-summary {
            margin-top: 20px;
            border-top: 1px solid #ddd;
            padding-top: 15px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }
          .summary-total {
            font-weight: bold;
            font-size: 18px;
            border-top: 1px solid #333;
            padding-top: 8px;
            margin-top: 8px;
          }
          .amount-words {
            font-style: italic;
            color: #666;
            margin-top: 10px;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          .print-controls {
            position: fixed;
            top: 10px;
            right: 10px;
            background: white;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .print-controls button {
            margin: 0 5px;
            padding: 8px 16px;
            border: none;
            border-radius: 3px;
            cursor: pointer;
          }
          .print-btn {
            background: #4CAF50;
            color: white;
          }
          .close-btn {
            background: #f44336;
            color: white;
          }
          @media print {
            body { margin: 0; padding: 15px; }
            .no-print, .print-controls { display: none !important; }
          }
        </style>
      </head>
      <body>
        ${showPreview ? `
        <div class="print-controls no-print">
          <button class="print-btn" onclick="window.print()">🖨️ Print</button>
          <button class="close-btn" onclick="window.close()">✕ Close</button>
        </div>
        ` : ''}

        <div class="header">
          <div class="receipt-title">CASH RECEIPT</div>
          <div class="receipt-id">Receipt ID: ${formData.receiptId || 'Not Saved'}</div>
        </div>

        <div class="patient-info">
          <h3>Patient Information</h3>
          <div class="info-row">
            <span class="info-label">Patient Name:</span>
            <span class="info-value">${formData.patientName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Date & Time:</span>
            <span class="info-value">${new Date(formData.billDate).toLocaleString()}</span>
          </div>
          ${formData.mobile ? `
          <div class="info-row">
            <span class="info-label">Mobile:</span>
            <span class="info-value">${formData.mobile}</span>
          </div>
          ` : ''}
          ${formData.age ? `
          <div class="info-row">
            <span class="info-label">Age:</span>
            <span class="info-value">${formData.age} years</span>
          </div>
          ` : ''}
          <div class="info-row">
            <span class="info-label">Gender:</span>
            <span class="info-value">${formData.gender}</span>
          </div>
          ${formData.relation ? `
          <div class="info-row">
            <span class="info-label">Relation:</span>
            <span class="info-value">${formData.relationType} ${formData.relation}</span>
          </div>
          ` : ''}
          ${formData.address ? `
          <div class="info-row">
            <span class="info-label">Address:</span>
            <span class="info-value">${formData.address}</span>
          </div>
          ` : ''}
        </div>

        <div class="tests-section">
          <h3>Tests/Services</h3>
          <table class="tests-table">
            <thead>
              <tr>
                <th>S.No.</th>
                <th>Test/Service Name</th>
                <th>Rate</th>
                <th>Quantity</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${formData.selectedTests.map((test, index) => `
                <tr>
                  <td class="number-cell">${index + 1}</td>
                  <td>${test.testName}</td>
                  <td class="number-cell">₹${test.price}</td>
                  <td class="number-cell">${test.quantity}</td>
                  <td class="number-cell">₹${test.amount}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="billing-summary">
          <div class="summary-row">
            <span>Total Amount:</span>
            <span>₹${formData.totalAmount}</span>
          </div>
          <div class="summary-row">
            <span>Discount:</span>
            <span>₹${formData.discount}</span>
          </div>
          <div class="summary-row summary-total">
            <span>Net Amount:</span>
            <span>₹${formData.netAmount}</span>
          </div>
          ${formData.netAmountWords ? `
          <div class="amount-words">
            Amount in words: ${formData.netAmountWords}
          </div>
          ` : ''}
        </div>

        <div class="footer">
          <p>Thank you for choosing our services!</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;

    // Open print window
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      
      if (!showPreview) {
        // Auto-print after a short delay to ensure content is loaded
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      }
    } else {
      setMessage('Please allow popups to enable printing.');
    }
  };

  const handleSave = async () => {
    if (!formData.patientName.trim()) {
      setMessage('Patient name is required');
      return;
    }

    // Require that patient must be registered (have a patientID)
    if (!formData.patientID) {
      setMessage('Receipt can only be created for registered patients. Please select a patient from the search results.');
      return;
    }

    if (formData.selectedTests.length === 0) {
      setMessage('At least one test must be selected');
      return;
    }

    if (!formData.doctorID) {
      setMessage('Doctor is required');
      return;
    }

    // Validate mobile number if provided
    if (formData.mobile && !validateMobile(formData.mobile)) {
      setMessage('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Prepare the receipt data according to what the backend actually expects
      const receiptData = {
        PatientID: formData.patientID || undefined,
        PatientName: formData.patientName.trim(),
        BillDate: formData.billDate,
        Discount: formData.discount,
        RefAmount: formData.refAmount, // Add referral amount to request data
        DoctorID: Number(formData.doctorID),
        isRefPaid: formData.isRefPaid,
        // Include patient details
        Mobile: formData.mobile,
        Age: formData.age,
        Address: formData.address,
        Gender: formData.gender,
        RelationType: formData.relationType,
        Relation: formData.relation,
        items: formData.selectedTests.map(test => ({
          testId: test.testId, // Backend expects 'testId' not 'TestID'
          Quantity: test.quantity,
          Rate: test.price
        }))
      };

      // Saving receipt data

      let savedReceipt: CashReceiptSummary;
      
      if (formData.receiptId) {
        // Update existing receipt
        savedReceipt = await api.receipts.update(formData.receiptId, receiptData);
        setMessage(`Cash receipt updated successfully! Receipt ID: ${formData.receiptId}`);
        // Don't clear form when updating - keep data for further editing
      } else {
        // Create new receipt
        savedReceipt = await api.receipts.create(receiptData);
        setMessage(`Cash receipt saved successfully! Receipt ID: ${savedReceipt.ReceiptID}`);
        
        // Update form with the new receipt ID for potential future edits
        setFormData(prev => ({
          ...prev,
          receiptId: String(savedReceipt.ReceiptID)
        }));
        // Don't clear form after creating - keep data for further editing or creating similar bills
      }
      
    } catch {
      // Save failed
      setMessage('Error saving cash receipt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const numberToWords = (num: number): string => {
    if (num === 0) return 'Zero Rupees Only';
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
                  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 
                  'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    const convertToWords = (n: number): string => {
      if (n < 20) return ones[n];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
      if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertToWords(n % 100) : '');
      if (n < 100000) return convertToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convertToWords(n % 1000) : '');
      if (n < 10000000) return convertToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convertToWords(n % 100000) : '');
      return convertToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convertToWords(n % 10000000) : '');
    };
    
    return convertToWords(Math.floor(num)) + ' Rupees Only';
  };

  const filteredTests = tests.filter(test => 
    !test.isDeleted && 
    test.TestName.toLowerCase().includes(searchTestQuery.toLowerCase())
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
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Patient Information</h3>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowBillSearch(!showBillSearch)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                >
                  {showBillSearch ? 'Hide Bill Search' : 'Search Bills'}
                </Button>
                <Button
                  onClick={handleClear}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                >
                  New Receipt
                </Button>
              </div>
            </div>

            {/* Bill Search */}
            {showBillSearch && (
              <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Search Previous Bills</h4>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={searchBillQuery}
                      onChange={(e) => setSearchBillQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleBillSearch()}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                      placeholder="Search by bill number, patient name, or mobile number..."
                    />
                  </div>
                  <Button
                    onClick={handleBillSearch}
                    disabled={searchingBills || !searchBillQuery.trim()}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                  >
                    {searchingBills ? 'Searching...' : 'Search'}
                  </Button>
                  {searchBillQuery && (
                    <Button
                      onClick={() => {
                        setSearchBillQuery('');
                        setSearchBillResults([]);
                      }}
                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
                    >
                      Clear
                    </Button>
                  )}
                </div>

                {/* Bill Search Results */}
                {searchBillResults.length > 0 && (
                  <div className="mt-4 bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700">
                      Found {searchBillResults.length} bill(s)
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {searchBillResults.map((bill) => (
                        <div
                          key={bill.id}
                          onClick={() => applyBillToForm(bill)}
                          className="p-4 border-b border-gray-100 hover:bg-purple-50 cursor-pointer transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-gray-900">
                                Bill #{bill.id} - {bill.PatientName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {bill.Mobile} • {bill.Age} years • {bill.Gender}
                              </div>
                              <div className="text-xs text-gray-400">
                                Date: {new Date(bill.BillDate).toLocaleString()} • 
                                Total: ₹{bill.TotalAmount} • 
                                Net: ₹{bill.NetAmount}
                              </div>
                            </div>
                            <div className="text-xs text-gray-400">
                              {bill.isRefPaid ? '💰 Ref Paid' : '⏳ Pending'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
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

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient Name * {!formData.patientID && <span className="text-xs text-gray-500">(Start typing to search patients)</span>}
                  </label>
                  <input
                    type="text"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleInputChange}
                    readOnly={!!formData.patientID}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${
                      formData.patientID 
                        ? 'bg-gray-50 text-gray-500 cursor-not-allowed' 
                        : 'focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900'
                    }`}
                    placeholder={formData.patientID ? "Patient selected" : "Start typing patient name to search..."}
                  />
                  {formData.patientID ? (
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-green-600">✓ Patient selected (ID: {formData.patientID})</p>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            patientID: undefined,
                            patientName: '',
                            mobile: '',
                            age: '',
                            address: '',
                            gender: 'Male',
                            relationType: 'W/o',
                            relation: ''
                          }));
                          setSearchPatientResults([]);
                        }}
                        className="text-xs text-red-600 hover:text-red-800 underline"
                      >
                        Clear & Search Again
                      </button>
                    </div>
                  ) : searchingPatients ? (
                    <p className="text-xs text-blue-600 mt-1">Searching patients...</p>
                  ) : null}

                  {/* Live Search Results Dropdown */}
                  {!formData.patientID && searchPatientResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      <div className="bg-gray-50 px-4 py-2 text-xs font-medium text-gray-700 border-b">
                        Found {searchPatientResults.length} registered patient(s) - Click to select
                      </div>
                      {searchPatientResults.map((row) => (
                        <div
                          key={row.id}
                          onClick={() => applyPatientToForm(row)}
                          className="p-3 border-b border-gray-100 hover:bg-green-50 cursor-pointer transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-gray-900 text-sm">{row.name}</div>
                              <div className="text-xs text-gray-500">
                                {row.Mobile && `📱 ${row.Mobile}`} {row.Age && `• ${row.Age} years`} {row.Gender && `• ${row.Gender}`}
                              </div>
                              {row.RelationType && row.Relation && (
                                <div className="text-xs text-gray-400">
                                  {row.RelationType} {row.Relation}{row.Address && ` • ${row.Address}`}
                                </div>
                              )}
                            </div>
                            <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              ID: {row.id}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Relation Type & Name */}
                <Card className="p-4 bg-gray-50 border border-gray-200">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Patient Relation Details</h4>
                    
                    {/* Relation Type Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Relation Type</label>
                      <div className="flex gap-4">
                        {(['W/o', 'D/o', 'S/o'] as const).map((type) => (
                          <label key={type} className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="relationType"
                              value={type}
                              checked={formData.relationType === type}
                              onChange={handleInputChange}
                              disabled={!!formData.patientID}
                              className={`w-4 h-4 text-blue-600 bg-white border-gray-300 focus:ring-blue-500 focus:ring-2 ${
                                formData.patientID ? 'cursor-not-allowed opacity-50' : ''
                              }`}
                            />
                            <span className={`ml-2 text-sm font-medium select-none ${
                              formData.patientID ? 'text-gray-400' : 'text-gray-700'
                            }`}>
                              {type === 'W/o' && 'Wife of'}
                              {type === 'D/o' && 'Daughter of'} 
                              {type === 'S/o' && 'Son of'}
                              <span className="text-gray-500 ml-1">({type})</span>
                            </span>
                          </label>
                        ))}
                      </div>
                      {formData.patientID && (
                        <p className="text-xs text-gray-500 mt-2">Relation type is fixed for existing patients</p>
                      )}
                    </div>

                    {/* Relation Name */}
                    <InputField
                      label={`${formData.relationType === 'W/o' ? 'Husband' : 'Father'}'s Name`}
                      name="relation"
                      value={formData.relation}
                      onChange={handleInputChange}
                      placeholder={`Enter ${formData.relationType === 'W/o' ? 'husband' : 'father'}'s full name`}
                      className="w-full"
                      disabled={!!formData.patientID}
                    />
                    {formData.patientID && (
                      <p className="text-xs text-gray-500 mt-1">Relation name cannot be changed for existing patients</p>
                    )}
                  </div>
                </Card>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                    <input
                      type="text"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      readOnly={!!formData.patientID}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${
                        formData.patientID 
                          ? 'bg-gray-50 text-gray-500 cursor-not-allowed' 
                          : 'focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900'
                      }`}
                      placeholder="Age"
                    />
                    {formData.patientID && (
                      <p className="text-xs text-gray-500 mt-1">Age is fixed</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      disabled={!!formData.patientID}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${
                        formData.patientID 
                          ? 'bg-gray-50 text-gray-500 cursor-not-allowed' 
                          : 'focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900'
                      }`}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {formData.patientID && (
                      <p className="text-xs text-gray-500 mt-1">Gender is fixed</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mobile</label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      readOnly={!!formData.patientID}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${
                        formData.patientID 
                          ? 'bg-gray-50 text-gray-500 cursor-not-allowed' 
                          : 'focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900'
                      }`}
                      placeholder="Mobile number"
                    />
                    {validationErrors.mobile && !formData.patientID && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.mobile}</p>
                    )}
                    {formData.patientID && (
                      <p className="text-xs text-gray-500 mt-1">Mobile number cannot be changed</p>
                    )}
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
                    readOnly={!!formData.patientID}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${
                      formData.patientID 
                        ? 'bg-gray-50 text-gray-500 cursor-not-allowed' 
                        : 'focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900'
                    }`}
                    placeholder="Enter complete address"
                  />
                  {formData.patientID && (
                    <p className="text-xs text-gray-500 mt-1">Address cannot be changed for existing patients</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reference Doctor</label>
                  <select
                    name="doctorID"
                    value={formData.doctorID}
                    onChange={handleInputChange}
                    disabled={!!formData.patientID}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${
                      formData.patientID 
                        ? 'bg-gray-50 text-gray-500 cursor-not-allowed' 
                        : 'focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900'
                    }`}
                  >
                    <option value={0}>Select Doctor ({doctors.filter(d => d.isDeleted === 0).length} available)</option>
                    {doctors.filter(d => d.isDeleted === 0).map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name}
                      </option>
                    ))}
                  </select>
                  {formData.patientID && (
                    <p className="text-xs text-gray-500 mt-1">Reference doctor is fixed for existing patients</p>
                  )}
                  {/* Patient info */}
                  {process.env.NODE_ENV === 'development' && !formData.patientID && (
                    <div className="text-xs text-gray-500 mt-1">
                      Total doctors: {doctors.length}, Active: {doctors.filter(d => d.isDeleted === 0).length}
                    </div>
                  )}
                </div>

                <div className="flex justify-start">
                  <div className="flex items-center">
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
                      value={formData.discount === 0 ? '' : formData.discount}
                      onChange={(e) => handleDiscountChange(e.target.value)}
                      min="0"
                      max={formData.totalAmount}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-right"
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Referral Amount:</span>
                    <input
                      type="number"
                      value={formData.refAmount === 0 ? '' : formData.refAmount}
                      onChange={(e) => handleRefAmountChange(e.target.value)}
                      min="0"
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-right"
                      placeholder="0"
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
                  {formData.receiptId ? 'Updating Receipt...' : 'Saving Receipt...'}
                </span>
              ) : (
                formData.receiptId ? 'Update Cash Receipt' : 'Save Cash Receipt'
              )}
            </Button>

            <div className="relative print-dropdown">
              <Button
                onClick={() => setShowPrintPreview(!showPrintPreview)}
                disabled={!formData.patientName.trim() || formData.selectedTests.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 font-medium rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                </svg>
                Print Bill
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </Button>
              
              {showPrintPreview && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48">
                  <button
                    onClick={() => {
                      handlePrintBill(false);
                      setShowPrintPreview(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                    </svg>
                    Print Directly
                  </button>
                  <button
                    onClick={() => {
                      handlePrintBill(true);
                      setShowPrintPreview(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    Preview & Print
                  </button>
                </div>
              )}
            </div>
            
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