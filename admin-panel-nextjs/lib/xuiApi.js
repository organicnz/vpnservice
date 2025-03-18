import axios from 'axios';

// This class handles all interactions with the 3x-ui panel API
class XuiApi {
  constructor() {
    this.baseUrl = process.env.XUI_PANEL_URL;
    this.username = process.env.XUI_USERNAME;
    this.password = process.env.XUI_PASSWORD;
    this.token = null;
  }

  // Get authentication token from 3x-ui
  async login() {
    try {
      const response = await axios.post(`${this.baseUrl}/login`, {
        username: this.username,
        password: this.password
      });
      
      if (response.data.success) {
        this.token = response.data.token;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  // Get inbound configurations
  async getInbounds() {
    if (!this.token) {
      await this.login();
    }
    
    try {
      const response = await axios.get(`${this.baseUrl}/panel/api/inbounds`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.token}`
        }
      });
      
      return response.data.obj || [];
    } catch (error) {
      console.error('Get inbounds error:', error);
      return [];
    }
  }

  // Create a new client for an inbound
  async createClient(inboundId, clientConfig) {
    if (!this.token) {
      await this.login();
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
      throw new Error(error.response?.data?.msg || 'Failed to create client');
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
}

export default new XuiApi(); 