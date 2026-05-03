import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'
import { Button, Input } from '../components/ui'

export default function RegisterPage() {
  const [form, setForm] = useState({
    schoolName: '', subdomain: '', adminName: '', email: '', password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuthStore()
  const navigate = useNavigate()

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  // Auto-generate subdomain from school name
  function handleSchoolName(e) {
    const name = e.target.value
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    setForm(f => ({ ...f, schoolName: name, subdomain: slug }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create your school</h1>
          <p className="text-sm text-gray-500 mt-1">Set up AttendEase for your school</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="School name" placeholder="Greenfield Academy" value={form.schoolName} onChange={handleSchoolName} required />

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">School URL</label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                <input
                  className="flex-1 px-3 py-2.5 text-sm outline-none bg-white"
                  placeholder="greenfield"
                  value={form.subdomain}
                  onChange={set('subdomain')}
                  required
                />
                <span className="px-3 py-2.5 text-sm text-gray-400 bg-gray-50 border-l border-gray-200">.attendease.com.ng</span>
              </div>
            </div>

            <Input label="Your full name" placeholder="Chidi Okeke" value={form.adminName} onChange={set('adminName')} required />
            <Input label="Email address" type="email" placeholder="admin@school.com" value={form.email} onChange={set('email')} required />
            <Input label="Password" type="password" placeholder="Min. 8 characters" value={form.password} onChange={set('password')} minLength={8} required />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>
            )}

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Create school account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
