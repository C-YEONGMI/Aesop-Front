import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/store/hooks';
import { selectAuthUsers } from '../../app/store/selectors/authSelectors';
import { signupWithPassword } from '../../app/store/slices/authSlice';
import { Calendar } from '../../components/ui/Calendar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/Select';
import './Signup.scss';

const INITIAL_FORM = {
    userId: '',
    name: '',
    password: '',
    passwordConfirm: '',
    birthDate: '',
    gender: '',
    verificationEmail: '',
};

const GENDER_OPTIONS = [
    { value: '', label: '성별 선택' },
    { value: 'female', label: '여성' },
    { value: 'male', label: '남성' },
];

const USER_ID_PATTERN = /^[a-z0-9_-]{5,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const parseDateString = (value) => {
    if (!value) {
        return undefined;
    }

    const [year, month, day] = value.split('-').map(Number);

    if (!year || !month || !day) {
        return undefined;
    }

    return new Date(year, month - 1, day);
};

const formatDateValue = (value) => {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatDateDisplay = (value) => {
    if (!value) {
        return 'YYYY.MM.DD';
    }

    return value.replace(/-/g, '.');
};

const getErrorMessage = (error, fallbackMessage) =>
    error instanceof Error ? error.message : error || fallbackMessage;

const Signup = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const users = useAppSelector(selectAuthUsers);

    const [form, setForm] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});
    const [activeField, setActiveField] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [userIdStatus, setUserIdStatus] = useState('idle');
    const [isBirthCalendarOpen, setIsBirthCalendarOpen] = useState(false);
    const birthDateFieldRef = useRef(null);
    const selectedBirthDate = useMemo(() => parseDateString(form.birthDate), [form.birthDate]);
    const todayDate = useMemo(() => parseDateString(getTodayString()), []);
    const firstBirthMonth = useMemo(() => new Date(1900, 0, 1), []);

    useEffect(() => {
        if (!isBirthCalendarOpen) {
            return undefined;
        }

        const handlePointerDown = (event) => {
            if (!birthDateFieldRef.current?.contains(event.target)) {
                setIsBirthCalendarOpen(false);
                setActiveField('');
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsBirthCalendarOpen(false);
                setActiveField('');
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('touchstart', handlePointerDown);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('touchstart', handlePointerDown);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isBirthCalendarOpen]);

    const clearFieldError = (name) => {
        setErrors((current) => {
            if (!current[name]) {
                return current;
            }

            const next = { ...current };
            delete next[name];
            return next;
        });
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        let nextValue = value;

        if (name === 'userId') {
            nextValue = value.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 20);
            setUserIdStatus('idle');
            clearFieldError('userId');
        }

        if (name === 'birthDate' || name === 'gender' || name === 'verificationEmail') {
            clearFieldError(name);
        }

        if (name === 'name' || name === 'password' || name === 'passwordConfirm') {
            clearFieldError(name);
        }

        setForm((current) => ({ ...current, [name]: nextValue }));
    };

    const handleBirthDateSelect = (nextDate) => {
        if (!nextDate) {
            return;
        }

        clearFieldError('birthDate');
        setForm((current) => ({
            ...current,
            birthDate: formatDateValue(nextDate),
        }));
        setIsBirthCalendarOpen(false);
        setActiveField('');
    };

    const handleUserIdBlur = () => {
        setActiveField('');

        if (!form.userId) {
            setUserIdStatus('idle');
            return;
        }

        if (!USER_ID_PATTERN.test(form.userId)) {
            setUserIdStatus('taken');
            setErrors((current) => ({
                ...current,
                userId: '영문 소문자, 숫자, 밑줄(_), 하이픈(-)으로 5~20자 입력해주세요.',
            }));
            return;
        }

        const isTaken = users.some(
            (user) => user.userId?.toLowerCase() === form.userId.toLowerCase()
        );

        if (isTaken) {
            setUserIdStatus('taken');
            setErrors((current) => ({
                ...current,
                userId: '이미 사용 중인 아이디입니다.',
            }));
            return;
        }

        clearFieldError('userId');
        setUserIdStatus('available');
    };

    const validate = () => {
        const nextErrors = {};

        if (!form.userId) {
            nextErrors.userId = '아이디를 입력해주세요.';
        } else if (!USER_ID_PATTERN.test(form.userId)) {
            nextErrors.userId = '영문 소문자, 숫자, 밑줄(_), 하이픈(-)으로 5~20자 입력해주세요.';
        }

        if (!form.name.trim()) {
            nextErrors.name = '이름을 입력해주세요.';
        }

        if (!form.password) {
            nextErrors.password = '비밀번호를 입력해주세요.';
        } else if (form.password.length < 8) {
            nextErrors.password = '비밀번호는 8자 이상이어야 합니다.';
        }

        if (!form.passwordConfirm) {
            nextErrors.passwordConfirm = '비밀번호 확인을 입력해주세요.';
        } else if (form.password !== form.passwordConfirm) {
            nextErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
        }

        if (!form.birthDate) {
            nextErrors.birthDate = '생년월일을 선택해주세요.';
        }

        if (!form.gender) {
            nextErrors.gender = '성별을 선택해주세요.';
        }

        if (form.verificationEmail && !EMAIL_PATTERN.test(form.verificationEmail)) {
            nextErrors.verificationEmail = '올바른 이메일 주소를 입력해주세요.';
        }

        return nextErrors;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const nextErrors = validate();

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }

        try {
            await dispatch(
                signupWithPassword({
                    userId: form.userId,
                    name: form.name.trim(),
                    email: form.verificationEmail.trim(),
                    password: form.password,
                    gender: form.gender,
                    birthDate: form.birthDate,
                })
            ).unwrap();

            navigate('/');
        } catch (signupError) {
            const message = getErrorMessage(signupError, '회원가입에 실패했습니다.');
            setErrors((current) => ({
                ...current,
                userId:
                    message === '이미 사용 중인 아이디입니다.'
                        ? message
                        : current.userId,
                verificationEmail:
                    message === '이미 사용 중인 이메일입니다.'
                        ? message
                        : current.verificationEmail,
            }));
        }
    };

    const getControlClassName = (name, modifiers = '') => {
        const hasError = Boolean(errors[name]);
        const isActive = activeField === name;

        return [
            'signup-page__control-surface',
            modifiers,
            hasError ? 'signup-page__control-surface--error' : '',
            isActive ? 'signup-page__control-surface--active' : '',
        ]
            .filter(Boolean)
            .join(' ');
    };

    return (
        <div className="signup-page">
            <div className="signup-page__header-space" />

            <div className="signup-page__shell">
                <div className="signup-page__panel">
                    <div className="signup-page__intro">
                        <div className="signup-page__intro-copy">
                            <h1 className="montage-80 signup-page__hero-title">회원가입</h1>
                            <p className="suit-12-r signup-page__hero-subtitle">
                                계정을 만들고 이솝의 리추얼을 이어가세요.
                            </p>
                        </div>
                        <h1 className="optima-40 signup-page__title">만나서 반갑습니다</h1>
                        <p className="suit-12-r signup-page__copy">
                            아래 정보를 입력해 계정을 생성하세요.
                        </p>
                    </div>

                    <form className="signup-page__form" onSubmit={handleSubmit} noValidate>
                        <div className="signup-page__field">
                            <label className="signup-page__label suit-12-r" htmlFor="signup-user-id">
                                아이디
                            </label>
                            <div className="signup-page__control">
                                <input
                                    id="signup-user-id"
                                    className={`${getControlClassName('userId')} suit-16-r`}
                                    name="userId"
                                    type="text"
                                    value={form.userId}
                                    onChange={handleChange}
                                    onFocus={() => setActiveField('userId')}
                                    onBlur={handleUserIdBlur}
                                    autoComplete="username"
                                />
                            </div>
                            {errors.userId ? (
                                <p className="signup-page__message signup-page__message--error suit-12-r">
                                    {errors.userId}
                                </p>
                            ) : null}
                            {userIdStatus === 'available' ? (
                                <p className="signup-page__message signup-page__message--success suit-12-r">
                                    사용 가능한 아이디입니다.
                                </p>
                            ) : null}
                        </div>

                        <div className="signup-page__field">
                            <label className="signup-page__label suit-12-r" htmlFor="signup-name">
                                이름
                            </label>
                            <div className="signup-page__control">
                                <input
                                    id="signup-name"
                                    className={`${getControlClassName('name')} suit-16-r`}
                                    name="name"
                                    type="text"
                                    value={form.name}
                                    onChange={handleChange}
                                    onFocus={() => setActiveField('name')}
                                    onBlur={() => setActiveField('')}
                                    autoComplete="name"
                                />
                            </div>
                            {errors.name ? (
                                <p className="signup-page__message signup-page__message--error suit-12-r">
                                    {errors.name}
                                </p>
                            ) : null}
                        </div>

                        <div className="signup-page__field">
                            <label className="signup-page__label suit-12-r" htmlFor="signup-password">
                                비밀번호
                            </label>
                            <div className="signup-page__control">
                                <input
                                    id="signup-password"
                                    className={`${getControlClassName('password')} suit-16-r`}
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={handleChange}
                                    onFocus={() => setActiveField('password')}
                                    onBlur={() => setActiveField('')}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    className="signup-page__icon-button"
                                    onClick={() => setShowPassword((current) => !current)}
                                    aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password ? (
                                <p className="signup-page__message signup-page__message--error suit-12-r">
                                    {errors.password}
                                </p>
                            ) : null}
                        </div>

                        <div className="signup-page__field">
                            <label className="signup-page__label suit-12-r" htmlFor="signup-password-confirm">
                                비밀번호 확인
                            </label>
                            <div className="signup-page__control">
                                <input
                                    id="signup-password-confirm"
                                    className={`${getControlClassName('passwordConfirm')} suit-16-r`}
                                    name="passwordConfirm"
                                    type={showPasswordConfirm ? 'text' : 'password'}
                                    value={form.passwordConfirm}
                                    onChange={handleChange}
                                    onFocus={() => setActiveField('passwordConfirm')}
                                    onBlur={() => setActiveField('')}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    className="signup-page__icon-button"
                                    onClick={() => setShowPasswordConfirm((current) => !current)}
                                    aria-label={showPasswordConfirm ? '비밀번호 숨기기' : '비밀번호 보기'}
                                >
                                    {showPasswordConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.passwordConfirm ? (
                                <p className="signup-page__message signup-page__message--error suit-12-r">
                                    {errors.passwordConfirm}
                                </p>
                            ) : null}
                        </div>

                        <div className="signup-page__field">
                            <div className="signup-page__label-row">
                                <label className="signup-page__label suit-12-r" htmlFor="signup-birth-date">
                                    생년월일
                                </label>
                                <span className="signup-page__hint suit-12-r">캘린더에서 선택</span>
                            </div>
                            <div
                                className="signup-page__control signup-page__control--date"
                                ref={birthDateFieldRef}
                            >
                                <button
                                    id="signup-birth-date"
                                    className={`${getControlClassName(
                                        'birthDate',
                                        'signup-page__date-trigger'
                                    )} suit-16-r`}
                                    type="button"
                                    aria-haspopup="dialog"
                                    aria-expanded={isBirthCalendarOpen}
                                    onClick={() => {
                                        const nextOpen = !isBirthCalendarOpen;
                                        setIsBirthCalendarOpen(nextOpen);
                                        setActiveField(nextOpen ? 'birthDate' : '');
                                    }}
                                >
                                    <span
                                        className={`signup-page__date-trigger-value${
                                            form.birthDate ? ' signup-page__date-trigger-value--filled' : ''
                                        }`}
                                    >
                                        {formatDateDisplay(form.birthDate)}
                                    </span>
                                    <span className="signup-page__date-trigger-meta">
                                        <CalendarDays size={16} className="signup-page__date-trigger-icon" />
                                        <ChevronDown size={14} className="signup-page__date-trigger-chevron" />
                                    </span>
                                </button>
                                {isBirthCalendarOpen ? (
                                    <div className="signup-page__date-popover" role="dialog" aria-modal="false">
                                        <Calendar
                                            mode="single"
                                            selected={selectedBirthDate}
                                            onSelect={handleBirthDateSelect}
                                            defaultMonth={selectedBirthDate || new Date(1996, 0, 1)}
                                            captionLayout="dropdown"
                                            startMonth={firstBirthMonth}
                                            endMonth={todayDate}
                                            disabled={[
                                                { before: firstBirthMonth },
                                                { after: todayDate },
                                            ]}
                                        />
                                    </div>
                                ) : null}
                            </div>
                            {errors.birthDate ? (
                                <p className="signup-page__message signup-page__message--error suit-12-r">
                                    {errors.birthDate}
                                </p>
                            ) : null}
                        </div>

                        <div className="signup-page__field">
                            <label className="signup-page__label suit-12-r" htmlFor="signup-gender">
                                성별
                            </label>
                            <div className="signup-page__control">
                                <Select
                                    value={form.gender}
                                    onValueChange={(value) => {
                                        clearFieldError('gender');
                                        setForm((current) => ({ ...current, gender: value }));
                                    }}
                                    onOpenChange={(open) => {
                                        setActiveField(open ? 'gender' : '');
                                    }}
                                >
                                    <SelectTrigger
                                        id="signup-gender"
                                        className={`${getControlClassName(
                                            'gender',
                                            'signup-page__select-trigger'
                                        )} suit-16-r`}
                                    >
                                        <SelectValue placeholder={GENDER_OPTIONS[0].label} />
                                    </SelectTrigger>
                                    <SelectContent className="signup-page__select-content">
                                        {GENDER_OPTIONS.filter((option) => option.value).map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {errors.gender ? (
                                <p className="signup-page__message signup-page__message--error suit-12-r">
                                    {errors.gender}
                                </p>
                            ) : null}
                        </div>

                        <div className="signup-page__field">
                            <div className="signup-page__label-row">
                                <label
                                    className="signup-page__label suit-12-r"
                                    htmlFor="signup-verification-email"
                                >
                                    확인용 이메일
                                </label>
                                <span className="signup-page__optional suit-12-r">(선택)</span>
                            </div>
                            <div className="signup-page__control">
                                <input
                                    id="signup-verification-email"
                                    className={`${getControlClassName('verificationEmail')} suit-16-r`}
                                    name="verificationEmail"
                                    type="email"
                                    value={form.verificationEmail}
                                    onChange={handleChange}
                                    onFocus={() => setActiveField('verificationEmail')}
                                    onBlur={() => setActiveField('')}
                                    placeholder="선택 입력 이메일"
                                    autoComplete="email"
                                />
                            </div>
                            {errors.verificationEmail ? (
                                <p className="signup-page__message signup-page__message--error suit-12-r">
                                    {errors.verificationEmail}
                                </p>
                            ) : null}
                        </div>

                        <div className="signup-page__divider" aria-hidden="true" />

                        <button type="submit" className="signup-page__submit suit-14-m">
                            계정 만들기
                        </button>
                    </form>

                    <p className="signup-page__footer suit-12-r">
                        이미 계정이 있으신가요?{' '}
                        <Link to="/login" className="signup-page__footer-link">
                            로그인
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
