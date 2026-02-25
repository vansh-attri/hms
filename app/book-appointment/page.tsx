'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Test {
  id: number;
  name: string;
  price: number;
  category: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
  isPast?: boolean;
  isFullyBooked?: boolean;
  bookingCount?: number;
}

const API_BASE_URL = 'https://hms-back-rosy.vercel.app/api';

export default function BookAppointmentPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tests, setTests] = useState<Test[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [appointmentId, setAppointmentId] = useState<number | null>(null);
  const [cashReceiptId, setCashReceiptId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    patientName: '',
    relationType: '',
    relation: '',
    mobile: '',
    age: '',
    gender: '',
    address: '',
    appointmentDate: '',
    appointmentTime: '',
    selectedTests: [] as number[],
    notes: ''
  });

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await fetch(API_BASE_URL + '/appointments/tests');
        if (!response.ok) throw new Error('Failed to fetch tests');
        const data = await response.json();
        setTests(data);
      } catch (err) {
        console.error('Error fetching tests:', err);
      }
    };
    fetchTests();
  }, []);

  useEffect(() => {
    if (formData.appointmentDate) {
      const fetchSlots = async () => {
        setLoadingSlots(true);
        try {
          const response = await fetch(API_BASE_URL + '/appointments/slots?date=' + formData.appointmentDate);
          if (!response.ok) throw new Error('Failed to fetch slots');
          const data = await response.json();
          // Use the new slots format with availability info, fallback to old format
          if (data.slots) {
            setAvailableSlots(data.slots);
          } else {
            // Fallback for backward compatibility
            const slots = (data.availableSlots || []).map((time: string) => ({
              time,
              available: true
            }));
            setAvailableSlots(slots);
          }
        } catch (err) {
          console.error('Error fetching slots:', err);
          setAvailableSlots([]);
        } finally {
          setLoadingSlots(false);
        }
      };
      fetchSlots();
    }
  }, [formData.appointmentDate]);

  const totalAmount = formData.selectedTests.reduce((sum, testId) => {
    const test = tests.find(t => t.id === testId);
    return sum + (test?.price || 0);
  }, 0);

  const getMinDate = () => new Date().toISOString().split('T')[0];
  const getMaxDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTestToggle = (testId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedTests: prev.selectedTests.includes(testId)
        ? prev.selectedTests.filter(id => id !== testId)
        : [...prev.selectedTests, testId]
    }));
  };

  const handleTimeSelect = (time: string) => {
    setFormData(prev => ({ ...prev, appointmentTime: time }));
  };

  const validateStep = (s: number) => {
    if (s === 1) {
      if (!formData.patientName.trim()) return 'Please enter patient name';
      if (!formData.mobile.trim() || formData.mobile.length !== 10) return 'Please enter valid 10-digit mobile';
      if (!formData.gender) return 'Please select gender';
    }
    if (s === 2 && formData.selectedTests.length === 0) return 'Please select at least one test';
    if (s === 3) {
      if (!formData.appointmentDate) return 'Please select a date';
      if (!formData.appointmentTime) return 'Please select a time slot';
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep(step);
    if (err) { setError(err); return; }
    setError(null);
    setStep(prev => prev + 1);
  };

  const handleBack = () => { setError(null); setStep(prev => prev - 1); };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build tests array with testId and testPrice
      const testsData = formData.selectedTests.map(testId => {
        const test = tests.find(t => t.id === testId);
        return {
          testId: testId,
          testPrice: test?.price || 0
        };
      });

      // First create the appointment
      const response = await fetch(API_BASE_URL + '/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          PatientName: formData.patientName,
          RelationType: formData.relationType || null,
          Relation: formData.relation || null,
          Mobile: formData.mobile,
          Age: formData.age || null,
          Gender: formData.gender || null,
          Address: formData.address || null,
          AppointmentDate: formData.appointmentDate,
          AppointmentTime: formData.appointmentTime,
          Notes: formData.notes || null,
          tests: testsData
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.formErrors?.[0] || errorData.error || 'Failed to book appointment');
      }
      
      const data = await response.json();
      const aptId = data.appointment?.ID || data.appointmentId;
      setAppointmentId(aptId);
      
      // Bypass payment - directly confirm the appointment
      const confirmResponse = await fetch(API_BASE_URL + '/appointments/' + aptId + '/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: 'BYPASS-' + Date.now(),
          paymentMethod: 'cash'
        })
      });

      if (!confirmResponse.ok) {
        const confirmError = await confirmResponse.json();
        throw new Error(confirmError.error || 'Failed to confirm appointment');
      }

      const confirmData = await confirmResponse.json();
      setCashReceiptId(confirmData.receiptId);
      setSuccess(true);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return hour12 + ':' + minutes + ' ' + ampm;
  };

  const testsByCategory = tests.reduce((acc, test) => {
    const cat = test.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(test);
    return acc;
  }, {} as Record<string, Test[]>);

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Appointment Confirmed!</h1>
          <p className="text-gray-600 mb-4">Your appointment has been booked successfully.</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <p className="text-sm text-gray-500">Appointment ID</p>
            <p className="text-2xl font-bold text-teal-600">#{appointmentId}</p>
          </div>
          {cashReceiptId && (
            <div className="bg-emerald-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-500">Receipt No</p>
              <p className="text-xl font-bold text-emerald-600">#{cashReceiptId}</p>
            </div>
          )}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-green-800">
              <strong>✓ Payment Received</strong><br />
              Please arrive 10 minutes before your appointment time. You will receive a confirmation SMS shortly.
            </p>
          </div>
          <Link href="/" className="block w-full py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-lg" />
            <div className="ml-3">
              <span className="text-lg font-bold text-gray-800 block leading-tight">Siddhivinayak</span>
              <span className="text-xs text-teal-600 font-medium">Ultrasound Centre</span>
            </div>
          </Link>
          <Link href="/" className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book an Appointment</h1>
          <p className="text-gray-600">Schedule your diagnostic test with ease</p>
        </div>

        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div className={'w-10 h-10 rounded-full flex items-center justify-center font-semibold ' + (step >= s ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-500')}>
                {step > s ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : s}
              </div>
              {s < 4 && <div className={'w-12 sm:w-20 h-1 ' + (step > s ? 'bg-teal-600' : 'bg-gray-200')} />}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">{error}</div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Patient Information</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name *</label>
                <input type="text" name="patientName" value={formData.patientName} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900" placeholder="Enter patient name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Relation Type</label>
                  <select name="relationType" value={formData.relationType} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white text-gray-900">
                    <option value="">Select</option>
                    <option value="S/O">S/O</option>
                    <option value="D/O">D/O</option>
                    <option value="W/O">W/O</option>
                    <option value="H/O">H/O</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Relation Name</label>
                  <input type="text" name="relation" value={formData.relation} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white text-gray-900" placeholder="Father/Husband name" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number *</label>
                <input type="tel" name="mobile" value={formData.mobile} onChange={handleInputChange} maxLength={10} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white text-gray-900" placeholder="10 digit mobile number" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <input type="number" name="age" value={formData.age} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white text-gray-900" placeholder="Age in years" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white text-gray-900">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white text-gray-900" placeholder="Enter address" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Select Tests</h2>
              {Object.entries(testsByCategory).map(([cat, catTests]) => (
                <div key={cat}>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{cat}</h3>
                  <div className="space-y-2">
                    {catTests.map((test, index) => (
                      <label key={cat + '-' + test.id + '-' + index} className={'flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ' + (formData.selectedTests.includes(test.id) ? 'border-teal-600 bg-teal-50' : 'border-gray-200 hover:border-gray-300')}>
                        <div className="flex items-center gap-3">
                          <input type="checkbox" checked={formData.selectedTests.includes(test.id)} onChange={() => handleTestToggle(test.id)} className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500" />
                          <span className="font-medium text-gray-900">{test.name}</span>
                        </div>
                        <span className="font-semibold text-teal-600">₹{test.price}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              {formData.selectedTests.length > 0 && (
                <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Total Amount:</span>
                    <span className="text-xl font-bold text-teal-600">₹{totalAmount}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Select Date & Time</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Date *</label>
                <input type="date" name="appointmentDate" value={formData.appointmentDate} onChange={handleInputChange} min={getMinDate()} max={getMaxDate()} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white text-gray-900" />
              </div>
              {formData.appointmentDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Available Time Slots *</label>
                  {loadingSlots ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                      <p className="text-gray-500 mt-2">Loading slots...</p>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No slots available for this date</p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {availableSlots.map((slot) => {
                        const isSelected = formData.appointmentTime === slot.time;
                        const isDisabled = !slot.available;
                        const isPast = slot.isPast;
                        const isFullyBooked = slot.isFullyBooked;
                        
                        let className = 'py-3 px-2 rounded-xl text-sm font-medium transition-all ';
                        if (isSelected) {
                          className += 'bg-teal-600 text-white shadow-md';
                        } else if (isPast) {
                          className += 'bg-gray-100 text-gray-300 cursor-not-allowed line-through';
                        } else if (isFullyBooked) {
                          className += 'bg-red-50 text-red-300 cursor-not-allowed line-through border border-red-200';
                        } else {
                          className += 'bg-gray-100 hover:bg-teal-50 hover:border-teal-300 text-gray-700 border border-transparent';
                        }
                        
                        return (
                          <button 
                            key={slot.time} 
                            type="button" 
                            onClick={() => slot.available && handleTimeSelect(slot.time)} 
                            disabled={isDisabled}
                            title={isPast ? 'Past time' : isFullyBooked ? 'Fully booked' : 'Available'}
                            className={className}
                          >
                            {formatTime(slot.time)}
                            {isFullyBooked && !isPast && <span className="block text-xs">Booked</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900" placeholder="Any special requirements..." />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Review & Confirm</h2>
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Patient Details</h3>
                <div className="space-y-1 text-gray-700">
                  <p><strong>Name:</strong> {formData.patientName} {formData.relationType && formData.relation ? formData.relationType + ' ' + formData.relation : ''}</p>
                  <p><strong>Mobile:</strong> {formData.mobile}</p>
                  <p><strong>Gender:</strong> {formData.gender} {formData.age ? '| Age: ' + formData.age + ' years' : ''}</p>
                  {formData.address && <p><strong>Address:</strong> {formData.address}</p>}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Appointment</h3>
                <p className="text-gray-700">
                  <strong>Date:</strong> {new Date(formData.appointmentDate).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
                <p className="text-gray-700"><strong>Time:</strong> {formatTime(formData.appointmentTime)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Selected Tests</h3>
                <div className="space-y-2">
                  {formData.selectedTests.map((id) => {
                    const test = tests.find((t) => t.id === id);
                    return test ? (
                      <div key={id} className="flex justify-between text-sm">
                        <span className="text-gray-700">{test.name}</span>
                        <span className="font-medium">₹{test.price}</span>
                      </div>
                    ) : null;
                  })}
                  <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between">
                    <span className="font-semibold">Total Amount</span>
                    <span className="font-bold text-teal-600">₹{totalAmount}</span>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  <strong>💳 Online Payment:</strong> You will be redirected to secure payment gateway after clicking &quot;Pay & Confirm&quot;.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            {step > 1 && !loading ? (
              <button type="button" onClick={handleBack} className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                Back
              </button>
            ) : <div />}
            {step < 4 ? (
              <button type="button" onClick={handleNext} className="px-8 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors">
                Next
              </button>
            ) : (
              <button 
                type="button" 
                onClick={handleSubmit} 
                disabled={loading} 
                className="px-8 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-teal-700 hover:to-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Confirming Appointment...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Confirm Appointment
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          Need help? Call us at <a href="tel:+918307233058" className="text-teal-600 font-medium">+91 8307233058</a>
        </div>
      </div>
    </div>
  );
}
