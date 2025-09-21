import apiClient from "./apiClient";

const updateCurrentUser = (data) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return Promise.reject(new Error("No token found!"));
  }

  return apiClient.put("/users/me", data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
};
const toggleFavorite = (productId) => {
  return apiClient.post(`/users/favorites/${productId}`);
};

// HÀM MỚI: Lấy danh sách tất cả sản phẩm yêu thích của người dùng
// Hàm này sẽ được gọi bởi trang FavoritesPage.jsx
const getFavorites = () => {
  return apiClient.get('/users/favorites');
};
const userService = {
  updateCurrentUser,  toggleFavorite,    // Thêm hàm mới
  getFavorites, 
};

export default userService;
