'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface CategoryData {
  category: string;
  total: number;
  percentage: number;
}

interface CategoryPieChartProps {
  data: CategoryData[];
}

// Darker versions of app theme colors for better visibility
// Base theme: #ECF4E8 (sage), #CBF3BB (mint), #ABE7B2 (green), #93BFC7 (blue-gray)
const CHART_COLORS = [
  '#6B9AA3', // Darker blue-gray (from #93BFC7)
  '#7DA891', // Darker green (from #ABE7B2)
  '#A0D49A', // Darker mint (from #CBF3BB)
  '#B8C9B0', // Darker sage (from #ECF4E8)
  '#5A8A94', // Even darker blue-gray
  '#6D9B81', // Even darker green
  '#8DC285', // Medium green
];

// Category-specific color mapping using darker theme colors
const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining': '#6B9AA3',
  'Groceries': '#7DA891',
  'Transportation': '#A0D49A',
  'Entertainment': '#B8C9B0',
  'Shopping': '#5A8A94',
  'Bills & Utilities': '#6D9B81',
  'Healthcare': '#8DC285',
};

// Default colors for unmapped categories
const DEFAULT_COLORS = CHART_COLORS;

export default function CategoryPieChart({ data }: CategoryPieChartProps) {
  // Transform data for recharts with category-specific colors
  const chartData = data.slice(0, 7).map(item => ({
    name: item.category,
    value: item.total,
    color: CATEGORY_COLORS[item.category] || DEFAULT_COLORS[0],
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            ${payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        No spending data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
