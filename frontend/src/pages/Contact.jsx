import { useState } from 'react'
import { sendContactMessage } from '../services/api'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState(null) // null | 'sending' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

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
      setErrorMsg(err.response?.data?.error || 'Something went wrong. Please try again.')
    }
  }

  const inputClass = "w-full border border-gray-200 text-gray-900 text-sm px-4 py-3 focus:outline-none focus:border-gfc-700 transition-colors placeholder:text-gray-300 rounded-none"

  return (
    <div>
      {/* Header (dark) */}
      <section className="section-bg bg-gfc-900 text-white pt-20 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="eyebrow mb-5">Get in Touch</p>
          <h1 className="font-black uppercase leading-none" style={{ fontSize: 'clamp(48px, 8vw, 88px)' }}>
            Contact Us
          </h1>
        </div>
      </section>

      {/* Body (white) */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* Club info */}
          <div className="lg:col-span-2">
            <h2 className="text-gray-900 font-black uppercase text-2xl mb-8">Hillyfielders Gorkha FC</h2>
            <div className="flex flex-col gap-7">
              {[
                { label: 'Location', content: <p className="text-gray-500 text-sm leading-relaxed">Gorkha, Gandaki Pradesh<br />Nepal</p> },
                { label: 'Home Ground', content: <p className="text-gray-500 text-sm">TOC Turf, Gorkha</p> },
                {
                  label: 'Email',
                  content: (
                    <a href="mailto:info@gorkhafc.com" className="text-gray-500 text-sm hover:text-gfc-700 transition-colors">
                      info@gorkhafc.com
                    </a>
                  )
                },
              ].map(({ label, content }) => (
                <div key={label}>
                  <p className="eyebrow-light mb-2">{label}</p>
                  {content}
                </div>
              ))}

              <div>
                <p className="eyebrow-light mb-3">Follow Us</p>
                <div className="flex gap-2">
                  {[
                    { label: 'Facebook',  href: 'https://www.facebook.com/HillyFielders/' },
                    { label: 'Instagram', href: '#' },
                    { label: 'YouTube',   href: '#' },
                  ].map(s => (
                    <a
                      key={s.label}
                      href={s.href}
                      target={s.href !== '#' ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      className="border border-gray-200 hover:border-gfc-700 text-gray-400 hover:text-gfc-700 text-[10px] font-black px-3 py-2 uppercase tracking-widest transition-colors"
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-3 border border-gray-100 p-8 shadow-sm">
            <h2 className="text-gray-900 font-black uppercase text-lg mb-7 flex items-center gap-3">
              <span className="w-5 h-0.5 bg-gfc-700" />
              Send us a message
            </h2>

            {status === 'success' && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 mb-6 font-semibold">
                Message sent! We'll get back to you within 48 hours.
              </div>
            )}
            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 mb-6">
                {errorMsg}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 block">Your Name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} className={inputClass} placeholder="Hari Bahadur" />
              </div>
              <div>
                <label className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 block">Email Address</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} placeholder="hari@example.com" />
              </div>
              <div>
                <label className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 block">Message</label>
                <textarea rows={5} name="message" value={form.message} onChange={handleChange} className={inputClass + ' resize-none'} placeholder="Your message..." />
              </div>
              <button
                onClick={handleSubmit}
                disabled={status === 'sending'}
                className={`font-black text-xs uppercase tracking-widest py-4 transition-colors mt-1 ${
                  status === 'sending'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gfc-700 text-gfc-lime hover:bg-gfc-900 cursor-pointer'
                }`}
              >
                {status === 'sending' ? 'Sending...' : 'Send Message'}
              </button>
              <p className="text-gray-400 text-xs text-center">We'll respond within 48 hours.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
