import User from "../models/User.js";
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
    updates.avatar = `/${file.path.replace(/\\/g, "/")}`;
  }

  if (Object.keys(updates).length === 0) {
    throw new AppError(400, "Không có thông tin hợp lệ để cập nhật.");
  }

  console.log("Final updates object:", updates);

  // Kiểm tra tài liệu cũ
  const oldUser = await User.findById(userId).select("-password");
  console.log("Old user data before update:", oldUser);

  // Thực hiện cập nhật
  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
    upsert: false,
  }).select("-password");

  if (!user) {
    console.log("User not found for ID:", userId);
    throw new AppError(404, "Không tìm thấy người dùng để cập nhật.");
  }

  // Kiểm tra tài liệu mới
  console.log("New user data after update:", user);
  return user;
};

export { updateUserProfile };
