import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, MessageCircle, RotateCcw, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/store/hooks';
import { addToCart } from '../../app/store/slices/cartSlice';
import { fetchProductReferenceCatalog } from '../../app/store/slices/productSlice';
import {
    selectProductByDetailParam,
    selectProductCatalogItems,
} from '../../app/store/selectors/productSelectors';
import useRequireLoginAction from '../../hooks/useRequireLoginAction';
import {
    getCategoryLabelFromValue,
    getCategoryRouteFromValue,
    getCategorySlugFromValue,
} from '../../data/productCategories';
import {
    GIFT_FLOW,
    HOME_OPTIONS,
    ORDER_DETAIL_MAP,
    PRODUCT_CONTEXT_FLOW,
    SELF_ROUTINE_FLOW,
    STORE_FLOW,
    SUPPORT_LINKS,
} from '../../data/chatConsultantFlow';
import './ExpandableChat.scss';

const createTextMessage = (id, sender, content) => ({ id, type: 'text', sender, content });
const createChoiceMessage = (id, content, options, meta = {}) => ({ id, type: 'choice', sender: 'bot', content, options, meta });
const createCardsMessage = (id, cards) => ({ id, type: 'cards', sender: 'bot', cards });

const getPrimaryVariant = (product) => product?.variants?.[0] ?? {};
const getPrimaryPrice = (product) => getPrimaryVariant(product).price ?? 0;
const formatPrice = (price) => `${Number(price || 0).toLocaleString('ko-KR')}원`;

const getEntryContext = (pathname) => {
    if (pathname.startsWith('/gift-guide')) return 'gift';
    if (pathname.startsWith('/product/')) return 'product';
    if (pathname.startsWith('/cart') || pathname.startsWith('/checkout')) return 'checkout';
    if (pathname.startsWith('/store-locator')) return 'store';
    return pathname === '/' ? 'home' : 'generic';
};

const getKstSupportStatus = () => {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Seoul',
        weekday: 'short',
        hour: '2-digit',
        hour12: false,
    }).formatToParts(new Date());
    const weekday = parts.find((part) => part.type === 'weekday')?.value ?? 'Mon';
    const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0);
    return {
        productOpen: true,
        orderOpen: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(weekday) && hour >= 10 && hour < 18,
    };
};

