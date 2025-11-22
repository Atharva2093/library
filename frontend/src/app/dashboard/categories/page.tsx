'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import Protected from '../../../components/Protected';
import api from '../../../lib/api';

import './style.css';

interface Category {
  id: number;
  name: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchCategories = useCallback(async (showLoader: boolean = true) => {
    if (showLoader) {
      setLoading(true);
    }
    setError(null);
    try {
      const categories = await api.get<Category[]>('/categories/');
      setCategories(categories ?? []);
    } catch (err) {
      console.error(err);
      setError('Unable to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(
      'Delete this category? Related books may need reassignment.'
    );
    if (!confirmDelete) {
      return;
    }

    setDeletingId(id);
    setError(null);
    try {
      await api.delete(`/categories/${id}`);
      await fetchCategories(false);
    } catch (err) {
      console.error(err);
      setError('Failed to delete the category. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Protected>
      <section className="categories-page">
        <header className="categories-header">
          <div>
            <h2>Categories</h2>
            <p className="muted-text">Organize your catalog by managing category names.</p>
          </div>
          <Link className="btn btn-primary" href="/dashboard/categories/new">
            New Category
          </Link>
        </header>

        {error ? <p className="error-message">{error}</p> : null}

        {loading ? (
          <p className="muted-text">Loading categories…</p>
        ) : categories.length ? (
          <div className="table-wrapper">
            <table className="categories-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category: Category) => (
                  <tr key={category.id}>
                    <td>{category.id}</td>
                    <td>{category.name}</td>
                    <td>
                      <div className="categories-actions">
                        <Link
                          className="btn btn-secondary"
                          href={`/dashboard/categories/${category.id}`}
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => handleDelete(category.id)}
                          disabled={deletingId === category.id}
                        >
                          {deletingId === category.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted-text">No categories found. Create your first category to begin.</p>
        )}
      </section>
    </Protected>
  );
}
