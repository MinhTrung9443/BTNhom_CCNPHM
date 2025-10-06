import User from "../models/User.js";
import Product from "../models/Product.js";
import ProductView from "../models/ProductView.js";
import Favorite from "../models/Favorite.js";
import { AppError } from "../utils/AppError.js";
import mongoose from "mongoose";

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

const getFavorites = async (userId, page = 1, limit = 5, search = null) => {
  // Convert userId sang ObjectId nếu cần
  const userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
  const filter = { userId: userObjectId };

  // Nếu có search, sử dụng aggregation để filter theo tên sản phẩm
  if (search) {
    const searchRegex = new RegExp(search, "i");

    const favorites = await Favorite.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $match: {
          "product.name": searchRegex
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          data: [
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $project: {
                _id: "$product._id",
                slug: "$product.slug",
                name: "$product.name",
                price: "$product.price",
                images: "$product.images",
                discount: "$product.discount"
              }
            }
          ],
          total: [{ $count: "count" }]
        }
      }
    ]);

    const products = favorites[0].data;
    const total = favorites[0].total[0]?.count || 0;

    return {
      products,
      pagination: {
        current: page,
        limit,
        total: Math.ceil(total / limit),
        totalItems: total,
      }
    };
  }

  // Không có search, query bình thường
  const skip = (page - 1) * limit;

  const [favorites, total] = await Promise.all([
    Favorite.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "productId",
        select: "slug name price images discount",
      })
      .lean(),
    Favorite.countDocuments(filter)
  ]);

  const products = favorites.map((fav) => fav.productId).filter(Boolean);

  return {
    products,
    pagination: {
      current: page,
      limit,
      total: Math.ceil(total / limit),
      totalItems: total,
    }
  };
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

const getLoyaltyPoints = async (userId) => {
  const user = await User.findById(userId).select('loyaltyPoints').lean();
  if (!user) {
    throw new AppError("Không tìm thấy người dùng.", 404);
  }
  return user.loyaltyPoints;
};

export { updateUserProfile, toggleFavorite, getFavorites, getRecentlyViewed, getLoyaltyPoints };
