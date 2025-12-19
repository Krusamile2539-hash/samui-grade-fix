import React from 'react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, colorClass }) => {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm p-6 flex items-center space-x-4 border border-white/50">
      <div className={`p-3 rounded-full ${colorClass} bg-opacity-10 text-opacity-100`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
};
