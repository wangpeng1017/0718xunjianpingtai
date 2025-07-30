import React from 'react';

export interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// 状态颜色映射
const statusColors: Record<string, string> = {
  // 设备状态
  online: 'bg-green-100 text-green-800 border-green-200',
  offline: 'bg-red-100 text-red-800 border-red-200',
  maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  
  // 任务状态
  pending: 'bg-gray-100 text-gray-800 border-gray-200',
  running: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  failed: 'bg-red-100 text-red-800 border-red-200',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
  
  // 优先级
  low: 'bg-gray-100 text-gray-800 border-gray-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  urgent: 'bg-red-100 text-red-800 border-red-200',
  
  // 报告状态
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
  review: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  published: 'bg-blue-100 text-blue-800 border-blue-200',
  
  // 发现类型
  normal: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  critical: 'bg-red-100 text-red-800 border-red-200',
  
  // 通知类型
  info: 'bg-blue-100 text-blue-800 border-blue-200',
  success: 'bg-green-100 text-green-800 border-green-200',
  error: 'bg-red-100 text-red-800 border-red-200',
};

// 状态文本映射
const statusLabels: Record<string, string> = {
  // 设备状态
  online: '在线',
  offline: '离线',
  maintenance: '维护中',
  
  // 任务状态
  pending: '待执行',
  running: '进行中',
  completed: '已完成',
  failed: '失败',
  cancelled: '已取消',
  
  // 优先级
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急',
  
  // 报告状态
  draft: '草稿',
  review: '审核中',
  approved: '已批准',
  published: '已发布',
  
  // 发现类型
  normal: '正常',
  warning: '警告',
  critical: '严重',
  
  // 通知类型
  info: '信息',
  success: '成功',
  error: '错误',
};

export function StatusBadge({
  status,
  variant = 'default',
  size = 'md',
  className = '',
}: StatusBadgeProps) {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };
  
  const colorClasses = statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  const label = statusLabels[status] || status;
  
  const variantClasses = variant === 'outline' ? 'border bg-transparent' : '';
  
  return (
    <span
      className={`${baseClasses} ${sizeClasses[size]} ${colorClasses} ${variantClasses} ${className}`}
    >
      {label}
    </span>
  );
}

// 带图标的状态标签
export interface StatusBadgeWithIconProps extends StatusBadgeProps {
  icon?: React.ReactNode;
}

export function StatusBadgeWithIcon({
  status,
  icon,
  variant = 'default',
  size = 'md',
  className = '',
}: StatusBadgeWithIconProps) {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };
  
  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };
  
  const colorClasses = statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  const label = statusLabels[status] || status;
  
  const variantClasses = variant === 'outline' ? 'border bg-transparent' : '';
  
  return (
    <span
      className={`${baseClasses} ${sizeClasses[size]} ${colorClasses} ${variantClasses} ${className}`}
    >
      {icon && (
        <span className={`${iconSizeClasses[size]} mr-1`}>
          {icon}
        </span>
      )}
      {label}
    </span>
  );
}
