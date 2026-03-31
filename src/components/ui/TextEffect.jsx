import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

const defaultStaggerTimes = {
    char: 0.03,
    word: 0.05,
    line: 0.1,
};

const defaultContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05 },
    },
    exit: {
        transition: { staggerChildren: 0.05, staggerDirection: -1 },
    },
};

const defaultItemVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
};

const AnimationComponent = React.memo(({ segment, variants, per, segmentWrapperClassName }) => {
    const content =
        per === 'line' ? (
            <motion.span variants={variants} style={{ display: 'block' }}>
                {segment}
            </motion.span>
        ) : per === 'word' ? (
            <motion.span
                aria-hidden="true"
                variants={variants}
                style={{ display: 'inline-block', whiteSpace: 'pre' }}
            >
                {segment}
            </motion.span>
        ) : (
            <motion.span style={{ display: 'inline-block', whiteSpace: 'pre' }}>
                {segment.split('').map((char, charIndex) => (
                    <motion.span
                        key={`char-${charIndex}`}
                        aria-hidden="true"
                        variants={variants}
                        style={{ display: 'inline-block', whiteSpace: 'pre' }}
                    >
                        {char}
                    </motion.span>
                ))}
            </motion.span>
        );

    if (!segmentWrapperClassName) return content;

    return (
        <span className={segmentWrapperClassName}>{content}</span>
    );
});

AnimationComponent.displayName = 'AnimationComponent';

export function TextEffect({
    children,
    per = 'word',
    as = 'p',
    variants,
    className,
    style,
    delay = 0,
    trigger = true,
    onAnimationComplete,
    segmentWrapperClassName,
}) {
    let segments;
    if (per === 'line') {
        segments = children.split('\n');
    } else if (per === 'word') {
        segments = children.split(/(\s+)/);
    } else {
        segments = children.split('');
    }

    const MotionTag = motion[as] || motion.p;

    const containerVariants = variants?.container || defaultContainerVariants;
    const itemVariants = variants?.item || defaultItemVariants;

    const stagger = defaultStaggerTimes[per];
    const delayedContainerVariants = {
        hidden: containerVariants.hidden,
        visible: {
            ...containerVariants.visible,
            transition: {
                ...containerVariants.visible?.transition,
                staggerChildren:
                    containerVariants.visible?.transition?.staggerChildren || stagger,
                delayChildren: delay,
            },
        },
        exit: containerVariants.exit,
    };

    return (
        <AnimatePresence mode="sync">
            {trigger && (
                <MotionTag
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    aria-label={per !== 'line' ? children : undefined}
                    variants={delayedContainerVariants}
                    className={className}
                    style={{ whiteSpace: 'pre-wrap', ...style }}
                    onAnimationComplete={onAnimationComplete}
                >
                    {segments.map((segment, index) => (
                        <AnimationComponent
                            key={`${per}-${index}-${segment}`}
                            segment={segment}
                            variants={itemVariants}
                            per={per}
                            segmentWrapperClassName={segmentWrapperClassName}
                        />
                    ))}
                </MotionTag>
            )}
        </AnimatePresence>
    );
}
