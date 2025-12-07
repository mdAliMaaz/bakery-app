'use client';

import { ReactNode } from 'react';
import Pagination from '@/components/ui/Pagination';

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
    // Pagination props
    enablePagination?: boolean;
    currentPage?: number;
    itemsPerPage?: number;
    onPageChange?: (page: number) => void;
    onItemsPerPageChange?: (itemsPerPage: number) => void;
    showItemsPerPage?: boolean;
}

export default function PremiumTable<T extends Record<string, any>>({
    data,
    columns,
    keyExtractor,
    onRowClick,
    emptyMessage = 'No data available',
    className = '',
    enablePagination = false,
    currentPage = 1,
    itemsPerPage = 10,
    onPageChange,
    onItemsPerPageChange,
    showItemsPerPage = false,
}: PremiumTableProps<T>) {
    // Calculate pagination
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = enablePagination ? data.slice(startIndex, endIndex) : data;

    // Handle page changes
    const handlePageChange = (page: number) => {
        if (onPageChange) {
            onPageChange(page);
        }
    };

    const handleItemsPerPageChange = (newItemsPerPage: number) => {
        if (onItemsPerPageChange) {
            onItemsPerPageChange(newItemsPerPage);
        }
    };

    return (
        <div className={`flex flex-col ${className}`}>
            <div className="colorful-card overflow-hidden shadow-xl colorful-glow">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-gradient-to-r from-muted to-muted/80 border-b border-border">
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
                            paginatedData.map((item) => (
                                <tr
                                    key={keyExtractor(item)}
                                    onClick={() => onRowClick?.(item)}
                                    className={`
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

            {/* Pagination */}
            {enablePagination && totalPages > 1 && (
                <div className="px-6 py-4 border-t border-border">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        itemsPerPage={itemsPerPage}
                        totalItems={totalItems}
                        showItemsPerPage={showItemsPerPage}
                        onItemsPerPageChange={handleItemsPerPageChange}
                    />
                </div>
            )}
            </div>
        </div>
    );
}
