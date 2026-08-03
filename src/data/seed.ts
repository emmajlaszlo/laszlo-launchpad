import type { AppState } from '../types'
import { seedCompanies } from './companies'

export const seedState: AppState = {
  profile: {
    name: 'Emma',
    school: 'University of Michigan',
    program: 'MSI — UX Research & Design',
    targetStart: '2027-06-01',
    targetCities: ['SF Bay', 'San Diego', 'Los Angeles'],
    targetRoles: ['ux-research', 'human-factors', 'product'],
  },
  milestones: [
    {
      id: 'm1',
      title: 'Build target company list',
      description: 'Map medtech / healthtech orgs across SF, SD, and LA (46 tracked).',
      targetDate: '2026-09-30',
      done: true,
    },
    {
      id: 'm2',
      title: 'Warm networking season',
      description: 'Informational chats with alumni, HF specialists, and PMs at priority companies.',
      targetDate: '2026-12-15',
      done: false,
    },
    {
      id: 'm3',
      title: 'Portfolio & case studies ready',
      description: '2–3 UX research / HF case studies polished for entry-level screening.',
      targetDate: '2027-02-28',
      done: false,
    },
    {
      id: 'm4',
      title: 'Application wave',
      description: 'Apply to openings timed for summer/fall 2027 start dates.',
      targetDate: '2027-04-30',
      done: false,
    },
    {
      id: 'm5',
      title: 'Target start window',
      description: 'Ideal entry-level start: summer / fall 2027.',
      targetDate: '2027-09-01',
      done: false,
    },
  ],
  companies: seedCompanies,
  jobs: [],
  applications: [],
}
