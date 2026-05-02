const API_URL = 'http://localhost:8000/api';

export const api = {
  async getCategories() {
    const response = await fetch(`${API_URL}/categories/`);
    const data = await response.json();
    return data.results || [];
  },

  async getServices(filters = {}) {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('q', filters.search);
    if (filters.minPrice) params.append('min_price', filters.minPrice);
    if (filters.maxPrice) params.append('max_price', filters.maxPrice);
    
    const response = await fetch(`${API_URL}/services/?${params}`);
    const data = await response.json();
    return data.results || [];
  },

  async getServiceBySlug(slug) {
    const response = await fetch(`${API_URL}/services/${slug}/`);
    return response.json();
  }
};