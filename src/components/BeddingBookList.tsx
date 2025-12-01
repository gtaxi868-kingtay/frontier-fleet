import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useUnitFilter } from "@/hooks/useUnitFilter";

export function BeddingBookList() {
  const { userUnitId, canSeeAllUnits } = useUnitFilter();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['bedding-book-entries', userUnitId, canSeeAllUnits],
    queryFn: async () => {
      let query = supabase
        .from('bedding_book')
        .select(`
          *,
          soldier:profiles!bedding_book_soldier_id_fkey(name, rank, service_number),
          unit:units(name)
        `)
        .order('check_date', { ascending: false });

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
          <p className="text-center text-muted-foreground">Loading bedding book entries...</p>
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            No bedding book entries found. Create a new entry to get started.
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
            <TableHead>Check Date</TableHead>
            <TableHead>Room</TableHead>
            <TableHead>Soldier</TableHead>
            <TableHead>Sheets</TableHead>
            <TableHead>Pillowcases</TableHead>
            <TableHead>Blankets</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry: any) => (
            <TableRow key={entry.id}>
              <TableCell>
                {entry.check_date ? format(new Date(entry.check_date), 'dd MMM yyyy') : 'N/A'}
              </TableCell>
              <TableCell>{entry.room_id || 'N/A'}</TableCell>
              <TableCell>
                {entry.soldier ? (
                  <div className="font-medium">
                    {entry.soldier.rank} {entry.soldier.name}
                  </div>
                ) : (
                  'N/A'
                )}
              </TableCell>
              <TableCell>
                <Badge variant={entry.sheets_count >= 3 ? 'default' : 'destructive'}>
                  {entry.sheets_count || 0}/3
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={entry.pillowcases_count >= 2 ? 'default' : 'destructive'}>
                  {entry.pillowcases_count || 0}/2
                </Badge>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  Light: {entry.lightweight_blankets || 0}/1, Heavy: {entry.heavyweight_blankets || 0}/1
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={
                  entry.sheets_laundered && entry.blankets_aired ? 'default' :
                  entry.sheets_laundered || entry.blankets_aired ? 'secondary' :
                  'outline'
                }>
                  {entry.sheets_laundered && entry.blankets_aired ? 'Complete' :
                   entry.sheets_laundered || entry.blankets_aired ? 'Partial' :
                   'Pending'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

