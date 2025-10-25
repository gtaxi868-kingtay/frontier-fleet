import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { AddToolDialog } from "@/components/AddToolDialog";
import { BulkUploadDialog } from "@/components/BulkUploadDialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ItemDetailDialog } from "@/components/ItemDetailDialog";
import { Badge } from "@/components/ui/badge";

export default function Tools() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { role } = useAuth();
  const canManage = role === 'S4' || role === 'SQMS';
  const [tools, setTools] = useState<any[]>([]);
  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const fetchTools = async () => {
    const { data } = await supabase.from("tools").select("*");
    if (data) setTools(data);
  };

  useEffect(() => {
    fetchTools();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Tools Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Track hand tools, engineer kits, and specialized equipment
            </p>
          </div>
          {canManage && (
            <div className="flex gap-2">
              {role === 'S4' && <BulkUploadDialog module="tools" moduleName="Tools" />}
              <Button variant="default" className="gap-2" onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Tool
              </Button>
            </div>
          )}
        </div>

        <Card className="border-border/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Tools Inventory</span>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search tools..." className="pl-9" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tools.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No tools data available. Add tools to get started.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tools.map((tool) => (
                  <Card 
                    key={tool.id} 
                    className="cursor-pointer hover:shadow-glow transition-all duration-300 border-border/50 hover:border-accent/50"
                    onClick={() => {
                      setSelectedTool(tool);
                      setDetailDialogOpen(true);
                    }}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg font-display uppercase tracking-wider">
                        {tool.tool_id}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="font-medium">{tool.tool_name}</p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-tactical uppercase text-muted-foreground">Category</span>
                        <span className="font-medium">{tool.category}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-tactical uppercase text-muted-foreground">On Hand</span>
                        <span className="font-medium">{tool.qty_on_hand}</span>
                      </div>
                      <div className="pt-2">
                        <Badge variant={tool.serviceable ? 'default' : 'destructive'} className="w-full justify-center">
                          {tool.serviceable ? 'Serviceable' : 'Unserviceable'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <AddToolDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={fetchTools}
        />
        
        <ItemDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          title={selectedTool ? `${selectedTool.tool_id} - ${selectedTool.tool_name}` : ''}
          data={selectedTool}
        />
      </main>
    </div>
  );
}
