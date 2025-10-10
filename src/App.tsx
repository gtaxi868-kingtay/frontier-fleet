import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Weapons from "./pages/Weapons";
import Tools from "./pages/Tools";
import EngineerEquipment from "./pages/EngineerEquipment";
import PlantMachinery from "./pages/PlantMachinery";
import PPE from "./pages/PPE";
import Uniforms from "./pages/Uniforms";
import Explosives from "./pages/Explosives";
import Facilities from "./pages/Facilities";
import WorksMaterials from "./pages/WorksMaterials";
import Inventory from "./pages/Inventory";
import RoomInventory from "./pages/RoomInventory";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <div className="flex min-h-screen w-full">
                      <AppSidebar />
                      <div className="flex-1">
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/weapons" element={<Weapons />} />
                          <Route path="/tools" element={<Tools />} />
                          <Route path="/engineer-equipment" element={<EngineerEquipment />} />
                          <Route path="/plant-machinery" element={<PlantMachinery />} />
                          <Route path="/ppe" element={<PPE />} />
                          <Route path="/uniforms" element={<Uniforms />} />
                          <Route path="/explosives" element={<Explosives />} />
                          <Route path="/facilities" element={<Facilities />} />
                          <Route path="/works-materials" element={<WorksMaterials />} />
                          <Route path="/inventory" element={<Inventory />} />
                          <Route path="/room-inventory" element={<RoomInventory />} />
                          <Route 
                            path="/analytics" 
                            element={
                              <ProtectedRoute allowedRoles={['CO', 'S4', 'OC']}>
                                <Analytics />
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="/reports" 
                            element={
                              <ProtectedRoute allowedRoles={['CO', 'S4', 'OC']}>
                                <Reports />
                              </ProtectedRoute>
                            } 
                          />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </div>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
