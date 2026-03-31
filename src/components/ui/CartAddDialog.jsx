import React, { useEffect, useMemo, useState } from 'react';
import { ShoppingBag, Check, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/store/hooks';
import {
    selectCartDialogItem,
    selectIsCartDialogOpen,
} from '../../app/store/selectors/cartSelectors';
import { addToCart, closeCartDialog } from '../../app/store/slices/cartSlice';
import { fetchProductReferenceCatalog } from '../../app/store/slices/productSlice';
import {
    selectProductByName,
    selectProductCatalogItems,
} from '../../app/store/selectors/productSelectors';
import { getCategoryLabelFromValue } from '../../data/productCategories';
import useRequireLoginAction from '../../hooks/useRequireLoginAction';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from './Dialog';
import './CartAddDialog.scss';

const RECOMMENDATION_LIMIT = 3;

const getPrimaryPrice = (product) => product?.variants?.[0]?.price ?? Number.MAX_SAFE_INTEGER;

const CartAddDialog = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const products = useAppSelector(selectProductCatalogItems);
    const isCartDialogOpen = useAppSelector(selectIsCartDialogOpen);
    const cartDialogItem = useAppSelector(selectCartDialogItem);
    const requireLoginAction = useRequireLoginAction();
    const [recentlyAddedRecommendation, setRecentlyAddedRecommendation] = useState(null);

    const formattedPrice =
        typeof cartDialogItem?.price === 'number'
            ? `${cartDialogItem.price.toLocaleString('ko-KR')}원`
            : '';

    const activeProductSelector = useMemo(
        () => selectProductByName(cartDialogItem?.productName || ''),
        [cartDialogItem?.productName]
    );
    const activeProduct = useAppSelector(activeProductSelector);

    const recommendations = useMemo(() => {
        if (!cartDialogItem) {
            return [];
        }

        const basePrice = cartDialogItem.price ?? getPrimaryPrice(activeProduct);
        const baseCategory = cartDialogItem.category;
        const activeBadges = new Set(activeProduct?.badge || []);

        return products
            .filter((product) => product.name !== cartDialogItem.productName)
            .map((product) => {
                const priceGap = Math.abs(getPrimaryPrice(product) - basePrice);
                const badgeOverlap = (product.badge || []).reduce(
                    (count, badge) => count + (activeBadges.has(badge) ? 1 : 0),
                    0
                );

                let score = 0;

                if (product.category === baseCategory) {
                    score += 60;
                }

                score += badgeOverlap * 12;
                score += Math.max(0, 18 - Math.round(priceGap / 10000));

                return { product, score };
            })
            .sort((left, right) => {
                if (right.score !== left.score) {
                    return right.score - left.score;
                }

                return getPrimaryPrice(left.product) - getPrimaryPrice(right.product);
            })
            .slice(0, RECOMMENDATION_LIMIT)
            .map(({ product }) => product);
    }, [activeProduct, cartDialogItem, products]);

    useEffect(() => {
        dispatch(fetchProductReferenceCatalog());
    }, [dispatch]);

    useEffect(() => {
        if (!recentlyAddedRecommendation) {
            return undefined;
        }

        const timeoutId = window.setTimeout(() => {
            setRecentlyAddedRecommendation(null);
        }, 1500);

        return () => window.clearTimeout(timeoutId);
    }, [recentlyAddedRecommendation]);

    useEffect(() => {
        setRecentlyAddedRecommendation(null);
    }, [cartDialogItem?.cartId, isCartDialogOpen]);

    const handleOpenChange = (nextOpen) => {
        if (!nextOpen) {
            dispatch(closeCartDialog());
        }
    };

    const handleGoToCart = () => {
        dispatch(closeCartDialog());
        navigate('/cart');
    };

    const handleAddRecommendation = (product) => {
        requireLoginAction(() => {
            dispatch(
                addToCart({
                    product,
                    variantIndex: 0,
                    options: { showDialog: false, preserveDialog: true },
                })
            );
            setRecentlyAddedRecommendation(product.name);
        });
    };

    return (
        <Dialog open={isCartDialogOpen} onOpenChange={handleOpenChange}>
            <DialogContent
                className="cart-add-dialog"
                aria-describedby="cart-add-dialog-description"
            >
                <DialogHeader className="cart-add-dialog__header">
                    <p className="cart-add-dialog__eyebrow suit-12-r">Shopping Bag</p>
                    <DialogTitle className="cart-add-dialog__title optima-40">
                        장바구니에 담았습니다.
                    </DialogTitle>
                    <DialogDescription
                        className="cart-add-dialog__description suit-16-r"
                        id="cart-add-dialog-description"
                    >
                        선택하신 제품이 장바구니에 안전하게 추가되었습니다.
                    </DialogDescription>
                </DialogHeader>

                {cartDialogItem ? (
                    <div className="cart-add-dialog__item">
                        <div className="cart-add-dialog__thumb">
                            <img
                                src={cartDialogItem.image}
                                alt={cartDialogItem.productName}
                            />
                        </div>

                        <div className="cart-add-dialog__copy">
                            <div className="cart-add-dialog__copy-main">
                                <p className="cart-add-dialog__category suit-14-m">
                                    {getCategoryLabelFromValue(cartDialogItem.category)}
                                </p>
                                <p className="cart-add-dialog__name suit-24-r">
                                    {cartDialogItem.productName}
                                </p>
                                {cartDialogItem.variant ? (
                                    <p className="cart-add-dialog__meta suit-18-r">
                                        {cartDialogItem.variant}
                                    </p>
                                ) : null}
                            </div>
                            {formattedPrice ? (
                                <p className="cart-add-dialog__price suit-20-m">
                                    {formattedPrice}
                                </p>
                            ) : null}
                        </div>
                    </div>
                ) : null}

                {recommendations.length > 0 ? (
                    <section className="cart-add-dialog__recommendations" aria-label="추천 제품">
                        <div className="cart-add-dialog__recommendations-head">
                            <p className="cart-add-dialog__recommendations-eyebrow suit-12-r">
                                Recommended Pairing
                            </p>
                            <p className="cart-add-dialog__recommendations-title suit-18-m">
                                함께 담기 좋은 추천 제품
                            </p>
                        </div>

                        <div className="cart-add-dialog__recommendations-grid">
                            {recommendations.map((product) => {
                                const primaryVariant = product.variants?.[0];
                                const isRecentlyAdded =
                                    recentlyAddedRecommendation === product.name;

                                return (
                                    <article
                                        key={product.name}
                                        className="cart-add-dialog__recommendation-card"
                                    >
                                        <div className="cart-add-dialog__recommendation-image">
                                            <img
                                                src={primaryVariant?.image}
                                                alt={product.name}
                                            />
                                        </div>

                                        <div className="cart-add-dialog__recommendation-copy">
                                            <p className="cart-add-dialog__recommendation-category suit-12-r">
                                                {getCategoryLabelFromValue(product.category)}
                                            </p>
                                            <p className="cart-add-dialog__recommendation-name suit-14-m">
                                                {product.name}
                                            </p>
                                            <p className="cart-add-dialog__recommendation-price suit-12-r">
                                                {typeof primaryVariant?.price === 'number'
                                                    ? `${primaryVariant.price.toLocaleString('ko-KR')}원`
                                                    : ''}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            className={`cart-add-dialog__recommendation-button suit-12-r ${
                                                isRecentlyAdded ? 'is-added' : ''
                                            }`}
                                            onClick={() => handleAddRecommendation(product)}
                                        >
                                            {isRecentlyAdded ? (
                                                <>
                                                    <Check size={14} strokeWidth={2.2} />
                                                    담았습니다
                                                </>
                                            ) : (
                                                <>
                                                    <Plus size={14} strokeWidth={2.2} />
                                                    함께 담기
                                                </>
                                            )}
                                        </button>
                                    </article>
                                );
                            })}
                        </div>
                    </section>
                ) : null}

                <DialogFooter className="cart-add-dialog__actions">
                    <DialogClose asChild>
                        <button
                            type="button"
                            className="cart-add-dialog__button cart-add-dialog__button--secondary suit-14-m"
                        >
                            계속 쇼핑하기
                        </button>
                    </DialogClose>

                    <button
                        type="button"
                        className="cart-add-dialog__button cart-add-dialog__button--primary suit-14-m"
                        onClick={handleGoToCart}
                    >
                        <ShoppingBag size={16} strokeWidth={1.8} />
                        장바구니 보기
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CartAddDialog;
