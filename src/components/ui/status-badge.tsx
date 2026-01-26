import { cn } from '@/lib/utils';
import { RequestStatus, RequestType } from '@/types';

interface StatusBadgeProps {
  status: RequestStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusStyles = {
    pending: 'bg-status-pending-bg text-status-pending',
    approved: 'bg-status-approved-bg text-status-approved',
    rejected: 'bg-status-rejected-bg text-status-rejected',
    cancelled: 'bg-status-cancelled-bg text-status-cancelled',
  };

  const statusLabels = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        statusStyles[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  );
}

interface RequestTypeBadgeProps {
  type: RequestType;
  className?: string;
}

export function RequestTypeBadge({ type, className }: RequestTypeBadgeProps) {
  const typeStyles = {
    leave: 'bg-leave-bg text-leave',
    expense: 'bg-expense-bg text-expense',
    discount: 'bg-discount-bg text-discount',
  };

  const typeLabels = {
    leave: 'Leave',
    expense: 'Expense',
    discount: 'Discount',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        typeStyles[type],
        className
      )}
    >
      {typeLabels[type]}
    </span>
  );
}
