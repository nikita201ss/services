import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../assets/style/styles.scss';

const locales = {
  'ru': ru,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales,
});

const CustomToolbar = ({ onNavigate, onView, date, label, view }) => {
  const goToBack = () => {
    onNavigate('PREV');
  };

  const goToNext = () => {
    onNavigate('NEXT');
  };

  const goToCurrent = () => {
    onNavigate('TODAY');
  };

  const goToMonth = () => {
    onView('month');
  };

  const goToWeek = () => {
    onView('week');
  };

  const goToDay = () => {
    onView('day');
  };

  return (
    <div className="rbc-toolbar">
      <span className="rbc-btn-group">
        <button type="button" onClick={goToCurrent}>Сегодня</button>
        <button type="button" onClick={goToBack}>Назад</button>
        <button type="button" onClick={goToNext}>Вперед</button>
      </span>
      <span className="rbc-toolbar-label">{label}</span>
      <span className="rbc-btn-group">
        <button 
          type="button" 
          onClick={goToMonth}
          style={{ backgroundColor: view === 'month' ? '#3AAFAA' : '', color: view === 'month' ? 'white' : '' }}
        >
          Месяц
        </button>
        <button 
          type="button" 
          onClick={goToWeek}
          style={{ backgroundColor: view === 'week' ? '#3AAFAA' : '', color: view === 'week' ? 'white' : '' }}
        >
          Неделя
        </button>
        <button 
          type="button" 
          onClick={goToDay}
          style={{ backgroundColor: view === 'day' ? '#3AAFAA' : '', color: view === 'day' ? 'white' : '' }}
        >
          День
        </button>
      </span>
    </div>
  );
};

const Calendar = () => {
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('month');

  useEffect(() => {
    if (isAuthenticated) {
      loadEvents();
    }
  }, [isAuthenticated]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const received = await api.getReceivedRequests();
      const sent = await api.getSentRequests();
      
      const allRequests = [...(received || []), ...(sent || [])];
      const approvedRequests = allRequests.filter(req => req.status === 'approved');
      
      const calendarEvents = approvedRequests.map(request => {
        let meetingDate = new Date(request.meeting_date);
        
        if (isNaN(meetingDate.getTime())) {
          meetingDate = new Date();
        }
        const endDate = new Date(meetingDate.getTime() + 60 * 60 * 1000);
        
        return {
          id: request.id,
          title: request.service_name || 'Встреча',
          start: meetingDate,
          end: endDate,
          description: request.description,
          customer: request.customer_name,
          executor: request.executor_name,
          phone: request.phone_number,
          status: request.status,
          service_slug: request.service_slug
        };
      });
      
      setEvents(calendarEvents);
    } catch (error) {
      console.error('Ошибка загрузки событий:', error);
    } finally {
      setLoading(false);
    }
  };

  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: '#3AAFAA',
        color: '#ffffff',
        borderRadius: '8px',
        border: 'none',
        padding: '4px 8px',
        fontSize: '12px',
        fontWeight: '500',
        cursor: 'pointer'
      }
    };
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  const closeModal = () => {
    setSelectedEvent(null);
  };

  const handleNavigate = (newDate) => {
    setCurrentDate(newDate);
  };

  const handleViewChange = (newView) => {
    setCurrentView(newView);
  };

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <main className="calendar-page">
          <div className="calendar-container">
            <div className="no-events">
              <p>Пожалуйста, <Link to="/login">войдите</Link> чтобы просмотреть календарь</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="calendar-page">
        <div className="calendar-container">
          <div className="calendar-header">
            <h1>Календарь встреч</h1>
            <p>Здесь отображаются все одобренные встречи</p>
          </div>
          
          {loading ? (
            <div className="loading">Загрузка...</div>
          ) : events.length === 0 ? (
            <div className="no-events">
              <p>Нет запланированных встреч</p>
              <p>Когда ваши заявки будут одобрены, они появятся здесь</p>
            </div>
          ) : (
            <div className="calendar-wrapper">
              <BigCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                date={currentDate}
                onNavigate={handleNavigate}
                view={currentView}
                onView={handleViewChange}
                style={{ height: '70vh' }}
                components={{
                  toolbar: CustomToolbar
                }}
                eventPropGetter={eventStyleGetter}
                onSelectEvent={handleSelectEvent}
                culture="ru"
                defaultView="month"
                views={['month', 'week', 'day']}
                popup={true}
                messages={{
                  next: "Вперед",
                  previous: "Назад",
                  today: "Сегодня",
                  month: "Месяц",
                  week: "Неделя",
                  day: "День",
                  agenda: "Повестка",
                  date: "Дата",
                  time: "Время",
                  event: "Событие",
                  noEventsInRange: "Нет событий в выбранном периоде"
                }}
              />
            </div>
          )}
        </div>
      </main>

      {selectedEvent && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedEvent.title}</h3>
            <div className="event-details">
              <p><strong>Дата и время:</strong> {new Date(selectedEvent.start).toLocaleString('ru-RU')}</p>
              <p><strong>Описание:</strong> {selectedEvent.description}</p>
              <p><strong>Заказчик:</strong> {selectedEvent.customer}</p>
              <p><strong>Исполнитель:</strong> {selectedEvent.executor}</p>
              <p><strong>Телефон:</strong> {selectedEvent.phone}</p>
              <p><strong>Статус:</strong> Одобрено</p>
            </div>
            <div className="modal-actions">
              <button className="btn-submit" onClick={closeModal}>
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </>
  );
};

export default Calendar;