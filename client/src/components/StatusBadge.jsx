import React from 'react';
import { 
  Clock, UserCheck, CheckCircle2, PlayCircle, AlertTriangle, 
  XCircle, RotateCcw, ShieldCheck, Hourglass 
} from 'lucide-react';

export default function StatusBadge({ status }) {
  const getStatusInfo = (st) => {
    switch (st) {
      case 'REQUESTED':
        return { label: 'Requested', icon: Clock, className: 'badge-REQUESTED' };
      case 'WORKER_ASSIGNED':
        return { label: 'Worker Assigned', icon: UserCheck, className: 'badge-WORKER_ASSIGNED' };
      case 'ACCEPTED':
        return { label: 'Accepted', icon: CheckCircle2, className: 'badge-ACCEPTED' };
      case 'IN_PROGRESS':
        return { label: 'In Progress', icon: PlayCircle, className: 'badge-IN_PROGRESS' };
      case 'AWAITING_CONFIRMATION':
        return { label: 'Awaiting Confirmation', icon: Hourglass, className: 'badge-AWAITING_CONFIRMATION' };
      case 'COMPLETED':
        return { label: 'Completed', icon: CheckCircle2, className: 'badge-COMPLETED' };
      case 'CANCELLED':
        return { label: 'Cancelled', icon: XCircle, className: 'badge-CANCELLED' };
      case 'DISPUTED':
        return { label: 'Disputed', icon: AlertTriangle, className: 'badge-DISPUTED' };
      case 'REJECTED_BY_WORKER':
        return { label: 'Worker Declined', icon: RotateCcw, className: 'badge-REJECTED_BY_WORKER' };
      case 'APPROVED':
        return { label: 'Approved', icon: ShieldCheck, className: 'badge-APPROVED' };
      case 'PENDING_APPROVAL':
        return { label: 'Pending Approval', icon: Clock, className: 'badge-PENDING_APPROVAL' };
      default:
        return { label: st || 'Unknown', icon: Clock, className: 'badge-REQUESTED' };
    }
  };

  const { label, icon: Icon, className } = getStatusInfo(status);

  return (
    <span className={`badge ${className}`} title={`Status: ${label}`}>
      <Icon size={12} strokeWidth={2.5} />
      <span>{label}</span>
    </span>
  );
}
