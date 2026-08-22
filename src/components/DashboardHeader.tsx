import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogOut, Warehouse, X, KeyRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUnitFilter } from "@/hooks/useUnitFilter";
import { supabase } from "@/integrations/supabase/client";
import battalionEmblem from "@/assets/new-project.png";
import { NotificationCenter } from "@/components/NotificationCenter";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function SetPinDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { setPin, profile } = useAuth();
  const [pin, setPinValue] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (pin !== confirmPin) {
      toast.error("PINs don't match");
      return;
    }
    setSubmitting(true);
    const { error } = await setPin(pin);
    setSubmitting(false);
    if (error) {
      toast.error(error.message || "Failed to set PIN");
      return;
    }
    toast.success("PIN set — you can now sign in with your service number and PIN");
    setPinValue("");
    setConfirmPin("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" /> Set Quick-Access PIN
          </DialogTitle>
          <DialogDescription>
            {profile?.service_number
              ? `Sets a 6-digit PIN for signing in with service number ${profile.service_number}. This replaces your current password — use the PIN to sign in going forward.`
              : "Your profile has no service number on file — ask S4 to add one before setting a PIN. Setting a PIN here would still replace your password, but PIN login needs a service number to look up your account."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>New 6-digit PIN</Label>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => setPinValue(e.target.value.replace(/\D/g, ""))}
              placeholder="••••••"
            />
          </div>
          <div>
            <Label>Confirm PIN</Label>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
              placeholder="••••••"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || pin.length !== 6}>
            Set PIN
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StoreScopeBadge() {
  const { overrideUnitId, canSeeAllUnits } = useUnitFilter();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const [unitName, setUnitName] = useState<string | null>(null);

  useEffect(() => {
    if (!overrideUnitId) {
      setUnitName(null);
      return;
    }
    supabase
      .from("units")
      .select("name")
      .eq("id", overrideUnitId)
      .single()
      .then(({ data }) => setUnitName(data?.name || null));
  }, [overrideUnitId]);

  if (!canSeeAllUnits || !overrideUnitId) return null;

  const clearedParams = new URLSearchParams(searchParams);
  clearedParams.delete("unit");
  const clearedSearch = clearedParams.toString();

  return (
    <Badge variant="outline" className="hidden sm:flex items-center gap-1.5 border-primary/40 text-primary">
      <Warehouse className="h-3 w-3" />
      Viewing: {unitName || "…"}
      <Link
        to={{ pathname, search: clearedSearch ? `?${clearedSearch}` : "" }}
        className="ml-1 hover:text-foreground transition-colors"
        aria-label="Clear store scope"
      >
        <X className="h-3 w-3" />
      </Link>
    </Badge>
  );
}

export function DashboardHeader() {
  const { profile, role, signOut } = useAuth();
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-primary/20 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/95 tactical-scan">
      <div className="flex h-16 items-center gap-4 px-6">
        <SidebarTrigger className="-ml-2 hover:bg-primary/10 transition-colors" />
        
        <div className="flex items-center gap-3">
          <img
            src={battalionEmblem}
            alt="Battalion Emblem"
            className="h-10 w-10 object-contain drop-shadow-[0_0_6px_rgba(139,0,0,0.4)]"
          />
          <div className="hidden md:block">
            <h2 className="text-sm font-display font-bold uppercase tracking-wider">1st Engineer Battalion</h2>
            <p className="text-xs text-muted-foreground font-tactical">TTDF Inventory Management</p>
          </div>
        </div>
        
        <div className="flex-1" />

        <StoreScopeBadge />

        <div className="flex items-center gap-3">
          <NotificationCenter />

          <div className="flex items-center gap-3 pl-3 border-l border-primary/20">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 hover:bg-primary/10 transition-all group">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-tactical font-semibold">{profile?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{role || 'No Role'}</p>
                  </div>
                  <Avatar className="h-9 w-9 border-2 border-primary/30 group-hover:border-primary shadow-md group-hover:shadow-glow transition-all">
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground font-display font-bold">
                      {profile?.name?.substring(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-primary/20 bg-background/95 backdrop-blur-xl">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-tactical font-semibold">{profile?.name}</p>
                    <p className="text-xs text-muted-foreground uppercase">{profile?.rank}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-primary/20" />
                <DropdownMenuItem onClick={() => setPinDialogOpen(true)} className="cursor-pointer hover:bg-primary/10">
                  <KeyRound className="mr-2 h-4 w-4" />
                  <span className="font-tactical">Set PIN</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-primary/20" />
                <DropdownMenuItem onClick={signOut} className="text-destructive cursor-pointer hover:bg-destructive/10">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span className="font-tactical">Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <SetPinDialog open={pinDialogOpen} onOpenChange={setPinDialogOpen} />
    </header>
  );
}
