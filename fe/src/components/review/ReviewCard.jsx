import React from 'react';
import ReviewStars from './ReviewStars';
import moment from 'moment';

const ReviewCard = ({ review }) => {
  return (
    <div className="card mb-3">
      <div className="card-body">
        <div className="d-flex align-items-center mb-2">
          <img
            src={review.userId.avatar || 'https://via.placeholder.com/50'}
            alt={review.userId.name}
            className="rounded-circle me-2"
            width="40"
            height="40"
          />
          <div>
            <h6 className="m-0">{review.userId.name}</h6>
            <small className="text-muted">
              {moment(review.createdAt).format('DD/MM/YYYY')}
            </small>
          </div>
        </div>
        <ReviewStars rating={review.rating} />
        <p className="card-text mt-2">{review.comment}</p>
      </div>
    </div>
  );
};

export default ReviewCard;