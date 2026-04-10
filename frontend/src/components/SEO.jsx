import { Helmet } from 'react-helmet-async'

const DEFAULT_DESCRIPTION = 'Official website of Hillyfielders Gorkha FC — grassroots football club based in Gorkha, Gandaki Pradesh, Nepal. Home of the U-16 Girls team and Academy programme.'

const SITE_URL = 'https://hillyfieldersgorkhafc.com'

export default function SEO({
  title,
  description,
  image = '/logo.png',
  url,
}) {
  const canonicalUrl = url || (typeof window !== 'undefined' ? window.location.href : SITE_URL)
  const absoluteImage = image.startsWith('http') ? image : `${SITE_URL}${image}`

  const fullTitle = title
    ? `${title} | Hillyfielders Gorkha FC`
    : 'Hillyfielders Gorkha FC | Official Website'

  const metaDescription = description || DEFAULT_DESCRIPTION

  return (
    <Helmet>
      {/* Basic */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="author" content="Hillyfielders Gorkha FC" />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="Hillyfielders Gorkha FC" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={absoluteImage} />

      {/* Structured data */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SportsOrganization',
          name: 'Hillyfielders Gorkha FC',
          sport: 'Football',
          url: SITE_URL,
          logo: `${SITE_URL}/logo.png`,
          foundingDate: '2024',
          location: {
            '@type': 'Place',
            name: 'TOC Turf',
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Gorkha',
              addressRegion: 'Gandaki Pradesh',
              addressCountry: 'NP',
            },
          },
          sameAs: ['https://www.facebook.com/HillyFielders/'],
        })}
      </script>
    </Helmet>
  )
}
