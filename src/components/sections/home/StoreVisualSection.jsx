import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import storeImage from '../../../assets/Main_store.png';
import './StoreVisualSection.scss';

gsap.registerPlugin(ScrollTrigger);

const INITIAL_MASK_OFFSET = 14;
const FINAL_MASK_OFFSET = 100;

const StoreVisualSection = () => {
    const sectionRef = useRef(null);
    const imageRef = useRef(null);
    const maskRef = useRef(null);

    useEffect(() => {
        if (!sectionRef.current || !imageRef.current || !maskRef.current) {
            return undefined;
        }

        const ctx = gsap.context(() => {
            gsap.set(maskRef.current, {
                yPercent: INITIAL_MASK_OFFSET,
            });

            gsap.set(imageRef.current, {
                scale: 1.028,
                yPercent: -1.2,
            });

            gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse',
                    invalidateOnRefresh: true,
                },
            })
                .to(maskRef.current, {
                    yPercent: FINAL_MASK_OFFSET,
                    duration: 1.08,
                    ease: 'power3.inOut',
                })
                .to(
                    imageRef.current,
                    {
                        scale: 1,
                        yPercent: 0,
                        duration: 1,
                        ease: 'power2.out',
                    },
                    0.04
                );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section className="store-visual" ref={sectionRef}>
            <img
                ref={imageRef}
                className="store-visual__image"
                src={storeImage}
                alt="Aesop store interior"
            />
            <div className="store-visual__mask" ref={maskRef} aria-hidden="true" />
        </section>
    );
};

export default StoreVisualSection;
