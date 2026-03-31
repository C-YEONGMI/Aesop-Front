import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../app/store/hooks';
import {
    loginWithPassword,
    loginWithSocialProfile,
    loginWithTestAccount,
} from '../../app/store/slices/authSlice';
import kakaoLogoImage from '../../assets/kakao-logo.png';
import {
    beginSocialLogin,
    consumeSocialReturnTo,
    prepareRedirectSocialLogin,
} from '../../lib/socialAuth';
import './Auth.scss';

const TEST_ACCOUNT = {
    userId: 'testuser',
    name: '테스트 사용자',
    email: 'test@aesop.com',
    password: 'test1234',
    phone: '01012345678',
};

const NAVER_TEST_ACCOUNT_ID = 'aesop-test';
const NAVER_TEST_ACCOUNT_PASSWORD = 'test.1234';

const REMEMBER_IDENTIFIER_KEY = 'aesop-remembered-identifier';
const getErrorMessage = (error, fallbackMessage) =>
    error instanceof Error ? error.message : error || fallbackMessage;

const Login = () => {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const [form, setForm] = useState({ identifier: '', password: '' });
    const [error, setError] = useState('');
    const [rememberIdentifier, setRememberIdentifier] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [activeSocialNotice, setActiveSocialNotice] = useState('');
    const [naverLoginHref, setNaverLoginHref] = useState('');
    const postLoginPath =
        typeof location.state?.returnTo === 'string' && location.state.returnTo.startsWith('/')
            ? location.state.returnTo
            : '/';

    useEffect(() => {
        const rememberedIdentifier = window.localStorage.getItem(REMEMBER_IDENTIFIER_KEY);

        if (rememberedIdentifier) {
            setForm((current) => ({ ...current, identifier: rememberedIdentifier }));
            setRememberIdentifier(true);
        }
    }, []);

    const closeSocialNotice = () => {
        setActiveSocialNotice('');
        setNaverLoginHref('');
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));

        if (error) {
            setError('');
        }
    };

    const syncRememberedIdentifier = (identifier) => {
        if (rememberIdentifier && identifier.trim()) {
            window.localStorage.setItem(REMEMBER_IDENTIFIER_KEY, identifier.trim());
            return;
        }

        window.localStorage.removeItem(REMEMBER_IDENTIFIER_KEY);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        try {
            await dispatch(
                loginWithPassword({
                    identifier: form.identifier,
                    password: form.password,
                })
            ).unwrap();
            syncRememberedIdentifier(form.identifier);
            navigate(postLoginPath, { replace: true });
        } catch (nextError) {
            setError(getErrorMessage(nextError, '로그인에 실패했습니다.'));
        }
    };

    const handleSocialLogin = async (provider) => {
        setError('');

        try {
            if (provider === 'naver') {
                setNaverLoginHref(prepareRedirectSocialLogin('naver', { returnTo: postLoginPath }));
                setActiveSocialNotice('naver');
                return;
            }

            closeSocialNotice();
            await beginSocialLogin(provider, { returnTo: postLoginPath });
        } catch (nextError) {
            setError(getErrorMessage(nextError, '소셜 로그인 중 오류가 발생했습니다.'));
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        closeSocialNotice();

        try {
            const result = await beginSocialLogin('google', { returnTo: postLoginPath });
            const profile = result?.profile;

            if (!profile) {
                throw new Error('구글 프로필 정보를 불러오지 못했습니다.');
            }

            await dispatch(loginWithSocialProfile({ provider: 'google', profile })).unwrap();

            navigate(consumeSocialReturnTo(), { replace: true });
        } catch (nextError) {
            setError(getErrorMessage(nextError, '구글 로그인 중 오류가 발생했습니다.'));
        }
    };

    const handleTestLogin = async () => {
        setError('');
        setForm({ identifier: TEST_ACCOUNT.userId, password: TEST_ACCOUNT.password });

        try {
            await dispatch(loginWithTestAccount(TEST_ACCOUNT)).unwrap();

            if (rememberIdentifier) {
                window.localStorage.setItem(REMEMBER_IDENTIFIER_KEY, TEST_ACCOUNT.userId);
            }

            navigate(postLoginPath, { replace: true });
        } catch (nextError) {
            setError(getErrorMessage(nextError, '테스트 계정 로그인에 실패했습니다.'));
        }
    };

    const handleRememberChange = (event) => {
        const nextChecked = event.target.checked;
        setRememberIdentifier(nextChecked);

        if (nextChecked && form.identifier.trim()) {
            window.localStorage.setItem(REMEMBER_IDENTIFIER_KEY, form.identifier.trim());
            return;
        }

        if (!nextChecked) {
            window.localStorage.removeItem(REMEMBER_IDENTIFIER_KEY);
        }
    };

    const handleGoogleButtonMouseLeave = (event) => {
        event.currentTarget.blur();
    };

    const handleSocialButtonMouseLeave = (event) => {
        event.currentTarget.blur();
    };

    return (
        <div className="auth-page auth-page--login">
            <div className="auth-page__header-space" />
            <div className="auth-page__inner auth-page__inner--login">
                <h1 className="auth-page__title auth-page__title--login optima-40">로그인</h1>

                <form className="auth-page__form auth-page__form--login" onSubmit={handleSubmit}>
                    <div className="auth-page__field auth-page__field--line">
                        <label className="auth-page__sr-only" htmlFor="login-identifier">
                            아이디 또는 이메일
                        </label>
                        <div className="auth-page__line-control">
                            <User size={18} className="auth-page__input-icon" aria-hidden="true" />
                            <input
                                id="login-identifier"
                                type="text"
                                name="identifier"
                                value={form.identifier}
                                onChange={handleChange}
                                className="suit-16-r"
                                placeholder="아이디를 입력하세요"
                                autoComplete="username"
                                required
                            />
                        </div>
                    </div>

                    <div className="auth-page__field auth-page__field--line">
                        <label className="auth-page__sr-only" htmlFor="login-password">
                            비밀번호
                        </label>
                        <div className="auth-page__line-control auth-page__line-control--password">
                            <Lock size={18} className="auth-page__input-icon" aria-hidden="true" />
                            <input
                                id="login-password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                className="suit-16-r"
                                placeholder="비밀번호를 입력하세요"
                                autoComplete="current-password"
                                required
                            />
                            <button
                                type="button"
                                className="auth-page__password-toggle auth-page__password-toggle--line"
                                onClick={() => setShowPassword((current) => !current)}
                                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <label className="auth-page__remember auth-page__remember--login suit-14-m" htmlFor="login-remember">
                        <input
                            id="login-remember"
                            type="checkbox"
                            checked={rememberIdentifier}
                            onChange={handleRememberChange}
                        />
                        <span>아이디 저장</span>
                    </label>

                    {error ? <p className="auth-page__error auth-page__error--login suit-14-m">{error}</p> : null}

                    <button type="submit" className="auth-page__submit auth-page__submit--login suit-16-r">
                        로그인
                    </button>
                </form>

                <div className="auth-page__quick-links suit-14-m">
                    <Link to="/find-account">계정 찾기</Link>
                    <Link to="/find-account">비밀번호 재설정</Link>
                    <Link to="/signup">회원가입</Link>
                </div>

                <div className="auth-page__simple-login">
                    <div className="auth-page__divider auth-page__divider--simple" aria-hidden="true">
                        <span className="auth-page__divider-line" />
                        <span className="auth-page__divider-text suit-14-r">소셜 로그인</span>
                        <span className="auth-page__divider-line" />
                    </div>

                    <div className="auth-page__social-stack">
                        <button
                            type="button"
                            className="auth-page__social-long-button auth-page__social-long-button--kakao"
                            onClick={() => handleSocialLogin('kakao')}
                            aria-label="카카오로 로그인"
                            onMouseLeave={handleSocialButtonMouseLeave}
                        >
                            <span className="auth-page__social-long-button-content">
                                <span className="auth-page__social-long-button-icon" aria-hidden="true">
                                    <img src={kakaoLogoImage} alt="" />
                                </span>
                                <span className="auth-page__social-long-button-text">카카오로 로그인</span>
                            </span>
                        </button>

                        <button
                            type="button"
                            className="auth-page__social-long-button auth-page__social-long-button--google"
                            onClick={handleGoogleLogin}
                            onMouseLeave={handleGoogleButtonMouseLeave}
                            aria-label="구글로 로그인"
                        >
                            <span className="auth-page__social-long-button-content">
                                <span className="auth-page__social-long-button-icon" aria-hidden="true">
                                    <span className="gsi-material-button-icon">
                                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" aria-hidden="true">
                                            <path
                                                fill="#EA4335"
                                                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                                            />
                                            <path
                                                fill="#4285F4"
                                                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                                            />
                                            <path
                                                fill="#FBBC05"
                                                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                                            />
                                            <path
                                                fill="#34A853"
                                                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                                            />
                                            <path fill="none" d="M0 0h48v48H0z" />
                                        </svg>
                                    </span>
                                </span>
                                <span className="auth-page__social-long-button-text">구글로 로그인</span>
                            </span>
                            <span className="auth-page__sr-only">구글로 로그인</span>
                        </button>

                        <button
                            type="button"
                            className="auth-page__social-long-button auth-page__social-long-button--naver"
                            onClick={() => handleSocialLogin('naver')}
                            onMouseLeave={handleSocialButtonMouseLeave}
                            aria-label="네이버로 로그인"
                        >
                            <span className="auth-page__social-long-button-content">
                                <span className="auth-page__social-long-button-icon" aria-hidden="true">
                                    <svg viewBox="18 14 36 36">
                                        <path d="M22 18h8.2l11.6 16.6V18H50v28h-8.2L30.2 29.4V46H22V18Z" fill="currentColor" />
                                    </svg>
                                </span>
                                <span className="auth-page__social-long-button-text">네이버로 로그인</span>
                            </span>
                        </button>
                    </div>
                </div>

                <button
                    type="button"
                    className="auth-page__test-btn auth-page__test-btn--login suit-12-r"
                    onClick={handleTestLogin}
                >
                    테스트 계정으로 로그인
                </button>
            </div>

            {activeSocialNotice === 'naver' ? (
                <div
                    className="auth-page__modal-backdrop"
                    role="presentation"
                    onClick={closeSocialNotice}
                >
                    <div
                        className="auth-page__modal-panel"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="naver-social-notice-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h2 id="naver-social-notice-title" className="auth-page__modal-title suit-18-m">
                            네이버 테스트 로그인
                        </h2>
                        <div className="auth-page__social-notice">
                            <p className="auth-page__social-notice-text suit-14-r">
                                이 프로젝트에 설정된 테스트 계정으로만 네이버 로그인을 진행할 수 있습니다.
                            </p>
                            <p className="auth-page__social-notice-id suit-14-m">
                                테스트 아이디: <strong>{NAVER_TEST_ACCOUNT_ID}</strong>
                            </p>
                            <p className="auth-page__social-notice-id suit-14-m">
                                테스트 비밀번호: <strong>{NAVER_TEST_ACCOUNT_PASSWORD}</strong>
                            </p>
                        </div>
                        <div className="auth-page__social-notice-actions">
                            <a
                                href={naverLoginHref || '#'}
                                className="auth-page__social-notice-btn auth-page__social-notice-btn--primary suit-14-m"
                            >
                                네이버로 계속하기
                            </a>
                            <button
                                type="button"
                                className="auth-page__social-notice-btn suit-14-m"
                                onClick={closeSocialNotice}
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default Login;
