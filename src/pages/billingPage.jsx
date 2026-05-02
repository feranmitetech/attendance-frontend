import { useState, useEffect } from 'react'
import api from '../lib/api'
import { useAuthStore } from '../store/auth.store'
import { Card, Button, Badge, Spinner } from '../components/ui'

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '₦15,000',
    period: '/month',
    desc: 'Perfect for small schools',
    features: ['Up to 500 students', 'QR code check-in', 'SMS absence alerts', '3 staff accounts', 'Attendance reports', 'CSV export'],
    color: 'border-gray-200',
    btnClass: 'border border-blue-600 text-blue-600 hover:bg-blue-50',
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '₦30,000',
    period: '/month',
    desc: 'For growing schools',
    features: ['Up to 2,000 students', 'QR + facial recognition', 'Unlimited SMS alerts', '10 staff accounts', 'Advanced reports', 'Priority support'],
    color: 'border-blue-600',
    featured: true,
    btnClass: 'bg-blue-600 text-white hover:bg-blue-700',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '₦60,000',
    period: '/month',
    desc: 'For large schools',
    features: ['Unlimited students', 'All features included', 'Unlimited staff accounts', 'Custom sender ID', 'Dedicated support'],
    color: 'border-gray-200',
    btnClass: 'border border-blue-600 text-blue-600 hover:bg-blue-50',
  },
]

export default function BillingPage() {
  const { user } = useAuthStore()
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState(null)

  useEffect(() => {
    api.get('/payments/status')
      .then(r => setStatus(r.data))
      .finally(() => setLoading(false))
  }, [])

  async function handleSubscribe(planId) {
    setSubscribing(planId)
    try {
      const { data } = await api.post('/payments/initialize', { plan: planId })
      // Redirect to Paystack payment page
      window.location.href = data.authorization_url
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to initialize payment')
    } finally {
      setSubscribing(null)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Choose your plan</h1>
        <p className="text-gray-500">
          {status?.status === 'active'
            ? `You are currently on the ${status.plan} plan`
            : `Your free trial has ${status?.trial_days_left || 0} days remaining`}
        </p>
      </div>

      {/* Current plan banner */}
      {status?.status === 'active' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-green-800">
              Active subscription — {status.plan} plan
            </p>
            <p className="text-xs text-green-600 mt-0.5">
              Renews on {new Date(status.subscription_end_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <Badge variant="green">Active</Badge>
        </div>
      )}

      {/* Trial banner */}
      {status?.status !== 'active' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-amber-800">
            {status?.trial_days_left > 0
              ? `Free trial — ${status.trial_days_left} days remaining`
              : 'Your free trial has expired'}
          </p>
          <p className="text-xs text-amber-600 mt-0.5">
            Subscribe to a plan below to continue using AttendEase after your trial ends
          </p>
        </div>
      )}

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {PLANS.map(plan => (
          <div key={plan.id}
            className={`bg-white rounded-2xl border-2 ${plan.color} p-6 flex flex-col relative`}>
            {plan.featured && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                Most popular
              </div>
            )}
            <div className="mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{plan.name}</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-400 text-sm mb-1">{plan.period}</span>
              </div>
              <p className="text-sm text-gray-500">{plan.desc}</p>
            </div>

            <ul className="space-y-2 flex-1 mb-6">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-2.5 h-2.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={subscribing === plan.id || (status?.status === 'active' && status?.plan === plan.id)}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${plan.btnClass} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {subscribing === plan.id ? 'Redirecting...' :
                status?.status === 'active' && status?.plan === plan.id ? 'Current plan' :
                'Subscribe now'}
            </button>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400">
        Payments are processed securely by Paystack. SMS costs are billed separately through your own Termii account.
      </p>
    </div>
  )
}
