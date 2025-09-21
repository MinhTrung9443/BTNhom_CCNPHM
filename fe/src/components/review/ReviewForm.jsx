import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createReview, updateReview } from '../../redux/reviewSlice';
import StarRating from './StarRating';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

const ReviewForm = ({ productId, orderId, existingReview, onReviewSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const dispatch = useDispatch();
  const { submitting, error } = useSelector((state) => state.reviews.ui);

  const isEditMode = !!existingReview;

  useEffect(() => {
    if (isEditMode) {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
    }
  }, [isEditMode, existingReview]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating > 0 && comment.length >= 10) {
      const reviewData = { rating, comment };
      const action = isEditMode
        ? dispatch(updateReview({ reviewId: existingReview._id, ...reviewData }))
        : dispatch(createReview({ productId, orderId, ...reviewData }));

      action
        .unwrap()
        .then(() => {
          onReviewSubmit();
        });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">Đánh giá của bạn</label>
        <StarRating rating={rating} setRating={setRating} />
      </div>
      <div className="mb-3">
        <label htmlFor="comment" className="form-label">
          Bình luận
        </label>
        <textarea
          id="comment"
          className="form-control"
          rows="3"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          minLength="10"
          maxLength="500"
          required
        ></textarea>
      </div>
      {error && <div className="alert alert-danger">{error.message}</div>}
      <Button type="submit" disabled={submitting}>
        {submitting ? (
          <LoadingSpinner size="sm" />
        ) : isEditMode ? (
          'Cập nhật đánh giá'
        ) : (
          'Gửi đánh giá'
        )}
      </Button>
    </form>
  );
};

export default ReviewForm;