import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Shirt } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ItemDetailDialog } from "@/components/ItemDetailDialog";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { useUnitFilter } from "@/hooks/useUnitFilter";
import { BulkUploadDialog } from "@/components/BulkUploadDialog";
import { ClothingEquipmentIssueDialog } from "@/components/ClothingEquipmentIssueDialog";
import { KitInspectionDialog } from "@/components/KitInspectionDialog";
import { KitInspectionList } from "@/components/KitInspectionList";
import { KitInspectionDetail } from "@/components/KitInspectionDetail";
import { MonthlyExchangeDialog } from "@/components/MonthlyExchangeDialog";
import { MonthlyExchangeList } from "@/components/MonthlyExchangeList";
import { MonthlyExchangeDetail } from "@/components/MonthlyExchangeDetail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";

export default function ClothingEquipment() {
  const { role } = useAuth();
  const { applyUnitFilter, canSeeAllUnits, userUnitId } = useUnitFilter();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [inspectionDialogOpen, setInspectionDialogOpen] = useState(false);
  const [inspectionDetailOpen, setInspectionDetailOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<any>(null);
  const [exchangeDialogOpen, setExchangeDialogOpen] = useState(false);
  const [exchangeDetailOpen, setExchangeDetailOpen] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const canManage = role === 'S4' || role === 'SQMS' || role === 'S4_ADMIN';

  // Fetch clothing equipment issues
  const { data: issues = [], refetch: refetchIssues } = useQuery({
    queryKey: ['clothing_equipment_issues', userUnitId, canSeeAllUnits],
    queryFn: async () => {
      let query = supabase
        .from('clothing_equipment_issues')
        .select(`
          *,
          soldier:profiles!clothing_equipment_issues_soldier_id_fkey(name, rank, unit_id),
          unit:units(name)
        `)
        .order('issue_date', { ascending: false });

      // Apply unit filter
      if (!canSeeAllUnits && userUnitId) {
        query = query.eq('soldier.unit_id', userUnitId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch clothing scales
  const { data: scales = [] } = useQuery({
    queryKey: ['clothing_equipment_scale'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clothing_equipment_scale')
        .select('*')
        .order('rank')
        .order('item_name');
      
      if (error) throw error;
      return data || [];
    },
  });

  const filteredIssues = issues.filter((issue: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      issue.issue_number?.toLowerCase().includes(searchLower) ||
      issue.item_name?.toLowerCase().includes(searchLower) ||
      issue.soldier?.name?.toLowerCase().includes(searchLower) ||
      issue.soldier?.rank?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Clothing, Equipment & Necessaries (TTR Form 21)
            </h1>
            <p className="text-muted-foreground mt-1">
              Track clothing and equipment issues, returns, and exchanges with scale enforcement
            </p>
          </div>
          {canManage && (
            <div className="flex gap-2">
              {(role === 'S4' || role === 'S4_ADMIN') && <BulkUploadDialog module="clothing_equipment_issues" moduleName="Clothing Equipment" />}
              <Button variant="default" className="gap-2" onClick={() => setIssueDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Issue Item
              </Button>
            </div>
          )}
        </div>

        <Tabs defaultValue="issues" className="space-y-4">
          <TabsList>
            <TabsTrigger value="issues">Issues & Returns</TabsTrigger>
            <TabsTrigger value="scale">Clothing Scale</TabsTrigger>
            <TabsTrigger value="exchanges">Monthly Exchanges</TabsTrigger>
            <TabsTrigger value="inspections">Kit Inspections</TabsTrigger>
          </TabsList>

          <TabsContent value="issues" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Clothing & Equipment Issues</CardTitle>
                    <CardDescription>Track all issues and returns (TTR Form 21)</CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search issues..." 
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredIssues.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    {searchTerm ? "No issues match your search." : "No clothing/equipment issues found."}
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Issue #</TableHead>
                        <TableHead>Soldier</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Issue Date</TableHead>
                        <TableHead>Return Date</TableHead>
                        <TableHead>Marked</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredIssues.map((issue: any) => (
                        <TableRow key={issue.id}>
                          <TableCell className="font-medium">{issue.issue_number}</TableCell>
                          <TableCell>
                            {issue.soldier?.rank || ''} {issue.soldier?.name || 'N/A'}
                          </TableCell>
                          <TableCell>{issue.item_name}</TableCell>
                          <TableCell>
                            {issue.issue_date ? format(new Date(issue.issue_date), 'MMM dd, yyyy') : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {issue.return_date ? format(new Date(issue.return_date), 'MMM dd, yyyy') : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={issue.regimental_number_marked ? 'default' : 'destructive'}>
                              {issue.regimental_number_marked ? 'Yes' : 'No'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <StatusBadge
                              status={issue.return_date ? 'completed' : 'issued'}
                              type={issue.return_date ? 'inspection' : 'availability'}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedItem(issue);
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
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scale" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Clothing & Equipment Scale</CardTitle>
                <CardDescription>Authorized quantities per rank (cannot be exceeded)</CardDescription>
              </CardHeader>
              <CardContent>
                {scales.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No clothing scale defined. Add scale entries to get started.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Life Expectancy</TableHead>
                        <TableHead>Category</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scales.map((scale: any) => (
                        <TableRow key={scale.id}>
                          <TableCell className="font-medium">{scale.rank}</TableCell>
                          <TableCell>{scale.item_name}</TableCell>
                          <TableCell>{scale.quantity_authorized}</TableCell>
                          <TableCell>
                            {scale.life_expectancy_months ? `${scale.life_expectancy_months} months` : 'N/A'}
                          </TableCell>
                          <TableCell>{scale.category || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exchanges">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Monthly Exchanges</CardTitle>
                    <CardDescription>Track monthly clothing and equipment exchanges</CardDescription>
                  </div>
                  {canManage && (
                    <Button onClick={() => setExchangeDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Exchange
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <MonthlyExchangeList
                  onViewDetail={(exchange) => {
                    setSelectedExchange(exchange);
                    setExchangeDetailOpen(true);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inspections">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Kit Inspections</CardTitle>
                    <CardDescription>Monthly kit inspections by Coy 2IC or Platoon Commander</CardDescription>
                  </div>
                  {canManage && (
                    <Button onClick={() => setInspectionDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Inspection
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <KitInspectionList
                  onViewDetail={(inspection) => {
                    setSelectedInspection(inspection);
                    setInspectionDetailOpen(true);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <ItemDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          title={selectedItem ? `Issue ${selectedItem.issue_number}` : ''}
          data={selectedItem}
        />

        <ClothingEquipmentIssueDialog
          open={issueDialogOpen}
          onOpenChange={setIssueDialogOpen}
          onSuccess={() => {
            refetchIssues();
            setIssueDialogOpen(false);
          }}
        />

        <KitInspectionDialog
          open={inspectionDialogOpen}
          onOpenChange={setInspectionDialogOpen}
          onSuccess={() => {
            setInspectionDialogOpen(false);
          }}
        />

        {selectedInspection && (
          <KitInspectionDetail
            open={inspectionDetailOpen}
            onOpenChange={setInspectionDetailOpen}
            inspection={selectedInspection}
            onUpdate={() => {
              setSelectedInspection(null);
            }}
          />
        )}

        <MonthlyExchangeDialog
          open={exchangeDialogOpen}
          onOpenChange={setExchangeDialogOpen}
          onSuccess={() => {
            setExchangeDialogOpen(false);
          }}
        />

        {selectedExchange && (
          <MonthlyExchangeDetail
            open={exchangeDetailOpen}
            onOpenChange={setExchangeDetailOpen}
            exchange={selectedExchange}
            onUpdate={() => {
              setSelectedExchange(null);
            }}
          />
        )}
      </main>
    </div>
  );
}

