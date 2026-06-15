import { Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { getErrorMessage } from '../api/client';
import { customersApi, ordersApi, productsApi } from '../api/resources';
import { EmptyState, ErrorState, LoadingState } from '../components/DataState';
import { PageHeader } from '../components/PageHeader';
import { Pagination } from '../components/Pagination';
import { useToast } from '../components/Toast';

export function OrdersPage() {
  const toast = useToast();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState({ items: [], total: 0, page: 1, size: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);

  function loadOrders() {
    return ordersApi.list({ page, size: 10, status: status || undefined }).then(setOrders);
  }

  useEffect(() => {
    setLoading(true);
    Promise.all([customersApi.list({ page: 1, size: 100 }), productsApi.list({ page: 1, size: 100 }), loadOrders()])
      .then(([customerPage, productPage]) => {
        setCustomers(customerPage.items);
        setProducts(productPage.items);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [page, status]);

  const total = useMemo(
    () =>
      items.reduce((sum, item) => {
        const product = products.find((candidate) => candidate.id === item.product_id);
        return sum + (product ? Number(product.price) * Number(item.quantity || 0) : 0);
      }, 0),
    [items, products]
  );

  function updateItem(index, patch) {
    setItems((current) => current.map((item, currentIndex) => (currentIndex === index ? { ...item, ...patch } : item)));
  }

  function addItem() {
    setItems((current) => [...current, { product_id: '', quantity: 1 }]);
  }

  function removeItem(index) {
    setItems((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  async function submit(event) {
    event.preventDefault();
    try {
      await ordersApi.create({
        customer_id: customerId,
        items: items.map((item) => ({ product_id: item.product_id, quantity: Number(item.quantity) })),
      });
      toast.notify('Order created');
      setItems([{ product_id: '', quantity: 1 }]);
      await Promise.all([productsApi.list({ page: 1, size: 100 }).then((pageData) => setProducts(pageData.items)), loadOrders()]);
    } catch (err) {
      toast.notify(getErrorMessage(err), 'error');
    }
  }

  if (loading) return <LoadingState label="Loading orders" />;
  if (error) return <ErrorState message={error} />;

  return (
    <section>
      <PageHeader
        title="Orders"
        actions={
          <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        }
      />
      <div className="work-grid">
        <form className="panel form-panel order-form" onSubmit={submit}>
          <h2>Create Order</h2>
          <select required value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
            <option value="">Select customer</option>
            {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
          </select>
          {items.map((item, index) => (
            <div className="order-item-row" key={index}>
              <select required value={item.product_id} onChange={(event) => updateItem(index, { product_id: event.target.value })}>
                <option value="">Select product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>{product.name} ({product.stock_quantity} in stock)</option>
                ))}
              </select>
              <input required type="number" min="1" value={item.quantity} onChange={(event) => updateItem(index, { quantity: event.target.value })} />
              <button className="icon-button danger" title="Remove item" type="button" disabled={items.length === 1} onClick={() => removeItem(index)}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button className="secondary-button" type="button" onClick={addItem}><Plus size={18} />Add Item</button>
          <div className="order-total">
            <span>Total Amount</span>
            <strong>${total.toFixed(2)}</strong>
          </div>
          <button className="primary-button" type="submit"><Plus size={18} />Create Order</button>
        </form>
        <div className="panel table-panel">
          {orders.items.length === 0 ? <EmptyState message="No orders found." /> : (
            <table>
              <thead><tr><th>Customer</th><th>Status</th><th>Items</th><th>Total</th><th>Created</th></tr></thead>
              <tbody>
                {orders.items.map((order) => (
                  <tr key={order.id}>
                    <td>{order.customer?.name || '-'}</td>
                    <td><span className={`status-pill ${order.status.toLowerCase()}`}>{order.status}</span></td>
                    <td>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                    <td>${Number(order.total_amount).toFixed(2)}</td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <Pagination page={orders.page} size={orders.size} total={orders.total} onPageChange={setPage} />
        </div>
      </div>
    </section>
  );
}
