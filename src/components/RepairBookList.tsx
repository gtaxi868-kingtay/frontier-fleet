import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useUnitFilter } from "@/hooks/useUnitFilter";

export function RepairBookList() {
  const { userUnitId, canSeeAllUnits } = useUnitFilter();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['repair-book-entries', userUnitId, canSeeAllUnits],
    queryFn: async () => {
      let query = supabase
        .from('repair_book')
        .select(`
          *,
          caused_by:profiles!repair_book_caused_by_id_fkey(name, rank),
          unit:units(name)
        `)
        .order('reported_date', { ascending: false });

      if (!canSeeAllUnits && userUnitId) {
        query = query.eq('unit_id', userUnitId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading repair book entries...</p>
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            No repair book entries found. Create a new entry to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Entry #</TableHead>
            <TableHead>Room</TableHead>
            <TableHead>Damage Type</TableHead>
            <TableHead>Reported</TableHead>
            <TableHead>Caused By</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Cost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry: any) => (
            <TableRow key={entry.id}>
              <TableCell className="font-mono">{entry.entry_number}</TableCell>
              <TableCell>{entry.room_id || 'N/A'}</TableCell>
              <TableCell>
                <Badge variant="outline">{entry.damage_type || 'N/A'}</Badge>
              </TableCell>
              <TableCell>
                {entry.reported_date ? format(new Date(entry.reported_date), 'dd MMM yyyy') : 'N/A'}
              </TableCell>
              <TableCell>
                {entry.caused_by ? (
                  <div>
                    {entry.caused_by.rank} {entry.caused_by.name}
                  </div>
                ) : entry.caused_by_name ? (
                  entry.caused_by_name
                ) : (
                  'Unknown'
                )}
              </TableCell>
              <TableCell>
                <Badge variant={
                  entry.status === 'completed' ? 'default' :
                  entry.status === 'closed' ? 'default' :
                  entry.status === 'repairing' ? 'secondary' :
                  'outline'
                }>
                  {entry.status || 'reported'}
                </Badge>
              </TableCell>
              <TableCell>
                {entry.repair_cost ? `$${entry.repair_cost.toFixed(2)}` : 'N/A'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

