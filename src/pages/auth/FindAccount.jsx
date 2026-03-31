import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '../../app/store/hooks';
import { checkAccountExists } from '../../app/store/slices/authSlice';
import './Auth.scss';

const FindAccount = () => {
    const dispatch = useAppDispatch();
    const [email, setEmail] = useState('');
    const [result, setResult] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await dispatch(checkAccountExists(email)).unwrap();
            setResult(Boolean(response?.found));
        } catch {
            setResult(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-page__header-space" />
            <div className="auth-page__inner">
                <h1 className="auth-page__title optima-40">계정 찾기</h1>

                <form className="auth-page__form" onSubmit={handleSubmit}>
                    <div className="auth-page__field">
                        <label className="suit-14-m">이메일</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="suit-16-r"
                            placeholder="가입 시 사용한 이메일을 입력하세요"
                            required
                        />
                    </div>
                    {result !== null && (
                        <p className={`auth-page__error suit-14-m ${result ? 'found' : ''}`} style={{ color: result ? '#27ae60' : '#c0392b' }}>
                            {result ? '가입된 계정이 확인되었습니다. 로그인 페이지에서 로그인해주세요.' : '해당 이메일로 가입된 계정이 없습니다.'}
                        </p>
                    )}
                    <button type="submit" className="auth-page__submit suit-18-m">
                        계정 확인
                    </button>
                </form>

                <div className="auth-page__links suit-14-m">
                    <Link to="/login">로그인</Link>
                    <span>|</span>
                    <Link to="/signup">회원가입</Link>
                </div>
            </div>
        </div>
    );
};

export default FindAccount;
