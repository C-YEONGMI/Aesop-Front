import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { cn } from '@/lib/utils';
import {
    Select as AesopSelect,
    SelectContent as AesopSelectContent,
    SelectItem as AesopSelectItem,
    SelectTrigger as AesopSelectTrigger,
    SelectValue as AesopSelectValue,
} from './Select';
import './Calendar.scss';

const DEFAULT_CLASS_NAMES = {
    root: 'aesop-calendar',
    months: 'aesop-calendar__months',
    month_caption: 'aesop-calendar__month-caption',
    caption_label: 'aesop-calendar__caption-label optima-18',
    nav: 'aesop-calendar__nav',
    button_previous: 'aesop-calendar__nav-button aesop-calendar__nav-button--previous',
    button_next: 'aesop-calendar__nav-button aesop-calendar__nav-button--next',
    chevron: 'aesop-calendar__chevron',
    dropdowns: 'aesop-calendar__dropdowns',
    dropdown: 'aesop-calendar__dropdown suit-12-r',
    dropdown_root: 'aesop-calendar__dropdown-root',
    month_grid: 'aesop-calendar__month-grid',
    weekday: 'aesop-calendar__weekday suit-12-r',
    week_number: 'aesop-calendar__week-number suit-12-r',
    day: 'aesop-calendar__day',
    day_button: 'aesop-calendar__day-button suit-14-m',
    today: 'aesop-calendar__day--today',
    selected: 'aesop-calendar__day--selected',
    outside: 'aesop-calendar__day--outside',
    disabled: 'aesop-calendar__day--disabled',
    hidden: 'aesop-calendar__day--hidden',
    range_start: 'aesop-calendar__day--range-start',
    range_middle: 'aesop-calendar__day--range-middle',
    range_end: 'aesop-calendar__day--range-end',
    focusable: 'aesop-calendar__day--focusable',
};

function CalendarDropdown({ options, value, onChange, disabled, 'aria-label': ariaLabel }) {
    const nextValue = value === undefined || value === null ? undefined : String(value);

    return (
        <AesopSelect
            value={nextValue}
            onValueChange={(selectedValue) => onChange?.({ target: { value: selectedValue } })}
            disabled={disabled}
        >
            <AesopSelectTrigger
                aria-label={ariaLabel}
                className="aesop-calendar__select-trigger suit-12-r"
            >
                <AesopSelectValue />
            </AesopSelectTrigger>
            <AesopSelectContent className="aesop-calendar__select-content" position="popper">
                {options?.map((option) => (
                    <AesopSelectItem
                        key={option.value}
                        value={String(option.value)}
                        disabled={option.disabled}
                        className="aesop-calendar__select-item suit-12-r"
                    >
                        {option.label}
                    </AesopSelectItem>
                ))}
            </AesopSelectContent>
        </AesopSelect>
    );
}

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    components: userComponents,
    ...props
}) {
    const mergedClassNames = Object.keys(DEFAULT_CLASS_NAMES).reduce((acc, key) => {
        acc[key] = classNames?.[key]
            ? cn(DEFAULT_CLASS_NAMES[key], classNames[key])
            : DEFAULT_CLASS_NAMES[key];
        return acc;
    }, {});

    const mergedComponents = {
        Chevron: ({ orientation, className: chevronClassName, ...chevronProps }) => {
            const iconClassName = cn(DEFAULT_CLASS_NAMES.chevron, chevronClassName);

            if (orientation === 'left') {
                return (
                    <ChevronLeft
                        size={16}
                        strokeWidth={1.9}
                        className={iconClassName}
                        {...chevronProps}
                    />
                );
            }

            return (
                <ChevronRight
                    size={16}
                    strokeWidth={1.9}
                    className={iconClassName}
                    {...chevronProps}
                />
            );
        },
        Dropdown: CalendarDropdown,
        ...userComponents,
    };

    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn(DEFAULT_CLASS_NAMES.root, className)}
            classNames={mergedClassNames}
            components={mergedComponents}
            {...props}
        />
    );
}

export { Calendar };
