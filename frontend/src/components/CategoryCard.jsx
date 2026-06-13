import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/style/styles.scss';

const CategoryCard = ({ category, isActive, onClick }) => {
    const imageUrl = category.category_image_url || `${category.category_image}`;
    
    return (
        <div className="category-card">
            <Link
                to={`/?category=${category.slug}`}
                className={`category-card__link ${isActive ? 'active' : ''}`}
                onClick={() => onClick(category.slug)}
            >
                <div className="category-card__image">
                    <img
                        src={imageUrl}
                        alt={category.name}
                    />
                </div>
                <h3 className="category-card__name">{category.name}</h3>
            </Link>
        </div>
    );
};

export default CategoryCard;