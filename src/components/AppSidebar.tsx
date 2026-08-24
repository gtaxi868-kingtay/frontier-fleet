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
  Car,
  ClipboardList,
  ArrowLeftRight,
  ScrollText,
  Warehouse,
  BellRing,
  Fuel,
  Boxes,
  ClipboardCheck,
  Camera,
  QrCode,
  Tags
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import battalionLogo from "@/assets/battalion-logo.png";

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

const overviewModules = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Stores", url: "/stores", icon: Warehouse },
  { title: "Scan Item", url: "/scan", icon: QrCode },
];

const assetModules = [
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
  { title: "Barracks Stores", url: "/barracks-stores", icon: Building },
  { title: "Clothing & Equipment", url: "/clothing-equipment", icon: Shirt },
  { title: "Company Stores", url: "/company-stores", icon: ScrollText },
  { title: "Equipment Kits", url: "/equipment-kits", icon: Boxes },
  { title: "Physical Check", url: "/physical-check", icon: ClipboardCheck },
];

const personnelModules = [
  { title: "Inventory Requests", url: "/inventory-requests", icon: ClipboardList },
];

const reportingModules = [
  { title: "Print Labels", url: "/print-labels", icon: Tags },
  { title: "Documents", url: "/documents", icon: Camera },
  { title: "Transactions", url: "/transactions", icon: ArrowLeftRight },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Reports", url: "/reports", icon: FileText },
];

const departmentModules = [
  { title: "MTO Dashboard", url: "/mto-dashboard", icon: Car, roles: ['MTO', 'S4', 'CO', 'S4_ADMIN'] },
  { title: "Workshop Dashboard", url: "/workshop-dashboard", icon: Wrench, roles: ['WKSP_WO', 'S4', 'CO', 'S4_ADMIN'] },
  { title: "POL / Fuel", url: "/pol-fuel", icon: Fuel, roles: ['MTO', 'S4', 'S4_ADMIN', 'CO', 'S1'] },
];

export function AppSidebar() {
  const { role } = useAuth();
  const navigate = useNavigate();
  
  const showRoleManagement = role === 'CO' || role === 'S4';
  const showAuditTrail = ['CO', 'S1', 'S4', 'S4_ADMIN', 'RSM'].includes(role || '');
  const showChangeNotices = ['CO', 'S1', 'S4'].includes(role || '');
  
  // Filter department modules based on role
  const availableDepartmentModules = departmentModules.filter(module => 
    module.roles.includes(role || '')
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-primary/20 bg-sidebar/95 backdrop-blur-xl">
      <SidebarHeader className="border-b border-primary/20 p-4">
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-3 w-full hover:opacity-90 transition-all group"
        >
          <img 
            src={battalionLogo} 
            alt="Battalion Logo" 
            className="h-40 w-40 object-contain drop-shadow-[0_0_8px_rgba(139,0,0,0.5)] group-hover:drop-shadow-[0_0_12px_rgba(255,215,0,0.6)] transition-all" 
          />
          <div className="flex flex-col group-data-[collapsible=icon]:hidden text-left">
            <span className="text-xl font-display font-black tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">S4</span>
            <span className="text-sm font-tactical text-muted-foreground uppercase tracking-wide">1st Eng Bn</span>
          </div>
        </button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-tactical uppercase tracking-wider text-xs text-muted-foreground">Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {overviewModules.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        isActive
                          ? "bg-gradient-primary text-primary-foreground font-tactical font-bold shadow-glow beveled"
                          : "hover:bg-primary/10 hover:text-primary font-tactical transition-all"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="uppercase tracking-wide text-xs">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="font-tactical uppercase tracking-wider text-xs text-muted-foreground">Asset Modules</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {assetModules.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-gradient-primary text-primary-foreground font-tactical font-bold shadow-glow beveled"
                          : "hover:bg-primary/10 hover:text-primary font-tactical transition-all"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="uppercase tracking-wide text-xs">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="font-tactical uppercase tracking-wider text-xs text-muted-foreground">Personnel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {personnelModules.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-gradient-primary text-primary-foreground font-tactical font-bold shadow-glow beveled"
                          : "hover:bg-primary/10 hover:text-primary font-tactical transition-all"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="uppercase tracking-wide text-xs">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="font-tactical uppercase tracking-wider text-xs text-muted-foreground">Reporting</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {reportingModules.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-gradient-primary text-primary-foreground font-tactical font-bold shadow-glow beveled"
                          : "hover:bg-primary/10 hover:text-primary font-tactical transition-all"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="uppercase tracking-wide text-xs">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {availableDepartmentModules.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="font-tactical uppercase tracking-wider text-xs text-muted-foreground">Departments</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {availableDepartmentModules.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url}
                        className={({ isActive }) =>
                          isActive 
                            ? "bg-gradient-primary text-primary-foreground font-tactical font-bold shadow-glow beveled" 
                            : "hover:bg-primary/10 hover:text-primary font-tactical transition-all"
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="uppercase tracking-wide text-xs">{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {(showRoleManagement || showAuditTrail || showChangeNotices) && (
          <SidebarGroup>
            <SidebarGroupLabel className="font-tactical uppercase tracking-wider text-xs text-muted-foreground">Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {showRoleManagement && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to="/role-management"
                        className={({ isActive }) =>
                          isActive 
                            ? "bg-gradient-primary text-primary-foreground font-tactical font-bold shadow-glow beveled" 
                            : "hover:bg-primary/10 hover:text-primary font-tactical transition-all"
                        }
                      >
                        <UserCog className="h-4 w-4" />
                        <span className="uppercase tracking-wide text-xs">Role Management</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                {showAuditTrail && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to="/audit-trail"
                        className={({ isActive }) =>
                          isActive
                            ? "bg-gradient-primary text-primary-foreground font-tactical font-bold shadow-glow beveled"
                            : "hover:bg-primary/10 hover:text-primary font-tactical transition-all"
                        }
                      >
                        <ScrollText className="h-4 w-4" />
                        <span className="uppercase tracking-wide text-xs">Audit Trail</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                {showChangeNotices && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to="/notices"
                        className={({ isActive }) =>
                          isActive
                            ? "bg-gradient-primary text-primary-foreground font-tactical font-bold shadow-glow beveled"
                            : "hover:bg-primary/10 hover:text-primary font-tactical transition-all"
                        }
                      >
                        <BellRing className="h-4 w-4" />
                        <span className="uppercase tracking-wide text-xs">Change Notices</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
