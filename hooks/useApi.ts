import { useState, useCallback, useEffect } from 'react';

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseApiResult<T> extends ApiState<T> {
  execute: (...args: unknown[]) => Promise<T>;
  reset: () => void;
}

/**
 * Generic hook for API calls with loading states and error handling
 */
export function useApi<T>(
  apiFunction: (...args: unknown[]) => Promise<T>
): UseApiResult<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: unknown[]): Promise<T> => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const result = await apiFunction(...args);
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        setState(prev => ({ ...prev, loading: false, error: errorMessage }));
        throw error;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Hook for API calls that execute immediately on mount
 */
export function useApiQuery<T>(
  apiFunction: () => Promise<T>
): UseApiResult<T> {
  const result = useApi(apiFunction);

  useEffect(() => {
    result.execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return result;
}

/**
 * Hook for mutations (create, update, delete operations)
 */
export function useApiMutation<T, TVariables = unknown>(
  apiFunction: (variables: TVariables) => Promise<T>,
  options?: {
    onSuccess?: (data: T, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
  }
): {
  mutate: (variables: TVariables) => Promise<void>;
  loading: boolean;
  error: string | null;
} {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (variables: TVariables) => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiFunction(variables);
        options?.onSuccess?.(result, variables);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        options?.onError?.(err as Error, variables);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, options]
  );

  return { mutate, loading, error };
}