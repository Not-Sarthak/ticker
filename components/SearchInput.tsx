"use client";

import React, { memo, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  showSearchIcon?: boolean;
  onClear?: () => void;
}

export const SearchInput = memo<SearchInputProps>(({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
  showSearchIcon = true,
  onClear,
  ...props
}) => {
  return (
    <div className={cn(
      "relative w-full transition-all duration-200",
      className
    )}>
      {showSearchIcon && (
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
          />
        </svg>
      )}

      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(
          "w-full h-10 sm:h-12",
          "px-4 py-2",
          showSearchIcon && "pl-10 sm:pl-12",
          "text-sm sm:text-base",
          "bg-[#262830] text-white",
          "placeholder-gray-400",
          "border border-[#2e2f34] rounded-lg",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30",
          "transition-all duration-200",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
        {...props}
      />

      {value && onClear && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-700/50 transition-colors duration-200"
          type="button"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
});

SearchInput.displayName = 'SearchInput'; 