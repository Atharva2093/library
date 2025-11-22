'use client';

import Link from 'next/link';
import { Book, ArrowRight, Users, TrendingUp, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Book className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">LibraryMS</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Book className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="mb-6 text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
            Library Management
            <span className="block text-blue-600">Made Simple</span>
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-600">
            Streamline your library operations with our comprehensive management system. Track
            books, manage customers, monitor sales, and analyze performance all in one place.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center rounded-lg border border-transparent bg-blue-600 px-8 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-8 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              Everything you need to manage your library
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Our platform provides all the tools you need to efficiently manage your library
              operations.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Book className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">Book Management</h3>
              <p className="text-gray-600">
                Organize your entire catalog with advanced search, categorization, and inventory
                tracking features.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">Customer Management</h3>
              <p className="text-gray-600">
                Maintain detailed customer records, track purchase history, and manage loyalty
                programs.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">Sales Analytics</h3>
              <p className="text-gray-600">
                Get insights into your sales performance with detailed reports and analytics
                dashboards.
              </p>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="mt-24 rounded-2xl bg-gray-50 p-8 md:p-12">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="mb-4 text-3xl font-bold text-gray-900">Secure & Reliable</h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
              Your data is protected with enterprise-grade security measures. Role-based access
              control ensures that sensitive information stays secure.
            </p>
            <div className="mx-auto grid max-w-2xl gap-6 md:grid-cols-2">
              <div className="flex items-center justify-center rounded-lg bg-white p-4">
                <span className="text-sm font-medium text-gray-900">JWT Authentication</span>
              </div>
              <div className="flex items-center justify-center rounded-lg bg-white p-4">
                <span className="text-sm font-medium text-gray-900">Role-Based Access</span>
              </div>
              <div className="flex items-center justify-center rounded-lg bg-white p-4">
                <span className="text-sm font-medium text-gray-900">Data Encryption</span>
              </div>
              <div className="flex items-center justify-center rounded-lg bg-white p-4">
                <span className="text-sm font-medium text-gray-900">Secure API</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">Ready to get started?</h2>
          <p className="mb-8 text-lg text-gray-600">
            Join thousands of libraries using our platform to streamline their operations.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center rounded-lg border border-transparent bg-blue-600 px-8 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700"
          >
            Create Account
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Book className="h-6 w-6 text-blue-600" />
              <span className="ml-2 text-lg font-semibold text-gray-900">LibraryMS</span>
            </div>
            <p className="text-sm text-gray-500">
              © 2024 Library Management System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
