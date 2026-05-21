import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import '../assets/style/styles.scss';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [userServices, setUserServices] = useState([]);
  const [activeTab, setActiveTab] = useState('received');
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState({ show: false, requestId: null });
  const [rejectReason, setRejectReason] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadRequests();
      loadUserServices();
    }
  }, [isAuthenticated]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const [received, sent] = await Promise.all([
        api.getReceivedRequests(),
        api.getSentRequests()
      ]);
      setReceivedRequests(received || []);
      setSentRequests(sent || []);
    } catch (error) {
      console.error('Ошибка загрузки заявок:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserServices = async () => {
    try {
      const services = await api.getUserServices();
      console.log('Loaded user services:', services);
      setUserServices(Array.isArray(services) ? services : []);
    } catch (error) {
      console.error('Ошибка загрузки услуг:', error);
      setUserServices([]);
    }
  };

  const handleApprove = async (requestId) => {
    setUpdating(true);
    try {
      await api.updateRequestStatus(requestId, 'approved', null);
      await loadRequests();
      alert('Заявка одобрена!');
    } catch (error) {
      console.error('Ошибка при одобрении:', error);
      alert('Ошибка при одобрении заявки');
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Пожалуйста, укажите причину отказа');
      return;
    }

    setUpdating(true);
    try {
      await api.updateRequestStatus(rejectModal.requestId, 'rejected', rejectReason);
      setRejectModal({ show: false, requestId: null });
      setRejectReason('');
      await loadRequests();
      alert('Заявка отклонена');
    } catch (error) {
      console.error('Ошибка при отклонении:', error);
      alert('Ошибка при отклонении заявки');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: <span className="badge badge--pending">Ожидает</span>,
      approved: <span className="badge badge--approved">Одобрено</span>,
      rejected: <span className="badge badge--rejected">Отклонено</span>,
      cancelled: <span className="badge badge--cancelled">Отменено</span>
    };
    return badges[status] || badges.pending;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Не указана';
    const [datePart, timePart] = dateString.split('T');
    const [year, month, day] = datePart.split('-');
    const time = timePart ? timePart.substring(0, 5) : '00:00';
    return `${day}.${month}.${year} ${time}`;
  };

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <main className="page-profile">
          <div className="profile-container">
            <p>Пожалуйста, <Link to="/login">войдите</Link> чтобы просмотреть профиль</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const currentRequests = activeTab === 'received' ? receivedRequests :
    activeTab === 'sent' ? sentRequests :
      userServices;

  return (
    <>
      <Header />
      <main className="page-profile">
        <div className="profile-container">
          <div className="profile-header">
            <h1>Личный кабинет</h1>
            <p className="profile-username">{user?.username}</p>
          </div>

          <div className="profile-tabs">
            <button
              className={`profile-tab ${activeTab === 'received' ? 'active' : ''}`}
              onClick={() => setActiveTab('received')}
            >
              Входящие ({receivedRequests.length})
            </button>
            <button
              className={`profile-tab ${activeTab === 'sent' ? 'active' : ''}`}
              onClick={() => setActiveTab('sent')}
            >
              Исходящие ({sentRequests.length})
            </button>
            <button
              className={`profile-tab ${activeTab === 'services' ? 'active' : ''}`}
              onClick={() => setActiveTab('services')}
            >
              Мои услуги ({userServices.length})
            </button>
          </div>

          <div className="requests-list">
            {loading ? (
              <div className="loading">Загрузка...</div>
            ) : currentRequests.length === 0 ? (
              <div className="no-requests">
                <p>Нет данных</p>
              </div>
            ) : activeTab === 'services' ? (
              currentRequests.map(service => (
                <div key={service.id} className="request-card">
                  <div className="request-header">
                    <h3>{service.name}</h3>
                    {service.moderation_status === 'pending' && (
                      <span className="badge badge--pending">На модерации</span>
                    )}
                    {service.moderation_status === 'approved' && (
                      <span className="badge badge--approved">Опубликовано</span>
                    )}
                    {service.moderation_status === 'rejected' && (
                      <span className="badge badge--rejected">Отклонено</span>
                    )}
                  </div>

                  <div className="request-details">
                    <p><strong>Категория:</strong> {service.category_name}</p>
                    <p><strong>Цена:</strong> {service.price} руб.</p>
                    <p><strong>Город:</strong> {service.city}</p>
                    <p><strong>Создана:</strong> {formatDate(service.created_at)}</p>
                    <p><strong>Описание:</strong> {service.description?.slice(0, 100)}...</p>

                    {service.moderation_status === 'rejected' && service.moderation_rejection_reason && (
                      <div className="rejection-reason">
                        <strong>Причина отклонения:</strong> {service.moderation_rejection_reason}
                      </div>
                    )}

                    {service.moderation_status === 'pending' && (
                      <div className="request-note pending-note">
                        <p>Услуга на модерации. После проверки она появится на сайте.</p>
                      </div>
                    )}

                    {service.moderation_status === 'approved' && (
                      <div className="request-note approved-note">
                        <p>Услуга опубликована и видна всем пользователям.</p>
                      </div>
                    )}
                  </div>

                  <Link to={`/service/${service.slug}`} className="request-link">
                    Посмотреть услугу
                  </Link>
                </div>
              ))
            ) : (
              currentRequests.map(request => (
                <div key={request.id} className="request-card">
                  <div className="request-header">
                    <h3>{request.service_name}</h3>
                    {getStatusBadge(request.status)}
                  </div>

                  {activeTab === 'received' && (
                    <p className="request-customer">
                      От: <strong>{request.customer_name}</strong>
                    </p>
                  )}

                  {activeTab === 'sent' && (
                    <p className="request-executor">
                      Исполнитель: <strong>{request.executor_name}</strong>
                    </p>
                  )}

                  <div className="request-details">
                    <p><strong>Описание работ:</strong> {request.description}</p>
                    <p><strong>Дата встречи:</strong> {formatDate(request.meeting_date)}</p>
                    <p><strong>Телефон:</strong> {request.phone_number}</p>
                    <p><strong>Создана:</strong> {formatDate(request.created_at)}</p>

                    {request.status === 'rejected' && request.rejection_reason && (
                      <div className="rejection-reason">
                        <strong>Причина отказа:</strong> {request.rejection_reason}
                      </div>
                    )}
                  </div>

                  {activeTab === 'received' && request.status === 'pending' && (
                    <div className="request-actions">
                      <button
                        className="btn-approve"
                        onClick={() => handleApprove(request.id)}
                        disabled={updating}
                      >
                        {updating ? 'Обработка...' : 'Одобрить'}
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => setRejectModal({ show: true, requestId: request.id })}
                        disabled={updating}
                      >
                        {updating ? 'Обработка...' : 'Отклонить'}
                      </button>
                    </div>
                  )}

                  {activeTab === 'received' && request.status === 'approved' && (
                    <div className="request-note approved-note">
                      <p>Вы одобрили эту заявку. Свяжитесь с заказчиком по указанному телефону.</p>
                    </div>
                  )}

                  {activeTab === 'sent' && request.status === 'approved' && (
                    <div className="request-note approved-note">
                      <p>Заявка одобрена! Исполнитель свяжется с вами.</p>
                    </div>
                  )}

                  <Link to={`/service/${request.service_slug}`} className="request-link">
                    Перейти к услуге
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {rejectModal.show && (
        <div className="modal-overlay" onClick={() => setRejectModal({ show: false, requestId: null })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Укажите причину отказа</h3>
            <textarea
              rows="4"
              placeholder="Почему вы отклоняете эту заявку?"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setRejectModal({ show: false, requestId: null })}>
                Отмена
              </button>
              <button className="btn-submit" onClick={handleReject} disabled={updating}>
                {updating ? 'Отправка...' : 'Отправить'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Profile;