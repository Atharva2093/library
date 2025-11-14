'use client';

import Link from 'next/link';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import Protected from '../../../../components/Protected';
import api from '../../../../lib/api';

import '../style.css';

interface Category {
  id: number;
  name: string;
}

interface BookResponse {
  id: number;
  title: string;
  author: string;
  price: number | string | null;
  stock: number | string | null;
  isbn: string | null;
  description: string | null;
  category_id: number | null;
}

interface EditBookForm {
  title: string;
  author: string;
  price: string;
  stock: string;
  isbn: string;
  description: string;
  category_id: string;
}

const emptyForm: EditBookForm = {
  title: '',
  author: '',
  price: '',
  stock: '',
  isbn: '',
  description: '',
  category_id: '',
};

interface EditBookPageProps {
  params: {
    id: string;
  };
}

export default function EditBookPage({ params }: EditBookPageProps) {
  const router = useRouter();
  const [form, setForm] = useState<EditBookForm>(emptyForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBook = async () => {
      setError(null);
      try {
        const response = await api.get<BookResponse>(`/books/${params.id}`);
        const book = response.data;
        setForm({
          title: book.title ?? '',
          author: book.author ?? '',
          price: book.price != null ? String(book.price) : '',
          stock: book.stock != null ? String(book.stock) : '',
          isbn: book.isbn ?? '',
          description: book.description ?? '',
          category_id: book.category_id != null ? String(book.category_id) : '',
        });
      } catch (err) {
        console.error(err);
        setError('Unable to load book details. It may have been removed.');
      } finally {
        setLoading(false);
      }
    };

    void fetchBook();
  }, [params.id]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get<Category[]>('/categories/');
        setCategories(response.data ?? []);
      } catch (err) {
        console.error(err);
        setError((prev: string | null) => prev ?? 'Unable to load categories.');
      } finally {
        setLoadingCategories(false);
      }
    };

    void fetchCategories();
  }, []);

  const handleChange = (field: keyof EditBookForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev: EditBookForm) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitLoading(true);

    const priceValue = parseFloat(form.price);
    const stockValue = parseInt(form.stock, 10);
    const categoryIdValue = form.category_id ? parseInt(form.category_id, 10) : null;

    if (Number.isNaN(priceValue) || Number.isNaN(stockValue)) {
      setError('Price and stock must be valid numbers.');
      setSubmitLoading(false);
      return;
    }

    if (!categoryIdValue) {
      setError('Please select a category.');
      setSubmitLoading(false);
      return;
    }

    try {
      await api.put(`/books/${params.id}`, {
        title: form.title.trim(),
        author: form.author.trim(),
        price: priceValue,
        stock: stockValue,
        isbn: form.isbn.trim(),
        description: form.description.trim(),
        category_id: categoryIdValue,
      });
      router.push('/dashboard/books');
    } catch (err) {
      console.error(err);
      setError('Could not update the book. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this book?');
    if (!confirmDelete) {
      return;
    }

    setDeleteLoading(true);
    setError(null);
    try {
      await api.delete(`/books/${params.id}`);
      router.push('/dashboard/books');
    } catch (err) {
      console.error(err);
      setError('Failed to delete the book. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <Protected>
        <section className="books-page">
          <p className="muted-text">Loading book details…</p>
        </section>
      </Protected>
    );
  }

  return (
    <Protected>
      <section className="books-page">
        <header className="books-header">
          <div>
            <h2>Edit Book</h2>
            <p className="muted-text">Update the information for this book or remove it from the catalog.</p>
          </div>
          <Link className="btn btn-secondary" href="/dashboard/books">
            Back to list
          </Link>
        </header>

        {error ? <p className="error-message">{error}</p> : null}

        <form className="books-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="form-control">
              <span>Title</span>
              <input type="text" value={form.title} onChange={handleChange('title')} required />
            </label>
            <label className="form-control">
              <span>Author</span>
              <input type="text" value={form.author} onChange={handleChange('author')} required />
            </label>
            <label className="form-control">
              <span>Price</span>
              <input type="number" step="0.01" value={form.price} onChange={handleChange('price')} required />
            </label>
            <label className="form-control">
              <span>Stock</span>
              <input type="number" min="0" value={form.stock} onChange={handleChange('stock')} required />
            </label>
            <label className="form-control">
              <span>ISBN</span>
              <input type="text" value={form.isbn} onChange={handleChange('isbn')} />
            </label>
            <label className="form-control">
              <span>Category</span>
              <select value={form.category_id} onChange={handleChange('category_id')} required disabled={loadingCategories}>
                <option value="">Select category</option>
                {categories.map((category: Category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="form-control">
            <span>Description</span>
            <textarea rows={4} value={form.description} onChange={handleChange('description')} />
          </label>

          <div className="form-actions">
            <button className="btn btn-danger" type="button" onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading ? 'Deleting…' : 'Delete'}
            </button>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem' }}>
              <button className="btn btn-secondary" type="button" onClick={() => router.push('/dashboard/books')}>
                Cancel
              </button>
              <button className="btn btn-primary" type="submit" disabled={submitLoading || loadingCategories}>
                {submitLoading ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </section>
    </Protected>
  );
}
