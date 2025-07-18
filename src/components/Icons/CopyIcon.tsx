import React from 'react';

interface CopyIconProps {
  onClick: (event: React.MouseEvent) => void;
}

const CopyIcon: React.FC<CopyIconProps> = ({ onClick }) => (
  <button
    onClick={onClick}
    aria-label="Copy quote and author"
    className="p-2 text-white hover:text-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded-full"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  </button>
);

export default CopyIcon;
