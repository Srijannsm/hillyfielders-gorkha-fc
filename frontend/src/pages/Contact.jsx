import { useState } from 'react'
import { sendContactMessage } from '../services/api'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState(null) // null | 'sending' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) {
      setStatus('error')
      setErrorMsg('Please fill in all fields.')
      return
    }

    setStatus('sending')
    try {
      await sendContactMessage(form)
      setStatus('success')
      setForm({ name: '', email: '', message: '' })
    } catch (err) {
      setStatus('error')
      setErrorMsg(
        err.response?.data?.error || 'Something went wrong. Please try again.'
      )
    }
  }

  return (
    <div>
      <section className="bg-[#1B4332] text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-[#BEFF00] text-sm font-semibold uppercase tracking-widest mb-2">
            Get in Touch
          </p>
          <h1 className="text-5xl font-black">Contact Us</h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* Club info */}
        <div>
          <h2 className="text-[#1B4332] font-black text-2xl mb-6">
            Hillyfielders Gorkha FC
          </h2>
          <div className="flex flex-col gap-5 text-gray-600">
            <div>
              <p className="font-semibold text-[#1B4332] mb-1">Location</p>
              <p>Gorkha, Gandaki Pradesh, Nepal</p>
            </div>
            <div>
              <p className="font-semibold text-[#1B4332] mb-1">Email</p>
              
              <a  href="mailto:info@gorkhafc.com"
                className="hover:text-[#1B4332] transition-colors"
              >
                info@gorkhafc.com
              </a>
            </div>
            <div>
              <p className="font-semibold text-[#1B4332] mb-1">Follow Us</p>
              <div className="flex gap-4">
                <a href="#" className="hover:text-[#1B4332] transition-colors font-semibold">Facebook</a>
                <a href="#" className="hover:text-[#1B4332] transition-colors font-semibold">Instagram</a>
                <a href="#" className="hover:text-[#1B4332] transition-colors font-semibold">YouTube</a>
              </div>
            </div>
          </div>
        </div>

        {/* Contact form */}
        <div className="bg-white rounded-2xl shadow p-8">
          <h2 className="text-[#1B4332] font-black text-xl mb-6">
            Send us a message
          </h2>

          {/* Success message */}
          {status === 'success' && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-6 font-semibold">
              Message sent! We'll get back to you within 48 hours.
            </div>
          )}

          {/* Error message */}
          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-6">
              {errorMsg}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1 block">
                Your name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-[#1B4332] transition-colors"
                placeholder="Hari Bahadur"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1 block">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-[#1B4332] transition-colors"
                placeholder="hari@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1 block">
                Message
              </label>
              <textarea
                rows={5}
                name="message"
                value={form.message}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-[#1B4332] transition-colors resize-none"
                placeholder="Your message..."
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={status === 'sending'}
              className={`font-bold py-3 rounded-lg transition-colors ${
                status === 'sending'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#1B4332] text-[#BEFF00] hover:bg-[#2D6A4F]'
              }`}
            >
              {status === 'sending' ? 'Sending...' : 'Send Message'}
            </button>
            <p className="text-gray-400 text-xs text-center">
              We'll get back to you within 48 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}