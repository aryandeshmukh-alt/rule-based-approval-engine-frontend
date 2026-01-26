import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import LeaveRequestPage from "./pages/LeaveRequestPage";
import ExpenseRequestPage from "./pages/ExpenseRequestPage";
import DiscountRequestPage from "./pages/DiscountRequestPage";
import MyRequestsPage from "./pages/MyRequestsPage";
import PendingApprovalsPage from "./pages/PendingApprovalsPage";
import RulesManagementPage from "./pages/admin/RulesManagementPage";
import ReportsPage from "./pages/admin/ReportsPage";
import HolidaysPage from "./pages/admin/HolidaysPage";
import UsersPage from "./pages/admin/UsersPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leaves" element={<LeaveRequestPage />} />
            <Route path="/expenses" element={<ExpenseRequestPage />} />
            <Route path="/discounts" element={<DiscountRequestPage />} />
            <Route path="/my-requests" element={<MyRequestsPage />} />
            <Route path="/pending-approvals" element={<PendingApprovalsPage />} />
            <Route path="/admin/rules" element={<RulesManagementPage />} />
            <Route path="/admin/reports" element={<ReportsPage />} />
            <Route path="/admin/holidays" element={<HolidaysPage />} />
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
