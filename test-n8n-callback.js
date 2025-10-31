// Script to test n8n callback endpoint
// Run: node test-n8n-callback.js

const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000';

// Test data - replace with actual values
const testData = {
  commentId: '6729a4f8e4b5c3d2a1b2c3d4', // Replace with actual comment ID
  status: 'approved', // or 'rejected'
  moderationNotes: 'Test moderation from script'
};

async function testN8nCallback() {
  try {
    console.log('Testing n8n callback endpoint...');
    console.log('Request data:', testData);
    
    const response = await axios.post(
      `${BACKEND_URL}/api/webhooks/n8n/comment-result`,
      testData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

async function testNotification(userId) {
  try {
    console.log('\nTesting direct notification...');
    
    const response = await axios.post(
      `${BACKEND_URL}/api/webhooks/test-notification`,
      {
        userId: userId,
        title: 'Test Notification',
        message: 'This is a test notification from script'
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Get user ID from command line or use default
const userId = process.argv[2] || '6729a4f8e4b5c3d2a1b2c3d4';

console.log('Starting tests...\n');

// Test direct notification first
testNotification(userId).then(() => {
  console.log('\nDirect notification test completed.');
  console.log('Check browser console for notification events.');
});

// Uncomment to test n8n callback
// testN8nCallback();
