'use client';

import React, { useState } from 'react';
import { Card, InputField, Button, Alert } from '@/components/ui/FormElements';
import { api, FormFCreateData } from '@/utils/api';

export default function FormFPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<FormFCreateData>({
    BillNo: 0,
    txt1: 'SIDDHIVINAYAK ULTRASOUND CENTRE',
    txt2: 'PNDT/PWL/2025/191',
    txt3: '', // Patient Name
    txt3a: '', // Age
    txt4: '', // Total children
    txt4a: '', // Living sons age
    txt4b: '', // Living daughters age
    txt5: '', // Husband/Father name
    txt6: '', // Address with contact
    txt7a: '', // Referred by doctor
    txt7b: 'NA', // Self referral
    txt8: '', // Last menstrual period
    txt9: 'DR.VIRENDER KUMAR REG.NO. HN.006846', // Doctor performing procedure
    txt10: 'NA', // Indication for diagnosis
    txt11a: true, // Ultrasound checkbox
    txt11b: false, // Any other checkbox
    txt11c: '', // Other specify
    txt12: new Date().toISOString().split('T')[0], // Declaration date
    txt13: new Date().toISOString().split('T')[0], // Procedure date
    txt14: 'INTRAUTERINE PREGNANCY OF MEAN GESTATIONAL AGE ________ WKS ________ DAYS', // Result
    txt15: '', // Result conveyed to
    txt16: 'No' // MTP indication
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.BillNo || formData.BillNo <= 0) {
      setError('Please enter a valid Bill Number');
      return;
    }

    if (!formData.txt3?.trim()) {
      setError('Please enter Patient Name');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.formf.create(formData);
      setSuccess(`Form F created successfully for Bill No: ${formData.BillNo}`);
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          BillNo: 0,
          txt3: '',
          txt3a: '',
          txt4: '',
          txt4a: '',
          txt4b: '',
          txt5: '',
          txt6: '',
          txt8: '',
          txt11c: '',
          txt15: '',
          txt12: new Date().toISOString().split('T')[0],
          txt13: new Date().toISOString().split('T')[0]
        }));
        setSuccess('');
      }, 3000);
    } catch (err: unknown) {
      console.error('Form F creation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      if (errorMessage.includes('already exists')) {
        setError('Form F with this Bill Number already exists');
      } else {
        setError(errorMessage || 'Failed to create Form F. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto p-6 max-w-5xl">
        {/* Enhanced Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Form F - PNDT Act 1994</h1>
          <p className="text-lg text-gray-600 mb-1">Genetic Clinic/Ultrasound Clinic/Imaging Centre Form</p>
          <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full"></div>
        </div>

        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError('')}
            className="mb-6"
          />
        )}

        {success && (
          <Alert
            type="success"
            message={success}
            onClose={() => setSuccess('')}
            className="mb-6"
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm p-8">
            {/* Clinic Information Section */}
            <div className="mb-8 bg-blue-50 p-6 rounded-lg border-l-4 border-blue-400">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Clinic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <InputField
                  label="1. Name and complete address of Genetic Clinic/Ultrasound Clinic/Imaging centre"
                  name="txt1"
                  value={formData.txt1 || ''}
                  onChange={handleChange}
                  required
                />
                <InputField
                  label="Bill No"
                  name="BillNo"
                  type="number"
                  value={formData.BillNo || ''}
                  onChange={handleChange}
                  required
                  placeholder="Enter Bill Number"
                />
              </div>
              <div className="grid grid-cols-1">
                <InputField
                  label="2. Registration No (Under PC_PNDT ACT, 1994)"
                  name="txt2"
                  value={formData.txt2 || ''}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Patient Information Section */}
            <div className="mb-8 bg-green-50 p-6 rounded-lg border-l-4 border-green-400">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Patient Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <InputField
                  label="3. Patient's Name"
                  name="txt3"
                  value={formData.txt3 || ''}
                  onChange={handleChange}
                  required
                  placeholder="Enter patient name"
                />
                <InputField
                  label="Age"
                  name="txt3a"
                  value={formData.txt3a || ''}
                  onChange={handleChange}
                  placeholder="Enter age"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <InputField
                  label="4. Total Number of Living children"
                  name="txt4"
                  value={formData.txt4 || ''}
                  onChange={handleChange}
                  placeholder="Enter total children"
                />
                <InputField
                  label="(a) Number of Living sons with age of each living son (in years or months)"
                  name="txt4a"
                  value={formData.txt4a || ''}
                  onChange={handleChange}
                  placeholder="Sons age details"
                />
                <InputField
                  label="(b) Number of living Daughters with age of each living daughter (in years or months)"
                  name="txt4b"
                  value={formData.txt4b || ''}
                  onChange={handleChange}
                  placeholder="Daughters age details"
                />
              </div>

              <div className="mb-4">
                <InputField
                  label="5. Husband's /Wife's /Father's /Mother's Name"
                  name="txt5"
                  value={formData.txt5 || ''}
                  onChange={handleChange}
                  placeholder="Enter relative's name"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  6. Full postal address of the patient&apos;s with Contact Number, if any
                </label>
                <textarea
                  name="txt6"
                  value={formData.txt6 || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                  placeholder="Enter full address with contact number"
                />
              </div>
            </div>

            {/* Referral Information Section */}
            <div className="mb-8 bg-purple-50 p-6 rounded-lg border-l-4 border-purple-400">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Referral Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <InputField
                  label="7.(a) Referred by (Full Name and address of Doctor(s) /Genetic counselling Centre)"
                  name="txt7a"
                  value={formData.txt7a || ''}
                  onChange={handleChange}
                  placeholder="Enter referring doctor details"
                />
                <InputField
                  label="(b) Self- Referral by Gynaecologist/Radiologist/Registered Medical Practitioner conducting procedure"
                  name="txt7b"
                  value={formData.txt7b || ''}
                  onChange={handleChange}
                  placeholder="Self referral details"
                />
              </div>
              <div className="mb-4">
                <InputField
                  label="8. Last menstrual period /weeks of pregnancy"
                  name="txt8"
                  value={formData.txt8 || ''}
                  onChange={handleChange}
                  placeholder="Enter LMP details"
                />
              </div>
            </div>

            {/* Section B - Diagnostic Procedures */}
            <div className="mb-8 bg-orange-50 p-6 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Section B - Non-invasive Diagnostic Procedures/Tests
              </h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  9. Name of the doctor performing the procedure/s
                </label>
                <textarea
                  name="txt9"
                  value={formData.txt9 || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={2}
                  placeholder="Enter doctor details"
                />
              </div>

              <div className="mb-6">
                <InputField
                  label="10. Indication/s for diagnosis procedure"
                  name="txt10"
                  value={formData.txt10 || ''}
                  onChange={handleChange}
                  placeholder="Enter indication"
                />
              </div>

              <div className="mb-6 bg-white p-4 rounded-lg border border-orange-200">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  11. Procedures carried out (Non-Invasive) (Put a &quot;Tick&quot; on the appropriate procedure)
                </label>
                <div className="space-y-3">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      name="txt11a"
                      checked={formData.txt11a || false}
                      onChange={handleChange}
                      className="mt-1 mr-3 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm">
                      i. Ultrasound (Important Note: Ultrasound is not indicated/advised/performed to determine the sex of fetus except for diagnosis of sex-linked diseases such as Duchene Muscular Dystrophy, Hemophilia A,B etc.)
                    </span>
                  </label>
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      name="txt11b"
                      checked={formData.txt11b || false}
                      onChange={handleChange}
                      className="mt-1 mr-3 text-orange-600 focus:ring-orange-500"
                    />
                    <div className="flex-1">
                      <span className="text-sm mr-2">ii. Any other (specify)</span>
                      <input
                        type="text"
                        name="txt11c"
                        value={formData.txt11c || ''}
                        onChange={handleChange}
                        className="mt-1 w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Specify other procedure"
                      />
                    </div>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-4 rounded-lg border border-orange-200">
                  <InputField
                    label="12. Date on which declaration of pregnant woman/person was obtained"
                    name="txt12"
                    type="date"
                    value={formData.txt12 || ''}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="bg-white p-4 rounded-lg border border-orange-200">
                  <InputField
                    label="13. Date on which procedures carried out"
                    name="txt13"
                    type="date"
                    value={formData.txt13 || ''}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-6 bg-white p-4 rounded-lg border border-orange-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  14. Result of the non-invasive procedure carried out (report in brief of the test including ultrasound carried out)
                </label>
                <textarea
                  name="txt14"
                  value={formData.txt14 || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={4}
                  placeholder="Enter result details"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg border border-orange-200">
                  <InputField
                    label="15. The result of pre-natal diagnostic procedures was conveyed to"
                    name="txt15"
                    value={formData.txt15 || ''}
                    onChange={handleChange}
                    placeholder="Enter to whom result was conveyed"
                  />
                </div>
                <div className="bg-white p-4 rounded-lg border border-orange-200">
                  <InputField
                    label="16. Any indication for MTP as per the abnormality detected in the diagnostic procedures/tests"
                    name="txt16"
                    value={formData.txt16 || ''}
                    onChange={handleChange}
                    placeholder="Enter MTP indication"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t print:hidden">
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 font-semibold shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </div>
                ) : (
                  'Save Form F'
                )}
              </Button>
              
              <Button
                type="button"
                variant="secondary"
                onClick={handlePrint}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 font-semibold shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Form
              </Button>
            </div>
          </Card>
        </form>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .container {
            max-width: none !important;
            margin: 0 !important;
            padding: 10px !important;
          }
          
          button {
            display: none !important;
          }
          
          .bg-gradient-to-br {
            background: white !important;
          }
          
          .bg-blue-50, .bg-green-50, .bg-purple-50, .bg-orange-50 {
            background: white !important;
            border: 1px solid #ccc !important;
          }
          
          .border-l-4 {
            border-left: 4px solid #666 !important;
          }
          
          .text-2xl, .text-3xl {
            font-size: 18px !important;
            font-weight: bold !important;
          }
          
          .text-xl {
            font-size: 16px !important;
            font-weight: bold !important;
          }
          
          .text-lg {
            font-size: 14px !important;
          }
          
          .text-sm {
            font-size: 12px !important;
          }
          
          input, textarea {
            border: 1px solid #000 !important;
            background: white !important;
            print-color-adjust: exact !important;
          }
          
          .grid {
            display: block !important;
          }
          
          .grid > * {
            margin-bottom: 10px !important;
          }
          
          .shadow-xl {
            box-shadow: none !important;
          }
          
          .backdrop-blur-sm {
            backdrop-filter: none !important;
          }
        }
      `}</style>
    </div>
  );
}