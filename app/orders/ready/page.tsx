'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import PremiumTable from '@/components/tables/PremiumTable';
import PremiumButton from '@/components/forms/PremiumButton';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { Search } from 'lucide-react';

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
  const api = useApi();
  const [orders, setOrders] = useState<ReadyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter orders based on search query
  const filteredOrders = useMemo(() => {
    return orders.filter(order =>
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.phoneNumber.includes(searchQuery)
    );
  }, [orders, searchQuery]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchReadyOrders = async () => {
    try {
      const data = await api.get('/api/orders?status=Ready%20for%20Dispatch');
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching ready orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      fetchReadyOrders();
  }, []);

  const columns = useMemo(
    () => [
      {
        key: 'orderNumber',
        header: 'Order #',
        render: (order: ReadyOrder) => (
          <span className="font-semibold text-gray-100">
            {order.orderNumber}
          </span>
        ),
      },
      {
        key: 'customer',
        header: 'Customer',
        render: (order: ReadyOrder) => (
          <div>
            <div className="font-semibold text-gray-100">
              {order.customer.name}
            </div>
            <div className="text-sm text-gray-400 font-medium">
              {order.customer.phoneNumber}
            </div>
          </div>
        ),
      },
      {
        key: 'items',
        header: 'Items',
        render: (order: ReadyOrder) => (
          <span className="text-gray-100 font-medium">
            {order.items.length} item(s)
          </span>
        ),
      },
      {
        key: 'orderDate',
        header: 'Order Date',
        render: (order: ReadyOrder) => (
          <span className="text-gray-100 font-medium">
            {new Date(order.orderDate).toLocaleString()}
          </span>
        ),
      },
      {
        key: 'deliveryDate',
        header: 'Delivery ETA',
        render: (order: ReadyOrder) => (
          <span className="text-gray-100 font-medium">
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
                <h1 className="text-4xl font-bold text-indigo-300 mb-2">
                  Ready to Dispatch
                </h1>
                <p className="text-gray-400 font-medium">
                  Orders that are packed and ready for dispatch
                </p>
              </div>
              <PremiumButton onClick={fetchReadyOrders}>
                Refresh
              </PremiumButton>
            </div>

            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by order number, customer name, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border-2 border-gray-600 rounded-xl text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <TableSkeleton rows={5} columns={6} />
          ) : (
            <PremiumTable
              data={filteredOrders}
              columns={columns as any}
              keyExtractor={(order) => order._id}
              emptyMessage="No ready-to-dispatch orders at the moment."
              enablePagination={true}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(newItemsPerPage) => {
                setItemsPerPage(newItemsPerPage);
                setCurrentPage(1);
              }}
              showItemsPerPage={true}
            />
          )}
      </AppLayout>
    </ProtectedRoute>
  );
}


