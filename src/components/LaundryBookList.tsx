import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useUnitFilter } from "@/hooks/useUnitFilter";

export function LaundryBookList() {
  const { userUnitId, canSeeAllUnits } = useUnitFilter();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['laundry-book-entries', userUnitId, canSeeAllUnits],
    queryFn: async () => {
      let query = supabase
        .from('laundry_book')
        .select(`
          *,
          soldier:profiles!laundry_book_soldier_id_fkey(name, rank, service_number),
          unit:units(name)
        `)
        .order('entry_date', { ascending: false })
        .order('handed_in_date', { ascending: false });

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
          <p className="text-center text-muted-foreground">Loading laundry entries...</p>
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            No laundry entries found. Create a new entry to get started.
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
            <TableHead>Entry Date</TableHead>
            <TableHead>Soldier</TableHead>
            <TableHead>Bundle #</TableHead>
            <TableHead>Articles</TableHead>
            <TableHead>KD Garments</TableHead>
            <TableHead>Handed In</TableHead>
            <TableHead>Collected</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry: any) => (
            <TableRow key={entry.id}>
              <TableCell>
                {entry.entry_date ? format(new Date(entry.entry_date), 'dd MMM yyyy') : 'N/A'}
              </TableCell>
              <TableCell>
                <div className="font-medium">
                  {entry.soldier?.rank} {entry.soldier?.name}
                </div>
                {entry.soldier?.service_number && (
                  <div className="text-sm text-muted-foreground">
                    {entry.soldier.service_number}
                  </div>
                )}
              </TableCell>
              <TableCell>{entry.bundle_number || 'N/A'}</TableCell>
              <TableCell>
                <Badge variant="outline">{entry.articles_count || 0}</Badge>
              </TableCell>
              <TableCell>
                {entry.kd_garments_count ? (
                  <Badge variant="secondary">{entry.kd_garments_count}</Badge>
                ) : (
                  'N/A'
                )}
              </TableCell>
              <TableCell>
                {entry.handed_in_date ? format(new Date(entry.handed_in_date), 'dd MMM yyyy') : 'N/A'}
                {entry.handed_in_by && (
                  <div className="text-xs text-muted-foreground">by {entry.handed_in_by}</div>
                )}
              </TableCell>
              <TableCell>
                {entry.collected_date ? (
                  format(new Date(entry.collected_date), 'dd MMM yyyy')
                ) : (
                  <Badge variant="outline">Pending</Badge>
                )}
              </TableCell>
              <TableCell>
                {entry.weekly_total && (
                  <Badge variant="default">Weekly Total</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

