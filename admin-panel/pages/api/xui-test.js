// API route to test XUI panel connectivity
// This file is created at admin-panel/pages/api/xui-test.js

import axios from 'axios';

export default async function handler(req, res) {
  // Log all environment variables for debugging
  console.log('ENVIRONMENT VARIABLES:');
  Object.keys(process.env)
    .filter(key => key.includes('XUI'))
    .forEach(key => {
      console.log(`${key}=${key.includes('PASSWORD') ? '******' : process.env[key]}`);
    });
  
  // Get connection details from environment or query params
  const xuiUrl = req.query.url || process.env.XUI_PANEL_URL || 'http://xray-ui:54321';
  const xuiUsername = req.query.username || process.env.XUI_USERNAME || 'admin';
  const xuiPassword = req.query.password || process.env.XUI_PASSWORD || 'admin';
  
  // Optional test mode: 'browser' will test from browser perspective (localhost:9001)
  // 'container' will test from container perspective (xray-ui:54321)
  const testMode = req.query.mode || 'container';
  
  // Determine the test URL based on mode
  let testUrl;
  if (testMode === 'browser') {
    testUrl = 'http://localhost:9001';
  } else {
    // Use xuiUrl as is for container mode
    testUrl = xuiUrl;
  }

  console.log(`Testing connection to XUI panel at ${testUrl} (${testMode} mode)`);
  console.log(`Container XUI URL from env: ${xuiUrl}`);
  console.log(`Using credentials: username=${xuiUsername}, password=******`);
  
  try {
    // Step 1: Test basic connectivity with HEAD request
    try {
      console.log(`Step 1: Testing basic connection to ${testUrl}...`);
      await axios.head(testUrl, { 
        timeout: 5000,
        headers: {
          'User-Agent': 'XUITester/1.0'
        }
      });
      console.log('Basic connectivity test passed');
    } catch (headError) {
      console.log('Full error object:', JSON.stringify(headError, null, 2));
      const errorInfo = {
        message: `Failed to connect to ${testUrl} for basic connectivity test`,
        code: headError.code || 'UNKNOWN',
        details: headError.message || '',
      };
      console.error('Head request error:', errorInfo);
      return res.status(500).json({ 
        success: false, 
        error: 'Basic connectivity test failed', 
        details: errorInfo,
        environment: {
          XUI_PANEL_URL: process.env.XUI_PANEL_URL,
          testMode,
          testUrl,
          containerUrl: xuiUrl
        }
      });
    }
    
    // Step 2: Try to login to XUI panel
    try {
      const loginUrl = `${testUrl}/login`;
      console.log(`Step 2: Testing login to ${loginUrl}...`);
      const loginResponse = await axios.post(
        loginUrl,
        { username: xuiUsername, password: xuiPassword },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'XUITester/1.0'
          },
          timeout: 10000
        }
      );
      
      console.log(`Login response status: ${loginResponse.status}`);
      console.log(`Login response data:`, loginResponse.data);
      
      if (loginResponse.data && loginResponse.data.success) {
        // Return success with token
        return res.status(200).json({ 
          success: true, 
          message: 'Successfully connected to XUI panel',
          token: loginResponse.data.token,
          raw_response: loginResponse.data,
          environment: {
            XUI_PANEL_URL: process.env.XUI_PANEL_URL,
            testMode,
            testUrl,
            containerUrl: xuiUrl
          }
        });
      } else {
        // Return login failure
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication failed',
          message: loginResponse.data?.msg || 'Unknown authentication error',
          raw_response: loginResponse.data,
          environment: {
            XUI_PANEL_URL: process.env.XUI_PANEL_URL,
            testMode,
            testUrl,
            containerUrl: xuiUrl
          }
        });
      }
    } catch (loginError) {
      console.log('Full login error:', JSON.stringify(loginError, null, 2));
      const loginErrorInfo = {
        message: `Failed to login to ${testUrl}/login`,
        code: loginError.code || 'UNKNOWN',
        status: loginError.response?.status,
        statusText: loginError.response?.statusText,
        details: loginError.message || '',
        responseData: loginError.response?.data
      };
      console.error('Login error:', loginErrorInfo);
      return res.status(500).json({ 
        success: false, 
        error: 'Login attempt failed', 
        details: loginErrorInfo,
        environment: {
          XUI_PANEL_URL: process.env.XUI_PANEL_URL,
          testMode,
          testUrl,
          containerUrl: xuiUrl
        }
      });
    }
  } catch (error) {
    // Handle any other unexpected errors
    console.error('Unexpected error during connection test:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Unexpected error during connection test',
      message: error.message || 'Unknown error',
      environment: {
        XUI_PANEL_URL: process.env.XUI_PANEL_URL,
        testMode,
        testUrl,
        containerUrl: xuiUrl
      }
    });
  }
} 