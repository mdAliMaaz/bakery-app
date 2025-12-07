'use client';

import { useState, useEffect, useRef } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';

interface AutocompleteOption {
    value: string;
    label: string;
    data?: any;
}

interface AutocompleteProps {
    options: AutocompleteOption[];
    value: string;
    onChange: (value: string) => void;
    onSelect?: (option: AutocompleteOption) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    disabled?: boolean;
    loading?: boolean;
    className?: string;
    showClearButton?: boolean;
}

export default function Autocomplete({
    options,
    value,
    onChange,
    onSelect,
    placeholder = 'Type to search...',
    label,
    error,
    disabled = false,
    loading = false,
    className = '',
    showClearButton = true,
}: AutocompleteProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    // Filter options based on input value
    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(value.toLowerCase())
    );


    // Reset highlighted index when options change
    useEffect(() => {
        setHighlightedIndex(-1);
    }, [filteredOptions]);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown') {
                setIsOpen(true);
                setHighlightedIndex(0);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev < filteredOptions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
                    handleSelect(filteredOptions[highlightedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setHighlightedIndex(-1);
                inputRef.current?.blur();
                break;
        }
    };

    const handleSelect = (option: AutocompleteOption) => {
        onChange(option.label);
        onSelect?.(option);
        setIsOpen(false);
        setHighlightedIndex(-1);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onChange(newValue);
        setIsOpen(true);
        setHighlightedIndex(-1);
    };

    const handleInputFocus = () => {
        setIsOpen(true);
        setHighlightedIndex(-1);
    };

    const handleClear = () => {
        onChange('');
        inputRef.current?.focus();
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                inputRef.current &&
                !inputRef.current.contains(event.target as Node) &&
                listRef.current &&
                !listRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
                setHighlightedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-foreground mb-2">
                    {label}
                </label>
            )}

            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`
                        w-full px-4 py-3 pr-12 bg-gray-800 border-2 rounded-xl text-gray-100 font-medium
                        placeholder:text-gray-500 focus:outline-none focus:ring-4
                        transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                        ${error
                            ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                            : 'border-gray-600 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-indigo-400'
                        }
                    `}
                    style={{
                        backgroundColor: 'var(--input)',
                        borderColor: error ? '#ef4444' : 'var(--border)',
                        color: 'var(--foreground)'
                    }}
                />

                {/* Right side buttons */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                    {loading && (
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    )}

                    {showClearButton && value && !disabled && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 rounded-md hover:bg-muted transition-colors duration-200"
                            aria-label="Clear"
                        >
                            <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-1 rounded-md hover:bg-muted transition-colors duration-200"
                        aria-label={isOpen ? 'Close' : 'Open'}
                    >
                        <ChevronDown
                            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                                isOpen ? 'rotate-180' : ''
                            }`}
                        />
                    </button>
                </div>
            </div>

            {/* Error message */}
            {error && (
                <p className="mt-1 text-sm text-red-400">
                    {error}
                </p>
            )}

            {/* Dropdown */}
            {isOpen && filteredOptions.length > 0 && (
                <ul
                    ref={listRef}
                    className="absolute z-[100] w-full mt-2 bg-gray-800 border-2 border-indigo-700 rounded-xl shadow-2xl max-h-[400px] overflow-y-auto"
                >
                    {filteredOptions.map((option, index) => (
                        <li
                            key={option.value}
                            onClick={() => handleSelect(option)}
                            className={`
                                px-6 py-4 cursor-pointer transition-all duration-300 flex items-center justify-between text-base font-semibold
                                ${index === highlightedIndex
                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg scale-[1.02]'
                                    : 'hover:bg-indigo-900/20 hover:shadow-md text-gray-100 hover:scale-[1.01]'
                                }
                            `}
                            style={index === highlightedIndex ? {
                                backgroundColor: 'var(--primary)',
                                color: 'var(--primary-foreground)'
                            } : undefined}
                        >
                            <span className="truncate text-lg font-semibold">{option.label}</span>
                            {index === highlightedIndex && (
                                <Check className="w-6 h-6 text-primary-foreground flex-shrink-0 ml-3" />
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {/* No results */}
            {isOpen && filteredOptions.length === 0 && (
                <div
                    className="absolute z-[100] w-full mt-2 bg-gray-800 border-2 border-indigo-700 rounded-xl shadow-2xl p-6 text-center text-gray-400 text-lg font-medium"
                >
                    {value ? 'No matching items found' : 'No items available'}
                </div>
            )}
        </div>
    );
}
