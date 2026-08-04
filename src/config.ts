/**
 * Central site configuration.
 * Single source of truth for identity, feed handles/IDs, and social links.
 * Edit here, not in components.
 */

export const site = {
  name: 'Alex Martinez',
  email: 'alex@prostdev.com',
  domain: 'www.alexmartinez.ca',
  url: 'https://www.alexmartinez.ca',
  tagline: 'Software engineer turned developer advocate and content creator.',
  description:
    'Alex Martinez is a software engineer and developer advocate creating content on MuleSoft, AI, DataWeave, and building with Claude.',
} as const;

export const socials = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/alexandra-n-martinez/', kind: 'linkedin' },
  { label: 'YouTube', href: 'https://www.youtube.com/@ProstDev', kind: 'youtube' },
  { label: 'GitHub', href: 'https://github.com/alexandramartinez', kind: 'github' },
  { label: 'Discord', href: 'https://discord.com/users/802194809337937931', kind: 'discord' },
] as const;

// The startup footnote (single tasteful mention, never a section).
export const startup = {
  name: 'CleaningPal',
  href: 'https://cleaningpal.co',
  role: 'co-founder',
} as const;

export type NavItem = { label: string; href: string };
export const nav: NavItem[] = [
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Resume', href: '/resume' },
  { label: 'Contact', href: '/contact' },
];
