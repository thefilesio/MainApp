import React from 'react';
import DashboardGrid from '@/components/DashboardGrid';
import BotCountCard from '@/components/BotCountCard';

const Dashboard = () => {
  return (
    <DashboardGrid>
      <BotCountCard totalBots={124} activeBots={102} />
    </DashboardGrid>
  );
};

export default Dashboard; 