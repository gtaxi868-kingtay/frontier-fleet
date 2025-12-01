import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useUnitFilter } from "@/hooks/useUnitFilter";
import { StatusBadge } from "@/components/StatusBadge";
import { Eye } from "lucide-react";

interface MonthlyExchangeListProps {
  onViewDetail: (exchange: any) => void;
}

export function MonthlyExchangeList({ onViewDetail }: MonthlyExchangeListProps) {
  const { userUnitId, canSeeAllUnits } = useUnitFilter();

  const { data: exchanges = [], isLoading } = useQuery({
    queryKey: ['monthly-exchanges', userUnitId, canSeeAllUnits],
    queryFn: async () => {
      let query = supabase
        .from('clothing_exchanges')
        .select(`
          *,
          unit:units(name),
          processor:profiles!clothing_exchanges_processed_by_id_fkey(name, rank),
          qm_reviewer:profiles!clothing_exchanges_qm_reviewed_by_id_fkey(name, rank)
        `)
        .order('exchange_date', { ascending: false });

      if (!canSeeAllUnits && userUnitId) {
        query = query.eq('unit_id', userUnitId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return <p className="text-muted-foreground text-center py-8">Loading exchanges...</p>;
  }

  if (exchanges.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No monthly exchanges found.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Month</TableHead>
          <TableHead>Item</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>QM Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {exchanges.map((exchange: any) => (
          <TableRow key={exchange.id}>
            <TableCell>
              {format(new Date(exchange.exchange_month), 'MMM yyyy')}
            </TableCell>
            <TableCell>{exchange.item_name}</TableCell>
            <TableCell>{exchange.quantity_exchanged}</TableCell>
            <TableCell>
              <Badge variant="outline" className="capitalize">
                {exchange.exchange_reason || 'N/A'}
              </Badge>
            </TableCell>
            <TableCell>
              {format(new Date(exchange.exchange_date), 'dd MMM yyyy')}
            </TableCell>
            <TableCell>
              {exchange.qm_approved ? (
                <Badge variant="default">Approved</Badge>
              ) : exchange.qm_reviewed ? (
                <Badge variant="secondary">Reviewed</Badge>
              ) : (
                <Badge variant="outline">Pending</Badge>
              )}
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetail(exchange)}
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

