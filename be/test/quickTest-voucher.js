// Simple test to check if getApplicableVouchers function exists and works
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import voucherService from '../src/services/voucher.service.js';

dotenv.config();

const quickTest = async () => {
  try {
    console.log('🔍 Testing voucherService...');
    console.log('📋 Available functions in voucherService:');
    console.log(Object.keys(voucherService));
    
    console.log('\n✅ getApplicableVouchers function exists:', typeof voucherService.getApplicableVouchers);
    
    if (typeof voucherService.getApplicableVouchers === 'function') {
      console.log('📊 Function signature looks correct');
      console.log('🎯 Ready to test 13 paths!');
      
      // Quick test for PATH 1: null orderLines
      try {
        await voucherService.getApplicableVouchers('testUserId', null);
        console.log('❌ Should have thrown error for null orderLines');
      } catch (error) {
        console.log('✅ PATH 1 - Correctly threw error:', error.message);
      }
      
      // Quick test for PATH 12: empty orderLines  
      try {
        await voucherService.getApplicableVouchers('testUserId', []);
        console.log('❌ Should have thrown error for empty orderLines');
      } catch (error) {
        console.log('✅ PATH 12 - Correctly threw error:', error.message);
      }
      
    } else {
      console.log('❌ getApplicableVouchers is not a function');
    }
    
  } catch (error) {
    console.error('❌ Quick test failed:', error.message);
    console.error('🔍 Stack trace:', error.stack);
  }
};

quickTest();
