import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../assets/style/styles.scss';

const ClientsPage = () => {
  return (
    <>
      <Header />
      <main className="page-info">
        <div className="homepage__container">
          <h1 className="info-title">Информация для заказчиков</h1>
          
          <div className="info-section">
            <h2>Как найти исполнителя?</h2>
            <div className="info-steps">
              <div className="step-card">
                <div className="step-number">1</div>
                <h3>Выберите категорию</h3>
                <p>На главной странице выберите нужную категорию услуг</p>
              </div>
              <div className="step-card">
                <div className="step-number">2</div>
                <h3>Просмотрите предложения</h3>
                <p>Изучите услуги исполнителей, их цены и описание</p>
              </div>
              <div className="step-card">
                <div className="step-number">3</div>
                <h3>Создайте заявку</h3>
                <p>На странице услуги нажмите "Договориться о встрече" и заполните форму</p>
              </div>
              <div className="step-card">
                <div className="step-number">4</div>
                <h3>Дождитесь ответа</h3>
                <p>Исполнитель рассмотрит вашу заявку и свяжется с вами</p>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h2>Преимущества работы с нами</h2>
            <div className="benefits-grid">
              <div className="benefit-card">
                <h3>Удобный поиск</h3>
                <p>Быстрый поиск исполнителей по категориям и городам</p>
              </div>
              <div className="benefit-card">
                <h3>Прямое общение</h3>
                <p>Связывайтесь с исполнителями напрямую через платформу</p>
              </div>
              <div className="benefit-card">
                <h3>Бесплатно для заказчиков</h3>
                <p>Размещение заявок и поиск исполнителей бесплатны</p>
              </div>
              <div className="benefit-card">
                <h3>Прозрачность</h3>
                <p>Вся информация об услугах и ценах указана заранее</p>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h2>Советы по выбору исполнителя</h2>
            <ul className='info-list'>
              <li>Внимательно изучайте детали услуг</li>
              <li>Сравнивайте цены у разных исполнителей</li>
              <li>Задавайте уточняющие вопросы перед оформлением заявки</li>
              <li>Обсуждайте все детали заранее</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ClientsPage;