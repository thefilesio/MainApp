import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface BotCountCardProps {
  totalBots: number;
  activeBots: number;
}

const BotCountCard: React.FC<BotCountCardProps> = ({ totalBots, activeBots }) => {
  const activePercentage = totalBots > 0 ? (activeBots / totalBots) * 100 : 0;
  const data = [
    { name: 'Aktiv', value: activeBots },
    { name: 'Inaktiv', value: totalBots - activeBots },
  ];

  const COLORS = ['#2AB6A6', '#D9F4F0'];

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-700">Bots Gesamt</h2>
      <p className="text-3xl font-bold text-gray-900">{totalBots}</p>
      <p className="text-sm text-gray-500">● Aktiv: {activeBots}</p>
      <div className="mt-4 h-32">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={60}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm text-gray-500 text-center mt-2">{activePercentage.toFixed(0)}% Aktiv</p>
    </div>
  );
};

export default BotCountCard; 