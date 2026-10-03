import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { buildFullTitle } from '../../libs/seo';

export interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'place' | 'hotel';
  ogPriceAmount?: number;
  ogPriceCurrency?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
  noIndex?: boolean;
}

const DEFAULT_DESC = 'Temukan hotel, villa, dan penginapan murah dengan harga transparan dan kalender perbandingan harga real-time di SinggahIn.';

function getStandardTags(title: string, desc: string, canonical?: string, noIndex?: boolean): React.ReactElement[] {
  const robots = noIndex ? 'noindex, nofollow' : 'index, follow';
  const tags: React.ReactElement[] = [
    <title key="title">{title}</title>,
    <meta key="desc" name="description" content={desc} />,
    <meta key="robots" name="robots" content={robots} />,
  ];
  if (canonical) tags.push(<link key="canonical" rel="canonical" href={canonical} />);
  return tags;
}

function getOpenGraphTags(title: string, desc: string, ogType: string, p: SEOHeadProps): React.ReactElement[] {
  const tags = [
    <meta key="og:site" property="og:site_name" content="SinggahIn" />,
    <meta key="og:type" property="og:type" content={ogType} />,
    <meta key="og:title" property="og:title" content={title} />,
    <meta key="og:desc" property="og:description" content={desc} />,
  ];
  if (p.canonicalUrl) tags.push(<meta key="og:url" property="og:url" content={p.canonicalUrl} />);
  if (p.ogImage) tags.push(<meta key="og:img" property="og:image" content={p.ogImage} />);
  if (p.ogPriceAmount !== undefined) {
    tags.push(<meta key="og:price" property="og:price:amount" content={String(p.ogPriceAmount)} />);
    tags.push(<meta key="og:cur" property="og:price:currency" content={p.ogPriceCurrency || 'IDR'} />);
  }
  return tags;
}

function getTwitterAndJsonLdTags(title: string, desc: string, card: string, p: SEOHeadProps): React.ReactElement[] {
  const tags = [
    <meta key="tw:card" name="twitter:card" content={card} />,
    <meta key="tw:title" name="twitter:title" content={title} />,
    <meta key="tw:desc" name="twitter:description" content={desc} />,
  ];
  if (p.ogImage) tags.push(<meta key="tw:img" name="twitter:image" content={p.ogImage} />);
  if (p.jsonLd) tags.push(<script key="jsonld" type="application/ld+json">{JSON.stringify(p.jsonLd)}</script>);
  return tags;
}

export function SEOHead(p: SEOHeadProps): React.JSX.Element {
  const title = buildFullTitle(p.title);
  const desc = p.description || DEFAULT_DESC;
  const children = [
    ...getStandardTags(title, desc, p.canonicalUrl, p.noIndex),
    ...getOpenGraphTags(title, desc, p.ogType || 'website', p),
    ...getTwitterAndJsonLdTags(title, desc, p.twitterCard || 'summary_large_image', p),
  ];
  return (
    <HelmetProvider>
      <Helmet>{children}</Helmet>
    </HelmetProvider>
  );
}
