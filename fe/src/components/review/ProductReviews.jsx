import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProductReviews } from '../../redux/reviewSlice';
import ReviewCard from './ReviewCard';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorState from '../common/ErrorState';

const ProductReviews = ({ productId }) => {
  const dispatch = useDispatch();
  const { reviews, ui } = useSelector((state) => ({
    reviews: state.reviews.byProduct[productId] || [],
    ui: state.reviews.ui,
  }));

  useEffect(() => {
    if (productId) {
      dispatch(getProductReviews(productId));
    }
  }, [dispatch, productId]);

  if (ui.loading) {
    return <LoadingSpinner />;
  }

  if (ui.error) {
    return <ErrorState message={ui.error.message} />;
  }

  return (
    <div>
      <h4 className="mb-3">Đánh giá sản phẩm</h4>
      {reviews.length > 0 ? (
        reviews.map((review) => <ReviewCard key={review._id} review={review} />)
      ) : (
        <p>Chưa có đánh giá nào cho sản phẩm này.</p>
      )}
    </div>
  );
};

export default ProductReviews;