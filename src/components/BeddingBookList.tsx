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
        query = query.eq('squadron_id', userUnitId);
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
            <TableHead>Soldier</TableHead>
            <TableHead>Mattress</TableHead>
            <TableHead>Blanket</TableHead>
            <TableHead>Pillow</TableHead>
            <TableHead>Bedsheet</TableHead>
            <TableHead>Remarks</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry: any) => (
            <TableRow key={entry.id}>
              <TableCell>
                {entry.check_date ? format(new Date(entry.check_date), 'dd MMM yyyy') : 'N/A'}
              </TableCell>
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
                <Badge variant={entry.mattress_condition === 'Good' ? 'default' : 'destructive'}>
                  {entry.mattress_condition || 'N/A'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={entry.blanket_condition === 'Good' ? 'default' : 'destructive'}>
                  {entry.blanket_condition || 'N/A'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={entry.pillow_condition === 'Good' ? 'default' : 'destructive'}>
                  {entry.pillow_condition || 'N/A'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={entry.bedsheet_condition === 'Good' ? 'default' : 'destructive'}>
                  {entry.bedsheet_condition || 'N/A'}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {entry.remarks || '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

