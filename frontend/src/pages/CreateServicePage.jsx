import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { api } from '../services/api';
import '../assets/style/styles.scss';

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
    extra_images: []
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
    } else if (!/^[\d\+\-\(\)\s]+$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Введите корректный номер телефона';
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
      submitData.append('description', formData.description);
      submitData.append('city', formData.city);
      submitData.append('address', formData.address || '');
      submitData.append('phone_number', formData.phone_number);
      submitData.append('category', formData.category);
      submitData.append('main_image', formData.main_image);
      
      formData.extra_images.forEach(image => {
        submitData.append('uploaded_images', image);
      });
      
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/services/create/', {
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
              <div className="error" style={{ textAlign: 'center', padding: '10px', background: '#ffe0e0', borderRadius: '8px' }}>
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
                    <label htmlFor="price">Цена (руб.)</label>
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
                      <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                        Выбрано файлов: {formData.extra_images.length}
                      </small>
                    )}
                  </div>
                  
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
                      placeholder="+7 (XXX) XXX-XX-XX"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                    />
                    {errors.phone_number && <div className="error">{errors.phone_number}</div>}
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