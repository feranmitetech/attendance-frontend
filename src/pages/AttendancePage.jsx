import { useState, useEffect } from 'react'
import api from '../lib/api'
import { Badge, Card, Button, Spinner, Empty } from '../components/ui'
import { useAuthStore } from '../store/auth.store'

export default function AttendancePage() {
  const { user } = useAuthStore()
  const isTeacher = user?.role === 'teacher'

  const [records, setRecords] = useState([])
  const [summary, setSummary] = useState(null)
  const [classes, setClasses] = useState([])
  const [myClass, setMyClass] = useState(null)
  const [filterClass, setFilterClass] = useState('')
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)

  useEffect(() => {
    api.get('/classes').then(r => {
      setClasses(r.data)
      if (isTeacher) {
        const assigned = r.data.find(c => c.teacher_id === user.id)
        if (assigned) {
          setMyClass(assigned)
          setFilterClass(assigned.id)
        }
      }
    })
  }, [])

  async function load() {
    setLoading(true)
    try {
      const params = new URLSearchParams({ date: filterDate })
      if (filterClass) params.append('class_id', filterClass)
      const [r, s] = await Promise.all([
        api.get('/attendance?' + params),
        api.get('/attendance/summary'),
      ])
      setRecords(r.data)
      setSummary(s.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [filterDate, filterClass])

  async function handleMarkAbsent() {
    if (!confirm('Mark all students with no record today as absent and send SMS alerts?')) return
    setMarking(true)
    try {
      const { data } = await api.post('/attendance/mark-absent')
      alert(`Done. ${data.absent_count} students marked absent. SMS alerts sent.`)
      load()
    } catch (e) {
      alert('Failed: ' + (e.response?.data?.error || e.message))
    } finally {
      setMarking(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {isTeacher ? `${myClass?.name || 'My class'} register` : 'Attendance register'}
          </h1>
          {isTeacher && !myClass && (
            <p className="text-sm text-amber-500 mt-0.5">
              You are not assigned to any class yet — contact your admin
            </p>
          )}
        </div>
        {user?.role === 'admin' && (
  <Button variant="danger" size="sm" onClick={handleMarkAbsent} loading={marking}>
    Mark absent + send SMS
  </Button>
)}
      </div>

      {summary && (
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Present', value: summary.present, color: 'text-green-700', bg: 'bg-green-50' },
            { label: 'Absent', value: summary.absent, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Late', value: summary.late, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Rate', value: summary.percentage + '%', color: 'text-blue-700', bg: 'bg-blue-50' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl p-4`}>
              <p className="text-xs text-gray-500">{label}</p>
              <p className={`text-2xl font-semibold mt-1 ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {user?.role !== 'teacher' && (
  <div className="flex gap-3 mb-4">
          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 bg-white"
          />
          <select
            value={filterClass}
            onChange={e => setFilterClass(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none bg-white focus:border-blue-500"
          >
            <option value="">All classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      {isTeacher && (
        <div className="mb-4">
          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 bg-white"
          />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : records.length === 0 ? (
        <Empty title="No records for this date" description="Open the kiosk to start checking in students" />
      ) : (
        <Card>
          <div className="divide-y divide-gray-50">
            {records.map(r => (
              <div key={r.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold flex-shrink-0">
                  {r.students?.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{r.students?.name}</p>
                  <p className="text-xs text-gray-400">{r.students?.classes?.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{r.check_in_time?.slice(0,5) || '—'}</span>
                  <Badge variant={r.status === 'present' ? 'green' : r.status === 'late' ? 'amber' : 'red'}>
                    {r.status}
                  </Badge>
                  <Badge variant="gray">{r.method}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}