import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ServiceCard from '../components/ServiceCard';
import { api } from '../services/api';
import '../assets/style/styles.scss';
import { formatPhoneNumber } from '../utils/formatPhone';
import { useAuth } from '../contexts/AuthContext';

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
  const [formErrors, setFormErrors] = useState({});
  const [showContractForm, setShowContractForm] = useState(false);

  const { isAuthenticated } = useAuth();
  const [requestData, setRequestData] = useState({
    description: '',
    meeting_date: '',
    phone_number: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const loadService = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getServiceBySlug(slug);
      setService(data);
      setMainImage(data.main_image_url || `http://localhost:8000${data.main_image}`);
      setCurrentIndex(0);

      if (data.category) {
        const categorySlug = data.category_slug || data.category;
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

  const handleRequestInputChange = (e) => {
    const { name, value } = e.target;
    setRequestData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmitRequest = async () => {
    setFormErrors({});

    if (!isAuthenticated) {
      setFormErrors({ auth: 'Пожалуйста, войдите в аккаунт для отправки заявки' });
      return;
    }

    const errors = {};

    if (!requestData.description.trim()) {
      errors.description = 'Опишите, что нужно сделать (минимум 5 символов)';
    } else if (requestData.description.trim().length < 5) {
      errors.description = 'Описание должно содержать минимум 5 символов (сейчас ' + requestData.description.trim().length + ' символов)';
    }

    if (!requestData.meeting_date) {
      errors.meeting_date = 'Выберите дату и время встречи';
    }

    if (!requestData.phone_number.trim()) {
      errors.phone_number = 'Введите номер телефона';
    } else if (requestData.phone_number.replace(/\D/g, '').length < 11) {
      const currentLength = requestData.phone_number.replace(/\D/g, '').length;
      errors.phone_number = 'Введите полный номер телефона (нужно 11 цифр, сейчас ' + currentLength + ')';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);

    try {
      const requestPayload = {
        service: service.id,
        executor: service.user,
        description: requestData.description,
        meeting_date: requestData.meeting_date,
        phone_number: requestData.phone_number.replace(/\D/g, ''),
      };

      await api.createRequest(requestPayload);

      setSubmitMessage('Заявка успешно отправлена');
      setRequestData({ description: '', meeting_date: '', phone_number: '' });
      setTimeout(() => setSubmitMessage(''), 3000);
      setTimeout(() => setShowContractForm(false), 2000);
    } catch (error) {
      console.error('Ошибка отправки заявки:', error);
      setSubmitMessage('Ошибка при отправке заявки');
      setTimeout(() => setSubmitMessage(''), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleContractForm = () => {
    setShowContractForm(!showContractForm);
    if (!showContractForm) {
      setFormErrors({});
      setSubmitMessage('');
    }
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
  const executorName = service.user_info?.first_name;

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
                  <div className="thumbnails" ref={thumbnailsRef}>
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
                <div className="location2__info">
                  <img src="/static/icon/pin.svg" alt="pin" className="pin" />
                  <div>
                    <p>{service.city || 'Город не указан'}</p>
                    <p>{service.address || 'Адрес не указан'}</p>
                  </div>
                </div>
                {executorName && (
                  <div className="executor-info">
                    <p>{executorName}</p>
                  </div>
                )}
              </div>

              <div className='group-buttons'>
                <div className="phone-button" onClick={handlePhoneClick}>
                  {showPhone ? (
                    <a href={`tel:${service.phone_number}`} className="phone-text">
                      {formattedPhone}
                    </a>
                  ) : (
                    <span className="phone-text">Увидеть номер</span>
                  )}
                </div>

                <div className="meeting-button" onClick={toggleContractForm}>
                  <span className="phone-text">
                    {showContractForm ? 'Скрыть форму' : 'Договориться о встрече'}
                  </span>
                </div>
              </div>
            </div>

            <div className="description">
              <h2>{service.name}</h2>
              <p className="price">{service.price} руб.</p>
              <p className="description-title"><b>Описание</b></p>
              <div className="detail-txt">
                {service.description?.split('\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>

          {showContractForm && (
            <div className="contract">
              <div className="contract__title">
                <p>Создание заявки</p>
              </div>

              {formErrors.auth && (
                <div className="contract__message error">
                  {formErrors.auth}
                </div>
              )}

              {submitMessage && (
                <div className={`contract__message ${submitMessage.includes('успешно') ? 'success' : 'error'}`}>
                  {submitMessage}
                </div>
              )}

              <div className="contract__blocks">
                <div className="contract__block">
                  <p>Укажите, что нужно сделать? <span className="required">*</span></p>
                  <textarea
                    name="description"
                    rows="3"
                    placeholder="Опишите задачи (минимум 5 символов)..."
                    value={requestData.description}
                    onChange={handleRequestInputChange}
                    className={formErrors.description ? 'error-input' : ''}
                  />
                  {formErrors.description && (
                    <div className="error-message">{formErrors.description}</div>
                  )}
                </div>

                <div className="contract__block">
                  <p>Выберите дату и время <span className="required">*</span></p>
                  <input
                    type="datetime-local"
                    name="meeting_date"
                    value={requestData.meeting_date}
                    onChange={handleRequestInputChange}
                    className={formErrors.meeting_date ? 'error-input' : ''}
                  />
                  {formErrors.meeting_date && (
                    <div className="error-message">{formErrors.meeting_date}</div>
                  )}
                </div>

                <div className="contract__block">
                  <p>Укажите номер телефона для связи <span className="required">*</span></p>
                  <input
                    type="tel"
                    name="phone_number"
                    placeholder="+7 (___) ___-__-__"
                    value={requestData.phone_number}
                    onChange={(e) => {
                      let value = e.target.value;
                      const numbers = value.replace(/\D/g, '');

                      let formatted = '';
                      if (numbers.length > 0) {
                        formatted = '+7';
                        if (numbers.length > 1) {
                          formatted += ` (${numbers.slice(1, 4)}`;
                        }
                        if (numbers.length >= 4) {
                          formatted += `) ${numbers.slice(4, 7)}`;
                        }
                        if (numbers.length >= 7) {
                          formatted += `-${numbers.slice(7, 9)}`;
                        }
                        if (numbers.length >= 9) {
                          formatted += `-${numbers.slice(9, 11)}`;
                        }
                      }

                      setRequestData(prev => ({ ...prev, phone_number: formatted }));
                      if (formErrors.phone_number) {
                        setFormErrors(prev => ({ ...prev, phone_number: '' }));
                      }
                    }}
                    className={formErrors.phone_number ? 'error-input' : ''}
                  />
                  {formErrors.phone_number && (
                    <div className="error-message">{formErrors.phone_number}</div>
                  )}
                </div>
              </div>

              <div className='block-btn'>
                <div className={`contract__btn ${submitting ? 'loading' : ''}`} onClick={handleSubmitRequest}>
                  <p className="contract__btn__txt">
                    {submitting ? 'Отправка...' : 'Отправить заявку'}
                  </p>
                </div>
              </div>
            </div>
          )}

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