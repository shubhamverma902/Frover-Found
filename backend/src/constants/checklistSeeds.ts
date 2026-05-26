export const SEED_CATEGORIES = [
  {
    icon: '🏛️', category: 'Venue',
    tasks: [
      { label: 'Book main wedding venue',           due: null, done: true  },
      { label: 'Book sangeet & reception hall',     due: null, done: true  },
      { label: 'Arrange valet & parking logistics', due: null, done: false },
    ],
  },
  {
    icon: '🌸', category: 'Decoration & Florals',
    tasks: [
      { label: 'Finalise decoration theme',   due: null, done: true  },
      { label: 'Book mandap decorator',       due: null, done: false },
      { label: 'Confirm floral arrangements', due: null, done: false },
      { label: 'Order marigold garlands',     due: null, done: false },
    ],
  },
  {
    icon: '🍽️', category: 'Catering',
    tasks: [
      { label: 'Shortlist caterers',                        due: null, done: true  },
      { label: 'Finalise multi-cuisine wedding menu',       due: null, done: true  },
      { label: 'Confirm dietary requirements with guests',  due: null, done: false },
      { label: 'Book dessert & mithai vendors',             due: null, done: false },
    ],
  },
  {
    icon: '📸', category: 'Photography & Video',
    tasks: [
      { label: 'Shortlist photographers',        due: null, done: true  },
      { label: 'Book wedding photographer',      due: null, done: false },
      { label: 'Book videographer & drone crew', due: null, done: false },
      { label: 'Plan pre-wedding shoot',         due: null, done: false },
    ],
  },
  {
    icon: '✉', category: 'Guests & Invitations',
    tasks: [
      { label: 'Finalise guest list (300 guests)', due: null, done: false },
      { label: 'Send e-invites (120 pending)',      due: null, done: false },
      { label: 'Confirm out-of-station RSVPs',     due: null, done: false },
    ],
  },
  {
    icon: '🚗', category: 'Logistics & Travel',
    tasks: [
      { label: 'Book hotel blocks for outstation guests', due: null, done: false },
      { label: 'Arrange airport transfers',               due: null, done: false },
      { label: 'Arrange guest transportation on day',     due: null, done: false },
    ],
  },
];
