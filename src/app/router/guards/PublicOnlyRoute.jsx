import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import {
    selectIsAuthInitialized,
    selectIsLoggedIn,
} from '../../store/selectors/authSelectors';

const PublicOnlyRoute = () => {
    const isAuthInitialized = useAppSelector(selectIsAuthInitialized);
    const isLoggedIn = useAppSelector(selectIsLoggedIn);

    if (!isAuthInitialized) {
        return null;
    }

    if (isLoggedIn) {
        return <Navigate to="/mypage" replace />;
    }

    return <Outlet />;
};

export default PublicOnlyRoute;
