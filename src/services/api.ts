const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

class ApiClient {
  private token: string | null = localStorage.getItem('auth_token');

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  getToken() {
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` })
    };
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: this.getHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  }

  // Auth endpoints
  async adminLogin(email: string, password: string) {
    return this.request('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async userLogin(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async userSignup(name: string, email: string, phone: string, password: string, confirmPassword: string) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, password, confirmPassword })
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async logout() {
    const response = await this.request('/auth/logout', { method: 'POST' });
    this.clearToken();
    return response;
  }

  // Property endpoints
  async getProperties(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request(`/properties${query}`);
  }

  async getPropertiesByCity(city: string) {
    return this.request(`/properties/city/${city}`);
  }

  async getProperty(id: string) {
    return this.request(`/properties/${id}`);
  }

  async getAdminProperties() {
    return this.request('/properties/admin/all');
  }

  async createProperty(data: any) {
    return this.request('/properties', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateProperty(id: string, data: any) {
    return this.request(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteProperty(id: string) {
    return this.request(`/properties/${id}`, { method: 'DELETE' });
  }

  // Enquiry endpoints
  async createEnquiry(data: any) {
    return this.request('/enquiries', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getEnquiries(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request(`/enquiries${query}`);
  }

  async getEnquiry(id: string) {
    return this.request(`/enquiries/${id}`);
  }

  async updateEnquiryStatus(id: string, status: string) {
    return this.request(`/enquiries/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  async deleteEnquiry(id: string) {
    return this.request(`/enquiries/${id}`, { method: 'DELETE' });
  }

  // User endpoints
  async getUsers() {
    return this.request('/users');
  }

  async getUser(id: string) {
    return this.request(`/users/${id}`);
  }

  async updateUserStatus(id: string, status: string) {
    return this.request(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, { method: 'DELETE' });
  }

  // Page endpoints
  async getPage(slug: string) {
    return this.request(`/pages/${slug}`);
  }

  async createPage(data: any) {
    return this.request('/pages', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updatePage(id: string, data: any) {
    return this.request(`/pages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deletePage(id: string) {
    return this.request(`/pages/${id}`, { method: 'DELETE' });
  }

  async getAdminPages() {
    return this.request('/pages/admin/list');
  }
}

export const api = new ApiClient();
