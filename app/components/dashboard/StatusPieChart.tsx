'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  reviewed: '#3b82f6',
  shortlisted: '#10b981',
  rejected: '#f43f5e',
};

interface StatusPieChartProps {
  data: { name: string; value: number }[];
}

export default function StatusPieChart({ data }: StatusPieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <section className="w-full space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h2 className="text-xl font-black text-slate-950 tracking-tight">Status Breakdown</h2>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center shadow-xs">
          <p className="text-sm font-medium text-slate-700">No applications yet</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h2 className="text-xl font-black text-slate-950 tracking-tight">Application Status</h2>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={55}
              paddingAngle={3}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '13px',
              }}
              labelStyle={{ fontWeight: 700, color: '#0f172a' }}
              formatter={(value, name) => [`${value} (${((Number(value) / total) * 100).toFixed(1)}%)`, name]}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="mt-4 flex flex-wrap justify-center gap-4">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[entry.name] || '#94a3b8' }}
              />
              {entry.name}
              <span className="text-slate-400">({entry.value})</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
