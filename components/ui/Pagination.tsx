'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  totalItems?: number;
  showItemsPerPage?: boolean;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage = 10,
  totalItems,
  showItemsPerPage = false,
  onItemsPerPageChange,
  className = '',
}: PaginationProps) {
  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = parseInt(e.target.value);
    if (onItemsPerPageChange) {
      onItemsPerPageChange(newItemsPerPage);
    }
  };

  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages();

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Items per page selector */}
      {showItemsPerPage && onItemsPerPageChange && (
        <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
          <span>Show</span>
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="px-2 py-1 bg-gray-800 border-2 border-gray-600 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>entries</span>
        </div>
      )}

      {/* Pagination info */}
      {totalItems && (
        <div className="text-sm text-gray-300 font-medium">
          Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to{' '}
          {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
        </div>
      )}

      {/* Pagination controls */}
      <div className="flex items-center gap-1">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 border-2 border-indigo-700 bg-gray-800 text-indigo-400 hover:bg-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded-xl font-semibold disabled:hover:bg-gray-800"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page numbers */}
        {visiblePages.map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={`px-4 py-2 border-2 transition-all duration-300 rounded-xl font-semibold ${
              page === currentPage
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-indigo-500 shadow-lg scale-105'
                : page === '...'
                ? 'cursor-default bg-gray-800 text-gray-400 border-gray-600'
                : 'bg-gray-800 text-indigo-400 border-indigo-700 hover:bg-indigo-900/20 hover:scale-105'
            }`}
          >
            {page}
          </button>
        ))}

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 border-2 border-indigo-700 bg-gray-800 text-indigo-400 hover:bg-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded-xl font-semibold disabled:hover:bg-gray-800"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

