// src/components/charts/PieChart.jsx
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white p-2.5 border border-border rounded-xl shadow-lg text-xs">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: data.payload.fill || data.color }}
          />
          <span className="text-text-secondary">{data.name}:</span>
          <span className="font-semibold text-text-primary">{data.value}</span>
        </div>
      </div>
    );
  }
  return null;
};

const DEFAULT_COLORS = ['#3B82F6', '#16A36A', '#F59E0B', '#DC5252', '#8B5CF6', '#EC4899', '#06B6D4'];

export default function PieChart({ data = [], height = 280, innerRadius = 55, outerRadius = 85 }) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPie>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
          />
        </RechartsPie>
      </ResponsiveContainer>
    </div>
  );
}
