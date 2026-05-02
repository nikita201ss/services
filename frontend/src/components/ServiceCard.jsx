import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/style/styles.scss';

const ServiceCard = ({ service }) => {
    const imageUrl = service.main_image_url || `http://localhost:8000${service.main_image}`;
    
    return (
        <div className="service-card">
            <Link to={`/service/${service.slug}`} className="service-card__link">
                <div className="service-card__image">
                    <img
                        src={imageUrl}
                        alt={service.name}
                        onError={(e) => {
                            e.target.src = '/static/images/placeholder.jpg';
                        }}
                    />
                </div>
                <div className="service-card__content">
                    <p className="service-card__name">{service.name}</p>
                    <h4 className="service-card__price">{service.price} руб.</h4>
                    <div className="service-card__location">
                        <img src="/static/icon/pin.svg" alt="pin" className="service-card__pin" />
                        <p>{service.city || 'Город не указан'}</p>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default ServiceCard;