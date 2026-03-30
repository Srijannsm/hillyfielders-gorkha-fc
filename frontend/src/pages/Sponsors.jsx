import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getSponsors } from '../services/api'
import SEO from '../components/SEO'

const TIER_ORDER = ['platinum', 'gold', 'silver']
const TIER_CONFIG = {
  platinum: {
    label: 'Platinum Partners',
    cardBorder: 'border-gfc-700 hover:border-gfc-700',
    topBar: 'bg-gfc-lime',
    badge: 'bg-gfc-lime text-gfc-900',
    logoH: 'h-24',
  },
  gold: {
    label: 'Gold Partners',
    cardBorder: 'border-gray-200 hover:border-yellow-300',
    topBar: 'bg-yellow-400',
    badge: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    logoH: 'h-18',
  },
  silver: {
    label: 'Silver Partners',
    cardBorder: 'border-gray-200 hover:border-gray-400',
    topBar: 'bg-gray-300',
    badge: 'bg-gray-100 text-gray-500',
    logoH: 'h-14',
  },
}

export default function Sponsors() {
  const { data: sponsors, isLoading } = useQuery({
    queryKey: ['sponsors'],
    queryFn: getSponsors,
  })

  if (isLoading) return (
    <div className="min-h-screen bg-gfc-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-gfc-lime font-black text-3xl animate-pulse mb-2">GFC</div>
        <p className="text-gray-600 text-[10px] uppercase tracking-widest">Loading...</p>
      </div>
    </div>
  )

  const grouped = TIER_ORDER.reduce((acc, tier) => {
    const inTier = sponsors?.filter(s => s.tier === tier) || []
    if (inTier.length) acc[tier] = inTier
    return acc
  }, {})

  return (
    <div>
      <SEO
        title="Club Sponsors"
        description="Our valued sponsors and partners who support Hillyfielders Gorkha FC."
      />
      {/* Header (dark) */}
      <section className="section-bg bg-gfc-900 text-white pt-10 pb-10 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="eyebrow mb-5">Our Partners</p>
          <h1 className="font-black uppercase leading-none" style={{ fontSize: 'clamp(48px, 8vw, 88px)' }}>
            Club Sponsors
          </h1>
          <p className="text-gray-500 mt-4 max-w-xl text-sm leading-relaxed">
            We are grateful to our sponsors for their continued support of Hillyfielders Gorkha FC.
          </p>
        </div>
      </section>

      {/* Sponsor content (white) */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          {!sponsors?.length ? (
            <div className="text-center py-24 border border-gray-100 bg-gray-50">
              <p className="text-gfc-700/20 font-black text-5xl mb-4" style={{ fontFamily: 'Oswald, sans-serif' }}>GFC</p>
              <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mb-1">No Sponsors Yet</p>
              <p className="text-gray-300 text-sm">Add sponsors in the Django admin.</p>
            </div>
          ) : (
            TIER_ORDER.filter(t => grouped[t]).map(tier => {
              const cfg = TIER_CONFIG[tier]
              return (
                <div key={tier} className="mb-14">
                  <div className="flex items-center gap-4 mb-8">
                    <div className={`w-2 h-6 ${cfg.topBar}`} />
                    <h2 className="text-gray-900 font-black uppercase text-xl">{cfg.label}</h2>
                    <span className={`text-[9px] font-black px-2.5 py-1 uppercase tracking-widest ${cfg.badge}`}>
                      {tier}
                    </span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {grouped[tier].map(sponsor => (
                      <a
                        key={sponsor.id}
                        href={sponsor.website || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`border ${cfg.cardBorder} p-8 flex items-center justify-center transition-all group hover:shadow-md`}
                      >
                        {sponsor.logo ? (
                          <img
                            src={sponsor.logo}
                            alt={sponsor.name}
                            className={`${cfg.logoH} object-contain opacity-60 group-hover:opacity-100 transition-opacity`}
                          />
                        ) : (
                          <p className="font-black text-gray-400 group-hover:text-gray-700 text-center uppercase tracking-widest text-sm transition-colors">
                            {sponsor.name}
                          </p>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )
            })
          )}

          {/* Become a sponsor CTA */}
          <div className="mt-8 bg-gfc-900 p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <img src="/logo.png" alt="" className="w-64 h-64 object-contain opacity-[0.05]" onError={e => e.target.style.display = 'none'} />
            </div>
            <div className="relative z-10">
              <p className="eyebrow mb-5" style={{ display: 'flex', justifyContent: 'center' }}>Partnership</p>
              <h2 className="text-white font-black uppercase leading-tight mb-4" style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}>
                Become a <span className="text-gfc-lime">Sponsor</span>
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-md mx-auto">
                Partner with Hillyfielders Gorkha FC and connect your brand with the heart of Gorkha's football community.
              </p>
              <Link
                to="/contact"
                className="inline-block bg-gfc-lime text-gfc-900 font-black px-8 py-4 text-xs uppercase tracking-widest hover:bg-white transition-colors"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
