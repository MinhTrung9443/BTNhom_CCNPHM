/**
 * Script Migration: Tạo slug cho tất cả sản phẩm đã tồn tại
 * 
 * Chạy script: node generateProductSlugs.js
 * 
 * Options:
 *   --force: Tạo lại slug cho tất cả sản phẩm (kể cả đã có slug)
 *   --dry-run: Chỉ xem preview, không lưu vào database
 * 
 * Ví dụ:
 *   node generateProductSlugs.js
 *   node generateProductSlugs.js --force
 *   node generateProductSlugs.js --dry-run
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './src/models/Product.js';

dotenv.config();

// Parse command line arguments
const args = process.argv.slice(2);
const isForceMode = args.includes('--force');
const isDryRun = args.includes('--dry-run');

// Hàm tạo slug từ tên (giống trong model)
function generateSlug(name) {
  const vietnameseMap = {
    'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
    'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
    'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
    'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
    'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
    'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
    'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
    'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
    'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
    'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
    'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
    'đ': 'd',
    'À': 'A', 'Á': 'A', 'Ả': 'A', 'Ã': 'A', 'Ạ': 'A',
    'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ẳ': 'A', 'Ẵ': 'A', 'Ặ': 'A',
    'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ậ': 'A',
    'È': 'E', 'É': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ẹ': 'E',
    'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ể': 'E', 'Ễ': 'E', 'Ệ': 'E',
    'Ì': 'I', 'Í': 'I', 'Ỉ': 'I', 'Ĩ': 'I', 'Ị': 'I',
    'Ò': 'O', 'Ó': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ọ': 'O',
    'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ộ': 'O',
    'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ở': 'O', 'Ỡ': 'O', 'Ợ': 'O',
    'Ù': 'U', 'Ú': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ụ': 'U',
    'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ử': 'U', 'Ữ': 'U', 'Ự': 'U',
    'Ỳ': 'Y', 'Ý': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y', 'Ỵ': 'Y',
    'Đ': 'D'
  };

  let slug = name.toLowerCase().trim();
  
  for (const [key, value] of Object.entries(vietnameseMap)) {
    slug = slug.replace(new RegExp(key, 'g'), value.toLowerCase());
  }
  
  slug = slug.replace(/[^a-z0-9]+/g, '-');
  slug = slug.replace(/^-+|-+$/g, '');
  
  return slug;
}

async function generateSlugsForProducts() {
  try {
    // Kết nối database
    console.log('🔄 Đang kết nối MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB\n');

    // In thông tin mode
    if (isDryRun) {
      console.log('🔍 DRY RUN MODE - Không lưu vào database\n');
    }
    if (isForceMode) {
      console.log('⚠️  FORCE MODE - Tạo lại slug cho tất cả sản phẩm\n');
    }

    // Lấy sản phẩm cần xử lý
    let query;
    if (isForceMode) {
      query = {}; // Lấy tất cả sản phẩm
    } else {
      query = { $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }] };
    }

    const products = await Product.find(query).select('_id name slug');
    
    if (products.length === 0) {
      console.log('✨ Không có sản phẩm nào cần tạo slug!');
      console.log('💡 Sử dụng --force để tạo lại slug cho tất cả sản phẩm');
      return;
    }

    console.log(`📦 Tìm thấy ${products.length} sản phẩm cần xử lý\n`);
    console.log('━'.repeat(80));

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    const errors = [];

    // Xử lý từng sản phẩm
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const progress = `[${i + 1}/${products.length}]`;
      
      try {
        // Skip nếu đã có slug và không phải force mode
        if (product.slug && !isForceMode) {
          console.log(`⏭️  ${progress} Skip: "${product.name}" (đã có slug: ${product.slug})`);
          skippedCount++;
          continue;
        }

        let baseSlug = generateSlug(product.name);
        let slug = baseSlug;
        let counter = 1;

        // Kiểm tra slug đã tồn tại chưa
        while (await Product.exists({ slug, _id: { $ne: product._id } })) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }

        // Hiển thị thông tin
        const oldSlug = product.slug ? ` (cũ: ${product.slug})` : '';
        console.log(`${isDryRun ? '👁️ ' : '✅'} ${progress} "${product.name}"`);
        console.log(`   └─> ${slug}${oldSlug}`);

        // Cập nhật slug nếu không phải dry run
        if (!isDryRun) {
          // Sử dụng updateOne để bypass validation và middleware
          await Product.updateOne(
            { _id: product._id },
            { $set: { slug } }
          );
        }
        
        successCount++;
      } catch (error) {
        console.error(`❌ ${progress} Lỗi: "${product.name}"`);
        console.error(`   └─> ${error.message}`);
        errors.push({ name: product.name, error: error.message });
        errorCount++;
      }
    }

    // Hiển thị kết quả
    console.log('\n' + '━'.repeat(80));
    console.log('\n📊 === KẾT QUẢ ===\n');
    
    if (isDryRun) {
      console.log('🔍 Dry Run Mode - Không có thay đổi nào được lưu');
    }
    
    console.log(`✅ Thành công: ${successCount} sản phẩm`);
    if (skippedCount > 0) {
      console.log(`⏭️  Đã bỏ qua: ${skippedCount} sản phẩm (đã có slug)`);
    }
    if (errorCount > 0) {
      console.log(`❌ Lỗi: ${errorCount} sản phẩm`);
      console.log('\n🔴 Chi tiết lỗi:');
      errors.forEach((err, idx) => {
        console.log(`   ${idx + 1}. ${err.name}: ${err.error}`);
      });
    }

    console.log(`\n📈 Tổng cộng: ${products.length} sản phẩm được xử lý`);
    
    if (isDryRun) {
      console.log('\n💡 Chạy lại không có --dry-run để lưu thay đổi');
    } else if (!isForceMode && skippedCount > 0) {
      console.log('\n💡 Sử dụng --force để tạo lại slug cho tất cả sản phẩm');
    }
    
  } catch (error) {
    console.error('\n❌ LỖI NGHIÊM TRỌNG:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Đã ngắt kết nối MongoDB');
  }
}

// Hiển thị banner
console.log('\n' + '='.repeat(80));
console.log('  🏷️  SCRIPT TẠO SLUG CHO SẢN PHẨM');
console.log('='.repeat(80) + '\n');

// Chạy script
generateSlugsForProducts();
