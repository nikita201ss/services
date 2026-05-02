import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../assets/style/styles.scss';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Неверный логин или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="homepage">
        <div className="homepage__container">
          <div className="window">
            <form onSubmit={handleSubmit} className="forma">
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <div>
                <div className="group-auth">
                  <label htmlFor="username" className="title-win">Логин</label>
                  <input
                    type="text"
                    id="username"
                    className="form-log"
                    placeholder="Введите логин"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="group-auth">
                  <label htmlFor="password" className="title-win">Пароль</label>
                  <input
                    type="password"
                    id="password"
                    className="form-log"
                    placeholder="Введите пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="btn-auth">
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? 'Вход...' : 'Войти'}
                </button>
              </div>

              <div className="auth-links">
                <p>Нет аккаунта? <br />
                  <b><Link to="/register">Зарегистрироваться</Link></b>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default LoginPage;