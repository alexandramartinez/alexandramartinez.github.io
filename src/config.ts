/**
 * Central site configuration.
 * Single source of truth for identity, feed handles/IDs, and social links.
 * Edit here, not in components.
 */

export const site = {
  name: 'Alex Martinez',
  // Professional bookkeeping name (the "name bridge", see /bookkeeping).
  booksName: 'Alex Amkins',
  domain: 'www.alexmartinez.ca',
  url: 'https://www.alexmartinez.ca',
  tagline: 'Software engineer turned developer advocate and content creator.',
  description:
    'Alex Martinez is a software engineer and developer advocate creating content on MuleSoft, AI, DataWeave, and building with Claude. Also offering professional bookkeeping services.',
} as const;

export const socials = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/alexandra-martinez/', kind: 'linkedin' },
  { label: 'YouTube', href: 'https://www.youtube.com/@ProstDev', kind: 'youtube' },
  { label: 'GitHub', href: 'https://github.com/alexandramartinez', kind: 'github' },
  { label: 'Twitch', href: 'https://www.twitch.tv/DevAlexMartinez', kind: 'twitch' },
  { label: 'Instagram', href: 'https://www.instagram.com/DevAlexMartinez', kind: 'instagram' },
] as const;

// The startup footnote (single tasteful mention, never a section).
export const startup = {
  name: 'CleaningPal',
  href: 'https://cleaningpal.co',
  role: 'co-founder',
} as const;

// Bookkeeping trust links.
export const bookkeeping = {
  fiverr:
    'https://www.fiverr.com/alexamkins/do-quickbooks-bookkeeping-for-canadian-small-businesses',
  proAdvisor: '', // TODO: paste QuickBooks ProAdvisor directory URL if you want it shown.
  // Exact cert names as completed (May 2026).
  certs: [
    'QuickBooks Online Certification 2026',
    'QuickBooks Online Advanced Certification 2026',
  ],
  inProgress: ['Xero'],
  contactEmail: 'alexamkins@gmail.com',
} as const;

export type NavItem = { label: string; href: string };
export const nav: NavItem[] = [
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Resume', href: '/resume' },
  { label: 'Bookkeeping', href: '/bookkeeping' },
  { label: 'Contact', href: '/contact' },
];
