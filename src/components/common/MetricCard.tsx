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
  statusVariant?: 'default' | 'teal' | 'amber' | 'red';
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
  const { formatNumber, language } = useLanguage();

  const formattedVal = typeof value === 'number' ? formatNumber(value) : value;

  const getVariantStyles = () => {
    switch (statusVariant) {
      case 'teal':
        return {
          iconBg: 'bg-teal-50 text-teal-600 border border-teal-200',
          borderAccent: 'border-l-4 border-l-teal-500',
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-50 text-amber-600 border border-amber-200',
          borderAccent: 'border-l-4 border-l-amber-500',
        };
      case 'red':
        return {
          iconBg: 'bg-red-50 text-red-600 border border-red-200',
          borderAccent: 'border-l-4 border-l-red-500',
        };
      default:
        return {
          iconBg: 'bg-navy-50 text-navy-800 border border-navy-100',
          borderAccent: 'border-l-4 border-l-navy-800',
        };
    }
  };

  const variant = getVariantStyles();

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl p-5 shadow-card hover:shadow-card-hover border border-slate-200/80 transition-all duration-200 ${variant.borderAccent} ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-500">
            {title}
          </p>
          <div className="flex items-baseline space-x-1.5 pt-1">
            <span className="text-2xl font-bold tracking-tight text-navy-950 font-sans">
              {formattedVal}
            </span>
            {unit && (
              <span className="text-xs font-semibold text-slate-500">
                {unit}
              </span>
            )}
          </div>
        </div>

        <div className={`p-2.5 rounded-lg ${variant.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        {trend !== undefined ? (
          <div className="flex items-center space-x-1.5">
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded font-medium text-xs ${
              trend > 0 
                ? 'bg-emerald-50 text-emerald-700' 
                : trend < 0 
                  ? 'bg-red-50 text-red-700' 
                  : 'bg-slate-100 text-slate-600'
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
            <span className="text-slate-400 text-[11px] truncate">{trendLabel}</span>
          </div>
        ) : (
          <span className="text-slate-400 text-xs">{subtext || 'Live synchronized'}</span>
        )}
      </div>
    </div>
  );
};

