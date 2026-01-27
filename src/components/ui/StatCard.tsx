'use client';

import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

const colorClasses = {
  primary: {
    bg: 'bg-teal-50',
    text: 'text-teal-600',
    icon: 'text-teal-600',
    border: 'border-teal-100',
  },
  success: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    icon: 'text-emerald-600',
    border: 'border-emerald-100',
  },
  warning: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    icon: 'text-amber-600',
    border: 'border-amber-100',
  },
  error: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    icon: 'text-red-600',
    border: 'border-red-100',
  },
  info: {
    bg: 'bg-sky-50',
    text: 'text-sky-600',
    icon: 'text-sky-600',
    border: 'border-sky-100',
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'primary',
}: StatCardProps) {
  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-800">{value}</p>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <p
              className={`text-sm font-medium mt-2 ${
                trend.isPositive ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colors.bg} ${colors.border} border`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
      </div>
    </motion.div>
  );
}
