import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
        secondary:
          'border-transparent bg-gray-100 text-gray-700 hover:bg-gray-200',
        destructive:
          'border-transparent bg-red-50 text-red-700 hover:bg-red-100',
        outline: 'border-gray-300 text-gray-700',
        success:
          'border-transparent bg-green-50 text-green-700 hover:bg-green-100',
        warning:
          'border-transparent bg-yellow-50 text-yellow-800 hover:bg-yellow-100',
        error:
          'border-transparent bg-red-50 text-red-700 hover:bg-red-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
