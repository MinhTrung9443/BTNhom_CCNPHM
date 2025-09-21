import * as userService from '../services/user.service.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import ProductView from '../models/ProductView.js';
const getMe = (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            user: req.user,
        },
    });
};
 
const updateMe = async (req, res) => {
    const updatedUser = await userService.updateUserProfile(req.user.id, req.body, req.file);
    res.status(200).json({
        success: true,
        message: 'Cập nhật thông tin thành công.',
        data: {
            user: updatedUser,
        },
    });
};

const toggleFavorite = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id; 

    const user = await User.findById(userId);
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }
    const isFavorited = user.favorites.includes(productId);

    if (isFavorited) {
      await User.findByIdAndUpdate(userId, { $pull: { favorites: productId } });
      res.status(200).json({ message: 'Đã xóa khỏi danh sách yêu thích', favorited: false });
    } else {
      await User.findByIdAndUpdate(userId, { $addToSet: { favorites: productId } });
      res.status(200).json({ message: 'Đã thêm vào danh sách yêu thích', favorited: true });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
};

const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate({
      path: 'favorites',
      select: 'name price images discount'
    });

    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    res.status(200).json({ favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
};

const getRecentlyViewed = async (req, res) => {
    try {
        const userId = req.user.id;
        const views = await ProductView.find({ userId })
            .sort({ lastViewedAt: -1 })
            .limit(10) 
            .populate({
                path: 'productId',
                select: 'name price images discount',
                model: 'Product'
            });

        const uniqueProducts = [];
        const seenProductIds = new Set();
        for (const view of views) {
            if (view.productId && !seenProductIds.has(view.productId._id.toString())) {
                uniqueProducts.push(view.productId);
                seenProductIds.add(view.productId._id.toString());
            }
        }

        res.status(200).json({ recentlyViewed: uniqueProducts });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error });
    }
};
export { getMe, updateMe, getFavorites, toggleFavorite, getRecentlyViewed };