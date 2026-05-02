import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from './store/auth.store'
import api from './lib/api'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import { StudentsPage, StudentFormPage } from './pages/StudentsPage'
import CheckinPage from './pages/CheckinPage'
import AttendancePage from './pages/AttendancePage'
import BillingPage from './pages/BillingPage'
import BillingSuccessPage from './pages/BillingSuccessPage'
import { ClassesPage, ReportsPage, SmsLogsPage, TeachersPage, SettingsPage } from './pages/OtherPages'

function TrialExpired() {
  const { logout } = useAuthStore()
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your free trial has ended</h1>
        <p className="text-gray-500 mb-6 leading-relaxed">
          Your 14-day free trial has expired. Contact us to continue using AttendEase and keep your school data.
        </p>
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 text-left">
          <p className="text-sm font-semibold text-gray-700 mb-3">To continue, contact us:</p>
          <a href="mailto:hello@attendease.ng" className="flex items-center gap-2 text-blue-600 text-sm mb-2 hover:underline">
            hello@attendease.ng
          </a>
          <a href="https://wa.me/2348140328268" className="flex items-center gap-2 text-green-600 text-sm hover:underline">
            WhatsApp us
          </a>
        </div>
        <button
          onClick={() => { logout(); navigate('/login') }}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}

function Protected({ children }) {
  const { token } = useAuthStore()
  const [expired, setExpired] = useState(false)
  useEffect(() => {
    if (!token) return
    api.get('/attendance/summary').catch(err => {
      if (err.response?.data?.error === 'trial_expired') {
        setExpired(true)
      }
    })
  }, [token])
  if (!token) return <Navigate to="/login" replace />
  if (expired) return <TrialExpired />
  return children
}

function PublicOnly({ children }) {
  const { token } = useAuthStore()
  return token ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
        <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />
        <Route path="/checkin" element={<Protected><CheckinPage /></Protected>} />
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
          <Route path="settings" element={<SettingsPage />} />
          <Route path="billing" element={<BillingPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
        <Route path="/billing/success" element={<BillingSuccessPage />} />
      </Routes>
    </BrowserRouter>
  )
}
