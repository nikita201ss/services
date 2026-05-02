import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CategoryCard from '../components/CategoryCard';
import ServiceCard from '../components/ServiceCard';
import { api } from '../services/api';
import '../assets/style/styles.scss';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const loadCategories = useCallback(async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
    }
  }, []);

  const loadServices = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {
        category: searchParams.get('category'),
        search: searchParams.get('search'),
        minPrice: searchParams.get('min_price'),
        maxPrice: searchParams.get('max_price')
      };
      const data = await api.getServices(filters);
      setServices(data);
    } catch (error) {
      console.error('Ошибка загрузки услуг:', error);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    setSelectedCategory(categoryFromUrl);
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
    setSearchParams({});
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
                  <span className="services-count">Найдено: {services.length}</span>
                  <button className="reset-btn" onClick={handleReset}>
                    Сбросить
                  </button>
                </>
              ) : (
                <h1>Все услуги</h1>
              )}
            </div>

            {loading ? (
              <div className="loading">Загрузка...</div>
            ) : (
              <div className="services-grid">
                {services.map(service => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
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