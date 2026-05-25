import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { WeddingPageClient } from './WeddingPageClient';
import type { WeddingData } from './WeddingPageClient';

async function fetchWeddingData(slug: string): Promise<WeddingData | null> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';
  try {
    const res = await fetch(`${base}/public/wedding/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return (json.data ?? null) as WeddingData | null;
  } catch {
    return null;
  }
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchWeddingData(slug);
  if (!data) return { title: 'Wedding Page | Forever Found' };
  return {
    title: `${data.partner1} & ${data.partner2} | Forever Found`,
    description: `Celebrate the wedding of ${data.partner1} and ${data.partner2}${data.city ? ` in ${data.city}` : ''}.`,
    openGraph: {
      title: `${data.partner1} & ${data.partner2}`,
      description: `Wedding celebration${data.city ? ` in ${data.city}` : ''}`,
      type: 'website',
    },
  };
}

export default async function WeddingPage({ params }: Props) {
  const { slug } = await params;
  const data = await fetchWeddingData(slug);
  if (!data) notFound();

  const formattedDate = data.weddingDate
    ? new Date(data.weddingDate + 'T00:00:00').toLocaleDateString('en-IN', {
        weekday: 'long',
        year:    'numeric',
        month:   'long',
        day:     'numeric',
      })
    : null;

  return <WeddingPageClient data={data} formattedDate={formattedDate} />;
}
