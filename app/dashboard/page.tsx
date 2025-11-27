'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navbar from '@/components/ui/Navbar';
import LoadingSkeleton, { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import PremiumButton from '@/components/forms/PremiumButton';
import InventoryCharts from '@/components/charts/InventoryCharts';
import SalesCharts from '@/components/charts/SalesCharts';
import OrderCharts from '@/components/charts/OrderCharts';
import RecipeSalesCharts from '@/components/charts/RecipeSalesCharts';
import PremiumSelect from '@/components/forms/PremiumSelect';
import { LayoutDashboard, Package, DollarSign, FileText, ChefHat, Hand, AlertTriangle, CheckCircle2 } from 'lucide-react';

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
        sales: Array<{ _id: string; count: number }>;
        salesByRecipe?: Array<{ recipe: string; count: number; revenue: number }>;
    };
    recipes?: {
        performance?: Array<{ name: string; orders: number; revenue: number }>;
    };
}

export default function DashboardPage() {
    const { accessToken, user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('daily');
    const [sseStatus, setSseStatus] = useState('disconnected');
    const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'sales' | 'orders' | 'recipes'>('overview');

    const fetchStats = async () => {
        try {
            const response = await fetch(`/api/dashboard/stats?period=${period}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (accessToken) {
            fetchStats();
        }
    }, [accessToken, period]);

    // SSE Connection for real-time updates
    useEffect(() => {
        if (!accessToken) return;

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
    }, [accessToken]);

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
                <div className="min-h-screen bg-background">
                    <Navbar />
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {[1, 2, 3, 4].map((i) => (
                                <CardSkeleton key={i} />
                            ))}
                        </div>
                        <LoadingSkeleton variant="rectangular" height="400px" />
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (!stats) {
        return (
            <ProtectedRoute allowedRoles={['Admin', 'Staff', 'Viewer']}>
                <div className="min-h-screen bg-background">
                    <Navbar />
                    <div className="flex items-center justify-center h-96">
                        <p className="text-muted-foreground">Failed to load dashboard data</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'inventory', label: 'Inventory', icon: Package },
        { id: 'sales', label: 'Sales', icon: DollarSign },
        { id: 'orders', label: 'Orders', icon: FileText },
        { id: 'recipes', label: 'Recipes', icon: ChefHat },
    ];

    return (
        <ProtectedRoute allowedRoles={['Admin', 'Staff', 'Viewer']}>
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    {/* Hero Section */}
                    <div className="mb-8 animate-slide-up">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                            <div>
                                <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-2">
                                    Welcome back, {user?.name?.split(' ')[0] || 'User'}!
                                    <Hand className="w-8 h-8 text-primary" />
                                </h1>
                                <p className="text-muted-foreground">
                                    Here's what's happening with your restaurant today
                                    {sseStatus === 'connected' && (
                                        <span className="ml-2 inline-flex items-center">
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></span>
                                            <span className="text-green-600 dark:text-green-400 text-sm">Live</span>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-card border border-border rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Inventory</h3>
                                    <Package className="w-6 h-6 text-primary" />
                                </div>
                                <p className="text-3xl font-bold text-foreground">{stats.inventory.total}</p>
                                <p className="text-xs text-muted-foreground mt-2">Items in stock</p>
                            </div>

                            <div className="bg-card border border-border rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Low Stock</h3>
                                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                                </div>
                                <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.inventory.lowStock}</p>
                                <p className="text-xs text-muted-foreground mt-2">Items need attention</p>
                            </div>

                            <div className="bg-card border border-border rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Orders</h3>
                                    <FileText className="w-6 h-6 text-secondary" />
                                </div>
                                <p className="text-3xl font-bold text-foreground">{stats.orders.total}</p>
                                <p className="text-xs text-muted-foreground mt-2">All time orders</p>
                            </div>

                            <div className="bg-card border border-border rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Completed ({period})</h3>
                                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.orders.completedInPeriod}</p>
                                <p className="text-xs text-muted-foreground mt-2">Orders delivered</p>
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
                                                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
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
                                {/* Sales Trend Chart */}
                                <div className="bg-card border border-border rounded-xl p-6 shadow-md">
                                    <h3 className="text-lg font-semibold text-foreground mb-4">Sales Trend (Last 30 Days)</h3>
                                    <SalesCharts
                                        salesData={stats.trends.sales}
                                        salesByRecipe={stats.trends.salesByRecipe}
                                        period={period as any}
                                    />
                                </div>

                                {/* Orders by Status */}
                                <div className="bg-card border border-border rounded-xl p-6 shadow-md">
                                    <h3 className="text-lg font-semibold text-foreground mb-4">Orders by Status</h3>
                                    <OrderCharts
                                        ordersByStatus={stats.orders.byStatus}
                                        orderTrends={stats.orders.trends}
                                        ordersByRecipe={stats.orders.byRecipe}
                                    />
                                </div>

                                {/* Low Stock Alert */}
                                {stats.inventory.lowStock > 0 && (
                                    <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-8">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-1 flex items-center gap-2">
                                                    <AlertTriangle className="w-5 h-5" />
                                                    Low Stock Alert
                                                </h3>
                                                <p className="text-sm text-red-700 dark:text-red-300">
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
                                                <div key={idx} className="bg-card p-4 rounded-lg border border-red-200 dark:border-red-800">
                                                    <p className="font-medium text-foreground">{item.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Current: {item.currentStock} {item.unit} | Threshold: {item.thresholdValue} {item.unit}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Recent Orders */}
                                <div className="bg-card border border-border rounded-xl p-6 shadow-md">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold text-foreground">Recent Orders</h3>
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
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Order #</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Customer</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-card divide-y divide-border">
                                                {stats.orders.recent.map((order) => (
                                                    <tr key={order._id} className="hover:bg-muted/50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{order.orderNumber}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{order.customer.name}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary/10 text-primary">
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
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

                        {activeTab === 'sales' && stats && (
                            <SalesCharts
                                salesData={stats.trends.sales}
                                salesByRecipe={stats.trends.salesByRecipe}
                                period={period as any}
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
                </div>
            </div>
        </ProtectedRoute>
    );
}