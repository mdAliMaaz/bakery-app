'use client';

import { useMemo } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import PremiumChartContainer from './PremiumChartContainer';

interface OrderChartsProps {
    ordersByStatus: Array<{ _id: string; count: number }>;
    orderTrends?: Array<{ date: string; count: number }>;
    ordersByRecipe?: Array<{ recipe: string; count: number }>;
}

const STATUS_COLORS: Record<string, string> = {
    'Draft': '#94a3b8',
    'Ingredients Allocated': '#3b82f6',
    'In Production': '#f59e0b',
    'Ready for Dispatch': '#8b5cf6',
    'Dispatched': '#6366f1',
    'Delivered': '#10b981',
    'Cancelled': '#ef4444',
};

export default function OrderCharts({ ordersByStatus, orderTrends, ordersByRecipe }: OrderChartsProps) {
    const statusChartData = useMemo(() => {
        return ordersByStatus.map((item) => ({
            name: item._id,
            value: item.count,
            color: STATUS_COLORS[item._id] || '#94a3b8',
        }));
    }, [ordersByStatus]);

    const trendData = useMemo(() => {
        if (!orderTrends || orderTrends.length === 0) return [];
        return orderTrends.map((item) => ({
            date: item.date,
            orders: item.count,
        }));
    }, [orderTrends]);

    const recipeBreakdownData = useMemo(() => {
        if (!ordersByRecipe || ordersByRecipe.length === 0) return [];
        return ordersByRecipe
            .sort((a, b) => b.count - a.count)
            .slice(0, 8)
            .map((item) => ({
                name: item.recipe.length > 15 ? item.recipe.substring(0, 15) + '...' : item.recipe,
                orders: item.count,
            }));
    }, [ordersByRecipe]);

    return (
        <div className="space-y-6">
            {/* Order Status Distribution */}
            <PremiumChartContainer
                title="Order Status Distribution"
                description="Breakdown of orders by current status"
            >
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={statusChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {statusChartData.map((entry, index) => (
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
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </PremiumChartContainer>

            {/* Order Volume Trends */}
            {trendData.length > 0 && (
                <PremiumChartContainer
                    title="Order Volume Trends"
                    description="Order count over time"
                >
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
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
                                dataKey="orders"
                                stroke="#6366f1"
                                fillOpacity={1}
                                fill="url(#colorOrders)"
                                name="Orders"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </PremiumChartContainer>
            )}

            {/* Orders by Recipe */}
            {recipeBreakdownData.length > 0 && (
                <PremiumChartContainer
                    title="Orders by Recipe"
                    description="Order distribution across different recipes"
                >
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={recipeBreakdownData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis
                                dataKey="name"
                                stroke="var(--muted-foreground)"
                                angle={-45}
                                textAnchor="end"
                                height={100}
                            />
                            <YAxis stroke="var(--muted-foreground)" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                }}
                            />
                            <Legend />
                            <Bar dataKey="orders" fill="#8b5cf6" name="Orders" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </PremiumChartContainer>
            )}
        </div>
    );
}
