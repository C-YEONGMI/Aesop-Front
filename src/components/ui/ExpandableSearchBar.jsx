import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import './ExpandableSearchBar.scss';

const COLLAPSED_SIZE = 24;

export default function ExpandableSearchBar(props) {
  const {
    expandDirection = 'left',
    placeholder = '제품을 검색해보세요',
    onSearch,
    className = '',
    defaultOpen = false,
    width = 300,
  } = props;

  const [open, setOpen] = useState(defaultOpen);
  const [value, setValue] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const inputPaddingClass = expandDirection === 'right' ? 'search-input--right' : 'search-input--left';
  const placeholderClass = expandDirection === 'right' ? 'search-placeholder--right' : 'search-placeholder--left';

  useEffect(() => {
    function onDocClick(e) {
      if (!containerRef.current?.contains(e.target) && open && value === '') {
        setOpen(false);
        setValue('');
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open, value]);

  useEffect(() => {
    if (open) {
      const id = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(id);
    }
    setValue('');
    return undefined;
  }, [open]);

  const submitSearch = () => {
    const query = value.trim();
    if (!query) return;

    onSearch?.(query);
    setOpen(false);
    setValue('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitSearch();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
        setValue('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return (
    <div
      ref={containerRef}
      className={cn('expandable-search', className)}
      style={{ width: COLLAPSED_SIZE, height: COLLAPSED_SIZE }}
    >
      <button
        type="button"
        aria-label={open ? '검색 닫기' : '검색 열기'}
        onClick={(e) => {
          e.preventDefault();
          setOpen((s) => !s);
        }}
        className={cn('search-toggle-btn', open && 'search-toggle-btn--open')}
      >
        {open ? <X size={20} /> : <Search size={20} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            className={cn(
              'search-form',
              expandDirection === 'left' ? 'search-form--expand-left' : 'search-form--expand-right'
            )}
            initial={{ width: COLLAPSED_SIZE, opacity: 0.98 }}
            animate={{ width, opacity: 1 }}
            exit={{
              width: COLLAPSED_SIZE,
              opacity: 0,
              transition: { type: 'spring', stiffness: 260, damping: 26 },
            }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          >
            {expandDirection === 'left' && (
              <button
                type="submit"
                aria-label="검색하기"
                className="search-submit-btn"
              >
                <Search size={22} className="search-icon-submit" />
              </button>
            )}

            <div className="search-input-wrapper">
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className={cn('search-input', inputPaddingClass)}
              />

              <AnimatePresence>
                {open && !value && (
                  <motion.span
                    key="ph"
                    className={cn('search-placeholder', placeholderClass)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    aria-hidden
                  >
                    {placeholder}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
