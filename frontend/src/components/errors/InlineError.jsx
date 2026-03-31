export default function InlineError({ message, onRetry }) {
  return (
    <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 px-4 py-3">
      <svg
        className="w-4 h-4 text-amber-500 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
        />
      </svg>
      <p className="text-amber-800 text-xs font-medium flex-1">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-amber-700 hover:text-amber-900 text-xs font-black uppercase tracking-widest flex-shrink-0 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  )
}
