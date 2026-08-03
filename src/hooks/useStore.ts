import { useCallback, useEffect, useMemo, useState } from 'react'
import atlasMetaFile from '../data/atlas-meta.json'
import discoveredFile from '../data/discovered-jobs.json'
import { toAppJob, type DiscoveredJobsFile } from '../data/discovered'
import { seedState } from '../data/seed'
import type {
  AppState,
  Application,
  ApplicationStatus,
  Company,
  CompanyStage,
  Job,
  JobStatus,
  Milestone,
  Profile,
} from '../types'

const STORAGE_KEY = 'laszlo-launchpad-v4'

interface AtlasMetaFile {
  lastAtlasUpdateAt: string | null
  updateNotes: string
  companiesChecked: number
}

function mergeCompanies(saved: Company[] | undefined): Company[] {
  const byId = new Map((saved ?? []).map((c) => [c.id, c]))
  const merged = seedState.companies.map((seed) => {
    const prev = byId.get(seed.id)
    if (!prev) return structuredClone(seed)
    return {
      ...seed,
      stage: prev.stage,
      priority: prev.priority,
      notes: prev.notes || seed.notes,
      contacts: prev.contacts || seed.contacts,
      lastChecked: prev.lastChecked,
    }
  })
  const seedIds = new Set(seedState.companies.map((c) => c.id))
  const extras = (saved ?? []).filter((c) => !seedIds.has(c.id))
  return [...extras, ...merged]
}

function mergeJobs(savedJobs: Job[] | undefined, discovered: Job[]): Job[] {
  const map = new Map<string, Job>()
  for (const j of discovered) map.set(j.id, j)
  for (const j of savedJobs ?? []) {
    const existing = map.get(j.id)
    map.set(
      j.id,
      existing
        ? { ...existing, ...j, title: existing.title, url: existing.url || j.url }
        : j,
    )
  }
  return [...map.values()].sort(
    (a, b) => new Date(b.foundAt).getTime() - new Date(a.foundAt).getTime(),
  )
}

function loadDiscoveredJobs(): { jobs: Job[]; lastScanAt: string | null } {
  const file = discoveredFile as DiscoveredJobsFile
  return {
    lastScanAt: file.lastScanAt,
    jobs: (file.jobs ?? []).map(toAppJob),
  }
}

function loadAtlasMeta(): AtlasMetaFile {
  return atlasMetaFile as AtlasMetaFile
}

function loadPublicState(): AppState {
  const discovered = loadDiscoveredJobs()
  const base = structuredClone(seedState)
  return {
    ...base,
    // Public profile — no personal edits
    profile: {
      ...base.profile,
      name: 'Laszlo',
    },
    companies: mergeCompanies(undefined),
    jobs: mergeJobs([], discovered.jobs),
    applications: [],
  }
}

function loadState(readOnly: boolean): AppState {
  if (readOnly) return loadPublicState()
  const discovered = loadDiscoveredJobs()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const base = structuredClone(seedState)
      return {
        ...base,
        companies: mergeCompanies(undefined),
        jobs: mergeJobs([], discovered.jobs),
        applications: [],
      }
    }
    const parsed = JSON.parse(raw) as AppState
    return {
      ...seedState,
      ...parsed,
      profile: { ...seedState.profile, ...parsed.profile },
      companies: mergeCompanies(parsed.companies),
      milestones: parsed.milestones?.length ? parsed.milestones : seedState.milestones,
      jobs: mergeJobs(parsed.jobs, discovered.jobs),
      applications: parsed.applications ?? [],
    }
  } catch {
    const base = structuredClone(seedState)
    return {
      ...base,
      jobs: mergeJobs([], discovered.jobs),
      applications: [],
    }
  }
}

function uid(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
}

