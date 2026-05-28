import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../assets/style/styles.scss';

const Header = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
    navigate('/?search=' + searchQuery);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <button className={`burger-btn ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </button>

      <header className="header">
        <nav className="header__nav">
          <ul className={`header__list ${isMenuOpen ? 'mobile-open' : ''}`}>
            <li><Link to="/" onClick={closeMenu}>Главная</Link></li>
            <li><Link to="/about" onClick={closeMenu}>О нас</Link></li>
            <li><Link to="/clients" onClick={closeMenu}>Для заказчиков</Link></li>
            <li><Link to="/performers" onClick={closeMenu}>Для исполнителей</Link></li>
            {isAuthenticated && <li><Link to="/calendar" onClick={closeMenu}>Календарь</Link></li>}
            {isAuthenticated && (
              <li><Link to="/create-service" onClick={closeMenu}>Предоставить услугу</Link></li>
            )}
            {user?.is_staff && (
              <li><Link to="/moderation" onClick={closeMenu}>Модерация</Link></li>
            )}
          </ul>
        </nav>
      </header>

      {isMenuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}

      <div className="panel">
        <div className="panel__logo">
          <Link to="/">
            <img src="/static/icon/LOGO.svg" alt="logo" />
          </Link>
        </div>

        <form className="search-panel" onSubmit={handleSubmit}>
          <input
            className="search-panel__input"
            type="text"
            placeholder="Поиск услуг"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-panel__button">
            <img src="/static/icon/search.svg" alt="search" />
          </button>
        </form>

        <div className="auth-buttons">
          {isAuthenticated ? (
            <>
              <Link to="/profile">
                <div className="auth-buttons__user">
                  <p>{user?.first_name || user?.username || 'Пользователь'}</p>
                </div>
              </Link>
              <div className="auth-buttons__logout">
                <button onClick={handleLogout}>Выйти</button>
              </div>
            </>
          ) : (
            <>
              <div className="auth-buttons__login">
                <Link to="/login">Вход</Link>
              </div>
              <div className="auth-buttons__register">
                <Link to="/register">Регистрация</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;