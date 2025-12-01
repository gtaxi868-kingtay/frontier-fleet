import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusType = 'availability' | 'serviceability' | 'inspection' | 'work_ticket';

interface StatusBadgeProps {
  status: string;
  type: StatusType;
  className?: string;
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon?: React.ReactNode }> = {
  // Availability statuses
  // Availability statuses
  'available': { label: 'Available', variant: 'default', icon: <CheckCircle2 className="h-3 w-3" /> },
  'issued': { label: 'Issued', variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
  'reserved': { label: 'Reserved', variant: 'outline' },
  
  // Serviceability statuses
  'serviceable': { label: 'Serviceable', variant: 'default', icon: <CheckCircle2 className="h-3 w-3" /> },
  'unserviceable': { label: 'Unserviceable', variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
  'under_repair': { label: 'Under Repair', variant: 'outline', icon: <AlertCircle className="h-3 w-3" /> },
  'underrepair': { label: 'Under Repair', variant: 'outline', icon: <AlertCircle className="h-3 w-3" /> },
  
  // Inspection statuses
  'pending': { label: 'Pending', variant: 'secondary' },
  'overdue': { label: 'Overdue', variant: 'destructive', icon: <AlertCircle className="h-3 w-3" /> },
  
  // Work ticket statuses
  'active': { label: 'Active', variant: 'default' },
  'cancelled': { label: 'Cancelled', variant: 'outline' },
};

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  // Normalize status string
  const normalizedStatus = status?.toLowerCase().replace(/[^a-z0-9_]/g, '_') || '';
  
  // Find matching config
  const config = STATUS_CONFIG[normalizedStatus] || { 
    label: status || 'Unknown', 
    variant: 'outline' as const 
  };

  return (
    <Badge 
      variant={config.variant} 
      className={cn("flex items-center gap-1", className)}
    >
      {config.icon}
      <span>{config.label}</span>
    </Badge>
  );
}

