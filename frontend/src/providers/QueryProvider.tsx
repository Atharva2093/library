'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

// Conditionally import ReactQueryDevtools
let ReactQueryDevtools: any = null;
try {
  ReactQueryDevtools = require('@tanstack/react-query-devtools').ReactQueryDevtools;
} catch (error) {
  // Devtools not available in production
}

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 3,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && ReactQueryDevtools && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}
