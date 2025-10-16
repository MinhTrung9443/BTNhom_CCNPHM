import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { AppError } from '../utils/AppError.js';

export const cartService = {
  async upsertCartItem(userId, productId, quantity) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Sản phẩm không tồn tại', 404);
    }

    // Kiểm tra sản phẩm có đang hoạt động không
    if (!product.isActive) {
      throw new AppError('Sản phẩm hiện không còn kinh doanh', 400);
    }

    let cart = await Cart.findOne({ userId });

    if (cart) {
      const itemIndex = cart.items.findIndex(p => p.productId.toString() === productId);

      if (itemIndex > -1) {
        let newQuantity = cart.items[itemIndex].quantity + quantity;
        if (newQuantity <= 0) {
          cart.items.splice(itemIndex, 1);
        } else {
          // Kiểm tra tồn kho trước khi cập nhật
          if (newQuantity > product.stock) {
            throw new AppError(`Số lượng sản phẩm vượt quá tồn kho. Tồn kho hiện tại: ${product.stock}`, 400);
          }
          cart.items[itemIndex].quantity = newQuantity;
        }
      } else {
        // Kiểm tra tồn kho trước khi thêm mới
        if (quantity > product.stock) {
          throw new AppError(`Số lượng sản phẩm vượt quá tồn kho. Tồn kho hiện tại: ${product.stock}`, 400);
        }
        cart.items.push({ productId, quantity });
      }
    } else {
      // Kiểm tra tồn kho khi tạo giỏ hàng mới
      if (quantity > product.stock) {
        throw new AppError(`Số lượng sản phẩm vượt quá tồn kho. Tồn kho hiện tại: ${product.stock}`, 400);
      }
      cart = new Cart({
        userId,
        items: [{ productId, quantity }]
      });
    }

    await cart.save();

    // Trả về cart với giá đã tính discount
    return this.getCart(userId);
  },

  async getCart(userId) {
    const cart = await Cart.findOne({ userId }).populate({
      path: 'items.productId',
      select: 'name price discount images stock isActive code slug categoryId'
    }).lean();

    if (!cart) {
      return { userId, items: [] };
    }

    // Tính giá sau discount cho mỗi sản phẩm
    const cartWithDiscountedPrice = {
      ...cart,
      items: cart.items.map(item => {
        const product = item.productId;
        if (!product) return item;

        const originalPrice = product.price;
        const discountPercent = product.discount || 0;
        const discountedPrice = originalPrice * (1 - discountPercent / 100);

        return {
          ...item,
          productId: {
            ...product,
            originalPrice,
            discountedPrice: Math.round(discountedPrice),
            discountPercent
          }
        };
      })
    };

    return cartWithDiscountedPrice;
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

    // Kiểm tra tồn kho trước khi cập nhật
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Sản phẩm không tồn tại', 404);
    }
    if (!product.isActive) {
      throw new AppError('Sản phẩm hiện không còn kinh doanh', 400);
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      if (quantity > product.stock) {
        throw new AppError(`Số lượng sản phẩm vượt quá tồn kho. Tồn kho hiện tại: ${product.stock}`, 400);
      }
      cart.items[itemIndex].quantity = quantity;
    }
    await cart.save();

    // Trả về cart với giá đã tính discount
    return this.getCart(userId);
  },

  async removeItemFromCart(userId, productId) {
    // Kiểm tra giỏ hàng có tồn tại không
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new AppError('Giỏ hàng không tìm thấy', 404);
    }

    // Kiểm tra sản phẩm có trong giỏ hàng không
    const itemIndex = cart.items.findIndex((p) => p.productId.toString() === productId);
    if (itemIndex === -1) {
      throw new AppError('Sản phẩm không có trong giỏ hàng', 404);
    }

    // Xóa sản phẩm khỏi giỏ hàng
    await Cart.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId: productId } } },
      { new: true }
    );

    // Trả về cart với giá đã tính discount
    return this.getCart(userId);
  },

  async getCartItemCount(userId) {
    const cart = await Cart.findOne({ userId }).lean();

    if (!cart || !cart.items || cart.items.length === 0) {
      return 0;
    }

    // Tính tổng số lượng sản phẩm (sum của quantity)
    const totalCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    return totalCount;
  }
};