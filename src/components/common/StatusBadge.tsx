import React from 'react';
import { DiscrepancyStatus, OrgStatus, DiscrepancySeverity } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { AlertCircle, CheckCircle2, Clock, HelpCircle, ShieldAlert, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: DiscrepancyStatus | OrgStatus | DiscrepancySeverity | 'SUCCESS' | 'WARNING' | 'ALERT' | 'INFO';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md', 
  showIcon = true 
}) => {
  const { t } = useLanguage();

  const getBadgeConfig = () => {
    switch (status) {
      // Discrepancy Statuses
      case 'RESOLVED':
      case 'SUCCESS':
      case 'ACTIVE':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-600',
          label: t('resolved') || 'Resolved',
          icon: CheckCircle2,
        };
      
      case 'PENDING_REVIEW':
      case 'WARNING':
      case 'PENDING_APPROVAL':
        return {
          bg: 'bg-amber-50 text-amber-900 border-amber-200',
          dot: 'bg-amber-600',
          label: t('pendingReview') || 'Pending Review',
          icon: Clock,
        };

      case 'UNDER_INVESTIGATION':
        return {
          bg: 'bg-sky-50 text-sky-900 border-sky-200',
          dot: 'bg-sky-600',
          label: t('underInvestigation') || 'Under Investigation',
          icon: HelpCircle,
        };

      case 'TECHNICAL_VARIANCE':
        return {
          bg: 'bg-slate-100 text-slate-800 border-slate-300',
          dot: 'bg-slate-500',
          label: t('technicalVariance') || 'Technical Variance',
          icon: CheckCircle2,
        };

      case 'SUSPECTED_DIVERSION':
        return {
          bg: 'bg-orange-50 text-orange-900 border-orange-200',
          dot: 'bg-orange-600',
          label: t('suspectedDiversion') || 'Suspected Diversion',
          icon: ShieldAlert,
        };

      case 'CONFIRMED_FRAUD':
      case 'ALERT':
      case 'CRITICAL':
      case 'SUSPENDED':
        return {
          bg: 'bg-red-50 text-red-900 border-red-200',
          dot: 'bg-red-600',
          label: status === 'CONFIRMED_FRAUD' ? (t('confirmedFraud') || 'Confirmed Fraud') : (status === 'SUSPENDED' ? (t('suspended') || 'Suspended') : 'Critical Alert'),
          icon: XCircle,
        };

      case 'HIGH':
        return {
          bg: 'bg-orange-50 text-orange-900 border-orange-200',
          dot: 'bg-orange-600',
          label: 'High Severity',
          icon: AlertCircle,
        };

      case 'MEDIUM':
        return {
          bg: 'bg-amber-50 text-amber-900 border-amber-200',
          dot: 'bg-amber-600',
          label: 'Medium Variance',
          icon: Clock,
        };

      case 'LOW':
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          label: 'Low Impact',
          icon: CheckCircle2,
        };

      default:
        return {
          bg: 'bg-navy-50 text-navy-800 border-navy-200',
          dot: 'bg-navy-600',
          label: String(status),
          icon: AlertCircle,
        };
    }
  };

  const config = getBadgeConfig();
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 space-x-1',
    md: 'text-xs px-2.5 py-1 space-x-1.5',
    lg: 'text-sm px-3 py-1.5 space-x-2'
  }[size];

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${config.bg} ${sizeClasses}`}>
      {showIcon && <IconComponent className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{config.label}</span>
    </span>
  );
};
