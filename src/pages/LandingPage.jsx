import { useState } from 'react'
import { Link } from 'react-router-dom'

const plans = [
  {
    name: 'Starter',
    monthly: '₦15,000',
    term: '₦38,250',
    saving: 'Save ₦6,750',
    description: 'Perfect for small schools up to 500 students',
    features: ['Up to 500 students', 'QR code check-in', 'SMS absence alerts', '3 staff accounts', 'Attendance reports', 'CSV export'],
  },
  {
    name: 'Growth',
    monthly: '₦30,000',
    term: '₦76,500',
    saving: 'Save ₦13,500',
    description: 'For growing schools that need more power',
    features: ['Up to 2,000 students', 'QR + facial recognition', 'Unlimited SMS alerts', '10 staff accounts', 'Attendance reports', 'CSV export', 'Priority support'],
    featured: true,
  },
  {
    name: 'Enterprise',
    monthly: '₦60,000',
    term: '₦153,000',
    saving: 'Save ₦27,000',
    description: 'For large schools and school groups',
    features: ['Unlimited students', 'All features included', 'Unlimited staff accounts', 'Custom sender ID', 'Dedicated support'],
  },
]

const testimonials = [
  {
    quote: "We used to spend 30 minutes every morning calling names. Now students scan their card at the gate and we're done before assembly starts. Parents love the SMS alerts.",
    name: 'Mr Lawal Mufutau',
    school: 'Principal, Tendertouch Intellectual School',
    initials: 'LM',
  },
  {
    quote: 'A parent called to thank us for the SMS alert — her daughter had left home but never arrived at school. The alert helped them find her quickly. This system is a lifesaver.',
    name: 'Mr Emmanuel Ifeanyi',
    school: 'Administrator, Crown Heights School Abuja',
    initials: 'EI',
  },
  {
    quote: "Setup was surprisingly easy. We had it running the same day we signed up. The face recognition is impressive — students don't even need to stop walking.",
    name: 'Mrs Fatima Bello',
    school: 'Head Teacher, Sunrise Nursery & Primary PH',
    initials: 'FB',
  },
]

const faqs = [
  {
    question: 'Do students need a smartphone to check in?',
    answer: 'No. There are two ways to check in — QR code or facial recognition. For QR, students carry a printed card (like an ID card) and hold it up to the kiosk camera. For facial recognition, students simply walk past the camera and are identified automatically. Either way, no smartphone is needed at all.',
  },
  {
    question: 'What device do I need for the gate kiosk?',
    answer: 'Any Android tablet or phone works. A budget Android tablet (₦40,000–₦80,000) mounted at the gate with a wall bracket is all you need. The same device handles both QR code scanning and facial recognition — no special hardware required.',
  },
  {
    question: 'How does the SMS to parents work?',
    answer: 'Each school creates their own free Termii account and connects it to AttendEase. SMS costs are billed directly to your Termii account. You control your own SMS budget.',
  },
  {
    question: 'What happens if the internet goes down at school?',
    answer: 'The kiosk tablet can use mobile data (SIM card) instead of WiFi, so it works independently. A basic SIM data plan of ₦2,000–₦3,000 per month is sufficient.',
  },
  {
    question: 'Is our school data safe?',
    answer: "Yes. Each school's data is completely isolated — no other school can see your students or records. All data is encrypted and stored securely on enterprise-grade servers.",
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes. No long-term contracts. Cancel anytime and your data remains accessible for 30 days after cancellation so you can export it.',
  },
  {
    question: 'How long does setup take?',
    answer: 'Most schools are fully set up within one day. Register, add classes and staff, enroll students and print their QR cards, mount the tablet — done. Our support team can guide you through the setup if needed.',
  },
]

