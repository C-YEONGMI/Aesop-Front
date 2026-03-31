import React, { useMemo, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { ChevronDown, ChevronUp, RotateCcw, X } from 'lucide-react';
import './ProductFilterRail.scss';

const FilterSection = ({ title, defaultOpen = false, children }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <motion.section layout className="product-filter-rail__section">
            <button
                type="button"
                className="product-filter-rail__section-toggle"
                onClick={() => setIsOpen((prev) => !prev)}
            >
                <span className="optima-16">{title}</span>
                {isOpen ? (
                    <ChevronUp size={16} strokeWidth={1.8} />
                ) : (
                    <ChevronDown size={16} strokeWidth={1.8} />
                )}
            </button>

            <AnimatePresence initial={false}>
                {isOpen ? (
                    <motion.div
                        key="section-body"
                        layout
                        className="product-filter-rail__section-body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {children}
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </motion.section>
    );
};

const FilterChip = ({ item, selected = false, onClick }) => (
    <motion.button
        type="button"
        layout
        layoutId={`filter-chip-${item.key}`}
        className={`product-filter-rail__chip ${
            selected
                ? 'product-filter-rail__selected-chip suit-14-m'
                : 'product-filter-rail__option-chip suit-14-m'
        }`}
        onClick={onClick}
        aria-pressed={selected}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.68 }}
    >
        <motion.span layoutId={`filter-chip-label-${item.key}`}>{item.label}</motion.span>
        <AnimatePresence initial={false}>
            {selected ? (
                <motion.span
                    key="remove-icon"
                    className="product-filter-rail__chip-icon"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                    <X size={12} strokeWidth={1.8} />
                </motion.span>
            ) : null}
        </AnimatePresence>
    </motion.button>
);

