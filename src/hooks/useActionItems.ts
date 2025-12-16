import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUnitFilter } from './useUnitFilter';
import { useAuth } from './useAuth';

export interface ActionItem {
  id: string;
  type: 'overdue_item' | 'inspection_due' | 'low_stock' | 'pending_approval' | 'work_ticket_return' | 'unserviceable';
  priority: 'urgent' | 'attention' | 'info';
  title: string;
  description: string;
  module?: string;
  itemId?: string;
  dueDate?: string;
  link?: string;
  count?: number;
}

export function useActionItems() {
  const { applyUnitFilter, canSeeAllUnits, userUnitId } = useUnitFilter();
  const { role } = useAuth();

  const { data: actionItems = [], isLoading } = useQuery({
    queryKey: ['action-items', userUnitId, canSeeAllUnits, role],
    queryFn: async () => {
      const items: ActionItem[] = [];

      // 1. Overdue Items (issued >30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Check tools
      let toolsQuery = supabase
        .from('tools')
        .select('id, tool_id, tool_name, issue_date, issued_to')
        .not('issued_to', 'is', null)
        .lt('issue_date', thirtyDaysAgo.toISOString().split('T')[0]);
      toolsQuery = applyUnitFilter(toolsQuery, { columnName: 'squadron_id' });
      const { data: overdueTools } = await toolsQuery;

      overdueTools?.forEach((tool: any) => {
        const daysOverdue = Math.floor(
          (new Date().getTime() - new Date(tool.issue_date).getTime()) / (1000 * 60 * 60 * 24)
        );
        items.push({
          id: `tool-${tool.id}`,
          type: 'overdue_item',
          priority: daysOverdue > 60 ? 'urgent' : 'attention',
          title: `Tool Overdue: ${tool.tool_id}`,
          description: `${tool.tool_name} has been issued for ${daysOverdue} days`,
          module: 'tools',
          itemId: tool.id,
          link: '/tools',
          dueDate: tool.issue_date,
        });
      });

      // Check weapons
      let weaponsQuery = supabase
        .from('weapons')
        .select('id, weapon_id, weapon_type, issue_date, issued_to')
        .not('issued_to', 'is', null)
        .lt('issue_date', thirtyDaysAgo.toISOString().split('T')[0]);
      weaponsQuery = applyUnitFilter(weaponsQuery, { columnName: 'squadron_id' });
      const { data: overdueWeapons } = await weaponsQuery;

      overdueWeapons?.forEach((weapon: any) => {
        const daysOverdue = Math.floor(
          (new Date().getTime() - new Date(weapon.issue_date).getTime()) / (1000 * 60 * 60 * 24)
        );
        items.push({
          id: `weapon-${weapon.id}`,
          type: 'overdue_item',
          priority: daysOverdue > 60 ? 'urgent' : 'attention',
          title: `Weapon Overdue: ${weapon.weapon_id}`,
          description: `${weapon.weapon_type} has been issued for ${daysOverdue} days`,
          module: 'weapons',
          itemId: weapon.id,
          link: '/weapons',
          dueDate: weapon.issue_date,
        });
      });

      // 2. Pending Approvals (for roles that can approve)
      if (role === 'CO' || role === 'S4' || role === 'OC') {
        const { data: pendingRequests } = await supabase
          .from('inventory_requests')
          .select('id, item_name')
          .eq('status', 'pending')
          .order('created_at', { ascending: true });

        if (pendingRequests && pendingRequests.length > 0) {
          items.push({
            id: 'pending-approvals',
            type: 'pending_approval',
            priority: pendingRequests.length > 5 ? 'urgent' : 'attention',
            title: `${pendingRequests.length} Pending Approval${pendingRequests.length !== 1 ? 's' : ''}`,
            description: `${pendingRequests.length} inventory request${pendingRequests.length !== 1 ? 's' : ''} awaiting your approval`,
            module: 'requests',
            link: '/inventory-requests',
            count: pendingRequests.length,
          });
        }
      }

      // 3. Unserviceable Items (needs repair/replacement)
      let unserviceableToolsQuery = supabase
        .from('tools')
        .select('id, tool_id, tool_name')
        .eq('serviceable', false);
      unserviceableToolsQuery = applyUnitFilter(unserviceableToolsQuery, { columnName: 'squadron_id' });
      const { data: unserviceableTools } = await unserviceableToolsQuery;

      if (unserviceableTools && unserviceableTools.length > 0) {
        items.push({
          id: 'unserviceable-tools',
          type: 'unserviceable',
          priority: unserviceableTools.length > 10 ? 'urgent' : 'attention',
          title: `${unserviceableTools.length} Unserviceable Tool${unserviceableTools.length !== 1 ? 's' : ''}`,
          description: `${unserviceableTools.length} tool${unserviceableTools.length !== 1 ? 's' : ''} marked as unserviceable and need attention`,
          module: 'tools',
          link: '/tools',
          count: unserviceableTools.length,
        });
      }

      // Sort by priority (urgent first, then attention, then info)
      const priorityOrder = { urgent: 0, attention: 1, info: 2 };
      items.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

      return items;
    },
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  const urgent = actionItems.filter(item => item.priority === 'urgent');
  const attention = actionItems.filter(item => item.priority === 'attention');
  const info = actionItems.filter(item => item.priority === 'info');

  return {
    all: actionItems,
    urgent,
    attention,
    info,
    isLoading,
    total: actionItems.length,
  };
}

