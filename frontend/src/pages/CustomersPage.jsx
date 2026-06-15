import { Pencil, Plus, Trash2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { getErrorMessage } from '../api/client';
import { customersApi } from '../api/resources';
import { EmptyState, ErrorState, LoadingState } from '../components/DataState';
import { PageHeader } from '../components/PageHeader';
import { Pagination } from '../components/Pagination';
import { useToast } from '../components/Toast';

const emptyForm = { name: '', email: '', phone: '' };

export function CustomersPage() {
  const toast = useToast();
  const [customers, setCustomers] = useState({ items: [], total: 0, page: 1, size: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  function load() {
    setLoading(true);
    customersApi
      .list({ page, size: 10 })
      .then(setCustomers)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, [page]);

  function startEdit(customer) {
    setEditing(customer);
    setForm({ name: customer.name, email: customer.email, phone: customer.phone || '' });
  }

  function resetForm() {
    setEditing(null);
    setForm(emptyForm);
  }

  async function submit(event) {
    event.preventDefault();
    try {
      if (editing) {
        await customersApi.update(editing.id, form);
        toast.notify('Customer updated');
      } else {
        await customersApi.create(form);
        toast.notify('Customer created');
      }
      resetForm();
      load();
    } catch (err) {
      toast.notify(getErrorMessage(err), 'error');
    }
  }

  async function remove(customer) {
    if (!confirm(`Delete ${customer.name}?`)) return;
    try {
      await customersApi.remove(customer.id);
      toast.notify('Customer deleted');
      load();
    } catch (err) {
      toast.notify(getErrorMessage(err), 'error');
    }
  }

  return (
    <section>
      <PageHeader title="Customers" />
      <div className="work-grid">
        <form className="panel form-panel" onSubmit={submit}>
          <h2>{editing ? 'Edit Customer' : 'Add Customer'}</h2>
          <input required placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <input required type="email" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <input placeholder="Phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          <div className="button-row">
            <button className="primary-button" type="submit"><Plus size={18} />{editing ? 'Update' : 'Create'}</button>
            {editing ? <button className="secondary-button" type="button" onClick={resetForm}><X size={18} />Cancel</button> : null}
          </div>
        </form>
        <div className="panel table-panel">
          {loading ? <LoadingState label="Loading customers" /> : error ? <ErrorState message={error} /> : customers.items.length === 0 ? <EmptyState message="No customers found." /> : (
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th></th></tr></thead>
              <tbody>
                {customers.items.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.name}</td>
                    <td>{customer.email}</td>
                    <td>{customer.phone || '-'}</td>
                    <td className="row-actions">
                      <button className="icon-button" title="Edit customer" onClick={() => startEdit(customer)}><Pencil size={16} /></button>
                      <button className="icon-button danger" title="Delete customer" onClick={() => remove(customer)}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <Pagination page={customers.page} size={customers.size} total={customers.total} onPageChange={setPage} />
        </div>
      </div>
    </section>
  );
}
