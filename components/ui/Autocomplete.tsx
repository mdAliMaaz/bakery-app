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
                        w-full px-4 py-4 pr-12 bg-input border rounded-xl text-foreground
                        placeholder:text-muted-foreground focus:outline-none focus:ring-2
                        transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                        ${error
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-border/50 focus:ring-primary/50 focus:border-primary'
                        }
                        shadow-sm hover:shadow-md
                    `}
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
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {error}
                </p>
            )}

            {/* Dropdown */}
            {isOpen && filteredOptions.length > 0 && (
                <ul
                    ref={listRef}
                    className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-2xl max-h-60 overflow-y-auto backdrop-blur-xl"
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                        border: '2px solid #d1d5db'
                    }}
                >
                    {filteredOptions.map((option, index) => (
                        <li
                            key={option.value}
                            onClick={() => handleSelect(option)}
                            className={`
                                px-4 py-3 cursor-pointer transition-colors duration-150 flex items-center justify-between
                                ${index === highlightedIndex
                                    ? 'bg-blue-600 text-white'
                                    : 'hover:bg-gray-100 text-gray-900'
                                }
                            `}
                        >
                            <span className="truncate">{option.label}</span>
                            {index === highlightedIndex && (
                                <Check className="w-4 h-4 text-primary flex-shrink-0 ml-2" />
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {/* No results */}
            {isOpen && filteredOptions.length === 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-2xl p-4 text-center text-muted-foreground backdrop-blur-xl"
                     style={{
                         backgroundColor: 'rgba(255, 255, 255, 1)'
                     }}>
                    {value ? 'No matching items found' : 'No items available'}
                </div>
            )}
        </div>
    );
}
