'use client';

import Link from 'next/link';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AxiosError } from 'axios';

import Protected from '../../../../components/Protected';
import api from '../../../../lib/api';
import type { Customer } from '../../../../lib/types';

import '../style.css';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface CustomerResponse {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
}

interface EditCustomerPageProps {
  params: {
    id: string;
  };
}

export default function EditCustomerPage({ params }: EditCustomerPageProps) {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState<boolean>(true);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      setError(null);
      try {
        const customer = await api.get<Customer>(`/customers/${params.id}`);
        setForm({
          name: customer?.name ?? '',
          email: customer?.email ?? '',
          phone: customer?.phone ?? '',
        });
      } catch (err) {
        console.error(err);
        setError('Unable to load the customer. It may have been removed.');
      } finally {
        setLoading(false);
      }
    };

    void fetchCustomer();
  }, [params.id]);

  const handleChange =
    (field: 'name' | 'email' | 'phone') => (event: ChangeEvent<HTMLInputElement>) => {
      setForm((prev: typeof form) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }

    if (!emailPattern.test(form.email.trim())) {
      setError('Enter a valid email address.');
      return;
    }

    setSubmitLoading(true);

    try {
      await api.put(`/customers/${params.id}`, {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
      });
      router.push('/dashboard/customers');
    } catch (err) {
      console.error(err);
      const axiosError = err as AxiosError<{ detail?: string }>;
      if (axiosError.response?.status === 409) {
        setError('A customer with this email already exists.');
      } else {
        setError('Unable to update the customer. Please try again.');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm('Delete this customer record?');
    if (!confirmDelete) {
      return;
    }

    setDeleteLoading(true);
    setError(null);
    try {
      await api.delete(`/customers/${params.id}`);
      router.push('/dashboard/customers');
    } catch (err) {
      console.error(err);
      setError('Failed to delete the customer. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <Protected>
        <section className="customers-page">
          <p className="muted-text">Loading customer…</p>
        </section>
      </Protected>
    );
  }

  return (
    <Protected>
      <section className="customers-page">
        <header className="customers-header">
          <div>
            <h2>Edit Customer</h2>
            <p className="muted-text">
              Update customer contact information or remove them from the list.
            </p>
          </div>
          <Link className="btn btn-secondary" href="/dashboard/customers">
            Back to list
          </Link>
        </header>

        {error ? <p className="error-message">{error}</p> : null}

        <form className="customers-form" onSubmit={handleSubmit}>
          <label className="form-control">
            <span>Name</span>
            <input type="text" value={form.name} onChange={handleChange('name')} required />
          </label>

          <label className="form-control">
            <span>Email</span>
            <input type="email" value={form.email} onChange={handleChange('email')} required />
          </label>

          <label className="form-control">
            <span>Phone</span>
            <input
              type="tel"
              value={form.phone}
              onChange={handleChange('phone')}
              placeholder="Optional"
            />
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
                onClick={() => router.push('/dashboard/customers')}
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
