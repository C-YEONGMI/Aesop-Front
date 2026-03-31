import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import './RollingNumber.scss';

const DIGIT_CYCLE = 10;
const DIGIT_OFFSET = 10;
const DIGIT_SEQUENCE = Array.from({ length: 30 }, (_, index) => index % 10);

const buildSlots = (value) =>
    value
        .toLocaleString('ko-KR')
        .split('')
        .reverse()
        .map((char, reverseIndex) => ({
            char,
            reverseIndex,
            isDigit: /\d/.test(char),
        }))
        .reverse();

const getNextDigitIndex = (currentIndex, nextDigit, direction) => {
    const currentDigit = ((currentIndex % DIGIT_CYCLE) + DIGIT_CYCLE) % DIGIT_CYCLE;
    let step = nextDigit - currentDigit;

    if (direction === 'down') {
        if (step > 0) {
            step -= DIGIT_CYCLE;
        }
    } else if (step < 0) {
        step += DIGIT_CYCLE;
    }

    return currentIndex + step;
};

const DigitWheel = ({ digit, direction }) => {
    const trackRef = useRef(null);
    const indexRef = useRef(DIGIT_OFFSET + digit);
    const hasMountedRef = useRef(false);

    useLayoutEffect(() => {
        const track = trackRef.current;
        if (!track) {
            return undefined;
        }

        const normalizedIndex = DIGIT_OFFSET + digit;

        if (!hasMountedRef.current) {
            hasMountedRef.current = true;
            indexRef.current = normalizedIndex;
            gsap.set(track, { y: `-${normalizedIndex}em` });
            return undefined;
        }

        const targetIndex = getNextDigitIndex(indexRef.current, digit, direction);
        indexRef.current = targetIndex;

        gsap.killTweensOf(track);
        const tween = gsap.to(track, {
            y: `-${targetIndex}em`,
            duration: 0.56,
            ease: 'power3.out',
            onComplete: () => {
                indexRef.current = normalizedIndex;
                gsap.set(track, { y: `-${normalizedIndex}em` });
            },
        });

        return () => tween.kill();
    }, [digit, direction]);

    return (
        <span className="rolling-number__digit" aria-hidden="true">
            <span ref={trackRef} className="rolling-number__digit-track">
                {DIGIT_SEQUENCE.map((sequenceDigit, index) => (
                    <span key={`${sequenceDigit}-${index}`} className="rolling-number__digit-cell">
                        {sequenceDigit}
                    </span>
                ))}
            </span>
        </span>
    );
};

const RollingNumber = ({ value, className = '' }) => {
    const safeValue = Number.isFinite(Number(value)) ? Math.max(0, Math.round(Number(value))) : 0;
    const previousValueRef = useRef(safeValue);
    const direction = safeValue >= previousValueRef.current ? 'up' : 'down';
    const slots = useMemo(() => buildSlots(safeValue), [safeValue]);

    useEffect(() => {
        previousValueRef.current = safeValue;
    }, [safeValue]);

    return (
        <span className={`rolling-number ${className}`.trim()}>
            <span className="rolling-number__visual" aria-hidden="true">
                {slots.map((slot) =>
                    slot.isDigit ? (
                        <DigitWheel
                            key={`digit-${slot.reverseIndex}`}
                            digit={Number(slot.char)}
                            direction={direction}
                        />
                    ) : (
                        <span key={`separator-${slot.reverseIndex}`} className="rolling-number__separator">
                            {slot.char}
                        </span>
                    )
                )}
            </span>
            <span className="rolling-number__sr-only">{safeValue.toLocaleString('ko-KR')}</span>
        </span>
    );
};

export default RollingNumber;
