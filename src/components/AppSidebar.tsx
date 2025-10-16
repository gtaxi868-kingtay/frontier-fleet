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
  Home,
  UserCog,
  Car
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import battalionEmblem from "@/assets/battalion-emblem.png";

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
  { title: "Engineer Equipment", url: "/engineer-equipment", icon: HardHat },
  { title: "Plant & Machinery", url: "/plant-machinery", icon: Truck },
  { title: "Motor Transport", url: "/motor-transport", icon: Car },
  { title: "PPE", url: "/ppe", icon: AlertTriangle },
  { title: "Uniforms", url: "/uniforms", icon: Shirt },
  { title: "Explosives", url: "/explosives", icon: Flame },
  { title: "Facilities", url: "/facilities", icon: Building },
  { title: "Works Materials", url: "/works-materials", icon: Hammer },
  { title: "Inventory", url: "/inventory", icon: Package },
  { title: "Room Inventory", url: "/room-inventory", icon: Building },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Reports", url: "/reports", icon: FileText },
];

export function AppSidebar() {
  const { role } = useAuth();
  
  const showRoleManagement = role === 'CO' || role === 'S4';

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50 bg-sidebar">
      <SidebarHeader className="border-b border-border/50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm">
            <img src={battalionEmblem} alt="Battalion Emblem" className="h-10 w-10 object-contain" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
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
                          ? "bg-primary/10 text-primary font-medium" 
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

        {showRoleManagement && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to="/role-management"
                      className={({ isActive }) =>
                        isActive 
                          ? "bg-primary/10 text-primary font-medium" 
                          : "hover:bg-muted/50"
                      }
                    >
                      <UserCog className="h-4 w-4" />
                      <span>Role Management</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
