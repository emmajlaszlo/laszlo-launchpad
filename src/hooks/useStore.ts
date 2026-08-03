import { useCallback, useEffect, useMemo, useState } from 'react'
import atlasMetaFile from '../data/atlas-meta.json'
import discoveredFile from '../data/discovered-jobs.json'
import { toAppJob, type DiscoveredJobsFile } from '../data/discovered'
import { seedState } from '../data/seed'
import type {
  AppState,
  Company,
  CompanyStage,
  Job,
  JobStatus,
  Milestone,
  Profile,
} from '../types'

const STORAGE_KEY = 'laszlo-launchpad-v3'

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

function loadState(): AppState {
  const discovered = loadDiscoveredJobs()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const base = structuredClone(seedState)
      return {
        ...base,
        companies: mergeCompanies(undefined),
        jobs: mergeJobs([], discovered.jobs),
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
    }
  } catch {
    const base = structuredClone(seedState)
    return {
      ...base,
      jobs: mergeJobs([], discovered.jobs),
    }
  }
}

function uid(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
}

export function useStore() {
  const discoveredMeta = useMemo(() => loadDiscoveredJobs(), [])
  const atlasMeta = useMemo(() => loadAtlasMeta(), [])
  const [state, setState] = useState<AppState>(loadState)
  const [lastScanAt] = useState<string | null>(discoveredMeta.lastScanAt)
  const [lastAtlasUpdateAt] = useState<string | null>(atlasMeta.lastAtlasUpdateAt)
  const [atlasUpdateNotes] = useState(atlasMeta.updateNotes)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setState((s) => ({ ...s, profile: { ...s.profile, ...patch } }))
  }, [])

  const addCompany = useCallback((company: Omit<Company, 'id' | 'createdAt'>) => {
    const next: Company = {
      ...company,
      id: uid('c'),
      createdAt: new Date().toISOString(),
    }
    setState((s) => ({ ...s, companies: [next, ...s.companies] }))
    return next
  }, [])

  const updateCompany = useCallback((id: string, patch: Partial<Company>) => {
    setState((s) => ({
      ...s,
      companies: s.companies.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }))
  }, [])

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
    setState((s) => ({
      ...s,
      companies: s.companies.filter((c) => c.id !== id),
      jobs: s.jobs.filter((j) => j.companyId !== id),
    }))
  }, [])

  const addJob = useCallback((job: Omit<Job, 'id' | 'foundAt'>) => {
    const next: Job = {
      ...job,
      id: uid('j'),
      foundAt: new Date().toISOString(),
    }
    setState((s) => ({ ...s, jobs: [next, ...s.jobs] }))
  }, [])

  const updateJob = useCallback((id: string, patch: Partial<Job>) => {
    setState((s) => ({
      ...s,
      jobs: s.jobs.map((j) => (j.id === id ? { ...j, ...patch } : j)),
    }))
  }, [])

  const setJobStatus = useCallback(
    (id: string, status: JobStatus) => {
      updateJob(id, { status })
    },
    [updateJob],
  )

  const deleteJob = useCallback((id: string) => {
    setState((s) => ({ ...s, jobs: s.jobs.filter((j) => j.id !== id) }))
  }, [])

  const toggleMilestone = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      milestones: s.milestones.map((m) =>
        m.id === id ? { ...m, done: !m.done } : m,
      ),
    }))
  }, [])

  const updateMilestone = useCallback((id: string, patch: Partial<Milestone>) => {
    setState((s) => ({
      ...s,
      milestones: s.milestones.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }))
  }, [])

  const resetToSeed = useCallback(() => {
    if (confirm('Reset all data to the starter company list? This cannot be undone.')) {
      const discovered = loadDiscoveredJobs()
      const fresh = {
        ...structuredClone(seedState),
        jobs: mergeJobs([], discovered.jobs),
      }
      setState(fresh)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh))
    }
  }, [])

  const exportJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `laszlo-launchpad-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [state])

  return {
    state,
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
    toggleMilestone,
    updateMilestone,
    resetToSeed,
    exportJson,
  }
}

export type Store = ReturnType<typeof useStore>
