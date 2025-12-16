import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useUnitFilter } from "@/hooks/useUnitFilter";

export function BootBookList() {
  const { userUnitId, canSeeAllUnits } = useUnitFilter();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['boot-book-entries', userUnitId, canSeeAllUnits],
    queryFn: async () => {
      let query = supabase
        .from('boot_book')
        .select(`
          *,
          soldier:profiles!boot_book_soldier_id_fkey(name, rank, service_number),
          unit:units(name)
        `)
        .order('issue_date', { ascending: false });

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
          <p className="text-center text-muted-foreground">Loading boot book entries...</p>
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            No boot book entries found. Create a new entry to get started.
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
            <TableHead>Boot Type</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Issue Date</TableHead>
            <TableHead>Condition</TableHead>
            <TableHead>Remarks</TableHead>
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
              <TableCell>
                <Badge variant="outline">{entry.boot_type || 'N/A'}</Badge>
              </TableCell>
              <TableCell>{entry.boot_size || 'N/A'}</TableCell>
              <TableCell>
                {entry.issue_date ? format(new Date(entry.issue_date), 'dd MMM yyyy') : 'N/A'}
              </TableCell>
              <TableCell>
                <Badge variant={entry.condition_issue === 'Good' ? 'default' : 'secondary'}>
                  {entry.condition_issue || 'N/A'}
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

