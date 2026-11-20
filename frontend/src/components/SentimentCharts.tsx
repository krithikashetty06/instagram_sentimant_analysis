import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { AnalysisSummary } from '../types';
import { Info, BarChart2, PieChart as PieIcon, Table as TableIcon, Award } from 'lucide-react';

interface SentimentChartsProps {
  summary: AnalysisSummary;
}

const COLORS: Record<string, string> = {
  Positive: '#10B981', // Emerald green
  Neutral: '#64748B',  // Slate blue-grey
  Negative: '#EF4444', // Coral red
};

export const SentimentCharts: React.FC<SentimentChartsProps> = ({ summary }) => {
  const chartData = [
    { sentiment: 'Positive', count: summary.positive_count, percentage: summary.positive_percentage },
    { sentiment: 'Neutral', count: summary.neutral_count, percentage: summary.neutral_percentage },
    { sentiment: 'Negative', count: summary.negative_count, percentage: summary.negative_percentage },
  ];

  const pieData = chartData.filter((d) => d.count > 0);

  const getDominantPercentage = (dominant: string) => {
    if (dominant === 'Positive') return summary.positive_percentage;
    if (dominant === 'Negative') return summary.negative_percentage;
    return summary.neutral_percentage;
  };

  const dominantBg: Record<string, string> = {
    Positive: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    Neutral: 'bg-slate-100 text-slate-800 border-slate-200',
    Negative: 'bg-rose-50 text-rose-800 border-rose-200',
  };

  return (
    <div className="space-y-6">
      {/* Overall Sentiment Callout Box (Section 9.D) */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Dominant Perception
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    dominantBg[summary.dominant_sentiment] || dominantBg.Neutral
                  }`}
                >
                  {summary.dominant_sentiment} ({getDominantPercentage(summary.dominant_sentiment).toFixed(2)}%)
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-800 mt-1">
                {summary.dominant_sentiment === 'Positive' && 'Audience perception is predominantly favorable.'}
                {summary.dominant_sentiment === 'Neutral' && 'Audience response is primarily informational or neutral.'}
                {summary.dominant_sentiment === 'Negative' && 'Audience response indicates noticeable critical or negative feedback.'}
              </p>
              <p className="text-xs text-slate-500 mt-1 flex items-start gap-1">
                <Info className="h-3.5 w-3.5 shrink-0 text-slate-400 mt-0.5" />
                <span>{summary.dominant_explanation}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-6 shrink-0">
            <div>
              <p className="text-xs text-slate-400">Average Polarity</p>
              <p className="text-lg font-bold font-mono text-slate-900">
                {summary.average_polarity > 0 ? `+${summary.average_polarity}` : summary.average_polarity}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Avg Subjectivity</p>
              <p className="text-lg font-bold font-mono text-slate-900">
                {(summary.average_subjectivity * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid (Section 9.A & 9.B) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* A. Bar Chart */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Sentiment Frequency Distribution</h3>
            </div>
            <span className="text-xs text-slate-400">Total: {summary.total_analyzed.toLocaleString()} posts</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="sentiment"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(val: number) => [`${val.toLocaleString()} posts`, 'Count']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.sentiment} fill={COLORS[entry.sentiment]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* B. Donut Chart */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Proportional Sentiment Share</h3>
            </div>
            <span className="text-xs text-slate-400">100% Normalized</span>
          </div>

          <div className="h-72 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="sentiment"
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  labelLine={false}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.sentiment} fill={COLORS[entry.sentiment]} stroke="#fff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number, name: string, item: any) => [
                    `${val.toLocaleString()} posts (${item.payload.percentage}%)`,
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value: string) => <span className="text-xs text-slate-700 font-medium">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* C. Sentiment Summary Table (Section 9.C) */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <TableIcon className="h-4 w-4 text-slate-700" />
          <h3 className="text-sm font-bold text-slate-900">Sentiment Breakdown Summary Table</h3>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3">Sentiment Category</th>
                <th className="px-5 py-3 text-right">Classified Post Count</th>
                <th className="px-5 py-3 text-right">Calculated Percentage</th>
                <th className="px-5 py-3 text-right">Distribution Visual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-slate-800">
              {summary.distribution.map((item) => (
                <tr key={item.sentiment} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5 font-medium flex items-center gap-2.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[item.sentiment] }}
                    />
                    <span>{item.sentiment}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono font-semibold">
                    {item.count.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono font-semibold">
                    {item.percentage.toFixed(2)}%
                  </td>
                  <td className="px-5 py-3.5 text-right w-48">
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: COLORS[item.sentiment],
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
                <td className="px-5 py-3">Total Classified Posts</td>
                <td className="px-5 py-3 text-right font-mono">{summary.total_analyzed.toLocaleString()}</td>
                <td className="px-5 py-3 text-right font-mono">100.00%</td>
                <td className="px-5 py-3 text-right text-xs text-slate-400 font-normal">Exact Denominator</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
