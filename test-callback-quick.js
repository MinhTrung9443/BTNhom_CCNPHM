// Quick test script for n8n callback endpoint
// Usage: node test-callback-quick.js <commentId>

const axios = require('axios');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const commentId = process.argv[2];

if (!commentId) {
  console.error('❌ Error: Please provide a commentId');
  console.log('Usage: node test-callback-quick.js <commentId>');
  console.log('Example: node test-callback-quick.js 673f6f7a8b9c5d001a234567');
  process.exit(1);
}

async function testApproved() {
  console.log('🧪 Testing APPROVED callback...');
  console.log('Comment ID:', commentId);
  
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/webhooks/n8n/comment-result`,
      {
        commentId: commentId,
        status: 'approved',
        moderationNote: '✅ Test callback - Comment hợp lệ, không vi phạm quy định'
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    console.log('✅ Response status:', response.status);
    console.log('✅ Response data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.error('Full error:', error.response?.status, error.response?.statusText);
  }
}

async function testRejected() {
  console.log('\n🧪 Testing REJECTED callback...');
  console.log('Comment ID:', commentId);
  
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/webhooks/n8n/comment-result`,
      {
        commentId: commentId,
        status: 'rejected',
        moderationNote: '❌ Test callback - Comment chứa nội dung không phù hợp'
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    console.log('✅ Response status:', response.status);
    console.log('✅ Response data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.error('Full error:', error.response?.status, error.response?.statusText);
  }
}

async function testPending() {
  console.log('\n🧪 Testing PENDING callback...');
  console.log('Comment ID:', commentId);
  
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/webhooks/n8n/comment-result`,
      {
        commentId: commentId,
        status: 'pending',
        moderationNote: '⏳ Test callback - Cần xem xét thêm'
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    console.log('✅ Response status:', response.status);
    console.log('✅ Response data:', JSON.stringify(response.data, null, 2));
    console.log('⚠️  Note: PENDING status should NOT create notification');
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function runTests() {
  console.log('=====================================');
  console.log('🚀 N8N Callback Endpoint Test');
  console.log('=====================================\n');
  
  await testApproved();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await testRejected();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await testPending();
  
  console.log('\n=====================================');
  console.log('✅ All tests completed!');
  console.log('=====================================');
  console.log('\n📋 Next steps:');
  console.log('1. Check backend console for detailed logs');
  console.log('2. Check if user received notifications');
  console.log('3. Verify notifications in database');
}

runTests();
