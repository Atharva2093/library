import { useState, useEffect, useCallback } from 'react';
import { ApiServiceError, ServiceCache } from '../services';

// Generic hook for API calls with loading, error states, and caching
export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = [],
  options: {
    immediate?: boolean;
    cache?: boolean;
    cacheKey?: string;
    cacheTTL?: number;
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { immediate = true, cache = false, cacheKey, cacheTTL = 5 } = options;

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      if (cache && cacheKey) {
        const cachedData = ServiceCache.get<T>(cacheKey);
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          return cachedData;
        }
      }

      const result = await apiCall();
      setData(result);

      // Cache the result
      if (cache && cacheKey) {
        ServiceCache.set(cacheKey, result, cacheTTL);
      }

      return result;
    } catch (err) {
      const apiError = err instanceof ApiServiceError ? err : ApiServiceError.fromApiError(err);
      setError(apiError.message);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, dependencies);

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    if (cache && cacheKey) {
      ServiceCache.delete(cacheKey);
    }
  }, [cache, cacheKey]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    data,
    loading,
    error,
    execute,
    refetch,
    reset,
  };
}

// Hook for paginated API calls
export function usePaginatedApi<T>(
  apiCall: (
    page: number,
    size: number
  ) => Promise<{ items: T[]; total: number; page: number; size: number; pages: number }>,
  options: {
    initialPage?: number;
    pageSize?: number;
    immediate?: boolean;
  } = {}
) {
  const { initialPage = 1, pageSize = 20, immediate = true } = options;

  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState({
    page: initialPage,
    size: pageSize,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (page: number = pagination.page) => {
      try {
        setLoading(true);
        setError(null);

        const result = await apiCall(page, pageSize);
        setData(result.items);
        setPagination({
          page: result.page,
          size: result.size,
          total: result.total,
          pages: result.pages,
        });

        return result;
      } catch (err) {
        const apiError = err instanceof ApiServiceError ? err : ApiServiceError.fromApiError(err);
        setError(apiError.message);
        throw apiError;
      } finally {
        setLoading(false);
      }
    },
    [apiCall, pageSize, pagination.page]
  );

  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= pagination.pages) {
        fetchData(page);
      }
    },
    [fetchData, pagination.pages]
  );

  const nextPage = useCallback(() => {
    goToPage(pagination.page + 1);
  }, [goToPage, pagination.page]);

  const prevPage = useCallback(() => {
    goToPage(pagination.page - 1);
  }, [goToPage, pagination.page]);

  const refetch = useCallback(() => {
    return fetchData(pagination.page);
  }, [fetchData, pagination.page]);

  useEffect(() => {
    if (immediate) {
      fetchData(initialPage);
    }
  }, [immediate, initialPage, fetchData]);

  return {
    data,
    pagination,
    loading,
    error,
    goToPage,
    nextPage,
    prevPage,
    refetch,
    hasNextPage: pagination.page < pagination.pages,
    hasPrevPage: pagination.page > 1,
  };
}

// Hook for search with debouncing
export function useSearch<T>(
  searchFn: (query: string) => Promise<T[]>,
  debounceMs: number = 300,
  minLength: number = 2
) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < minLength) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const searchResults = await searchFn(searchQuery);
        setResults(searchResults);
      } catch (err) {
        const apiError = err instanceof ApiServiceError ? err : ApiServiceError.fromApiError(err);
        setError(apiError.message);
      } finally {
        setLoading(false);
      }
    },
    [searchFn, minLength]
  );

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query !== '') {
        search(query);
      } else {
        setResults([]);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, search, debounceMs]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    clearSearch,
  };
}

// Hook for form submission with API
export function useApiSubmit<TData, TResult = any>(
  submitFn: (data: TData) => Promise<TResult>,
  options: {
    onSuccess?: (result: TResult) => void;
    onError?: (error: ApiServiceError) => void;
    resetOnSuccess?: boolean;
  } = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { onSuccess, onError, resetOnSuccess = false } = options;

  const submit = useCallback(
    async (data: TData) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(false);

        const result = await submitFn(data);
        setSuccess(true);

        if (onSuccess) {
          onSuccess(result);
        }

        if (resetOnSuccess) {
          setTimeout(() => setSuccess(false), 3000);
        }

        return result;
      } catch (err) {
        const apiError = err instanceof ApiServiceError ? err : ApiServiceError.fromApiError(err);
        setError(apiError.message);

        if (onError) {
          onError(apiError);
        }

        throw apiError;
      } finally {
        setLoading(false);
      }
    },
    [submitFn, onSuccess, onError, resetOnSuccess]
  );

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
    setLoading(false);
  }, []);

  return {
    submit,
    loading,
    error,
    success,
    reset,
  };
}

// Hook for file upload with progress
export function useFileUpload<T = any>(
  uploadFn: (file: File, onProgress?: (progress: number) => void) => Promise<T>,
  options: {
    onSuccess?: (result: T) => void;
    onError?: (error: ApiServiceError) => void;
    acceptedTypes?: string[];
    maxSize?: number;
  } = {}
) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { onSuccess, onError, acceptedTypes, maxSize } = options;

  const upload = useCallback(
    async (file: File) => {
      // Validate file type
      if (acceptedTypes && !acceptedTypes.includes(file.type)) {
        const error = new ApiServiceError(`File type ${file.type} is not supported`);
        setError(error.message);
        if (onError) onError(error);
        return;
      }

      // Validate file size
      if (maxSize && file.size > maxSize) {
        const error = new ApiServiceError(`File size exceeds ${maxSize} bytes`);
        setError(error.message);
        if (onError) onError(error);
        return;
      }

      try {
        setUploading(true);
        setError(null);
        setSuccess(false);
        setProgress(0);

        const result = await uploadFn(file, setProgress);
        setSuccess(true);

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err) {
        const apiError = err instanceof ApiServiceError ? err : ApiServiceError.fromApiError(err);
        setError(apiError.message);

        if (onError) {
          onError(apiError);
        }

        throw apiError;
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [uploadFn, onSuccess, onError, acceptedTypes, maxSize]
  );

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
    setUploading(false);
    setProgress(0);
  }, []);

  return {
    upload,
    uploading,
    progress,
    error,
    success,
    reset,
  };
}
