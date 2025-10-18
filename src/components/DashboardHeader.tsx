import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import battalionEmblem from "@/assets/new-project.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DashboardHeader() {
  const { profile, role, signOut } = useAuth();
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

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative rounded-lg hover:bg-primary/10 hover:shadow-glow transition-all">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary shadow-glow pulse-active" />
          </Button>

          <div className="flex items-center gap-3 pl-3 border-l border-primary/20">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 hover:bg-primary/10 transition-all group">
                  <div className="text-right">
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
