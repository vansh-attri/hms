import { Service, ServiceFormData } from '@/types';

// Shape returned by /api/patients list/search endpoints
type PatientSummary = {
  id: number;
  name: string;
  RelationType?: string | null;
  Relation?: string | null;
  Mobile?: string | null;
  Age?: string | number | null;
  Address?: string | null;
  Gender?: string | null;
  DoctorID?: number | null;
  CreatedBy?: string | null;
  CreatedDate?: string;
};

// Full row shape as returned by GET /patients/:id and POST /patients
export type PatientRow = {
  PatientID: number;
  PatientName: string;
  RelationType?: string | null;
  Relation?: string | null;
  Mobile?: string | null;
  Age?: string | number | null;
  Address?: string | null;
  Gender?: string | null;
  DoctorID?: number | null;
  CreatedBy?: string | null;
  CreatedDate?: string;
};

// Payload expected by backend to create/update a patient (legacy schema)
export type LegacyPatientCreate = {
  name: string;
  RelationType?: string | null;
  Relation?: string | null;
  Mobile?: string | null;
  Age?: string | number | null;
  Address?: string | null;
  Gender?: string | null;
  DoctorID?: string | number | null;
  CreatedBy?: string | null;
};

// Test types
export type TestSummary = {
  id: number;
  name: string;
  price: number;
  category?: string | null;
  isDeleted: boolean;
};

export type TestCreateData = {
  name: string;
  price: number;
  category?: string;
  isDeleted?: boolean;
};

// Doctor types
export type DoctorSummary = {
  id: number;
  name: string;
  Specialty?: string | null;
  Mobile?: string | null;
  Email?: string | null;
  ConsultationFee?: number | null;
  isDeleted: number; // 0 = active, 1 = deleted
};

export type DoctorCreateData = {
  DoctorName: string;
  Specialty?: string;
  Mobile?: string;
  Email?: string;
  ConsultationFee?: number;
  CommissionPercent?: number;
  Address?: string;
};

// Expense types
export type ExpenseSummary = {
  ID: number;
  ExpenseDate: string;
  Category: string;
  Description: string;
  Amount: number;
  PaymentMethod: string;
  VendorName?: string | null;
  BillNumber?: string | null;
  isDeleted: boolean;
};

export type ExpenseCreateData = {
  ExpenseDate: string;
  Category: string;
  Description: string;
  Amount: number;
  PaymentMethod: string;
  VendorName?: string;
  BillNumber?: string;
  Notes?: string;
  ApprovedBy?: string;
};

// Cash Receipt types
export type CashReceiptSummary = {
  ReceiptID: number;
  PatientName: string;
  BillDate: string;
  TotalAmount: number;
  Discount: number;
  NetAmount: number;
  DoctorID?: number | null;
  isDeleted: boolean;
};

export type CashReceiptCreateData = {
  PatientName: string;
  BillDate: string;
  UserName: string;
  OrgID: number;
  RelationType: string;
  Relation?: string;
  Mobile?: string;
  Age?: string;
  Address?: string;
  Gender: string;
  TotalAmount: number;
  Discount: number;
  NetAmount: number;
  NetAmountWords?: string;
  RefAmount: number;
  DoctorID: number;
  IsRefPaid: boolean;
  PatientID?: number;
  IsIPD: boolean;
  IsDischarged: boolean;
  tests: Array<{
    TestID: number;
    Quantity: number;
    Rate: number;
    Amount: number;
    IsPrintable: boolean;
  }>;
};

// Referral types
export type ReferralSummary = {
  ID: number;
  DoctorID: number;
  ReceiptID: number;
  ReferralAmount: number;
  PaidDate?: string | null;
  IsPaid: boolean;
  PaymentMethod?: string | null;
  Notes?: string | null;
  isDeleted: boolean;
};

