import { useEffect, useState } from 'react'
import BottomNav from './components/BottomNav'
import ChildSwitcher from './components/ChildSwitcher'
import LoginScreen from './components/LoginScreen'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import { useFamily } from './lib/useFamily'
import Placeholder from './screens/Placeholder'

// Główny komponent. Decyduje, co pokazać:
// brak konfiguracji -> instrukcja, brak sesji -> logowanie, jest sesja -> appka.
export default function App() {
  const [session, setSession] = useState(undefined) // undefined = jeszcze sprawdzamy

  useEffect(() => {
    if (!supabase) return
    // Sesja zapamiętana w telefonie z poprzedniego logowania (jeśli jest).
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    // Nasłuch: zalogowanie, wylogowanie, odświeżenie sesji.
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => setSession(newSession))
    return () => data.subscription.unsubscribe()
  }, [])

  if (!isSupabaseConfigured) {
    return (
      <Centered>
        <h1 className="text-xl font-bold mb-2">Brak konfiguracji Supabase</h1>
        <p className="text-slate-600">
          Ustaw zmienne <code>VITE_SUPABASE_URL</code> i <code>VITE_SUPABASE_ANON_KEY</code> (plik{' '}
          <code>.env.local</code> albo ustawienia projektu na Vercelu).
        </p>
      </Centered>
    )
  }
  if (session === undefined) return <Centered>Ładowanie…</Centered>
  if (!session) return <LoginScreen />
  return <FamilyApp user={session.user} />
}

const TABS = [
  { id: 'today', label: 'Dzisiaj', icon: '☀️' },
  { id: 'exercises', label: 'Ćwiczenia', icon: '🤸' },
  { id: 'calendar', label: 'Kalendarz', icon: '📅' },
  { id: 'poop', label: 'Kupa', icon: '💩', onlyWithPoopTracker: true },
]

function FamilyApp({ user }) {
  const family = useFamily(user.id)
  const [childId, setChildId] = useState(() => readStored('childId'))
  const [tab, setTab] = useState('today')

  if (family.status === 'loading') return <Centered>Ładowanie…</Centered>
  if (family.status === 'error') return <Centered>Błąd: {family.error.message}</Centered>
  if (family.status === 'no-family') {
    return (
      <Centered>
        <h1 className="text-xl font-bold mb-2">Konto bez rodziny</h1>
        <p className="text-slate-600 mb-6">
          Jesteś zalogowany jako <b>{user.email}</b>, ale to konto nie jest jeszcze przypisane do rodziny. Uruchom
          skrypt <code>02_add_members.sql</code> w Supabase.
        </p>
        <LogoutButton />
      </Centered>
    )
  }

  // Wybrane dziecko: zapamiętane w telefonie albo pierwsze z listy.
  const child = family.children.find((c) => c.id === childId) ?? family.children[0]
  if (!child) return <Centered>Brak dzieci w bazie.</Centered>

  const tabs = TABS.filter((t) => !t.onlyWithPoopTracker || child.has_poop_tracker)
  // Gdy przełączymy na dziecko bez kalendarza kupy, wracamy do "Dzisiaj".
  const currentTab = tabs.some((t) => t.id === tab) ? tab : 'today'

  function selectChild(id) {
    setChildId(id)
    writeStored('childId', id)
  }

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur px-4 pt-safe pb-3">
        <div className="mx-auto max-w-md">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-slate-500">Cześć, {family.me.display_name}!</span>
            <LogoutButton small />
          </div>
          <ChildSwitcher kids={family.children} selectedId={child.id} onSelect={selectChild} />
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 pb-28">
        {currentTab === 'today' && <Placeholder icon="☀️" title="Dzisiaj" stage={3} child={child} />}
        {currentTab === 'exercises' && <Placeholder icon="🤸" title="Ćwiczenia" stage={2} child={child} />}
        {currentTab === 'calendar' && <Placeholder icon="📅" title="Kalendarz ćwiczeń" stage={3} child={child} />}
        {currentTab === 'poop' && <Placeholder icon="💩" title="Kalendarz kupy" stage={4} child={child} />}
      </main>

      <BottomNav tabs={tabs} current={currentTab} onChange={setTab} />
    </div>
  )
}

function LogoutButton({ small }) {
  function logout() {
    if (window.confirm('Wylogować się z aplikacji?')) supabase.auth.signOut()
  }
  return (
    <button
      onClick={logout}
      className={small ? 'text-sm text-slate-400 px-2 py-1' : 'rounded-2xl bg-slate-200 px-6 py-3 font-semibold'}
    >
      Wyloguj
    </button>
  )
}

function Centered({ children }) {
  return (
    <div className="min-h-dvh flex items-center justify-center px-6 text-center">
      <div className="max-w-sm">{children}</div>
    </div>
  )
}

// Pamięć telefonu (localStorage) bywa niedostępna, np. w trybie prywatnym, stąd try/catch.
function readStored(key) {
  try {
    return localStorage.getItem(`rodzinka:${key}`)
  } catch {
    return null
  }
}
function writeStored(key, value) {
  try {
    localStorage.setItem(`rodzinka:${key}`, value)
  } catch {
    /* trudno, po prostu nie zapamiętamy */
  }
}
