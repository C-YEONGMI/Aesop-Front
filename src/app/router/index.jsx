import React, { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Login from '../../pages/auth/Login';
import Signup from '../../pages/auth/Signup';
import FindAccount from '../../pages/auth/FindAccount';
import SocialAuthCallback from '../../pages/auth/SocialAuthCallback';
import GiftGuide from '../../pages/gift-guide/GiftGuide';
import Benefits from '../../pages/benefits/Benefits';
import KrExclusiveBenefits from '../../pages/kr-exclusive-benefits/KrExclusiveBenefits';
import OurStory from '../../pages/our-story/OurStory';
import Search from '../../pages/search/Search';
import RequireAuth from './guards/RequireAuth';
import PublicOnlyRoute from './guards/PublicOnlyRoute';

const isDynamicImportError = (error) => {
    const message = String(error?.message || '');

    return /Failed to fetch dynamically imported module|Importing a module script failed|ChunkLoadError/i.test(
        message
    );
};

const lazyWithRetry = (cacheKey, importer) =>
    lazy(async () => {
        const reloadKey = `lazy-retry:${cacheKey}`;

        try {
            const module = await importer();

            if (typeof window !== 'undefined') {
                window.sessionStorage.removeItem(reloadKey);
            }

            return module;
        } catch (error) {
            if (
                typeof window !== 'undefined' &&
                isDynamicImportError(error) &&
                window.sessionStorage.getItem(reloadKey) !== 'true'
            ) {
                window.sessionStorage.setItem(reloadKey, 'true');
                window.location.reload();

                return new Promise(() => {});
            }

            if (typeof window !== 'undefined') {
                window.sessionStorage.removeItem(reloadKey);
            }

            throw error;
        }
    });

const Main = lazyWithRetry('main', () => import('../../pages/main/Main'));
const Products = lazyWithRetry('products', () => import('../../pages/products/Products'));
const ProductDetail = lazyWithRetry('product-detail', () => import('../../pages/product-detail/ProductDetail'));
const Cart = lazyWithRetry('cart', () => import('../../pages/cart/Cart'));
const Checkout = lazyWithRetry('checkout', () => import('../../pages/checkout/Checkout'));
const MyPage = lazyWithRetry('mypage', () => import('../../pages/my-page/MyPage'));
const Support = lazyWithRetry('support', () => import('../../pages/support/Support'));
const StoreLocator = lazyWithRetry('store-locator', () => import('../../pages/store-locator/StoreLocator'));

const RouteFallback = () => (
    <div className="route-loading" role="status" aria-live="polite">
        <div className="route-loading__inner">
            <p className="route-loading__eyebrow suit-14-m">Loading</p>
            <p className="route-loading__message suit-18-r">Preparing page content...</p>
        </div>
    </div>
);

const withRouteSuspense = (element) => (
    <Suspense fallback={<RouteFallback />}>{element}</Suspense>
);

const router = createBrowserRouter([
    {
        path: '/auth/callback/:provider',
        element: <SocialAuthCallback />,
    },
    {
        path: '/',
        element: <Layout />,
        children: [
            { index: true, element: withRouteSuspense(<Main />) },

            { path: 'gift-guide', element: <GiftGuide /> },

            { path: 'products', element: withRouteSuspense(<Products />) },
            { path: 'products/:category', element: withRouteSuspense(<Products />) },
            {
                path: 'products/:category/:subcategory',
                element: withRouteSuspense(<Products />),
            },

            { path: 'product/:id', element: withRouteSuspense(<ProductDetail />) },

            { path: 'benefits', element: <Benefits /> },
            { path: 'benefits/official', element: <Benefits sub="official" /> },
            { path: 'benefits/kr-exclusive', element: <KrExclusiveBenefits /> },

            { path: 'our-story', element: <OurStory /> },

            { path: 'search', element: <Search /> },

            {
                element: <PublicOnlyRoute />,
                children: [
                    { path: 'login', element: <Login /> },
                    { path: 'signup', element: <Signup /> },
                    { path: 'find-account', element: <FindAccount /> },
                ],
            },

            {
                element: <RequireAuth />,
                children: [
                    { path: 'mypage', element: withRouteSuspense(<MyPage />) },
                    { path: 'mypage/:tab', element: withRouteSuspense(<MyPage />) },
                    { path: 'checkout', element: withRouteSuspense(<Checkout />) },
                ],
            },

            { path: 'cart', element: withRouteSuspense(<Cart />) },

            { path: 'support', element: withRouteSuspense(<Support />) },
            {
                path: 'support/notices',
                element: withRouteSuspense(<Support tab="notices" />),
            },
            { path: 'support/faq', element: withRouteSuspense(<Support tab="faq" />) },
            {
                path: 'support/contact',
                element: withRouteSuspense(<Support tab="contact" />),
            },
            {
                path: 'support/live-chat',
                element: withRouteSuspense(<Support tab="live-chat" />),
            },
            {
                path: 'support/store-locator',
                element: withRouteSuspense(<StoreLocator />),
            },

            { path: 'store-locator', element: withRouteSuspense(<StoreLocator />) },
            {
                path: 'store-locator/:storeId',
                element: withRouteSuspense(<StoreLocator />),
            },
        ],
    },
]);

export default router;
