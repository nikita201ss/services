import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../assets/style/styles.scss';

const PerformersPage = () => {
  return (
    <>
      <Header />
      <main className="page-info">
        <div className="homepage__container">
          <h1 className="info-title">Информация для исполнителей</h1>
          
          <div className="info-section">
            <h2>Как начать зарабатывать?</h2>
            <div className="info-steps">
              <div className="step-card">
                <div className="step-number">1</div>
                <h3>Зарегистрируйтесь</h3>
                <p>Создайте аккаунт на платформе</p>
              </div>
              <div className="step-card">
                <div className="step-number">2</div>
                <h3>Создайте услугу</h3>
                <p>Опишите свою услугу, добавьте фото и укажите цену</p>
              </div>
              <div className="step-card">
                <div className="step-number">3</div>
                <h3>Дождитесь модерации</h3>
                <p>Ваша услуга пройдёт проверку модератором</p>
              </div>
              <div className="step-card">
                <div className="step-number">4</div>
                <h3>Получайте заявки</h3>
                <p>После публикации вам начнут поступать заявки от заказчиков</p>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h2>Преимущества для исполнителей</h2>
            <div className="benefits-grid">
              <div className="benefit-card">
                <h3>Бесплатное размещение</h3>
                <p>Размещение услуг абсолютно бесплатно</p>
              </div>
              <div className="benefit-card">
                <h3>Прямые заявки</h3>
                <p>Заказчики сами находят вас и отправляют заявки</p>
              </div>
              <div className="benefit-card">
                <h3>Личный кабинет</h3>
                <p>Управляйте услугами и отслеживайте заявки в профиле</p>
              </div>
              <div className="benefit-card">
                <h3>Модерация качества</h3>
                <p>Все услуги проходят проверку, что повышает доверие</p>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h2>Правила для исполнителей</h2>
            <ul className='info-list'>
              <li>Размещайте только актуальные и достоверные данные об услугах</li>
              <li>Отвечайте на заявки заказчиков в течение 24 часов</li>
              <li>Предоставляйте качественные услуги согласно описанию</li>
              <li>Будьте вежливы и профессиональны в общении</li>
            </ul>
          </div>

          <div className="info-section">
            <div className="create-service-card">
              <h2>Готовы начать?</h2>
              <p>Создайте свою первую услугу прямо сейчас</p>
              <Link to="/create-service" className="create-service-btn">
                Создать услугу
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default PerformersPage;