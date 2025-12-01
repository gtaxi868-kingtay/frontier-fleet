import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Building, Package, Eye } from "lucide-react";
import { useUnitFilter } from "@/hooks/useUnitFilter";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface RoomDistributionListProps {
  onViewDetail?: (distribution: any) => void;
}

export function RoomDistributionList({ onViewDetail }: RoomDistributionListProps) {
  const { userUnitId, canSeeAllUnits } = useUnitFilter();
  const [selectedDistribution, setSelectedDistribution] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: distributions = [], isLoading } = useQuery({
    queryKey: ['barracks-stores-distributions', userUnitId, canSeeAllUnits],
    queryFn: async () => {
      let query = supabase
        .from('barracks_stores_distribution')
        .select(`
          *,
          barracks_store:barracks_stores!barracks_stores_distribution_barracks_store_id_fkey(
            id,
            item_id,
            item_name,
            item_type,
            unit_id,
            unit:units(name)
          ),
          room:room_inventory!barracks_stores_distribution_room_id_fkey(
            id,
            room_id,
            room_type,
            platoon_company
          )
        `)
        .order('issued_date', { ascending: false });

      // Apply unit filter if needed
      if (!canSeeAllUnits && userUnitId) {
        // Filter by unit through barracks_store relationship
        query = query.eq('barracks_store.unit_id', userUnitId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const handleViewDetail = (distribution: any) => {
    setSelectedDistribution(distribution);
    setDetailOpen(true);
    if (onViewDetail) {
      onViewDetail(distribution);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading distributions...</p>
        </CardContent>
      </Card>
    );
  }

  if (distributions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            No room distributions found. Distribute items to rooms to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Room Distributions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Issued Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {distributions.map((dist: any) => (
                  <TableRow key={dist.id}>
                    <TableCell>
                      <div className="font-medium">
                        {dist.barracks_store?.item_name || 'Unknown'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {dist.barracks_store?.item_id || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {dist.room?.room_id || dist.room_identifier || 'Unknown'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {dist.room?.room_type || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{dist.quantity || 0}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        dist.condition_current === 'serviceable' ? 'default' :
                        dist.condition_current === 'unserviceable' ? 'destructive' : 'secondary'
                      }>
                        {dist.condition_current || dist.condition_on_issue || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {dist.issued_date ? format(new Date(dist.issued_date), 'dd MMM yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {dist.returned_date ? (
                        <Badge variant="outline">Returned</Badge>
                      ) : (
                        <Badge variant="default">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetail(dist)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Distribution Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Distribution Details</DialogTitle>
          </DialogHeader>
          {selectedDistribution && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Item</p>
                  <p className="font-medium">
                    {selectedDistribution.barracks_store?.item_name || 'Unknown'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedDistribution.barracks_store?.item_id || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Room</p>
                  <p className="font-medium">
                    {selectedDistribution.room?.room_id || selectedDistribution.room_identifier || 'Unknown'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedDistribution.room?.room_type || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="font-medium">{selectedDistribution.quantity || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Condition</p>
                  <Badge variant={
                    selectedDistribution.condition_current === 'serviceable' ? 'default' :
                    selectedDistribution.condition_current === 'unserviceable' ? 'destructive' : 'secondary'
                  }>
                    {selectedDistribution.condition_current || selectedDistribution.condition_on_issue || 'N/A'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Issued Date</p>
                  <p className="font-medium">
                    {selectedDistribution.issued_date 
                      ? format(new Date(selectedDistribution.issued_date), 'dd MMM yyyy')
                      : 'N/A'}
                  </p>
                </div>
                {selectedDistribution.returned_date && (
                  <div>
                    <p className="text-sm text-muted-foreground">Returned Date</p>
                    <p className="font-medium">
                      {format(new Date(selectedDistribution.returned_date), 'dd MMM yyyy')}
                    </p>
                  </div>
                )}
              </div>
              {selectedDistribution.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm">{selectedDistribution.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

