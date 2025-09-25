import { cartService } from "../services/cart.service.js";

export const upsertCartItem = async (req, res, next) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  const cart = await cartService.upsertCartItem(userId, productId, quantity);
  res.status(200).json({
    message: "Thêm/chỉnh sữa sản phẩm vào giỏ hàng thành công",
  });
};

export const getCart = async (req, res, next) => {
  const cart = await cartService.getCart(req.user.id);
  res.status(200).json(cart);
};

export const removeItemFromCart = async (req, res, next) => {
  const { productId } = req.params;
  const userId = req.user.id;

  const updatedCart = await cartService.removeItemFromCart(userId, productId);
  res.status(200).json({
    message: "Xoá sản phẩm khỏi giỏ hàng thành công",
  });
};

export const updateCartItemQuantity = async (req, res, next) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  const cart = await cartService.updateCartItemQuantity(
    userId,
    productId,
    quantity
  );
  res.status(200).json({
    message: "Cập nhật số lượng sản phẩm trong giỏ hàng thành công",
  });
};
