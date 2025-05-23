import React from 'react';

interface DashboardGridProps {
  children: React.ReactNode;
}

const DashboardGrid: React.FC<DashboardGridProps> = ({ children }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {children}
    </div>
  );
};

export default DashboardGrid; 