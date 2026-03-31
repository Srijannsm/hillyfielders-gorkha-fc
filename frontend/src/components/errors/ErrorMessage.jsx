const EMPTY_MESSAGES = {
  squad: 'No players have been added yet.',
  fixtures: 'No fixtures scheduled yet. Check back soon.',
  news: 'No news articles yet.',
  gallery: 'No photos have been added yet.',
}

function NetworkIcon() {
  return (
    <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12 20.25h.008v.008H12v-.008Z" />
    </svg>
  )
}

function ServerIcon() {
  return (
    <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  )
}

function EmptyIcon() {
  return (
    <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
    </svg>
  )
}

const CONFIGS = {
  network: {
    wrapper: 'bg-amber-50 border border-amber-200',
    icon: 'text-amber-400',
    heading: 'text-amber-900',
    sub: 'text-amber-700',
    Icon: NetworkIcon,
    title: 'No connection',
    showRetry: true,
    retryClass: 'bg-amber-500 hover:bg-amber-600 text-white',
  },
  server: {
    wrapper: 'bg-red-50 border border-red-200',
    icon: 'text-red-400',
    heading: 'text-red-900',
    sub: 'text-red-700',
    Icon: ServerIcon,
    title: 'Something went wrong',
    showRetry: true,
    retryClass: 'bg-red-500 hover:bg-red-600 text-white',
  },
  empty: {
    wrapper: 'bg-gray-50 border border-gray-200',
    icon: 'text-gray-300',
    heading: 'text-gray-700',
    sub: 'text-gray-500',
    Icon: EmptyIcon,
    title: 'Nothing here yet',
    showRetry: false,
    retryClass: '',
  },
}

export default function ErrorMessage({ type = 'server', message, onRetry, context }) {
  const cfg = CONFIGS[type] || CONFIGS.server
  const { Icon } = cfg

  const subText = type === 'empty'
    ? (EMPTY_MESSAGES[context] || 'No content available.')
    : message

  return (
    <div className="min-h-[40vh] flex items-center justify-center px-6 py-16">
      <div className={`max-w-sm w-full text-center px-8 py-12 ${cfg.wrapper}`}>
        <div className={`mb-4 ${cfg.icon}`}>
          <Icon />
        </div>
        <h2 className={`font-black uppercase text-lg mb-2 ${cfg.heading}`}>
          {cfg.title}
        </h2>
        {subText && (
          <p className={`text-sm mb-6 ${cfg.sub}`}>{subText}</p>
        )}
        {cfg.showRetry && onRetry && (
          <button
            onClick={onRetry}
            className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-colors ${cfg.retryClass}`}
          >
            Retry
          </button>
        )}
      </div>
    </div>
  )
}
