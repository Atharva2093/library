'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import Protected from '../../../components/Protected';
import api from '../../../lib/api';

import './style.css';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchCustomers = useCallback(async (showLoader: boolean = true) => {
    if (showLoader) {
      setLoading(true);
    }
    setError(null);
    try {
      const response = await api.get<Customer[]>('/customers/');
      setCustomers(response.data ?? []);
    } catch (err) {
      console.error(err);
      setError('Unable to load customers. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCustomers();
  }, [fetchCustomers]);

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm('Delete this customer record?');
    if (!confirmDelete) {
      return;
    }

    setDeletingId(id);
    setError(null);
    try {
      await api.delete(`/customers/${id}`);
      await fetchCustomers(false);
    } catch (err) {
      console.error(err);
      setError('Failed to delete the customer. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Protected>
      <section className="customers-page">
        <header className="customers-header">
          <div>
            <h2>Customers</h2>
            <p className="muted-text">Manage customer contact information for orders and outreach.</p>
          </div>
          <Link className="btn btn-primary" href="/dashboard/customers/new">
            Add Customer
          </Link>
        </header>

        {error ? <p className="error-message">{error}</p> : null}

        {loading ? (
          <p className="muted-text">Loading customers…</p>
        ) : customers.length ? (
          <div className="table-wrapper">
            <table className="customers-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer: Customer) => (
                  <tr key={customer.id}>
                    <td>{customer.id}</td>
                    <td>{customer.name}</td>
                    <td>{customer.email}</td>
                    <td>{customer.phone ?? '—'}</td>
                    <td>
                      <div className="customers-actions">
                        <Link className="btn btn-secondary" href={`/dashboard/customers/${customer.id}`}>
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => handleDelete(customer.id)}
                          disabled={deletingId === customer.id}
                        >
                          {deletingId === customer.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted-text">No customers found. Add your first customer to begin.</p>
        )}
      </section>
    </Protected>
  );
}
