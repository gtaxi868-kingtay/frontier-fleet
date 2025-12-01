import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SplashScreen } from "@/components/SplashScreen";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Weapons from "./pages/Weapons";
import Tools from "./pages/Tools";
import EngineerEquipment from "./pages/EngineerEquipment";
import PlantMachinery from "./pages/PlantMachinery";
import MotorTransport from "./pages/MotorTransport";
import PPE from "./pages/PPE";
import Uniforms from "./pages/Uniforms";
import Explosives from "./pages/Explosives";
import Facilities from "./pages/Facilities";
import WorksMaterials from "./pages/WorksMaterials";
import Inventory from "./pages/Inventory";
import RoomInventory from "./pages/RoomInventory";
import InventoryRequests from "./pages/InventoryRequests";
import Transactions from "./pages/Transactions";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import RoleManagement from "./pages/RoleManagement";
import AuditTrail from "./pages/AuditTrail";
import SelfApprove from "./pages/SelfApprove";
import NotFound from "./pages/NotFound";
import MTODashboard from "./pages/MTODashboard";
import WorkshopDashboard from "./pages/WorkshopDashboard";
import POLManagement from "./pages/POLManagement";
import BarracksStores from "./pages/BarracksStores";
import ClothingEquipment from "./pages/ClothingEquipment";
import CompanyStores from "./pages/CompanyStores";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
      gcTime: 300000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem("hasSeenSplash");
    if (hasSeenSplash) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashFinish = () => {
    sessionStorage.setItem("hasSeenSplash", "true");
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/self-approve" 
              element={
                <ProtectedRoute>
                  <SelfApprove />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
          <SidebarProvider defaultOpen={true}>
            <div className="flex min-h-screen w-full">
              <AppSidebar />
              <div className="flex-1 flex flex-col">
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/weapons" element={<Weapons />} />
                          <Route path="/tools" element={<Tools />} />
                          <Route path="/engineer-equipment" element={<EngineerEquipment />} />
                          <Route path="/plant-machinery" element={<PlantMachinery />} />
                          <Route path="/motor-transport" element={<MotorTransport />} />
                          <Route path="/ppe" element={<PPE />} />
                          <Route path="/uniforms" element={<Uniforms />} />
                          <Route path="/explosives" element={<Explosives />} />
                          <Route path="/facilities" element={<Facilities />} />
                          <Route path="/works-materials" element={<WorksMaterials />} />
                          <Route path="/inventory" element={<Inventory />} />
                          <Route path="/room-inventory" element={<RoomInventory />} />
                          <Route 
                            path="/inventory-requests" 
                            element={
                              <ProtectedRoute allowedRoles={['CO', 'S1', 'S4', 'S4_ADMIN', 'OC', 'SQMS']}>
                                <InventoryRequests />
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="/transactions" 
                            element={
                              <ProtectedRoute allowedRoles={['CO', 'S1', 'S4', 'S4_ADMIN', 'OC', 'SQMS', 'STOREMAN']}>
                                <Transactions />
                              </ProtectedRoute>
                            } 
                          />
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
                          <Route 
                            path="/role-management" 
                            element={
                              <ProtectedRoute allowedRoles={['CO', 'S4']}>
                                <RoleManagement />
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="/audit-trail" 
                            element={
                              <ProtectedRoute allowedRoles={['CO', 'S1', 'S4', 'S4_ADMIN']}>
                                <AuditTrail />
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="/mto-dashboard" 
                            element={
                              <ProtectedRoute allowedRoles={['MTO', 'S4', 'CO', 'S4_ADMIN']}>
                                <MTODashboard />
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="/workshop-dashboard" 
                            element={
                              <ProtectedRoute allowedRoles={['WKSP_WO', 'S4', 'CO', 'S4_ADMIN', 'OC']}>
                                <WorkshopDashboard />
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="/pol-management" 
                            element={
                              <ProtectedRoute allowedRoles={['MTO', 'S4', 'CO', 'S4_ADMIN']}>
                                <POLManagement />
                              </ProtectedRoute>
                            } 
                          />
                          <Route path="/barracks-stores" element={<BarracksStores />} />
                          <Route path="/clothing-equipment" element={<ClothingEquipment />} />
                          <Route path="/company-stores" element={<CompanyStores />} />
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
  </ErrorBoundary>
  );
};

export default App;
