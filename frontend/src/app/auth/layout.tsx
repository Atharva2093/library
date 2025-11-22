'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const AuthLayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const error = searchParams.get('error');
  const redirect = searchParams.get('redirect');

  const [showMessage, setShowMessage] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back to Home Link */}
      <div className="absolute left-4 top-4">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Home
        </Link>
      </div>

      {/* Success/Error Messages */}
      {showMessage && (message || error) && (
        <div className="border-b bg-white">
          <div className="mx-auto max-w-md px-4 py-3">
            {message && (
              <div className="flex items-center rounded-lg border border-green-200 bg-green-50 p-3">
                <CheckCircle className="mr-2 h-5 w-5 flex-shrink-0 text-green-600" />
                <span className="text-sm text-green-800">{message}</span>
                <button
                  onClick={() => setShowMessage(false)}
                  className="ml-auto text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </div>
            )}
            {error && (
              <div className="flex items-center rounded-lg border border-red-200 bg-red-50 p-3">
                <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0 text-red-600" />
                <span className="text-sm text-red-800">{error}</span>
                <button
                  onClick={() => setShowMessage(false)}
                  className="ml-auto text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {children}
    </div>
  );
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthLayoutWrapper>{children}</AuthLayoutWrapper>;
}
