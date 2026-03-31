import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import storesData from '../../data/stores.json';
import './StoreLocator.scss';

const REGIONS = ['전체', ...Array.from(new Set(storesData.map((store) => store.region)))];
const MAP_DELTA = 0.008;

const buildMapEmbedUrl = ({ lat, lng }) => {
    const west = lng - MAP_DELTA;
    const south = lat - MAP_DELTA;
    const east = lng + MAP_DELTA;
    const north = lat + MAP_DELTA;

    return `https://www.openstreetmap.org/export/embed.html?bbox=${west}%2C${south}%2C${east}%2C${north}&layer=mapnik&marker=${lat}%2C${lng}`;
};

const StoreLocator = () => {
    const { storeId } = useParams();
    const [region, setRegion] = useState('전체');
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(
        storeId ? storesData.find((store) => store.id === storeId) || null : null
    );

    useEffect(() => {
        if (!storeId) {
            return;
        }

        const matchedStore =
            storesData.find((store) => store.id === storeId) || null;
        setSelected(matchedStore);
    }, [storeId]);

    const filtered = useMemo(() => {
        return storesData.filter((store) => {
            const matchRegion = region === '전체' || store.region === region;
            const matchSearch =
                !search ||
                store.name.includes(search) ||
                store.address.includes(search);

            return matchRegion && matchSearch;
        });
    }, [region, search]);

    return (
        <div className="store-locator">
            <div className="store-locator__header-space" />
            <div className="store-locator__inner">
                <div className="store-locator__title-area">
                    <h1 className="optima-40 store-locator__title">매장 찾기</h1>
                    <p className="suit-16-r store-locator__desc">
                        아에솝의 오프라인 공간을 방문해보세요. 전문 컨설턴트가
                        안내하는 경험을 만나실 수 있습니다.
                    </p>
                </div>

                <div className="store-locator__filters">
                    <div className="store-locator__region-tabs">
                        {REGIONS.map((currentRegion) => (
                            <button
                                key={currentRegion}
                                type="button"
                                className={`store-locator__region-btn suit-14-m ${
                                    region === currentRegion ? 'active' : ''
                                }`}
                                onClick={() => setRegion(currentRegion)}
                            >
                                {currentRegion}
                            </button>
                        ))}
                    </div>
                    <div className="store-locator__search">
                        <input
                            type="text"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="매장명 또는 주소로 검색"
                            className="suit-16-r"
                        />
                    </div>
                </div>

                <div className="store-locator__layout">
                    <div className="store-locator__list">
                        {filtered.length === 0 ? (
                            <p className="suit-16-r store-locator__empty">
                                해당하는 매장이 없습니다.
                            </p>
                        ) : (
                            filtered.map((store) => (
                                <div
                                    key={store.id}
                                    className={`store-locator__card ${
                                        selected?.id === store.id ? 'active' : ''
                                    }`}
                                    onClick={() => setSelected(store)}
                                >
                                    <div className="store-locator__card-top">
                                        <p className="store-locator__card-name suit-18-m">
                                            {store.name}
                                        </p>
                                        <span className="store-locator__card-region suit-12-r">
                                            {store.region}
                                        </span>
                                    </div>
                                    <p className="store-locator__card-addr suit-14-m">
                                        {store.address}
                                    </p>
                                    <p className="store-locator__card-hours suit-12-r">
                                        {store.hours}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="store-locator__detail">
                        {selected ? (
                            <>
                                <h2 className="optima-40 store-locator__detail-name">
                                    {selected.name}
                                </h2>
                                <div
                                    className="store-locator__map"
                                    aria-label={`${selected.name} map`}
                                >
                                    <iframe
                                        key={selected.id}
                                        title={`${selected.name} 지도`}
                                        src={buildMapEmbedUrl(selected)}
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        className="store-locator__map-frame"
                                    />
                                </div>
                                <div className="store-locator__detail-info suit-16-r">
                                    <div className="store-locator__detail-row">
                                        <span className="suit-14-m store-locator__detail-label">
                                            주소
                                        </span>
                                        <span>{selected.address}</span>
                                    </div>
                                    <div className="store-locator__detail-row">
                                        <span className="suit-14-m store-locator__detail-label">
                                            운영시간
                                        </span>
                                        <span>{selected.hours}</span>
                                    </div>
                                    <div className="store-locator__detail-row">
                                        <span className="suit-14-m store-locator__detail-label">
                                            연락처
                                        </span>
                                        <a href={`tel:${selected.phone}`}>{selected.phone}</a>
                                    </div>
                                </div>
                                <p className="store-locator__detail-desc suit-16-r">
                                    {selected.description}
                                </p>
                                {selected.services?.length > 0 ? (
                                    <div className="store-locator__services">
                                        <p className="suit-14-m">제공 서비스</p>
                                        <div className="store-locator__service-tags">
                                            {selected.services.map((service) => (
                                                <span
                                                    key={service}
                                                    className="store-locator__service-tag suit-12-r"
                                                >
                                                    {service}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}
                            </>
                        ) : (
                            <div className="store-locator__detail-empty suit-18-r">
                                <p>매장을 선택하면 상세 정보가 표시됩니다.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoreLocator;
