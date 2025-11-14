'use client';

import Link from 'next/link';
import { ChangeEvent, FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AxiosError } from 'axios';

import Protected from '../../../../components/Protected';
import api from '../../../../lib/api';

import '../style.css';

export default function NewCategoryPage() {
  const router = useRouter();
  const [name, setName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post('/categories/', { name: name.trim() });
      router.push('/dashboard/categories');
    } catch (err) {
      console.error(err);
      const axiosError = err as AxiosError<{ detail?: string }>;
      if (axiosError.response?.status === 409) {
        setError('A category with this name already exists. Choose a different name.');
      } else {
        setError('Unable to create the category. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Protected>
      <section className="categories-page">
        <header className="categories-header">
          <div>
            <h2>New Category</h2>
            <p className="muted-text">Add a category to keep your inventory organized.</p>
          </div>
          <Link className="btn btn-secondary" href="/dashboard/categories">
            Back to list
          </Link>
        </header>

        <form className="categories-form" onSubmit={handleSubmit}>
          {error ? <p className="error-message">{error}</p> : null}

          <label className="form-control">
            <span>Name</span>
            <input type="text" value={name} onChange={handleChange} required minLength={2} />
          </label>

          <div className="form-actions">
            <button className="btn btn-secondary" type="button" onClick={() => router.push('/dashboard/categories')}>
              Cancel
            </button>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Saving…' : 'Save Category'}
            </button>
          </div>
        </form>
      </section>
    </Protected>
  );
}
