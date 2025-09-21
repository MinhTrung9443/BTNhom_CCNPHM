import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserReviews } from '../redux/reviewSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import ReviewStars from '../components/review/ReviewStars';
import { Link } from 'react-router-dom';

const UserReviewsPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { reviews, ui } = useSelector((state) => ({
    reviews: state.reviews.byUser,
    ui: state.reviews.ui,
  }));

  useEffect(() => {
    if (user) {
      dispatch(getUserReviews(user._id));
    }
  }, [dispatch, user]);

  if (ui.loading) {
    return <LoadingSpinner />;
  }

  if (ui.error) {
    return <ErrorState message={ui.error.message} />;
  }

  return (
    <div className="container mt-4">
      <h2>Đánh giá của tôi</h2>
      {reviews.length > 0 ? (
        reviews.map((review) => (
          <div key={review._id} className="card mb-3">
            <div className="row g-0">
              <div className="col-md-2">
                <img
                  src={
                    review.productId?.images[0] ||
                    'https://via.placeholder.com/150'
                  }
                  className="img-fluid rounded-start"
                  alt={review.productId?.name || 'Sản phẩm không có sẵn'}
                />
              </div>
              <div className="col-md-10">
                <div className="card-body">
                  <h5 className="card-title">
                    <Link to={`/products/${review.productId?._id}`}>
                      {review.productId?.name || 'Sản phẩm không có sẵn'}
                    </Link>
                  </h5>
                  <ReviewStars rating={review.rating} />
                  <p className="card-text mt-2">{review.comment}</p>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p>Bạn chưa có đánh giá nào.</p>
      )}
    </div>
  );
};

export default UserReviewsPage;