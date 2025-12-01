import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Package, CheckCircle2, FileCheck, Wrench } from "lucide-react";
import { useActionItems } from "@/hooks/useActionItems";
import { useNavigate } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

export function ActionRequiredCard() {
  const navigate = useNavigate();
  const { urgent, attention, info, isLoading, total } = useActionItems();
  const [urgentOpen, setUrgentOpen] = useState(true);
  const [attentionOpen, setAttentionOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'overdue_item':
        return <Clock className="h-4 w-4" />;
      case 'inspection_due':
        return <FileCheck className="h-4 w-4" />;
      case 'work_ticket_return':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'pending_approval':
        return <Package className="h-4 w-4" />;
      case 'unserviceable':
        return <Wrench className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'overdue_item':
        return 'Overdue';
      case 'inspection_due':
        return 'Inspection Due';
      case 'work_ticket_return':
        return 'Work Ticket';
      case 'pending_approval':
        return 'Pending Approval';
      case 'unserviceable':
        return 'Unserviceable';
      default:
        return 'Action Required';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Action Required</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading action items...</p>
        </CardContent>
      </Card>
    );
  }

  if (total === 0) {
    return (
      <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            Action Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-green-700 dark:text-green-400">
            All tasks are up to date! No action items requiring your attention.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Action Required
            </CardTitle>
            <CardDescription>
              {total} item{total !== 1 ? 's' : ''} requiring your attention
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {urgent.length > 0 && (
              <Badge variant="destructive">{urgent.length} Urgent</Badge>
            )}
            {attention.length > 0 && (
              <Badge variant="secondary">{attention.length} Attention</Badge>
            )}
            {info.length > 0 && (
              <Badge variant="outline">{info.length} Info</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Urgent Items */}
        {urgent.length > 0 && (
          <Collapsible open={urgentOpen} onOpenChange={setUrgentOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-md bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="font-medium text-red-900 dark:text-red-100">
                  Urgent ({urgent.length})
                </span>
              </div>
              {urgentOpen ? (
                <ChevronUp className="h-4 w-4 text-red-600 dark:text-red-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-2">
              {urgent.map((item) => (
                <div
                  key={item.id}
                  className="p-3 border border-red-200 dark:border-red-800 rounded-md bg-white dark:bg-gray-900 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => item.link && navigate(item.link)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getTypeIcon(item.type)}
                        <span className="font-medium text-sm">{item.title}</span>
                        <Badge variant="destructive" className="text-xs">
                          {getTypeLabel(item.type)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                      {item.dueDate && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          {item.dueDate === new Date().toISOString().split('T')[0] 
                            ? 'Due today' 
                            : `Due: ${format(new Date(item.dueDate), 'MMM dd, yyyy')}`}
                        </p>
                      )}
                    </div>
                    {item.link && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(item.link!);
                        }}
                      >
                        View →
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Attention Items */}
        {attention.length > 0 && (
          <Collapsible open={attentionOpen} onOpenChange={setAttentionOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-md bg-yellow-50 dark:bg-yellow-950/20 hover:bg-yellow-100 dark:hover:bg-yellow-950/30 transition-colors">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <span className="font-medium text-yellow-900 dark:text-yellow-100">
                  Needs Attention ({attention.length})
                </span>
              </div>
              {attentionOpen ? (
                <ChevronUp className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-2">
              {attention.map((item) => (
                <div
                  key={item.id}
                  className="p-3 border border-yellow-200 dark:border-yellow-800 rounded-md bg-white dark:bg-gray-900 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => item.link && navigate(item.link)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getTypeIcon(item.type)}
                        <span className="font-medium text-sm">{item.title}</span>
                        <Badge variant="secondary" className="text-xs">
                          {getTypeLabel(item.type)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                      {item.dueDate && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                          Due: {format(new Date(item.dueDate), 'MMM dd, yyyy')}
                        </p>
                      )}
                    </div>
                    {item.link && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(item.link!);
                        }}
                      >
                        View →
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Info Items */}
        {info.length > 0 && (
          <Collapsible open={infoOpen} onOpenChange={setInfoOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-md bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/30 transition-colors">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-blue-900 dark:text-blue-100">
                  Informational ({info.length})
                </span>
              </div>
              {infoOpen ? (
                <ChevronUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-2">
              {info.map((item) => (
                <div
                  key={item.id}
                  className="p-3 border border-blue-200 dark:border-blue-800 rounded-md bg-white dark:bg-gray-900 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => item.link && navigate(item.link)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getTypeIcon(item.type)}
                        <span className="font-medium text-sm">{item.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {getTypeLabel(item.type)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    {item.link && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(item.link!);
                        }}
                      >
                        View →
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}

