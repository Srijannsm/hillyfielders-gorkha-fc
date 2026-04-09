export default function StatCard({ label, value, icon, accent = false }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
      <div className={`h-11 w-11 rounded-lg flex items-center justify-center text-xl flex-shrink-0 ${
        accent ? 'bg-[#a3e635]/15 text-[#6b9a1f]' : 'bg-gray-100 text-gray-500'
      }`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  )
}
