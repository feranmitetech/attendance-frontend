import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Webcam from 'react-webcam'
import { QRCodeSVG } from 'qrcode.react'
import api from '../lib/api'
import { Button, Input, Select, Card, Badge, Spinner, Empty } from '../components/ui'

export function StudentsPage() {
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [filterClass, setFilterClass] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      try {
        const [s, c] = await Promise.all([api.get('/students'), api.get('/classes')])
        setStudents(s.data)
        setClasses(c.data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = students.filter(s => {
    const matchClass = !filterClass || s.class_id === filterClass
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase())
    return matchClass && matchSearch
  })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Students</h1>
        <Button onClick={() => navigate('/students/new')}>+ Enroll student</Button>
      </div>
      <div className="flex gap-3 mb-4">
        <input
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500"
          placeholder="Search by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none bg-white focus:border-blue-500"
          value={filterClass}
          onChange={e => setFilterClass(e.target.value)}
        >
          <option value="">All classes</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <Empty title="No students found" description="Enroll your first student to get started"
          action={<Button onClick={() => navigate('/students/new')}>Enroll student</Button>} />
      ) : (
        <Card>
          <div className="divide-y divide-gray-50">
            {filtered.map(s => (
              <div key={s.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/students/${s.id}`)}>
                {s.photo_url ? (
                  <img src={s.photo_url} alt={s.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-semibold flex-shrink-0">
                    {s.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{s.name}</p>
                  <p className="text-xs text-gray-400">
                    {s.classes?.name} · {s.student_code}
                    {s.face_descriptor
                      ? <span className="text-green-500 ml-2">· face enrolled</span>
                      : <span className="text-amber-500 ml-2">· no face data</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={s.active ? 'green' : 'gray'}>{s.active ? 'Active' : 'Inactive'}</Badge>
                  <span className="text-gray-300">›</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export function StudentFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const webcamRef = useRef(null)

  const [classes, setClasses] = useState([])
  const [form, setForm] = useState({ name: '', class_id: '', parent_phone: '', photo_url: '' })
  const [photoPreview, setPhotoPreview] = useState(null)
  const [showCamera, setShowCamera] = useState(false)
  const [faceStatus, setFaceStatus] = useState('none')
  const [faceDescriptor, setFaceDescriptor] = useState(null)
  const [qrData, setQrData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/classes').then(r => setClasses(r.data))
    if (isEdit) {
      api.get(`/students/${id}`).then(r => {
        const s = r.data
        setForm({ name: s.name, class_id: s.class_id, parent_phone: s.parent_phone, photo_url: s.photo_url || '' })
        if (s.photo_url) setPhotoPreview(s.photo_url)
        if (s.face_descriptor) { setFaceDescriptor(s.face_descriptor); setFaceStatus('found') }
      })
    }
  }, [id])

  async function capturePhoto() {
    const imgSrc = webcamRef.current.getScreenshot()
    setPhotoPreview(imgSrc)
    setForm(f => ({ ...f, photo_url: imgSrc }))
    setShowCamera(false)
    setFaceStatus('detecting')
    setFaceDescriptor(null)
    try {
      const faceapi = await import('@vladmandic/face-api')
      const MODEL_URL = '/models'
      if (!faceapi.nets.tinyFaceDetector.isLoaded) {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ])
      }
      const img = new Image()
      img.src = imgSrc
      await new Promise(resolve => { img.onload = resolve })
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor()
      if (!detection) { setFaceStatus('failed'); return }
      setFaceDescriptor(Array.from(detection.descriptor))
      setFaceStatus('found')
    } catch (err) {
      console.error('Face detection error:', err)
      setFaceStatus('failed')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!photoPreview) { setError('Please capture a photo first.'); return }
    if (faceStatus === 'detecting') { setError('Please wait — face scan still in progress.'); return }
    setLoading(true)
    try {
      const payload = { ...form, face_descriptor: faceDescriptor }
      if (isEdit) {
        await api.patch(`/students/${id}`, payload)
        navigate('/students')
      } else {
        const { data } = await api.post('/students', payload)
        setQrData(data)
      }
    } catch (err) {
  const errData = err.response?.data
  if (errData?.error === 'student_limit_reached') {
    setError(`You have reached your plan limit of ${errData.limit} students. Please upgrade your plan to enroll more students.`)
  } else {
    setError(errData?.error || 'Something went wrong')
  }
} finally {
      setLoading(false)
    }
  }

  if (qrData) {
  return (
    <div className="p-6 max-w-md mx-auto text-center">
      <div className="bg-green-50 rounded-2xl p-6 mb-6">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">{qrData.name} enrolled!</h2>
        <p className="text-sm text-gray-500 mt-1">Student code: {qrData.student_code}</p>
        <div className="flex justify-center gap-3 mt-3">
          <Badge variant="green">QR code ready</Badge>
          {qrData.face_descriptor
            ? <Badge variant="green">Face enrolled</Badge>
            : <Badge variant="amber">No face data</Badge>}
        </div>
      </div>

      {/* Print area — only this shows when printing */}
      <div id="print-area">
        <div style={{
          width: '85.6mm',
          height: '53.98mm',
          margin: '0 auto',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: 'sans-serif',
          background: '#fff',
        }}>
          {/* School name */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '10px', fontWeight: '700', color: '#1d4ed8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              AttendEase
            </p>
            <p style={{ fontSize: '8px', color: '#6b7280', margin: '1px 0 0' }}>
              Student ID Card
            </p>
          </div>

          {/* QR code */}
          <div style={{ padding: '4px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px' }}>
            <QRCodeSVG value={qrData.qr_code} size={80} />
          </div>

          {/* Student info */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', color: '#111827', margin: 0 }}>
              {qrData.name}
            </p>
            <p style={{ fontSize: '8px', color: '#6b7280', margin: '2px 0 0', fontFamily: 'monospace' }}>
              {qrData.student_code}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="secondary" className="flex-1" onClick={() => window.print()}>
          Print QR card
        </Button>
        <Button className="flex-1" onClick={() => {
          setQrData(null)
          setForm({ name: '', class_id: '', parent_phone: '', photo_url: '' })
          setPhotoPreview(null)
          setFaceStatus('none')
          setFaceDescriptor(null)
        }}>
          Enroll another
        </Button>
      </div>
      <button
        className="text-sm text-gray-500 hover:underline mt-3 block mx-auto"
        onClick={() => navigate('/students')}
      >
        Back to students
      </button>
    </div>
  )
}

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/students')} className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold text-gray-900">
          {isEdit ? 'Edit student' : 'Enroll new student'}
        </h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Student photo & face scan</p>
          {showCamera ? (
            <div className="space-y-3">
              <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="w-full rounded-xl"
                videoConstraints={{ facingMode: 'user', width: 480, height: 480 }} />
              <p className="text-xs text-gray-500 text-center">
                Ensure the student's face is clearly visible and well lit
              </p>
              <div className="flex gap-2">
                <Button type="button" className="flex-1" onClick={capturePhoto}>Capture photo</Button>
                <Button type="button" variant="secondary" onClick={() => setShowCamera(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-4">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview"
                  className="w-24 h-24 rounded-xl object-cover border border-gray-200 flex-shrink-0" />
              ) : (
                <div className="w-24 h-24 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              <div className="flex-1 space-y-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowCamera(true)}>
                  {photoPreview ? 'Retake photo' : 'Take photo'}
                </Button>
                {faceStatus === 'detecting' && (
                  <div className="flex items-center gap-2 text-xs text-amber-600">
                    <Spinner size="sm" color="blue" />
                    <span>Scanning face...</span>
                  </div>
                )}
                {faceStatus === 'found' && (
                  <div className="flex items-center gap-2 text-xs text-green-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Face detected and ready</span>
                  </div>
                )}
                {faceStatus === 'failed' && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-red-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>No face detected — retake in better lighting</span>
                    </div>
                    <p className="text-xs text-gray-400">Student can still use QR card to check in</p>
                  </div>
                )}
                {faceStatus === 'none' && (
                  <p className="text-xs text-gray-400">Photo is used for facial recognition check-in</p>
                )}
              </div>
            </div>
          )}
        </div>

        <Input label="Full name" placeholder="Adaeze Okonkwo" value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />

        <Select label="Class" value={form.class_id}
          onChange={e => setForm(f => ({ ...f, class_id: e.target.value }))} required>
          <option value="">Select a class</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>

        <Input label="Parent's phone number" placeholder="08031234567" value={form.parent_phone}
          onChange={e => setForm(f => ({ ...f, parent_phone: e.target.value }))} required />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          {isEdit ? 'Save changes' : 'Enroll student & generate QR'}
        </Button>

        {isEdit && (
          <div className="border-t border-gray-200 pt-5 mt-2">
            <p className="text-sm font-medium text-gray-700 mb-2">Danger zone</p>
            <Button
  type="button"
  variant="danger"
  className="w-full"
  onClick={async () => {
    if (!confirm('Permanently delete this student? This cannot be undone. All their attendance history will also be deleted.')) return
    await api.delete(`/students/${id}`)
    navigate('/students')
  }}
>
  Permanently delete student
</Button>
<p className="text-xs text-gray-400 text-center mt-2">
  This cannot be undone — all data will be permanently removed
</p>
          </div>
        )}
      </form>
    </div>
  )
}
