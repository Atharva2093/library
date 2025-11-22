'use client';

import { useState, useEffect } from 'react';
import { Book, Plus, Search, Filter, Upload, Download } from 'lucide-react';
import { useApi, usePaginatedApi, useSearch } from '@/lib/hooks';
import { booksService, authorsService, categoriesService } from '@/lib/services';
import type { Book as BookType, Author, Category, BookFilters } from '@/lib/types';

const BooksPage = () => {
  const [filters, setFilters] = useState<BookFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  // Fetch books with pagination
  const {
    data: books,
    pagination,
    loading: booksLoading,
    error: booksError,
    goToPage,
    nextPage,
    prevPage,
    refetch: refetchBooks,
  } = usePaginatedApi<BookType>((page, size) => booksService.getBooks({ ...filters, page, size }), {
    pageSize: 20,
  });

  // Fetch authors and categories for filters
  const { data: authors } = useApi<Author[]>(() => authorsService.getAuthors(), [], {
    cache: true,
    cacheKey: 'authors',
  });
  const { data: categories } = useApi<Category[]>(() => categoriesService.getCategories(), [], {
    cache: true,
    cacheKey: 'categories',
  });

  // Search functionality
  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    results: searchResults,
    loading: searchLoading,
  } = useSearch<BookType>(q => booksService.searchBooks(q, 10));

  // Handle filter changes
  useEffect(() => {
    refetchBooks();
  }, [filters, refetchBooks]);

  // Handle search
  const handleSearch = () => {
    setFilters({ ...filters, search: searchQuery });
  };

  // Mock data fallback
  const mockBooks: BookType[] = [
    {
      id: 1,
      title: 'To Kill a Mockingbird',
      isbn: '978-0-06-112008-4',
      description:
        'A gripping, heart-wrenching, and wholly remarkable tale of coming-of-age in a South poisoned by virulent prejudice.',
      price: 15.99,
      stock_quantity: 25,
      publication_date: '1960-07-11',
      publisher: 'J.B. Lippincott & Co.',
      language: 'English',
      pages: 324,
      format: 'paperback',
      authors: [{ id: 1, name: 'Harper Lee', bio: '', created_at: '', updated_at: '' }],
      categories: [{ id: 1, name: 'Fiction', description: '', created_at: '', updated_at: '' }],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ];

  return (
    <>
      {/* Page header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Books</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your book inventory, add new books, and track stock levels.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Book
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 rounded-lg bg-white shadow">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 leading-5 placeholder-gray-500 focus:border-blue-500 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  placeholder="Search books..."
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <select className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm">
                <option>All Categories</option>
                <option>Fiction</option>
                <option>Technology</option>
                <option>Science</option>
              </select>
              <button className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Books table */}
      <div className="mt-6 overflow-hidden bg-white shadow sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Book Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Stock
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {books.map(book => (
                <tr key={book.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded bg-blue-100">
                          <Book className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{book.title}</div>
                        <div className="text-sm text-gray-500">
                          {book.authors?.[0]?.name || 'Unknown Author'}
                        </div>
                        <div className="text-xs text-gray-400">ISBN: {book.isbn}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                      {book.categories?.[0]?.name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    ${book.price}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        book.stock_quantity > 20
                          ? 'bg-green-100 text-green-800'
                          : book.stock_quantity > 10
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {book.stock_quantity} in stock
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button className="mr-3 text-blue-600 hover:text-blue-900">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Development notice */}
      <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-blue-900">Books Management Preview</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                This is a preview of the books management interface. Full CRUD operations, search
                functionality, and API integration will be implemented in upcoming phases.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BooksPage;
