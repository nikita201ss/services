import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ServiceCard from '../components/ServiceCard';
import { api } from '../services/api';
import '../assets/style/styles.scss';

const ServiceDetailPage = () => {
  const { slug } = useParams();
  const [service, setService] = useState(null);
  const [relatedServices, setRelatedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState('');
  const [showPhone, setShowPhone] = useState(false);

  const loadService = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getServiceBySlug(slug);
      setService(data);
      setMainImage(data.main_image_url || `http://localhost:8000${data.main_image}`);
      
      // Загрузка похожих услуг
      if (data.category) {
        const categorySlug = data.category.slug || data.category;
        const filters = { category: categorySlug };
        const related = await api.getServices(filters);
        // Исключаем текущую услугу
        const filtered = related.filter(s => s.slug !== slug).slice(0, 4);
        setRelatedServices(filtered);
      }
    } catch (error) {
      console.error('Ошибка загрузки услуги:', error);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadService();
  }, [loadService]);

  const changeImage = (imageSrc) => {
    setMainImage(imageSrc);
  };

  const handlePhoneClick = () => {
    setShowPhone(true);
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="homepage">
          <div className="loading">Загрузка...</div>
        </main>
        <Footer />
      </>
    );
  }

  if (!service) {
    return (
      <>
        <Header />
        <main className="homepage">
          <div className="no-results">
            <p>Услуга не найдена</p>
            <Link to="/" className="reset-btn">Вернуться на главную</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const allImages = [];
  if (service.main_image) {
    allImages.push(service.main_image_url || `http://localhost:8000${service.main_image}`);
  }
  if (service.images) {
    service.images.forEach(img => {
      const imgUrl = img.image_url || `http://localhost:8000${img.image}`;
      allImages.push(imgUrl);
    });
  }

  // Получение slug категории
  const categorySlug = service.category_slug || service.category?.slug || service.category;

  return (
    <>
      <Header />
      <main className="homepage">
        <div className="homepage__container">
          <div className="way">
            <Link to="/">Главная</Link>
            <p>&gt;</p>
            <Link to={`/?category=${categorySlug}`}>
              {service.category_name?.toUpperCase() || service.category?.name?.toUpperCase()}
            </Link>
            <p>&gt;</p>
            <span className="current">{service.name?.toUpperCase()}</span>
          </div>

          <div className="sectors">
            <div className="images-detail">
              {mainImage && (
                <div className="det-img">
                  <img 
                    id="mainImage" 
                    src={mainImage} 
                    alt={service.name} 
                    className="detail-img"
                  />
                </div>
              )}

              {allImages.length > 1 && (
                <div className="extra-images">
                  {allImages.map((img, index) => (
                    <img 
                      key={index}
                      src={img} 
                      alt={`${service.name} ${index + 1}`} 
                      className={`extra-img ${mainImage === img ? 'active' : ''}`}
                      onClick={() => changeImage(img)}
                    />
                  ))}
                </div>
              )}

              <div className="location2">
                <img src="/static/icon/pin.svg" alt="pin" className="pin" />
                <div>
                  <p>{service.city || 'Город не указан'}</p>
                  <p>{service.address || 'Адрес не указан'}</p>
                </div>
              </div>

              <div className="phone-button" onClick={handlePhoneClick}>
                {showPhone ? (
                  <p className="phone-text">{service.phone_number}</p>
                ) : (
                  <p className="phone-text">Увидеть номер</p>
                )}
              </div>
            </div>

            <div className="description">
              <h2>{service.name}</h2>
              <p className="price">{service.price} руб.</p>
              <p className="description-title">Описание</p>
              <div className="detail-txt">
                {service.description?.split('\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>

          {relatedServices.length > 0 && (
            <div className="related-services">
              <h2 className="related-title">Похожие услуги</h2>
              <div className="services-grid">
                {relatedServices.map(related => (
                  <ServiceCard key={related.id} service={related} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ServiceDetailPage;