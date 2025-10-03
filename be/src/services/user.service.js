import User from "../models/User.js";
import Product from "../models/Product.js";
import ProductView from "../models/ProductView.js";
import Favorite from "../models/Favorite.js";
import { AppError } from "../utils/AppError.js";

const updateUserProfile = async (userId, updateData, file) => {
  const allowedUpdates = ["name", "phone", "address"];
  const updates = {};

  Object.keys(updateData).forEach((key) => {
    if (allowedUpdates.includes(key)) {
      updates[key] = updateData[key];
    }
  });

  if (file) {
    updates.avatar = `${file.path.replace(/\\/g, "/")}`;
  }

  if (Object.keys(updates).length === 0) {
    throw new AppError("Không có thông tin hợp lệ để cập nhật.", 400);
  }

  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user) {
    throw new AppError("Không tìm thấy người dùng để cập nhật.", 404);
  }

  return user;
};

const toggleFavorite = async (userId, productId) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError("Sản phẩm không tồn tại", 404);
  }

  const existingFavorite = await Favorite.findOne({ userId, productId });

  if (existingFavorite) {
    await Favorite.findByIdAndDelete(existingFavorite._id);
    return { favorited: false };
  } else {
    await Favorite.create({ userId, productId });
    return { favorited: true };
  }
};

const getFavorites = async (userId) => {
  const favorites = await Favorite.find({ userId }).populate({
    path: "productId",
    select: "slug name price images discount",
  });
  return favorites.map((fav) => fav.productId);
};

const getRecentlyViewed = async (userId) => {
  const views = await ProductView.find({ userId }).sort({ lastViewedAt: -1 }).limit(10).populate({
    path: "productId",
    select: "name price images discount",
    model: "Product",
  });

  const uniqueProducts = [];
  const seenProductIds = new Set();
  for (const view of views) {
    if (view.productId && !seenProductIds.has(view.productId._id.toString())) {
      uniqueProducts.push(view.productId);
      seenProductIds.add(view.productId._id.toString());
    }
  }
  return uniqueProducts;
};

export { updateUserProfile, toggleFavorite, getFavorites, getRecentlyViewed };
