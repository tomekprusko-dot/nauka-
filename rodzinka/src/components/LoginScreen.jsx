import { useState } from 'react'
import { describeError, supabase } from '../lib/supabase'

// Logowanie bez hasła, w dwóch krokach:
// 1) wpisujesz e-mail -> Supabase wysyła wiadomość z kodem,
// 2) przepisujesz kod tutaj -> jesteś zalogowany na stałe.
// Kod zamiast linku, bo na iPhonie link z maila otworzyłby się w Safari,
// a nie w zainstalowanej appce.
export default function LoginScreen() {
  const [step, setStep] = useState('email') // 'email' | 'code'
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function sendCode(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      // Nie zakładaj nowych kont: logować mogą się tylko istniejące (Wy dwoje).
      options: { shouldCreateUser: false },
    })
    setBusy(false)
    if (error) setError(describeError(error))
    else setStep('code')
  }

  async function verifyCode(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: 'email',
    })
    setBusy(false)
    // Przy sukcesie nic nie robimy: App.jsx sam zauważy nową sesję.
    if (error) setError(describeError(error))
  }

  return (
    <div className="min-h-dvh flex flex-col justify-end sm:justify-center px-5 pt-safe pb-safe">
      <div className="mx-auto w-full max-w-sm pb-6">
        <img src="/icons/icon-192.png" alt="" className="mb-4 h-16 w-16 rounded-2xl shadow" />
        <h1 className="text-3xl font-bold">Rodzinka</h1>
        <p className="text-slate-500 mt-1 mb-8">Ćwiczenia i kalendarz dla Zofii i Zuzanny</p>

        {step === 'email' ? (
          <form onSubmit={sendCode} className="space-y-3">
            <label className="block text-sm font-medium text-slate-600" htmlFor="email">
              Twój e-mail
            </label>
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 outline-none focus:border-slate-900"
              placeholder="np. jan@gmail.com"
            />
            <button
              disabled={busy}
              className="w-full rounded-2xl bg-slate-900 py-4 text-lg font-semibold text-white active:scale-[0.98] disabled:opacity-50"
            >
              {busy ? 'Wysyłam…' : 'Wyślij kod'}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyCode} className="space-y-3">
            <p className="text-slate-600">
              Wysłaliśmy kod na <b>{email}</b>. Sprawdź skrzynkę (także spam) i wpisz go poniżej.
            </p>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              pattern="[0-9]{6,10}"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 text-center text-2xl tracking-[0.4em] outline-none focus:border-slate-900"
              placeholder="••••••"
            />
            <button
              disabled={busy}
              className="w-full rounded-2xl bg-slate-900 py-4 text-lg font-semibold text-white active:scale-[0.98] disabled:opacity-50"
            >
              {busy ? 'Sprawdzam…' : 'Zaloguj'}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('email')
                setCode('')
                setError('')
              }}
              className="w-full py-3 text-slate-500"
            >
              ← Zmień e-mail / wyślij ponownie
            </button>
          </form>
        )}

        {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}
      </div>
    </div>
  )
}
