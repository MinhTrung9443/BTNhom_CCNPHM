import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react'; 
import { useSelector } from 'react-redux'; 
import api from '../../services/apiService';

const FavoriteButton = ({ productId }) => {
  const { user } = useSelector((state) => state.auth);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (user && user.favorites) {
      setIsFavorited(user.favorites.includes(productId));
    }
  }, [user, productId]);

  const handleToggleFavorite = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để sử dụng chức năng này');
      return;
    }
    try {
      const response = await api.post(`/users/favorites/${productId}`);
      setIsFavorited(response.data.favorited);
    } catch (error) {
      console.error('Lỗi khi thay đổi trạng thái yêu thích:', error);
    }
  };

  return (
    <button onClick={handleToggleFavorite} className="p-2 rounded-full hover:bg-red-100">
      <Heart
        size={24}
        className={isFavorited ? 'text-red-500 fill-current' : 'text-gray-500'}
      />
    </button>
  );
};

export default FavoriteButton;