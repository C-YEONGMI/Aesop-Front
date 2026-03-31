import React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';
import './Select.scss';

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef(function SelectTrigger(
    { className, children, ...props },
    ref
) {
    return (
        <SelectPrimitive.Trigger
            ref={ref}
            className={cn('aesop-select__trigger', className)}
            {...props}
        >
            {children}
            <SelectPrimitive.Icon asChild>
                <ChevronDownIcon className="aesop-select__trigger-icon" />
            </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
    );
});

const SelectScrollUpButton = React.forwardRef(function SelectScrollUpButton(
    { className, ...props },
    ref
) {
    return (
        <SelectPrimitive.ScrollUpButton
            ref={ref}
            className={cn('aesop-select__scroll-button', className)}
            {...props}
        >
            <ChevronUpIcon />
        </SelectPrimitive.ScrollUpButton>
    );
});

const SelectScrollDownButton = React.forwardRef(function SelectScrollDownButton(
    { className, ...props },
    ref
) {
    return (
        <SelectPrimitive.ScrollDownButton
            ref={ref}
            className={cn('aesop-select__scroll-button', className)}
            {...props}
        >
            <ChevronDownIcon />
        </SelectPrimitive.ScrollDownButton>
    );
});

const SelectContent = React.forwardRef(function SelectContent(
    { className, children, position = 'popper', ...props },
    ref
) {
    return (
        <SelectPrimitive.Portal>
            <SelectPrimitive.Content
                ref={ref}
                position={position}
                className={cn('aesop-select__content', className)}
                {...props}
            >
                <SelectScrollUpButton />
                <SelectPrimitive.Viewport className="aesop-select__viewport">
                    {children}
                </SelectPrimitive.Viewport>
                <SelectScrollDownButton />
            </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
    );
});

const SelectLabel = React.forwardRef(function SelectLabel({ className, ...props }, ref) {
    return <SelectPrimitive.Label ref={ref} className={cn('aesop-select__label', className)} {...props} />;
});

const SelectItem = React.forwardRef(function SelectItem(
    { className, children, ...props },
    ref
) {
    return (
        <SelectPrimitive.Item
            ref={ref}
            className={cn('aesop-select__item', className)}
            {...props}
        >
            <span className="aesop-select__item-indicator">
                <SelectPrimitive.ItemIndicator>
                    <CheckIcon />
                </SelectPrimitive.ItemIndicator>
            </span>
            <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        </SelectPrimitive.Item>
    );
});

const SelectSeparator = React.forwardRef(function SelectSeparator(
    { className, ...props },
    ref
) {
    return (
        <SelectPrimitive.Separator
            ref={ref}
            className={cn('aesop-select__separator', className)}
            {...props}
        />
    );
});

export {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectScrollDownButton,
    SelectScrollUpButton,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
};
