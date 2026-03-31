import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import {
    selectIsAuthInitialized,
    selectIsLoggedIn,
} from '../../store/selectors/authSelectors';

const RequireAuth = () => {
    const location = useLocation();
    const isAuthInitialized = useAppSelector(selectIsAuthInitialized);
    const isLoggedIn = useAppSelector(selectIsLoggedIn);

    if (!isAuthInitialized) {
        return null;
    }

    if (!isLoggedIn) {
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    returnTo: `${location.pathname}${location.search}${location.hash}`,
                }}
            />
        );
    }

    return <Outlet />;
};

export default RequireAuth;
