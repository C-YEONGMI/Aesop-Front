import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/store/hooks';
import { fetchProductReferenceCatalog } from '../../app/store/slices/productSlice';
import { selectProductSearchResults } from '../../app/store/selectors/productSelectors';
import { getProductDetailPath } from '../../lib/products/productShape';
import { getCategoryLabelFromValue } from '../../data/productCategories';
import './Search.scss';

const Search = () => {
    const dispatch = useAppDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const searchQuery = searchParams.get('q')?.trim() || '';
    const resultsSelector = useMemo(
        () => selectProductSearchResults(searchQuery),
        [searchQuery]
    );
    const results = useAppSelector(resultsSelector);
    const [query, setQuery] = useState('');
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        dispatch(fetchProductReferenceCatalog());
    }, [dispatch]);

    useEffect(() => {
        if (searchQuery) {
            setQuery(searchQuery);
            setSearched(true);
            return;
        }

        setQuery('');
        setSearched(false);
    }, [searchQuery]);

    const handleSearch = (event) => {
        event.preventDefault();

        if (!query.trim()) {
            return;
        }

        setSearchParams({ q: query.trim() });
    };

    return (
        <div className="search-page">
            <div className="search-page__header-space" />
            <div className="search-page__inner">
                <h1 className="optima-40 search-page__title">검색</h1>

                <form className="search-page__form" onSubmit={handleSearch}>
                    <input
                        type="text"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="상품명, 설명, 카테고리로 검색"
                        className="search-page__input suit-18-r"
                    />
                    <button type="submit" className="search-page__btn optima-16">
                        검색
                    </button>
                </form>

                {searched && (
                    <div className="search-page__results">
                        <p className="suit-14-m search-page__count">
                            "{searchQuery}" 검색 결과 {results.length}개
                        </p>
                        {results.length === 0 ? (
                            <p className="suit-16-r search-page__empty">검색 결과가 없습니다.</p>
                        ) : (
                            <div className="search-page__grid">
                                {results.map((product) => (
                                    <Link
                                        key={product.id || product.name}
                                        to={getProductDetailPath(product)}
                                        className="search-page__card"
                                    >
                                        <div className="search-page__card-img">
                                            <img src={product.variants[0]?.image} alt={product.name} />
                                        </div>
                                        <p className="suit-12-r">
                                            {getCategoryLabelFromValue(product.category)}
                                        </p>
                                        <p className="suit-16-m">{product.name}</p>
                                        <p className="suit-14-m">
                                            {product.variants[0]?.price?.toLocaleString('ko-KR')}원
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
