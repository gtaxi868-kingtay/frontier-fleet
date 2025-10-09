import { 
  Shield, 
  Wrench, 
  HardHat, 
  Crosshair,
  Package,
  Shirt,
  Hammer,
  Truck,
  Flame,
  AlertTriangle,
  Building,
  BarChart3,
  FileText,
  Home
} from "lucide-react";
import { NavLink } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

const modules = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Weapons", url: "/weapons", icon: Crosshair },
  { title: "Tools", url: "/tools", icon: Wrench },
  { title: "Engineer Equipment", url: "/equipment", icon: HardHat },
  { title: "Plant & Machinery", url: "/plant", icon: Truck },
  { title: "PPE", url: "/ppe", icon: AlertTriangle },
  { title: "Uniforms", url: "/uniforms", icon: Shirt },
  { title: "Explosives", url: "/explosives", icon: Flame },
  { title: "Facilities", url: "/facilities", icon: Building },
  { title: "Works Materials", url: "/materials", icon: Hammer },
  { title: "Inventory", url: "/inventory", icon: Package },
  { title: "Room Inventory", url: "/rooms", icon: Building },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Reports", url: "/reports", icon: FileText },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="border-b border-border/50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight">IBIMS</span>
            <span className="text-xs text-muted-foreground">1st Eng Bn</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Modules</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {modules.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) =>
                        isActive 
                          ? "bg-primary/10 text-primary font-medium border-l-2 border-primary" 
                          : "hover:bg-muted/50"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
