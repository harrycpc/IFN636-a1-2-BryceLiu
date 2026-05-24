import { useState } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';

const ReviewForm = ({ booking, onSubmitted }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) return;
    try {
      setSubmitting(true);
      await axiosInstance.post(
        '/api/reviews',
        {
          carId: booking.carId?._id || booking.carId,
          bookingId: booking._id,
          rating: Number(rating),
          comment,
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setComment('');
      setRating(5);
      onSubmitted?.(booking._id);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <div className="review-form-head">
        <h4>Leave a review</h4>
        <p>How was your trip? Help future renters know what to expect.</p>
      </div>
      <div className="stars-input" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={'star-btn' + ((hover || rating) >= n ? ' is-on' : '')}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
            aria-label={`${n} star${n !== 1 ? 's' : ''}`}
          >
            <Icon name="star" size={24} />
          </button>
        ))}
        <span className="stars-label">{rating}/5</span>
      </div>
      <textarea
        className="input"
        rows={3}
        placeholder="Tell others what made the trip great…"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button
        type="submit"
        className="btn-primary"
        style={{ maxWidth: 200, marginTop: 12 }}
        disabled={submitting}
      >
        {submitting ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  );
};

export default ReviewForm;
