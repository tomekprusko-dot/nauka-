// Dolne menu: zakładki pod kciukiem (obsługa jedną ręką).
export default function BottomNav({ tabs, current, onChange }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/95 backdrop-blur pb-safe">
      <div className="mx-auto flex max-w-md">
        {tabs.map((tab) => {
          const active = tab.id === current
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex flex-1 flex-col items-center gap-0.5 pt-2 pb-1 text-xs font-medium ${
                active ? 'text-slate-900' : 'text-slate-400'
              }`}
            >
              <span className={`text-2xl leading-none ${active ? '' : 'grayscale opacity-60'}`}>{tab.icon}</span>
              {tab.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
