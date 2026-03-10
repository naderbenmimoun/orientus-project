import { ApplicationStatus, STATUS_LABELS } from '../models/Application';

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
  size?: 'sm' | 'md';
}

const statusStyles: Record<ApplicationStatus, string> = {
  [ApplicationStatus.NON_REPONDU]: 'bg-red-100 text-red-700 border-red-200',
  [ApplicationStatus.EN_COURS]: 'bg-orange-100 text-orange-700 border-orange-200',
  [ApplicationStatus.CONTACTE]: 'bg-green-100 text-green-700 border-green-200',
};

const statusDots: Record<ApplicationStatus, string> = {
  [ApplicationStatus.NON_REPONDU]: 'bg-red-500',
  [ApplicationStatus.EN_COURS]: 'bg-orange-500',
  [ApplicationStatus.CONTACTE]: 'bg-green-500',
};

const ApplicationStatusBadge = ({ status, size = 'md' }: ApplicationStatusBadgeProps) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${statusStyles[status]} ${sizeClasses}`}>
      <span className={`w-2 h-2 rounded-full ${statusDots[status]}`} />
      {STATUS_LABELS[status]}
    </span>
  );
};

export default ApplicationStatusBadge;
