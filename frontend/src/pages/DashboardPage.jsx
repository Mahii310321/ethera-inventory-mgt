import { Boxes, ClipboardList, DollarSign, Package, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { customersApi, inventoryApi, ordersApi, productsApi } from '../api/resources';
import { ErrorState, LoadingState } from '../components/DataState';
import { PageHeader } from '../components/PageHeader';

function formatCurrency(value) {
  return Number(value || 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="stat-card">
      <Icon size={22} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      productsApi.list({ page: 1, size: 100 }),
      customersApi.list({ page: 1, size: 100 }),
      ordersApi.list({ page: 1, size: 100 }),
      inventoryApi.list(),
    ])
      .then(([products, customers, orders, inventory]) => {
        const inventoryValue = products.items.reduce((sum, product) => sum + Number(product.price) * product.stock_quantity, 0);
        setData({ products, customers, orders, inventory, inventoryValue });
      })
      .catch(() => setError('Unable to load dashboard metrics'));
  }, []);

  if (error) return <ErrorState message={error} />;
  if (!data) return <LoadingState label="Loading dashboard" />;

  const lowStock = data.inventory.filter((item) => item.low_stock);

  return (
    <section>
      <PageHeader title="Dashboard" />
      <div className="stats-grid">
        <StatCard icon={Package} label="Total Products" value={data.products.total} />
        <StatCard icon={Users} label="Total Customers" value={data.customers.total} />
        <StatCard icon={ClipboardList} label="Total Orders" value={data.orders.total} />
        <StatCard icon={DollarSign} label="Inventory Value" value={formatCurrency(data.inventoryValue)} />
      </div>
      <div className="content-grid">
        <section className="panel">
          <h2>Inventory Alerts</h2>
          {lowStock.length === 0 ? (
            <p className="muted">No low stock products.</p>
          ) : (
            <div className="alert-list">
              {lowStock.map((item) => (
                <div className="alert-row" key={item.product_id}>
                  <Boxes size={18} />
                  <span>{item.name}</span>
                  <strong>{item.stock}</strong>
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="panel">
          <h2>Recent Orders</h2>
          <div className="compact-list">
            {data.orders.items.slice(0, 5).map((order) => (
              <div key={order.id}>
                <span>{order.customer?.name || 'Customer'}</span>
                <strong>{formatCurrency(order.total_amount)}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
