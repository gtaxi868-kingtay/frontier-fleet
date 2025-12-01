import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useUnitFilter } from "@/hooks/useUnitFilter";
import { StatusBadge } from "@/components/StatusBadge";
import { Eye } from "lucide-react";

interface KitInspectionListProps {
  onViewDetail: (inspection: any) => void;
}

export function KitInspectionList({ onViewDetail }: KitInspectionListProps) {
  const { userUnitId, canSeeAllUnits } = useUnitFilter();

  const { data: inspections = [], isLoading } = useQuery({
    queryKey: ['kit-inspections', userUnitId, canSeeAllUnits],
    queryFn: async () => {
      let query = supabase
        .from('kit_inspections')
        .select(`
          *,
          soldier:profiles!kit_inspections_soldier_id_fkey(name, rank, service_number, unit_id),
          inspector:profiles!kit_inspections_inspected_by_id_fkey(name, rank),
          unit:units(name)
        `)
        .order('inspection_date', { ascending: false });

      if (!canSeeAllUnits && userUnitId) {
        query = query.eq('unit_id', userUnitId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return <p className="text-muted-foreground text-center py-8">Loading inspections...</p>;
  }

  if (inspections.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No kit inspections found.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Soldier</TableHead>
          <TableHead>Inspector</TableHead>
          <TableHead>At Scale</TableHead>
          <TableHead>Below Scale</TableHead>
          <TableHead>Deficiencies</TableHead>
          <TableHead>Follow-up</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {inspections.map((inspection: any) => (
          <TableRow key={inspection.id}>
            <TableCell>
              {format(new Date(inspection.inspection_date), 'dd MMM yyyy')}
            </TableCell>
            <TableCell>
              {inspection.soldier?.rank || ''} {inspection.soldier?.name || 'N/A'}
            </TableCell>
            <TableCell>
              {inspection.inspector?.rank || ''} {inspection.inspector?.name || 'N/A'}
            </TableCell>
            <TableCell>
              <Badge variant="default">{inspection.items_at_scale || 0}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant="destructive">{inspection.items_below_scale || 0}</Badge>
            </TableCell>
            <TableCell>
              {inspection.deficiencies?.length || 0}
            </TableCell>
            <TableCell>
              <StatusBadge
                status={inspection.follow_up_required ? 'pending' : 'completed'}
                type="inspection"
              />
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetail(inspection)}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

