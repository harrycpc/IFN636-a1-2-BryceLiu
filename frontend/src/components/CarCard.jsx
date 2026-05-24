import Icon from './Icon';
import Rating from './Rating';
import { fmt$ } from '../utils/format';

const CarCard = ({ car, isAdmin, onOpen, onDelete }) => {
  const unavailable = car.availability === 'Unavailable';
  return (
    <article
      className="card"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      <div className="card-media">
        <img src={car.image} alt={car.name} loading="lazy" />
        <span className={'card-avail ' + (unavailable ? 'is-off' : 'is-on')}>
          <span className="dot"></span>
          {car.availability}
        </span>
      </div>
      <div className="card-body">
        <div className="card-row1">
          <span className="card-title">{car.name}</span>
          <Rating value={car.averageRating} count={car.reviewCount} small />
        </div>
        <div className="card-meta">{car.type} · {car.location}</div>
        <div className="card-meta">{car.seats} seats · {car.transmission}</div>
        <div className="card-price">
          <b>{fmt$(car.pricePerDay)}</b> / day
        </div>
        {isAdmin && (
          <div className="card-admin-actions">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpen();
              }}
            >
              <Icon name="pencil" size={14} stroke={2} /> Edit
            </button>
            <button
              type="button"
              className="danger"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(car._id);
              }}
            >
              <Icon name="trash" size={14} stroke={2} /> Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

export default CarCard;
