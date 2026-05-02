import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../assets/style/styles.scss';

const AboutPage = () => {
  return (
    <>
      <Header />
      <main className="page-about">
        <div className="homepage__container">
          <h2 className="about-title">SERVICES - сервис поиска надежных специалистов</h2>
          
          <div className="about-text">
            <p>
              SERVICES - ваш помощник в поиске исполнителей. <br />
              Платформа, которая убирает недоверие из рынка услуг, делая процессы простыми, 
              безопасными и эффективными для всех.
            </p>
            
            <p>
              Мы верим, что рынок услуг должен работать на основе доверия и взаимной выгоды. 
              Наша платформа — это мост между вами, вашими целями и профессионалами, которые 
              помогут их достичь. Наша миссия: Исключить неопределенность и риски, превратив 
              поиск и оказание услуг в простой, приятный и эффективный процесс.
            </p>

            <div className="why">
              <h3>Почему выбирают SERVICES?</h3>
            </div>
            
            <p>Для тех, кто ищет услуги:</p>
            <nav className="about-list">
              <ul>
                <li>Контроль и безопасность: Встроенная система безопасных платежей (эскроу). Вы оплачиваете только принятую работу.</li>
                <li>Удобный поиск: Алгоритмы платформы подбирают для вашей задачи специалистов с оптимальным рейтингом и экспертизой.</li>
                <li>Честные отзывы и портфолио: Полная история выполненных проектов и реальные оценки других клиентов.</li>
                <li>Комфортное взаимодействие: Все общение, обмен файлами и согласование — в одном защищенном рабочем пространстве.</li>
              </ul>
            </nav>
          </div>

          <div className="about-cards">
            <div className="about-card">
              <div className="about-image">
                <img src="/static/images/about1.png" alt="Контроль и безопасность" />
              </div>
              <p className="about-card-txt">Контроль и безопасность</p>
            </div>

            <div className="about-card">
              <div className="about-image">
                <img src="/static/images/about2.png" alt="Удобный поиск специалиста" />
              </div>
              <p className="about-card-txt">Удобный поиск специалиста</p>
            </div>

            <div className="about-card">
              <div className="about-image">
                <img src="/static/images/about3.png" alt="Честные отзывы и портфолио" />
              </div>
              <p className="about-card-txt">Честные отзывы и портфолио</p>
            </div>

            <div className="about-card">
              <div className="about-image">
                <img src="/static/images/about4.png" alt="Комфортное взаимодействие" />
              </div>
              <p className="about-card-txt">Комфортное взаимодействие</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AboutPage;