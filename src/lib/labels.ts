export const STAGE_LABELS = {
  watching: 'Watching',
  researching: 'Researching',
  networking: 'Networking',
  applied: 'Applied',
  interviewing: 'Interviewing',
  offer: 'Offer',
  closed: 'Closed',
} as const

export const SIZE_LABELS = {
  startup: 'Startup',
  growth: 'Growth',
  enterprise: 'Enterprise',
} as const

export const ROLE_LABELS = {
  'ux-research': 'UX Research',
  'human-factors': 'Human Factors',
  product: 'Product',
  design: 'Design',
  other: 'Other',
} as const

export const JOB_STATUS_LABELS = {
  new: 'New',
  saved: 'Saved',
  applied: 'Applied',
  interviewing: 'Interviewing',
  rejected: 'Rejected',
  closed: 'Closed',
} as const

export const APPLICATION_STATUS_LABELS = {
  applied: 'Applied',
  interviewing: 'Interviewing',
  denied: 'Denied',
  ghosted: 'Ghosted',
  accepted: 'Accepted',
  withdrawn: 'Withdrawn',
} as const

export const APPLICATION_PIPELINE_ORDER = [
  'applied',
  'interviewing',
  'denied',
  'ghosted',
  'accepted',
] as const

export const LOCATIONS = ['SF Bay', 'San Diego', 'Los Angeles', 'Remote CA', 'Other CA'] as const

export function daysUntil(iso: string) {
  const target = new Date(iso)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function relativeChecked(iso: string | null) {
  if (!iso) return 'Never checked'
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Checked today'
  if (days === 1) return 'Checked yesterday'
  return `Checked ${days}d ago`
}

export function pct(part: number, whole: number) {
  if (whole <= 0) return 0
  return Math.round((part / whole) * 100)
}
