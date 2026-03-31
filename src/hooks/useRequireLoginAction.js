import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppSelector } from '../app/store/hooks';
import { selectIsLoggedIn } from '../app/store/selectors/authSelectors';
import useLoginRequiredModalStore from '../store/useLoginRequiredModalStore';

const useRequireLoginAction = () => {
    const location = useLocation();
    const isLoggedIn = useAppSelector(selectIsLoggedIn);
    const openLoginRequiredModal = useLoginRequiredModalStore((state) => state.open);

    return useCallback(
        (action) => {
            if (!isLoggedIn) {
                openLoginRequiredModal(
                    `${location.pathname}${location.search}${location.hash}`
                );
                return false;
            }

            if (typeof action === 'function') {
                action();
            }

            return true;
        },
        [isLoggedIn, location.hash, location.pathname, location.search, openLoginRequiredModal]
    );
};

export default useRequireLoginAction;
