'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import PremiumTable from '@/components/tables/PremiumTable';
import PremiumButton from '@/components/forms/PremiumButton';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';

interface ReadyOrder {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    phoneNumber: string;
  };
  items: {
    recipe: { _id: string; name: string };
    quantity: number;
  }[];
  status: string;
  orderDate: string;
  deliveryDate?: string;
}

export default function ReadyOrdersPage() {
  const { accessToken } = useAuth();
  const [orders, setOrders] = useState<ReadyOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReadyOrders = async () => {
    try {
      const response = await fetch(
        '/api/orders?status=Ready%20for%20Dispatch',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching ready orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchReadyOrders();
    }
  }, [accessToken]);

  const columns = useMemo(
    () => [
      {
        key: 'orderNumber',
        header: 'Order #',
        render: (order: ReadyOrder) => (
          <span className="font-medium text-foreground">
            {order.orderNumber}
          </span>
        ),
      },
      {
        key: 'customer',
        header: 'Customer',
        render: (order: ReadyOrder) => (
          <div>
            <div className="font-medium text-foreground">
              {order.customer.name}
            </div>
            <div className="text-sm text-muted-foreground">
              {order.customer.phoneNumber}
            </div>
          </div>
        ),
      },
      {
        key: 'items',
        header: 'Items',
        render: (order: ReadyOrder) => (
          <span className="text-foreground">
            {order.items.length} item(s)
          </span>
        ),
      },
      {
        key: 'orderDate',
        header: 'Order Date',
        render: (order: ReadyOrder) => (
          <span className="text-foreground">
            {new Date(order.orderDate).toLocaleString()}
          </span>
        ),
      },
      {
        key: 'deliveryDate',
        header: 'Delivery ETA',
        render: (order: ReadyOrder) => (
          <span className="text-foreground">
            {order.deliveryDate
              ? new Date(order.deliveryDate).toLocaleString()
              : '-'}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <ProtectedRoute allowedRoles={['Admin', 'Staff', 'Viewer']}>
      <AppLayout>
          <div className="mb-8 animate-slide-up">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                  Ready to Dispatch
                </h1>
                <p className="text-muted-foreground">
                  Orders that are packed and ready for dispatch
                </p>
              </div>
              <PremiumButton onClick={fetchReadyOrders}>
                Refresh
              </PremiumButton>
            </div>
          </div>

          {loading ? (
            <TableSkeleton rows={5} columns={6} />
          ) : (
            <PremiumTable
              data={orders}
              columns={columns as any}
              keyExtractor={(order) => order._id}
              emptyMessage="No ready-to-dispatch orders at the moment."
            />
          )}
      </AppLayout>
    </ProtectedRoute>
  );
}


