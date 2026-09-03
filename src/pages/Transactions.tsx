import { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RecordTransactionDialog } from '@/components/RecordTransactionDialog';
import { ArrowLeftRight, Plus, User } from 'lucide-react';
import { format } from 'date-fns';

export default function Transactions() {
  const { canManageInventory, getViewScope } = usePermissions();
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterTable, setFilterTable] = useState<string>('all');

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions-detailed', filterType, filterTable],
    queryFn: async () => {
      let query = supabase
        .from('transactions_detailed')
        .select(`
          *,
          from_user:profiles!transactions_detailed_from_user_id_fkey(name, rank),
          to_user:profiles!transactions_detailed_to_user_id_fkey(name, rank),
          issued_by:profiles!transactions_detailed_issued_by_id_fkey(name, rank),
          unit:units(name)
        `)
        .order('created_at', { ascending: false });

      if (filterType !== 'all') {
        query = query.eq('transaction_type', filterType);
      }
      if (filterTable !== 'all') {
        query = query.eq('item_table', filterTable);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const getTransactionTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      issue: 'bg-blue-500/10 text-blue-600',
      return: 'bg-green-500/10 text-green-600',
      transfer: 'bg-purple-500/10 text-purple-600',
      disposal: 'bg-red-500/10 text-red-600',
    };
    return <Badge variant="outline" className={colors[type] || ''}>{type.toUpperCase()}</Badge>;
  };

  const getServiceabilityBadge = (serviceability: string | null) => {
    if (!serviceability) return null;
    const colors: Record<string, string> = {
      Serviceable: 'bg-green-500/10 text-green-600',
      Unserviceable: 'bg-red-500/10 text-red-600',
      'Under Repair': 'bg-yellow-500/10 text-yellow-600',
    };
    return <Badge variant="outline" className={colors[serviceability] || ''}>{serviceability}</Badge>;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading transactions...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Transaction History</h1>
          <p className="text-muted-foreground mt-1">
            Track all inventory movements and transfers
          </p>
        </div>
        {canManageInventory && (
          <Button onClick={() => setRecordDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Record Transaction
          </Button>
        )}
      </div>

      <div className="flex gap-4">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="issue">Issue</SelectItem>
            <SelectItem value="return">Return</SelectItem>
            <SelectItem value="transfer">Transfer</SelectItem>
            <SelectItem value="disposal">Disposal</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterTable} onValueChange={setFilterTable}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="weapons">Weapons</SelectItem>
            <SelectItem value="vehicles">Vehicles</SelectItem>
            <SelectItem value="tools">Tools</SelectItem>
            <SelectItem value="engineer_equipment">Engineer Equipment</SelectItem>
            <SelectItem value="plant_machinery">Plant Machinery</SelectItem>
            <SelectItem value="ppe">PPE</SelectItem>
            <SelectItem value="uniforms">Uniforms</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {transactions?.map((transaction) => (
          <Card key={transaction.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <ArrowLeftRight className="w-5 h-5" />
                    {transaction.item_name || 'Unknown Item'}
                    {getTransactionTypeBadge(transaction.transaction_type)}
                  </CardTitle>
                  <CardDescription>
                    {format(new Date(transaction.created_at), 'PPp')}
                  </CardDescription>
                </div>
                {transaction.serviceability && getServiceabilityBadge(transaction.serviceability)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Category:</span>
                  <p className="font-medium capitalize">{transaction.item_table.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Quantity:</span>
                  <p className="font-medium">{transaction.quantity}</p>
                </div>
                {transaction.from_user && (
                  <div>
                    <span className="text-muted-foreground">From:</span>
                    <p className="font-medium flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {transaction.from_user.rank} {transaction.from_user.name}
                    </p>
                  </div>
                )}
                {transaction.to_user && (
                  <div>
                    <span className="text-muted-foreground">To:</span>
                    <p className="font-medium flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {transaction.to_user.rank} {transaction.to_user.name}
                    </p>
                  </div>
                )}
              </div>

              {transaction.issued_by && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                  Recorded by: {transaction.issued_by.rank} {transaction.issued_by.name}
                </div>
              )}

              {transaction.condition_issue && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Condition on Issue:</span>
                  <p className="mt-1">{transaction.condition_issue}</p>
                </div>
              )}

              {transaction.condition_return && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Condition on Return:</span>
                  <p className="mt-1">{transaction.condition_return}</p>
                </div>
              )}

              {transaction.notes && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Notes:</span>
                  <p className="mt-1">{transaction.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {transactions?.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ArrowLeftRight className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No transactions found</p>
            </CardContent>
          </Card>
        )}
      </div>

      <RecordTransactionDialog open={recordDialogOpen} onOpenChange={setRecordDialogOpen} />
    </div>
  );
}
