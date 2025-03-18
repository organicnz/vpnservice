import axios from 'axios';

// This class handles all interactions with the 3x-ui panel API
class XuiApi {
  constructor() {
    this.token = null;
    this.baseUrl = process.env.NEXT_PUBLIC_XUI_PANEL_URL || 'http://localhost:9001';
    this.username = process.env.NEXT_PUBLIC_XUI_USERNAME || 'admin';
    this.password = process.env.NEXT_PUBLIC_XUI_PASSWORD || 'admin';
    
    // Load settings from localStorage if available when in browser
    if (typeof window !== 'undefined') {
      this.loadSettings();
    }
  }

  // Load saved settings from localStorage (client-side only)
  loadSettings() {
    try {
      const savedSettings = localStorage.getItem('xuiSettings');
      if (savedSettings) {
        const { xuiUrl, xuiUsername, xuiPassword } = JSON.parse(savedSettings);
        if (xuiUrl) this.baseUrl = xuiUrl;
        if (xuiUsername) this.username = xuiUsername;
        if (xuiPassword) this.password = xuiPassword;
        console.log('XUI settings loaded from localStorage');
      }
    } catch (error) {
      console.error('Error loading XUI settings:', error);
    }
  }

  // Update API settings
  updateSettings(url, username, password) {
    this.baseUrl = url;
    this.username = username;
    this.password = password;
    this.token = null; // Reset token to force re-login
    
    // Save to localStorage if available
    if (typeof window !== 'undefined') {
      localStorage.setItem('xuiSettings', JSON.stringify({
        xuiUrl: url,
        xuiUsername: username,
        xuiPassword: password
      }));
    }
    
    return { success: true };
  }

  // Get authentication token from 3x-ui
  async login() {
    try {
      console.log(`Attempting login to ${this.baseUrl} with username ${this.username}`);
      
      const response = await axios.post(`${this.baseUrl}/login`, {
        username: this.username,
        password: this.password
      });
      
      if (response.data.success) {
        this.token = response.data.token;
        return { success: true };
      }
      return { success: false, msg: response.data.msg || 'Authentication failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        msg: error.message || 'Failed to connect to XUI panel'
      };
    }
  }

  // Get inbound configurations
  async getInbounds() {
    if (!this.token) {
      const loginResult = await this.login();
      if (!loginResult.success) {
        return loginResult; // Return login error
      }
    }
    
    try {
      const response = await axios.get(`${this.baseUrl}/panel/api/inbounds`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.token}`
        }
      });
      
      return { success: true, obj: response.data.obj || [] };
    } catch (error) {
      console.error('Get inbounds error:', error);
      
      // Check if token expired
      if (error.response?.status === 401) {
        this.token = null;
        return await this.getInbounds(); // Try again with fresh token
      }
      
      return { 
        success: false, 
        msg: error.message || 'Failed to fetch inbound data'
      };
    }
  }

  // Create a new client for an inbound
  async createClient(inboundId, clientConfig) {
    if (!this.token) {
      const loginResult = await this.login();
      if (!loginResult.success) {
        return loginResult; // Return login error
      }
    }
    
    try {
      const response = await axios.post(
        `${this.baseUrl}/panel/api/inbounds/addClient`, 
        {
          id: inboundId,
          settings: JSON.stringify({
            clients: [clientConfig]
          })
        },
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Create client error:', error);
      
      // Check if token expired
      if (error.response?.status === 401) {
        this.token = null;
        return await this.createClient(inboundId, clientConfig); // Try again with fresh token
      }
      
      return { 
        success: false, 
        msg: error.response?.data?.msg || 'Failed to create client'
      };
    }
  }

  // Generate a random UUID for client
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Create a new client with similar configuration to the template inbound
  async createSimilarClient(templateInbound, email = 'user@example.com') {
    const uuid = this.generateUUID();
    const protocol = templateInbound.protocol;
    
    // Base client configuration
    const clientConfig = {
      id: uuid,
      email,
      limitIp: 0,
      totalGB: 0,
      expiryTime: 0,
      enable: true,
      tgId: '',
      subId: ''
    };
    
    // Add protocol-specific settings
    if (protocol === 'vless') {
      clientConfig.flow = '';
    }
    
    return this.createClient(templateInbound.id, clientConfig);
  }

  // Test connection to the panel
  async testConnection(url, username, password) {
    // Use provided credentials or fallback to current instance credentials
    const testUrl = url || this.baseUrl;
    const testUsername = username || this.username;
    const testPassword = password || this.password;
    
    const originalUrl = this.baseUrl;
    const originalUsername = this.username;
    const originalPassword = this.password;
    const originalToken = this.token;
    
    try {
      // Temporarily update settings
      this.baseUrl = testUrl;
      this.username = testUsername;
      this.password = testPassword;
      this.token = null;
      
      // Try to login
      const result = await this.login();
      return result;
    } catch (error) {
      return {
        success: false,
        msg: error.message || 'Connection test failed'
      };
    } finally {
      // Restore original settings if not successful
      if (!this.token) {
        this.baseUrl = originalUrl;
        this.username = originalUsername;
        this.password = originalPassword;
        this.token = originalToken;
      }
    }
  }
}

export default new XuiApi(); 