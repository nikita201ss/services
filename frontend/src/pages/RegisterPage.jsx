import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../assets/style/styles.scss';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!username.trim()) {
      newErrors.username = 'Введите логин';
    } else if (username.length < 3) {
      newErrors.username = 'Логин должен содержать минимум 3 символа';
    }
    
    if (!password1) {
      newErrors.password1 = 'Введите пароль';
    } else if (password1.length < 8) {
      newErrors.password1 = 'Пароль должен содержать минимум 8 символов';
    }
    
    if (password1 !== password2) {
      newErrors.password2 = 'Пароли не совпадают';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      await register(username, password1, password2);
      navigate('/');
    } catch (err) {
      if (err.response?.data) {
        setErrors(err.response.data);
      } else {
        setErrors({ general: 'Ошибка регистрации. Попробуйте позже.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="homepage">
        <div className="homepage__container">
          <div className="window-reg">
            <form onSubmit={handleSubmit} className="forma">
              {errors.general && (
                <div className="error-message">
                  {errors.general}
                </div>
              )}

              <div>
                <div className="group-auth">
                  <label htmlFor="username" className="title-win">Логин</label>
                  <input
                    type="text"
                    id="username"
                    className="form-reg"
                    placeholder="Введите логин"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  {errors.username && (
                    <div className="error">
                      {errors.username}
                    </div>
                  )}
                </div>

                <div className="group-auth">
                  <label htmlFor="password1" className="title-win">Пароль</label>
                  <input
                    type="password"
                    id="password1"
                    className="form-reg"
                    placeholder="Введите пароль"
                    value={password1}
                    onChange={(e) => setPassword1(e.target.value)}
                  />
                  {errors.password1 && (
                    <div className="error">
                      {errors.password1}
                    </div>
                  )}
                  {/* <p className="pass">
                    Пароль должен содержать минимум 8 символов
                  </p> */}
                </div>

                <div className="group-auth">
                  <label htmlFor="password2" className="title-win">Подтверждение пароля</label>
                  <input
                    type="password"
                    id="password2"
                    className="form-reg"
                    placeholder="Повторите пароль"
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                  />
                  {errors.password2 && (
                    <div className="error">
                      {errors.password2}
                    </div>
                  )}
                </div>
              </div>

              <div className="btn-auth">
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                </button>
              </div>

              <div className="auth-links">
                <p>Уже есть аккаунт? <br />
                  <b><Link to="/login">Войти</Link></b>
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

export default RegisterPage;