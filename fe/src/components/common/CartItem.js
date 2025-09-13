import React from 'react';
import { useDispatch } from 'react-redux';
import { optimisticUpdateItemQuantity, updateCartOnServer } from '../../redux/cartSlice';

const CartItem = ({ item }) => {
  const dispatch = useDispatch();

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;

    const productId = item.productId._id;

    dispatch(optimisticUpdateItemQuantity({ productId, newQuantity }));

    dispatch(updateCartOnServer({ productId, quantity: newQuantity }));
  };

  return (
    <div className="cart-item">
      <img src={item.productId.images[0]} alt={item.productId.name} />
      <div>
        <h4>{item.productId.name}</h4>
        <p>Giá: {item.price.toLocaleString()} VNĐ</p>
        <div>
          <button onClick={() => handleQuantityChange(item.quantity - 1)}>-</button>
          <span>{item.quantity}</span>
          <button onClick={() => handleQuantityChange(item.quantity + 1)}>+</button>
        </div>
        <p>Thành tiền: {(item.price * item.quantity).toLocaleString()} VNĐ</p>
      </div>
    </div>
  );
};

export default CartItem;