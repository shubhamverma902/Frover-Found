export const SEED_CATEGORIES = [
  {
    icon: '🏛️', category: 'Venue',
    tasks: [
      { label: 'Book main wedding venue',           due: 'Completed',      done: true  },
      { label: 'Book sangeet & reception hall',     due: 'Completed',      done: true  },
      { label: 'Arrange valet & parking logistics', due: 'Due in 60 days', done: false },
    ],
  },
  {
    icon: '🌸', category: 'Decoration & Florals',
    tasks: [
      { label: 'Finalise decoration theme',   due: 'Completed',      done: true  },
      { label: 'Book mandap decorator',       due: 'Due in 14 days', done: false },
      { label: 'Confirm floral arrangements', due: 'Due in 30 days', done: false },
      { label: 'Order marigold garlands',     due: 'Due in 45 days', done: false },
    ],
  },
  {
    icon: '🍽️', category: 'Catering',
    tasks: [
      { label: 'Shortlist caterers',                        due: 'Completed',      done: true  },
      { label: 'Finalise multi-cuisine wedding menu',       due: 'Completed',      done: true  },
      { label: 'Confirm dietary requirements with guests',  due: 'Due in 30 days', done: false },
      { label: 'Book dessert & mithai vendors',             due: 'Due in 45 days', done: false },
    ],
  },
  {
    icon: '📸', category: 'Photography & Video',
    tasks: [
      { label: 'Shortlist photographers',        due: 'Completed',      done: true  },
      { label: 'Book wedding photographer',      due: 'Due in 14 days', done: false },
      { label: 'Book videographer & drone crew', due: 'Due in 21 days', done: false },
      { label: 'Plan pre-wedding shoot',         due: 'Due in 30 days', done: false },
    ],
  },
  {
    icon: '✉', category: 'Guests & Invitations',
    tasks: [
      { label: 'Finalise guest list (300 guests)', due: 'Due in 7 days',  done: false },
      { label: 'Send e-invites (120 pending)',      due: 'Due in 21 days', done: false },
      { label: 'Confirm out-of-station RSVPs',     due: 'Due in 30 days', done: false },
    ],
  },
  {
    icon: '🚗', category: 'Logistics & Travel',
    tasks: [
      { label: 'Book hotel blocks for outstation guests', due: 'Due in 30 days', done: false },
      { label: 'Arrange airport transfers',               due: 'Due in 45 days', done: false },
      { label: 'Arrange guest transportation on day',     due: 'Due in 60 days', done: false },
    ],
  },
];
