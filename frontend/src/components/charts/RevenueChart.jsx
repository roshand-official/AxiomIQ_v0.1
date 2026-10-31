// src/components/charts/RevenueChart.jsx
import {
  AreaChart,
  Area,
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
          <div key={index} className="flex items-center gap-2 py-0.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-text-secondary">{item.name}:</span>
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

export default function RevenueChart({ data = [], height = 320 }) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorInvoiced" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#16A36A" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#16A36A" stopOpacity={0} />
            </linearGradient>
          </defs>
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
          <Area
            type="monotone"
            dataKey="invoiced"
            name="Invoiced"
            stroke="#3B82F6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorInvoiced)"
          />
          <Area
            type="monotone"
            dataKey="collected"
            name="Collected"
            stroke="#16A36A"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorCollected)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
