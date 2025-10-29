import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AlertCheck {
  table: string;
  condition: string;
  message: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    console.log('[Inventory Alerts] Starting inventory check...');

    // Define alert conditions
    const alertChecks: AlertCheck[] = [
      // Low stock alerts for general inventory
      {
        table: 'general_inventory',
        condition: 'qty_on_hand <= reorder_level',
        message: 'Low stock level detected',
        priority: 'High',
      },
      // Unserviceable weapons
      {
        table: 'weapons',
        condition: 'serviceable = false',
        message: 'Unserviceable weapons requiring attention',
        priority: 'High',
      },
      // Vehicles due for service
      {
        table: 'vehicles',
        condition: 'next_service_due <= CURRENT_DATE + INTERVAL \'7 days\'',
        message: 'Vehicle service due within 7 days',
        priority: 'Medium',
      },
      // Tools requiring inspection
      {
        table: 'tools',
        condition: 'next_inspection_due <= CURRENT_DATE',
        message: 'Tool inspection overdue',
        priority: 'High',
      },
      // Engineer equipment requiring inspection
      {
        table: 'engineer_equipment',
        condition: 'next_inspection_due <= CURRENT_DATE',
        message: 'Engineer equipment inspection overdue',
        priority: 'High',
      },
      // Plant machinery requiring service
      {
        table: 'plant_machinery',
        condition: 'next_service_due <= CURRENT_DATE',
        message: 'Plant machinery service overdue',
        priority: 'Critical',
      },
      // MT facilities not operational
      {
        table: 'mt_facilities',
        condition: 'status != \'Operational\'',
        message: 'MT facility not operational',
        priority: 'Medium',
      },
    ];

    const alerts: any[] = [];

    // Check each condition
    for (const check of alertChecks) {
      console.log(`[Inventory Alerts] Checking ${check.table}...`);

      // Query the table with the condition
      const { data, error } = await supabaseClient
        .from(check.table)
        .select('*')
        .filter('id', 'not.is', null); // Base query

      if (error) {
        console.error(`[Inventory Alerts] Error querying ${check.table}:`, error);
        continue;
      }

      if (data && data.length > 0) {
        // For each matching record, check if an alert already exists
        for (const item of data) {
          // Apply client-side filtering for complex conditions
          let shouldAlert = false;

          if (check.table === 'general_inventory' && item.qty_on_hand <= item.reorder_level) {
            shouldAlert = true;
          } else if (check.table === 'weapons' && item.serviceable === false) {
            shouldAlert = true;
          } else if (check.table === 'vehicles' && item.next_service_due) {
            const dueDate = new Date(item.next_service_due);
            const sevenDaysFromNow = new Date();
            sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
            if (dueDate <= sevenDaysFromNow) {
              shouldAlert = true;
            }
          } else if ((check.table === 'tools' || check.table === 'engineer_equipment') && item.next_inspection_due) {
            const dueDate = new Date(item.next_inspection_due);
            const today = new Date();
            if (dueDate <= today) {
              shouldAlert = true;
            }
          } else if (check.table === 'plant_machinery' && item.next_service_due) {
            const dueDate = new Date(item.next_service_due);
            const today = new Date();
            if (dueDate <= today) {
              shouldAlert = true;
            }
          } else if (check.table === 'mt_facilities' && item.status !== 'Operational') {
            shouldAlert = true;
          }

          if (shouldAlert) {
            // Check if alert already exists
            const { data: existingAlert } = await supabaseClient
              .from('alerts')
              .select('id')
              .eq('message', `${check.message}: ${item[Object.keys(item).find(k => k.includes('_id') || k.includes('_name') || k === 'id')!]}`)
              .eq('acknowledged', false)
              .maybeSingle();

            if (!existingAlert) {
              const itemIdentifier = item[Object.keys(item).find(k => k.includes('_id') || k.includes('_name'))!] || item.id;
              
              const alertData = {
                message: `${check.message}: ${itemIdentifier}`,
                priority: check.priority,
                sender_role: 'S4' as any,
                recipient_role: 'S4' as any,
                acknowledged: false,
              };

              alerts.push(alertData);
            }
          }
        }
      }
    }

    // Insert all new alerts
    if (alerts.length > 0) {
      console.log(`[Inventory Alerts] Creating ${alerts.length} new alerts...`);
      const { error: insertError } = await supabaseClient
        .from('alerts')
        .insert(alerts);

      if (insertError) {
        console.error('[Inventory Alerts] Error inserting alerts:', insertError);
        throw insertError;
      }
    }

    console.log(`[Inventory Alerts] Check complete. Created ${alerts.length} alerts.`);

    return new Response(
      JSON.stringify({
        success: true,
        alertsCreated: alerts.length,
        message: `Inventory check complete. ${alerts.length} new alerts created.`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[Inventory Alerts] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
