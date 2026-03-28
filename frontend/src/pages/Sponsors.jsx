import { useQuery } from '@tanstack/react-query'
import { getSponsors } from '../services/api'

const TIER_ORDER = ['platinum', 'gold', 'silver']
const TIER_STYLES = {
    platinum: {
        label: 'Platinum Partners',
        card: 'border-2 border-[#BEFF00]',
        badge: 'bg-[#BEFF00] text-[#1B4332]',
        size: 'h-32',
    },
    gold: {
        label: 'Gold Partners',
        card: 'border border-yellow-300',
        badge: 'bg-yellow-100 text-yellow-700',
        size: 'h-24',
    },
    silver: {
        label: 'Silver Partners',
        card: 'border border-gray-200',
        badge: 'bg-gray-100 text-gray-500',
        size: 'h-20',
    },
}

export default function Sponsors() {
    const { data: sponsors, isLoading } = useQuery({
        queryKey: ['sponsors'],
        queryFn: getSponsors,
    })

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-[#1B4332] font-bold animate-pulse">Loading...</p>
        </div>
    )

    const grouped = TIER_ORDER.reduce((acc, tier) => {
        const inTier = sponsors?.filter(s => s.tier === tier) || []
        if (inTier.length) acc[tier] = inTier
        return acc
    }, {})

    return (
        <div>
            <section className="bg-[#1B4332] text-white py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <p className="text-[#BEFF00] text-sm font-semibold uppercase tracking-widest mb-2">
                        Our Partners
                    </p>
                    <h1 className="text-5xl font-black">Club Sponsors</h1>
                    <p className="text-gray-300 mt-3 max-w-xl">
                        We are grateful to our sponsors for their continued support
                        of Hillyfielders Gorkha FC.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 py-12">
                {!sponsors?.length ? (
                    <div className="text-center py-20 text-gray-400">
                        <p className="text-5xl mb-4">🤝</p>
                        <p className="font-semibold">No sponsors added yet.</p>
                        <p className="text-sm mt-1">Add sponsors in the Django admin.</p>
                    </div>
                ) : (
                    TIER_ORDER.filter(t => grouped[t]).map(tier => (
                        <div key={tier} className="mb-14">
                            <div className="flex items-center gap-3 mb-6">
                                <h2 className="text-[#1B4332] font-black text-2xl">
                                    {TIER_STYLES[tier].label}
                                </h2>
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${TIER_STYLES[tier].badge}`}>
                                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {grouped[tier].map(sponsor => (
                                    <a
                                        key={sponsor.id}
                                        href={sponsor.website || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`bg-white rounded-xl p-6 flex items-center justify-center ${TIER_STYLES[tier].card} hover:shadow-lg transition-shadow`}
                                    >
                                        {sponsor.logo ? (
                                            <img
                                                src={sponsor.logo}
                                                alt={sponsor.name}
                                                className={`${TIER_STYLES[tier].size} object-contain`}
                                            />
                                        ) : (
                                            <p className="font-bold text-gray-600 text-center">
                                                {sponsor.name}
                                            </p>
                                        )}
                                    </a>
                                ))}
                            </div>
                        </div>
                    ))
                )}

                {/* Become a sponsor CTA */}
                <div className="mt-16 bg-[#1B4332] rounded-2xl p-10 text-center">
                    <h2 className="text-[#BEFF00] font-black text-3xl mb-3">
                        Become a Sponsor
                    </h2>
                    <p className="text-gray-300 mb-6 max-w-xl mx-auto">
                        Partner with Hillyfielders Gorkha FC and connect your brand
                        with the heart of Gorkha's football community.
                    </p>

                    <a href="/contact"
                        className="bg-[#BEFF00] text-[#1B4332] font-bold px-8 py-3 rounded-lg hover:bg-white transition-colors inline-block"
                    >
                        Get in Touch
                    </a>
                </div>
            </div>
        </div>
    )
}