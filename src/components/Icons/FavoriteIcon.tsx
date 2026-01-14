import React from 'react';

interface FavoriteIconProps {
  isFavorited: boolean;
  onClick?: (event: React.MouseEvent) => void;
}

const FavoriteIcon: React.FC<FavoriteIconProps> = ({ isFavorited, onClick }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill={isFavorited ? 'currentColor' : 'none'}
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={`w-6 h-6 transition-colors duration-300 ${isFavorited ? 'text-red-500' : 'text-current'}`}
      onClick={onClick}
      aria-label={isFavorited ? 'Unfavorite this quote' : 'Favorite this quote'}
      role="img"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </svg>
  );
};

export default FavoriteIcon;
