import { useApi, useApiQuery, useApiMutation } from './useApi';
import { patientAPI } from '@/utils/api';
import { LegacyPatientCreate } from '@/utils/api';

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

export interface UsePatientResult {
  patients: PatientSummary[] | null;
  loading: boolean;
  error: string | null;
  searchPatients: (query: { name?: string; mobile?: string; id?: string | number }) => Promise<PatientSummary[]>;
  createPatient: {
    mutate: (data: LegacyPatientCreate) => Promise<void>;
    loading: boolean;
    error: string | null;
  };
  updatePatient: {
    mutate: (data: { id: string | number; updates: Partial<LegacyPatientCreate> }) => Promise<void>;
    loading: boolean;
    error: string | null;
  };
  deletePatient: {
    mutate: (id: string | number) => Promise<void>;
    loading: boolean;
    error: string | null;
  };
  refreshPatients: () => Promise<PatientSummary[]>;
}

/**
 * Comprehensive hook for patient management
 */
export function usePatients(): UsePatientResult {
  // Fetch all patients on mount
  const {
    data: patients,
    loading,
    error,
    execute: refreshPatients,
  } = useApiQuery(() => patientAPI.getAll());

  // Search functionality with proper typing
  const searchPatients = async (query: { name?: string; mobile?: string; id?: string | number }) => {
    return patientAPI.search(query);
  };

  // Create patient mutation
  const createPatient = useApiMutation(
    patientAPI.create,
    {
      onSuccess: () => {
        refreshPatients(); // Refresh the list after creation
      },
    }
  );

  // Update patient mutation
  const updatePatient = useApiMutation(
    ({ id, updates }: { id: string | number; updates: Partial<LegacyPatientCreate> }) =>
      patientAPI.update(id, updates),
    {
      onSuccess: () => {
        refreshPatients(); // Refresh the list after update
      },
    }
  );

  // Delete patient mutation
  const deletePatient = useApiMutation(
    patientAPI.delete,
    {
      onSuccess: () => {
        refreshPatients(); // Refresh the list after deletion
      },
    }
  );

  return {
    patients,
    loading,
    error,
    searchPatients,
    createPatient,
    updatePatient,
    deletePatient,
    refreshPatients,
  };
}

/**
 * Hook for individual patient by ID (note: API doesn't have getById yet)
 */
export function usePatient(id: string | number | null) {
  // Since API doesn't have getById, we'll search by ID
  const searchPatient = async () => {
    if (!id) return null;
    const results = await patientAPI.search({ id });
    return results[0] || null;
  };

  const {
    data: patient,
    loading,
    error,
    execute: fetchPatient,
  } = useApi(searchPatient);

  return {
    patient,
    loading,
    error,
    fetchPatient: id ? fetchPatient : () => Promise.resolve(null),
  };
}