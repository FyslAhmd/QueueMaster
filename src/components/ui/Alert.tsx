'use client';

import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  className?: string;
}

const alertConfig = {
  info: {
    icon: Info,
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
  },
  success: {
    icon: CheckCircle,
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
  },
  warning: {
    icon: AlertCircle,
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
  },
  error: {
    icon: XCircle,
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    text: 'text-red-400',
  },
};

export function Alert({ type = 'info', title, message, className = '' }: AlertProps) {
  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={`flex gap-3 p-4 rounded-lg border ${config.bg} ${config.border} ${className}`}
    >
      <Icon className={`w-5 h-5 shrink-0 ${config.text}`} />
      <div>
        {title && <p className={`font-medium ${config.text}`}>{title}</p>}
        <p className="text-sm text-slate-300">{message}</p>
      </div>
    </div>
  );
}
