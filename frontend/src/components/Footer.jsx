import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/style/styles.scss';







const Footer = () => {

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__logo">
          <Link to="/"><img src="/static/icon/LOGO-white.svg" alt="logo" /></Link>
        </div>

        <div className="footer__blocks">
          <div className="footer__block">
            <h3>Информация</h3>
            <nav>
              <ul>
                <li><Link to="/about">О нас</Link></li>
                <li><Link to="/clients">Для заказчиков</Link></li>
                <li><Link to="/performers">Для исполнителей</Link></li>
              </ul>
            </nav>
          </div>

          <div className="footer__block">
            <h3>Юридические документы</h3>
            <nav>
              <ul>
                <li><Link to="/privacy">Политика конфиденциальности</Link></li>
                <li><Link to="/terms">Пользовательское соглашение</Link></li>
                <li><Link to="/consent">Согласие на обработку персональных данных</Link></li>
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

      <div className="footer__copyright">
        <p>© {currentYear} Services — Сервис поиска надежных специалистов</p>
        <p>Все права защищены. Любое использование материалов допускается только с письменного согласия правообладателя.</p>
      </div>

    </footer>
  );
};

export default Footer;