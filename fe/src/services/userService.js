import apiClient from "./apiClient";

const updateCurrentUser = (data) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return Promise.reject(new Error("No token found!"));
  }

  return apiClient.put("/users/me", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const uploadAvatar = async (formData) => {
  const file = formData.get("avatar");

  if (!file) {
    throw new Error("Chưa chọn file!");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("File phải là hình ảnh!");
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("File quá lớn, tối đa 10MB!");
  }

  try {
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("upload_preset", "CCNPMM");
    uploadData.append("folder", "avatars");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/datof5csr/image/upload`,
      {
        method: "POST",
        body: uploadData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Upload thất bại");
    }

    const data = await response.json();
    return { data: { avatarUrl: data.secure_url } };
  } catch (error) {
    throw new Error(error.message || "Không thể tải lên ảnh đại diện.");
  }
};

const userService = {
  updateCurrentUser,
  uploadAvatar,
};

export default userService;
