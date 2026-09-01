import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Warehouse, X, UserCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUnitFilter } from "@/hooks/useUnitFilter";
import { supabase } from "@/integrations/supabase/client";
import battalionEmblem from "@/assets/new-project.png";
import { NotificationCenter } from "@/components/NotificationCenter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  return (
    <header className="sticky top-0 z-40 border-b border-primary/20 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/95 tactical-scan">
      <div className="flex h-16 items-center gap-4 px-6">
        <SidebarTrigger className="-ml-2 hover:bg-primary/10 transition-colors" />
        
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={battalionEmblem}
            alt="Battalion Emblem"
            className="h-12 w-12 shrink-0 object-contain drop-shadow-[0_0_8px_rgba(139,0,0,0.5)]"
          />
          <div className="hidden sm:block min-w-0 leading-tight">
            <h2 className="text-lg font-display font-black uppercase tracking-wide truncate">1st Engineer Battalion</h2>
            <p className="text-xs text-primary/80 font-tactical font-semibold uppercase tracking-wider">TTDF Inventory Management</p>
          </div>
          <span className="sm:hidden text-base font-display font-black uppercase tracking-wide">S4</span>
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
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-primary/10">
                  <Link to="/profile">
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span className="font-tactical">My Profile</span>
                  </Link>
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
    </header>
  );
}
