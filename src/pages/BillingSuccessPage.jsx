import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function BillingSuccessPage() {
  const navigate = useNavigate()

  useEffect(() => {
    setTimeout(() => navigate('/dashboard'), 5000)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment successful!</h1>
        <p className="text-gray-500 mb-6">
          Your subscription is now active. Welcome to AttendEase. You will be redirected to your dashboard in a few seconds.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          Go to dashboard
        </button>
      </div>
    </div>
  )
}
