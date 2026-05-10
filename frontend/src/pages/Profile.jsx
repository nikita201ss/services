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
  const [activeTab, setActiveTab] = useState('received');
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState({ show: false, requestId: null });
  const [rejectReason, setRejectReason] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadRequests();
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

  const handleApprove = async (requestId) => {
    setUpdating(true);
    try {
      await api.updateRequestStatus(requestId, 'approved', null);
      await loadRequests(); // Перезагружаем список
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
      await loadRequests(); // Перезагружаем список
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
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const currentRequests = activeTab === 'received' ? receivedRequests : sentRequests;

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
              Входящие заявки ({receivedRequests.length})
            </button>
            <button 
              className={`profile-tab ${activeTab === 'sent' ? 'active' : ''}`}
              onClick={() => setActiveTab('sent')}
            >
              Исходящие заявки ({sentRequests.length})
            </button>
          </div>

          <div className="requests-list">
            {loading ? (
              <div className="loading">Загрузка...</div>
            ) : currentRequests.length === 0 ? (
              <div className="no-requests">
                <p>Нет заявок</p>
              </div>
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
                  
                  {/* Кнопки действий - только для входящих и только в статусе pending */}
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
      
      {/* Модальное окно для причины отказа */}
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