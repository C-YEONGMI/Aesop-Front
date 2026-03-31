import React from 'react';
import { useParams } from 'react-router-dom';
import OfficialBenefitsSequence from '../../components/features/benefits/OfficialBenefitsSequence';
import './Benefits.scss';

const Benefits = ({ sub: propSub }) => {
    const { tab } = useParams();
    const sub = propSub || tab;

    return (
        <div className={`benefits-page ${sub === 'official' ? 'benefits-page--official' : ''}`}>
            <div className="benefits-page__header-space" />

            {sub === 'official' ? (
                <OfficialBenefitsSequence />
            ) : (
                <div className="benefits-page__section">
                    <p className="suit-18-r">상단 탭에서 원하는 온라인 서비스 페이지를 선택해 주세요.</p>
                </div>
            )}
        </div>
    );
};

export default Benefits;
