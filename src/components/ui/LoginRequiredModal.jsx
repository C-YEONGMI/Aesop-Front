import React from 'react';
import { useNavigate } from 'react-router-dom';
import useLoginRequiredModalStore from '../../store/useLoginRequiredModalStore';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from './Dialog';
import './LoginRequiredModal.scss';

const LoginRequiredModal = () => {
    const navigate = useNavigate();
    const isOpen = useLoginRequiredModalStore((state) => state.isOpen);
    const returnTo = useLoginRequiredModalStore((state) => state.returnTo);
    const close = useLoginRequiredModalStore((state) => state.close);

    const handleOpenChange = (nextOpen) => {
        if (!nextOpen) {
            close();
        }
    };

    const handleGoToLogin = () => {
        close();
        navigate('/login', {
            state: {
                returnTo,
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent
                className="login-required-modal"
                aria-describedby="login-required-modal-description"
            >
                <DialogHeader className="login-required-modal__header">
                    <p className="login-required-modal__eyebrow suit-12-r">Member Service</p>
                    <DialogTitle className="login-required-modal__title optima-20">
                        로그인이 필요한 서비스입니다
                    </DialogTitle>
                    <DialogDescription
                        className="login-required-modal__description suit-16-r"
                        id="login-required-modal-description"
                    >
                        위시리스트와 장바구니는 로그인 후 이용하실 수 있습니다.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="login-required-modal__actions">
                    <DialogClose asChild>
                        <button
                            type="button"
                            className="login-required-modal__button login-required-modal__button--secondary suit-14-m"
                        >
                            닫기
                        </button>
                    </DialogClose>

                    <button
                        type="button"
                        className="login-required-modal__button login-required-modal__button--primary suit-14-m"
                        onClick={handleGoToLogin}
                    >
                        로그인하기
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default LoginRequiredModal;
