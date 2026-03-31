export const giftGuideTree = [
    {
        id: 'housewarming',
        label: '집들이 선물',
        question2: '무엇에 초점을 둔 선물인가요?',
        options: [
            {
                id: 'space-scent',
                label: '공간 향',
                question3: '어떤 느낌이 좋으신가요?',
                options: [
                    {
                        id: 'light-sense',
                        label: '가볍고 센스 있게',
                        products: ['디그니티 인 더 래버토리'],
                    },
                    {
                        id: 'rich-complete',
                        label: '풍성하고 완성도 있게',
                        products: ['배쓰룸 어번던스'],
                    },
                    {
                        id: 'multi-scent',
                        label: '여러 향을 즐기게',
                        products: ['존재의 상태: 아로마틱 룸 스프레이 트리오'],
                    },
                ],
            },
            {
                id: 'hand-kitchen',
                label: '손 / 주방 케어',
                question3: '어떤 구성이 좋으신가요?',
                options: [
                    {
                        id: 'safe-basic',
                        label: '가장 무난하게',
                        products: ['레저렉션 듀엣', '레버런스 듀엣'],
                    },
                    {
                        id: 'more-full',
                        label: '조금 더 풍성하게',
                        products: ['투 매니 쿡스 인 더 키친'],
                    },
                    {
                        id: 'with-space-scent',
                        label: '공간 향까지 함께',
                        products: ['배쓰룸 어번던스'],
                    },
                ],
            },
            {
                id: 'bath-body',
                label: '욕실 / 바디 케어',
                question3: '어느 정도의 케어를 원하시나요?',
                options: [
                    {
                        id: 'light-practical',
                        label: '가볍고 실용적으로',
                        products: ['샤워 룸 세레나데', '그리팅스 인 더 게스트룸'],
                    },
                    {
                        id: 'with-moisture',
                        label: '보습까지 챙기기',
                        products: ['제라늄 리프 듀엣'],
                    },
                    {
                        id: 'special-care',
                        label: '스페셜하게',
                        products: ['파티 인 더 그린하우스'],
                    },
                ],
            },
        ],
    },
    {
        id: 'business',
        label: '비즈니스용 선물',
        question2: '무엇에 초점을 둔 선물인가요?',
        options: [
            {
                id: 'practical-safe',
                label: '실용적이고 무난한 선물',
                question3: '어떤 사용감이 좋으신가요?',
                options: [
                    {
                        id: 'daily-safe',
                        label: '누구나 자주 쓰는 선물',
                        products: ['레저렉션 듀엣', '레버런스 듀엣'],
                    },
                    {
                        id: 'portable-light',
                        label: '가볍고 휴대하기 좋게',
                        products: ['헬핑 핸즈 트리오'],
                    },
                ],
            },
            {
                id: 'clean-sense',
                label: '센스 있고 깔끔한 선물',
                question3: '어떤 방향이 좋으신가요?',
                options: [
                    {
                        id: 'small-impression',
                        label: '작지만 인상 남게',
                        products: ['포스트-푸 드롭스'],
                    },
                    {
                        id: 'calm-mood',
                        label: '편안한 무드',
                        products: [
                            '캐서린 오일 버너 블렌드',
                            '베아트리체 오일 버너 블렌드',
                        ],
                    },
                    {
                        id: 'subtle-space',
                        label: '공간에 은은한 향',
                        products: ['존재의 상태: 아로마틱 룸 스프레이 트리오'],
                    },
                ],
            },
            {
                id: 'tasteful',
                label: '취향이 느껴지는 선물',
                question3: '어떤 무드가 좋으신가요?',
                options: [
                    {
                        id: 'light-taste',
                        label: '가볍게 취향 있게',
                        products: ['헬핑 핸즈 트리오'],
                    },
                    {
                        id: 'calm-stylish',
                        label: '차분하고 감각적으로',
                        products: [
                            '카게로우 아로마틱 인센스',
                            '무라사키 아로마틱 인센스',
                            '사라시나 아로마틱 인센스',
                        ],
                    },
                    {
                        id: 'warm-atmosphere',
                        label: '따뜻한 분위기',
                        products: [
                            '프톨레미 아로마틱 캔들',
                            '아가니스 아로마틱 캔들',
                            '칼리푸스 아로마틱 캔들',
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 'birthday-anniversary',
        label: '생일 / 기념일 선물',
        question2: '무엇에 초점을 둔 선물인가요?',
        options: [
            {
                id: 'special-scent',
                label: '특별한 향',
                question3: '향 취향을 얼마나 알고 계신가요?',
                options: [
                    {
                        id: 'know-well',
                        label: '향 취향을 잘 알아요',
                        products: ['라이브러리 오브 아로마'],
                    },
                    {
                        id: 'discovery',
                        label: '입문 / 탐색용이 좋아요',
                        products: ['프래그런스 앤솔러지 볼륨 I'],
                    },
                ],
            },
            {
                id: 'space-gift',
                label: '분위기 있는 공간 선물',
                question3: '어떤 분위기가 잘 맞을까요?',
                options: [
                    {
                        id: 'warm-cozy',
                        label: '따뜻하고 포근하게',
                        products: [
                            '프톨레미 아로마틱 캔들',
                            '아가니스 아로마틱 캔들',
                            '칼리푸스 아로마틱 캔들',
                        ],
                    },
                    {
                        id: 'deep-calm',
                        label: '차분하고 깊이 있게',
                        products: [
                            '카게로우 아로마틱 인센스',
                            '무라사키 아로마틱 인센스',
                            '사라시나 아로마틱 인센스',
                        ],
                    },
                    {
                        id: 'fresh-light',
                        label: '산뜻하고 가볍게',
                        products: ['존재의 상태: 아로마틱 룸 스프레이 트리오'],
                    },
                    {
                        id: 'practical-sense',
                        label: '실용적인 공간 센스',
                        products: ['디그니티 인 더 래버토리'],
                    },
                ],
            },
            {
                id: 'body-care',
                label: '바디 / 케어 선물',
                question3: '어느 정도 특별한 구성이 좋으신가요?',
                options: [
                    {
                        id: 'start-light',
                        label: '가볍게 시작하기',
                        products: ['제라늄 리프 듀엣'],
                    },
                    {
                        id: 'full-special',
                        label: '풍성하고 스페셜하게',
                        products: ['파티 인 더 그린하우스'],
                    },
                ],
            },
            {
                id: 'routine-gift',
                label: '취향 있는 루틴 선물',
                question3: '어떤 루틴에 가까운가요?',
                options: [
                    {
                        id: 'skin-single',
                        label: '가벼운 스킨케어',
                        products: ['파슬리 씨드 안티 옥시던트 인텐스 세럼'],
                    },
                    {
                        id: 'skin-set',
                        label: '스킨케어 세트',
                        products: [
                            '파슬리 씨드 안티 옥시던트 스킨 케어 키트',
                            '퀜치: 클래식 스킨 케어 키트',
                            '밸런스: 클래식 스킨 케어 키트',
                        ],
                    },
                    {
                        id: 'rest-calm',
                        label: '휴식과 진정',
                        products: [
                            '캐서린 오일 버너 블렌드',
                            '베아트리체 오일 버너 블렌드',
                        ],
                    },
                    {
                        id: 'stress-relief',
                        label: '스트레스 완화',
                        products: ['진저 플라이트'],
                    },
                ],
            },
        ],
    },
    {
        id: 'for-me',
        label: '나를 위한 선물',
        question2: '무엇에 초점을 둔 선물인가요?',
        options: [
            {
                id: 'mood-scent',
                label: '향으로 기분 전환',
                question3: '어떤 방식이 좋으신가요?',
                options: [
                    {
                        id: 'signature-scent',
                        label: '대표 향을 제대로',
                        products: ['라이브러리 오브 아로마'],
                    },
                    {
                        id: 'compare-many',
                        label: '여러 향을 비교하고 싶어요',
                        products: ['프래그런스 앤솔러지 볼륨 I'],
                    },
                    {
                        id: 'space-scent-enjoy',
                        label: '공간 향을 즐기고 싶어요',
                        products: [
                            '존재의 상태: 아로마틱 룸 스프레이 트리오',
                            '카게로우 아로마틱 인센스',
                            '무라사키 아로마틱 인센스',
                            '사라시나 아로마틱 인센스',
                            '프톨레미 아로마틱 캔들',
                            '아가니스 아로마틱 캔들',
                            '칼리푸스 아로마틱 캔들',
                            '캐서린 오일 버너 블렌드',
                            '베아트리체 오일 버너 블렌드',
                        ],
                    },
                ],
            },
            {
                id: 'rest-healing',
                label: '휴식과 진정',
                question3: '어떤 휴식이 필요하신가요?',
                options: [
                    {
                        id: 'instant-calm',
                        label: '바로 진정되는 케어',
                        products: [
                            '캐서린 오일 버너 블렌드',
                            '베아트리체 오일 버너 블렌드',
                        ],
                    },
                    {
                        id: 'stress-focus',
                        label: '스트레스 완화 중심',
                        products: ['진저 플라이트'],
                    },
                    {
                        id: 'mood-rest',
                        label: '무드 있는 휴식',
                        products: [
                            '카게로우 아로마틱 인센스',
                            '무라사키 아로마틱 인센스',
                            '사라시나 아로마틱 인센스',
                            '프톨레미 아로마틱 캔들',
                            '아가니스 아로마틱 캔들',
                            '칼리푸스 아로마틱 캔들',
                        ],
                    },
                ],
            },
            {
                id: 'body-bath-care',
                label: '바디 / 욕실 케어',
                question3: '어떤 케어를 원하시나요?',
                options: [
                    {
                        id: 'basic-body',
                        label: '기본 바디 케어',
                        products: ['제라늄 리프 듀엣'],
                    },
                    {
                        id: 'special-body',
                        label: '스페셜한 케어',
                        products: ['파티 인 더 그린하우스'],
                    },
                    {
                        id: 'light-body',
                        label: '가볍고 실용적인 구성',
                        products: ['샤워 룸 세레나데', '그리팅스 인 더 게스트룸'],
                    },
                ],
            },
            {
                id: 'skin-care',
                label: '피부 관리',
                question3: '어떤 스킨케어를 원하시나요?',
                options: [
                    {
                        id: 'skin-simple',
                        label: '가볍게 시작하는 케어',
                        products: ['파슬리 씨드 안티 옥시던트 인텐스 세럼'],
                    },
                    {
                        id: 'skin-full-set',
                        label: '기초 루틴이 모두 들어간 세트',
                        products: [
                            '파슬리 씨드 안티 옥시던트 스킨 케어 키트',
                            '퀜치: 클래식 스킨 케어 키트',
                            '밸런스: 클래식 스킨 케어 키트',
                        ],
                    },
                ],
            },
            {
                id: 'travel-routine',
                label: '여행용 루틴',
                question3: '어떤 여행 키트가 좋으신가요?',
                options: [
                    {
                        id: 'travel-light',
                        label: '가볍게 챙기기',
                        products: ['어라이벌'],
                    },
                    {
                        id: 'travel-full',
                        label: '페이스까지 함께',
                        products: ['서울'],
                    },
                ],
            },
        ],
    },
    {
        id: 'specific-purpose',
        label: '특정 목적이 있는 선물',
        question2: '무엇에 초점을 둔 선물인가요?',
        options: [
            {
                id: 'for-travel',
                label: '여행을 즐기는 사람',
                question3: '어떤 여행 키트가 좋으신가요?',
                options: [
                    {
                        id: 'travel-simple',
                        label: '가볍게 챙기기',
                        products: ['어라이벌'],
                    },
                    {
                        id: 'travel-face',
                        label: '페이스까지 함께',
                        products: ['서울'],
                    },
                ],
            },
            {
                id: 'for-skin',
                label: '피부 관리에 관심 있는 사람',
                question3: '어떤 스킨케어를 추천할까요?',
                options: [
                    {
                        id: 'skin-one',
                        label: '가볍게 시작하는 케어',
                        products: ['파슬리 씨드 안티 옥시던트 인텐스 세럼'],
                    },
                    {
                        id: 'skin-kit',
                        label: '기초 루틴이 모두 들어간 세트',
                        products: [
                            '파슬리 씨드 안티 옥시던트 스킨 케어 키트',
                            '퀜치: 클래식 스킨 케어 키트',
                            '밸런스: 클래식 스킨 케어 키트',
                        ],
                    },
                ],
            },
            {
                id: 'for-stress',
                label: '스트레스 완화가 필요한 사람',
                question3: '어떤 방식이 좋으신가요?',
                options: [
                    {
                        id: 'portable-relief',
                        label: '휴대하기 쉬운 진정 케어',
                        products: ['진저 플라이트'],
                    },
                    {
                        id: 'home-rest',
                        label: '집에서 차분히 쉬는 루틴',
                        products: [
                            '캐서린 오일 버너 블렌드',
                            '베아트리체 오일 버너 블렌드',
                            '카게로우 아로마틱 인센스',
                            '무라사키 아로마틱 인센스',
                            '사라시나 아로마틱 인센스',
                            '프톨레미 아로마틱 캔들',
                            '아가니스 아로마틱 캔들',
                            '칼리푸스 아로마틱 캔들',
                        ],
                    },
                ],
            },
            {
                id: 'for-men',
                label: '남성 그루밍',
                products: ['모로칸 네롤리 쉐이빙 듀엣'],
            },
            {
                id: 'for-scent-lover',
                label: '향을 좋아하는 사람',
                question3: '어떤 방식의 향을 좋아할까요?',
                options: [
                    {
                        id: 'wearable-scent',
                        label: '직접 뿌리는 향',
                        products: ['라이브러리 오브 아로마'],
                    },
                    {
                        id: 'discover-scent',
                        label: '취향 탐색용',
                        products: ['프래그런스 앤솔러지 볼륨 I'],
                    },
                    {
                        id: 'space-scent-lover',
                        label: '공간에서 즐기는 향',
                        products: [
                            '존재의 상태: 아로마틱 룸 스프레이 트리오',
                            '카게로우 아로마틱 인센스',
                            '무라사키 아로마틱 인센스',
                            '사라시나 아로마틱 인센스',
                            '프톨레미 아로마틱 캔들',
                            '아가니스 아로마틱 캔들',
                            '칼리푸스 아로마틱 캔들',
                            '캐서린 오일 버너 블렌드',
                            '베아트리체 오일 버너 블렌드',
                        ],
                    },
                ],
            },
        ],
    },
];
