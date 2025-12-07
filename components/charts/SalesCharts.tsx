'use client';

import { useMemo } from 'react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import PremiumChartContainer from './PremiumChartContainer';

interface SalesChartsProps {
    salesData: Array<{ _id: string; count: number }>;
    salesByRecipe?: Array<{ recipe: string; count: number }>;
    period?: 'daily' | 'weekly' | 'monthly';
}

export default function SalesCharts({ salesData, salesByRecipe, period = 'daily' }: SalesChartsProps) {
    const salesTrendData = useMemo(() => {
        return salesData.map((item) => ({
            date: new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            orders: item.count,
        }));
    }, [salesData]);

    const salesByRecipeData = useMemo(() => { 
        if (!salesByRecipe || salesByRecipe.length === 0) return [];
        return salesByRecipe
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)
            .map((item) => ({
                name: item.recipe.length > 15 ? item.recipe.substring(0, 15) + '...' : item.recipe,
                orders: item.count,
            }));
    }, [salesByRecipe]);

    return (
        <div className="space-y-6">
            {/* Order Volume Trends */}
            <PremiumChartContainer
                title="Order Volume Trends"
                description={`Order count over the last ${period === 'daily' ? '30 days' : period === 'weekly' ? '12 weeks' : '12 months'}`}
            >
                <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salesTrendData}>
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

            {/* Sales by Recipe */}
            {salesByRecipeData.length > 0 && (
                <PremiumChartContainer
                    title="Top Selling Recipes"
                    description="Best performing recipes by order count"
                >
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={salesByRecipeData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis type="number" stroke="var(--muted-foreground)" />
                            <YAxis dataKey="name" type="category" stroke="var(--muted-foreground)" width={120} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                }}
                            />
                            <Legend />
                            <Bar dataKey="orders" fill="#3b82f6" name="Orders" radius={[0, 8, 8, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </PremiumChartContainer>
            )}

            {/* Sales Growth Rate */}
            <PremiumChartContainer
                title="Sales Growth Rate"
                description="Order volume trends over time"
            >
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesTrendData}>
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
                        <Line
                            type="monotone"
                            dataKey="orders"
                            stroke="#8b5cf6"
                            strokeWidth={2}
                            dot={{ fill: '#8b5cf6', r: 4 }}
                            activeDot={{ r: 6 }}
                            name="Orders"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </PremiumChartContainer>
        </div>
    );
}
