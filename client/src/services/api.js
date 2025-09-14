import { API_CONFIG } from '../config/api';

class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: API_CONFIG.headers,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async uploadDocument(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${this.baseURL}/documents`, {
      method: 'POST',
      body: formData
    });
    
    return response.json();
  }
  
  async generateTTS(text, options = {}) {
    return this.request('/tts', {
      method: 'POST',
      body: JSON.stringify({ text, ...options })
    });
  }

  async analyzeText(text) {
    return this.request('/analyze', {
      method: 'POST',
      body: JSON.stringify({ text })
    });
  }
}

export const apiService = new ApiService();