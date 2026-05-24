import { useState } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const ReviewForm = ({ booking, onSubmitted }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

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
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setComment('');
      setRating(5);
      onSubmitted?.(booking._id);
      alert('Review submitted successfully.');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 border-t border-gray-100 pt-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className={`text-3xl leading-none transition ${
                value <= rating ? 'text-amber-400' : 'text-gray-300'
              }`}
              aria-label={`${value} star${value !== 1 ? 's' : ''}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Comment
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows="3"
          className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-300"
          placeholder="Share your rental experience"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full lg:w-auto bg-purple-500 text-white px-5 py-2.5 rounded-full font-medium hover:bg-purple-600 transition disabled:opacity-60"
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

export default ReviewForm;
