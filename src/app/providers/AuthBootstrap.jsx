import { useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import {
    bootstrapAuthSession,
    refreshAuthSession,
} from '../store/slices/authSlice';
import { clearRefreshHandler, registerRefreshHandler } from '../../lib/auth/refreshManager';

const AuthBootstrap = ({ children }) => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        const unregisterRefreshHandler = registerRefreshHandler(() =>
            dispatch(refreshAuthSession()).unwrap()
        );

        dispatch(bootstrapAuthSession());

        return () => {
            unregisterRefreshHandler();
            clearRefreshHandler();
        };
    }, [dispatch]);

    return children;
};

export default AuthBootstrap;
