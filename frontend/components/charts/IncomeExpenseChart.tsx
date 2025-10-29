'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MonthlyData {
  month: string;
  total_income: number;
  total_expense: number;
}

interface IncomeExpenseChartProps {
  data: MonthlyData[];
}

export default function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
  console.log('IncomeExpenseChart received data:', data);
  
  // Check if data exists and is an array
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        No data available
      </div>
    );
  }
  
  // Transform data for recharts (reverse to show chronological order)
  const chartData = [...data].reverse().map(item => ({
    month: item.month.split(' ')[0], // Just the month name
    income: item.total_income,
    expense: item.total_expense,
  }));
  
  console.log('IncomeExpenseChart chartData:', chartData);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.fill }}>
              {entry.name}: ${entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="month" 
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          tickFormatter={(value: number) => `$${value}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar 
          dataKey="income" 
          fill="#10b981" 
          name="Income"
          radius={[8, 8, 0, 0]}
        />
        <Bar 
          dataKey="expense" 
          fill="#ef4444" 
          name="Expenses"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
