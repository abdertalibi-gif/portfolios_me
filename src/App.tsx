import type { ReactNode } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import AdminLayout from "./components/admin/AdminLayout";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import ProjectsAdmin from "./pages/admin/ProjectsAdmin";
import SkillsAdmin from "./pages/admin/SkillsAdmin";
import EducationAdmin from "./pages/admin/EducationAdmin";
import ExperienceAdmin from "./pages/admin/ExperienceAdmin";
import CertificationsAdmin from "./pages/admin/CertificationsAdmin";
import AboutAdmin from "./pages/admin/AboutAdmin";
import ContactAdmin from "./pages/admin/ContactAdmin";
import MessagesAdmin from "./pages/admin/MessagesAdmin";
import SettingsAdmin from "./pages/admin/SettingsAdmin";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ContentProvider } from "./context/ContentContext";

function AdminSplash() {
  return (
    <div className="min-h-screen bg-[#050B16] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Vérification de la session</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AdminSplash />;
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <ContentProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin/login" element={<Login />} />

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="projects" element={<ProjectsAdmin />} />
              <Route path="skills" element={<SkillsAdmin />} />
              <Route path="education" element={<EducationAdmin />} />
              <Route path="experiences" element={<ExperienceAdmin />} />
              <Route path="certifications" element={<CertificationsAdmin />} />
              <Route path="about" element={<AboutAdmin />} />
              <Route path="profile" element={<Navigate to="/admin/about" replace />} />
              <Route path="contact" element={<ContactAdmin />} />
              <Route path="messages" element={<MessagesAdmin />} />
              <Route path="settings" element={<SettingsAdmin />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ContentProvider>
    </AuthProvider>
  );
}
