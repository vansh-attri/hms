'use client';
7
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface AppointmentTest {
  ID: number;
  TestID: number;
  TestName: string;
  TestPrice: number;
  Category: string;
}

interface Appointment {
  ID: number;
  PatientName: string;
  RelationType: string | null;
  Relation: string | null;
  Mobile: string;
  Age: string | null;
  Address: string | null;
  Gender: string | null;
  AppointmentDate: string;
  AppointmentTime: string;
  TotalAmount: number;
  Status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  PaymentStatus: 'unpaid' | 'paid';
  PatientID: number | null;
  CashReceiptID: number | null;
  Notes: string | null;
  CreatedDate: string;
  TestNames?: string;
  tests?: AppointmentTest[];
}

const API_BASE_URL = 'http://localhost:5002/api';

export default function AppointmentsPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0,
    paidRevenue: 0
  });

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    if (!isAdmin) {
      router.push('/dashboard');
      return;
    }
  }, [user, isAdmin, router]);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = `${API_BASE_URL}/appointments?date=${selectedDate}`;
      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const data: Appointment[] = await response.json();
      setAppointments(data);

      // Calculate stats
      const newStats = {
        total: data.length,
        pending: data.filter(a => a.Status === 'pending').length,
        confirmed: data.filter(a => a.Status === 'confirmed').length,
        completed: data.filter(a => a.Status === 'completed').length,
        cancelled: data.filter(a => a.Status === 'cancelled').length,
        totalRevenue: data.reduce((sum, a) => sum + a.TotalAmount, 0),
        paidRevenue: data.filter(a => a.PaymentStatus === 'paid').reduce((sum, a) => sum + a.TotalAmount, 0)
      };
      setStats(newStats);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, statusFilter]);

  useEffect(() => {
    if (isAdmin) {
      fetchAppointments();
    }
  }, [fetchAppointments, isAdmin]);

  const fetchAppointmentDetails = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${id}`);
      if (!response.ok) throw new Error('Failed to fetch appointment details');
      const data = await response.json();
      setSelectedAppointment(data);
      setShowModal(true);
    } catch {
      alert('Failed to fetch appointment details');
    }
  };

  const updateAppointmentStatus = async (id: number, status: string) => {
    try {
      if (status === 'confirmed') {
        const response = await fetch(`${API_BASE_URL}/appointments/${id}/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId: 'manual_confirmation' })
        });
        if (!response.ok) throw new Error('Failed to confirm appointment');
      } else if (status === 'cancelled') {
        const response = await fetch(`${API_BASE_URL}/appointments/${id}/cancel`, {
          method: 'POST'
        });
        if (!response.ok) throw new Error('Failed to cancel appointment');
      }
      
      fetchAppointments();
      setShowModal(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update appointment');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[status] || 'bg-gray-100'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentBadge = (status: string) => {
    return status === 'paid' ? (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
        Paid
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800 border border-orange-200">
        Unpaid
      </span>
    );
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (!user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Appointments
          </h1>
          <p className="text-gray-600 mt-1">View and manage daily appointments</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status Filter</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="ml-auto">
              <button
                onClick={fetchAppointments}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-yellow-50 rounded-xl shadow-sm border border-yellow-200 p-4">
            <p className="text-sm text-yellow-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
          </div>
          <div className="bg-green-50 rounded-xl shadow-sm border border-green-200 p-4">
            <p className="text-sm text-green-600">Confirmed</p>
            <p className="text-2xl font-bold text-green-700">{stats.confirmed}</p>
          </div>
          <div className="bg-blue-50 rounded-xl shadow-sm border border-blue-200 p-4">
            <p className="text-sm text-blue-600">Completed</p>
            <p className="text-2xl font-bold text-blue-700">{stats.completed}</p>
          </div>
          <div className="bg-red-50 rounded-xl shadow-sm border border-red-200 p-4">
            <p className="text-sm text-red-600">Cancelled</p>
            <p className="text-2xl font-bold text-red-700">{stats.cancelled}</p>
          </div>
          <div className="bg-purple-50 rounded-xl shadow-sm border border-purple-200 p-4">
            <p className="text-sm text-purple-600">Total Revenue</p>
            <p className="text-2xl font-bold text-purple-700">₹{stats.totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl shadow-sm border border-emerald-200 p-4">
            <p className="text-sm text-emerald-600">Paid Revenue</p>
            <p className="text-2xl font-bold text-emerald-700">₹{stats.paidRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 text-lg">No appointments found for {formatDate(selectedDate)}</p>
          </div>
        ) : (
          /* Appointments Table */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Time</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Patient</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mobile</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Tests</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Payment</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <tr key={appointment.ID} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">#{appointment.ID}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                        {formatTime(appointment.AppointmentTime)}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{appointment.PatientName}</p>
                          {appointment.Relation && (
                            <p className="text-xs text-gray-500">{appointment.RelationType} {appointment.Relation}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{appointment.Mobile}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-sm text-gray-700 max-w-xs truncate" title={appointment.TestNames || ''}>
                          {appointment.TestNames || 'N/A'}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        ₹{appointment.TotalAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(appointment.Status)}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">{getPaymentBadge(appointment.PaymentStatus)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => fetchAppointmentDetails(appointment.ID)}
                          className="text-cyan-600 hover:text-cyan-800 text-sm font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showModal && selectedAppointment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Appointment #{selectedAppointment.ID}</h2>
                    <p className="text-sm text-gray-500">
                      {formatDate(selectedAppointment.AppointmentDate)} at {formatTime(selectedAppointment.AppointmentTime)}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Patient Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Patient Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="font-medium">{selectedAppointment.PatientName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Mobile</p>
                      <p className="font-medium">{selectedAppointment.Mobile}</p>
                    </div>
                    {selectedAppointment.Relation && (
                      <div>
                        <p className="text-xs text-gray-500">{selectedAppointment.RelationType}</p>
                        <p className="font-medium">{selectedAppointment.Relation}</p>
                      </div>
                    )}
                    {selectedAppointment.Age && (
                      <div>
                        <p className="text-xs text-gray-500">Age</p>
                        <p className="font-medium">{selectedAppointment.Age} years</p>
                      </div>
                    )}
                    {selectedAppointment.Gender && (
                      <div>
                        <p className="text-xs text-gray-500">Gender</p>
                        <p className="font-medium">{selectedAppointment.Gender}</p>
                      </div>
                    )}
                    {selectedAppointment.Address && (
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500">Address</p>
                        <p className="font-medium">{selectedAppointment.Address}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tests */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Tests Booked</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {selectedAppointment.tests && selectedAppointment.tests.length > 0 ? (
                      <div className="space-y-2">
                        {selectedAppointment.tests.map((test) => (
                          <div key={test.ID} className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-gray-900">{test.TestName}</p>
                              <p className="text-xs text-gray-500">{test.Category}</p>
                            </div>
                            <p className="font-semibold text-gray-900">₹{test.TestPrice.toLocaleString()}</p>
                          </div>
                        ))}
                        <div className="border-t border-gray-200 pt-2 mt-2">
                          <div className="flex justify-between items-center">
                            <p className="font-semibold text-gray-900">Total Amount</p>
                            <p className="font-bold text-lg text-cyan-600">₹{selectedAppointment.TotalAmount.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">No test details available</p>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Status</h3>
                  <div className="flex gap-3">
                    {getStatusBadge(selectedAppointment.Status)}
                    {getPaymentBadge(selectedAppointment.PaymentStatus)}
                  </div>
                </div>

                {/* Notes */}
                {selectedAppointment.Notes && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Notes</h3>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedAppointment.Notes}</p>
                  </div>
                )}

                {/* IDs */}
                <div className="text-sm text-gray-500 space-y-1">
                  {selectedAppointment.PatientID && (
                    <p>Patient ID: <span className="font-medium text-gray-700">{selectedAppointment.PatientID}</span></p>
                  )}
                  {selectedAppointment.CashReceiptID && (
                    <p>Receipt ID: <span className="font-medium text-gray-700">{selectedAppointment.CashReceiptID}</span></p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3 justify-end">
                {selectedAppointment.Status === 'pending' && selectedAppointment.PaymentStatus === 'unpaid' && (
                  <>
                    <button
                      onClick={() => updateAppointmentStatus(selectedAppointment.ID, 'cancelled')}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Cancel Appointment
                    </button>
                    <button
                      onClick={() => updateAppointmentStatus(selectedAppointment.ID, 'confirmed')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Confirm & Mark Paid
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
