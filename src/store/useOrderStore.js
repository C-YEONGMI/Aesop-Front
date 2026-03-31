import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 주문 스토어
const useOrderStore = create(
    persist(
        (set, get) => ({
            orders: [],
            isOrderCompleteOpen: false,

            // 주문 저장
            createOrder: (orderData) => {
                const newOrder = {
                    id: `ORDER-${Date.now()}`,
                    ...orderData,
                    status: '주문완료',
                    createdAt: new Date().toISOString(),
                };
                set({ orders: [newOrder, ...get().orders], isOrderCompleteOpen: true });
                return newOrder;
            },

            closeOrderComplete: () => set({ isOrderCompleteOpen: false }),

            // 사용자별 주문 조회
            getOrdersByUser: (userId) => {
                return get().orders.filter(o => o.userId === userId);
            },
        }),
        {
            name: 'aesop-orders',
            partialize: (state) => ({ orders: state.orders }),
        }
    )
);

export default useOrderStore;
