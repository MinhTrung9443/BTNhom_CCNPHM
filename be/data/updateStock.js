import mongoose from 'mongoose';
import Product from '../src/models/Product.js';

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/auth_db');

const updateProductStock = async () => {
  try {
    // Cập nhật stock ngẫu nhiên cho tất cả sản phẩm
    const products = await Product.find({});
    
    for (const product of products) {
      // Tạo stock ngẫu nhiên từ 10-100
      const randomStock = Math.floor(Math.random() * 91) + 10;
      
      await Product.findByIdAndUpdate(product._id, {
        stock: randomStock
      });
      
      console.log(`Updated ${product.name}: stock = ${randomStock}`);
    }
    
    console.log('All products stock updated successfully!');
    
  } catch (error) {
    console.error('Error updating stock:', error);
  } finally {
    mongoose.connection.close();
  }
};

updateProductStock();