const Icon = ({ name, size = 18, stroke = 1.7 }) => {
  const s = {
    width: size,
    height: size,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: stroke,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };
  switch (name) {
    case 'search':
      return (
        <svg {...s} viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      );
    case 'star':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="m12 2 3 6.9 7.5.6-5.7 5 1.7 7.3L12 17.8 5.5 21.8l1.7-7.3-5.7-5 7.5-.6L12 2z" />
        </svg>
      );
    case 'starO':
      return (
        <svg {...s} viewBox="0 0 24 24">
          <path d="m12 2 3 6.9 7.5.6-5.7 5 1.7 7.3L12 17.8 5.5 21.8l1.7-7.3-5.7-5 7.5-.6L12 2z" />
        </svg>
      );
    case 'arrow-left':
      return (
        <svg {...s} viewBox="0 0 24 24">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      );
    case 'pin':
      return (
        <svg {...s} viewBox="0 0 24 24">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    case 'calendar':
      return (
        <svg {...s} viewBox="0 0 24 24">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 9h18M8 3v4M16 3v4" />
        </svg>
      );
    case 'users':
      return (
        <svg {...s} viewBox="0 0 24 24">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.9" />
        </svg>
      );
    case 'seat':
      return (
        <svg {...s} viewBox="0 0 24 24">
          <path d="M6 18v-7a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v7" />
          <path d="M4 22h16M8 11V6M16 11V6" />
        </svg>
      );
    case 'gear':
      return (
        <svg {...s} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...s} viewBox="0 0 24 24">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        </svg>
      );
    case 'check':
      return (
        <svg {...s} viewBox="0 0 24 24">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      );
    case 'plus':
      return (
        <svg {...s} viewBox="0 0 24 24">
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case 'pencil':
      return (
        <svg {...s} viewBox="0 0 24 24">
          <path d="M17 3a2.8 2.8 0 1 1 4 4L7 21l-4 1 1-4Z" />
        </svg>
      );
    case 'trash':
      return (
        <svg {...s} viewBox="0 0 24 24">
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        </svg>
      );
    case 'logout':
      return (
        <svg {...s} viewBox="0 0 24 24">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
        </svg>
      );
    case 'grid':
      return (
        <svg {...s} viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case 'key':
      return (
        <svg {...s} viewBox="0 0 24 24">
          <circle cx="7" cy="14" r="4" />
          <path d="m10 11 10-10M14 5l3 3M16 3l3 3" />
        </svg>
      );
    case 'tag':
      return (
        <svg {...s} viewBox="0 0 24 24">
          <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" />
          <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'percent':
      return (
        <svg {...s} viewBox="0 0 24 24">
          <path d="M19 5 5 19" />
          <circle cx="7" cy="7" r="2.5" />
          <circle cx="17" cy="17" r="2.5" />
        </svg>
      );
    case 'calendar-week':
      return (
        <svg {...s} viewBox="0 0 24 24">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 9h18M8 3v4M16 3v4M15 13h2M15 17h2" />
        </svg>
      );
    default:
      return null;
  }
};

export default Icon;
