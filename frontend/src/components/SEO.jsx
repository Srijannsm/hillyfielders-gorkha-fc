import { Helmet } from 'react-helmet-async'

const DEFAULT_DESCRIPTION = 'Official website of Hillyfielders Gorkha FC — grassroots football club based in Gorkha, Gandaki Pradesh, Nepal. Home of the U-16 Girls team and Academy programme.'

export default function SEO({
  title,
  description,
  image = '/logo.png',
  url = 'https://hillyfieldersgorkhafc.com',
}) {
  const fullTitle = title
    ? `${title} | Hillyfielders Gorkha FC`
    : 'Hillyfielders Gorkha FC | Official Website'

  const metaDescription = description || DEFAULT_DESCRIPTION

  return (
    <Helmet>
      {/* Basic */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content="Gorkha FC, Hillyfielders, football Nepal, Gorkha football, Gandaki Pradesh football, U-16 girls football Nepal, grassroots football Nepal" />
      <meta name="author" content="Hillyfielders Gorkha FC" />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="Hillyfielders Gorkha FC" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={image} />

      {/* Structured data */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SportsOrganization',
          name: 'Hillyfielders Gorkha FC',
          sport: 'Football',
          url: 'https://gorkhafc.com',
          logo: 'https://gorkhafc.com/logo.png',
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
