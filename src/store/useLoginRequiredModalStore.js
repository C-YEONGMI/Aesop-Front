import { create } from 'zustand';

const useLoginRequiredModalStore = create((set) => ({
    isOpen: false,
    returnTo: '/',
    open: (returnTo = '/') =>
        set({
            isOpen: true,
            returnTo,
        }),
    close: () =>
        set({
            isOpen: false,
            returnTo: '/',
        }),
}));

export default useLoginRequiredModalStore;
