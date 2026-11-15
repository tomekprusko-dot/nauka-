import { childColors } from '../lib/colors'

// Przełącznik dziecka na górze ekranu (Zofia / Zuzanna).
export default function ChildSwitcher({ kids, selectedId, onSelect }) {
  return (
    <div className="flex gap-2 rounded-2xl bg-slate-200/70 p-1">
      {kids.map((child) => {
        const active = child.id === selectedId
        return (
          <button
            key={child.id}
            onClick={() => onSelect(child.id)}
            className={`flex-1 rounded-xl py-3 text-lg font-semibold transition ${
              active ? `${childColors(child.color).solid} shadow` : 'text-slate-600'
            }`}
          >
            {child.name}
          </button>
        )
      })}
    </div>
  )
}
