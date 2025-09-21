import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import userService  from '../../services/userService';
import { updateUserFavorites } from '../../redux/userSlice'; 

const FavoriteButton = ({ productId }) => {
  const { user, isAuthenticated } = useSelector((state) => state.user);
  
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false); 
  
  const dispatch = useDispatch();

  useEffect(() => {
    if (isAuthenticated && user?.favorites) {
      const favorited = user.favorites.some(fav => fav === productId || fav._id === productId);
      setIsFavorited(favorited);
    } else {
      setIsFavorited(false);
    }
  }, [user, productId, isAuthenticated]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích.');
      return; 
    }

    setLoading(true); 
    try {
      const response = await userService.toggleFavorite(productId);
      
      setIsFavorited(response.data.favorited);
      
      dispatch(updateUserFavorites({ productId, add: response.data.favorited }));

    } catch (error) {
      console.error('Lỗi khi thay đổi trạng thái yêu thích:', error);
      alert('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false); 
    }
  };

  const renderTooltip = (props) => (
    <Tooltip id={`tooltip-${productId}`} {...props}>
      {isFavorited ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
    </Tooltip>
  );

  return (
    <OverlayTrigger placement="top" overlay={renderTooltip}>
      <Button 
        variant="outline-danger" 
        onClick={handleToggleFavorite} 
        disabled={loading} 
        className="d-flex align-items-center justify-content-center"
        style={{ width: '58px' }} 
      >
        <i className={isFavorited ? 'fas fa-heart text-danger' : 'far fa-heart'}></i>
      </Button>
    </OverlayTrigger>
  );
};

export default FavoriteButton;