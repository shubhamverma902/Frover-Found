import type { CarouselImage } from '@/components/ui';

// ── Types ────────────────────────────────────────────────

export interface Service {
  icon: string;
  title: string;
  desc: string;
}

export interface GalleryImage {
  src: string;
  alt: string;
  label: string;
}

export interface Testimonial {
  quote: string;
  names: string;
  location: string;
  avatar: string;
  stars: number;
}

export interface Stat {
  value: string;
  label: string;
}

// ── Data ─────────────────────────────────────────────────

// Hero carousel — verified Unsplash Indian wedding photos (local)
export const CAROUSEL_IMAGES: CarouselImage[] = [
  {
    src: '/images/weddings/hindu-petals.jpg',
    alt: 'Hindu couple showered with flower petals during traditional wedding ceremony',
  },
  {
    src: '/images/weddings/grand-floral.jpg',
    alt: 'Indian bride and groom under stunning gold and white floral ceiling',
  },
  {
    src: '/images/weddings/garden-couple.jpg',
    alt: 'Indian couple in traditional wedding attire in a lush garden',
  },
  {
    src: '/images/weddings/hindu-portrait.jpg',
    alt: 'Indian couple dressed in traditional wedding attire',
  },
  {
    src: '/images/weddings/hands-couple.jpg',
    alt: 'Indian couple holding hands during their wedding ceremony',
  },
];

export const SERVICES: Service[] = [
  {
    icon: '💍',
    title: 'Wedding Planning',
    desc: 'Full-service planning from engagement to your last dance — every detail, perfectly managed.',
  },
  {
    icon: '🎪',
    title: 'Event Management',
    desc: 'Receptions, sangeets, mehendi & more. We coordinate every celebration with flawless precision.',
  },
  {
    icon: '🌸',
    title: 'Decoration & Florals',
    desc: 'Lush mandaps, dreamy tablescapes and floral installations that take your breath away.',
  },
  {
    icon: '📸',
    title: 'Photography Coordination',
    desc: "We partner with India's finest photographers to preserve your moments forever.",
  },
  {
    icon: '🍽️',
    title: 'Catering Coordination',
    desc: 'Curated menus from top caterers — from traditional thalis to gourmet multi-cuisine spreads.',
  },
  {
    icon: '🚗',
    title: 'Guest & Logistics',
    desc: 'Seamless travel, accommodation and guest management so everyone arrives in comfort.',
  },
];

// Gallery — verified Unsplash Indian wedding photos (local)
export const GALLERY_IMAGES: GalleryImage[] = [
  {
    src: '/images/weddings/hindu-petals.jpg',
    alt: 'Hindu couple showered with flower petals at their wedding',
    label: 'Hindu Wedding',
  },
  {
    src: '/images/weddings/bride-groom-pose.jpg',
    alt: 'Indian bride and groom posing at their wedding ceremony',
    label: 'Grand Ceremony',
  },
  {
    src: '/images/weddings/traditional-garb.jpg',
    alt: 'Couple in traditional Indian wedding garb',
    label: 'Traditional Attire',
  },
  {
    src: '/images/weddings/couple-facing.jpg',
    alt: 'Bride and groom facing each other at their wedding',
    label: 'Sacred Vows',
  },
  {
    src: '/images/weddings/bride-red.jpg',
    alt: 'Indian bride in beautiful red and white wedding outfit',
    label: 'Bridal Elegance',
  },
  {
    src: '/images/weddings/couple-closeup.jpg',
    alt: 'Indian wedding couple close up portrait',
    label: 'Timeless Moments',
  },
];

// Testimonials — verified Unsplash Indian wedding photos as avatars
export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Forever Found turned our dream into reality. Every detail of our Delhi Hindu wedding was absolutely perfect — from the mandap to the vidaai. We didn't worry about a single thing!",
    names: 'Priya & Rahul Sharma',
    location: 'New Delhi',
    avatar: '/images/weddings/hindu-portrait.jpg',
    stars: 5,
  },
  {
    quote:
      'Our Nikah in Mumbai was beyond magical. The Forever Found team coordinated every detail of our ceremony beautifully. Guests still talk about it!',
    names: 'Aisha & Zaid Khan',
    location: 'Mumbai, Maharashtra',
    avatar: '/images/weddings/couple-hands.jpg',
    stars: 5,
  },
  {
    quote:
      "Our Anand Karaj in Amritsar was everything we dreamed of. Forever Found managed 500 guests with seamless logistics. Truly India's best wedding planners!",
    names: 'Gurpreet & Harjeet Singh',
    location: 'Amritsar, Punjab',
    avatar: '/images/weddings/garden-couple.jpg',
    stars: 5,
  },
];

export const STATS: Stat[] = [
  { value: '500+',  label: 'Weddings Planned' },
  { value: '50+',   label: 'Cities Across India' },
  { value: '2000+', label: 'Happy Couples' },
  { value: '15+',   label: 'Years of Experience' },
];
