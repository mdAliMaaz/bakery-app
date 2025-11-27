'use client';

import { ReactNode } from 'react';

interface Column<T> {
    key: string;
    header: string;
    render?: (item: T) => ReactNode;
    className?: string;
}

interface PremiumTableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyExtractor: (item: T) => string;
    onRowClick?: (item: T) => void;
    emptyMessage?: string;
    className?: string;
}

export default function PremiumTable<T extends Record<string, any>>({
    data,
    columns,
    keyExtractor,
    onRowClick,
    emptyMessage = 'No data available',
    className = '',
}: PremiumTableProps<T>) {
    return (
        <div className={`bg-card border border-border rounded-xl overflow-hidden shadow-md ${className}`}>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider ${column.className || ''}`}
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-12 text-center text-muted-foreground">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((item) => (
                                <tr
                                    key={keyExtractor(item)}
                                    onClick={() => onRowClick?.(item)}
                                    className={`
                    hover:bg-muted/50
                    transition-colors
                    duration-200
                    ${onRowClick ? 'cursor-pointer' : ''}
                  `}
                                >
                                    {columns.map((column) => (
                                        <td
                                            key={column.key}
                                            className={`px-6 py-4 whitespace-nowrap text-sm text-foreground ${column.className || ''}`}
                                        >
                                            {column.render ? column.render(item) : item[column.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
