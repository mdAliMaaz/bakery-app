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
                    <thead className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 border-b-2 border-indigo-600">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider ${column.className || ''}`}
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-400 font-medium">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((item) => (
                                <tr
                                    key={keyExtractor(item)}
                                    onClick={() => onRowClick?.(item)}
                                    className={`
                    ${onRowClick ? 'cursor-pointer hover:bg-indigo-900/20 transition-colors duration-200' : 'hover:bg-gray-700/50 transition-colors duration-200'}
                  `}
                                >
                                    {columns.map((column) => (
                                        <td
                                            key={column.key}
                                            className={`px-6 py-4 whitespace-nowrap text-sm text-gray-100 font-medium ${column.className || ''}`}
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
