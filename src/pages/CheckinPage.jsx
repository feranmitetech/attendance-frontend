import { useState, useEffect, useRef, useCallback } from 'react'
import Webcam from 'react-webcam'
import api from '../lib/api'
import { Button } from '../components/ui'

const MODES = { idle: 'idle', scanning: 'scanning', success: 'success', error: 'error' }

export default function CheckinPage() {
  const [action, setAction] = useState('checkin')   // 'checkin' | 'checkout'
  const [method, setMethod] = useState('qr')        // 'qr' | 'face'
  const [mode, setMode] = useState(MODES.idle)
  const [result, setResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [allStudents, setAllStudents] = useState([])
  const webcamRef = useRef(null)
  const scanIntervalRef = useRef(null)
  const resetTimerRef = useRef(null)

  useEffect(() => {
    api.get('/students').then(r => setAllStudents(r.data)).catch(() => {})
  }, [])

  function scheduleReset() {
    clearTimeout(resetTimerRef.current)
    resetTimerRef.current = setTimeout(() => {
      setMode(MODES.idle)
      setResult(null)
      setErrorMsg('')
    }, 4000)
  }

  async function processQR(qrCode) {
    if (mode !== MODES.idle) return
    setMode(MODES.scanning)
    try {
      const endpoint = action === 'checkin' ? '/attendance/checkin' : '/attendance/checkout'
      const { data } = await api.post(endpoint, { method: 'qr', qr_code: qrCode })
      setResult(data)
      setMode(MODES.success)
      scheduleReset()
    } catch (err) {
      const msg = err.response?.data?.error || `${action === 'checkin' ? 'Check-in' : 'Check-out'} failed`
      setErrorMsg(msg)
      setMode(MODES.error)
      scheduleReset()
    }
  }

  const startQRScan = useCallback(() => {
    scanIntervalRef.current = setInterval(async () => {
      if (!webcamRef.current || mode !== MODES.idle) return
      const video = webcamRef.current.video
      if (!video || video.readyState !== 4) return

      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      const jsQR = (await import('jsqr')).default
      const code = jsQR(imageData.data, imageData.width, imageData.height)
      if (code?.data) {
        clearInterval(scanIntervalRef.current)
        processQR(code.data)
      }
    }, 500)
  }, [mode, action])

  useEffect(() => {
    if (method === 'qr') startQRScan()
    return () => clearInterval(scanIntervalRef.current)
  }, [method, action, startQRScan])

  async function captureFace() {
    if (mode !== MODES.idle || !webcamRef.current) return
    setMode(MODES.scanning)
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

      const video = webcamRef.current.video
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor()

      if (!detection) {
        setErrorMsg('No face detected. Please look at the camera.')
        setMode(MODES.error)
        scheduleReset()
        return
      }

      const queryDescriptor = detection.descriptor
      let bestMatch = null
      let bestDistance = Infinity

      for (const student of allStudents) {
        if (!student.face_descriptor) continue
        const stored = new Float32Array(Object.values(student.face_descriptor))
        const distance = faceapi.euclideanDistance(queryDescriptor, stored)
        if (distance < bestDistance) {
          bestDistance = distance
          bestMatch = student
        }
      }

      if (!bestMatch || bestDistance > 0.5) {
        setErrorMsg('Face not recognised. Please try again or use QR card.')
        setMode(MODES.error)
        scheduleReset()
        return
      }

      const endpoint = action === 'checkin' ? '/attendance/checkin' : '/attendance/checkout'
      const { data } = await api.post(endpoint, { method: 'face', student_id: bestMatch.id })
      setResult(data)
      setMode(MODES.success)
      scheduleReset()
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Face scan failed')
      setMode(MODES.error)
      scheduleReset()
    }
  }

  const statusColor = {
    [MODES.idle]: action === 'checkout' ? 'border-purple-400' : 'border-blue-400',
    [MODES.scanning]: 'border-amber-400',
    [MODES.success]: 'border-green-400',
    [MODES.error]: 'border-red-400',
  }

  const isCheckout = action === 'checkout'

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">

      {/* Check In / Check Out action toggle */}
      <div className="flex bg-gray-800 rounded-xl p-1 gap-1 mb-6">
        {[
          { key: 'checkin', label: '↓ Check In' },
          { key: 'checkout', label: '↑ Check Out' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => {
              setAction(key)
              setMode(MODES.idle)
              setResult(null)
              setErrorMsg('')
              clearInterval(scanIntervalRef.current)
            }}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
              action === key
                ? key === 'checkout'
                  ? 'bg-purple-500 text-white'
                  : 'bg-blue-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white">AttendEase</h1>
        <p className="text-gray-400 text-sm mt-1">
          {isCheckout
            ? method === 'qr'
              ? 'Hold your QR card to check out'
              : 'Look at the camera to check out'
            : method === 'qr'
              ? 'Hold your QR card up to the camera'
              : 'Look directly at the camera'}
        </p>
      </div>

      {/* Camera frame */}
      <div
        className={`relative rounded-2xl overflow-hidden border-4 ${statusColor[mode]} transition-colors mb-6`}
        style={{ width: 320, height: 320 }}
      >
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="w-full h-full object-cover"
          videoConstraints={{ width: 320, height: 320, facingMode: method === 'qr' ? 'environment' : 'user' }}
        />

        {mode === MODES.scanning && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {mode === MODES.success && (
          <div className={`absolute inset-0 flex flex-col items-center justify-center text-white ${isCheckout ? 'bg-purple-900/80' : 'bg-green-900/80'}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${isCheckout ? 'bg-purple-500' : 'bg-green-500'}`}>
              {isCheckout ? (
                // Arrow up icon for checkout
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : (
                // Tick icon for checkin
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <p className="text-xl font-bold">{result?.student?.name}</p>
            <p className={`text-sm mt-1 ${isCheckout ? 'text-purple-200' : 'text-green-200'}`}>
              {isCheckout
                ? `Checked out · ${result?.check_out_time?.slice(0, 5)}`
                : `${result?.status} · ${result?.check_in_time?.slice(0, 5)}`}
            </p>
          </div>
        )}

        {mode === MODES.error && (
          <div className="absolute inset-0 bg-red-900/80 flex flex-col items-center justify-center text-white px-4 text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-3">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-sm font-medium">{errorMsg}</p>
          </div>
        )}

        {method === 'qr' && mode === MODES.idle && (
          <>
            <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-white rounded-tl-sm" />
            <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-white rounded-tr-sm" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-white rounded-bl-sm" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-white rounded-br-sm" />
          </>
        )}
      </div>

      {method === 'face' && mode === MODES.idle && (
        <Button
          onClick={captureFace}
          size="lg"
          className={`mb-4 text-white border-none ${isCheckout ? 'bg-purple-500 hover:bg-purple-400' : 'bg-blue-500 hover:bg-blue-400'}`}
        >
          {isCheckout ? 'Check me out' : 'Identify me'}
        </Button>
      )}

      {/* QR / Face method switcher */}
      <div className="flex bg-gray-800 rounded-xl p-1 gap-1">
        {[{ key: 'qr', label: 'QR card' }, { key: 'face', label: 'Face scan' }].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => {
              setMethod(key)
              setMode(MODES.idle)
              clearInterval(scanIntervalRef.current)
            }}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              method === key ? 'bg-white text-gray-900' : 'text-gray-400 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="text-gray-600 text-xs mt-6">
        {new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  )
}