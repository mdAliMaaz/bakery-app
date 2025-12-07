'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import LoadingSkeleton, { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import PremiumButton from '@/components/forms/PremiumButton';
import InventoryCharts from '@/components/charts/InventoryCharts';
import OrderCharts from '@/components/charts/OrderCharts';
import PremiumSelect from '@/components/forms/PremiumSelect';
import { LayoutDashboard, Package, FileText, ChefHat, Hand, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface DashboardStats {
    inventory: {
        total: number;
        lowStock: number;
        lowStockItems: Array<{ name: string; currentStock: number; thresholdValue: number; unit: string }>;
        purchaseHistory?: Array<{ date: string; quantity: number; cost: number }>;
    };
    orders: {
        total: number;
        byStatus: Array<{ _id: string; count: number }>;
        inPeriod: number;
        completedInPeriod: number;
        recent: Array<any>;
        trends?: Array<{ date: string; count: number }>;
        byRecipe?: Array<{ recipe: string; count: number }>;
    };
    finishedGoods: {
        total: number;
        stock: Array<{ name: string; currentStock: number; unit: string; lastProducedDate: string }>;
    };
    trends: {
        // Removed sales data
    };
    recipes?: {
        performance?: Array<{ name: string; orders: number; revenue: number }>;
    };
}

export default function DashboardPage() {
    const { accessToken, user, isLoading: authLoading } = useAuth();
    const api = useApi();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('daily');
    const [sseStatus, setSseStatus] = useState('disconnected');
    const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'orders' | 'recipes'>('overview');

    const fetchStats = async () => {
        console.log('fetchStats called, API client configured:', !!api);
        try {
            const data = await api.get(`/api/dashboard/stats?period=${period}`);
            console.log('fetchStats successful:', data);
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && user && accessToken) {
            console.log('Auth ready, calling fetchStats');
            fetchStats();
        } else {
            console.log('Auth not ready yet:', { authLoading, hasUser: !!user, hasToken: !!accessToken });
        }
    }, [period, authLoading, user, accessToken]);

    // SSE Connection for real-time updates
    useEffect(() => {
        if (!authLoading && user && accessToken) {
            console.log('Auth ready, connecting to SSE');
            const eventSource = new EventSource(`/api/sse`, {
                withCredentials: false,
            });

            eventSource.onopen = () => {
                setSseStatus('connected');
                console.log('SSE Connected');
            };

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('SSE Event:', data);

                    if (data.type === 'inventory-update' || data.type === 'low-stock-alert' || data.type === 'order-update') {
                        fetchStats();
                    }
                } catch (error) {
                    console.error('Error parsing SSE data:', error);
                }
            };

            eventSource.onerror = () => {
                setSseStatus('error');
                console.error('SSE Error');
                eventSource.close();
            };

            return () => {
                eventSource.close();
                setSseStatus('disconnected');
            };
        }
    }, [authLoading, user, accessToken]);

    const exportToCSV = (data: any[], filename: string) => {
        if (data.length === 0) {
            alert('No data to export');
            return;
        }

        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
        const csv = `${headers}\n${rows}`;

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const exportLowStockItems = () => {
        if (!stats) return;
        const data = stats.inventory.lowStockItems.map(item => ({
            Name: item.name,
            'Current Stock': item.currentStock,
            'Threshold': item.thresholdValue,
            'Unit': item.unit,
        }));
        exportToCSV(data, 'low_stock_items');
    };

    const exportRecentOrders = () => {
        if (!stats) return;
        const data = stats.orders.recent.map(order => ({
            'Order Number': order.orderNumber,
            'Customer': order.customer.name,
            'Phone': order.customer.phoneNumber,
            'Status': order.status,
            'Order Date': new Date(order.orderDate).toLocaleDateString(),
        }));
        exportToCSV(data, 'recent_orders');
    };

    if (loading) {
        return (
            <ProtectedRoute allowedRoles={['Admin', 'Staff', 'Viewer']}>
                <AppLayout>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {[1, 2, 3, 4].map((i) => (
                                <CardSkeleton key={i} />
                            ))}
                        </div>
                        <LoadingSkeleton variant="rectangular" height="400px" />
                </AppLayout>
            </ProtectedRoute>
        );
    }

    if (!stats) {
        return (
            <ProtectedRoute allowedRoles={['Admin', 'Staff', 'Viewer']}>
                <AppLayout>
                    <div className="flex items-center justify-center h-96">
                        <p className="text-gray-400">Failed to load dashboard data</p>
                    </div>
                </AppLayout>
            </ProtectedRoute>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'inventory', label: 'Inventory', icon: Package },
        { id: 'orders', label: 'Orders', icon: FileText },
        { id: 'recipes', label: 'Recipes', icon: ChefHat },
    ];

    return (
        <ProtectedRoute allowedRoles={['Admin', 'Staff', 'Viewer']}>
            <AppLayout>
                    
                    {/* Hero Section */}
                    <div className="mb-8 relative floating-particles">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                            <div>
                                <h1 className="text-5xl md:text-6xl font-bold gradient-text mb-3 flex items-center gap-3 animate-fade-in">
                                    Welcome back, {user?.name?.split(' ')[0] || 'User'}!
                                    <Hand className="w-8 h-8 text-primary animate-bounce" />
                                </h1>
                                <p className="text-gray-400 text-lg animate-fade-in" style={{ animationDelay: '0.2s' }}>
                                    Here's what's happening with your restaurant today
                                    {sseStatus === 'connected' && (
                                        <span className="ml-2 inline-flex items-center">
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></span>
                                            <span className="text-green-400 text-sm font-semibold">Live</span>
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div className="mt-4 md:mt-0">
                                <PremiumSelect
                                    value={period}
                                    onChange={(e) => setPeriod(e.target.value)}
                                    options={[
                                        { value: 'daily', label: 'Today' },
                                        { value: 'weekly', label: 'Last 7 Days' },
                                        { value: 'monthly', label: 'Last 30 Days' },
                                    ]}
                                    className="w-48"
                                />
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                            <div className="colorful-card p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Inventory</h3>
                                    <Package className="w-6 h-6 text-primary animate-pulse" />
                                </div>
                                <p className="text-4xl md:text-5xl font-bold cyberpunk-text-secondary animate-count-up">{stats.inventory.total}</p>
                                <p className="text-xs text-gray-400 mt-2 font-medium">Items in stock</p>
                            </div>

                            <div className="colorful-card p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-1">Low Stock Alert</h3>
                                    <AlertTriangle className="w-6 h-6 text-red-400 animate-bounce" />
                                </div>
                                <p className="text-4xl md:text-5xl font-bold text-red-400 animate-count-up">{stats.inventory.lowStock}</p>
                                <p className="text-xs text-red-300 mt-2">Items need attention</p>
                            </div>

                            <div className="colorful-card p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-1">Total Orders</h3>
                                    <FileText className="w-6 h-6 text-secondary animate-pulse" />
                                </div>
                                <p className="text-4xl md:text-5xl font-bold cyberpunk-text-primary animate-count-up">{stats.orders.total}</p>
                                <p className="text-xs text-purple-300 mt-2">All time orders</p>
                            </div>

                            <div className="colorful-card p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-1">Completed ({period})</h3>
                                    <CheckCircle2 className="w-6 h-6 text-green-400 animate-pulse" />
                                </div>
                                <p className="text-4xl md:text-5xl font-bold text-green-400 animate-count-up">{stats.orders.completedInPeriod}</p>
                                <p className="text-xs text-green-300 mt-2">Orders delivered</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="mb-6 border-b border-border">
                        <nav className="flex space-x-8">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`
                                            flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                                            ${activeTab === tab.id
                                                ? 'border-primary text-primary'
                                                : 'border-transparent text-gray-300 hover:text-gray-100 hover:border-gray-400'
                                            }
                                        `}
                                    >
                                        <Icon className="w-4 h-4 mr-2" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="animate-fade-in">
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                {/* Orders by Status */}
                                <div className="colorful-card p-8 shadow-xl">
                                    <h3 className="text-xl font-bold text-foreground mb-6">Orders by Status</h3>
                                    <OrderCharts
                                        ordersByStatus={stats.orders.byStatus}
                                        orderTrends={stats.orders.trends}
                                        ordersByRecipe={stats.orders.byRecipe}
                                    />
                                </div>

                                {/* Low Stock Alert */}
                                {stats.inventory.lowStock > 0 && (
                                    <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 border border-red-800 p-8 mb-8 shadow-xl">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-red-200 mb-1 flex items-center gap-2">
                                                    <AlertTriangle className="w-5 h-5" />
                                                    Low Stock Alert
                                                </h3>
                                                <p className="text-sm text-red-300">
                                                    The following items are running low on stock
                                                </p>
                                            </div>
                                            <PremiumButton
                                                variant="danger"
                                                size="sm"
                                                onClick={exportLowStockItems}
                                            >
                                                Export CSV
                                            </PremiumButton>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {stats.inventory.lowStockItems.map((item, idx) => (
                                                <div key={idx} className="bg-card p-4 rounded-xl border border-red-800 shadow-md">
                                                    <p className="font-semibold text-gray-100">{item.name}</p>
                                                    <p className="text-sm text-gray-300 font-medium">
                                                        Current: {item.currentStock} {item.unit} | Threshold: {item.thresholdValue} {item.unit}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Recent Orders */}
                                <div className="colorful-card p-8 shadow-xl">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-gray-100">Recent Orders</h3>
                                        <PremiumButton
                                            variant="outline"
                                            size="sm"
                                            onClick={exportRecentOrders}
                                        >
                                            Export CSV
                                        </PremiumButton>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-border">
                                            <thead className="bg-muted">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase">Order #</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Customer</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-card divide-y divide-border">
                                                {stats.orders.recent.map((order) => (
                                                    <tr key={order._id} className="hover:bg-muted transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-100">{order.orderNumber}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{order.customer.name}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary text-primary-foreground">
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                                                            {new Date(order.orderDate).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'inventory' && stats && (
                            <InventoryCharts
                                inventoryData={stats.inventory}
                                purchaseHistory={stats.inventory.purchaseHistory}
                            />
                        )}


                        {activeTab === 'orders' && stats && (
                            <OrderCharts
                                ordersByStatus={stats.orders.byStatus}
                                orderTrends={stats.orders.trends}
                                ordersByRecipe={stats.orders.byRecipe}
                            />
                        )}

                        {activeTab === 'recipes' && stats && (
                            <RecipeSalesCharts
                                recipePerformance={stats.recipes?.performance}
                            />
                        )}
                    </div>
                </AppLayout>
        </ProtectedRoute>
    );
}