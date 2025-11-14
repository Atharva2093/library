'use client';

import Link from 'next/link';
import { ChangeEvent, FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AxiosError } from 'axios';

import Protected from '../../../../components/Protected';
import api from '../../../../lib/api';

import '../style.css';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function NewCustomerPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (field: 'name' | 'email' | 'phone') => (event: ChangeEvent<HTMLInputElement>) => {
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

    setLoading(true);

    try {
      await api.post('/customers/', {
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
        setError('Unable to create the customer. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Protected>
      <section className="customers-page">
        <header className="customers-header">
          <div>
            <h2>New Customer</h2>
            <p className="muted-text">Add a customer to keep contact details accessible.</p>
          </div>
          <Link className="btn btn-secondary" href="/dashboard/customers">
            Back to list
          </Link>
        </header>

        <form className="customers-form" onSubmit={handleSubmit}>
          {error ? <p className="error-message">{error}</p> : null}

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
            <input type="tel" value={form.phone} onChange={handleChange('phone')} placeholder="Optional" />
          </label>

          <div className="form-actions">
            <button className="btn btn-secondary" type="button" onClick={() => router.push('/dashboard/customers')}>
              Cancel
            </button>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Saving…' : 'Save Customer'}
            </button>
          </div>
        </form>
      </section>
    </Protected>
  );
}
