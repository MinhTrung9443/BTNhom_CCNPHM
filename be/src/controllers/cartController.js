import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

export const upsertCartItem = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
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
    const populatedCart = await cart.populate('items.productId');

    res.status(200).json(populatedCart);

  } catch (error) {
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
};
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
    if (!cart) {
      return res.status(200).json({ userId: req.user.id, items: [] });
    }
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeItemFromCart = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  try {
    const updatedCart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId: productId } } },
      { new: true }
    ).populate({
      path: 'items.productId',
      select: 'name price images discount',
    });

    if (!updatedCart) {
      return res.status(200).json({ items: [] });
    }

    res.status(200).json(updatedCart);

  } catch (error) {
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
};