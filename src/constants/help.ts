// ── Types ─────────────────────────────────────────────────

export interface FaqItem {
  question: string;
  answer:   string;
  category: string;
}

export interface HelpCategory {
  icon:  string;
  title: string;
  desc:  string;
  count: number;
}

export interface HelpGuide {
  icon:  string;
  title: string;
  desc:  string;
  time:  string;
  tag:   string;
}

export interface ContactOption {
  icon:  string;
  title: string;
  desc:  string;
  cta:   string;
  note:  string;
}

// ── FAQ items ─────────────────────────────────────────────

export const FAQ_ITEMS: FaqItem[] = [
  {
    category: 'Getting Started',
    question: 'How do I add my wedding date?',
    answer:   'Go to Settings → Wedding Details and enter your wedding date. The countdown in your sidebar and dashboard will update automatically.',
  },
  {
    category: 'Getting Started',
    question: 'Can I invite my partner or planner to collaborate?',
    answer:   'Collaboration is a Premium feature. Upgrade your plan to share access with your partner, family members, or wedding planner.',
  },
  {
    category: 'Guest List',
    question: 'How many guests can I manage on the Free plan?',
    answer:   'The Free plan supports up to 50 guests. Upgrade to Premium for unlimited guest management, RSVP tracking, and meal preference collection.',
  },
  {
    category: 'Guest List',
    question: 'Can I export my guest list?',
    answer:   'Yes — on the Guest List page use the Export button to download a CSV with names, RSVP status, table number, and meal preferences.',
  },
  {
    category: 'Budget',
    question: 'How does the budget tracker work?',
    answer:   'Add your total budget in the Budget page. Create categories (Venue, Catering, etc.), set allocations, and log payments as you go. Forever Found shows you spend vs. allocation in real time.',
  },
  {
    category: 'Budget',
    question: 'Can I track payments made to multiple vendors?',
    answer:   'Yes. Each vendor in the Vendors section has a payment log. You can record deposits and final payments, and these automatically sync to your Budget overview.',
  },
  {
    category: 'Vendors',
    question: 'How do I add a vendor?',
    answer:   'Open the Vendors page and click "Add Vendor". Fill in their name, category, contact details, and agreed price. You can also track payment status per vendor.',
  },
  {
    category: 'Vendors',
    question: 'Are vendor suggestions available for my city?',
    answer:   'Curated vendor discovery is on our roadmap for Premium users. For now you can manually add any vendor you find and track all their details in one place.',
  },
  {
    category: 'Account',
    question: 'How do I change my email address?',
    answer:   'Visit Settings → Your Profile and update the Email Address field. You will receive a verification link at the new address before the change takes effect.',
  },
  {
    category: 'Account',
    question: 'What happens to my data if I cancel Premium?',
    answer:   'Your data is always yours. Cancelling Premium downgrades you to Free — data above Free plan limits (e.g., extra guests or vendors) is read-only until you upgrade again.',
  },
];

// ── Help categories ───────────────────────────────────────

export const HELP_CATEGORIES: HelpCategory[] = [
  { icon: '◆', title: 'Getting Started',  desc: 'Set up your profile, wedding date, and first event', count: 6  },
  { icon: '✉', title: 'Guest Management', desc: 'Invites, RSVPs, table plans & meal preferences',      count: 8  },
  { icon: '₹', title: 'Budget & Billing', desc: 'Track spend, manage vendors & understand your plan',  count: 7  },
  { icon: '◈', title: 'Vendors',          desc: 'Add vendors, log payments & manage contracts',        count: 5  },
  { icon: '✓', title: 'Checklist',        desc: 'Task timelines, due dates & progress tracking',       count: 4  },
  { icon: '◎', title: 'Account & Privacy',desc: 'Profile settings, data export & account deletion',   count: 6  },
];

// ── Quick-start guides ────────────────────────────────────

export const HELP_GUIDES: HelpGuide[] = [
  {
    icon:  '◆',
    title: 'Your First 10 Minutes on Forever Found',
    desc:  'Set your wedding date, add your first event, and explore the dashboard',
    time:  '5 min read',
    tag:   'Beginner',
  },
  {
    icon:  '✉',
    title: 'Building the Perfect Guest List',
    desc:  'Import contacts, send invites, and track RSVPs all in one place',
    time:  '7 min read',
    tag:   'Beginner',
  },
  {
    icon:  '₹',
    title: 'Setting Up Your Wedding Budget',
    desc:  'Allocate across categories, log vendor payments, and avoid surprises',
    time:  '6 min read',
    tag:   'Popular',
  },
  {
    icon:  '◈',
    title: 'Finding and Managing Vendors',
    desc:  'Add vendors, compare quotes, and keep all contracts in one place',
    time:  '8 min read',
    tag:   'Popular',
  },
];

// ── Contact / support options ─────────────────────────────

export const CONTACT_OPTIONS: ContactOption[] = [
  {
    icon:  '✉',
    title: 'Email Support',
    desc:  'Write to our team and we will get back to you within 24 hours',
    cta:   'Send a message',
    note:  'Avg. response: 12 hrs',
  },
  {
    icon:  '◆',
    title: 'Live Chat',
    desc:  'Chat with a real person right now — available Mon–Sat, 9 am–8 pm IST',
    cta:   'Start chat',
    note:  'Online now',
  },
  {
    icon:  '◈',
    title: 'Community Forum',
    desc:  'Ask questions, share tips, and connect with other couples on Forever Found',
    cta:   'Join the community',
    note:  '2,400+ members',
  },
];
