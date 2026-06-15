import { AlertTriangle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { getErrorMessage } from '../api/client';
import { inventoryApi } from '../api/resources';
import { EmptyState, ErrorState, LoadingState } from '../components/DataState';
import { PageHeader } from '../components/PageHeader';

export function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    inventoryApi
      .list()
      .then(setInventory)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState label="Loading inventory" />;
  if (error) return <ErrorState message={error} />;

  return (
    <section>
      <PageHeader title="Inventory" />
      <div className="panel table-panel full-width-panel">
        {inventory.length === 0 ? <EmptyState message="No inventory found." /> : (
          <table>
            <thead><tr><th>Product Name</th><th>SKU</th><th>Current Stock</th><th>Alert</th></tr></thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.product_id} className={item.low_stock ? 'low-stock-row' : ''}>
                  <td>{item.name}</td>
                  <td>{item.sku}</td>
                  <td>{item.stock}</td>
                  <td>{item.low_stock ? <span className="low-stock-label"><AlertTriangle size={16} />Low stock</span> : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
