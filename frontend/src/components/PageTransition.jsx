import { useEffect } from 'react'

/**
 * Wrap <Routes> with this component and pass key={location.pathname} from the parent.
 * Each route change remounts this component → scrolls to top + replays the fadeUp animation.
 */
export default function PageTransition({ children }) {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="animate-fade">
      {children}
    </div>
  )
}
