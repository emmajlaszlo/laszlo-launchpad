export type LocationTag = 'SF Bay' | 'San Diego' | 'Los Angeles' | 'Remote CA' | 'Other CA'

export type CompanyStage =
  | 'watching'
  | 'researching'
  | 'networking'
  | 'applied'
  | 'interviewing'
  | 'offer'
  | 'closed'

export type CompanySize = 'startup' | 'growth' | 'enterprise'

export type RoleFocus = 'ux-research' | 'human-factors' | 'product' | 'design' | 'other'

export type JobStatus = 'new' | 'saved' | 'applied' | 'interviewing' | 'rejected' | 'closed'

/** Application pipeline statuses — only apps you logged after applying */
export type ApplicationStatus =
  | 'applied'
  | 'interviewing'
  | 'denied'
  | 'ghosted'
  | 'accepted'
  | 'withdrawn'

export interface Company {
  id: string
  name: string
  website: string
  careersUrl: string
  locations: LocationTag[]
  size: CompanySize
  focus: string
  stage: CompanyStage
  priority: 1 | 2 | 3
  notes: string
  contacts: string
  lastChecked: string | null
  createdAt: string
}

export interface Job {
  id: string
  companyId: string
  companyName?: string
  title: string
  roleFocus: RoleFocus
  location: LocationTag
  url: string
  status: JobStatus
  postedAt: string | null
  foundAt: string
  notes: string
  salaryRange: string
}

export interface Application {
  id: string
  companyId: string
  companyName: string
  roleTitle: string
  roleFocus: RoleFocus
  location: LocationTag
  url: string
  appliedAt: string
  status: ApplicationStatus
  notes: string
  updatedAt: string
}

export interface Milestone {
  id: string
  title: string
  description: string
  targetDate: string
  done: boolean
}

export interface Profile {
  name: string
  school: string
  program: string
  targetStart: string
  targetCities: LocationTag[]
  targetRoles: RoleFocus[]
}

export interface AppState {
  profile: Profile
  companies: Company[]
  jobs: Job[]
  applications: Application[]
  milestones: Milestone[]
}
