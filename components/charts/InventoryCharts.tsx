'use client';

import { useMemo } from 'react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import PremiumChartContainer from './PremiumChartContainer';

interface InventoryChartsProps {
    inventoryData: {
        total: number;
        lowStock: number;
        lowStockItems: Array<{ name: string; currentStock: number; thresholdValue: number; unit: string }>;
    };
    purchaseHistory?: Array<{ date: string; quantity: number; cost: number }>;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

export default function InventoryCharts({ inventoryData, purchaseHistory }: InventoryChartsProps) {
    const stockLevelsData = useMemo(() => {
        return inventoryData.lowStockItems.map((item) => ({
            name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
            current: item.currentStock,
            threshold: item.thresholdValue,
            unit: item.unit,
        }));
    }, [inventoryData.lowStockItems]);

    const lowStockChartData = useMemo(() => {
        return inventoryData.lowStockItems.slice(0, 10).map((item) => ({
            name: item.name.length > 12 ? item.name.substring(0, 12) + '...' : item.name,
            stock: item.currentStock,
            threshold: item.thresholdValue,
            deficit: Math.max(0, item.thresholdValue - item.currentStock),
        }));
    }, [inventoryData.lowStockItems]);

    const purchaseTrendData = useMemo(() => {
        if (!purchaseHistory || purchaseHistory.length === 0) {
            return [];
        }
        return purchaseHistory.map((p) => ({
            date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            quantity: p.quantity,
            cost: p.cost,
        }));
    }, [purchaseHistory]);

    const stockDistributionData = useMemo(() => {
        const categories = [
            { name: 'Low Stock', value: inventoryData.lowStock, color: '#ef4444' },
            { name: 'In Stock', value: Math.max(0, inventoryData.total - inventoryData.lowStock), color: '#10b981' },
        ];
        return categories.filter(c => c.value > 0);
    }, [inventoryData]);

    return (
        <div className="space-y-6">
            {/* Stock Levels Over Time */}
            {stockLevelsData.length > 0 && (
                <PremiumChartContainer
                    title="Stock Levels Overview"
                    description="Current stock vs threshold for low stock items"
                >
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={stockLevelsData}>
                            <defs>
                                <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorThreshold" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                            <YAxis stroke="var(--muted-foreground)" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                }}
                            />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="current"
                                stroke="#3b82f6"
                                fillOpacity={1}
                                fill="url(#colorCurrent)"
                                name="Current Stock"
                            />
                            <Area
                                type="monotone"
                                dataKey="threshold"
                                stroke="#ef4444"
                                fillOpacity={1}
                                fill="url(#colorThreshold)"
                                name="Threshold"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </PremiumChartContainer>
            )}

            {/* Low Stock Alerts */}
            {lowStockChartData.length > 0 && (
                <PremiumChartContainer
                    title="Low Stock Alerts"
                    description="Items requiring immediate attention"
                >
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={lowStockChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="name" stroke="var(--muted-foreground)" angle={-45} textAnchor="end" height={80} />
                            <YAxis stroke="var(--muted-foreground)" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                }}
                            />
                            <Legend />
                            <Bar dataKey="stock" fill="#3b82f6" name="Current Stock" radius={[8, 8, 0, 0]} />
                            <Bar dataKey="deficit" fill="#ef4444" name="Deficit" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </PremiumChartContainer>
            )}

            {/* Purchase History Trend */}
            {purchaseTrendData.length > 0 && (
                <PremiumChartContainer
                    title="Purchase History Trend"
                    description="Recent inventory purchases over time"
                >
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={purchaseTrendData}>
                            <defs>
                                <linearGradient id="colorPurchase" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="date" stroke="var(--muted-foreground)" />
                            <YAxis stroke="var(--muted-foreground)" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                }}
                            />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="quantity"
                                stroke="#8b5cf6"
                                fillOpacity={1}
                                fill="url(#colorPurchase)"
                                name="Quantity"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </PremiumChartContainer>
            )}

            {/* Stock Distribution */}
            <PremiumChartContainer
                title="Stock Distribution"
                description="Overview of inventory status"
            >
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={stockDistributionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {stockDistributionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--card)',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </PremiumChartContainer>
        </div>
    );
}
