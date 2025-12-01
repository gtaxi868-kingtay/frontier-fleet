import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ItemDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  data: Record<string, any> | null;
  excludeFields?: string[];
  module?: string;
  onStatusClick?: (field: string) => void;
}

export function ItemDetailDialog({ 
  open, 
  onOpenChange, 
  title, 
  data,
  excludeFields = ['id', 'created_at', 'updated_at', 'squadron_id', 'unit_id', 'issued_to', 'assigned_to', 'operator_assigned', 'inspector', 'created_by', 'created_for', 'survey_report_filed'],
  module,
  onStatusClick,
}: ItemDetailDialogProps) {
  if (!data) return null;

  const formatFieldName = (key: string) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatValue = (value: any, key?: string) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value instanceof Date) return value.toLocaleDateString();
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
      return new Date(value).toLocaleDateString();
    }
    // Format condition_issue values nicely
    if (key === 'condition_issue' && typeof value === 'string') {
      if (value === 'SERVICEABLE') return 'Serviceable';
      if (value === 'UNSERVICEABLE') return 'Unserviceable';
      if (value === 'UNDER_REPAIR') return 'Under Repair';
    }
    return String(value);
  };

  const getStatusBadgeVariant = (key: string, value: any) => {
    if (key === 'condition_issue') {
      if (value === 'SERVICEABLE') return 'default';
      if (value === 'UNDER_REPAIR') return 'secondary';
      return 'destructive';
    }
    if (key.includes('serviceable') || key.includes('serviceability')) {
      if (value === true || value === 'Serviceable' || value === 'Operational') {
        return 'default';
      }
      return 'destructive';
    }
    if (key.includes('status')) {
      if (value === 'Available' || value === 'Operational' || value === 'approved') return 'default';
      if (value === 'Issued' || value === 'pending') return 'secondary';
      return 'destructive';
    }
    return 'outline';
  };

  const filteredData = Object.entries(data).filter(
    ([key]) => !excludeFields.includes(key)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl uppercase tracking-wider">
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {filteredData.map(([key, value], index) => {
            const isStatusField = key === 'condition_issue' || key === 'serviceable';
            const isClickable = module === 'weapons' && isStatusField && onStatusClick;
            const shouldShowAsBadge = key.includes('serviceable') || key.includes('status') || key.includes('serviceability') || key === 'condition_issue';
            
            return (
              <div key={key}>
                <div className="flex justify-between items-start gap-4">
                  <span className="font-tactical text-sm uppercase text-muted-foreground tracking-wide">
                    {formatFieldName(key)}
                  </span>
                  {shouldShowAsBadge ? (
                    <Badge 
                      variant={getStatusBadgeVariant(key, value)} 
                      className={`font-tactical ${isClickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                      onClick={isClickable ? () => onStatusClick(key) : undefined}
                    >
                      {formatValue(value, key)}
                    </Badge>
                  ) : (
                    <span className="font-medium text-right max-w-[60%] break-words">
                      {formatValue(value, key)}
                    </span>
                  )}
                </div>
                {index < filteredData.length - 1 && <Separator className="mt-4" />}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
