import React from 'react';

interface FavoriteIconProps {
  isFavorited: boolean;
  onClick: (event: React.MouseEvent) => void;
}

const FavoriteIcon: React.FC<FavoriteIconProps> = ({ isFavorited, onClick }) => (
  <button
    onClick={onClick}
    aria-label={isFavorited ? "Unfavorite this quote" : "Favorite this quote"}
    className="p-2 text-white hover:text-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 rounded-full"
    aria-pressed={isFavorited}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill={isFavorited ? 'currentColor' : 'none'}
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.05 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.95-.69L11.049 2.927z"
      />
    </svg>
  </button>
);

export default FavoriteIcon;
