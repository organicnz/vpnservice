import axios from 'axios';

// This class handles all interactions with the 3x-ui panel API
class XuiApi {
  constructor() {
    this.token = null;
    this.tokenExpiry = null; // Add token expiry tracking
    
    // Log all available environment variables for debugging - showing only those that start with XUI
    const envVars = Object.keys(process.env)
      .filter(key => key.toUpperCase().includes('XUI'))
      .reduce((obj, key) => {
        obj[key] = process.env[key];
        return obj;
      }, {});
    
    console.log('XUI environment variables available:', JSON.stringify(envVars));
    
    // Support both server-side and client-side environment variables
    this.baseUrl = process.env.XUI_PANEL_URL || process.env.NEXT_PUBLIC_XUI_PANEL_URL || 'http://xray-ui:54321';
    console.log('Using XUI Panel URL:', this.baseUrl);
    
    this.username = process.env.XUI_USERNAME || process.env.NEXT_PUBLIC_XUI_USERNAME || 'admin';
    this.password = process.env.XUI_PASSWORD || process.env.NEXT_PUBLIC_XUI_PASSWORD || 'admin';
    console.log('Using XUI credentials - Username:', this.username, 'Password:', '*'.repeat(this.password.length));
    
    this.retryCount = 0; // Add retry counter
    this.maxRetries = 3; // Maximum number of retries
    
    // Load settings from localStorage if available when in browser
    if (typeof window !== 'undefined') {
      this.loadSettings();
    }
    
    // Set up axios interceptors for better error handling
    this.setupAxiosInterceptors();
  }
  
