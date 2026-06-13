import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CategoryCard from '../../components/CategoryCard';
import ServiceCard from '../../components/ServiceCard';
import { api } from '../../services/api';
import '../../assets/style/styles.scss';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [cities, setCities] = useState([]);

  const loadCategories = useCallback(async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
    }
  }, []);

  const loadCities = useCallback(async () => {
    try {
      const servicesData = await api.getServices();
      const uniqueCities = [...new Set(servicesData.map(s => s.city).filter(city => city))];
      setCities(uniqueCities);
    } catch (error) {
      console.error('Ошибка загрузки городов:', error);
    }
  }, []);

  const loadServices = useCallback(async (isLoadMore = false) => {
    if (!isLoadMore) {
      setLoading(true);
      setServices([]);
      setNextPageUrl(null);
    } else {
      setLoadingMore(true);
    }

    try {
      const filters = {
        category: searchParams.get('category'),
        search: searchParams.get('search'),
        min_price: searchParams.get('min_price') || minPrice,
        max_price: searchParams.get('max_price') || maxPrice,
        city: searchParams.get('city') || selectedCity,
        page: isLoadMore && nextPageUrl ? new URL(nextPageUrl).searchParams.get('page') : 1
      };

      const response = await api.getServicesWithPagination(filters);

      if (isLoadMore) {
        setServices(prev => [...prev, ...response.results]);
      } else {
        setServices(response.results);
      }

      setNextPageUrl(response.next);
      setHasMore(!!response.next);
    } catch (error) {
      console.error('Ошибка загрузки услуг:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchParams, nextPageUrl, minPrice, maxPrice, selectedCity]);

  const loadMore = () => {
    if (hasMore && !loadingMore) {
      loadServices(true);
    }
  };

  useEffect(() => {
    loadCategories();
    loadCities();
  }, [loadCategories, loadCities]);

  useEffect(() => {
    loadServices(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, minPrice, maxPrice, selectedCity]);

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    const cityFromUrl = searchParams.get('city');
    const minPriceFromUrl = searchParams.get('min_price');
    const maxPriceFromUrl = searchParams.get('max_price');

    setSelectedCategory(categoryFromUrl);
    setSelectedCity(cityFromUrl || '');
    setMinPrice(minPriceFromUrl || '');
    setMaxPrice(maxPriceFromUrl || '');
  }, [searchParams]);

  const handleCategoryClick = (slug) => {
    if (selectedCategory === slug) {
      setSearchParams({});
    } else {
      setSearchParams({ category: slug });
    }
  };

  const handleSearch = (query) => {
    if (query) {
      setSearchParams({ search: query });
    } else {
      setSearchParams({});
    }
  };

  const handleReset = () => {
    setMinPrice('');
    setMaxPrice('');
    setSelectedCity('');
    setSearchParams({});
  };

  const applyFilters = () => {
    const params = {};
    if (selectedCategory) params.category = selectedCategory;
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;
    if (selectedCity) params.city = selectedCity;
    setSearchParams(params);
    setShowFilters(false);
  };

  return (
    <>
      <Header onSearch={handleSearch} />
      <main className="homepage">
        <div className="homepage__container">
          <section className="categories-section">
            <h1 className="section-title">Выберите категорию</h1>
            <div className="categories-grid">
              {categories.map(category => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  isActive={selectedCategory === category.slug}
                  onClick={handleCategoryClick}
                />
              ))}
            </div>
          </section>

          <section className="services-section">
            <div className="services-header">
              {selectedCategory ? (
                <>
                  <h1>Услуги в категории</h1>

                </>
              ) : (
                <h1>Все услуги</h1>
              )}
            </div>

            <div className="filter-toggle">
              <button
                className="filter-toggle-btn"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Скрыть фильтры ▲' : 'Показать фильтры ▼'}
              </button>
            </div>

            {showFilters && (
              <div className="filters-panel">
                <div className="filter-group">
                  <label>Цена (руб.)</label>
                  <div className="price-inputs">
                    <input
                      type="number"
                      placeholder="от"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="до"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>

                <div className="filter-group">
                  <label>Город</label>
                  <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
                    <option value="">Все города</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-actions">
                  <button className="apply-btn" onClick={applyFilters}>Применить</button>
                  <button className="reset-filters-btn" onClick={handleReset}>Сбросить</button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="loading">Загрузка...</div>
            ) : (
              <>
                <div className="services-grid">
                  {services.map(service => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>

                {hasMore && (
                  <div className="load-more-container">
                    <button
                      className="load-more-btn"
                      onClick={loadMore}
                      disabled={loadingMore}
                    >
                      {loadingMore ? 'Загрузка...' : 'Показать ещё'}
                    </button>
                  </div>
                )}
              </>
            )}

            {!loading && services.length === 0 && (
              <div className="no-results">
                <p>Услуги не найдены</p>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default HomePage;