const ProductFilterRail = ({
    categories,
    activeCategories,
    onCategoryToggle,
    giftFilterOptions = [],
    activeGiftFilters = [],
    onGiftFilterToggle,
    priceRangeOptions,
    activePriceRanges,
    onPriceRangeToggle,
    onClearAllFilters,
    showCategorySection = true,
    includeCategorySummary = true,
}) => {
    const categoryItems = useMemo(
        () =>
            categories
                .filter((category) => category.slug !== 'all')
                .map((category) => ({
                    key: `category-${category.slug}`,
                    value: category.slug,
                    label: category.label,
                })),
        [categories]
    );

    const giftFilterItems = useMemo(
        () =>
            giftFilterOptions.map((filter) => ({
                key: `gift-${filter.filterId}`,
                value: filter.filterId,
                label: filter.filterName,
            })),
        [giftFilterOptions]
    );

    const priceRangeItems = useMemo(
        () =>
            priceRangeOptions.map((range) => ({
                key: `price-${range.value}`,
                value: range.value,
                label: range.label,
            })),
        [priceRangeOptions]
    );

    const selectedItems = useMemo(() => {
        const items = [];

        if (includeCategorySummary) {
            activeCategories.forEach((slug) => {
                const activeCategoryItem = categoryItems.find(
                    (category) => category.value === slug
                );

                if (!activeCategoryItem) {
                    return;
                }

                items.push({
                    key: activeCategoryItem.key,
                    label: activeCategoryItem.label,
                    onRemove: () => onCategoryToggle(slug),
                });
            });
        }

        activeGiftFilters.forEach((filterId) => {
            const activeGiftFilterItem = giftFilterItems.find(
                (filter) => filter.value === filterId
            );

            if (!activeGiftFilterItem || !onGiftFilterToggle) {
                return;
            }

            items.push({
                key: activeGiftFilterItem.key,
                label: activeGiftFilterItem.label,
                onRemove: () => onGiftFilterToggle(filterId),
            });
        });

        activePriceRanges.forEach((rangeValue) => {
            const activePriceRangeItem = priceRangeItems.find(
                (range) => range.value === rangeValue
            );

            if (!activePriceRangeItem) {
                return;
            }

            items.push({
                key: activePriceRangeItem.key,
                label: activePriceRangeItem.label,
                onRemove: () => onPriceRangeToggle(rangeValue),
            });
        });

        return items;
    }, [
        activeCategories,
        activeGiftFilters,
        activePriceRanges,
        categoryItems,
        giftFilterItems,
        includeCategorySummary,
        onCategoryToggle,
        onGiftFilterToggle,
        onPriceRangeToggle,
        priceRangeItems,
    ]);

    const availableCategoryItems = useMemo(
        () =>
            categoryItems.filter(
                (category) => !activeCategories.includes(category.value)
            ),
        [activeCategories, categoryItems]
    );

    const availableGiftFilterItems = useMemo(
        () =>
            giftFilterItems.filter(
                (filter) => !activeGiftFilters.includes(filter.value)
            ),
        [activeGiftFilters, giftFilterItems]
    );

    const availablePriceRangeItems = useMemo(
        () =>
            priceRangeItems.filter(
                (range) => !activePriceRanges.includes(range.value)
            ),
        [activePriceRanges, priceRangeItems]
    );

    return (
        <LayoutGroup id="product-filter-rail">
            <motion.aside layout className="product-filter-rail">
                <div className="product-filter-rail__sticky">
                    <motion.div layout className="product-filter-rail__panel">
                        <p className="product-filter-rail__eyebrow optima-16">Product Filter</p>

                        <motion.div layout className="product-filter-rail__selected">
                            <AnimatePresence mode="popLayout" initial={false}>
                                <motion.div
                                    key={selectedItems.length > 0 ? 'selected-items' : 'selected-empty'}
                                    layout
                                    className="product-filter-rail__selected-active"
                                >
                                    {selectedItems.length > 0 ? (
                                        <motion.div
                                            layout
                                            className="product-filter-rail__selected-list"
                                        >
                                            {selectedItems.map((item) => (
                                                <FilterChip
                                                    key={item.key}
                                                    item={item}
                                                    selected
                                                    onClick={item.onRemove}
                                                />
                                            ))}
                                        </motion.div>
                                    ) : (
                                        <motion.p
                                            layout
                                            className="product-filter-rail__selected-empty suit-14-m"
                                        >
                                            No filters selected
                                        </motion.p>
                                    )}

                                    <motion.button
                                        layout
                                        type="button"
                                        className="product-filter-rail__clear-button suit-12-r"
                                        onClick={onClearAllFilters}
                                    >
                                        <RotateCcw size={13} strokeWidth={1.8} />
                                        Clear all
                                    </motion.button>
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>

                        {showCategorySection ? (
                            <FilterSection title="Category">
                                <motion.ul layout className="product-filter-rail__category-list">
                                    <AnimatePresence mode="popLayout" initial={false}>
                                        {availableCategoryItems.map((category) => (
                                            <motion.li layout key={category.key}>
                                                <FilterChip
                                                    item={category}
                                                    onClick={() => onCategoryToggle(category.value)}
                                                />
                                            </motion.li>
                                        ))}
                                    </AnimatePresence>
                                </motion.ul>
                            </FilterSection>
                        ) : null}

                        {giftFilterItems.length > 0 && onGiftFilterToggle ? (
                            <FilterSection title="Gift Filters">
                                <motion.ul layout className="product-filter-rail__category-list">
                                    <AnimatePresence mode="popLayout" initial={false}>
                                        {availableGiftFilterItems.map((filter) => (
                                            <motion.li layout key={filter.key}>
                                                <FilterChip
                                                    item={filter}
                                                    onClick={() =>
                                                        onGiftFilterToggle(filter.value)
                                                    }
                                                />
                                            </motion.li>
                                        ))}
                                    </AnimatePresence>
                                </motion.ul>
                            </FilterSection>
                        ) : null}

                        <FilterSection title="Price">
                            <motion.div layout className="product-filter-rail__option-list">
                                <AnimatePresence mode="popLayout" initial={false}>
                                    {availablePriceRangeItems.map((range) => (
                                        <motion.div layout key={range.key}>
                                            <FilterChip
                                                item={range}
                                                onClick={() =>
                                                    onPriceRangeToggle(range.value)
                                                }
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        </FilterSection>
                    </motion.div>
                </div>
            </motion.aside>
        </LayoutGroup>
    );
};

export default ProductFilterRail;
