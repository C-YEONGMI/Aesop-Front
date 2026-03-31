import React from 'react';
import { Gift } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks';
import { selectSelectedSamples } from '../../../app/store/selectors/cartSelectors';
import { toggleSample } from '../../../app/store/slices/cartSlice';
import sampleImg from '../../../assets/sample_img.png';
import './SampleSelector.scss';

const MAX_SAMPLES = 3;

const SAMPLE_LIST = [
    { id: 'sample-1', name: '이그절티드 아이 세럼' },
    { id: 'sample-2', name: '라인드 컨센트레이트 바디 밤' },
    { id: 'sample-3', name: '비 트리플 씨 페이셜 밸런싱 젤' },
    { id: 'sample-4', name: '파슬리 씨드 안티 옥시던트 페이셜 트리트먼트' },
];

const SampleSelector = () => {
    const dispatch = useAppDispatch();
    const selectedSamples = useAppSelector(selectSelectedSamples);

    const handleToggle = (sampleId) => {
        const isSelected = selectedSamples.includes(sampleId);

        if (!isSelected && selectedSamples.length >= MAX_SAMPLES) {
            Swal.fire({
                text: '샘플은 최대 3개까지 선택 가능합니다.',
                icon: 'warning',
                confirmButtonText: '확인',
                confirmButtonColor: '#1a1a1a',
            });
            return;
        }

        dispatch(toggleSample(sampleId));
    };

    return (
        <section className="checkout-page__section sample-selector">
            <div className="checkout-page__section-head">
                <div className="checkout-page__section-title-wrap">
                    <div className="checkout-page__section-icon">
                        <Gift size={18} />
                    </div>
                    <div>
                        <h2 className="optima-20 checkout-page__section-title">
                            무료 샘플을 추가하세요
                        </h2>
                        <p className="suit-14-m checkout-page__section-copy">
                            선택한 샘플이 {selectedSamples.length}/{MAX_SAMPLES}개 있습니다
                        </p>
                    </div>
                </div>
            </div>

            <div className="sample-selector__grid">
                {SAMPLE_LIST.map((sample) => {
                    const isSelected = selectedSamples.includes(sample.id);

                    return (
                        <button
                            key={sample.id}
                            type="button"
                            className={`sample-selector__card ${isSelected ? 'is-selected' : ''}`}
                            onClick={() => handleToggle(sample.id)}
                        >
                            <div className="sample-selector__image-wrap">
                                <img
                                    src={sampleImg}
                                    alt={sample.name}
                                    className="sample-selector__image"
                                />
                                <span className="sample-selector__checkbox">
                                    {isSelected && (
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                            <polyline
                                                points="2,6 5,9 10,3"
                                                stroke="#fff"
                                                strokeWidth="1.8"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    )}
                                </span>
                            </div>
                            <p className="sample-selector__name suit-14-m">{sample.name}</p>
                        </button>
                    );
                })}
            </div>
        </section>
    );
};

export default SampleSelector;
