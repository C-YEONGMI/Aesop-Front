import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch } from '../../app/store/hooks';
import { loginWithSocialProfile } from '../../app/store/slices/authSlice';
import {
    completeRedirectSocialLogin,
    consumeSocialReturnTo,
    getSocialProviderLabel,
    isRedirectSocialProvider,
} from '../../lib/socialAuth';
import './Auth.scss';

const INITIAL_STATUS = {
    type: 'pending',
    title: '소셜 로그인 상태를 확인하고 있습니다.',
    message: '계정 정보를 불러오는 동안 잠시만 기다려주세요.',
};

const getErrorMessage = (error, fallbackMessage) =>
    error instanceof Error ? error.message : error || fallbackMessage;

const callbackRequestCache = new Map();

const SocialAuthCallback = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { provider = '' } = useParams();
    const [status, setStatus] = useState(INITIAL_STATUS);

    useEffect(() => {
        let isActive = true;

        const run = async () => {
            if (!isRedirectSocialProvider(provider)) {
                if (!isActive) {
                    return;
                }

                setStatus({
                    type: 'error',
                    title: '지원하지 않는 소셜 로그인 경로입니다.',
                    message: '로그인 페이지로 돌아가 다시 시도해주세요.',
                });
                return;
            }

            const callbackKey = `${provider}:${window.location.search}`;

            if (!callbackRequestCache.has(callbackKey)) {
                callbackRequestCache.set(
                    callbackKey,
                    (async () => {
                        const searchParams = new URLSearchParams(window.location.search);
                        const { profile } = await completeRedirectSocialLogin(provider, searchParams);

                        await dispatch(loginWithSocialProfile({ provider, profile })).unwrap();

                        return consumeSocialReturnTo();
                    })()
                );
            }

            try {
                const nextPath = await callbackRequestCache.get(callbackKey);

                if (!isActive) {
                    return;
                }

                navigate(nextPath, { replace: true });
            } catch (error) {
                callbackRequestCache.delete(callbackKey);

                if (!isActive) {
                    return;
                }

                setStatus({
                    type: 'error',
                    title: `${getSocialProviderLabel(provider)} 로그인을 완료할 수 없습니다.`,
                    message: getErrorMessage(error, '잠시 후 다시 시도해주세요.'),
                });
            }
        };

        run();

        return () => {
            isActive = false;
        };
    }, [dispatch, navigate, provider]);

    return (
        <div className="auth-page auth-page--status">
            <div className="auth-page__header-space" />
            <div className="auth-page__inner">
                <div className="auth-page__status-card">
                    {status.type === 'pending' ? (
                        <span className="auth-page__status-spinner" aria-hidden="true" />
                    ) : null}

                    <h1 className="auth-page__status-title optima-20">{status.title}</h1>
                    <p className="auth-page__status-message suit-14-m">{status.message}</p>

                    {status.type === 'error' ? (
                        <div className="auth-page__status-actions suit-14-m">
                            <Link to="/login">로그인으로 돌아가기</Link>
                            <Link to="/">홈으로 가기</Link>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default SocialAuthCallback;
