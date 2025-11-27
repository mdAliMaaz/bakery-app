'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navbar from '@/components/ui/Navbar';
import PremiumModal from '@/components/ui/PremiumModal';
import PremiumButton from '@/components/forms/PremiumButton';
import PremiumInput from '@/components/forms/PremiumInput';
import PremiumSelect from '@/components/forms/PremiumSelect';
import PremiumTable from '@/components/tables/PremiumTable';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import OrderCharts from '@/components/charts/OrderCharts';
import { Plus, X } from 'lucide-react';
import { formatINR } from '@/lib/utils/currency';

interface Order {
    _id: string;
    orderNumber: string;
    customer: {
        name: string;
        phoneNumber: string;
        address?: string;
        email?: string;
    };
    items: {
        recipe: { _id: string; name: string };
        quantity: number;
        unitPrice: number;
        lineTotal: number;
    }[];
    totalIngredients: {
        inventoryItem: { name: string; currentStock: number };
        quantity: number;
        unit: string;
    }[];
    status: string;
    orderDate: string;
    deliveryDate?: string;
    notes?: string;
    itemsTotal?: number;
    currency?: string;
}

interface Recipe {
    _id: string;
    name: string;
    standardUnit: string;
}

const statusOptions = [
    'Draft',
    'Ingredients Allocated',
    'In Production',
    'Ready for Dispatch',
    'Dispatched',
    'Delivered',
    'Cancelled',
];