const ExpandableChat = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();
    const products = useAppSelector(selectProductCatalogItems);
    const requireLoginAction = useRequireLoginAction();
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [historyStack, setHistoryStack] = useState([]);
    const bodyRef = useRef(null);
    const timeoutsRef = useRef([]);
    const nextIdRef = useRef(1);

    const entryContext = useMemo(() => getEntryContext(location.pathname), [location.pathname]);
    const supportStatus = useMemo(() => getKstSupportStatus(), []);
    const productDetailParam = useMemo(
        () =>
            location.pathname.startsWith('/product/')
                ? location.pathname.replace('/product/', '')
                : '',
        [location.pathname]
    );
    const activeProductSelector = useMemo(
        () => selectProductByDetailParam(productDetailParam),
        [productDetailParam]
    );
    const activeProduct = useAppSelector(activeProductSelector);

    useEffect(() => {
        dispatch(fetchProductReferenceCatalog());
    }, [dispatch]);

    const clearTimers = () => {
        timeoutsRef.current.forEach((timer) => window.clearTimeout(timer));
        timeoutsRef.current = [];
    };

    const snapshotConversation = () => {
        setHistoryStack((prev) => [...prev, { messages: [...messages], nextId: nextIdRef.current }]);
    };

    const goBack = () => {
        if (!historyStack.length) return;
        clearTimers();
        const previous = historyStack[historyStack.length - 1];
        nextIdRef.current = previous.nextId;
        setMessages(previous.messages);
        setHistoryStack((prev) => prev.slice(0, -1));
        setIsLoading(false);
    };

    const appendMessages = (newMessages) => setMessages((prev) => [...prev, ...newMessages]);

    const delayAppend = (newMessages, delay = 620) => {
        setIsLoading(true);
        const timer = window.setTimeout(() => {
            appendMessages(newMessages);
            setIsLoading(false);
        }, delay);
        timeoutsRef.current.push(timer);
    };

    const makeOption = (label, action) => ({
        id: `${label}-${Math.random().toString(36).slice(2, 8)}`,
        label,
        action,
    });

    const getCategoryProducts = (slug) =>
        products.filter((product) => getCategorySlugFromValue(product.category) === slug);

    const selectProducts = (slug, count = 3, sort = 'asc') => {
        const pool = [...getCategoryProducts(slug)];
        pool.sort((left, right) =>
            sort === 'desc' ? getPrimaryPrice(right) - getPrimaryPrice(left) : getPrimaryPrice(left) - getPrimaryPrice(right)
        );
        return pool.slice(0, count);
    };

    const buildProductCard = (product, label, description, tags) => ({
        type: 'product',
        label,
        title: product.name,
        description,
        tags,
        meta: `${getCategoryLabelFromValue(product.category)} · ${getPrimaryVariant(product).capacity || ''} · ${formatPrice(getPrimaryPrice(product))}`,
        image: getPrimaryVariant(product).image,
        actions: [
            { label: '장바구니 담기', kind: 'add', product },
            { label: '비슷한 제품 보기', kind: 'navigate', to: getCategoryRouteFromValue(product.category) },
        ],
    });

    const buildSupportCard = (label, title, description, tags, actions) => ({
        type: 'support',
        label,
        title,
        description,
        tags,
        actions,
    });

    const resolveRoutineSlug = (answers) => {
        if (answers.category === '핸드 케어' || answers.category === '바디 케어') return 'body';
        if (answers.category === '스킨 케어') return 'skincare';
        if (answers.category === '향수') return 'fragrance';
        if (answers.priority === '패키지/공간에 놓였을 때 분위기') return 'home';
        if (answers.moment === '기분 전환용 향') return 'fragrance';
        return 'body';
    };

    const resolveStoreSlug = (answers) => {
        if (answers.interest === '스킨 케어') return 'skincare';
        if (answers.interest === '향수') return 'fragrance';
        if (answers.interest === '세트 구성') return 'kits';
        return 'body';
    };

    const askQuestion = (flowKey, steps, stepIndex, answers = {}, introText = '') => {
        const step = typeof steps[stepIndex] === 'function' ? steps[stepIndex](answers) : steps[stepIndex];

        if (!step) {
            presentResult(flowKey, answers);
            return;
        }

        const payload = [];
        if (introText) {
            payload.push(createTextMessage(nextIdRef.current++, 'bot', introText));
        }

        payload.push(
            createChoiceMessage(
                nextIdRef.current++,
                step.prompt,
                step.options.map((label) =>
                    makeOption(label, {
                        kind: 'answer',
                        flowKey,
                        steps,
                        stepIndex,
                        answers,
                        answerKey: step.id,
                        answerLabel: label,
                    })
                )
            )
        );

        delayAppend(payload, 620);
    };

    const startFlow = (flowKey, preset = {}) => {
        if (flowKey === 'self_routine') askQuestion(flowKey, SELF_ROUTINE_FLOW, preset.startIndex || 0, preset.answers || {}, preset.intro);
        if (flowKey === 'gift_recommendation') askQuestion(flowKey, GIFT_FLOW, preset.startIndex || 0, preset.answers || {}, preset.intro);
        if (flowKey === 'store_followup') askQuestion(flowKey, STORE_FLOW, preset.startIndex || 0, preset.answers || {}, preset.intro);
        if (flowKey === 'order_support') askQuestion(flowKey, [() => ({ id: 'issue', prompt: '어떤 도움이 필요하신가요?', options: Object.keys(ORDER_DETAIL_MAP).concat('기타 문의') }), (answers) => ORDER_DETAIL_MAP[answers.issue] || null], preset.startIndex || 0, preset.answers || {}, preset.intro);
        if (flowKey === 'product_context') askQuestion(flowKey, [PRODUCT_CONTEXT_FLOW], 0, {}, preset.intro);
    };

    const presentResult = (flowKey, answers) => {
        const payload = [];

        if (flowKey === 'self_routine') {
            const productsForFlow = selectProducts(resolveRoutineSlug(answers), 3);
            payload.push(
                createTextMessage(nextIdRef.current++, 'bot', '지금 찾으시는 사용 맥락에는 감각적인 사용 경험과 무드를 함께 보는 구성이 잘 어울립니다. 아래 제품부터 가볍게 살펴보세요.'),
                createCardsMessage(
                    nextIdRef.current++,
                    productsForFlow.map((product, index) =>
                        buildProductCard(
                            product,
                            index === 0 ? '추천' : index === 1 ? '비슷한 제품' : '재구매 추천',
                            index === 0
                                ? '하루의 사용 순간과 기분에 맞춰 가장 먼저 살펴보기 좋은 제품입니다.'
                                : '지금 고르신 무드와 사용감에 자연스럽게 이어지는 선택입니다.',
                            [answers.mood, answers.priority, answers.moment].filter(Boolean).slice(0, 3)
                        )
                    )
                )
            );
        }

        if (flowKey === 'gift_recommendation') {
            const safeProducts = selectProducts('body', 2, answers.budget === '15만원 이상' ? 'desc' : 'asc');
            const statementProduct = selectProducts(answers.safety === '조금 더 인상적인 쪽' ? 'fragrance' : 'kits', 1, 'desc')[0];
            payload.push(
                createTextMessage(nextIdRef.current++, 'bot', '선물 실패 확률이 낮은 추천부터 조금 더 인상적인 추천까지 함께 정리해 두었습니다.'),
                createCardsMessage(nextIdRef.current++, [
                    ...safeProducts.map((product) =>
                        buildProductCard(product, '실패 확률 낮은 추천', '처음 선물하셔도 부담이 적고, 감사 선물이나 집들이 선물로 무난하게 선택하기 좋습니다.', ['호불호 낮음', '선물 포장 가능', answers.budget].filter(Boolean))
                    ),
                    statementProduct
                        ? buildProductCard(statementProduct, '조금 더 인상적인 추천', '조금 더 존재감 있는 선물을 찾을 때 적합한 방향의 추천입니다.', ['샘플 선택 가능', answers.safety, answers.delivery].filter(Boolean))
                        : null,
                ].filter(Boolean))
            );
        }

        if (flowKey === 'order_support') {
            payload.push(
                createTextMessage(nextIdRef.current++, 'bot', '주문 상태와 포장 방식에 따라 필요한 확인 항목만 먼저 정리해 드리겠습니다.'),
                createCardsMessage(nextIdRef.current++, [
                    buildSupportCard('문의 해결', answers.issue, '주문번호, 상태 확인, FAQ와 문의하기 흐름을 함께 보면 가장 빠르게 해결할 수 있습니다.', [answers.issue, answers.order_tracking || answers.order_change || answers.order_damage || answers.order_wrap || answers.order_return].filter(Boolean), [
                        { label: 'FAQ 보기', kind: 'navigate', to: '/support/faq' },
                        { label: '문의하기', kind: 'navigate', to: '/support/contact' },
                    ]),
                ])
            );
        }

        if (flowKey === 'store_followup') {
            const productsForFlow = selectProducts(resolveStoreSlug(answers), 2);
            payload.push(
                createTextMessage(nextIdRef.current++, 'bot', '매장에서 느끼셨던 이미지와 상담 경험을 온라인에서도 이어갈 수 있도록 같은 결의 추천을 준비했습니다.'),
                createCardsMessage(nextIdRef.current++, [
                    ...productsForFlow.map((product) =>
                        buildProductCard(product, '비슷한 제품 추천', '매장에서 좋게 느끼셨던 무드와 사용 경험에 자연스럽게 이어지는 선택입니다.', [answers.favorite, answers.interest, answers.followup].filter(Boolean))
                    ),
                    buildSupportCard('매장 연계', '가까운 매장 다시 찾기', '다음 방문 전 매장 정보와 브랜드 경험을 다시 이어서 확인하실 수 있습니다.', ['오프라인 연계', answers.store].filter(Boolean), [
                        { label: '매장 찾기', kind: 'navigate', to: '/store-locator' },
                        { label: '브랜드 스토리 보기', kind: 'navigate', to: '/our-story' },
                    ]),
                ])
            );
        }

        if (flowKey === 'product_context') {
            const similarProducts = activeProduct
                ? products.filter((product) => product.name !== activeProduct.name && getCategorySlugFromValue(product.category) === getCategorySlugFromValue(activeProduct.category)).slice(0, 2)
                : [];
            payload.push(
                createTextMessage(nextIdRef.current++, 'bot', '현재 제품 기준으로 바로 이어볼 수 있는 흐름을 정리했습니다.'),
                createCardsMessage(nextIdRef.current++, [
                    ...(activeProduct
                        ? [
                              buildProductCard(activeProduct, '현재 보고 있는 제품', '지금 보고 있는 제품을 기준으로 장바구니 담기 또는 비슷한 제품 비교가 가능합니다.', ['현재 제품', getCategoryLabelFromValue(activeProduct.category)],),
                          ]
                        : []),
                    ...similarProducts.map((product) => buildProductCard(product, '비슷한 제품', '같은 카테고리 안에서 함께 비교해 보기 좋은 선택입니다.', ['비슷한 결', getCategoryLabelFromValue(product.category)])),
                ])
            );
        }

        payload.push(
            createChoiceMessage(nextIdRef.current++, '다음으로 무엇을 도와드릴까요?', [
                makeOption('처음으로', { kind: 'entry' }),
                makeOption('FAQ 보기', { kind: 'navigate', to: '/support/faq' }),
                makeOption('문의하기', { kind: 'navigate', to: '/support/contact' }),
            ])
        );

        delayAppend(payload, 680);
    };

    const presentSensitiveCase = () => {
        delayAppend([
            createTextMessage(nextIdRef.current++, 'bot', '일반적인 제품 추천보다 안전 확인이 우선되는 상황으로 보여집니다. 사용 중인 제품이 있다면 우선 사용을 중단하시고, 필요 시 의료 전문가와 상담하시는 것을 권합니다.'),
            createCardsMessage(nextIdRef.current++, [
                buildSupportCard('주의 안내', '민감한 상황 안내', '원하시면 컨설턴트 연결 또는 관련 도움말 안내를 이어서 도와드리겠습니다.', ['피부 자극', '알레르기', '의료 전문가 상담 권장'], [
                    { label: '문의하기', kind: 'navigate', to: '/support/contact' },
                    { label: 'FAQ 보기', kind: 'navigate', to: '/support/faq' },
                ]),
            ]),
        ]);
    };

    const presentHoursInfo = () => {
        delayAppend([
            createCardsMessage(nextIdRef.current++, [
                buildSupportCard('운영 상태', `제품 추천 상담: ${supportStatus.productOpen ? '운영중' : '부재중'}`, '제품 선택과 루틴 상담은 지금 바로 흐름형으로 이어가실 수 있습니다.', ['컨설턴트형 안내'], [
                    { label: '나를 위한 제품 추천', kind: 'start', flowKey: 'self_routine' },
                ]),
                buildSupportCard('운영 상태', `주문·배송 상담: ${supportStatus.orderOpen ? '운영중' : '부재중'}`, supportStatus.orderOpen ? '평일 운영 시간 안에서 순차적으로 도와드립니다.' : '부재 시 메시지를 남기거나 FAQ를 먼저 확인하실 수 있습니다.', ['평일 10:00 - 18:00'], [
                    { label: 'FAQ 보기', kind: 'navigate', to: '/support/faq' },
                    { label: '문의하기', kind: 'navigate', to: '/support/contact' },
                ]),
            ]),
        ]);
    };

    const presentValueHelp = () => {
        delayAppend([
            createCardsMessage(nextIdRef.current++, [
                buildSupportCard('정책 안내', '성분/지속가능성 문의', '제품 및 조언, 지속가능성, 정책 관련 흐름으로 이어드리겠습니다.', ['제품 및 조언', '지속가능성'], [
                    { label: '브랜드 스토리 보기', kind: 'navigate', to: '/our-story' },
                    { label: 'FAQ 보기', kind: 'navigate', to: '/support/faq' },
                ]),
            ]),
        ]);
    };

    const presentEntry = () => {
        if (entryContext === 'gift') {
            startFlow('gift_recommendation', { intro: '선물 받으실 분과 예산을 알려주시면, 실패 가능성이 낮은 추천부터 보여드리겠습니다.' });
            return;
        }

        if (entryContext === 'checkout') {
            delayAppend([
                createChoiceMessage(nextIdRef.current++, '포장, 샘플, 배송 중 먼저 확인하고 싶은 항목을 선택해 주세요.', [
                    makeOption('포장과 배송 확인하기', { kind: 'start', flowKey: 'order_support', answers: { issue: '선물 포장 확인' }, startIndex: 1 }),
                    makeOption('선물 옵션 상담하기', { kind: 'start', flowKey: 'gift_recommendation' }),
                    makeOption('주문/배송 문의', { kind: 'start', flowKey: 'order_support' }),
                ]),
            ]);
            return;
        }

        if (entryContext === 'product') {
            startFlow('product_context', { intro: activeProduct ? `${activeProduct.name}이 고민되시는군요. 향, 사용감, 비슷한 제품 중 어떤 부분이 가장 궁금하신가요?` : PRODUCT_CONTEXT_FLOW.prompt });
            return;
        }

        if (entryContext === 'store') {
            startFlow('store_followup', { intro: '매장에서 이어졌던 상담 경험을 온라인에서도 자연스럽게 이어드리겠습니다.' });
            return;
        }

        delayAppend([
            createChoiceMessage(
                nextIdRef.current++,
                entryContext === 'home'
                    ? '안녕하세요. 오늘의 리추얼에 어울리는 제품을 함께 찾아드릴까요, 아니면 선물 추천이 필요하신가요?'
                    : '안녕하세요. 이솝 컨설턴트가 제품 선택과 주문 관련 도움을 드리겠습니다. 오늘 어떤 도움이 필요하신가요?',
                HOME_OPTIONS.map((label) =>
                    makeOption(label, {
                        ...(label === '선물 추천'
                            ? { kind: 'navigate', to: '/gift-guide' }
                            : {
                                  kind: 'start',
                                  flowKey:
                                      label === '나를 위한 제품 추천'
                                          ? 'self_routine'
                                          : label === '주문/배송 문의'
                                            ? 'order_support'
                                            : 'store_followup',
                              }),
                    })
                ),
                {
                    links: SUPPORT_LINKS.map((label) =>
                        makeOption(label, {
                            kind: label === '성분/지속가능성 문의' ? 'value' : label === '상담 가능 시간 보기' ? 'hours' : 'sensitive',
                        })
                    ),
                }
            ),
        ]);
    };

    const startConversation = () => {
        clearTimers();
        nextIdRef.current = 1;
        setHistoryStack([]);
        setMessages([
            createTextMessage(nextIdRef.current++, 'bot', '이솝에 오신 것을 환영합니다.'),
            createChoiceMessage(nextIdRef.current++, '상담을 시작하기 전, 개인정보 및 민감정보 수집, 이용 및 국외이전에 대한 고객님의 동의가 필요합니다.\n자세한 내용은 개인정보처리방침에서 확인하실 수 있습니다.', [
                makeOption('확인했습니다.', { kind: 'entry' }),
            ], { hasPrivacyLink: true }),
        ]);
        setIsLoading(false);
        setHasStarted(true);
    };

    useEffect(() => {
        if (!isOpen) return undefined;
        if (!hasStarted) startConversation();
        const onKeyDown = (event) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [hasStarted, isOpen, onClose]);

    useEffect(() => {
        if (!isOpen) return;
        requestAnimationFrame(() => {
            if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
        });
    }, [isOpen, messages, isLoading]);

    useEffect(() => () => clearTimers(), []);

    const handleAction = (action) => {
        if (action.kind === 'navigate') {
            onClose();
            navigate(action.to);
        }
        if (action.kind === 'add') {
            requireLoginAction(() =>
                dispatch(addToCart({ product: action.product, variantIndex: 0 }))
            );
        }
        if (action.kind === 'start') {
            startFlow(action.flowKey, { answers: action.answers, startIndex: action.startIndex });
        }
    };

    const handleOptionSelect = (option) => {
        if (isLoading) return;
        const { action } = option;
        if (!action) return;
        if (['entry', 'hours', 'sensitive', 'value', 'start', 'answer'].includes(action.kind)) {
            snapshotConversation();
        }
        if (action.kind === 'entry') presentEntry();
        if (action.kind === 'hours') presentHoursInfo();
        if (action.kind === 'sensitive') presentSensitiveCase();
        if (action.kind === 'value') presentValueHelp();
        if (action.kind === 'navigate' || action.kind === 'add' || action.kind === 'start') handleAction(action);
        if (action.kind === 'answer') {
            const nextAnswers = { ...action.answers, [action.answerKey]: action.answerLabel };
            const nextStep = typeof action.steps[action.stepIndex + 1] === 'function'
                ? action.steps[action.stepIndex + 1](nextAnswers)
                : action.steps[action.stepIndex + 1];
            if (!nextStep) {
                presentResult(action.flowKey, nextAnswers);
                return;
            }
            askQuestion(action.flowKey, action.steps, action.stepIndex + 1, nextAnswers);
        }
    };

    const renderChoiceButtons = (message) => (
        <>
            <div className="expandable-chat__choices">
                {message.options.map((option) => (
                    <button key={option.id} type="button" className={`expandable-chat__choice-btn ${message.meta?.hasPrivacyLink ? 'is-ack' : ''}`} onClick={() => handleOptionSelect(option)} disabled={isLoading}>
                        {option.label}
                    </button>
                ))}
            </div>
            {!!message.meta?.links?.length && (
                <div className="expandable-chat__links">
                    {message.meta.links.map((link) => (
                        <button key={link.id} type="button" className="expandable-chat__link-btn" onClick={() => handleOptionSelect(link)}>
                            {link.label}
                        </button>
                    ))}
                </div>
            )}
        </>
    );

    const renderCards = (message) => (
        <div className="expandable-chat__cards">
            {message.cards.map((item, index) => (
                <div key={`${item.title}-${index}`} className="expandable-chat__card">
                    {item.image && <div className="expandable-chat__card-thumb"><img src={item.image} alt={item.title} /></div>}
                    <div className="expandable-chat__card-body">
                        <div className="expandable-chat__card-label">{item.label}</div>
                        <div className="expandable-chat__card-title">{item.title}</div>
                        <p className="expandable-chat__card-desc">{item.description}</p>
                        {item.type !== 'product' && !!item.tags?.length && <div className="expandable-chat__card-tags">{item.tags.map((tag) => <span key={tag} className="expandable-chat__card-tag">{tag}</span>)}</div>}
                        {item.meta && <div className="expandable-chat__card-meta">{item.meta}</div>}
                        <div className="expandable-chat__card-actions">{item.actions.map((action) => <button key={`${item.title}-${action.label}`} type="button" className={`expandable-chat__card-btn ${(item.type === 'product' ? action.kind === 'navigate' : action.kind !== 'navigate') ? 'is-secondary' : ''}`} onClick={() => handleAction(action)}>{action.label}</button>)}</div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className={`expandable-chat ${isOpen ? 'is-open' : ''}`} aria-hidden={!isOpen}>
            <div className="expandable-chat__panel" role="dialog" aria-modal="false" aria-label="고객 서비스">
                <div className="expandable-chat__header">
                    <div className="expandable-chat__topline">
                        <button type="button" className="expandable-chat__back" onClick={onClose} aria-label="채팅 닫기"><ChevronLeft size={18} strokeWidth={1.8} /></button>
                        <h2 className="expandable-chat__service-title">고객 서비스</h2>
                    </div>
                    <button type="button" className="expandable-chat__close" onClick={onClose} aria-label="채팅 닫기"><X size={18} strokeWidth={1.8} /></button>
                </div>
                <div className="expandable-chat__body" ref={bodyRef}>
                    {messages.map((message) => (
                        <div key={message.id} className={`expandable-chat__message expandable-chat__message--${message.sender}`}>
                            {message.sender === 'bot' && <div className="expandable-chat__message-avatar" aria-hidden="true"><MessageCircle size={16} strokeWidth={1.8} /></div>}
                            <div className="expandable-chat__stack">
                                {message.type !== 'cards' && <div className="expandable-chat__bubble">{message.content}{message.meta?.hasPrivacyLink && <> <a className="expandable-chat__notice-link" href="https://shop.aesop.com/kr/r/kr-privacy-24-5-3/" target="_blank" rel="noreferrer">개인정보처리방침</a></>}</div>}
                                {message.type === 'choice' && renderChoiceButtons(message)}
                                {message.type === 'cards' && renderCards(message)}
                            </div>
                        </div>
                    ))}
                    {isLoading && <div className="expandable-chat__message expandable-chat__message--bot"><div className="expandable-chat__message-avatar" aria-hidden="true"><MessageCircle size={16} strokeWidth={1.8} /></div><div className="expandable-chat__bubble expandable-chat__bubble--loading"><span /><span /><span /></div></div>}
                </div>
                <div className="expandable-chat__footer">
                    <div className="expandable-chat__nav">
                        <button type="button" className="expandable-chat__footer-btn is-secondary" onClick={goBack} disabled={!historyStack.length}>
                            <ChevronLeft size={14} strokeWidth={1.8} />
                            이전으로
                        </button>
                        <button type="button" className="expandable-chat__footer-btn" onClick={startConversation}>
                            처음으로
                            <RotateCcw size={14} strokeWidth={1.8} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpandableChat;
