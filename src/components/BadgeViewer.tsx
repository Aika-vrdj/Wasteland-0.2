import React from 'react';

interface BadgeViewerProps {
  badges: string[];
}

export const BadgeViewer: React.FC<BadgeViewerProps> = ({ badges }) => {
  if (badges.length === 0) {
    return null; // Do not display if no badges
  }

  return (
    <div className="bg-gray-800 p-4 rounded shadow-md">
      <h3 className="text-lg font-bold text-green-500">Badges</h3>
      <ul className="mt-2 space-y-1">
        {badges.map((badge, index) => (
          <li key={index} className="text-green-300">
            • {badge}
          </li>
        ))}
      </ul>
    </div>
  );
};
