import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, errorMessage: '' }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error?.message || 'Unknown error' }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[40vh] flex items-center justify-center px-6 py-16">
          <div className="max-w-sm w-full text-center px-8 py-12 bg-gray-50 border border-gray-200">
            <div className="text-gray-300 mb-4">
              <svg
                className="w-10 h-10 mx-auto"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l5.654-4.655m5.65-4.65 4.654-5.654a2.548 2.548 0 0 1 3.586 3.586l-5.654 4.655m-5.65 4.65-2.496 3.03a4.5 4.5 0 0 1-1.208.766m0-4.65 4.655-5.653"
                />
              </svg>
            </div>
            <h2 className="font-black uppercase text-lg text-gray-700 mb-2">
              Page crashed
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              An unexpected error occurred. Try reloading this section.
            </p>
            <button
              onClick={() => this.setState({ hasError: false, errorMessage: '' })}
              className="px-6 py-2.5 text-xs font-black uppercase tracking-widest bg-gray-800 hover:bg-gray-900 text-white transition-colors"
            >
              Reload section
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
