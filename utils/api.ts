import { Patient, Service, Doctor, Appointment, PatientFormData, ServiceFormData, DoctorFormData, AppointmentFormData } from '@/types';

const API_BASE_URL = 'http://localhost:5000/api';

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const config = { ...defaultOptions, ...options };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    // Handle empty responses
    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

// Patient API
export const patientAPI = {
  // Get all patients
  getAll: (): Promise<Patient[]> => {
    return apiRequest<Patient[]>('/patients');
  },

  // Get patient by OPD number
  getByOPD: (opdNumber: string): Promise<Patient> => {
    return apiRequest<Patient>(`/patients/opd/${opdNumber}`);
  },

  // Get patient medical history by OPD number
  getHistory: (opdNumber: string): Promise<Appointment[]> => {
    return apiRequest<Appointment[]>(`/patients/${opdNumber}/history`);
  },

  // Create new patient
  create: (patientData: PatientFormData): Promise<Patient> => {
    return apiRequest<Patient>('/patients', {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
  },

  // Update patient
  update: (id: string | number, patientData: Partial<PatientFormData>): Promise<Patient> => {
    return apiRequest<Patient>(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patientData),
    });
  },

  // Delete patient
  delete: (id: string | number): Promise<void> => {
    return apiRequest<void>(`/patients/${id}`, {
      method: 'DELETE',
    });
  },
};

// Service API
export const serviceAPI = {
  // Get all services
  getAll: (): Promise<Service[]> => {
    return apiRequest<Service[]>('/services');
  },

  // Get service by ID
  getById: (id: string | number): Promise<Service> => {
    return apiRequest<Service>(`/services/${id}`);
  },

  // Create new service
  create: (serviceData: ServiceFormData): Promise<Service> => {
    return apiRequest<Service>('/services', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  },

  // Update service
  update: (id: string | number, serviceData: Partial<ServiceFormData>): Promise<Service> => {
    return apiRequest<Service>(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(serviceData),
    });
  },

  // Delete service
  delete: (id: string | number): Promise<void> => {
    return apiRequest<void>(`/services/${id}`, {
      method: 'DELETE',
    });
  },
};

// Doctor API
export const doctorAPI = {
  // Get all doctors
  getAll: (): Promise<Doctor[]> => {
    return apiRequest<Doctor[]>('/doctors');
  },

  // Get doctor by ID
  getById: (id: string | number): Promise<Doctor> => {
    return apiRequest<Doctor>(`/doctors/${id}`);
  },

  // Create new doctor
  create: (doctorData: DoctorFormData): Promise<Doctor> => {
    return apiRequest<Doctor>('/doctors', {
      method: 'POST',
      body: JSON.stringify(doctorData),
    });
  },

  // Update doctor
  update: (id: string | number, doctorData: Partial<DoctorFormData>): Promise<Doctor> => {
    return apiRequest<Doctor>(`/doctors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(doctorData),
    });
  },

  // Delete doctor
  delete: (id: string | number): Promise<void> => {
    return apiRequest<void>(`/doctors/${id}`, {
      method: 'DELETE',
    });
  },
};

// Referring Doctor API
export const referringDoctorAPI = {
  getAll: (): Promise<Array<{ id: number; name: string; hospital?: string }>> => {
    return apiRequest('/referring-doctors');
  },
  create: (data: { name: string; hospital?: string; contact?: string; email?: string; isActive?: boolean }) => {
    return apiRequest('/referring-doctors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Appointment API
export const appointmentAPI = {
  // Get all appointments
  getAll: (): Promise<Appointment[]> => {
    return apiRequest<Appointment[]>('/appointments');
  },

  // Get appointment by ID
  getById: (id: string | number): Promise<Appointment> => {
    return apiRequest<Appointment>(`/appointments/${id}`);
  },

  // Get appointments by patient ID
  getByPatientId: (patientId: string | number): Promise<Appointment[]> => {
    return apiRequest<Appointment[]>(`/appointments/patient/${patientId}`);
  },

  // Get appointments by OPD number
  getByOPDNumber: (opdNumber: string): Promise<Appointment[]> => {
    return apiRequest<Appointment[]>(`/appointments/opd/${opdNumber}`);
  },

  // Create new appointment
  create: (appointmentData: {
    patientId: number;
    doctorId: number;
    referenceDoctorId?: number;
    serviceIds: number[];
    appointmentDate: string;
    appointmentTime: string;
    notes?: string;
  }): Promise<Appointment> => {
    return apiRequest<Appointment>('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  },

  // Update appointment
  update: (id: string | number, appointmentData: Partial<AppointmentFormData>): Promise<Appointment> => {
    return apiRequest<Appointment>(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(appointmentData),
    });
  },

  // Cancel appointment
  cancel: (id: string | number): Promise<Appointment> => {
    return apiRequest<Appointment>(`/appointments/${id}/cancel`, {
      method: 'PATCH',
    });
  },

  // Complete appointment
  complete: (id: string | number): Promise<Appointment> => {
    return apiRequest<Appointment>(`/appointments/${id}/complete`, {
      method: 'PATCH',
    });
  },

  // Delete appointment
  delete: (id: string | number): Promise<void> => {
    return apiRequest<void>(`/appointments/${id}`, {
      method: 'DELETE',
    });
  },
};

// Export all APIs as a single object (alternative import style)
export const api = {
  patients: patientAPI,
  services: serviceAPI,
  doctors: doctorAPI,
  appointments: appointmentAPI,
  referringDoctors: referringDoctorAPI,
};

export default api;
