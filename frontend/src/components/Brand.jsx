const Brand = ({ onClick }) => (
  <button
    type="button"
    className="brand"
    onClick={onClick}
    style={{
      border: 0,
      background: 'transparent',
      padding: 0,
      cursor: onClick ? 'pointer' : 'default',
    }}
  >
    <span className="brand-mark" aria-hidden="true"></span>
    <span className="brand-name">Car Rental Booking</span>
  </button>
);

export default Brand;