export function useStore(readOnly = false) {
  const discoveredMeta = useMemo(() => loadDiscoveredJobs(), [])
  const atlasMeta = useMemo(() => loadAtlasMeta(), [])
  const [state, setState] = useState<AppState>(() => loadState(readOnly))
  const [lastScanAt] = useState<string | null>(discoveredMeta.lastScanAt)
  const [lastAtlasUpdateAt] = useState<string | null>(atlasMeta.lastAtlasUpdateAt)
  const [atlasUpdateNotes] = useState(atlasMeta.updateNotes)

  useEffect(() => {
    if (readOnly) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state, readOnly])

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    if (readOnly) return
    setState((s) => ({ ...s, profile: { ...s.profile, ...patch } }))
  }, [readOnly])

  const addCompany = useCallback((company: Omit<Company, 'id' | 'createdAt'>) => {
    if (readOnly) {
      return {
        ...company,
        id: 'readonly',
        createdAt: new Date().toISOString(),
      } as Company
    }
    const next: Company = {
      ...company,
      id: uid('c'),
      createdAt: new Date().toISOString(),
    }
    setState((s) => ({ ...s, companies: [next, ...s.companies] }))
    return next
  }, [readOnly])

  const updateCompany = useCallback((id: string, patch: Partial<Company>) => {
    if (readOnly) return
    setState((s) => ({
      ...s,
      companies: s.companies.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }))
  }, [readOnly])

  const setCompanyStage = useCallback(
    (id: string, stage: CompanyStage) => {
      updateCompany(id, { stage })
    },
    [updateCompany],
  )

  const markChecked = useCallback(
    (id: string) => {
      updateCompany(id, { lastChecked: new Date().toISOString() })
    },
    [updateCompany],
  )

  const deleteCompany = useCallback((id: string) => {
    if (readOnly) return
    setState((s) => ({
      ...s,
      companies: s.companies.filter((c) => c.id !== id),
      jobs: s.jobs.filter((j) => j.companyId !== id),
      applications: s.applications.filter((a) => a.companyId !== id),
    }))
  }, [readOnly])

  const addJob = useCallback((job: Omit<Job, 'id' | 'foundAt'>) => {
    if (readOnly) return
    const next: Job = {
      ...job,
      id: uid('j'),
      foundAt: new Date().toISOString(),
    }
    setState((s) => ({ ...s, jobs: [next, ...s.jobs] }))
  }, [readOnly])

  const updateJob = useCallback((id: string, patch: Partial<Job>) => {
    if (readOnly) return
    setState((s) => ({
      ...s,
      jobs: s.jobs.map((j) => (j.id === id ? { ...j, ...patch } : j)),
    }))
  }, [readOnly])

  const setJobStatus = useCallback(
    (id: string, status: JobStatus) => {
      updateJob(id, { status })
    },
    [updateJob],
  )

  const deleteJob = useCallback((id: string) => {
    if (readOnly) return
    setState((s) => ({ ...s, jobs: s.jobs.filter((j) => j.id !== id) }))
  }, [readOnly])

  const addApplication = useCallback(
    (app: Omit<Application, 'id' | 'updatedAt'>) => {
      if (readOnly) {
        return {
          ...app,
          id: 'readonly',
          updatedAt: new Date().toISOString(),
        } as Application
      }
      const now = new Date().toISOString()
      const next: Application = {
        ...app,
        id: uid('a'),
        updatedAt: now,
      }
      setState((s) => ({ ...s, applications: [next, ...s.applications] }))
      return next
    },
    [readOnly],
  )

  const updateApplication = useCallback((id: string, patch: Partial<Application>) => {
    if (readOnly) return
    setState((s) => ({
      ...s,
      applications: s.applications.map((a) =>
        a.id === id
          ? { ...a, ...patch, updatedAt: new Date().toISOString() }
          : a,
      ),
    }))
  }, [readOnly])

  const setApplicationStatus = useCallback(
    (id: string, status: ApplicationStatus) => {
      updateApplication(id, { status })
    },
    [updateApplication],
  )

  const deleteApplication = useCallback((id: string) => {
    if (readOnly) return
    setState((s) => ({
      ...s,
      applications: s.applications.filter((a) => a.id !== id),
    }))
  }, [readOnly])

  const toggleMilestone = useCallback((id: string) => {
    if (readOnly) return
    setState((s) => ({
      ...s,
      milestones: s.milestones.map((m) =>
        m.id === id ? { ...m, done: !m.done } : m,
      ),
    }))
  }, [readOnly])

  const updateMilestone = useCallback((id: string, patch: Partial<Milestone>) => {
    if (readOnly) return
    setState((s) => ({
      ...s,
      milestones: s.milestones.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }))
  }, [readOnly])

  const resetToSeed = useCallback(() => {
    if (readOnly) return
    if (confirm('Reset all data to the starter company list? This cannot be undone.')) {
      const discovered = loadDiscoveredJobs()
      const fresh = {
        ...structuredClone(seedState),
        jobs: mergeJobs([], discovered.jobs),
        applications: [],
      }
      setState(fresh)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh))
    }
  }, [readOnly])

  const exportJson = useCallback(() => {
    if (readOnly) return
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `laszlo-launchpad-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [state, readOnly])

  return {
    state,
    readOnly,
    lastScanAt,
    lastAtlasUpdateAt,
    atlasUpdateNotes,
    updateProfile,
    addCompany,
    updateCompany,
    setCompanyStage,
    markChecked,
    deleteCompany,
    addJob,
    updateJob,
    setJobStatus,
    deleteJob,
    addApplication,
    updateApplication,
    setApplicationStatus,
    deleteApplication,
    toggleMilestone,
    updateMilestone,
    resetToSeed,
    exportJson,
  }
}

export type Store = ReturnType<typeof useStore>
