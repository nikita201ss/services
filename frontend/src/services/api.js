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
    if (!response.ok) throw new Error('Услуга не найдена');
    return response.json();
  },

  async createRequest(requestData) {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('Не авторизован');
    }

    const response = await fetch(`${API_URL}/requests/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        service: requestData.service,
        executor: requestData.executor,
        description: requestData.description,
        meeting_date: requestData.meeting_date,
        phone_number: requestData.phone_number
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return response.json();
  },

  async getReceivedRequests() {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/requests/received/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    return data.results || data;
  },

  async getSentRequests() {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/requests/sent/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    return data.results || data;
  },

  async updateRequestStatus(requestId, status, rejectionReason = null) {
    const token = localStorage.getItem('access_token');
    const payload = { status };
    if (rejectionReason) {
      payload.rejection_reason = rejectionReason;
    }

    console.log('Updating request:', requestId, 'with payload:', payload);

    const response = await fetch(`${API_URL}/requests/${requestId}/update/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);

    if (!response.ok) {
      throw new Error(JSON.stringify(data));
    }

    return data;
  },


  async getCalendarEvents() {
    const token = localStorage.getItem('access_token');
    if (!token) return [];

    const response = await fetch(`${API_URL}/requests/calendar/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.results || data;
  },

async getPendingServices() {
  const token = localStorage.getItem('access_token');
  if (!token) return [];
  
  const response = await fetch(`${API_URL}/services/pending/`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    console.error('Error fetching pending services:', response.status);
    return [];
  }
  
  const data = await response.json();
  return data.results || data;
},

async moderateService(serviceId, status, rejectionReason = null) {
  const token = localStorage.getItem('access_token');
  const payload = { moderation_status: status };
  if (rejectionReason) {
    payload.moderation_rejection_reason = rejectionReason;
  }
  
  const response = await fetch(`${API_URL}/services/${serviceId}/moderate/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  return response.json();
},

async getUserServices() {
  const token = localStorage.getItem('access_token');
  if (!token) return [];
  
  const response = await fetch(`${API_URL}/my-services/`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) return [];
  
  const data = await response.json();
  return data.results || data;
},

};

