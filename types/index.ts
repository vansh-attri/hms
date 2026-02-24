// Canonical types used by the frontend
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

export type DoctorFormData = Omit<Doctor, 'id'>;
export type ServiceFormData = Omit<Service, 'id'>;
