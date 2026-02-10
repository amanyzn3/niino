import { cn } from "@/lib/utils";

type StatusType = "pending" | "completed" | "accepted" | "rejected" | "overdue" | "approved" | "verified" | "answered" | "closed";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
  children?: React.ReactNode;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-pending text-pending-foreground",
  },
  completed: {
    label: "Completed",
    className: "bg-success text-success-foreground",
  },
  accepted: {
    label: "Accepted",
    className: "bg-success text-success-foreground",
  },
  approved: {
    label: "Approved",
    className: "bg-success text-success-foreground",
  },
  verified: {
    label: "Verified",
    className: "bg-success text-success-foreground",
  },
  rejected: {
    label: "Rejected",
    className: "bg-destructive/20 text-destructive",
  },
  overdue: {
    label: "Overdue",
    className: "bg-destructive/20 text-destructive",
  },
  answered: {
    label: "Answered",
    className: "bg-primary/20 text-primary",
  },
  closed: {
    label: "Closed",
    className: "bg-muted text-muted-foreground",
  },
};

export const StatusBadge = ({ status, className, children }: StatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold",
        config.className,
        className
      )}
    >
      {children || config.label}
    </span>
  );
};