  // Set up axios interceptors for global error handling
  setupAxiosInterceptors() {
    axios.interceptors.response.use(
      response => response,
      error => {
        // Create a standardized error structure
        const errorResponse = {
          success: false,
          status: error.response?.status,
          msg: error.response?.data?.msg || error.message || 'Unknown error occurred',
          code: error.code || 'UNKNOWN_ERROR'
        };
        
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.error('API Error:', errorResponse);
        }
        
        return Promise.reject(errorResponse);
      }
    );
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
        
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.log('XUI settings loaded from localStorage');
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading XUI settings:', error);
      }
    }
  }

  // Check if the token is valid
  isTokenValid() {
    if (!this.token) return false;
    if (!this.tokenExpiry) return false;
    
    // Return false if token is expired (with 10s buffer)
    return this.tokenExpiry > Date.now() + 10000;
  }

  // Update API settings
  updateSettings(url, username, password) {
    this.baseUrl = url;
    this.username = username;
    this.password = password;
    this.token = null; // Reset token to force re-login
    this.tokenExpiry = null;
    
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
    // Reset retry counter when a new login attempt is made
    this.retryCount = 0;
    
    try {
      console.log(`[XuiApi] Attempting login to ${this.baseUrl} with username ${this.username}`);
      
      // Add a connectivity test before trying the actual login
      try {
        console.log(`[XuiApi] Testing basic connectivity to ${this.baseUrl}`);
        await axios.head(`${this.baseUrl}/`, { timeout: 5000 });
        console.log('[XuiApi] Connection to XUI panel is available');
      } catch (connError) {
        console.error('[XuiApi] Pre-login connectivity test failed:', connError.message);
        if (connError.code) {
          console.error('[XuiApi] Error code:', connError.code);
        }
        if (connError.response) {
          console.error('[XuiApi] Error response:', connError.response.status, connError.response.statusText);
        }
        
        return { 
          success: false, 
          msg: `Failed to connect to XUI panel at ${this.baseUrl}. Server may be unreachable or URL might be incorrect.`,
          error: connError.message,
          code: connError.code
        };
      }
      
      // Proceed with actual login
      console.log(`[XuiApi] Preparing login request to ${this.baseUrl}/login with data:`, JSON.stringify({
        username: this.username,
        password: '*******' // Mask the password
      }));
      
      const response = await axios.post(`${this.baseUrl}/login`, {
        username: this.username,
        password: this.password
      }, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('[XuiApi] Login response received:', response.status, response.statusText || '');
      console.log('[XuiApi] Response data:', JSON.stringify(response.data || {}));
      
      if (response.data && response.data.success) {
        this.token = response.data.token;
        // Set token expiry to 12 hours from now (XUI default is 24h, we use 12h to be safe)
        this.tokenExpiry = Date.now() + (12 * 60 * 60 * 1000);
        console.log('[XuiApi] Login successful, token received');
        return { success: true };
      }
      
      console.error('[XuiApi] Login failed with response:', JSON.stringify(response.data || {}));
      return { success: false, msg: response.data?.msg || 'Authentication failed' };
    } catch (error) {
      console.error('[XuiApi] Login error details:', error.message);
      console.error('[XuiApi] Error code:', error.code || 'N/A');
      console.error('[XuiApi] Error stack:', error.stack);
      
      if (error.response) {
        console.error('[XuiApi] Response status:', error.response.status);
        console.error('[XuiApi] Response data:', JSON.stringify(error.response.data || {}));
      }
      
      // Handle specific error cases
      if (error.code === 'ECONNREFUSED' || error.code === 'ECONNABORTED') {
        return { 
          success: false, 
          msg: `Could not connect to XUI panel at ${this.baseUrl}. Please check the URL and try again.`,
          code: error.code,
          details: error.message
        };
      }
      
      if (error.response) {
        // The request was made and the server responded with an error status
        return {
          success: false,
          msg: `Server responded with status ${error.response.status}: ${error.response.data?.msg || 'Unknown error'}`,
          status: error.response.status,
          details: error.message
        };
      }
      
      return { 
        success: false, 
        msg: error.msg || `Failed to connect to XUI panel at ${this.baseUrl}`,
        code: error.code || 'UNKNOWN_ERROR',
        details: error.message
      };
    }
  }

  // Handle request with automatic token refresh
  async authenticatedRequest(requestFn) {
    // If token is invalid, try to login
    if (!this.isTokenValid()) {
      const loginResult = await this.login();
      if (!loginResult.success) {
        return loginResult; // Return login error
      }
    }
    
    try {
      return await requestFn(this.token);
    } catch (error) {
      // If token expired error, try to login again and retry
      if (error.status === 401 && this.retryCount < this.maxRetries) {
        this.retryCount++;
        this.token = null;
        this.tokenExpiry = null;
        return await this.authenticatedRequest(requestFn);
      }
      
      // Otherwise return the error
      return {
        success: false,
        msg: error.msg || 'Request failed',
        code: error.code || 'UNKNOWN_ERROR'
      };
    }
  }

  // Get inbound configurations
  async getInbounds() {
    return this.authenticatedRequest(async (token) => {
      const response = await axios.get(`${this.baseUrl}/panel/api/inbounds`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        timeout: 15000 // 15 second timeout
      });
      
      return { success: true, data: response.data.obj || [] };
    });
  }

  // Create a new client for an inbound
  async createClient(inboundId, email, limitIp = 0, expiryTime = 0) {
    const uuid = this.generateUUID();
    
    // Create client config
    const clientConfig = {
      id: uuid,
      email: email || `client-${new Date().getTime()}`,
      limitIp: limitIp,
      totalGB: 0,
      expiryTime: expiryTime,
      enable: true
    };
    
    return this.authenticatedRequest(async (token) => {
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
            'Authorization': `Bearer ${token}`
          },
          timeout: 15000 // 15 second timeout
        }
      );
      
      return {
        success: response.data.success,
        msg: response.data.msg,
        data: clientConfig
      };
    });
  }

  // Generate a random UUID for client
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
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
    const originalExpiry = this.tokenExpiry;
    
    try {
      // Temporarily update settings
      this.baseUrl = testUrl;
      this.username = testUsername;
      this.password = testPassword;
      this.token = null;
      this.tokenExpiry = null;
      
      // Try to login
      const result = await this.login();
      
      // If login successful, save settings
      if (result.success) {
        // Settings remain as the new values
        if (process.env.NODE_ENV === 'development') {
          console.log('Connection test successful, keeping new settings');
        }
      } else {
        // If not successful, restore original settings
        this.baseUrl = originalUrl;
        this.username = originalUsername;
        this.password = originalPassword;
        this.token = originalToken;
        this.tokenExpiry = originalExpiry;
      }
      
      return result;
    } catch (error) {
      // Restore original settings on error
      this.baseUrl = originalUrl;
      this.username = originalUsername;
      this.password = originalPassword;
      this.token = originalToken;
      this.tokenExpiry = originalExpiry;
      
      return {
        success: false,
        msg: error.msg || 'Connection test failed',
        code: error.code || 'UNKNOWN_ERROR'
      };
    }
  }
}

// Create a singleton instance
const xuiApi = new XuiApi();

export default xuiApi; 