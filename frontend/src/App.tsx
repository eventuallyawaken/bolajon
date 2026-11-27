import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { ProtectedRoute } from './app/router/ProtectedRoute';
import {
  useAuthStore,
  isJwtExpired,
  getDefaultRouteForRole,
} from './shared/store/useAuthStore';
import { LoginPage } from './features/auth/pages/LoginPage';
import { SuperadminLayout } from './app/layouts/SuperadminLayout';
import { SuperadminPage } from './features/superadmin/pages/SuperadminPage';
import { SuperadminProvider } from './features/superadmin/context/SuperadminContext';
import { ErpLayout } from './app/layouts/ErpLayout';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { ChildrenPage } from './features/children/pages/ChildrenPage';
import { GroupsPage } from './features/groups/pages/GroupsPage';
import { AttendancePage } from './features/attendance/pages/AttendancePage';
import { MedicalPage } from './features/medical/pages/MedicalPage';
import { PaymentsPage } from './features/payments/pages/PaymentsPage';
import { ExpensesPage } from './features/expenses/pages/ExpensesPage';
import { WarehousePage } from './features/warehouse/pages/WarehousePage';
import { StaffPage } from './features/staff/pages/StaffPage';
import { BranchesPage } from './features/branches/pages/BranchesPage';
import { SettingsPage } from './features/settings/pages/SettingsPage';
import { ParentLayout } from './app/layouts/ParentLayout';
import { ParentPortalProvider } from './features/parent/context/ParentPortalContext';
import { ParentOverviewPage } from './features/parent/pages/ParentOverviewPage';
import { ParentAttendancePage } from './features/parent/pages/ParentAttendancePage';
import { ParentMenuPage } from './features/parent/pages/ParentMenuPage';
import { ParentPaymentsPage } from './features/parent/pages/ParentPaymentsPage';
import { ParentProfilePage } from './features/parent/pages/ParentProfilePage';

const RootRedirect: React.FC = () => {
  const {
    accessToken,
    isAuthenticated,
    user,
    hasVerifiedSession,
    isVerifying,
    verifySession,
  } = useAuthStore();

  useEffect(() => {
    if (accessToken && !isJwtExpired(accessToken) && !hasVerifiedSession && !isVerifying) {
      void verifySession();
    }
  }, [accessToken, hasVerifiedSession, isVerifying, verifySession]);

  if (!accessToken || isJwtExpired(accessToken)) {
    return <Navigate to="/login" replace />;
  }

  if (!hasVerifiedSession || isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 border-2 border-[#0D9488] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
};

export function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        {/* Login Sahifasi */}
        <Route path="/login" element={<LoginPage />} />

        {/* Superadmin SaaS boshqaruv portali */}
        <Route
          path="/superadmin"
          element={
            <ProtectedRoute superadminOnly>
              <SuperadminProvider>
                <SuperadminLayout>
                  <SuperadminPage />
                </SuperadminLayout>
              </SuperadminProvider>
            </ProtectedRoute>
          }
        />

        {/* Bog‘cha ERP Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['director', 'accountant']}>
              <ErpLayout>
                <DashboardPage />
              </ErpLayout>
            </ProtectedRoute>
          }
        />

        {/* Tarbiyalanuvchilar (Bolalar bazasi) */}
        <Route
          path="/children"
          element={
            <ProtectedRoute allowedRoles={['director', 'teacher', 'nurse']}>
              <ErpLayout>
                <ChildrenPage />
              </ErpLayout>
            </ProtectedRoute>
          }
        />

        {/* Guruhlar boshqaruvi */}
        <Route
          path="/groups"
          element={
            <ProtectedRoute allowedRoles={['director', 'teacher']}>
              <ErpLayout>
                <GroupsPage />
              </ErpLayout>
            </ProtectedRoute>
          }
        />

        {/* Davomat va Ertalabki tibbiy filtr */}
        <Route
          path="/attendance"
          element={
            <ProtectedRoute allowedRoles={['director', 'teacher', 'nurse']}>
              <ErpLayout>
                <AttendancePage />
              </ErpLayout>
            </ProtectedRoute>
          }
        />

        {/* Hamshira Tibbiy nazorat paneli */}
        <Route
          path="/medical"
          element={
            <ProtectedRoute allowedRoles={['director', 'nurse']}>
              <ErpLayout>
                <MedicalPage />
              </ErpLayout>
            </ProtectedRoute>
          }
        />

        {/* Ota-onalar to‘lovlari va kvitansiyalar */}
        <Route
          path="/payments"
          element={
            <ProtectedRoute allowedRoles={['director', 'accountant']}>
              <ErpLayout>
                <PaymentsPage />
              </ErpLayout>
            </ProtectedRoute>
          }
        />

        {/* Xarajatlar va Kassa */}
        <Route
          path="/expenses"
          element={
            <ProtectedRoute allowedRoles={['director', 'accountant']}>
              <ErpLayout>
                <ExpensesPage />
              </ErpLayout>
            </ProtectedRoute>
          }
        />

        {/* Ombor va Oshxona taomnomasi */}
        <Route
          path="/warehouse"
          element={
            <ProtectedRoute allowedRoles={['director', 'accountant']}>
              <ErpLayout>
                <WarehousePage />
              </ErpLayout>
            </ProtectedRoute>
          }
        />

        {/* Xodimlar va tarbiyachilar */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={['director']}>
              <ErpLayout>
                <StaffPage />
              </ErpLayout>
            </ProtectedRoute>
          }
        />

        {/* Bog‘cha filiallari */}
        <Route
          path="/branches"
          element={
            <ProtectedRoute allowedRoles={['director']}>
              <ErpLayout>
                <BranchesPage />
              </ErpLayout>
            </ProtectedRoute>
          }
        />

        {/* Tizim sozlamalari */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={['director', 'teacher', 'accountant', 'nurse']}>
              <ErpLayout>
                <SettingsPage />
              </ErpLayout>
            </ProtectedRoute>
          }
        />

        {/* Ota-ona shaxsiy kabineti */}
        <Route
          path="/parent"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <ParentPortalProvider>
                <ParentLayout />
              </ParentPortalProvider>
            </ProtectedRoute>
          }
        >
          <Route index element={<ParentOverviewPage />} />
          <Route path="attendance" element={<ParentAttendancePage />} />
          <Route path="menu" element={<ParentMenuPage />} />
          <Route path="payments" element={<ParentPaymentsPage />} />
          <Route path="profile" element={<ParentProfilePage />} />
        </Route>

        {/* Default route */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
