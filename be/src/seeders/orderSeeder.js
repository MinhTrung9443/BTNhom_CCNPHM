import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { createOrderWithTimeline } from '../services/orderStatus.service.js';
import { ORDER_STATUS } from '../models/Order.js';

dotenv.config();

const seedOrders = async (numOrders = 20) => {
  try {
    await connectDB();

    const users = await User.find({ role: 'user' });
    const products = await Product.find();

    if (users.length === 0) {
      console.log('Không tìm thấy user nào để tạo đơn hàng.');
      return;
    }

    if (products.length === 0) {
      console.log('Không tìm thấy sản phẩm nào để tạo đơn hàng.');
      return;
    }

    for (let i = 0; i < numOrders; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const numOrderLines = Math.floor(Math.random() * 5) + 1;
      const orderLines = [];
      let totalAmount = 0;

      for (let j = 0; j < numOrderLines; j++) {
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const price = randomProduct.price * (1 - (randomProduct.discount || 0) / 100);

        orderLines.push({
          productId: randomProduct._id,
          productName: randomProduct.name,
          productImage: randomProduct.images[0],
          productPrice: price,
          quantity: quantity,
        });

        totalAmount += price * quantity;
      }

      const orderData = {
        userId: randomUser._id,
        orderLines,
        totalAmount,
        shippingAddress: randomUser.address,
        phoneNumber: randomUser.phone,
        recipientName: randomUser.name,
        notes: 'Đây là đơn hàng mẫu.',
        status: ORDER_STATUS.NEW,
        payment: {
          paymentMethod: ['VNPAY', 'COD', 'BANK'][Math.floor(Math.random() * 3)],
          status: ['pending', 'completed', 'failed'][Math.floor(Math.random() * 3)],
        },
      };

      await createOrderWithTimeline(orderData);
    }

    console.log(`${numOrders} đơn hàng mẫu đã được tạo thành công.`);
  } catch (error) {
    console.error('Lỗi khi tạo đơn hàng mẫu:', error);
  } finally {
    mongoose.disconnect();
  }
};

const numOrders = parseInt(process.argv[2]) || 20;
seedOrders(numOrders);