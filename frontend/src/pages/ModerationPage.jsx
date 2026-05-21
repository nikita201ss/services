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
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated && user?.is_staff) {
      loadPendingServices();
    }
  }, [isAuthenticated, user]);

  const loadPendingServices = async () => {
    setLoading(true);
    try {
      const services = await api.getPendingServices();
      console.log('Loaded services:', services);
      setPendingServices(Array.isArray(services) ? services : []);
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

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Укажите причину отказа');
      return;
    }
    
    try {
      await api.moderateService(selectedService.id, 'rejected', rejectReason);
      setMessage(`Услуга "${selectedService.name}" отклонена`);
      setShowModal(false);
      setRejectReason('');
      setSelectedService(null);
      loadPendingServices();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Ошибка:', error);
      setMessage('Ошибка при отклонении');
    }
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
              {pendingServices.map(service => (
                <div key={service.id} className="service-moderate-card">
                  <div className="service-moderate-image">
                    <img src={service.main_image_url} alt={service.name} />
                  </div>
                  <div className="service-moderate-info">
                    <h3>{service.name}</h3>
                    <p><strong>Автор:</strong> {service.user_info?.username}</p>
                    <p><strong>Категория:</strong> {service.category_name}</p>
                    <p><strong>Цена:</strong> {service.price} руб.</p>
                    <p><strong>Город:</strong> {service.city}</p>
                    <p><strong>Телефон:</strong> {service.phone_number}</p>
                    <p><strong>Описание:</strong> {service.description?.slice(0, 150)}...</p>
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
                        setShowModal(true);
                      }}
                    >
                      Отклонить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Укажите причину отклонения</h3>
            <textarea
              rows="4"
              placeholder="Почему услуга не может быть опубликована?"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>
                Отмена
              </button>
              <button className="btn-submit" onClick={handleReject}>
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