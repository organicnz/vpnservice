const axios = require('axios');
const logger = require('../utils/logger');

// Cache the auth cookie
let authCookie = null;
let lastLogin = null;

/**
 * VPN Service - Interfaces with 3x-ui panel
 */
class VpnService {
  /**
   * Login to 3x-ui panel and get authentication cookie
   */
  static async login() {
    try {
      // Check if we have a valid auth cookie (less than 1 hour old)
      if (authCookie && lastLogin && (new Date() - lastLogin < 60 * 60 * 1000)) {
        return authCookie;
      }

      const response = await axios.post(`${process.env.XUI_PANEL_URL}/login`, {
        username: process.env.XUI_USERNAME,
        password: process.env.XUI_PASSWORD
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Extract cookie from response
      const cookies = response.headers['set-cookie'];
      if (!cookies || cookies.length === 0) {
        throw new Error('No cookie received from 3x-ui panel');
      }

      authCookie = cookies[0];
      lastLogin = new Date();
      
      logger.info('Successfully logged in to 3x-ui panel');
      return authCookie;
    } catch (error) {
      logger.error(`Error logging in to 3x-ui panel: ${error.message}`);
      throw new Error('Failed to authenticate with VPN panel');
    }
  }

  /**
   * Create a new inbound for a user
   */
  static async createUserAccount(userId, username, password) {
    try {
      const cookie = await this.login();
      
      // Get list of existing inbounds to find the template
      const inboundResponse = await axios.get(`${process.env.XUI_PANEL_URL}/panel/api/inbounds`, {
        headers: {
          'Cookie': cookie
        }
      });
      
      // Use the first inbound as a template (in a real app, you would have a specific template)
      const templateInbound = inboundResponse.data.obj[0];
      if (!templateInbound) {
        throw new Error('No template inbound found');
      }
      
      // Create a new inbound for the user by cloning the template
      const newInbound = {
        ...templateInbound,
        id: 0, // Set to 0 for new inbound
        remark: `User-${username}`,
        enable: true,
        port: this.findAvailablePort(inboundResponse.data.obj),
        protocol: 'vmess', // Or use the same as template
        settings: {
          clients: [
            {
              id: this.generateUUID(),
              alterId: 0,
              email: username,
              limitIp: 0,
              totalGB: 0, // Unlimited by default, will be managed by our backend
              expiryTime: 0,
              enable: true
            }
          ],
          disableInsecureEncryption: false
        }
      };
      
      // Create the inbound
      await axios.post(`${process.env.XUI_PANEL_URL}/panel/api/inbounds/add`, newInbound, {
        headers: {
          'Cookie': cookie,
          'Content-Type': 'application/json'
        }
      });
      
      logger.info(`Created VPN account for user: ${username}`);
      return true;
    } catch (error) {
      logger.error(`Error creating VPN account: ${error.message}`);
      throw new Error('Failed to create VPN account');
    }
  }

  /**
   * Generate VPN configuration for a user
   */
  static async generateUserConfig(userId, serverId) {
    try {
      // In a real application, you would query the 3x-ui panel for the user's inbound
      // and generate the configuration based on that
      
      // For demo purposes, we'll generate a sample VMess config
      const serverConfig = {
        server1: { address: 'server1.yourvpn.com', port: 443 },
        server2: { address: 'server2.yourvpn.com', port: 443 },
        server3: { address: 'server3.yourvpn.com', port: 443 }
      };
      
      const server = serverConfig[serverId] || serverConfig.server1;
      
      const config = {
        v: "2",
        ps: `YourVPN-${serverId}`,
        add: server.address,
        port: server.port,
        id: this.generateUUID(),
        aid: "0",
        net: "ws",
        type: "none",
        host: server.address,
        path: "/vpn/",
        tls: "tls"
      };
      
      // Convert to base64
      const configStr = JSON.stringify(config);
      const base64Config = Buffer.from(configStr).toString('base64');
      
      return `vmess://${base64Config}`;
    } catch (error) {
      logger.error(`Error generating VPN config: ${error.message}`);
      throw new Error('Failed to generate VPN configuration');
    }
  }

  /**
   * Get available servers
   */
  static async getServers() {
    // In a real app, you would query your infrastructure or 3x-ui
    // For demo purposes, we'll return hardcoded servers
    return [
      { id: 'server1', name: 'Moscow', country: 'RU', flag: '🇷🇺' },
      { id: 'server2', name: 'Saint Petersburg', country: 'RU', flag: '🇷🇺' },
      { id: 'server3', name: 'Frankfurt', country: 'DE', flag: '🇩🇪' }
    ];
  }

  /**
   * Update user traffic limit
   */
  static async updateUserTrafficLimit(userId, trafficLimit) {
    try {
      const cookie = await this.login();
      
      // Find the user's inbound
      const inboundResponse = await axios.get(`${process.env.XUI_PANEL_URL}/panel/api/inbounds`, {
        headers: {
          'Cookie': cookie
        }
      });
      
      // Find the inbound for this user
      const userInbound = inboundResponse.data.obj.find(inbound => 
        inbound.remark.includes(`User-${userId}`)
      );
      
      if (!userInbound) {
        throw new Error(`No inbound found for user: ${userId}`);
      }
      
      // Update the traffic limit (totalGB is in GB)
      userInbound.settings.clients[0].totalGB = trafficLimit;
      
      // Update the inbound
      await axios.post(`${process.env.XUI_PANEL_URL}/panel/api/inbounds/update/${userInbound.id}`, userInbound, {
        headers: {
          'Cookie': cookie,
          'Content-Type': 'application/json'
        }
      });
      
      logger.info(`Updated traffic limit for user: ${userId}`);
      return true;
    } catch (error) {
      logger.error(`Error updating traffic limit: ${error.message}`);
      throw new Error('Failed to update traffic limit');
    }
  }

  /**
   * Get user traffic usage
   */
  static async getUserTrafficUsage(userId) {
    try {
      const cookie = await this.login();
      
      // Find the user's inbound
      const inboundResponse = await axios.get(`${process.env.XUI_PANEL_URL}/panel/api/inbounds`, {
        headers: {
          'Cookie': cookie
        }
      });
      
      // Find the inbound for this user
      const userInbound = inboundResponse.data.obj.find(inbound => 
        inbound.remark.includes(`User-${userId}`)
      );
      
      if (!userInbound) {
        throw new Error(`No inbound found for user: ${userId}`);
      }
      
      // Get traffic stats
      const statsResponse = await axios.get(`${process.env.XUI_PANEL_URL}/panel/api/inbounds/getClientTraffics/${userInbound.id}`, {
        headers: {
          'Cookie': cookie
        }
      });
      
      const clientTraffic = statsResponse.data.obj[0];
      if (!clientTraffic) {
        return 0; // No traffic used yet
      }
      
      // Convert from bytes to GB
      const usedTrafficGB = (clientTraffic.up + clientTraffic.down) / (1024 * 1024 * 1024);
      
      return usedTrafficGB;
    } catch (error) {
      logger.error(`Error getting traffic usage: ${error.message}`);
      throw new Error('Failed to get traffic usage');
    }
  }

  /**
   * Find available port for new inbound
   */
  static findAvailablePort(inbounds) {
    // Start from port 10000 and find the first available port
    const usedPorts = inbounds.map(inbound => inbound.port);
    let port = 10000;
    
    while (usedPorts.includes(port)) {
      port++;
    }
    
    return port;
  }

  /**
   * Generate a UUID v4
   */
  static generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

module.exports = VpnService; 