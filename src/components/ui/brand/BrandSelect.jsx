import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useBrand } from '../../../hooks/useBrand';
import { cn } from '../../../lib/utils';

/**
 * Enhanced Brand Select Component
 * Features search, multi-select, and brand styling
 */
const BrandSelect = ({
  options = [],
  value,
  onChange,
  placeholder = 'Тандаңыз...',
  searchable = false,
  multi = false,
  disabled = false,
  error,
  className,
  ...props
}) => {
  const brand = useBrand();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const selectRef = useRef(null);
  const inputRef = useRef(null);

  const filteredOptions = React.useMemo(() => {
    if (!searchable || !searchTerm) return options;
    
    return options.filter(option =>
      option.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm, searchable]);

  const selectedOptions = React.useMemo(() => {
    if (multi) {
      return options.filter(option => 
        Array.isArray(value) ? value.includes(option.value) : value === option.value
      );
    }
    return options.find(option => option.value === value);
  }, [options, value, multi]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleOptionSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleOptionSelect = (option) => {
    if (multi) {
      const currentValue = Array.isArray(value) ? value : [];
      const newValue = currentValue.includes(option.value)
        ? currentValue.filter(v => v !== option.value)
        : [...currentValue, option.value];
      onChange(newValue);
    } else {
      onChange(option.value);
      setIsOpen(false);
    }
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const handleRemoveOption = (optionValue) => {
    if (multi) {
      const currentValue = Array.isArray(value) ? value : [];
      onChange(currentValue.filter(v => v !== optionValue));
    }
  };

  const getDisplayValue = () => {
    if (multi) {
      if (!selectedOptions.length) return placeholder;
      return selectedOptions.map(opt => opt.label).join(', ');
    }
    return selectedOptions?.label || placeholder;
  };

  const baseSelectClasses = cn(
    'relative',
    disabled && 'opacity-60 cursor-not-allowed'
  );

  const triggerClasses = cn(
    'w-full',
    'px-4 py-3',
    'bg-white dark:bg-gray-800',
    'text-gray-900 dark:text-white',
    'border',
    'rounded-xl',
    'transition-all',
    'duration-[var(--brand-duration-normal)]',
    'ease-[var(--brand-easing-easeOut)]',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-brand-primary-orange/50',
    'focus:border-brand-primary-orange',
    'cursor-pointer',
    'flex items-center justify-between',
    
    // Error state
    error && 'border-brand-error focus:ring-brand-error/50 focus:border-brand-error',
    
    className
  );

  const dropdownClasses = cn(
    'absolute',
    'top-full',
    'left-0',
    'right-0',
    'mt-1',
    'bg-white dark:bg-gray-800',
    'border',
    'border-gray-200 dark:border-gray-700',
    'rounded-xl',
    'shadow-brand-large',
    'z-50',
    'max-h-60',
    'overflow-y-auto',
    
    isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none',
    'transition-all duration-[var(--brand-duration-normal)]'
  );

  const optionClasses = (index, option) => cn(
    'px-4 py-3',
    'cursor-pointer',
    'transition-colors duration-[var(--brand-duration-fast)]',
    'flex items-center justify-between',
    
    // Highlighted state
    index === highlightedIndex && 'bg-brand-primary-orange/10',
    
    // Selected state
    (multi ? value?.includes(option.value) : value === option.value) && 'bg-brand-primary-orange/20 text-brand-primary-orange',
    
    // Hover state
    'hover:bg-gray-100 dark:hover:bg-gray-700'
  );

  return (
    <div className={baseSelectClasses} ref={selectRef} onKeyDown={handleKeyDown}>
      {/* Trigger */}
      <div
        className={triggerClasses}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex-1 text-left">
          {getDisplayValue()}
        </div>
        
        {/* Multi-select selected items */}
        {multi && selectedOptions.length > 0 && (
          <div className="flex items-center gap-1 ml-2">
            {selectedOptions.slice(0, 3).map((option, index) => (
              <span
                key={option.value}
                className="px-2 py-1 bg-brand-primary-orange/20 text-brand-primary-orange rounded-lg text-xs"
              >
                {option.label}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveOption(option.value);
                  }}
                  className="ml-1 hover:text-brand-primary-orange/80"
                >
                  ×
                </button>
              </span>
            ))}
            {selectedOptions.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs">
                +{selectedOptions.length - 3}
              </span>
            )}
          </div>
        )}
        
        {/* Dropdown arrow */}
        <div className="ml-2 transition-transform duration-[var(--brand-duration-normal)]" 
             style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Dropdown */}
      <div className={dropdownClasses}>
        {/* Search input */}
        {searchable && (
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <input
              ref={inputRef}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary-orange/50"
              placeholder="Издөө..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        {/* Options */}
        {filteredOptions.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Натыйжалар табылган жок' : 'Опциялар жок'}
          </div>
        ) : (
          filteredOptions.map((option, index) => (
            <div
              key={option.value}
              className={optionClasses(index, option)}
              onClick={() => handleOptionSelect(option)}
            >
              <div className="flex items-center gap-3">
                {option.icon && (
                  <span className="text-gray-500 dark:text-gray-400">
                    {option.icon}
                  </span>
                )}
                <span>{option.label}</span>
              </div>
              
              {/* Multi-select checkbox */}
              {multi && (
                <div className={cn(
                  "w-4 h-4 border-2 rounded flex items-center justify-center transition-colors duration-[var(--brand-duration-fast)]",
                  value?.includes(option.value)
                    ? "bg-brand-primary-orange border-brand-primary-orange"
                    : "border-gray-300 dark:border-gray-600"
                )}>
                  {value?.includes(option.value) && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                      <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="text-xs text-brand-error mt-1 animate-fade-in">
          {error}
        </div>
      )}
    </div>
  );
};

BrandSelect.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.any.isRequired,
    label: PropTypes.string.isRequired,
    icon: PropTypes.node
  })).isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  searchable: PropTypes.bool,
  multi: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
};

export default BrandSelect;
