import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useUnitFilter } from "@/hooks/useUnitFilter";

export function TailorBookList() {
  const { userUnitId, canSeeAllUnits } = useUnitFilter();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['tailor-book-entries', userUnitId, canSeeAllUnits],
    queryFn: async () => {
      let query = supabase
        .from('tailor_book')
        .select(`
          *,
          soldier:profiles!tailor_book_soldier_id_fkey(name, rank, service_number),
          unit:units(name)
        `)
        .order('submitted_date', { ascending: false });

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
          <p className="text-center text-muted-foreground">Loading tailor book entries...</p>
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            No tailor book entries found. Create a new entry to get started.
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
            <TableHead>Soldier</TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Work Type</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tailor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry: any) => (
            <TableRow key={entry.id}>
              <TableCell className="font-mono">{entry.entry_number}</TableCell>
              <TableCell>
                <div className="font-medium">
                  {entry.soldier?.rank} {entry.soldier?.name}
                </div>
              </TableCell>
              <TableCell>{entry.item_name}</TableCell>
              <TableCell>
                <Badge variant="outline">{entry.work_type || 'N/A'}</Badge>
              </TableCell>
              <TableCell>
                {entry.submitted_date ? format(new Date(entry.submitted_date), 'dd MMM yyyy') : 'N/A'}
              </TableCell>
              <TableCell>
                <Badge variant={
                  entry.work_status === 'completed' ? 'default' :
                  entry.work_status === 'returned' ? 'default' :
                  entry.work_status === 'with_tailor' ? 'secondary' :
                  'outline'
                }>
                  {entry.work_status || 'pending'}
                </Badge>
              </TableCell>
              <TableCell>{entry.tailor_assigned || 'N/A'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

