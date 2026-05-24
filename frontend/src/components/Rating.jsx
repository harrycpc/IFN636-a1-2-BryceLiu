import Icon from './Icon';

const Rating = ({ value, count, small }) => {
  const sz = small ? 12 : 13;
  if (!count || !value) {
    return (
      <span style={{ color: 'var(--ink-mute)', fontSize: small ? 13 : 14 }}>
        No reviews yet
      </span>
    );
  }
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: small ? 13 : 14,
        color: 'var(--ink)',
      }}
    >
      <Icon name="star" size={sz} />
      <span>{Number(value).toFixed(1)}</span>
      <span style={{ color: 'var(--ink-mute)' }}>({count})</span>
    </span>
  );
};

export default Rating;
