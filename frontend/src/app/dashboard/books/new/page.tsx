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

interface CreateBookForm {
  title: string;
  author: string;
  price: string;
  stock: string;
  isbn: string;
  description: string;
  category_id: string;
}

const initialFormState: CreateBookForm = {
  title: '',
  author: '',
  price: '',
  stock: '',
  isbn: '',
  description: '',
  category_id: '',
};

export default function NewBookPage() {
  const router = useRouter();
  const [form, setForm] = useState<CreateBookForm>(initialFormState);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setError(null);
      try {
        const response = await api.get<Category[]>('/categories/');
        setCategories(response.data ?? []);
      } catch (err) {
        console.error(err);
        setError('Unable to load categories. Please try again before submitting.');
      } finally {
        setLoadingCategories(false);
      }
    };

    void fetchCategories();
  }, []);

  const handleChange = (field: keyof CreateBookForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev: CreateBookForm) => ({ ...prev, [field]: event.target.value }));
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
      await api.post('/books/', {
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
      setError('Could not create the book. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Protected>
      <section className="books-page">
        <header className="books-header">
          <div>
            <h2>Add Book</h2>
            <p className="muted-text">Create a new book entry for your catalog.</p>
          </div>
          <Link className="btn btn-secondary" href="/dashboard/books">
            Back to list
          </Link>
        </header>

        <form className="books-form" onSubmit={handleSubmit}>
          {error ? <p className="error-message">{error}</p> : null}

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
            <button className="btn btn-secondary" type="button" onClick={() => router.push('/dashboard/books')}>
              Cancel
            </button>
            <button className="btn btn-primary" type="submit" disabled={submitLoading || loadingCategories}>
              {submitLoading ? 'Saving…' : 'Save Book'}
            </button>
          </div>
        </form>
      </section>
    </Protected>
  );
}
