import type { Job, JobStatus, LocationTag, RoleFocus } from '../types'

/** Shape written by the weekly Saturday job-scan automation */
export interface DiscoveredJobsFile {
  lastScanAt: string | null
  scanNotes: string
  jobs: DiscoveredJob[]
}

export interface DiscoveredJob {
  id: string
  companyId: string
  companyName: string
  title: string
  roleFocus: RoleFocus
  location: LocationTag
  url: string
  status: JobStatus
  postedAt: string | null
  foundAt: string
  notes: string
  salaryRange: string
  whyFit: string
}

export function toAppJob(d: DiscoveredJob): Job {
  return {
    id: d.id,
    companyId: d.companyId,
    title: d.title,
    roleFocus: d.roleFocus,
    location: d.location,
    url: d.url,
    status: d.status,
    postedAt: d.postedAt,
    foundAt: d.foundAt,
    notes: [d.whyFit, d.notes].filter(Boolean).join(' — '),
    salaryRange: d.salaryRange,
  }
}
