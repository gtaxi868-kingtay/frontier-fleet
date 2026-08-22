import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { BellRing, CheckCircle2, Search, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface ChangeNotice {
  id: string;
  message: string;
  sender_role: string;
  recipient_role: string;
  related_item_id: string | null;
  related_item_type: string | null;
  action_required: boolean;
  acknowledged: boolean;
  created_at: string;
}

export default function ChangeNotices() {
  const { role } = useAuth();
  const [notices, setNotices] = useState<ChangeNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchNotices = async () => {
    if (!role) return;
    const { data } = await supabase
      .from("alerts")
      .select("*")
      .eq("alert_type", "change_notice")
      .eq("recipient_role", role as any)
      .order("created_at", { ascending: false })
      .limit(200);
    setNotices((data as ChangeNotice[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotices();

    const channel = supabase
      .channel("change-notices-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "alerts", filter: "alert_type=eq.change_notice" },
        () => fetchNotices()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [role]);

  const confirmNotice = async (id: string) => {
    const { error } = await supabase.from("alerts").update({ acknowledged: true }).eq("id", id);
    if (error) {
      toast.error("Failed to confirm notice");
      return;
    }
    toast.success("Confirmed");
    fetchNotices();
  };

  const filtered = notices.filter((n) =>
    search.trim() === "" ? true : (n.related_item_type || "").toLowerCase().includes(search.toLowerCase()) || n.message.toLowerCase().includes(search.toLowerCase())
  );

  const pendingConfirmation = filtered.filter((n) => n.action_required && !n.acknowledged);
  const rest = filtered.filter((n) => !(n.action_required && !n.acknowledged));

  const NoticeRow = ({ notice, showConfirm }: { notice: ChangeNotice; showConfirm: boolean }) => (
    <Card key={notice.id} className={!notice.acknowledged ? "border-primary/40" : ""}>
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2 rounded-lg bg-gradient-primary text-primary-foreground shadow-glow shrink-0">
            {notice.acknowledged ? <CheckCircle2 className="h-4 w-4" /> : <BellRing className="h-4 w-4" />}
          </div>
          <div className="min-w-0">
            <p className="text-sm">{notice.message}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="outline" className="text-xs">{notice.sender_role}</Badge>
              {notice.related_item_type && (
                <Badge variant="outline" className="text-xs capitalize">{notice.related_item_type.replace(/_/g, " ")}</Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notice.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
        {showConfirm && (
          <Button size="sm" onClick={() => confirmNotice(notice.id)} className="shrink-0">
            Confirm
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Change Notices</h1>
            <p className="text-muted-foreground">
              {role === "S4"
                ? "Changes made by S4_ADMIN awaiting your confirmation, plus your own change history."
                : "Changes made by S4 across the battalion."}
            </p>
          </div>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by table or message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : (
          <>
            {role === "S4" && (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Pending Confirmation {pendingConfirmation.length > 0 && `(${pendingConfirmation.length})`}
                </h2>
                {pendingConfirmation.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nothing awaiting confirmation.</p>
                ) : (
                  <div className="space-y-2">
                    {pendingConfirmation.map((n) => (
                      <NoticeRow key={n.id} notice={n} showConfirm />
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">History</h2>
              {rest.length === 0 ? (
                <p className="text-sm text-muted-foreground">No change notices yet.</p>
              ) : (
                <div className="space-y-2">
                  {rest.map((n) => (
                    <NoticeRow key={n.id} notice={n} showConfirm={false} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