export default function LandingPage() {
  const [cycle, setCycle] = useState('term')
  const [menuOpen, setMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState(0)

  return (
    <div className="min-h-screen overflow-hidden bg-white text-[#0f172a]">
      <header className="relative z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Logo />

          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-500 md:flex" aria-label="Main navigation">
            <a className="transition-colors hover:text-[#1d4ed8]" href="#features">Features</a>
            <a className="transition-colors hover:text-[#1d4ed8]" href="#how">How it works</a>
            <a className="transition-colors hover:text-[#1d4ed8]" href="#pricing">Pricing</a>
            <a className="transition-colors hover:text-[#1d4ed8]" href="#faq">FAQ</a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link className="rounded-xl border border-[#1d4ed8] px-5 py-2.5 text-sm font-bold text-[#1d4ed8] transition hover:bg-blue-50" to="/login">Login</Link>
            <Link className="rounded-xl bg-[#1d4ed8] px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_30px_rgba(29,78,216,0.2)] transition hover:-translate-y-0.5 hover:bg-[#1e40af]" to="/register">Start free trial</Link>
          </div>

          <button
            className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-[#1d4ed8] md:hidden"
            onClick={() => setMenuOpen(value => !value)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            <span className="text-xl">{menuOpen ? '×' : '☰'}</span>
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-200 bg-white px-5 py-5 md:hidden">
            <nav className="flex flex-col gap-4 text-sm font-bold">
              <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
              <a href="#how" onClick={() => setMenuOpen(false)}>How it works</a>
              <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
              <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <Link className="rounded-xl border border-[#1d4ed8] px-4 py-3 text-center text-[#1d4ed8]" to="/login">Login</Link>
                <Link className="rounded-xl bg-[#1d4ed8] px-4 py-3 text-center text-white" to="/register">Start free trial</Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main>
        <section className="relative isolate overflow-hidden bg-gradient-to-b from-[#eff6ff] via-white to-white">
          <div className="absolute -left-52 top-16 -z-10 h-[440px] w-[440px] rounded-full bg-[#dbeafe] blur-3xl" />
          <div className="absolute -right-44 top-36 -z-10 h-[400px] w-[400px] rounded-full bg-[#fef3c7] blur-3xl" />

          <div className="mx-auto max-w-7xl px-5 pb-24 pt-16 sm:px-8 lg:pb-28 lg:pt-24">
            <div className="mx-auto flex max-w-6xl flex-col items-center text-center">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3.5 py-2 text-xs font-bold text-[#1d4ed8] shadow-sm">
                <span className="h-2 w-2 rounded-full bg-[#f4b400]" />
                Now live — Nigerian schools welcome
              </div>
              <h1 className="max-w-6xl text-[clamp(3rem,6.3vw,5.7rem)] font-black leading-[1.02] tracking-[-0.06em] text-[#0f172a]">
                <span className="block">The smarter way to take</span>
                <span className="block">
                  <span className="relative whitespace-nowrap text-[#1d4ed8] after:absolute after:-bottom-1 after:left-0 after:h-1.5 after:w-full after:rounded-full after:bg-[#f4b400]">school attendance</span> in Nigeria
                </span>
              </h1>
              <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-500">
                Replace paper registers with QR codes and facial recognition. Parents get instant SMS alerts when their child is absent or late. Set up in one day.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1d4ed8] px-7 py-4 text-sm font-bold text-white shadow-[0_16px_40px_rgba(29,78,216,0.22)] transition hover:-translate-y-1 hover:bg-[#1e40af]" to="/register">
                  Start free 14-day trial <span aria-hidden="true">→</span>
                </Link>
                <Link className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-7 py-4 text-sm font-bold text-[#0f172a] transition hover:border-blue-200 hover:bg-blue-50" to="/login">
                  Login to your school
                </Link>
              </div>
              <div className="mt-9 grid w-full max-w-2xl grid-cols-2 gap-5 sm:grid-cols-4">
                {[['14', 'Days free trial'], ['<1s', 'Check-in time'], ['100%', 'Nigerian networks'], ['0', 'Paper needed']].map(([value, label]) => (
                  <div key={label}>
                    <p className="text-2xl font-black tracking-[-0.04em] text-[#1d4ed8]">{value}</p>
                    <p className="mt-1 text-xs text-slate-400">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mx-auto mt-16 w-full max-w-6xl">
              <DashboardPreview />
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-5 py-6 text-center text-sm font-semibold text-slate-500 sm:px-8">
            Trusted by schools across Lagos, Abuja, Port Harcourt, Ibadan and more
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32" id="features">
          <SectionHeading
            eyebrow="Features"
            title="Everything your school needs to track attendance"
            copy="No more paper, no more manual errors. AttendEase automates the entire process from check-in to parent notification."
          />
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard icon="📱" title="QR code check-in" copy="Every student gets a printed QR card. They scan it at the gate kiosk — attendance recorded in under a second. No smartphone needed." />
            <FeatureCard icon="👤" title="Facial recognition" copy="Students walk past a camera and are identified automatically. No cards, no queues, no physical contact needed." />
            <FeatureCard icon="💬" title="Instant SMS alerts" copy="Parents receive an SMS the moment their child is marked absent or arrives late. Works on all Nigerian networks — MTN, Airtel, Glo, 9mobile." />
            <FeatureCard icon="📊" title="Attendance reports" copy="Track weekly trends, class performance, and chronic absentees. Export to CSV with one click for WAEC and state ministry submissions." />
            <FeatureCard icon="🏫" title="Multi-role access" copy="Admins, teachers, and principals each get their own dashboard. Teachers only see their class. Principals see school-wide data." />
            <FeatureCard icon="📲" title="Works on any device" copy="Install on any Android tablet for the gate kiosk. Teachers check registers on their phones. No special hardware or app download needed." />
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#0f2f83] text-white" id="how">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#f4b400]/15 blur-3xl" />
          <div className="mx-auto grid max-w-7xl gap-16 px-5 py-24 sm:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:py-32">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#facc15]">How it works</p>
              <h2 className="mt-5 text-4xl font-black leading-[1.02] tracking-[-0.045em] sm:text-6xl">Up and running in one day</h2>
              <p className="mt-6 max-w-lg text-base leading-7 text-white/65">No IT team needed. If you can use WhatsApp, you can set up AttendEase.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['1', 'Register your school', 'Create your school account in 2 minutes. Add your classes and staff accounts.'],
                ['2', 'Enroll students', "Take each student's photo and generate their QR card. Print and laminate — done."],
                ['3', 'Mount the kiosk', 'Fix an Android tablet at the school gate. Open AttendEase and pin it to the screen.'],
                ['4', 'Sit back', 'Attendance records itself. Parents get SMS alerts. You get clean reports every day.'],
              ].map(([step, title, text]) => (
                <article className="rounded-[26px] border border-white/10 bg-white/[0.06] p-6 transition hover:bg-white/[0.1]" key={step}>
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f4b400] text-sm font-black text-[#0f2f83]">{step}</span>
                  <h3 className="mt-6 text-lg font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/62">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f8faff]" id="stories">
          <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
            <SectionHeading
              eyebrow="What schools say"
              title="Trusted by Nigerian school administrators"
              copy="Here's what schools using AttendEase have to say."
            />
            <div className="mt-14 grid gap-5 lg:grid-cols-3">
              {testimonials.map((item, index) => (
                <article className={`flex min-h-[330px] flex-col rounded-[30px] border p-7 sm:p-8 ${index === 0 ? 'border-[#1d4ed8] bg-[#1d4ed8] text-white shadow-[0_24px_70px_rgba(29,78,216,0.2)]' : 'border-blue-100 bg-white text-[#0f172a]'}`} key={item.name}>
                  <div className={`text-sm tracking-[0.18em] ${index === 0 ? 'text-[#facc15]' : 'text-[#f4b400]'}`}>★★★★★</div>
                  <blockquote className={`mt-6 flex-1 text-lg font-semibold leading-8 tracking-[-0.015em] ${index === 0 ? 'text-white' : 'text-[#1e293b]'}`}>“{item.quote}”</blockquote>
                  <div className={`mt-8 flex items-center gap-3 border-t pt-5 ${index === 0 ? 'border-white/15' : 'border-slate-100'}`}>
                    <div className={`grid h-11 w-11 place-items-center rounded-xl text-xs font-black ${index === 0 ? 'bg-[#f4b400] text-[#0f2f83]' : 'bg-blue-100 text-[#1d4ed8]'}`}>{item.initials}</div>
                    <div>
                      <p className="text-sm font-black">{item.name}</p>
                      <p className={`mt-0.5 text-xs font-medium ${index === 0 ? 'text-white/65' : 'text-slate-500'}`}>{item.school}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32" id="pricing">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Pricing"
              title="Simple, fair pricing for every school"
              copy="Start free for 14 days. No credit card required. Cancel anytime."
            />
            <div className="inline-flex w-fit rounded-xl border border-blue-100 bg-blue-50 p-1.5" aria-label="Billing cycle">
              <button
                className={`rounded-lg px-5 py-2.5 text-sm font-bold transition ${cycle === 'monthly' ? 'bg-[#1d4ed8] text-white shadow-sm' : 'text-slate-500'}`}
                onClick={() => setCycle('monthly')}
              >
                Monthly
              </button>
              <button
                className={`rounded-lg px-5 py-2.5 text-sm font-bold transition ${cycle === 'term' ? 'bg-[#1d4ed8] text-white shadow-sm' : 'text-slate-500'}`}
                onClick={() => setCycle('term')}
              >
                Per term <span className={`ml-1.5 rounded-full px-2 py-0.5 text-[10px] ${cycle === 'term' ? 'bg-[#facc15] text-[#0f2f83]' : 'bg-[#fef3c7] text-[#a16207]'}`}>15% off</span>
              </button>
            </div>
          </div>

          {cycle === 'term' && (
            <div className="mt-9 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-center text-sm font-bold text-amber-800">
              Pay once per school term (3 months) and save 15% — perfect for Nigerian school terms.
            </div>
          )}

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {plans.map(plan => (
              <article className={`relative flex flex-col rounded-[30px] border p-7 sm:p-8 ${plan.featured ? 'border-[#1d4ed8] bg-[#1d4ed8] text-white shadow-[0_24px_70px_rgba(29,78,216,0.2)]' : 'border-blue-100 bg-white'}`} key={plan.name}>
                {plan.featured && <span className="absolute right-6 top-6 rounded-full bg-[#facc15] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#0f2f83]">Most popular</span>}
                <p className={`text-xs font-black uppercase tracking-[0.18em] ${plan.featured ? 'text-white/55' : 'text-slate-400'}`}>{plan.name}</p>
                <div className="mt-7 flex items-end gap-1.5">
                  <span className="text-4xl font-black tracking-[-0.045em]">{cycle === 'monthly' ? plan.monthly : plan.term}</span>
                  <span className={`pb-1 text-sm ${plan.featured ? 'text-white/50' : 'text-slate-400'}`}>{cycle === 'monthly' ? '/month' : '/term'}</span>
                </div>
                <div className="mt-2 min-h-7">
                  {cycle === 'term' && <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${plan.featured ? 'bg-white/12 text-[#facc15]' : 'bg-amber-50 text-amber-700'}`}>{plan.saving}</span>}
                </div>
                <p className={`mt-4 text-sm leading-6 ${plan.featured ? 'text-white/68' : 'text-slate-500'}`}>{plan.description}</p>
                <ul className="my-7 flex-1 space-y-3">
                  {plan.features.map(feature => (
                    <li className="flex items-center gap-3 text-sm font-medium" key={feature}>
                      <span className={`grid h-5 w-5 place-items-center rounded-full text-[10px] ${plan.featured ? 'bg-white/12 text-[#facc15]' : 'bg-blue-100 text-[#1d4ed8]'}`}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link className={`rounded-xl px-5 py-3.5 text-center text-sm font-bold transition hover:-translate-y-0.5 ${plan.featured ? 'bg-[#facc15] text-[#0f2f83]' : 'bg-blue-50 text-[#1d4ed8] hover:bg-blue-100'}`} to="/register">
                  Start free trial
                </Link>
              </article>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-slate-400">All plans include a 14-day free trial. SMS costs billed separately through your own Termii account.</p>
        </section>

        <section className="border-y border-blue-100 bg-[#f8faff]" id="faq">
          <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
            <div className="text-center">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1d4ed8]">FAQ</p>
              <h2 className="mt-4 whitespace-nowrap text-[clamp(2rem,4.5vw,3.75rem)] font-black leading-none tracking-[-0.05em] text-[#0f172a]">Frequently asked questions</h2>
            </div>
            <div className="mx-auto mt-14 max-w-4xl space-y-3">
              {faqs.map((item, index) => (
                <article className="overflow-hidden rounded-2xl border border-blue-100 bg-white" key={item.question}>
                  <button
                    className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left text-sm font-bold text-[#0f172a] sm:px-6"
                    onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                    aria-expanded={openFaq === index}
                  >
                    {item.question}
                    <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-blue-50 text-lg text-[#1d4ed8]">{openFaq === index ? '−' : '+'}</span>
                  </button>
                  {openFaq === index && <p className="border-t border-blue-50 px-5 py-5 text-sm leading-7 text-slate-500 sm:px-6">{item.answer}</p>}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[36px] bg-[#1d4ed8] px-6 py-16 text-center text-white sm:px-12 lg:py-24">
            <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[#facc15]/20 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="relative">
              <h2 className="mx-auto max-w-3xl text-4xl font-black leading-tight tracking-[-0.045em] sm:text-6xl">Ready to modernise your school's attendance?</h2>
              <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/72 sm:text-base">Join Nigerian schools already using AttendEase. Start your free 14-day trial today — no credit card required.</p>
              <Link className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#facc15] px-7 py-4 text-sm font-black text-[#0f2f83] transition hover:-translate-y-1" to="/register">
                Start free trial now <span>→</span>
              </Link>
              <p className="mt-5 text-xs font-semibold text-white/55">14 days free · No credit card · Cancel anytime</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#0f172a] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Logo dark />
            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">Smart school attendance management built specifically for Nigerian schools.</p>
          </div>
          <div>
            <h4 className="text-sm font-bold">Product</h4>
            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400">
              <a className="hover:text-white" href="#features">Features</a>
              <a className="hover:text-white" href="#pricing">Pricing</a>
              <a className="hover:text-white" href="#how">How it works</a>
              <Link className="hover:text-white" to="/register">Start free trial</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold">Support</h4>
            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400">
              <a className="hover:text-white" href="#faq">FAQ</a>
              <a className="hover:text-white" href="mailto:attendease001@gmail.com">Email us</a>
              <a className="hover:text-white" href="https://wa.me/2348140328268" target="_blank" rel="noreferrer">WhatsApp</a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10">
          <p className="mx-auto max-w-7xl px-5 py-6 text-xs text-slate-500 sm:px-8">© 2025 AttendEase by Feranmite Technology. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[700px]">
      <div className="absolute -inset-5 rounded-[38px] bg-gradient-to-br from-blue-300/45 via-transparent to-amber-200/40 blur-2xl" />
      <div className="relative overflow-hidden rounded-[28px] border border-blue-100 bg-white p-2 shadow-[0_35px_100px_rgba(29,78,216,0.18)]">
        <div className="grid min-h-[520px] grid-cols-[72px_1fr] overflow-hidden rounded-[22px] border border-blue-100 bg-white sm:grid-cols-[185px_1fr]">
          <aside className="flex flex-col border-r border-blue-800 bg-[#123da8] p-3 text-white sm:p-4">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-white">
                <CheckLogo size={17} color="#1d4ed8" />
              </div>
              <div className="hidden sm:block"><p className="text-xs font-bold">Greenfield</p><p className="text-[9px] text-white/45">School workspace</p></div>
            </div>
            <div className="mt-8 space-y-2">
              {['Overview', 'Students', 'Attendance', 'Reports'].map((item, index) => (
                <div className={`flex items-center gap-2 rounded-xl px-2.5 py-2.5 text-[10px] ${index === 0 ? 'bg-white/15 text-white' : 'text-white/50'}`} key={item}>
                  <span className={`h-2 w-2 rounded-full ${index === 0 ? 'bg-[#facc15]' : 'bg-white/25'}`} />
                  <span className="hidden sm:block">{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-auto hidden rounded-2xl bg-white/[0.08] p-3 sm:block">
              <p className="text-[9px] text-white/50">Today’s attendance</p>
              <p className="mt-1 text-xl font-black">92.4%</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full w-[92%] rounded-full bg-[#facc15]" /></div>
            </div>
          </aside>
          <div className="bg-[#f8faff] p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div><p className="text-[10px] font-medium text-slate-400">Thursday, 24 July</p><h2 className="mt-1 text-xl font-black tracking-tight text-[#0f172a] sm:text-2xl">Good morning, Oluwa</h2></div>
              <div className="h-9 w-9 rounded-full border-4 border-white bg-blue-100 shadow-sm" />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {[['842', 'Present', '#dbeafe'], ['54', 'Absent', '#fee2e2'], ['16', 'Late', '#fef3c7'], ['912', 'Students', '#e0e7ff']].map(([value, label, color]) => (
                <div className="rounded-2xl border border-blue-50 bg-white p-3" key={label}>
                  <span className="mb-3 block h-2 w-8 rounded-full" style={{ backgroundColor: color }} />
                  <p className="text-lg font-black text-[#0f172a]">{value}</p><p className="text-[9px] text-slate-400">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 grid gap-3 lg:grid-cols-[1.25fr_.75fr]">
              <div className="rounded-2xl border border-blue-50 bg-white p-4">
                <div className="flex items-center justify-between"><p className="text-[11px] font-bold text-[#0f172a]">Weekly attendance</p><span className="text-[9px] text-slate-400">This week⌄</span></div>
                <div className="mt-6 flex h-24 items-end justify-between gap-2">
                  {[62, 78, 70, 90, 83].map((height, i) => (
                    <div className="flex flex-1 flex-col items-center gap-2" key={i}>
                      <div className="w-full max-w-7 rounded-t-lg bg-[#1d4ed8]" style={{ height: `${height}%`, opacity: 0.5 + (i * 0.1) }} />
                      <span className="text-[8px] text-slate-400">{['M', 'T', 'W', 'T', 'F'][i]}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-[#facc15] p-4 text-[#0f2f83]">
                <p className="text-[10px] font-bold text-[#0f2f83]/60">Arrival status</p>
                <div className="mx-auto mt-3 grid h-20 w-20 place-items-center rounded-full border-[10px] border-[#1d4ed8]/15">
                  <span className="text-lg font-black">92%</span>
                </div>
              </div>
            </div>
            <div className="mt-3 rounded-2xl border border-blue-50 bg-white p-4">
              <div className="flex items-center justify-between"><p className="text-[11px] font-bold text-[#0f172a]">Latest check-ins</p><span className="text-[9px] font-bold text-[#1d4ed8]">View all</span></div>
              <div className="mt-3 space-y-2.5">
                {['Amara Okafor', 'David Ibrahim', 'Teni Adeyemi'].map((name, i) => (
                  <div className="flex items-center gap-2" key={name}>
                    <div className="grid h-7 w-7 place-items-center rounded-full bg-blue-100 text-[8px] font-black text-[#1d4ed8]">{name.split(' ').map(n => n[0]).join('')}</div>
                    <div className="min-w-0 flex-1"><p className="truncate text-[9px] font-bold text-[#0f172a]">{name}</p><p className="text-[8px] text-slate-400">JSS {i + 1} · QR check-in</p></div>
                    <span className="rounded-full bg-blue-50 px-2 py-1 text-[8px] font-bold text-[#1d4ed8]">Present</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ title, copy, icon }) {
  return (
    <article className="group flex min-h-[310px] flex-col rounded-[28px] border border-blue-100 bg-white p-7 transition duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-[0_24px_70px_rgba(29,78,216,0.12)] sm:p-8">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-xl font-black text-[#1d4ed8] transition group-hover:bg-[#1d4ed8] group-hover:text-white">{icon}</span>
      <div className="mt-auto">
        <h3 className="text-2xl font-black tracking-[-0.035em] text-[#0f172a]">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-500">{copy}</p>
      </div>
    </article>
  )
}

function SectionHeading({ eyebrow, title, copy }) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1d4ed8]">{eyebrow}</p>
      <h2 className="mt-4 text-4xl font-black leading-[1.04] tracking-[-0.05em] text-[#0f172a] sm:text-6xl">{title}</h2>
      {copy && <p className="mt-5 max-w-2xl text-base leading-7 text-slate-500">{copy}</p>}
    </div>
  )
}

function Logo({ dark = false }) {
  return (
    <Link to="/" className="flex items-center gap-3" aria-label="AttendEase home">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#1d4ed8] shadow-sm" aria-hidden="true"><CheckLogo /></span>
      <span className={`text-lg font-black tracking-[-0.03em] ${dark ? 'text-white' : 'text-[#0f172a]'}`}>Attend<span className="text-[#1d4ed8]">Ease</span></span>
    </Link>
  )
}

function CheckLogo({ size = 20, color = 'white' }) {
  return (
    <svg viewBox="0 0 512 512" width={size} height={size} fill="none" aria-hidden="true">
      <path d="M156 256 L220 320 L356 192" stroke={color} strokeWidth="60" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
