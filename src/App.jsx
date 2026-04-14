import { ClassesPage, ReportsPage, SmsLogsPage, TeachersPage } from './pages/OtherPages'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/auth.store'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import { StudentsPage, StudentFormPage } from './pages/StudentsPage'
import CheckinPage from './pages/CheckinPage'
import AttendancePage from './pages/AttendancePage'

// Redirects to /login if not authenticated
function Protected({ children }) {
  const { token } = useAuthStore()
  return token ? children : <Navigate to="/login" replace />
}

// Redirects to /dashboard if already logged in
function PublicOnly({ children }) {
  const { token } = useAuthStore()
  return token ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
        <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />

        {/* Kiosk — full screen, no sidebar */}
        <Route path="/checkin" element={<Protected><CheckinPage /></Protected>} />

        {/* Protected routes with sidebar layout */}
        <Route path="/" element={<Protected><AppLayout /></Protected>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="students/new" element={<StudentFormPage />} />
          <Route path="students/:id" element={<StudentFormPage />} />
          <Route path="classes" element={<ClassesPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="teachers" element={<TeachersPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="sms-logs" element={<SmsLogsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
