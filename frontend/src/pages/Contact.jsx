export default function Contact() {
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

        {/* Info */}
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
                <a href="#" className="hover:text-[#1B4332] transition-colors font-semibold">
                  Facebook
                </a>
                <a href="#" className="hover:text-[#1B4332] transition-colors font-semibold">
                  Instagram
                </a>
                <a href="#" className="hover:text-[#1B4332] transition-colors font-semibold">
                  YouTube
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Contact form */}
        <div className="bg-white rounded-2xl shadow p-8">
          <h2 className="text-[#1B4332] font-black text-xl mb-6">
            Send us a message
          </h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1 block">
                Your name
              </label>
              <input
                type="text"
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
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-[#1B4332] transition-colors resize-none"
                placeholder="Your message..."
              />
            </div>
            <button
              className="bg-[#1B4332] text-[#BEFF00] font-bold py-3 rounded-lg hover:bg-[#2D6A4F] transition-colors"
            >
              Send Message
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