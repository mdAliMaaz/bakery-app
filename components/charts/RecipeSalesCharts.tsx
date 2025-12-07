'use client';

import { useMemo } from 'react';
import {
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
    ScatterChart,
    Scatter,
    ZAxis,
} from 'recharts';
import PremiumChartContainer from './PremiumChartContainer';

interface RecipeSalesChartsProps {
    recipePerformance?: Array<{ name: string; orders: number }>;
    recipePopularity?: Array<{ date: string; recipes: Record<string, number> }>;
}

export default function RecipeSalesCharts({
    recipePerformance,
    recipePopularity,
}: RecipeSalesChartsProps) {
    const performanceData = useMemo(() => {
        if (!recipePerformance || recipePerformance.length === 0) return [];
        return recipePerformance
            .sort((a, b) => b.orders - a.orders)
            .slice(0, 10)
            .map((item) => ({
                name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
                orders: item.orders,
            }));
    }, [recipePerformance]);

    const profitabilityData: any[] = [];

    const popularityData = useMemo(() => {
        if (!recipePopularity || recipePopularity.length === 0) return [];
        // Transform data for multi-line chart
        const recipeNames = new Set<string>();
        recipePopularity.forEach((day) => {
            Object.keys(day.recipes).forEach((name) => recipeNames.add(name));
        });

        const topRecipes = Array.from(recipeNames).slice(0, 5);
        return recipePopularity.map((day) => {
            const dataPoint: any = { date: day.date };
            topRecipes.forEach((recipe) => {
                dataPoint[recipe] = day.recipes[recipe] || 0;
            });
            return dataPoint;
        });
    }, [recipePopularity]);

    return (
        <div className="space-y-6">
            {/* Recipe Performance Ranking */}
            {performanceData.length > 0 && (
                <PremiumChartContainer
                    title="Recipe Performance Ranking"
                    description="Top recipes by order count"
                >
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={performanceData}>
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
                            <Bar dataKey="orders" fill="#3b82f6" name="Orders" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </PremiumChartContainer>
            )}

            {/* Profitability section removed per requirements */}

            {/* Recipe Popularity Trends */}
            {popularityData.length > 0 && (
                <PremiumChartContainer
                    title="Recipe Popularity Trends"
                    description="Order trends for top recipes over time"
                >
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={popularityData}>
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
                            {Object.keys(popularityData[0] || {})
                                .filter((key) => key !== 'date')
                                .slice(0, 5)
                                .map((recipe, index) => {
                                    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
                                    return (
                                        <Line
                                            key={recipe}
                                            type="monotone"
                                            dataKey={recipe}
                                            stroke={colors[index % colors.length]}
                                            strokeWidth={2}
                                            dot={{ r: 3 }}
                                            name={recipe.length > 20 ? recipe.substring(0, 20) + '...' : recipe}
                                        />
                                    );
                                })}
                        </LineChart>
                    </ResponsiveContainer>
                </PremiumChartContainer>
            )}
        </div>
    );
}
