// src/components/charts/PaymentChart.jsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-border rounded-xl shadow-lg text-xs">
        <p className="font-semibold text-navy mb-1.5">{label}</p>
        {payload.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-4 py-0.5">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-text-secondary">{item.name}:</span>
            </div>
            <span className="font-semibold text-text-primary">
              {formatCurrency(item.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function PaymentChart({ data = [], height = 320 }) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5EAF0" vertical={false} />
          <XAxis
            dataKey="month"
            stroke="#667085"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#E5EAF0' }}
          />
          <YAxis
            stroke="#667085"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `₹${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: '16px', fontSize: '12px' }}
          />
          <Bar dataKey="collected" name="Collected" fill="#16A36A" stackId="a" radius={[0, 0, 0, 0]} />
          <Bar dataKey="outstanding" name="Outstanding" fill="#F59E0B" stackId="a" radius={[0, 0, 0, 0]} />
          <Bar dataKey="failed" name="Failed" fill="#DC5252" stackId="a" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
