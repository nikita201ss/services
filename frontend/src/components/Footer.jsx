import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/style/styles.scss';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__logo">
          <img src="/static/icon/LOGO-white.svg" alt="logo" />
        </div>
        
        <div className="footer__blocks">
          <div className="footer__block">
            <h3>Информация</h3>
            <nav>
              <ul>
                <li><Link to="/about">О нас</Link></li>
                <li><Link to="/">Для заказчиков</Link></li>
                <li><Link to="/">Для исполнителей</Link></li>
              </ul>
            </nav>
          </div>

          <div className="footer__block">
            <h3>Юридические документы</h3>
            <nav>
              <ul>
                <li><Link to="/">Политика конфиденциальности</Link></li>
                <li><Link to="/">Пользовательское соглашение</Link></li>
                <li><Link to="/">Согласие на обработку персональных данных</Link></li>
              </ul>
            </nav>
          </div>

          <div className="footer__block">
            <h3>Рабочее пространство</h3>
            <nav>
              <ul>
                <li><Link to="/profile">Личный кабинет</Link></li>
                <li><Link to="/calendar">Календарь</Link></li>

              </ul>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;