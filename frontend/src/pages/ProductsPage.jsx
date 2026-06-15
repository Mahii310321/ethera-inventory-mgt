import { Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { getErrorMessage } from '../api/client';
import { productsApi } from '../api/resources';
import { EmptyState, ErrorState, LoadingState } from '../components/DataState';
import { PageHeader } from '../components/PageHeader';
import { Pagination } from '../components/Pagination';
import { useToast } from '../components/Toast';

const emptyForm = { name: '', sku: '', price: '', stock_quantity: '' };

export function ProductsPage() {
  const toast = useToast();
  const [products, setProducts] = useState({ items: [], total: 0, page: 1, size: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const params = useMemo(() => ({ page, size: 10, search: search || undefined }), [page, search]);

  function load() {
    setLoading(true);
    productsApi
      .list(params)
      .then(setProducts)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, [params]);

  function startEdit(product) {
    setEditing(product);
    setForm({ name: product.name, sku: product.sku, price: product.price, stock_quantity: product.stock_quantity });
  }

  function resetForm() {
    setEditing(null);
    setForm(emptyForm);
  }

  async function submit(event) {
    event.preventDefault();
    const payload = { ...form, price: Number(form.price), stock_quantity: Number(form.stock_quantity) };
    try {
      if (editing) {
        await productsApi.update(editing.id, payload);
        toast.notify('Product updated');
      } else {
        await productsApi.create(payload);
        toast.notify('Product created');
      }
      resetForm();
      load();
    } catch (err) {
      toast.notify(getErrorMessage(err), 'error');
    }
  }

  async function remove(product) {
    if (!confirm(`Delete ${product.name}?`)) return;
    try {
      await productsApi.remove(product.id);
      toast.notify('Product deleted');
      load();
    } catch (err) {
      toast.notify(getErrorMessage(err), 'error');
    }
  }

  return (
    <section>
      <PageHeader
        title="Products"
        actions={
          <label className="search-field">
            <Search size={18} />
            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search name or SKU" />
          </label>
        }
      />
      <div className="work-grid">
        <form className="panel form-panel" onSubmit={submit}>
          <h2>{editing ? 'Edit Product' : 'Add Product'}</h2>
          <input required placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <input required placeholder="SKU" value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value })} />
          <input required type="number" min="0.01" step="0.01" placeholder="Price" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} />
          <input required type="number" min="0" step="1" placeholder="Stock" value={form.stock_quantity} onChange={(event) => setForm({ ...form, stock_quantity: event.target.value })} />
          <div className="button-row">
            <button className="primary-button" type="submit"><Plus size={18} />{editing ? 'Update' : 'Create'}</button>
            {editing ? <button className="secondary-button" type="button" onClick={resetForm}><X size={18} />Cancel</button> : null}
          </div>
        </form>
        <div className="panel table-panel">
          {loading ? <LoadingState label="Loading products" /> : error ? <ErrorState message={error} /> : products.items.length === 0 ? <EmptyState message="No products found." /> : (
            <table>
              <thead><tr><th>Name</th><th>SKU</th><th>Price</th><th>Stock</th><th></th></tr></thead>
              <tbody>
                {products.items.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.sku}</td>
                    <td>${Number(product.price).toFixed(2)}</td>
                    <td>{product.stock_quantity}</td>
                    <td className="row-actions">
                      <button className="icon-button" title="Edit product" onClick={() => startEdit(product)}><Pencil size={16} /></button>
                      <button className="icon-button danger" title="Delete product" onClick={() => remove(product)}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <Pagination page={products.page} size={products.size} total={products.total} onPageChange={setPage} />
        </div>
      </div>
    </section>
  );
}
