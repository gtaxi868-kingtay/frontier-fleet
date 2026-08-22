import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SetPinDialog } from "@/components/SetPinDialog";
import { UserCircle, KeyRound, ShieldCheck, Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Profile() {
  const { profile, role, user } = useAuth();
  const [unitName, setUnitName] = useState<string | null>(null);
  const [serviceNumber, setServiceNumber] = useState(profile?.service_number || "");
  const [savingServiceNumber, setSavingServiceNumber] = useState(false);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [pinEnabled, setPinEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    if (profile?.unit_id) {
      supabase
        .from("units")
        .select("name")
        .eq("id", profile.unit_id)
        .single()
        .then(({ data }) => setUnitName(data?.name || null));
    }
    if (profile?.id) {
      supabase
        .from("profiles")
        .select("pin_enabled")
        .eq("id", profile.id)
        .single()
        .then(({ data }) => setPinEnabled((data as any)?.pin_enabled ?? false));
    }
    setServiceNumber(profile?.service_number || "");
  }, [profile?.unit_id, profile?.id, profile?.service_number]);

  const saveServiceNumber = async () => {
    if (!profile?.id) return;
    setSavingServiceNumber(true);
    const { error } = await supabase
      .from("profiles")
      .update({ service_number: serviceNumber.trim() || null })
      .eq("id", profile.id);
    setSavingServiceNumber(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Service number updated");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <main className="flex-1 p-6 space-y-6 max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
            <UserCircle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
            <p className="text-muted-foreground">Your account, rank, unit, and sign-in options</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/30">
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xl font-display font-bold">
                {profile?.name?.substring(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-lg font-semibold">{profile?.name || "—"}</p>
              <div className="flex items-center gap-2 flex-wrap">
                {profile?.rank && <Badge variant="outline">{profile.rank}</Badge>}
                {role && <Badge>{role}</Badge>}
                {unitName && <Badge variant="outline">{unitName}</Badge>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account Details</CardTitle>
            <CardDescription>Read-only details tied to your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled />
            </div>
            <div>
              <Label>Rank</Label>
              <Input value={profile?.rank || "Not set — contact S4"} disabled />
            </div>
            <div>
              <Label>Unit</Label>
              <Input value={unitName || "Not set — contact S4"} disabled />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Service Number</CardTitle>
            <CardDescription>
              Used to sign in with your PIN instead of a password. Ask S4 to correct this if it's wrong.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Input
              value={serviceNumber}
              onChange={(e) => setServiceNumber(e.target.value)}
              placeholder="e.g., 0263"
            />
            <Button onClick={saveServiceNumber} disabled={savingServiceNumber}>
              <Save className="h-4 w-4 mr-2" /> Save
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <KeyRound className="h-4 w-4" /> Quick-Access PIN
            </CardTitle>
            <CardDescription>
              A 6-digit PIN lets you sign in with your service number instead of typing your full password.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {pinEnabled ? (
                <Badge variant="outline" className="text-success border-success/30 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> PIN Enabled
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  No PIN set
                </Badge>
              )}
            </div>
            <Button variant="outline" onClick={() => setPinDialogOpen(true)}>
              {pinEnabled ? "Change PIN" : "Set PIN"}
            </Button>
          </CardContent>
        </Card>
      </main>

      <SetPinDialog open={pinDialogOpen} onOpenChange={setPinDialogOpen} />
    </div>
  );
}