const statusColors: Record<string, { bg: string; text: string }> = {
    'Draft': { bg: 'bg-muted', text: 'text-muted-foreground' },
    'Ingredients Allocated': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-200' },
    'In Production': { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-200' },
    'Ready for Dispatch': { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-200' },
    'Dispatched': { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-800 dark:text-indigo-200' },
    'Delivered': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-200' },
    'Cancelled': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-200' },
};

export default function OrdersPage() {
    const { accessToken } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const [formData, setFormData] = useState({
        customer: { name: '', phoneNumber: '', address: '', email: '' },
        items: [{ recipe: '', quantity: 1 }],
        deliveryDate: '',
        notes: '',
    });

    const [statusUpdate, setStatusUpdate] = useState({ status: '', notes: '' });

    const fetchOrders = async () => {
        try {
            const response = await fetch('/api/orders', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const data = await response.json();
            setOrders(data.orders || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const fetchRecipes = async () => {
        try {
            const response = await fetch('/api/recipes', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const data = await response.json();
            setRecipes(data.recipes || []);
        } catch (error) {
            console.error('Error fetching recipes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (accessToken) {
            fetchOrders();
            fetchRecipes();
        }
    }, [accessToken]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setShowModal(false);
                resetForm();
                fetchOrders();
            } else {
                const error = await response.json();
                alert(error.error || 'Operation failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Operation failed');
        }
    };

    const handleStatusUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedOrder) return;

        try {
            const response = await fetch(`/api/orders/${selectedOrder._id}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(statusUpdate),
            });

            if (response.ok) {
                setShowStatusModal(false);
                setStatusUpdate({ status: '', notes: '' });
                setSelectedOrder(null);
                fetchOrders();
            } else {
                const error = await response.json();
                alert(error.error || 'Status update failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Status update failed');
        }
    };

    const viewOrderDetails = (order: Order) => {
        setSelectedOrder(order);
        setShowDetailsModal(true);
    };

    const updateOrderStatus = (order: Order) => {
        setSelectedOrder(order);
        setStatusUpdate({ status: order.status, notes: '' });
        setShowStatusModal(true);
    };

    const resetForm = () => {
        setFormData({
            customer: { name: '', phoneNumber: '', address: '', email: '' },
            items: [{ recipe: '', quantity: 1 }],
            deliveryDate: '',
            notes: '',
        });
    };

    const addOrderItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { recipe: '', quantity: 1 }],
        });
    };

    const removeOrderItem = (index: number) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const updateOrderItem = (index: number, field: string, value: any) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData({ ...formData, items: newItems });
    };

    // Get order analytics for charts
    const ordersByStatus = Object.entries(
        orders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)
    ).map(([status, count]) => ({ _id: status, count }));

    const ordersByRecipe = Object.entries(
        orders.reduce((acc, order) => {
            order.items.forEach((item) => {
                acc[item.recipe.name] = (acc[item.recipe.name] || 0) + item.quantity;
            });
            return acc;
        }, {} as Record<string, number>)
    ).map(([recipe, count]) => ({ recipe, count }));

    const orderTrends = Object.entries(
        orders.reduce((acc, order) => {
            const date = new Date(order.orderDate).toLocaleDateString();
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)
    ).map(([date, count]) => ({ date, count }));

    const columns = [
        {
            key: 'orderNumber',
            header: 'Order #',
            render: (order: Order) => (
                <span className="font-medium text-foreground">{order.orderNumber}</span>
            ),
        },
        {
            key: 'customer',
            header: 'Customer',
            render: (order: Order) => (
                <div>
                    <div className="font-medium text-foreground">{order.customer.name}</div>
                    <div className="text-sm text-muted-foreground">{order.customer.phoneNumber}</div>
                </div>
            ),
        },
        {
            key: 'items',
            header: 'Items',
            render: (order: Order) => (
                <span className="text-foreground">{order.items.length} item(s)</span>
            ),
        },
        {
            key: 'total',
            header: 'Total',
            render: (order: Order) => (
                <span className="font-semibold text-foreground">
                    {formatINR(order.itemsTotal ?? order.items.reduce((sum, item) => sum + (item.lineTotal || 0), 0))}
                </span>
            ),
        },
        {
            key: 'orderDate',
            header: 'Order Date',
            render: (order: Order) => (
                <span className="text-foreground">{new Date(order.orderDate).toLocaleDateString()}</span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (order: Order) => {
                const colors = statusColors[order.status] || statusColors['Draft'];
                return (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colors.bg} ${colors.text}`}>
                        {order.status}
                    </span>
                );
            },
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (order: Order) => (
                <div className="flex space-x-2">
                    <PremiumButton
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            viewOrderDetails(order);
                        }}
                    >
                        View
                    </PremiumButton>
                    <PremiumButton
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            updateOrderStatus(order);
                        }}
                    >
                        Update
                    </PremiumButton>
                </div>
            ),
        },
    ];

    return (
        <ProtectedRoute allowedRoles={['Admin', 'Staff', 'Viewer']}>
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 animate-slide-up">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                                    Order Management
                                </h1>
                                <p className="text-muted-foreground">Create and manage customer orders</p>
                            </div>
                            <PremiumButton
                                onClick={() => {
                                    resetForm();
                                    setShowModal(true);
                                }}
                                leftIcon={<Plus className="w-4 h-4" />}
                            >
                                Create New Order
                            </PremiumButton>
                        </div>
                    </div>

                    {/* Order Analytics Charts */}
                    {!loading && orders.length > 0 && (
                        <div className="mb-8">
                            <OrderCharts
                                ordersByStatus={ordersByStatus}
                                orderTrends={orderTrends}
                                ordersByRecipe={ordersByRecipe}
                            />
                        </div>
                    )}

                    {/* Table */}
                    {loading ? (
                        <TableSkeleton rows={5} columns={7} />
                    ) : (
                        <PremiumTable
                            data={orders}
                            columns={columns}
                            keyExtractor={(order) => order._id}
                            emptyMessage="No orders found. Create your first order to get started."
                        />
                    )}
                </div>

                {/* Create Order Modal */}
                <PremiumModal
                    isOpen={showModal}
                    onClose={() => {
                        setShowModal(false);
                        resetForm();
                    }}
                    title="Create New Order"
                    size="lg"
                >
                    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                        <div className="space-y-4">
                            <h4 className="font-semibold text-foreground">Customer Details</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <PremiumInput
                                    label="Customer Name"
                                    type="text"
                                    required
                                    value={formData.customer.name}
                                    onChange={(e) => setFormData({ ...formData, customer: { ...formData.customer, name: e.target.value } })}
                                />
                                <PremiumInput
                                    label="Phone Number"
                                    type="tel"
                                    required
                                    value={formData.customer.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, customer: { ...formData.customer, phoneNumber: e.target.value } })}
                                />
                            </div>
                            <PremiumInput
                                label="Address"
                                type="text"
                                value={formData.customer.address}
                                onChange={(e) => setFormData({ ...formData, customer: { ...formData.customer, address: e.target.value } })}
                            />
                            <PremiumInput
                                label="Email"
                                type="email"
                                value={formData.customer.email}
                                onChange={(e) => setFormData({ ...formData, customer: { ...formData.customer, email: e.target.value } })}
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold text-foreground">Order Items</h4>
                                <PremiumButton
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addOrderItem}
                                    leftIcon={<Plus className="w-4 h-4" />}
                                >
                                    Add Item
                                </PremiumButton>
                            </div>
                            {formData.items.map((item, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <PremiumSelect
                                        value={item.recipe}
                                        onChange={(e) => updateOrderItem(index, 'recipe', e.target.value)}
                                        options={[
                                            { value: '', label: 'Select Recipe' },
                                            ...recipes.map((r) => ({ value: r._id, label: r.name })),
                                        ]}
                                        className="flex-1"
                                    />
                                    <PremiumInput
                                        type="number"
                                        required
                                        min="1"
                                        placeholder="Quantity"
                                        value={item.quantity}
                                        onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value))}
                                        className="w-24"
                                    />
                                    {formData.items.length > 1 && (
                                        <PremiumButton
                                            type="button"
                                            variant="danger"
                                            size="sm"
                                            onClick={() => removeOrderItem(index)}
                                        >
                                            <X className="w-4 h-4" />
                                        </PremiumButton>
                                    )}
                                </div>
                            ))}
                        </div>

                        <PremiumInput
                            label="Delivery Date"
                            type="date"
                            value={formData.deliveryDate}
                            onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                        />

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Notes</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={2}
                                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div className="flex space-x-2 pt-4">
                            <PremiumButton type="submit" className="flex-1">
                                Create Order
                            </PremiumButton>
                            <PremiumButton
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}
                                className="flex-1"
                            >
                                Cancel
                            </PremiumButton>
                        </div>
                    </form>
                </PremiumModal>

                {/* Order Details Modal */}
                <PremiumModal
                    isOpen={showDetailsModal}
                    onClose={() => {
                        setShowDetailsModal(false);
                        setSelectedOrder(null);
                    }}
                    title={`Order Details - ${selectedOrder?.orderNumber || ''}`}
                    size="lg"
                >
                    {selectedOrder && (
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-foreground mb-2">Customer Information</h4>
                                <div className="bg-muted p-4 rounded-lg">
                                    <p className="text-foreground"><span className="font-medium">Name:</span> {selectedOrder.customer.name}</p>
                                    <p className="text-foreground"><span className="font-medium">Phone:</span> {selectedOrder.customer.phoneNumber}</p>
                                    {selectedOrder.customer.address && (
                                        <p className="text-foreground"><span className="font-medium">Address:</span> {selectedOrder.customer.address}</p>
                                    )}
                                    {selectedOrder.customer.email && (
                                        <p className="text-foreground"><span className="font-medium">Email:</span> {selectedOrder.customer.email}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold text-foreground mb-2">Order Items</h4>
                                <div className="bg-muted p-4 rounded-lg">
                                    <ul className="space-y-2">
                                        {selectedOrder.items.map((item, idx) => (
                                            <li key={idx} className="text-foreground">
                                                {item.recipe.name} — Qty: {item.quantity} × {formatINR(item.unitPrice || 0)} ={' '}
                                                <span className="font-semibold">{formatINR(item.lineTotal || 0)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="border-t border-border mt-4 pt-2 flex justify-between text-sm text-foreground">
                                        <span className="font-semibold">Order Total</span>
                                        <span className="font-semibold">
                                            {formatINR(
                                                selectedOrder.itemsTotal ??
                                                selectedOrder.items.reduce((sum, item) => sum + (item.lineTotal || 0), 0)
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold text-foreground mb-2">Required Ingredients</h4>
                                <div className="bg-muted p-4 rounded-lg">
                                    <ul className="space-y-2">
                                        {selectedOrder.totalIngredients.map((ing, idx) => (
                                            <li
                                                key={idx}
                                                className={ing.inventoryItem.currentStock < ing.quantity ? 'text-red-600 dark:text-red-400' : 'text-foreground'}
                                            >
                                                {ing.inventoryItem.name}: {ing.quantity} {ing.unit}
                                                {ing.inventoryItem.currentStock < ing.quantity && ' (Insufficient stock!)'}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold text-foreground mb-2">Order Status</h4>
                                <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${statusColors[selectedOrder.status]?.bg || ''} ${statusColors[selectedOrder.status]?.text || ''}`}>
                                    {selectedOrder.status}
                                </span>
                            </div>

                            {selectedOrder.notes && (
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">Notes</h4>
                                    <p className="text-foreground">{selectedOrder.notes}</p>
                                </div>
                            )}
                        </div>
                    )}
                </PremiumModal>

                {/* Status Update Modal */}
                <PremiumModal
                    isOpen={showStatusModal}
                    onClose={() => {
                        setShowStatusModal(false);
                        setStatusUpdate({ status: '', notes: '' });
                        setSelectedOrder(null);
                    }}
                    title="Update Order Status"
                    size="md"
                >
                    <form onSubmit={handleStatusUpdate} className="space-y-4">
                        <PremiumSelect
                            label="New Status"
                            required
                            value={statusUpdate.status}
                            onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                            options={statusOptions.map((s) => ({ value: s, label: s }))}
                        />
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Notes (Optional)</label>
                            <textarea
                                value={statusUpdate.notes}
                                onChange={(e) => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div className="flex space-x-2 pt-4">
                            <PremiumButton type="submit" className="flex-1">
                                Update Status
                            </PremiumButton>
                            <PremiumButton
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowStatusModal(false);
                                    setStatusUpdate({ status: '', notes: '' });
                                    setSelectedOrder(null);
                                }}
                                className="flex-1"
                            >
                                Cancel
                            </PremiumButton>
                        </div>
                    </form>
                </PremiumModal>
            </div>
        </ProtectedRoute>
    );
}