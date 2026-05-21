import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { StatCard, Card, Badge, Button, Spinner } from '../components/ui'
import { useAuthStore } from '../store/auth.store'

export default function DashboardPage() {
  const { user, school } = useAuthStore()
  const [summary, setSummary] = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [s, r] = await Promise.all([
          api.get('/attendance/summary'),
          api.get('/attendance?date=' + new Date().toISOString().split('T')[0]),
        ])
        setSummary(s.data)
        setRecent(r.data.slice(0, 8))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const today = new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Good morning, {user?.name?.split(' ')[0]}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{today}</p>
        </div>
        {user?.role === 'admin' && (
  <Link to="/checkin">
    <Button variant="primary">Open kiosk</Button>
  </Link>
)}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard label="Present today" value={summary?.present ?? 0} sub={`${summary?.percentage ?? 0}%`} color="green" />
            <StatCard label="Absent" value={summary?.absent ?? 0} sub="SMS sent" color="red" />
            <StatCard label="Late arrivals" value={summary?.late ?? 0} color="amber" />
            <StatCard label="Total students" value={summary?.total ?? 0} color="blue" />
          </div>

          {/* Recent check-ins */}
          <Card>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800">Recent check-ins</h2>
              <Link to="/attendance" className="text-xs text-blue-600 hover:underline">View all</Link>
            </div>
            {recent.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">No check-ins recorded yet today</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {recent.map(r => (
                  <div key={r.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold flex-shrink-0">
                      {r.students?.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{r.students?.name}</p>
                      <p className="text-xs text-gray-400">{r.students?.classes?.name} · {r.method}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={r.status === 'present' ? 'green' : r.status === 'late' ? 'amber' : 'red'}>
                        {r.status}
                      </Badge>
                      <span className="text-xs text-gray-400">{r.check_in_time?.slice(0, 5)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Quick actions */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
            {[
              user?.role === 'admin' && { to: '/students/new', label: 'Enroll student', desc: 'Add a new student', color: 'bg-blue-50 text-blue-700' },
              user?.role === 'admin' && { to: '/checkin', label: 'Open kiosk', desc: 'QR & face check-in', color: 'bg-green-50 text-green-700' },
              { to: '/reports', label: 'View reports', desc: 'Attendance analytics', color: 'bg-purple-50 text-purple-700' },
              user?.role === 'admin' && { to: '/attendance', label: 'Mark absent', desc: 'Send SMS alerts', color: 'bg-red-50 text-red-700' },
            ].filter(Boolean).map(({ to, label, desc, color }) => (
              <Link key={to} to={to}>
                <div className={`${color} rounded-xl p-4 hover:opacity-80 transition-opacity`}>
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs opacity-70 mt-0.5">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}