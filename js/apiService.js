/* SMART USAGE ALERT - Centralized Backend API Service */

const ApiService = {
  getHeaders: function() {
    const headers = {
      'Content-Type': 'application/json'
    };
    const token = localStorage.getItem('sua_auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `/api${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const defaultOptions = {
      headers: this.getHeaders()
    };
    const finalOptions = { ...defaultOptions, ...options, headers: { ...defaultOptions.headers, ...(options.headers || {}) } };

    try {
      const response = await fetch(url, finalOptions);
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(`API Error on ${url}:`, err);
      return { success: false, error: 'Network error or server unavailable' };
    }
  },

  // Dashboard Data
  getDashboardData: function() {
    return this.request('/dashboard');
  },

  // Resources Data
  getResources: function() {
    return this.request('/resources');
  },

  // Inventory Data
  getInventory: function() {
    return this.request('/inventory');
  },

  addInventoryItem: function(itemData) {
    return this.request('/inventory', {
      method: 'POST',
      body: JSON.stringify(itemData)
    });
  },

  // AI Predictions & Analytics
  getPredictions: function() {
    return this.request('/predictions');
  },

  getRootCause: function() {
    return this.request('/analysis/root-cause');
  },

  // Shopping Assistant & Savings
  getShoppingRecommendations: function() {
    return this.request('/shopping/recommendations');
  },

  getSavings: function() {
    return this.request('/savings');
  },

  getSustainability: function() {
    return this.request('/sustainability');
  },

  // AI Assistant Chat
  sendAIChat: function(message) {
    return this.request('/assistant', {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  },

  // Seed / Load Demo Data
  loadDemoData: function() {
    return this.request('/inventory', {
      method: 'POST',
      body: JSON.stringify({ food_name: 'Demo Organic Milk (Loaded)', quantity: 2 })
    });
  }
};

window.ApiService = ApiService;
