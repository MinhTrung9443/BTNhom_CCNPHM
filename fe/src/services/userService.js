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

const userService = {
  updateCurrentUser,
};

export default userService;
