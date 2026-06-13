import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import '../../assets/style/styles.scss';

const CreateServicePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    city: '',
    address: '',
    phone_number: '',
    category: '',
    main_image: null,
    extra_images: [],
    price_from: false,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const loadCategories = async () => {
      try {
        const data = await api.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Ошибка загрузки категорий:', error);
      }
    };

    loadCategories();
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    const numbers = value.replace(/\D/g, '');

    let formatted = '';
    if (numbers.length > 0) {
      formatted = '+7';
      if (numbers.length > 1) {
        formatted += ` (${numbers.slice(1, 4)}`;
      }
      if (numbers.length >= 4) {
        formatted += `) ${numbers.slice(4, 7)}`;
      }
      if (numbers.length >= 7) {
        formatted += `-${numbers.slice(7, 9)}`;
      }
      if (numbers.length >= 9) {
        formatted += `-${numbers.slice(9, 11)}`;
      }
    }

    setFormData(prev => ({ ...prev, phone_number: formatted }));
    if (errors.phone_number) {
      setErrors(prev => ({ ...prev, phone_number: '' }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'main_image') {
      setFormData(prev => ({ ...prev, main_image: files[0] }));
    } else if (name === 'extra_images') {
      setFormData(prev => ({ ...prev, extra_images: Array.from(files) }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Введите название услуги';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Название должно содержать минимум 3 символа';
    }

    if (!formData.price) {
      newErrors.price = 'Введите цену';
    } else if (isNaN(formData.price) || formData.price <= 0) {
      newErrors.price = 'Цена должна быть положительным числом';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Введите описание услуги';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Введите город';
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Введите номер телефона';
    } else if (formData.phone_number.replace(/\D/g, '').length < 11) {
      newErrors.phone_number = 'Введите полный номер телефона (11 цифр)';
    }

    if (!formData.category) {
      newErrors.category = 'Выберите категорию';
    }

    if (!formData.main_image) {
      newErrors.main_image = 'Загрузите главное изображение';
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
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('price', formData.price);
      submitData.append('price_from', formData.price_from);
      submitData.append('description', formData.description);
      submitData.append('city', formData.city);
      submitData.append('address', formData.address || '');
      submitData.append('phone_number', formData.phone_number.replace(/\D/g, ''));
      submitData.append('category', formData.category);
      submitData.append('main_image', formData.main_image);

      formData.extra_images.forEach(image => {
        submitData.append('uploaded_images', image);
      });

      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/services/create/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      if (response.ok) {
        navigate('/');
      } else {
        const errorData = await response.json();
        setErrors({ general: errorData.message || 'Ошибка при создании услуги' });
      }
    } catch (error) {
      console.error('Ошибка:', error);
      setErrors({ general: 'Ошибка соединения с сервером' });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="homepage">
        <div className="homepage__container">
          <h2 className="about-title">Предоставить услугу</h2>

          {errors.general && (
            <div className="messages">
              <div className="error createEr">
                {errors.general}
              </div>
            </div>
          )}

          <div className="field">
            <form onSubmit={handleSubmit} encType="multipart/form-data" className="service-form">
              <div className="posit">
                <div className="column">
                  <div className="group">
                    <label htmlFor="name">Название услуги</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="form-control"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                    {errors.name && <div className="error">{errors.name}</div>}
                  </div>

                  <div className="group">

                    <div className='double-group'>
                    <label htmlFor="price">Цена (руб.)</label>
                    <label className="price-dop">
                      <span>Приставка "от" к цене</span>
                      <input
                        type="checkbox"
                        name="price_from"
                        checked={formData.price_from}
                        onChange={(e) => setFormData(prev => ({ ...prev, price_from: e.target.checked }))}
                      />
                      
                    </label>
                    </div>


                    <input
                      type="number"
                      id="price"
                      name="price"
                      className="form-control"
                      value={formData.price}
                      onChange={handleInputChange}
                      step="0.01"
                    />
                    {errors.price && <div className="error">{errors.price}</div>}
                  </div>

                  <div className="group">
                    <label htmlFor="description">Описание</label>
                    <textarea
                      id="description"
                      name="description"
                      className="form-control-desc"
                      rows="4"
                      value={formData.description}
                      onChange={handleInputChange}
                    ></textarea>
                    {errors.description && <div className="error">{errors.description}</div>}
                  </div>

                  <div className="group">
                    <label htmlFor="city">Город</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      className="form-control"
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                    {errors.city && <div className="error">{errors.city}</div>}
                  </div>

                  <div className="group">
                    <label htmlFor="address">Адрес</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      className="form-control"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="column">

                  <div className="group">
                    <label htmlFor="category">Категория</label>
                    <select
                      id="category"
                      name="category"
                      className="form-control"
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      <option value="">Выберите категорию</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.category && <div className="error">{errors.category}</div>}
                  </div>

                  <div className="group">
                    <label htmlFor="phone_number">Номер телефона</label>
                    <input
                      type="tel"
                      id="phone_number"
                      name="phone_number"
                      className="form-control"
                      placeholder="+7 (___) ___-__-__"
                      value={formData.phone_number}
                      onChange={handlePhoneChange}
                    />
                    {errors.phone_number && <div className="error">{errors.phone_number}</div>}
                  </div>


                  <div className="group">
                    <label htmlFor="main_image">Главное изображение</label>
                    <input
                      type="file"
                      id="main_image"
                      name="main_image"
                      className="form-control-file"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                    {errors.main_image && <div className="error">{errors.main_image}</div>}
                  </div>

                  <div className="group">
                    <label htmlFor="extra_images">Дополнительные изображения</label>
                    <input
                      type="file"
                      id="extra_images"
                      name="extra_images"
                      className="form-control-file"
                      onChange={handleFileChange}
                      multiple
                      accept="image/*"
                    />
                    {formData.extra_images.length > 0 && (
                      <small className='fails'>
                        Выбрано файлов: {formData.extra_images.length}
                      </small>
                    )}
                  </div>


                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-create" disabled={loading}>
                  {loading ? 'Создание...' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CreateServicePage;