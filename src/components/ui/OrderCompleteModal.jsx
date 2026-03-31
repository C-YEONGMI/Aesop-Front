import React from 'react';
import { useNavigate } from 'react-router-dom';
import useOrderStore from '../../store/useOrderStore';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from './Dialog';
import './OrderCompleteModal.scss';

const OrderCompleteModal = () => {
    const navigate = useNavigate();
    const isOpen = useOrderStore((state) => state.isOrderCompleteOpen);
    const closeOrderComplete = useOrderStore((state) => state.closeOrderComplete);

    const handleOpenChange = (nextOpen) => {
        if (!nextOpen) {
            closeOrderComplete();
        }
    };

    const handleGoToOrders = () => {
        closeOrderComplete();
        navigate('/mypage');
    };

    const handleGoToHome = () => {
        closeOrderComplete();
        navigate('/');
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent
                className="order-complete"
                aria-describedby="order-complete-description"
            >
                <DialogHeader className="order-complete__header">
                    <p className="order-complete__eyebrow suit-12-r">Order Complete</p>
                    <DialogTitle className="sr-only">주문 완료</DialogTitle>
                </DialogHeader>

                <div className="order-complete__animation" aria-hidden="true">
                    <svg
                        className="order-complete__svg"
                        width="72"
                        height="72"
                        viewBox="0 0 72 72"
                        fill="none"
                    >
                        <circle
                            className="order-complete__circle"
                            cx="36"
                            cy="36"
                            r="33"
                            stroke="#a3b18a"
                            strokeWidth="2"
                            strokeLinecap="round"
                            fill="none"
                        />
                        <polyline
                            className="order-complete__check"
                            points="24,37 32,45 48,29"
                            stroke="#a3b18a"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                        />
                    </svg>
                </div>

                <div className="order-complete__text">
                    <p className="order-complete__main">
                        주문이 완료되었습니다.
                    </p>
                    <DialogDescription
                        className="order-complete__sub suit-14-r"
                        id="order-complete-description"
                    >
                        곧 이솝의 향기를 전해드릴게요.
                        <br />
                        이솝의 지속 가능한 환경을 위한 움직임에 동참해 주셔서 감사합니다.
                    </DialogDescription>
                </div>

                <DialogFooter className="order-complete__actions">
                    <button
                        type="button"
                        className="order-complete__button order-complete__button--secondary suit-14-m"
                        onClick={handleGoToOrders}
                    >
                        주문 내역 보기
                    </button>
                    <button
                        type="button"
                        className="order-complete__button order-complete__button--primary suit-14-m"
                        onClick={handleGoToHome}
                    >
                        홈으로 가기
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default OrderCompleteModal;
