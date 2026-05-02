import { useState, useEffect } from 'react'
import api from '../lib/api'
import { Button, Card, Badge, Input, Select, Spinner, Empty } from '../components/ui'

// ── Classes ───────────────────────────────────────────
export function ClassesPage() {
  const [classes, setClasses] = useState([])
  const [form, setForm] = useState({ name: '', level: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  async function load() {
    const { data } = await api.get('/classes')
    setClasses(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e) {
    e.preventDefault()
    setSaving(true)
    await api.post('/classes', form)
    setForm({ name: '', level: '' })
    setShowForm(false)
    await load()
    setSaving(false)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this class? Students in it will not be deleted.')) return
    await api.delete(`/classes/${id}`)
    load()
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Classes</h1>
        <Button onClick={() => setShowForm(s => !s)}>+ Add class</Button>
      </div>

      {showForm && (
        <Card className="p-5 mb-5">
          <form onSubmit={handleCreate} className="flex gap-3 items-end">
            <Input label="Class name" placeholder="e.g. JSS 2A" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="flex-1" />
            <Input label="Level" placeholder="e.g. JSS 2" value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))} className="w-32" />
            <Button type="submit" loading={saving}>Save</Button>
          </form>
        </Card>
      )}

      {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : classes.length === 0 ? (
        <Empty title="No classes yet" description="Add your first class to start enrolling students" />
      ) : (
        <Card>
          <div className="divide-y divide-gray-50">
            {classes.map(c => (
              <div key={c.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-bold">{c.name.charAt(0)}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.level} {c.users ? `· ${c.users.name}` : ''}</p>
                </div>
                <button onClick={() => handleDelete(c.id)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

// ── Reports ───────────────────────────────────────────
export function ReportsPage() {
  const [summary, setSummary] = useState(null)
  const [records, setRecords] = useState([])
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 6)
    return d.toISOString().split('T')[0]
  })
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    async function load() {
      try {
        const [s, r, c, st] = await Promise.all([
          api.get('/attendance/summary'),
          api.get('/attendance?date=' + new Date().toISOString().split('T')[0]),
          api.get('/classes'),
          api.get('/students'),
        ])
        setSummary(s.data)
        setRecords(r.data)
        setClasses(c.data)
        setStudents(st.data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Calculate class attendance rates
  const classStats = classes.map(cls => {
    const classStudents = students.filter(s => s.class_id === cls.id)
    const classRecords = records.filter(r => r.students?.class_id === cls.id)
    const present = classRecords.filter(r => r.status === 'present' || r.status === 'late').length
    const total = classStudents.length
    const rate = total > 0 ? Math.round((present / total) * 100) : 0
    return { ...cls, present, total, rate }
  }).sort((a, b) => b.rate - a.rate)

  // Export attendance to CSV
  function exportCSV() {
    const headers = ['Student Name', 'Class', 'Date', 'Status', 'Method', 'Check-in Time']
    const rows = records.map(r => [
      r.students?.name || '',
      r.students?.classes?.name || '',
      r.date,
      r.status,
      r.method,
      r.check_in_time?.slice(0, 5) || '',
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Reports</h1>
        <Button variant="secondary" onClick={exportCSV}>Export CSV</Button>
      </div>

      {/* Today's summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-xs text-gray-500">Present today</p>
          <p className="text-2xl font-semibold text-green-700 mt-1">{summary?.present ?? 0}</p>
          <p className="text-xs text-green-600 mt-0.5">{summary?.percentage ?? 0}% attendance</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4">
          <p className="text-xs text-gray-500">Absent today</p>
          <p className="text-2xl font-semibold text-red-600 mt-1">{summary?.absent ?? 0}</p>
          <p className="text-xs text-red-500 mt-0.5">SMS alerts sent</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4">
          <p className="text-xs text-gray-500">Late arrivals</p>
          <p className="text-2xl font-semibold text-amber-600 mt-1">{summary?.late ?? 0}</p>
          <p className="text-xs text-amber-500 mt-0.5">After 8:15 AM</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-xs text-gray-500">Total students</p>
          <p className="text-2xl font-semibold text-blue-700 mt-1">{summary?.total ?? 0}</p>
          <p className="text-xs text-blue-500 mt-0.5">Active enrolments</p>
        </div>
      </div>

      {/* Class performance */}
      <Card className="mb-5">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Class attendance — today</h2>
        </div>
        {classStats.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No classes set up yet</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {classStats.map(cls => (
              <div key={cls.id} className="flex items-center gap-4 px-5 py-3">
                <div className="w-24 flex-shrink-0">
                  <p className="text-sm font-medium text-gray-800">{cls.name}</p>
                  <p className="text-xs text-gray-400">{cls.present}/{cls.total} present</p>
                </div>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      cls.rate >= 90 ? 'bg-green-500' :
                      cls.rate >= 75 ? 'bg-amber-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${cls.rate}%` }}
                  />
                </div>
                <span className={`text-sm font-semibold w-10 text-right flex-shrink-0 ${
                  cls.rate >= 90 ? 'text-green-700' :
                  cls.rate >= 75 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {cls.rate}%
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Today's full register */}
      <Card>
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">
            Today's register — {new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
          </h2>
          <span className="text-xs text-gray-400">{records.length} records</span>
        </div>
        {records.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No attendance records for today</p>
        ) : (
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
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-400">{r.check_in_time?.slice(0, 5) || '—'}</span>
                  <Badge variant={r.status === 'present' ? 'green' : r.status === 'late' ? 'amber' : 'red'}>
                    {r.status}
                  </Badge>
                  <Badge variant="gray">{r.method}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

// ── SMS Logs ──────────────────────────────────────────
export function SmsLogsPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get('/sms-logs')
        setLogs(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">SMS logs</h1>
        <span className="text-sm text-gray-400">{logs.length} messages sent</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : logs.length === 0 ? (
        <Empty title="No SMS logs yet" description="Alerts sent to parents will appear here" />
      ) : (
        <Card>
          <div className="divide-y divide-gray-50">
            {logs.map(l => (
              <div key={l.id} className="flex items-start gap-3 px-5 py-4">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  l.status === 'delivered' ? 'bg-green-500' :
                  l.status === 'failed' ? 'bg-red-500' : 'bg-amber-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{l.recipient_phone}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{l.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(l.sent_at).toLocaleDateString('en-NG', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
                <Badge variant={
                  l.status === 'delivered' ? 'green' :
                  l.status === 'failed' ? 'red' : 'amber'
                }>
                  {l.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

// ── Teachers ──────────────────────────────────────────
export function TeachersPage() {
  const [teachers, setTeachers] = useState([])
  const [classes, setClasses] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'teacher' })
  const [error, setError] = useState('')

  async function load() {
    try {
      const [u, c] = await Promise.all([api.get('/users'), api.get('/classes')])
      setTeachers(u.data.filter(u => u.role !== 'admin'))
      setClasses(c.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await api.post('/users', form)
      setForm({ name: '', email: '', password: '', role: 'teacher' })
      setShowForm(false)
      await load()
    } catch (err) {
  const errData = err.response?.data
  if (errData?.error === 'staff_limit_reached') {
    setError(`You have reached your plan limit of ${errData.limit} staff accounts. Please upgrade your plan to add more.`)
  } else {
    setError(errData?.error || 'Failed to create user')
  }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Remove this teacher? They will no longer be able to log in.')) return
    await api.delete(`/users/${id}`)
    load()
  }

  async function assignTeacher(classId, teacherId) {
    await api.patch(`/classes/${classId}`, { teacher_id: teacherId || null })
    load()
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Teachers & staff</h1>
        <Button onClick={() => setShowForm(s => !s)}>+ Add teacher</Button>
      </div>

      {showForm && (
        <Card className="p-5 mb-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Create teacher account</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <Input label="Full name" placeholder="Mrs Adaeze Okonkwo" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            <Input label="Email address" type="email" placeholder="teacher@school.com" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            <Input label="Password" type="password" placeholder="Min. 8 characters" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} minLength={8} required />
            <Select label="Role" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              <option value="teacher">Teacher</option>
              <option value="principal">Principal</option>
            </Select>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-3">
              <Button type="submit" loading={saving}>Create account</Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Assign teachers to classes */}
      <Card className="mb-5">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Class assignments</h2>
          <p className="text-xs text-gray-400 mt-0.5">Assign a teacher to each class</p>
        </div>
        {classes.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No classes created yet</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {classes.map(cls => (
              <div key={cls.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-bold flex-shrink-0">
                  {cls.name.charAt(0)}
                </div>
                <p className="text-sm font-medium text-gray-800 flex-1">{cls.name}</p>
                <select
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg outline-none bg-white focus:border-blue-500"
                  value={cls.teacher_id || ''}
                  onChange={e => assignTeacher(cls.id, e.target.value)}
                >
                  <option value="">No teacher assigned</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Teachers list */}
      <Card>
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Staff accounts</h2>
        </div>
        {loading ? (
          <div className="flex justify-center py-10"><Spinner size="lg" /></div>
        ) : teachers.length === 0 ? (
          <Empty title="No teachers yet" description="Add teacher accounts so they can view their class register" />
        ) : (
          <div className="divide-y divide-gray-50">
            {teachers.map(t => (
              <div key={t.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-sm font-semibold flex-shrink-0">
                  {t.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.email}</p>
                </div>
                <Badge variant={t.role === 'principal' ? 'blue' : 'gray'}>{t.role}</Badge>
                <button onClick={() => handleDelete(t.id)} className="text-xs text-red-400 hover:text-red-600 ml-2">
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

  export function SettingsPage() {
  const [settings, setSettings] = useState(null)
  const [form, setForm] = useState({ termii_api_key: '', termii_sender_id: '', name: '', contact_email: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get('/settings').then(r => {
      setSettings(r.data)
      setForm({
        termii_api_key: r.data.termii_api_key || '',
        termii_sender_id: r.data.termii_sender_id || '',
        name: r.data.name || '',
        contact_email: r.data.contact_email || '',
      })
    }).finally(() => setLoading(false))
  }, [])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.patch('/settings', form)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const trialDaysLeft = settings?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(settings.trial_ends_at) - new Date()) / (1000 * 60 * 60 * 24)))
    : 0

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">School settings</h1>

      {/* Trial status */}
      <div className={`rounded-xl p-4 mb-6 ${trialDaysLeft > 3 ? 'bg-blue-50' : 'bg-amber-50'}`}>
        <p className={`text-sm font-semibold ${trialDaysLeft > 3 ? 'text-blue-700' : 'text-amber-700'}`}>
          {settings?.status === 'active' ? 'Subscription active' : `Free trial — ${trialDaysLeft} days remaining`}
        </p>
        <p className={`text-xs mt-0.5 ${trialDaysLeft > 3 ? 'text-blue-500' : 'text-amber-500'}`}>
          {settings?.status === 'active'
            ? 'Your subscription is active'
            : trialDaysLeft > 0
              ? `Trial expires on ${new Date(settings?.trial_ends_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}`
              : 'Your trial has expired — contact us to continue'}
        </p>
      </div>

      {loading ? <div className="flex justify-center py-10"><Spinner size="lg" /></div> : (
        <form onSubmit={handleSave} className="space-y-5">

          {/* School info */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">School information</h2>
            <div className="space-y-3">
              <Input label="School name" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <Input label="Contact email" type="email" value={form.contact_email}
                onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))} />
            </div>
          </Card>

          {/* SMS settings */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-1">SMS configuration</h2>
            <p className="text-xs text-gray-400 mb-4">
              Create a free account at <a href="https://termii.com" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">termii.com</a> to get your API key and sender ID. SMS costs are billed directly by Termii to your account.
            </p>
            <div className="space-y-3">
              <Input
                label="Termii API key"
                placeholder="Your Termii API key"
                value={form.termii_api_key}
                onChange={e => setForm(f => ({ ...f, termii_api_key: e.target.value }))}
                type="password"
              />
              <Input
                label="Sender ID"
                placeholder="e.g. SchoolAlert or your school name"
                value={form.termii_sender_id}
                onChange={e => setForm(f => ({ ...f, termii_sender_id: e.target.value }))}
              />
              <p className="text-xs text-gray-400">
                The sender ID must be approved by Termii before SMS can be sent. It appears as the sender name on parent phones.
              </p>
            </div>
          </Card>

          {saved && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
              Settings saved successfully
            </div>
          )}

          <Button type="submit" loading={saving} className="w-full" size="lg">
            Save settings
          </Button>
        </form>
      )}
    </div>
  )
}
