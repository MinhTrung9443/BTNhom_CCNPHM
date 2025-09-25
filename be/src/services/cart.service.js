import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { AppError } from '../utils/AppError.js';

export const cartService = {
  async upsertCartItem(userId, productId, quantity) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Sản phẩm không tồn tại', 404);
    }

    let cart = await Cart.findOne({ userId });

    if (cart) {
      const itemIndex = cart.items.findIndex(p => p.productId.toString() === productId);

      if (itemIndex > -1) {
        let newQuantity = cart.items[itemIndex].quantity + quantity;
        if (newQuantity <= 0) {
          cart.items.splice(itemIndex, 1);
        } else {
          cart.items[itemIndex].quantity = newQuantity;
        }
      } else {
        cart.items.push({ productId, quantity, price: product.price });
      }
    } else {
      cart = new Cart({
        userId,
        items: [{ productId, quantity, price: product.price }]
      });
    }

    await cart.save();
    return cart.populate('items.productId');
  },

  async getCart(userId) {
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart) {
      return { userId, items: [] };
    }
    return cart;
  },

  async updateCartItemQuantity(userId, productId, quantity) {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new AppError('Giỏ hàng không tìm thấy', 404);
    }
    const itemIndex = cart.items.findIndex((p) => p.productId.toString() === productId);
    if (itemIndex === -1) {
      throw new AppError('Sản phẩm không có trong giỏ hàng', 404);
    }
    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }
    await cart.save();
    return cart.populate('items.productId');
  },

  async removeItemFromCart(userId, productId) {
    const updatedCart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId: productId } } },
      { new: true }
    ).populate({
      path: 'items.productId',
      select: 'name price images discount',
    });

    if (!updatedCart) {
      return { items: [] };
    }
    return updatedCart;
  }
};