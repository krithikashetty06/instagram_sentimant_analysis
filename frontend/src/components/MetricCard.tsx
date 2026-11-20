import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  count: number | string;
  percentage?: number;
  subtitle?: string;
  icon: LucideIcon;
  variant: 'total' | 'positive' | 'neutral' | 'negative';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  count,
  percentage,
  subtitle,
  icon: Icon,
  variant,
}) => {
  const variantStyles = {
    total: {
      bg: 'bg-white',
      border: 'border-slate-200/80',
      badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
      iconBg: 'bg-blue-50 text-blue-600',
      countColor: 'text-slate-900',
    },
    positive: {
      bg: 'bg-white',
      border: 'border-emerald-200/60',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-50 text-emerald-600',
      countColor: 'text-emerald-950',
    },
    neutral: {
      bg: 'bg-white',
      border: 'border-slate-200/80',
      badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
      iconBg: 'bg-slate-100 text-slate-600',
      countColor: 'text-slate-800',
    },
    negative: {
      bg: 'bg-white',
      border: 'border-rose-200/60',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
      iconBg: 'bg-rose-50 text-rose-600',
      countColor: 'text-rose-950',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      className={`rounded-xl p-5 ${style.bg} border ${style.border} shadow-xs hover:shadow-sm transition-all relative overflow-hidden`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className={`text-2xl font-bold tracking-tight ${style.countColor}`}>
              {typeof count === 'number' ? count.toLocaleString() : count}
            </h3>
            {percentage !== undefined && (
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${style.badgeBg} inline-flex items-center gap-0.5`}
              >
                {variant === 'positive' && <ArrowUpRight className="h-3 w-3" />}
                {variant === 'negative' && <ArrowDownRight className="h-3 w-3" />}
                {variant === 'neutral' && <Minus className="h-3 w-3" />}
                {percentage.toFixed(2)}%
              </span>
            )}
          </div>
        </div>

        <div className={`p-2.5 rounded-lg ${style.iconBg} shrink-0`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {subtitle && (
        <p className="mt-2.5 text-xs text-slate-400 font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
};
