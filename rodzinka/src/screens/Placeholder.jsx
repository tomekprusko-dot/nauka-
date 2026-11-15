// Tymczasowy ekran dla funkcji z kolejnych etapów.
export default function Placeholder({ icon, title, stage, child }) {
  return (
    <div className="mt-10 text-center text-slate-500">
      <div className="text-6xl mb-4">{icon}</div>
      <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
      <p className="mt-1">dla: {child.name}</p>
      <p className="mt-6 inline-block rounded-full bg-slate-200 px-4 py-1 text-sm">Wkrótce, etap {stage}</p>
    </div>
  )
}
