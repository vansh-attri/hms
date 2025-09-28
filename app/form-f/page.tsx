'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, InputField, Button, Alert } from '@/components/ui/FormElements';
import { api, FormFCreateData, FormFReceipt, FormFFetchResponse, FormFDoctorSummary } from '@/utils/api';

const defaultDateString = () => new Date().toISOString().split('T')[0];

const toDateInput = (value?: string | null) => {
  if (!value) return defaultDateString();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return defaultDateString();
  return date.toISOString().split('T')[0];
};

export default function FormFPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [receiptInfo, setReceiptInfo] = useState<FormFReceipt | null>(null);
  const [existingForm, setExistingForm] = useState(false);
  const [formFDoctors, setFormFDoctors] = useState<FormFDoctorSummary[]>([]);
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
  txt12: defaultDateString(), // Declaration date
  txt13: defaultDateString(), // Procedure date
    txt14: 'INTRAUTERINE PREGNANCY OF MEAN GESTATIONAL AGE ________ WKS ________ DAYS', // Result
    txt15: '', // Result conveyed to
    txt16: 'No' // MTP indication
  });

  // Handle URL parameters from cash receipt redirection
  useEffect(() => {
    const patientId = searchParams.get('patientId');
    const patientName = searchParams.get('patientName');
    const mobile = searchParams.get('mobile');
    const age = searchParams.get('age');
    const gender = searchParams.get('gender');
    const address = searchParams.get('address');
    const relationType = searchParams.get('relationType');
    const relation = searchParams.get('relation');
    const doctorId = searchParams.get('doctorId');
    const receiptId = searchParams.get('receiptId');

    // If we have patient details from URL parameters, auto-fill the form
    if (patientId && patientName) {
      const relationLine = [relationType, relation].filter(Boolean).join(' ').trim();
      const addressLine = [address, mobile ? `Mobile: ${mobile}` : null]
        .filter(Boolean)
        .join(' - ');

      setFormData(prev => ({
        ...prev,
        BillNo: receiptId ? Number(receiptId) : prev.BillNo,
        txt3: patientName || prev.txt3,
        txt3a: age || prev.txt3a,
        txt5: relationLine || prev.txt5,
        txt6: addressLine || prev.txt6,
        txt15: patientName || prev.txt15,
      }));

      // Show success message that patient details have been auto-filled
      setSuccess(`Patient details auto-filled from cash receipt. Patient: ${patientName} (${gender}, Age: ${age})${receiptId ? ` - Bill #${receiptId}` : ''}${doctorId ? ` - Doctor ID: ${doctorId}` : ''}`);

      // If we have a receipt ID, we can also set up for potential auto-fetch
      if (receiptId && Number(receiptId) > 0) {
        setFormData(prev => ({ ...prev, BillNo: Number(receiptId) }));
      }
    }
  }, [searchParams]);

  // Load FormF doctors on component mount
  useEffect(() => {
    const loadFormFDoctors = async () => {
      try {
        const doctors = await api.formf.getDoctors();
        setFormFDoctors(doctors);
      } catch (error) {
        console.error('Error loading FormF doctors:', error);
        // Silently fail, user can still enter doctor name manually if needed
      }
    };

    loadFormFDoctors();
  }, []);

  const formatDisplayDate = (value?: string | null) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (name === 'BillNo') {
      const numericValue = Number(value);
      setFormData(prev => ({
        ...prev,
        BillNo: Number.isNaN(numericValue) ? 0 : numericValue
      }));
      setReceiptInfo(null);
      setExistingForm(false);
    } else if (type === 'checkbox') {
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

    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleFetchReceipt = async () => {
    if (!formData.BillNo || formData.BillNo <= 0) {
      setError('Please enter a valid Bill Number before fetching.');
      return;
    }

    setFetching(true);
    setError('');
    setSuccess('');

    try {
      const response: FormFFetchResponse = await api.formf.getByBillNo(formData.BillNo);
      const receipt = response.receipt;
      setReceiptInfo(receipt);

      const coalesce = (current: string | undefined, fallback: string) => {
        if (!current) return fallback;
        return current.trim() === '' ? fallback : current;
      };

      const relationLine = [receipt.RelationType, receipt.Relation].filter(Boolean).join(' ').trim();
      const addressLine = [receipt.Address, receipt.Mobile ? `Mobile: ${receipt.Mobile}` : null]
        .filter(Boolean)
        .join(' - ');
      const billDateInput = toDateInput(receipt.BillDate);

      if (response.form) {
        const form = response.form;
        setExistingForm(true);
        setFormData(prev => ({
          ...prev,
          BillNo: form.BillNo,
          txt1: coalesce(form.txt1 ?? undefined, prev.txt1 ?? 'SIDDHIVINAYAK ULTRASOUND CENTRE'),
          txt2: coalesce(form.txt2 ?? undefined, prev.txt2 ?? 'PNDT/PWL/2025/191'),
          txt3: form.txt3 ?? '',
          txt3a: form.txt3a ?? '',
          txt4: form.txt4 ?? '',
          txt4a: form.txt4a ?? '',
          txt4b: form.txt4b ?? '',
          txt5: form.txt5 ?? relationLine,
          txt6: form.txt6 ?? addressLine,
          txt7a: form.txt7a ?? receipt.DoctorName ?? 'SELF',
          txt7b: form.txt7b ?? 'NA',
          txt8: form.txt8 ?? '',
          txt9: form.txt9 ?? receipt.DoctorName ?? prev.txt9 ?? '',
          txt10: form.txt10 ?? 'NA',
          txt11a: form.txt11a ?? true,
          txt11b: form.txt11b ?? false,
          txt11c: form.txt11c ?? '',
          txt12: toDateInput(form.txt12) ?? billDateInput,
          txt13: toDateInput(form.txt13) ?? billDateInput,
          txt14: form.txt14 ?? prev.txt14 ?? '',
          txt15: form.txt15 ?? receipt.PatientName ?? '',
          txt16: form.txt16 ?? 'No'
        }));
        setSuccess(`Existing Form F loaded for Bill No ${form.BillNo}. Saving will update the record.`);
      } else {
        setExistingForm(false);
        setFormData(prev => ({
          ...prev,
          BillNo: receipt.BillNo,
          txt1: coalesce(prev.txt1, 'SIDDHIVINAYAK ULTRASOUND CENTRE'),
          txt2: coalesce(prev.txt2, 'PNDT/PWL/2025/191'),
          txt3: receipt.PatientName ?? prev.txt3 ?? '',
          txt3a: receipt.Age ?? prev.txt3a ?? '',
          txt4: prev.txt4 ?? '',
          txt4a: prev.txt4a ?? '',
          txt4b: prev.txt4b ?? '',
          txt5: relationLine || prev.txt5 || '',
          txt6: addressLine || prev.txt6 || '',
          txt7a: receipt.DoctorName ?? prev.txt7a ?? 'SELF',
          txt7b: prev.txt7b ?? 'NA',
          txt8: prev.txt8 ?? '',
          txt9: receipt.DoctorName ?? prev.txt9 ?? '',
          txt10: prev.txt10 ?? 'NA',
          txt11a: prev.txt11a ?? true,
          txt11b: prev.txt11b ?? false,
          txt11c: prev.txt11c ?? '',
          txt12: billDateInput,
          txt13: billDateInput,
          txt14: prev.txt14 ?? 'INTRAUTERINE PREGNANCY OF MEAN GESTATIONAL AGE ________ WKS ________ DAYS',
          txt15: receipt.PatientName ?? prev.txt15 ?? '',
          txt16: prev.txt16 ?? 'No'
        }));
        setSuccess(`Receipt data loaded. Complete the remaining fields and save Form F.`);
      }
    } catch (err: unknown) {
      console.error('Form F fetch error:', err);
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      if (message.includes('404')) {
        setError('No cash receipt found for the provided Bill Number.');
      } else {
        setError('Failed to load receipt information. Please try again.');
      }
      setReceiptInfo(null);
      setExistingForm(false);
    } finally {
      setFetching(false);
    }
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
      const payload: FormFCreateData = {
        ...formData,
        BillNo: formData.BillNo,
        txt12: formData.txt12 && formData.txt12 !== '' ? formData.txt12 : defaultDateString(),
        txt13: formData.txt13 && formData.txt13 !== '' ? formData.txt13 : defaultDateString(),
        txt11a: formData.txt11a ?? true,
        txt11b: formData.txt11b ?? false
      };

      if (existingForm) {
        await api.formf.update(formData.BillNo, payload);
        setSuccess(`Form F updated successfully for Bill No: ${formData.BillNo}`);
      } else {
        await api.formf.create(payload);
        setExistingForm(true);
        setSuccess(`Form F created successfully for Bill No: ${formData.BillNo}`);
      }
    } catch (err: unknown) {
      console.error('Form F save error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      if (errorMessage.includes('already exists')) {
        setError('Form F with this Bill Number already exists');
      } else {
        setError(errorMessage || 'Failed to save Form F. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=1000');
    const printContent = generatePrintHTML();
    
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
    }
  };

  const generatePrintHTML = () => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Form F - ${formData.txt3 || 'Patient'}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Times New Roman', serif;
            font-size: 11px;
            line-height: 1.3;
            color: black;
            background: white;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
        }
        
        .form-container {
            position: relative;
            border: 2px solid black;
            padding: 15px;
            background: white;
        }
        
        .form-header {
            text-align: center;
            border: 2px solid black;
            padding: 10px;
            margin-bottom: 15px;
        }
        
        .form-title {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 8px;
        }
        
        .section-header {
            font-size: 11px;
            font-weight: bold;
            text-decoration: underline;
            margin: 10px 0 8px 0;
        }
        
        .clinic-location {
            font-size: 11px;
            font-weight: bold;
            text-align: center;
            margin-top: 5px;
        }
        
        .bill-info {
            position: absolute;
            top: 90px;
            right: 30px;
            border: 1px solid black;
            padding: 8px;
            font-size: 11px;
            font-weight: bold;
            background: white;
        }
        
        .field-row {
            margin-bottom: 8px;
            font-size: 11px;
            line-height: 1.4;
        }
        
        .field-row.indent {
            margin-left: 25px;
        }
        
        .underline-field {
            border-bottom: 1px solid black;
            display: inline-block;
            min-width: 80px;
            padding: 0 3px 1px 3px;
            margin-left: 3px;
        }
        
        .checkbox-row {
            margin: 8px 0;
            font-size: 11px;
        }
        
        .checkbox-row input[type="checkbox"] {
            margin-right: 8px;
            width: 14px;
            height: 14px;
            vertical-align: middle;
        }
        
        .procedures-section {
            margin: 15px 0;
            padding: 10px;
            border: 1px solid black;
        }
        
        .result-section {
            margin: 10px 0;
            min-height: 60px;
        }
        
        .result-text {
            border: 1px solid black;
            padding: 8px;
            min-height: 50px;
            margin-top: 5px;
        }
        
        .signature-section {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }
        
        .signature-left {
            font-size: 11px;
        }
        
        .signature-left div {
            margin-bottom: 15px;
        }
        
        .signature-right {
            text-align: right;
            font-size: 11px;
        }
        
        .doctor-signature div {
            margin-bottom: 5px;
        }
        
        .print-button {
            position: fixed;
            top: 10px;
            right: 10px;
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 12px;
            z-index: 1000;
        }
        
        .print-button:hover {
            background: #0056b3;
        }
        
        @media print {
            .print-button {
                display: none;
            }
            
            body {
                padding: 0;
            }
            
            .form-container {
                border: none;
            }
        }
    </style>
</head>
<body>
    <button class="print-button" onclick="window.print()">Print Form</button>
    
    <div class="form-container">
        <div class="form-header">
            <div class="form-title">FORM F [See Proviso to section 4(3), Rule 9(4) and Rule 10(1A)] FORM FOR MAINTENANCE OF RECORD IN CASE OF PRENATAL DIAGNOSTIC TEST/PROCEDURE BY GENETIC CLINIC/ULTRASOUND CLINIC/IMAGING CENTRE</div>
        </div>
        
        <div class="section-header">
            Section A : To be filled in for all Diagnostic Procedures/Tests
            <div class="clinic-location">SIDDHIVINAYAK ULTRASOUND CENTRE</div>
        </div>
        
        <div class="bill-info">
            Form No: <span class="underline-field">${formData.BillNo || ''}</span><br>
            Age: ${formData.txt3a || ''} Years
        </div>
        
        <div class="field-row">
            <strong>1. Name and complete address of Genetic Clinic/Ultrasound Clinic/Imaging centre:</strong>
        </div>
        
        <div class="field-row">
            <strong>2. Registration No (Under PC & PNDT ACT, 1994):</strong> <span class="underline-field">${formData.txt2 || 'PNDT/PWL/2025/191'}</span>
        </div>
        
        <div class="field-row">
            <strong>3. Patient's Name :</strong> <span class="underline-field">${formData.txt3 || ''}</span>
        </div>
        
        <div class="field-row">
            <strong>4. Total Number of Living children:</strong> <span class="underline-field">${formData.txt4 || ''}</span>
        </div>
        
        <div class="field-row indent">
            <strong>(a) Number of Living sons with age of each living son (in years or months):</strong> <span class="underline-field">${formData.txt4a || ''}</span>
        </div>
        
        <div class="field-row indent">
            <strong>(b) Number of living Daughters with age of each living daughter (in years or months):</strong> <span class="underline-field">${formData.txt4b || ''}</span>
        </div>
        
        <div class="field-row">
            <strong>5. Husband's/Wife's/Father's/Mother's Name :</strong> <span class="underline-field">${formData.txt5 || ''}</span>
        </div>
        
        <div class="field-row">
            <strong>6. Full postal address of the patient with Contact Number, if any:</strong> <span class="underline-field">${formData.txt6 || ''}</span>
        </div>
        
        <div class="field-row">
            <strong>7. (a) Referred by (Full Name and address of Doctor(s)/Genetic counselling Centre) :</strong> <span class="underline-field">${formData.txt7a || ''}</span>
        </div>
        
        <div class="field-row indent">
            <strong>(b) Self-Referral by Gynaecologist/Radiologist/Registered Medical Practitioner conducting the diagnostic procedures:</strong> <span class="underline-field">${formData.txt7b || ''}</span>
        </div>
        
        <div class="field-row">
            <strong>8. Last menstrual period/weeks of pregnancy:</strong> <span class="underline-field">${formData.txt8 || ''}</span>
        </div>
        
        <div class="section-header">
            Section B : (To be filled in for performing non-invasive diagnostic Procedures/Tests only)
        </div>
        
        <div class="field-row">
            <strong>9. Name of the doctor performing the procedure/s:</strong> <span class="underline-field">${formData.txt9 || ''}</span>
        </div>
        
        <div class="field-row">
            <strong>10. Indication/s for diagnostic procedure:</strong> <span class="underline-field">${formData.txt10 || ''}</span>
        </div>
        
        <div class="procedures-section">
            <div class="field-row">
                <strong>11. Procedures carried out (Non-Invasive) (Put a "Tick" on the appropriate procedure)</strong>
            </div>
            
            <div class="checkbox-row">
                <input type="checkbox" ${formData.txt11a ? 'checked' : ''}> 
                <strong>i. Ultrasound</strong> (Important Note: Ultrasound is not indicated/advised/performed to determine the sex of fetus except for diagnosis of sex-linked diseases such as Duchene Muscular Dystrophy, Hemophilia A & B etc.)
            </div>
            
            <div class="checkbox-row">
                <input type="checkbox" ${formData.txt11b ? 'checked' : ''}> 
                <strong>ii. Any other (specify):</strong> <span class="underline-field">${formData.txt11c || ''}</span>
            </div>
        </div>
        
        <div class="field-row">
            <strong>12. Date on which declaration of pregnant woman/person was obtained :</strong> <span class="underline-field">${formData.txt12 ? new Date(formData.txt12).toLocaleDateString() : ''}</span>
        </div>
        
        <div class="field-row">
            <strong>13. Date on which procedures carried out :</strong> <span class="underline-field">${formData.txt13 ? new Date(formData.txt13).toLocaleDateString() : ''}</span>
        </div>
        
        <div class="result-section">
            <div class="field-row">
                <strong>14. Result of the non-invasive procedure carried out (report in brief of the test including ultrasound carried out):</strong>
            </div>
            <div class="result-text">${formData.txt14 || 'INTRAUTERINE PREGNANCY OF MEAN GESTATIONAL AGE ___3___ WKS ___4___ DAYS'}</div>
        </div>
        
        <div class="field-row">
            <strong>15. The result of pre-natal diagnostic procedures was conveyed to :</strong> <span class="underline-field">${formData.txt15 || ''}</span> &nbsp;&nbsp;&nbsp;&nbsp; <strong>on :</strong> <span class="underline-field">${formData.txt13 ? new Date(formData.txt13).toLocaleDateString() : ''}</span>
        </div>
        
        <div class="field-row">
            <strong>16. Any indication for MTP as per the abnormality detected in the diagnostic procedures/tests :</strong> <span class="underline-field">${formData.txt16 || 'No'}</span>
        </div>
        
        <div class="signature-section">
            <div class="signature-left">
                <div><strong>Date :</strong> <span class="underline-field">${formData.txt13 ? new Date(formData.txt13).toLocaleDateString() : ''}</span></div>
                <div><strong>Place :</strong> <span class="underline-field">HODAL</span></div>
            </div>
            <div class="signature-right">
                <div class="doctor-signature">
                    <div>${formData.txt9 && formData.txt9.includes('REG.NO.') ? formData.txt9.split('REG.NO.')[0].trim() : (formData.txt9 || 'DR. VRENDER KUMAR')}</div>
                    <div>REG.NO. ${formData.txt9 && formData.txt9.includes('REG.NO.') ? formData.txt9.split('REG.NO.')[1].trim() : 'HN.008346'}</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
    `;
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
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-4">
                <div className="md:col-span-6">
                  <InputField
                    label="1. Name and complete address of Genetic Clinic/Ultrasound Clinic/Imaging centre"
                    name="txt1"
                    value={formData.txt1 || ''}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="md:col-span-3">
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
                <div className="md:col-span-3 flex md:items-end">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleFetchReceipt}
                    loading={fetching}
                    disabled={fetching || !formData.BillNo}
                    className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold"
                  >
                    {existingForm ? 'Reload Receipt' : 'Fetch Receipt'}
                  </Button>
                </div>
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

              {receiptInfo && (
                <div className="mt-6 bg-white border border-blue-100 rounded-lg p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Cash Receipt Summary</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600">
                    <div>
                      <span className="font-medium text-gray-800">Patient:</span> {receiptInfo.PatientName || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium text-gray-800">Bill Date:</span> {formatDisplayDate(receiptInfo.BillDate)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-800">Doctor:</span> {receiptInfo.DoctorName || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium text-gray-800">Age:</span> {receiptInfo.Age || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium text-gray-800">Contact:</span> {receiptInfo.Mobile || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium text-gray-800">Net Amount:</span> {receiptInfo.NetAmount != null ? `₹${receiptInfo.NetAmount}` : 'N/A'}
                    </div>
                  </div>
                  {existingForm && (
                    <p className="mt-3 text-xs text-indigo-600 font-medium">Existing Form F data found. Any changes will update the saved record.</p>
                  )}
                </div>
              )}
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
                <select
                  name="txt9"
                  value={formData.txt9 || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select a doctor</option>
                  {formFDoctors.map((doctor) => (
                    <option key={doctor.id} value={`${doctor.name}${doctor.registration_no ? ` REG.NO. ${doctor.registration_no}` : ''}${doctor.qualification ? ` (${doctor.qualification})` : ''}`}>
                      {doctor.name} {doctor.registration_no && `- REG.NO. ${doctor.registration_no}`} {doctor.specialization && `(${doctor.specialization})`}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {formFDoctors.length} doctors available. Contact admin to add more doctors.
                </p>
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


    </div>
  );
}