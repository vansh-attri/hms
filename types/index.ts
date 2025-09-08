// Canonical types used by the frontend
export interface Patient {
  id: number;
  opdNumber: string;
  firstName: string;
  lastName: string;
  gender?: 'Male' | 'Female' | 'Other';
  dob?: string;
  phone?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Doctor {
  id: number;
  name: string;
  specialty?: string;
  phone?: string;
  email?: string;
}

export interface Service {
  id: number;
  name: string;
  description?: string;
  price?: number;
  isActive?: boolean;
}

export interface ReferringDoctor {
  id: number;
  name: string;
  hospital?: string;
  contact?: string;
  email?: string;
  isActive?: boolean;
}

export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  referenceDoctorId?: number;
  serviceIds: number[];
  appointmentDate: string;
  appointmentTime: string;
  notes?: string;
  status?: 'scheduled' | 'completed' | 'cancelled';
}

export type PatientFormData = Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>;
export type DoctorFormData = Omit<Doctor, 'id'>;
export type ServiceFormData = Omit<Service, 'id'>;
export interface AppointmentFormData {
  patientId: number;
  doctorId: number;
  referenceDoctorId?: number;
  serviceIds: number[];
  appointmentDate: string;
  appointmentTime: string;
  notes?: string;
}
