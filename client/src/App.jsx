import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';
import ClientLayout from './components/layout/ClientLayout';
import EmployeeLayout from './components/layout/EmployeeLayout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LeadsPage from './pages/LeadsPage';
import LeadDetailPage from './pages/LeadDetailPage';
import ClientsPage from './pages/ClientsPage';
import ClientDetailPage from './pages/ClientDetailPage';
import WhatsAppPage from './pages/WhatsAppPage';
import TasksPage from './pages/TasksPage';
import InvoicesPage from './pages/InvoicesPage';
import ProjectsPage from './pages/ProjectsPage';
import ExpensesPage from './pages/ExpensesPage';
import RecruitmentPage from './pages/RecruitmentPage';
import ReportsPage from './pages/ReportsPage';
import FilesPage from './pages/FilesPage';
import SettingsPage from './pages/SettingsPage';
import SOPPage from './pages/SOPPage';
import CompetitorPage from './pages/CompetitorPage';
import ProposalPage from './pages/ProposalPage';
import AIHubPage from './pages/AIHubPage';
import HRPage from './pages/HRPage';
import SuperadminDashboardPage from './pages/SuperadminDashboardPage';
import ClientPortalPage from './pages/ClientPortalPage';
import EmployeeDashboardPage from './pages/EmployeeDashboardPage';

const PrivateRoute = ({ children }) => {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="leads" element={<LeadsPage />} />
        <Route path="leads/:id" element={<LeadDetailPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="clients/:id" element={<ClientDetailPage />} />
        <Route path="whatsapp" element={<WhatsAppPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="recruitment" element={<RecruitmentPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="files" element={<FilesPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="sops" element={<SOPPage />} />
        <Route path="competitors" element={<CompetitorPage />} />
        <Route path="proposals" element={<ProposalPage />} />
        <Route path="ai-hub" element={<AIHubPage />} />
        <Route path="hr" element={<HRPage />} />
      </Route>
      <Route
        path="/superadmin"
        element={
          <PrivateRoute>
            <SuperadminDashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/client-portal"
        element={
          <PrivateRoute>
            <ClientLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<ClientPortalPage />} />
      </Route>
      <Route
        path="/employee-portal"
        element={
          <PrivateRoute>
            <EmployeeLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<EmployeeDashboardPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
