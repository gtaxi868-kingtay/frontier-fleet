import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileText, Filter, Search } from "lucide-react";

interface AuditLog {
  id: string;
  user_id: string | null;
  table_name: string;
  record_id: string;
  action: string;
  old_values: any;
  new_values: any;
  changed_fields: string[] | null;
  created_at: string;
  user_name?: string;
  user_rank?: string;
}

export default function AuditTrail() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [tableFilter, setTableFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, tableFilter, actionFilter]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const { data: auditData, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) throw error;

      // Fetch user profiles separately
      const userIds = [...new Set(auditData?.map(log => log.user_id).filter(Boolean))] as string[];
      
      let profiles: any = {};
      if (userIds.length > 0) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, name, rank")
          .in("id", userIds);
        
        profileData?.forEach(profile => {
          profiles[profile.id] = profile;
        });
      }

      // Merge profiles with audit logs
      const enrichedLogs = auditData?.map(log => ({
        ...log,
        user_name: log.user_id ? profiles[log.user_id]?.name : null,
        user_rank: log.user_id ? profiles[log.user_id]?.rank : null,
      })) || [];

      setLogs(enrichedLogs);
    } catch (error: any) {
      toast.error("Failed to load audit logs");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.record_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (tableFilter !== "all") {
      filtered = filtered.filter((log) => log.table_name === tableFilter);
    }

    if (actionFilter !== "all") {
      filtered = filtered.filter((log) => log.action === actionFilter);
    }

    setFilteredLogs(filtered);
  };

  const getActionBadge = (action: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      INSERT: "default",
      UPDATE: "secondary",
      DELETE: "destructive",
    };
    return <Badge variant={variants[action] || "default"}>{action}</Badge>;
  };

  const formatTableName = (tableName: string) => {
    return tableName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const renderValueComparison = (log: AuditLog) => {
    if (log.action === "INSERT") {
      return (
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">New Record Created:</h4>
          <pre className="bg-muted p-3 rounded-lg text-xs overflow-auto max-h-96">
            {JSON.stringify(log.new_values, null, 2)}
          </pre>
        </div>
      );
    }

    if (log.action === "DELETE") {
      return (
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Record Deleted:</h4>
          <pre className="bg-muted p-3 rounded-lg text-xs overflow-auto max-h-96">
            {JSON.stringify(log.old_values, null, 2)}
          </pre>
        </div>
      );
    }

    if (log.action === "UPDATE" && log.changed_fields?.length > 0) {
      return (
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Changed Fields:</h4>
          {log.changed_fields.map((field) => (
            <div key={field} className="border rounded-lg p-3 space-y-2">
              <div className="font-medium text-sm">{field}</div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-muted-foreground mb-1">Before:</div>
                  <pre className="bg-destructive/10 p-2 rounded">
                    {JSON.stringify(log.old_values?.[field], null, 2)}
                  </pre>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">After:</div>
                  <pre className="bg-primary/10 p-2 rounded">
                    {JSON.stringify(log.new_values?.[field], null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return <div className="text-muted-foreground text-sm">No changes recorded</div>;
  };

  const uniqueTables = Array.from(new Set(logs.map((log) => log.table_name))).sort();

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Audit Trail
          </h1>
          <p className="text-muted-foreground">
            Complete history of all inventory changes for compliance tracking
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            <CardDescription>Filter audit logs by table, action, or search term</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user, table, or record ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={tableFilter} onValueChange={setTableFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Tables" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tables</SelectItem>
                  {uniqueTables.map((table) => (
                    <SelectItem key={table} value={table}>
                      {formatTableName(table)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="INSERT">Insert</SelectItem>
                  <SelectItem value="UPDATE">Update</SelectItem>
                  <SelectItem value="DELETE">Delete</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={fetchAuditLogs}>
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Changes ({filteredLogs.length})</CardTitle>
            <CardDescription>
              Showing last 500 audit log entries
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading audit logs...</div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No audit logs found</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Table</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Record ID</TableHead>
                      <TableHead>Changes</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs">
                          {format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss")}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {log.user_name || "System"}
                            {log.user_rank && (
                              <div className="text-xs text-muted-foreground">{log.user_rank}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{formatTableName(log.table_name)}</TableCell>
                        <TableCell>{getActionBadge(log.action)}</TableCell>
                        <TableCell className="font-mono text-xs">{log.record_id.slice(0, 8)}...</TableCell>
                        <TableCell>
                          {log.changed_fields?.length > 0 ? (
                            <Badge variant="outline">{log.changed_fields.length} fields</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedLog(log);
                              setDetailDialogOpen(true);
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              {selectedLog && (
                <>
                  {getActionBadge(selectedLog.action)} on {formatTableName(selectedLog.table_name)} at{" "}
                  {format(new Date(selectedLog.created_at), "PPpp")}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4 pr-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">User:</span>{" "}
                    {selectedLog.user_name || "System"}
                  </div>
                  <div>
                    <span className="font-semibold">Rank:</span>{" "}
                    {selectedLog.user_rank || "N/A"}
                  </div>
                  <div>
                    <span className="font-semibold">Record ID:</span>{" "}
                    <code className="text-xs">{selectedLog.record_id}</code>
                  </div>
                  <div>
                    <span className="font-semibold">Table:</span> {formatTableName(selectedLog.table_name)}
                  </div>
                </div>

                <div className="border-t pt-4">
                  {renderValueComparison(selectedLog)}
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
