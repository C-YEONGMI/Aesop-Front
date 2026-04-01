# Aesop Renewal

React + Vite storefront prototype with an Express + MongoDB backend.

## Current architecture

### Frontend
- Routing: `react-router-dom@6.30.3` with `createBrowserRouter`
- State management:
  - Redux Toolkit: `auth`, `cart`, `wishlist`, `product`
  - Remaining Zustand stores:
    - `src/store/useOrderStore.js`
    - `src/store/useSupportStore.js`
    - `src/store/useLoginRequiredModalStore.js`
- Product catalog:
  - `Products` and `ProductDetail` use REST API + RTK
  - `Products` uses `react-virtualized` infinite scroll
- Route splitting:
  - `Main`, `Products`, `ProductDetail`, `Cart`, `Checkout`, `MyPage`, `Support`, `StoreLocator`
    are lazy-loaded with `React.lazy` + `Suspense`
- Auth:
  - Real JWT mode is used when `VITE_AUTH_API_BASE_URL` or `VITE_API_BASE_URL` is configured
  - Mock auth remains as a fallback for local development

### Backend
- Location: `server/`
- Stack: Express + Mongoose + JWT + refresh cookie
- Core endpoints:
  - `POST /api/auth/login`
  - `POST /api/auth/refresh`
  - `GET /api/auth/me`
  - `POST /api/auth/logout`
  - `GET /api/products`
  - `GET /api/products/:id`

## Development

### Frontend
```bash
npm install
npm run dev
```

### Backend
```bash
cd server
npm install
npm run seed
npm run dev
```

## Environment

### Frontend
Use either:

```env
VITE_API_BASE_URL=http://localhost:4000
```

or:

```env
VITE_AUTH_API_BASE_URL=http://localhost:4000
```

### Backend
Local MongoDB example:

```env
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=aesop
```

## Cleanup status

### Removed legacy stores
- `src/store/useAuthStore.js`
- `src/store/useCartStore.js`
- `src/store/useWishlistStore.js`

### Intentionally kept for now
- `src/app/store/bridges/cartBridge.js`
- `src/app/store/bridges/wishlistBridge.js`
  - These are no longer Zustand bridges
  - They now persist RTK cart/wishlist state and sync user-scoped state when auth changes

### Next cleanup candidates
- Review `useOrderStore` and `useSupportStore` for RTK migration
- Remove leftover legacy-only RTK actions if they remain unused after the final migration

## Verification

Frontend:
```bash
npm run lint
npm run build
```

Backend:
```bash
cd server
npm run seed
npm run dev
```
