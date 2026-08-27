import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import api from '../lib/api'
import { Button, Input } from '../components/ui'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email')?.trim().toLowerCase()
  const navigate = useNavigate()
  const [form, setForm] = useState({ code: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/reset-password', {
        email,
        code: form.code,
        new_password: form.password,
      })
      alert('Password reset successfully. Please log in with your new password.')
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  if (!email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 text-center max-w-sm w-full">
          <p className="text-red-500 text-sm mb-4">Your email address is missing. Please request a new code.</p>
          <Link to="/forgot-password" className="text-blue-600 hover:underline text-sm">Request new code</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Set new password</h1>
          <p className="text-sm text-gray-500 mt-1">Enter the code sent to {email}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Verification code" type="text" placeholder="6-digit code"
              inputMode="numeric" autoComplete="one-time-code" maxLength={6}
              value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
              pattern="[0-9]{6}" required />
            <Input label="New password" type="password" placeholder="Min. 8 characters"
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              minLength={8} required />
            <Input label="Confirm new password" type="password" placeholder="Repeat password"
              value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
              required />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Reset password
            </Button>
            <p className="text-center text-sm text-gray-500">
              Code expired? <Link to="/forgot-password" className="text-blue-600 hover:underline">Request a new one</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
