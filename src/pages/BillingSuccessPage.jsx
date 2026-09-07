import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../lib/api'
import { Spinner } from '../components/ui'

export default function BillingSuccessPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const reference = searchParams.get('reference')
  const [status, setStatus] = useState('verifying')
  const [error, setError] = useState('')

  useEffect(() => {
    async function verify() {
      if (!reference) {
        setError('The payment reference is missing. Please return to billing and try again.')
        setStatus('failed')
        return
      }
      try {
        await api.post('/payments/verify', { reference })
        setStatus('success')
        setTimeout(() => navigate('/dashboard'), 3000)
      } catch (err) {
        console.error('Verification error:', err)
        setError(err.response?.data?.error || 'We could not verify this payment. Please contact support if you were charged.')
        setStatus('failed')
      }
    }
    verify()
  }, [reference])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {status === 'verifying' ? (
          <>
            <Spinner size="lg" />
            <p className="text-gray-500 mt-4">Verifying your payment...</p>
          </>
        ) : status === 'success' ? (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment successful!</h1>
            <p className="text-gray-500 mb-6">
              Your subscription is now active. Redirecting to your dashboard...
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Go to dashboard
            </button>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment verification failed</h1>
            <p className="text-gray-500 mb-6">{error}</p>
            <button
              onClick={() => navigate('/billing')}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Return to billing
            </button>
          </>
        )}
      </div>
    </div>
  )
}
