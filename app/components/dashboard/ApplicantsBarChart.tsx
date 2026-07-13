'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface BarChartData {
  title: string;
  applicants: number;
}

interface ApplicantsBarChartProps {
  data: BarChartData[];
}

export default function ApplicantsBarChart({ data }: ApplicantsBarChartProps) {
  if (data.length === 0) {
    return (
      <section className="w-full space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h2 className="text-xl font-black text-slate-950 tracking-tight">Applicants per Job</h2>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center shadow-xs">
          <p className="text-sm font-medium text-slate-700">No job postings yet</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h2 className="text-xl font-black text-slate-950 tracking-tight">Applicants per Job</h2>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="title"
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={60}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '13px',
              }}
              labelStyle={{ fontWeight: 700, color: '#0f172a' }}
            />
            <Bar dataKey="applicants" fill="#203f99" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
