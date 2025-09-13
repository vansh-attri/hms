'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/FormElements';
import { doctorAPI, patientAPI, referralAPI, type UnregisteredReferral } from '@/utils/api';

interface DoctorOption { id: number; name: string }
type PatientSearchRow = Awaited<ReturnType<typeof patientAPI.search>>[number];

interface PatientFormData {
  patientId: string;
  patientName: string;
  relationType: 'W/o' | 'D/o' | 'S/o';
  relation: string;
  age: string;
  gender: 'Male' | 'Female' | 'Other';
  mobile: string;
  address: string;
  doctorId: string;
  createdBy: string;
  refNo?: string; // For tracking referral ID
}

export const PatientRegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState<PatientFormData>({
    patientId: '',
    patientName: '',
    relationType: 'W/o',
    relation: '',
    age: '',
    gender: 'Male',
    mobile: '',
    address: '',
    doctorId: '',
    createdBy: 'web',
    refNo: undefined,
  });

  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PatientSearchRow[]>([]);
  const [searching, setSearching] = useState(false);
  
  // Referred patients modal state
  const [showReferredModal, setShowReferredModal] = useState(false);
  const [referredPatients, setReferredPatients] = useState<UnregisteredReferral[]>([]);
  const [loadingReferred, setLoadingReferred] = useState(false);
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  // Load doctors from API
  useEffect(() => {
    doctorAPI.getAll()
      .then(rows => setDoctors(rows.map(d => ({ id: d.id, name: d.name })))).catch(() => setDoctors([]));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Clear validation error for this field
    setValidationErrors(prev => ({
      ...prev,
      [name]: ''
    }));
    
    setFormData(prev => ({
      ...prev,
      [name]: value
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

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const rows = await patientAPI.search({ 
        name: /\D/.test(searchQuery) ? searchQuery : undefined, 
        mobile: /^\d+$/.test(searchQuery) ? searchQuery : undefined, 
        limit: 20 
      });
      setSearchResults(rows);
    } catch {
      setMessage('Error searching patients');
    } finally {
      setSearching(false);
    }
  };

  const applyPatientToForm = (row: PatientSearchRow) => {
    setFormData(prev => ({
      ...prev,
      patientId: String(row.id),
      patientName: row.name || '',
      relationType: (row.RelationType as 'W/o' | 'D/o' | 'S/o' | null) || 'W/o',
      relation: row.Relation || '',
      age: row.Age ? String(row.Age) : '',
      gender: (row.Gender as 'Male' | 'Female' | 'Other' | null) || 'Male',
      mobile: row.Mobile || '',
      address: row.Address || '',
      doctorId: row.DoctorID ? String(row.DoctorID) : '',
    }));
    setSearchResults([]);
    setSearchQuery('');
  };

    const handleClear = () => {
    setFormData({
      patientId: '',
      patientName: '',
      relationType: 'W/o',
      relation: '',
      age: '',
      gender: 'Male',
      mobile: '',
      address: '',
      doctorId: '',
      createdBy: 'web',
      refNo: undefined,
    });
    setMessage('');
    setSearchResults([]);
    setSearchQuery('');
  };

  const loadReferredPatients = async () => {
    setLoadingReferred(true);
    try {
      const referred = await referralAPI.getUnregistered();
      setReferredPatients(referred);
      setShowReferredModal(true);
      if (referred.length === 0) {
        setMessage('No unregistered referrals found. All referrals have been processed.');
      }
    } catch (error) {
      console.error('Error loading referred patients:', error);
      setMessage('Error loading referred patients. Please try again.');
    } finally {
      setLoadingReferred(false);
    }
  };

  const refreshReferredPatients = async () => {
    setLoadingReferred(true);
    try {
      const referred = await referralAPI.getUnregistered();
      setReferredPatients(referred);
      setMessage(`Refreshed: Found ${referred.length} unregistered referrals`);
    } catch (error) {
      console.error('Error refreshing referred patients:', error);
      setMessage('Error refreshing referred patients.');
    } finally {
      setLoadingReferred(false);
    }
  };

  const applyReferredPatientToForm = (referred: UnregisteredReferral) => {
    // Try to find matching doctor in the dropdown
    let matchedDoctorId = '';
    if (referred.DoctorName) {
      const referredDoctorName = referred.DoctorName.trim();
      
      // First try exact match (case insensitive)
      let matchingDoctor = doctors.find(doctor => 
        doctor.name.toLowerCase() === referredDoctorName.toLowerCase()
      );
      
      // If no exact match, try partial matches
      if (!matchingDoctor) {
        matchingDoctor = doctors.find(doctor => {
          const doctorNameLower = doctor.name.toLowerCase();
          const referredDoctorLower = referredDoctorName.toLowerCase();
          
          // Remove "Dr." prefix and compare
          const cleanDoctorName = doctorNameLower.replace(/^dr\.?\s*/i, '').trim();
          const cleanReferredName = referredDoctorLower.replace(/^dr\.?\s*/i, '').trim();
          
          return (
            cleanDoctorName === cleanReferredName ||
            (cleanDoctorName.includes(cleanReferredName) && cleanReferredName.length > 3) ||
            (cleanReferredName.includes(cleanDoctorName) && cleanDoctorName.length > 3)
          );
        });
      }
      
      if (matchingDoctor) {
        matchedDoctorId = String(matchingDoctor.id);
        console.log(`✅ Doctor matched: "${referredDoctorName}" → "${matchingDoctor.name}" (ID: ${matchingDoctor.id})`);
      } else {
        console.log(`❌ No doctor match found for: "${referredDoctorName}"`);
      }
    }

    setFormData(prev => ({
      ...prev,
      patientName: referred.PatientName || '',
      relationType: (referred.RelationType as 'W/o' | 'D/o' | 'S/o' | null) || 'W/o',
      relation: referred.Relation || '',
      age: referred.Age || '',
      gender: (referred.Gender as 'Male' | 'Female' | 'Other' | null) || 'Male',
      mobile: referred.Mobile || '',
      address: referred.Address || '',
      doctorId: matchedDoctorId, // Will be empty string if no match
      refNo: String(referred.RefNo), // Track the referral ID (updated field name)
    }));
    setShowReferredModal(false);
    
    const doctorMessage = matchedDoctorId 
      ? ` (Doctor auto-selected: ${doctors.find(d => d.id === Number(matchedDoctorId))?.name})`
      : referred.DoctorName 
        ? ` (Doctor "${referred.DoctorName}" not found - please select manually)`
        : '';
    
    setMessage(`Applied referred patient: ${referred.PatientName}${doctorMessage}`);
  };

  const handleSave = async () => {
    if (!formData.patientName.trim()) {
      setMessage('Patient name is required');
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
      const payload = {
        name: formData.patientName,
        RelationType: formData.relationType,
        Relation: formData.relation,
        Mobile: formData.mobile || null,
        Age: formData.age || null,
        Address: formData.address || null,
        Gender: formData.gender,
        DoctorID: formData.doctorId ? Number(formData.doctorId) : null,
        CreatedBy: formData.createdBy,
        RefNo: formData.refNo ? Number(formData.refNo) : null, // Include RefNo for referral patients
      } as const;
      
      if (formData.patientId) {
        // Update existing patient
        await patientAPI.update(formData.patientId, payload);
        setMessage('Patient updated successfully!');
      } else {
        // Create new patient
        const created = await patientAPI.create(payload);
        setFormData(prev => ({ ...prev, patientId: String(created.PatientID) }));
        setMessage('Patient registered successfully!');
      }
    } catch {
      setMessage('Error saving patient data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-xl p-6 text-white">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-lg">👤</span>
          Patient Registration
        </h2>
        <p className="mt-2 text-blue-100">Add new patients to the system</p>
      </div>

      <div className="bg-white rounded-b-xl shadow-lg border border-gray-200">
        {/* Search Section */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Existing Patient</h3>
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Search by name or mobile number..."
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={searching || !searchQuery.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              {searching ? 'Searching...' : 'Search'}
            </Button>
            {searchQuery && (
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
              >
                Clear
              </Button>
            )}
          </div>

          {/* Add Referred Patient Button */}
          <div className="flex justify-center">
            <Button
              onClick={loadReferredPatients}
              disabled={loadingReferred}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2"
            >
              <span className="w-5 h-5 bg-white/20 rounded flex items-center justify-center text-sm">📋</span>
              {loadingReferred ? 'Loading...' : 'Add Referred Patient'}
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-4 bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700">
                Found {searchResults.length} patient(s)
              </div>
              <div className="max-h-64 overflow-y-auto">
                {searchResults.map((row) => (
                  <div
                    key={row.id}
                    onClick={() => applyPatientToForm(row)}
                    className="p-4 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">{row.name}</div>
                        <div className="text-sm text-gray-500">
                          {row.Age && `${row.Age} years`} {row.Gender && `• ${row.Gender}`} {row.Mobile && `• ${row.Mobile}`}
                        </div>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">ID: {row.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Form Section */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Patient Information</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Patient Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Name *
                </label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Enter patient full name"
                />
              </div>

              {/* Relation Type & Name */}
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
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Father's/Husband's name"
                  />
                </div>
              </div>

              {/* Age & Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Age"
                    min="0"
                    max="150"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                    validationErrors.mobile ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                />
                {validationErrors.mobile && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.mobile}</p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Enter complete address"
                />
              </div>

              {/* Reference Doctor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reference Doctor</label>
                <select
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Patient ID Display */}
              {formData.patientId && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-green-700 mb-1">Patient ID</label>
                  <div className="text-lg font-mono text-green-800">{formData.patientId}</div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex-1 sm:flex-none"
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
                'Save Patient'
              )}
            </Button>
            
            <Button
              onClick={handleClear}
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium"
            >
              Clear Form
            </Button>
          </div>

          {/* Message */}
          {message && (
            <div className={`mt-6 p-4 rounded-lg text-center font-medium ${
              message.includes('success') 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>

      {/* Referred Patients Modal */}
      {showReferredModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-lg">📋</span>
                  Referred Patients (Not Yet Registered)
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={refreshReferredPatients}
                    disabled={loadingReferred}
                    className="text-white hover:text-gray-200 p-2 rounded-lg hover:bg-white/10 transition-colors"
                    title="Refresh list"
                  >
                    {loadingReferred ? '⟳' : '🔄'}
                  </button>
                  <button
                    onClick={() => setShowReferredModal(false)}
                    className="text-white hover:text-gray-200 text-xl font-bold w-8 h-8 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              </div>
              <p className="mt-2 text-green-100">
                Select a patient from public referrals to register them in the system
                {referredPatients.length > 0 && ` (${referredPatients.length} found)`}
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {referredPatients.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">✅</div>
                  <p className="text-lg font-medium text-gray-700">All Caught Up!</p>
                  <p className="text-sm mt-2 text-gray-600">
                    All patients from public referrals have been registered in the system.
                  </p>
                  <p className="text-xs mt-2 text-gray-500">
                    New referrals from the public form will appear here when they need to be processed.
                  </p>
                  <button
                    onClick={refreshReferredPatients}
                    disabled={loadingReferred}
                    className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loadingReferred ? 'Checking...' : 'Check Again'}
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {referredPatients.map((referred) => (
                    <div
                      key={referred.RefNo}
                      className="border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:bg-green-50 transition-colors cursor-pointer"
                      onClick={() => applyReferredPatientToForm(referred)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">{referred.PatientName}</h4>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              Ref ID: {referred.RefNo}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Relation:</span> {referred.RelationType} {referred.Relation}
                            </div>
                            <div>
                              <span className="font-medium">Age/Gender:</span> {referred.Age} years, {referred.Gender}
                            </div>
                            <div>
                              <span className="font-medium">Mobile:</span> {referred.Mobile || 'Not provided'}
                            </div>
                            <div>
                              <span className="font-medium">Doctor:</span> {referred.DoctorName || 'Not specified'}
                            </div>
                          </div>
                          
                          {referred.Address && (
                            <div className="mt-2 text-sm text-gray-600">
                              <span className="font-medium">Address:</span> {referred.Address}
                            </div>
                          )}
                          
                          <div className="mt-2 text-xs text-gray-500">
                            Referred on: {new Date(referred.CreatedDate).toLocaleDateString()} 
                            {referred.CreatedBy && ` by ${referred.CreatedBy}`}
                          </div>
                        </div>
                        
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            applyReferredPatientToForm(referred);
                          }}
                          className="ml-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg cursor-pointer transition-colors"
                        >
                          Use This Patient
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
              <Button
                onClick={() => setShowReferredModal(false)}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
