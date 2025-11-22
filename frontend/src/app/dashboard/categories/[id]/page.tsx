'use client';

import Link from 'next/link';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AxiosError } from 'axios';

import Protected from '../../../../components/Protected';
import api from '../../../../lib/api';
import type { Category } from '../../../../lib/types';

import '../style.css';

interface CategoryResponse {
  id: number;
  name: string;
}

interface EditCategoryPageProps {
  params: {
    id: string;
  };
}

export default function EditCategoryPage({ params }: EditCategoryPageProps) {
  const router = useRouter();
  const [name, setName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategory = async () => {
      setError(null);
      try {
        const category = await api.get<Category>(`/categories/${params.id}`);
        setName(category?.name ?? '');
      } catch (err) {
        console.error(err);
        setError('Unable to load the category. It may have been removed.');
      } finally {
        setLoading(false);
      }
    };

    void fetchCategory();
  }, [params.id]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitLoading(true);

    try {
      await api.put(`/categories/${params.id}`, { name: name.trim() });
      router.push('/dashboard/categories');
    } catch (err) {
      console.error(err);
      const axiosError = err as AxiosError<{ detail?: string }>;
      if (axiosError.response?.status === 409) {
        setError('A category with this name already exists.');
      } else {
        setError('Unable to update the category. Please try again.');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      'Delete this category? There may be books assigned to it.'
    );
    if (!confirmDelete) {
      return;
    }

    setDeleteLoading(true);
    setError(null);
    try {
      await api.delete(`/categories/${params.id}`);
      router.push('/dashboard/categories');
    } catch (err) {
      console.error(err);
      setError('Failed to delete the category. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <Protected>
        <section className="categories-page">
          <p className="muted-text">Loading category…</p>
        </section>
      </Protected>
    );
  }

  return (
    <Protected>
      <section className="categories-page">
        <header className="categories-header">
          <div>
            <h2>Edit Category</h2>
            <p className="muted-text">Rename or remove this category from your store.</p>
          </div>
          <Link className="btn btn-secondary" href="/dashboard/categories">
            Back to list
          </Link>
        </header>

        {error ? <p className="error-message">{error}</p> : null}

        <form className="categories-form" onSubmit={handleSubmit}>
          <label className="form-control">
            <span>Name</span>
            <input type="text" value={name} onChange={handleChange} required minLength={2} />
          </label>

          <div className="form-actions">
            <button
              className="btn btn-danger"
              type="button"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Deleting…' : 'Delete'}
            </button>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem' }}>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => router.push('/dashboard/categories')}
              >
                Cancel
              </button>
              <button className="btn btn-primary" type="submit" disabled={submitLoading}>
                {submitLoading ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </section>
    </Protected>
  );
}
