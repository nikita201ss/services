import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ServiceCard from '../components/ServiceCard';
import { api } from '../services/api';
import '../assets/style/styles.scss';
import { formatPhoneNumber } from '../utils/formatPhone';

const ServiceDetailPage = () => {
  const { slug } = useParams();
  const [service, setService] = useState(null);
  const [relatedServices, setRelatedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState('');
  const [showPhone, setShowPhone] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const thumbnailsRef = useRef(null);
  const [formattedPhone, setFormattedPhone] = useState('');



  const loadService = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getServiceBySlug(slug);
      setService(data);
      setMainImage(data.main_image_url || `http://localhost:8000${data.main_image}`);
      setCurrentIndex(0);

      if (data.category) {
        const categorySlug = data.category.slug || data.category;
        const filters = { category: categorySlug };
        const related = await api.getServices(filters);
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

  const getAllImages = () => {
    const images = [];
    if (service?.main_image) {
      images.push(service.main_image_url || `http://localhost:8000${service.main_image}`);
    }
    if (service?.images) {
      service.images.forEach(img => {
        const imgUrl = img.image_url || `http://localhost:8000${img.image}`;
        images.push(imgUrl);
      });
    }
    return images;
  };

  const allImages = getAllImages();
  const totalImages = allImages.length;

  useEffect(() => {

    if (thumbnailsRef.current && totalImages > 4) {
      const thumbnailElements = thumbnailsRef.current.children;
      if (thumbnailElements[currentIndex]) {
        thumbnailElements[currentIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [currentIndex, totalImages]);

  useEffect(() => {
    if (service && service.phone_number) {
      setFormattedPhone(formatPhoneNumber(service.phone_number));
    }
  }, [service]);

  const prevImage = () => {
    const newIndex = currentIndex === 0 ? totalImages - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    setMainImage(allImages[newIndex]);
  };

  const nextImage = () => {
    const newIndex = currentIndex === totalImages - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    setMainImage(allImages[newIndex]);
  };

  const selectThumbnail = (index) => {
    setCurrentIndex(index);
    setMainImage(allImages[index]);
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

  const categorySlug = service.category_slug || service.category?.slug || service.category;
  const hasMultipleImages = totalImages > 1;

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

              <div className="det-img-container">
                {hasMultipleImages && (
                  <button
                    className="nav-arrow nav-arrow--prev"
                    onClick={prevImage}
                    aria-label="Предыдущее изображение"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}

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

                {hasMultipleImages && (
                  <button
                    className="nav-arrow nav-arrow--next"
                    onClick={nextImage}
                    aria-label="Следующее изображение"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
              </div>

              {totalImages > 1 && (
                <div className="thumbnails-wrapper">
                  <div
                    className="thumbnails"
                    ref={thumbnailsRef}
                  >
                    {allImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`${service.name} ${idx + 1}`}
                        className={`thumbnail ${currentIndex === idx ? 'active' : ''}`}
                        onClick={() => selectThumbnail(idx)}
                      />
                    ))}
                  </div>
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
                  <a href={`tel:${service.phone_number}`} className="phone-text">
                    {formattedPhone}
                  </a>
                ) : (
                  <span className="phone-text">Увидеть номер</span>
                )}
              </div>

              {/* <div className="meeting-button" onClick={handlePhoneClick}>

                <span className="phone-text">Договориться о встрече</span>
              </div> */}


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