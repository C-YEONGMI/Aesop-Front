import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 고객지원 스토어 (문의, Q&A 등)
const useSupportStore = create(
    persist(
        (set, get) => ({
            inquiries: [],
            qnas: [],
            notices: [
                {
                    id: 'n1',
                    title: '2025 이솝 홀리데이 컬렉션 출시 안내',
                    date: '2025-11-20',
                    content:
                        '이솝 홀리데이 컬렉션이 출시되었습니다. 공식몰에서 단독으로 만나보세요.',
                },
                {
                    id: 'n2',
                    title: '배송 지연 안내',
                    date: '2025-11-15',
                    content:
                        '물류 상황으로 인해 일부 지역 배송이 지연될 수 있습니다. 양해 부탁드립니다.',
                },
                {
                    id: 'n3',
                    title: '개인정보처리방침 개정 안내',
                    date: '2025-10-01',
                    content: '개인정보처리방침이 개정되었습니다. 자세한 내용을 확인해주세요.',
                },
            ],
            faqs: [
                {
                    id: 'f1',
                    category: '주문/배송',
                    question: '주문 후 배송까지 얼마나 걸리나요?',
                    answer: '평균 2~3 영업일 내 배송됩니다. 도서산간 지역은 추가 시간이 소요될 수 있습니다.',
                },
                {
                    id: 'f2',
                    category: '반품/교환',
                    question: '반품이나 교환은 어떻게 신청하나요?',
                    answer: '수령 후 7일 이내에 고객센터 또는 마이페이지에서 신청하실 수 있습니다.',
                },
                {
                    id: 'f3',
                    category: '상품',
                    question: '피부 타입에 맞는 제품 추천을 받을 수 있나요?',
                    answer: '고객센터 또는 오프라인 매장에서 전문 컨설턴트의 안내를 받으실 수 있습니다.',
                },
                {
                    id: 'f4',
                    category: '회원',
                    question: '비밀번호를 잊어버렸어요.',
                    answer: '로그인 페이지의 "계정 찾기" 기능을 통해 이메일로 재설정 링크를 받으실 수 있습니다.',
                },
                {
                    id: 'f5',
                    category: '선물',
                    question: '선물 포장 서비스가 있나요?',
                    answer: '네, 공식몰에서는 선물 포장 및 쇼핑백 서비스를 제공합니다. 결제 시 선택하실 수 있습니다.',
                },
            ],

            // 문의 작성
            createInquiry: (data) => {
                const inquiry = {
                    id: `INQ-${Date.now()}`,
                    ...data,
                    status: '접수중',
                    createdAt: new Date().toISOString(),
                };
                set({ inquiries: [inquiry, ...get().inquiries] });
                return inquiry;
            },

            // 사용자별 문의 조회
            getInquiriesByUser: (userId) => {
                return get().inquiries.filter((i) => i.userId === userId);
            },
        }),
        {
            name: 'aesop-support',
            partialize: (state) => ({
                inquiries: state.inquiries,
                qnas: state.qnas,
            }),
        }
    )
);

export default useSupportStore;
