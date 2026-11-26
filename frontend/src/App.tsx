import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { ProtectedRoute } from './app/router/ProtectedRoute';
import { LoginPage } from './features/auth/pages/LoginPage';
import { SuperadminLayout } from './app/layouts/SuperadminLayout';
import { SuperadminPage } from './features/superadmin/pages/SuperadminPage';
import { SuperadminProvider } from './features/superadmin/context/SuperadminContext';
import { ErpLayout } from './app/layouts/ErpLayout';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { ChildrenPage } from './features/children/pages/ChildrenPage';
import { GroupsPage } from './features/groups/pages/GroupsPage';
import { AttendancePage } from './features/attendance/pages/AttendancePage';
import { PaymentsPage } from './features/payments/pages/PaymentsPage';
import { ExpensesPage } from './features/expenses/pages/ExpensesPage';
import { WarehousePage } from './features/warehouse/pages/WarehousePage';
import { StaffPage } from './features/staff/pages/StaffPage';
import { BranchesPage } from './features/branches/pages/BranchesPage';
import { SettingsPage } from './features/settings/pages/SettingsPage';

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
            <ProtectedRoute>
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
            <ProtectedRoute>
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
            <ProtectedRoute>
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
            <ProtectedRoute>
              <ErpLayout>
                <AttendancePage />
              </ErpLayout>
            </ProtectedRoute>
          }
        />

        {/* Ota-onalar to‘lovlari va kvitansiyalar */}
        <Route
          path="/payments"
          element={
            <ProtectedRoute>
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
            <ProtectedRoute>
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
            <ProtectedRoute>
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
            <ProtectedRoute>
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
            <ProtectedRoute>
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
            <ProtectedRoute>
              <ErpLayout>
                <SettingsPage />
              </ErpLayout>
            </ProtectedRoute>
          }
        />

        {/* Default route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
