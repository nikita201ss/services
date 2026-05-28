import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import '../assets/style/styles.scss';

const ModerationPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [pendingServices, setPendingServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [message, setMessage] = useState('');
  const [expandedServices, setExpandedServices] = useState({});
  const [imageIndices, setImageIndices] = useState({});

  useEffect(() => {
    if (isAuthenticated && user?.is_staff) {
      loadPendingServices();
    }
  }, [isAuthenticated, user]);

  const loadPendingServices = async () => {
    setLoading(true);
    try {
      const services = await api.getPendingServices();
      setPendingServices(Array.isArray(services) ? services : []);
      
      const indices = {};
      services.forEach(service => {
        indices[service.id] = 0;
      });
      setImageIndices(indices);
    } catch (error) {
      console.error('Ошибка загрузки услуг:', error);
      setMessage('Ошибка загрузки услуг');
      setPendingServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (service) => {
    try {
      await api.moderateService(service.id, 'approved');
      setMessage(`Услуга "${service.name}" одобрена`);
      loadPendingServices();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Ошибка:', error);
      setMessage('Ошибка при одобрении');
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      alert('Укажите причину отказа');
      return;
    }
    
    try {
      await api.moderateService(selectedService.id, 'rejected', rejectReason);
      setMessage(`Услуга "${selectedService.name}" отклонена`);
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedService(null);
      loadPendingServices();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Ошибка:', error);
      setMessage('Ошибка при отклонении');
    }
  };

  const toggleExpandDescription = (serviceId) => {
    setExpandedServices(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId]
    }));
  };

  const nextImage = (serviceId, imagesLength) => {
    setImageIndices(prev => ({
      ...prev,
      [serviceId]: (prev[serviceId] + 1) % imagesLength
    }));
  };

  const prevImage = (serviceId, imagesLength) => {
    setImageIndices(prev => ({
      ...prev,
      [serviceId]: (prev[serviceId] - 1 + imagesLength) % imagesLength
    }));
  };

  const getAllImages = (service) => {
    const images = [];
    if (service.main_image_url) {
      images.push(service.main_image_url);
    }
    if (service.images) {
      service.images.forEach(img => {
        if (img.image_url) images.push(img.image_url);
      });
    }
    return images;
  };

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <main className="moderation-page">
          <div className="moderation-container">
            <p>Пожалуйста, войдите</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!user?.is_staff) {
    return (
      <>
        <Header />
        <main className="moderation-page">
          <div className="moderation-container">
            <p>Доступ только для модераторов</p>
            <p>Ваш статус: is_staff = {String(user?.is_staff)}</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="moderation-page">
        <div className="moderation-container">
          <div className="moderation-header">
            <h1>Модерация услуг</h1>
            <p>Услуги, ожидающие проверки: {pendingServices.length}</p>
            {message && <div className="message success">{message}</div>}
          </div>

          {loading ? (
            <div className="loading">Загрузка...</div>
          ) : pendingServices.length === 0 ? (
            <div className="no-services">
              <p>Нет услуг на модерации</p>
            </div>
          ) : (
            <div className="services-moderate-list">
              {pendingServices.map(service => {
                const images = getAllImages(service);
                const currentIndex = imageIndices[service.id] || 0;
                const isExpanded = expandedServices[service.id] || false;
                const hasMultipleImages = images.length > 1;

                return (
                  <div key={service.id} className="service-moderate-card">
                    {/* Карусель изображений */}
                    <div className="service-moderate-image">
                      {hasMultipleImages && (
                        <button 
                          className="carousel-nav carousel-nav--prev"
                          onClick={() => prevImage(service.id, images.length)}
                        >
                          ❮
                        </button>
                      )}
                      <img 
                        src={images[currentIndex]} 
                        alt={service.name} 
                      />
                      {hasMultipleImages && (
                        <button 
                          className="carousel-nav carousel-nav--next"
                          onClick={() => nextImage(service.id, images.length)}
                        >
                          ❯
                        </button>
                      )}
                      {hasMultipleImages && (
                        <div className="carousel-dots">
                          {images.map((_, idx) => (
                            <span 
                              key={idx}
                              className={`dot ${currentIndex === idx ? 'active' : ''}`}
                              onClick={() => setImageIndices(prev => ({ ...prev, [service.id]: idx }))}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="service-moderate-info">
                      <h3>{service.name}</h3>
                      <p><strong>Автор:</strong> {service.user_info?.first_name || service.user_info?.username}</p>
                      <p><strong>Категория:</strong> {service.category_name}</p>
                      <p><strong>Цена:</strong> {service.price} руб.</p>
                      <p><strong>Город:</strong> {service.city}</p>
                      <p><strong>Адрес:</strong> {service.address || 'Не указан'}</p>
                      <p><strong>Телефон:</strong> {service.phone_number}</p>
                      <div className="description-section">
                        <strong>Описание:</strong>
                        <div className={`description-text ${isExpanded ? 'expanded' : ''}`}>
                          {service.description?.split('\n').map((paragraph, idx) => (
                            <p key={idx}>{paragraph}</p>
                          ))}
                        </div>
                        {service.description && service.description.length > 200 && (
                          <button 
                            className="expand-btn"
                            onClick={() => toggleExpandDescription(service.id)}
                          >
                            {isExpanded ? 'Свернуть' : 'Читать полностью'}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="service-moderate-actions">
                      <button 
                        className="btn-approve"
                        onClick={() => handleApprove(service)}
                      >
                        Одобрить
                      </button>
                      <button 
                        className="btn-reject"
                        onClick={() => {
                          setSelectedService(service);
                          setShowRejectModal(true);
                        }}
                      >
                        Отклонить
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Модальное окно только для причины отказа */}
      {showRejectModal && selectedService && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Укажите причину отклонения</h3>
            <p className="service-name">Услуга: {selectedService.name}</p>
            <textarea
              rows="4"
              placeholder="Почему услуга не может быть опубликована?"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowRejectModal(false)}>
                Отмена
              </button>
              <button className="btn-submit" onClick={handleRejectSubmit}>
                Отправить
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </>
  );
};

export default ModerationPage;