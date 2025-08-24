const bcrypt = require('bcryptjs');

async function testPasswordHash() {
  console.log('🔍 Testing password hash...');
  
  const plainPassword = '123456';
  const hashedPassword = '$2b$12$LITOtDB1grPcxsvNFG1f7.dtjriAncv/CpydTmPyVeKo2IKf/f6mW';
  
  console.log('📝 Plain password:', plainPassword);
  console.log('🔐 Hashed password:', hashedPassword);
  
  try {
    // Test 1: Kiểm tra password hiện tại
    const isValid = await bcrypt.compare(plainPassword, hashedPassword);
    console.log('✅ Password match result:', isValid);
    
    if (!isValid) {
      console.log('❌ Password không khớp!');
      
      // Test 2: Tạo hash mới để so sánh
      console.log('\n🔄 Creating new hash for comparison...');
      const newHash = await bcrypt.hash(plainPassword, 12);
      console.log('🆕 New hash:', newHash);
      
      // Test 3: Kiểm tra hash mới
      const newIsValid = await bcrypt.compare(plainPassword, newHash);
      console.log('✅ New hash valid:', newIsValid);
      
      // Test 4: Thử các password khác có thể
      console.log('\n🔍 Testing other possible passwords...');
      const possiblePasswords = ['123456', 'password', 'test123', 'admin', '123', 'Test User'];
      
      for (const pwd of possiblePasswords) {
        const testResult = await bcrypt.compare(pwd, hashedPassword);
        if (testResult) {
          console.log(`✅ Found matching password: "${pwd}"`);
          return;
        }
      }
      
      console.log('❌ No matching password found');
    } else {
      console.log('✅ Password "123456" is correct!');
    }
    
  } catch (error) {
    console.error('❌ Error testing password:', error);
  }
}

testPasswordHash();