export type ReferralCreateData = {
  DoctorID: number;
  ReceiptID: number;
  ReferralAmount: number;
  PaidDate?: string;
  IsPaid?: boolean;
  PaymentMethod?: string;
  Notes?: string;
};

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
  getAll: (): Promise<PatientSummary[]> => {
    return apiRequest<PatientSummary[]>('/patients');
  },
  
  // Search patients by name/mobile/id (optional query params)
  search: (opts: { name?: string; mobile?: string; id?: string | number; limit?: number } = {}): Promise<PatientSummary[]> => {
    const params = new URLSearchParams();
    if (opts.name) params.set('name', opts.name);
    if (opts.mobile) params.set('mobile', opts.mobile);
    if (opts.id !== undefined) params.set('id', String(opts.id));
    if (opts.limit) params.set('limit', String(opts.limit));
    const q = params.toString();
    return apiRequest<PatientSummary[]>(`/patients${q ? `?${q}` : ''}`);
  },

  // Get patient by ID
  getById: (id: string | number): Promise<PatientRow> => {
    return apiRequest<PatientRow>(`/patients/${id}`);
  },

  // Create new patient
  create: (patientData: LegacyPatientCreate): Promise<PatientRow> => {
    return apiRequest<PatientRow>('/patients', {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
  },

  // Update patient
  update: (id: string | number, patientData: Partial<LegacyPatientCreate>): Promise<PatientRow> => {
    return apiRequest<PatientRow>(`/patients/${id}`, {
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

// Doctor API
export const doctorAPI = {
  // Get all doctors
  getAll: (): Promise<DoctorSummary[]> => {
    return apiRequest<DoctorSummary[]>('/doctors');
  },

  // Search doctors by name
  search: (opts: { name?: string; limit?: number } = {}): Promise<DoctorSummary[]> => {
    const params = new URLSearchParams();
    if (opts.name) params.set('name', opts.name);
    if (opts.limit) params.set('limit', String(opts.limit));
    const q = params.toString();
    return apiRequest<DoctorSummary[]>(`/doctors${q ? `?${q}` : ''}`);
  },

  // Get doctor by ID
  getById: (id: string | number): Promise<DoctorSummary> => {
    return apiRequest<DoctorSummary>(`/doctors/${id}`);
  },

  // Create new doctor
  create: (doctorData: DoctorCreateData): Promise<DoctorSummary> => {
    return apiRequest<DoctorSummary>('/doctors', {
      method: 'POST',
      body: JSON.stringify(doctorData),
    });
  },

  // Update doctor
  update: (id: string | number, doctorData: Partial<DoctorCreateData>): Promise<DoctorSummary> => {
    return apiRequest<DoctorSummary>(`/doctors/${id}`, {
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

// Test API
export const testAPI = {
  // Get all tests
  getAll: (): Promise<TestSummary[]> => {
    return apiRequest<TestSummary[]>('/tests');
  },

  // Search tests by name/category
  search: (opts: { name?: string; category?: string; limit?: number } = {}): Promise<TestSummary[]> => {
    const params = new URLSearchParams();
    if (opts.name) params.set('name', opts.name);
    if (opts.category) params.set('category', opts.category);
    if (opts.limit) params.set('limit', String(opts.limit));
    const q = params.toString();
    return apiRequest<TestSummary[]>(`/tests${q ? `?${q}` : ''}`);
  },

  // Get test by ID
  getById: (id: string | number): Promise<TestSummary> => {
    return apiRequest<TestSummary>(`/tests/${id}`);
  },

  // Create new test
  create: (testData: TestCreateData): Promise<TestSummary> => {
    return apiRequest<TestSummary>('/tests', {
      method: 'POST',
      body: JSON.stringify(testData),
    });
  },

  // Update test
  update: (id: string | number, testData: Partial<TestCreateData>): Promise<TestSummary> => {
    return apiRequest<TestSummary>(`/tests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(testData),
    });
  },

  // Delete test
  delete: (id: string | number): Promise<void> => {
    return apiRequest<void>(`/tests/${id}`, {
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

// Expense API
export const expenseAPI = {
  // Get all expenses
  getAll: (): Promise<ExpenseSummary[]> => {
    return apiRequest<ExpenseSummary[]>('/expenses');
  },

  // Search expenses by date/category
  search: (opts: { 
    startDate?: string; 
    endDate?: string; 
    category?: string; 
    limit?: number 
  } = {}): Promise<ExpenseSummary[]> => {
    const params = new URLSearchParams();
    if (opts.startDate) params.set('startDate', opts.startDate);
    if (opts.endDate) params.set('endDate', opts.endDate);
    if (opts.category) params.set('category', opts.category);
    if (opts.limit) params.set('limit', String(opts.limit));
    const q = params.toString();
    return apiRequest<ExpenseSummary[]>(`/expenses${q ? `?${q}` : ''}`);
  },

  // Get expense by ID
  getById: (id: string | number): Promise<ExpenseSummary> => {
    return apiRequest<ExpenseSummary>(`/expenses/${id}`);
  },

  // Create new expense
  create: (expenseData: ExpenseCreateData): Promise<ExpenseSummary> => {
    return apiRequest<ExpenseSummary>('/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  },

  // Update expense
  update: (id: string | number, expenseData: Partial<ExpenseCreateData>): Promise<ExpenseSummary> => {
    return apiRequest<ExpenseSummary>(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expenseData),
    });
  },

  // Delete expense
  delete: (id: string | number): Promise<void> => {
    return apiRequest<void>(`/expenses/${id}`, {
      method: 'DELETE',
    });
  },
};

// Cash Receipt API
export const receiptAPI = {
  // Get all receipts
  getAll: (): Promise<CashReceiptSummary[]> => {
    return apiRequest<CashReceiptSummary[]>('/receipts');
  },

  // Search receipts by patient name/date
  search: (opts: { 
    patientName?: string; 
    startDate?: string; 
    endDate?: string; 
    limit?: number 
  } = {}): Promise<CashReceiptSummary[]> => {
    const params = new URLSearchParams();
    if (opts.patientName) params.set('patientName', opts.patientName);
    if (opts.startDate) params.set('startDate', opts.startDate);
    if (opts.endDate) params.set('endDate', opts.endDate);
    if (opts.limit) params.set('limit', String(opts.limit));
    const q = params.toString();
    return apiRequest<CashReceiptSummary[]>(`/receipts${q ? `?${q}` : ''}`);
  },

  // Get receipt by ID
  getById: (id: string | number): Promise<CashReceiptSummary> => {
    return apiRequest<CashReceiptSummary>(`/receipts/${id}`);
  },

  // Create new receipt
  create: (receiptData: CashReceiptCreateData): Promise<CashReceiptSummary> => {
    return apiRequest<CashReceiptSummary>('/receipts', {
      method: 'POST',
      body: JSON.stringify(receiptData),
    });
  },

  // Update receipt
  update: (id: string | number, receiptData: Partial<CashReceiptCreateData>): Promise<CashReceiptSummary> => {
    return apiRequest<CashReceiptSummary>(`/receipts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(receiptData),
    });
  },

  // Delete receipt
  delete: (id: string | number): Promise<void> => {
    return apiRequest<void>(`/receipts/${id}`, {
      method: 'DELETE',
    });
  },
};

// Referral API
export const referralAPI = {
  // Get all referrals
  getAll: (): Promise<ReferralSummary[]> => {
    return apiRequest<ReferralSummary[]>('/referrals');
  },

  // Create new referral
  create: (referralData: ReferralCreateData): Promise<ReferralSummary> => {
    return apiRequest<ReferralSummary>('/referrals', {
      method: 'POST',
      body: JSON.stringify(referralData),
    });
  },

  // Update referral payment status
  updatePayment: (id: string | number, paymentData: { isPaid: boolean; paidDate?: string }): Promise<ReferralSummary> => {
    return apiRequest<ReferralSummary>(`/referrals/${id}/payment`, {
      method: 'PATCH',
      body: JSON.stringify(paymentData),
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

// Health check
export const healthAPI = {
  check: (): Promise<{ status: string; env: string; db: string }> => {
    return apiRequest<{ status: string; env: string; db: string }>('/health');
  },
};

// Export all APIs as a single object (alternative import style)
export const api = {
  patients: patientAPI,
  doctors: doctorAPI,
  tests: testAPI,
  services: serviceAPI,
  expenses: expenseAPI,
  receipts: receiptAPI,
  referrals: referralAPI,
  referringDoctors: referringDoctorAPI,
  health: healthAPI,
  
  stats: {
    getDashboard: async () => {
      const response = await fetch(`${API_BASE_URL}/stats/dashboard`);
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      return response.json();
    },

    getRecentActivities: async (limit = 10) => {
      const response = await fetch(`${API_BASE_URL}/stats/recent-activities?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch recent activities');
      return response.json();
    },

    getDailyCollection: async (date?: string) => {
      const queryParam = date ? `?date=${date}` : '';
      const response = await fetch(`${API_BASE_URL}/stats/daily-collection${queryParam}`);
      if (!response.ok) throw new Error('Failed to fetch daily collection');
      return response.json();
    }
  }
};

export default api;
