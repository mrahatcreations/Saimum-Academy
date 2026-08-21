import React from 'react';

export type BadgeVariant = 
  | 'success' 
  | 'warning' 
  | 'info' 
  | 'danger' 
  | 'neutral' 
  | 'purple' 
  | 'auto';

interface StatusBadgeProps {
  status: string;
  variant?: BadgeVariant;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = 'auto',
  label,
  className = ''
}) => {
  const normalizedStatus = (status || '').toUpperCase();

  // Auto-detect variant from status name if not explicitly provided
  let effectiveVariant = variant;
  if (effectiveVariant === 'auto') {
    if (['ACTIVE', 'COMPLETED', 'PAID', 'SELECTED', 'APPROVED'].includes(normalizedStatus)) {
      effectiveVariant = 'success';
    } else if (['PENDING', 'PENDING_VIVA', 'WAITING', 'OVERDUE', 'WARNING'].includes(normalizedStatus)) {
      effectiveVariant = 'warning';
    } else if (['VIVA_SCHEDULED', 'ENROLLED', 'SCHEDULED', 'INFO'].includes(normalizedStatus)) {
      effectiveVariant = 'info';
    } else if (['INACTIVE', 'REJECTED', 'FAILED', 'EXPIRED', 'OFFER_EXPIRED', 'CANCELLED', 'DANGER'].includes(normalizedStatus)) {
      effectiveVariant = 'danger';
    } else if (['ONLINE', 'SPECIAL'].includes(normalizedStatus)) {
      effectiveVariant = 'purple';
    } else {
      effectiveVariant = 'neutral';
    }
  }

  const getVariantClass = () => {
    switch (effectiveVariant) {
      case 'success': return 'statusSuccess';
      case 'warning': return 'statusWarning';
      case 'info': return 'statusInfo';
      case 'danger': return 'statusDanger';
      case 'purple': return 'statusPurple';
      default: return 'statusNeutral';
    }
  };

  const formatText = (text: string) => {
    return text.replace(/_/g, ' ');
  };

  const displayText = label || formatText(status || '');

  return (
    <span className={`statusBadge ${getVariantClass()} ${className}`}>
      {displayText}
    </span>
  );
};

export default StatusBadge;
