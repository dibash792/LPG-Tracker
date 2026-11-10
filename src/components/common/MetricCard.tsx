import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface MetricCardProps {
  title: string;
  value: number | string;
  unit?: string;
  trend?: number;
  trendLabel?: string;
  icon: LucideIcon;
  subtext?: string;
  statusVariant?: 'default' | 'accent' | 'warning' | 'alert' | 'success';
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  trend,
  trendLabel = 'vs last week',
  icon: Icon,
  subtext,
  statusVariant = 'default',
  onClick
}) => {
  const { formatNumber } = useLanguage();

  const formattedVal = typeof value === 'number' ? formatNumber(value) : value;

  const getVariantStyles = () => {
    switch (statusVariant) {
      case 'accent':
        return {
          iconBg: 'bg-flame-100 text-flame-700 dark:bg-flame-950/60 dark:text-flame-300 border border-flame-200 dark:border-flame-800',
          borderAccent: 'border-l-4 border-l-flame-600',
        };
      case 'warning':
        return {
          iconBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
          borderAccent: 'border-l-4 border-l-amber-500',
        };
      case 'alert':
        return {
          iconBg: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800',
          borderAccent: 'border-l-4 border-l-red-600',
        };
      case 'success':
        return {
          iconBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
          borderAccent: 'border-l-4 border-l-emerald-600',
        };
      default:
        return {
          iconBg: 'bg-brand-50 text-brand-800 dark:bg-brand-900/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800',
          borderAccent: 'border-l-4 border-l-brand-700 dark:border-l-brand-500',
        };
    }
  };

  const variant = getVariantStyles();

  return (
    <div 
      onClick={onClick}
      className={`bg-white dark:bg-brand-900/70 rounded-2xl p-5 shadow-card hover:shadow-card-hover border border-slate-200/90 dark:border-brand-800/80 transition-all duration-150 ${variant.borderAccent} ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <div className="flex items-baseline space-x-1.5 pt-1">
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
              {formattedVal}
            </span>
            {unit && (
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {unit}
              </span>
            )}
          </div>
        </div>

        <div className={`p-2.5 rounded-xl ${variant.iconBg} shadow-2xs`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-brand-800/60 flex items-center justify-between text-xs">
        {trend !== undefined ? (
          <div className="flex items-center space-x-1.5">
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded font-bold text-xs ${
              trend > 0 
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                : trend < 0 
                  ? 'bg-red-50 text-red-800 dark:bg-red-950/60 dark:text-red-300' 
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}>
              {trend > 0 ? (
                <TrendingUp className="w-3 h-3 mr-0.5 inline" />
              ) : trend < 0 ? (
                <TrendingDown className="w-3 h-3 mr-0.5 inline" />
              ) : (
                <Minus className="w-3 h-3 mr-0.5 inline" />
              )}
              {trend > 0 ? `+${trend}%` : `${trend}%`}
            </span>
            <span className="text-slate-400 dark:text-slate-500 text-[11px] truncate">{trendLabel}</span>
          </div>
        ) : (
          <span className="text-slate-400 dark:text-slate-500 text-xs">{subtext || 'Live synchronized'}</span>
        )}
      </div>
    </div>
  );
};
