import React from 'react';
import { DiscrepancyStatus, OrgStatus, DiscrepancySeverity } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  ShieldAlert, 
  XCircle, 
  Clock, 
  AlertCircle,
  Info
} from 'lucide-react';

interface StatusBadgeProps {
  status: DiscrepancyStatus | OrgStatus | DiscrepancySeverity | 'SUCCESS' | 'WARNING' | 'ALERT' | 'INFO' | string;
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
      // 1. SEMANTIC SUCCESS: Verified / Resolved / Active
      case 'RESOLVED':
      case 'SUCCESS':
      case 'ACTIVE':
        return {
          classes: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
          dot: 'bg-emerald-600 dark:bg-emerald-400',
          label: status === 'ACTIVE' ? (t('active') || 'Active') : (t('resolved') || 'Resolved'),
          icon: CheckCircle2,
        };
      
      // 2. SEMANTIC WARNING: Genuine inquiry / Pending Review / Legitimate Variance
      case 'PENDING_REVIEW':
      case 'WARNING':
      case 'PENDING_APPROVAL':
        return {
          classes: 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800',
          dot: 'bg-amber-600 dark:bg-amber-400',
          label: status === 'PENDING_APPROVAL' ? (t('pendingApproval') || 'Pending Approval') : (t('pendingReview') || 'Pending Review'),
          icon: Clock,
        };

      // 3. SEMANTIC TECHNICAL VARIANCE: Mechanical/Tare Calibration (Muted Slate / Steel)
      case 'TECHNICAL_VARIANCE':
      case 'LOW':
        return {
          classes: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800/70 dark:text-slate-300 dark:border-slate-700',
          dot: 'bg-slate-500 dark:bg-slate-400',
          label: status === 'LOW' ? 'Low Variance' : (t('technicalVariance') || 'Technical Variance (NS:533)'),
          icon: Info,
        };

      // 4. SEMANTIC UNDER INVESTIGATION: Formal inquiry in progress (Muted Navy Blue)
      case 'UNDER_INVESTIGATION':
      case 'MEDIUM':
        return {
          classes: 'bg-blue-50 text-blue-900 border-blue-300 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-800',
          dot: 'bg-blue-600 dark:bg-blue-400',
          label: status === 'MEDIUM' ? 'Medium Variance' : (t('underInvestigation') || 'Under Review'),
          icon: HelpCircle,
        };

      // 5. SEMANTIC CRITICAL SHORTAGE / SUSPECTED DIVERSION: Orange Ember Alert
      case 'SUSPECTED_DIVERSION':
      case 'HIGH':
        return {
          classes: 'bg-flame-50 text-flame-900 border-flame-300 dark:bg-flame-950/60 dark:text-flame-200 dark:border-flame-800',
          dot: 'bg-flame-600 dark:bg-flame-400',
          label: status === 'HIGH' ? 'High Impact Variance' : (t('suspectedDiversion') || 'Suspected Diversion'),
          icon: ShieldAlert,
        };

      // 6. SEMANTIC CRITICAL ERROR: Confirmed Fraud / Sanction / Suspended
      case 'CONFIRMED_FRAUD':
      case 'ALERT':
      case 'CRITICAL':
      case 'SUSPENDED':
        return {
          classes: 'bg-red-50 text-red-900 border-red-300 dark:bg-red-950/60 dark:text-red-200 dark:border-red-800',
          dot: 'bg-red-600 dark:bg-red-400',
          label: status === 'CONFIRMED_FRAUD' 
            ? (t('confirmedFraud') || 'Confirmed Fraud') 
            : (status === 'SUSPENDED' ? (t('suspended') || 'Suspended') : 'Critical Shortage'),
          icon: XCircle,
        };

      default:
        return {
          classes: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
          dot: 'bg-slate-500',
          label: String(status).replace('_', ' '),
          icon: AlertCircle,
        };
    }
  };

  const config = getBadgeConfig();
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 space-x-1 font-medium',
    md: 'text-xs px-2.5 py-1 space-x-1.5 font-semibold',
    lg: 'text-sm px-3 py-1.5 space-x-2 font-semibold'
  }[size];

  return (
    <span className={`inline-flex items-center rounded-full border transition-colors ${config.classes} ${sizeClasses}`}>
      {showIcon && <IconComponent className={size === 'sm' ? 'w-3 h-3 shrink-0' : 'w-3.5 h-3.5 shrink-0'} />}
      <span>{config.label}</span>
    </span>
  );
};
