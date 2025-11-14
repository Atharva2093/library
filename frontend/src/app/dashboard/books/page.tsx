'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import Protected from '../../../components/Protected';
import api from '../../../lib/api';

import './style.css';

interface Book {
  id: number;
  title: string;
  author: string;
  category?: { name: string };
  category_id?: number;
  price: number | string | null;
  stock: number | string | null;
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchBooks = useCallback(async (showLoader: boolean = true) => {
    if (showLoader) {
      setLoading(true);
    }
    setError(null);
    try {
      const response = await api.get<Book[]>('/books/');
      setBooks(response.data ?? []);
    } catch (err) {
      console.error(err);
      setError('Unable to load books. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchBooks();
  }, [fetchBooks]);

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this book?');
    if (!confirmDelete) {
      return;
    }

    setDeletingId(id);
    setError(null);
    try {
  await api.delete(`/books/${id}`);
  await fetchBooks(false);
    } catch (err) {
      console.error(err);
      setError('Failed to delete the book. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Protected>
      <section className="books-page">
        <header className="books-header">
          <div>
            <h2>Books</h2>
            <p className="muted-text">Manage your inventory of books and keep records up to date.</p>
          </div>
          <Link className="btn btn-primary" href="/dashboard/books/new">
            Add Book
          </Link>
        </header>

        {error ? <p className="error-message">{error}</p> : null}

        {loading ? (
          <p className="muted-text">Loading books…</p>
        ) : books.length ? (
          <div className="table-wrapper">
            <table className="books-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book: Book) => {
                  const priceValue = Number(book.price);
                  const priceDisplay = Number.isFinite(priceValue) ? `$${priceValue.toFixed(2)}` : '—';
                  const stockDisplay = book.stock ?? '—';

                  return (
                    <tr key={book.id}>
                      <td>{book.title}</td>
                      <td>{book.author}</td>
                      <td>{book.category?.name ?? '—'}</td>
                      <td>{priceDisplay}</td>
                      <td>{stockDisplay}</td>
                      <td>
                        <div className="books-actions">
                          <Link className="btn btn-secondary" href={`/dashboard/books/${book.id}`}>
                            Edit
                          </Link>
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => handleDelete(book.id)}
                            disabled={deletingId === book.id}
                          >
                            {deletingId === book.id ? 'Deleting…' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted-text">No books found. Add your first book to get started.</p>
        )}
      </section>
    </Protected>
  );
}
