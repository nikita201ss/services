import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/style/styles.scss';

const Header = ({ onSearch, user, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
    navigate('/?search=' + searchQuery);
  };

  return (
    <>
      <header className="header">
        <nav className="header__nav">
          <ul className="header__list">
            <li><Link to="/">Главная</Link></li>
            <li><Link to="/about">О нас</Link></li>
            <li><Link to="/">Информация для заказчиков</Link></li>
            <li><Link to="/">Информация для исполнителей</Link></li>
            {user && (
              <li><Link to="/create-service">Предоставить услугу</Link></li>
            )}
          </ul>
        </nav>
      </header>
      
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
          {user ? (
            <>
              <div className="auth-buttons__user">
                <p>{user.username}</p>
              </div>
              <div className="auth-buttons__logout">
                <button onClick={onLogout}>Выйти</button>
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