import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Auth
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Parent Module
import ParentDashboard from "./pages/parent/ParentDashboard";
import ParentProfile from "./pages/parent/ParentProfile";
import HealthLog from "./pages/parent/HealthLog";
import Vaccination from "./pages/parent/Vaccination";
import QueryResponse from "./pages/parent/QueryResponse";
import Reports from "./pages/parent/Reports";
import ArticleView from "./pages/parent/ArticleView";

// Practitioner Module
import PractitionerDashboard from "./pages/practitioner/PractitionerDashboard";
import PractitionerProfile from "./pages/practitioner/PractitionerProfile";
import ParentQueries from "./pages/practitioner/ParentQueries";
import ExpertContent from "./pages/practitioner/ExpertContent";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminContent from "./pages/admin/AdminContent";
import AdminVaccines from "./pages/admin/AdminVaccines";
import ProtectedRoute from "./components/ProtectedRoute";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Landing */}
          <Route path="/" element={<Index />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Parent Module */}
          <Route path="/parent/dashboard" element={<ProtectedRoute allowedRole="parent"><ParentDashboard /></ProtectedRoute>} />
          <Route path="/parent/profile" element={<ProtectedRoute allowedRole="parent"><ParentProfile /></ProtectedRoute>} />
          <Route path="/parent/health-log" element={<ProtectedRoute allowedRole="parent"><HealthLog /></ProtectedRoute>} />
          <Route path="/parent/vaccination" element={<ProtectedRoute allowedRole="parent"><Vaccination /></ProtectedRoute>} />
          <Route path="/parent/query" element={<ProtectedRoute allowedRole="parent"><QueryResponse /></ProtectedRoute>} />
          <Route path="/parent/reports" element={<ProtectedRoute allowedRole="parent"><Reports /></ProtectedRoute>} />
          <Route path="/parent/content/:id" element={<ProtectedRoute allowedRole="parent"><ArticleView /></ProtectedRoute>} />

          {/* Practitioner Module */}
          <Route path="/practitioner/dashboard" element={<ProtectedRoute allowedRole="practitioner"><PractitionerDashboard /></ProtectedRoute>} />
          <Route path="/practitioner/profile" element={<ProtectedRoute allowedRole="practitioner"><PractitionerProfile /></ProtectedRoute>} />
          <Route path="/practitioner/queries" element={<ProtectedRoute allowedRole="practitioner"><ParentQueries /></ProtectedRoute>} />
          <Route path="/practitioner/content" element={<ProtectedRoute allowedRole="practitioner"><ExpertContent /></ProtectedRoute>} />

          {/* Admin Module */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRole="admin"><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/content" element={<ProtectedRoute allowedRole="admin"><AdminContent /></ProtectedRoute>} />
          <Route path="/admin/vaccines" element={<ProtectedRoute allowedRole="admin"><AdminVaccines /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
