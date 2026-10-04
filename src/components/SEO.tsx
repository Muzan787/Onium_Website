import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  noIndex?: boolean;
}

export default function SEO({ title, description, image, url, noIndex }: SEOProps) {
  const siteTitle = 'Onium Store';
  const defaultDescription = 'Premium eco-friendly cleaning solutions for a safer, sparklier home.';
  const siteUrl = 'https://onium.store';
  const defaultImage = 'https://res.cloudinary.com/dztldh7o2/image/upload/v1769193183/Screenshot_2026-01-23_233205_aptge2.png';

  // defer={false} writes the tags during render instead of inside a
  // requestAnimationFrame. Browsers suspend rAF in hidden pages, so with the
  // default the title and meta never get applied in a background tab —
  // middle-clicked product links would all sit there showing the generic
  // index.html title until you actually switched to them.
  return (
    <Helmet defer={false}>
      {/* Standard Metadata */}
      <title>{`${title} | ${siteTitle}`}</title>
      <meta name="description" content={description || defaultDescription} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url || siteUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image || defaultImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={image || defaultImage} />
    </Helmet>
  );
}