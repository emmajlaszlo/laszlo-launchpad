import { useMemo, useState } from 'react'
import type { Store } from '../hooks/useStore'
import {
  JOB_STATUS_LABELS,
  LOCATIONS,
  ROLE_LABELS,
  formatDate,
} from '../lib/labels'
import type { Job, JobStatus, LocationTag, RoleFocus } from '../types'

const STATUSES = Object.keys(JOB_STATUS_LABELS) as JobStatus[]
const ROLES = Object.keys(ROLE_LABELS) as RoleFocus[]

function isScanJob(job: Job) {
  return job.id.startsWith('scan-')
}

export function Jobs({ store }: { store: Store }) {
  const [showForm, setShowForm] = useState(false)
  const [status, setStatus] = useState<string>('all')
  const [role, setRole] = useState<string>('all')
  const [source, setSource] = useState<'all' | 'scan' | 'manual'>('all')
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    return store.state.jobs.filter((j) => {
      if (status !== 'all' && j.status !== status) return false
      if (role !== 'all' && j.roleFocus !== role) return false
      if (source === 'scan' && !isScanJob(j)) return false
      if (source === 'manual' && isScanJob(j)) return false
      if (q) {
        const company = store.state.companies.find((c) => c.id === j.companyId)?.name ?? ''
        const hay = `${j.title} ${company} ${j.notes}`.toLowerCase()
        if (!hay.includes(q.toLowerCase())) return false
      }
      return true
    })
  }, [store.state.jobs, store.state.companies, status, role, source, q])

  const newCount = store.state.jobs.filter((j) => j.status === 'new').length
  const scanCount = store.state.jobs.filter(isScanJob).length

  return (
    <div>
      <section className="hero" style={{ marginBottom: 18 }}>
        <div className="hero-main" style={{ minHeight: 0 }}>
          <p className="hero-kicker">Dedicated openings board</p>
          <h2 style={{ maxWidth: '20ch' }}>Job openings</h2>
          <p className="lede">
            Roles matched to UX research, human factors, and product — from the Saturday
            scan and anything you log by hand.
          </p>
          <div className="countdown">
            <div>
              <strong>{store.state.jobs.length}</strong>
              <span>total openings</span>
            </div>
            <div>
              <strong>{newCount}</strong>
              <span>new to triage</span>
            </div>
            <div>
              <strong>{scanCount}</strong>
              <span>from weekly scan</span>
            </div>
          </div>
        </div>
        <div className="hero-side">
          <div className="stat">
            <label>Last Saturday scan</label>
            <strong style={{ fontSize: '1.2rem' }}>
              {store.lastScanAt ? formatDate(store.lastScanAt) : 'Not run yet'}
            </strong>
            <p>Automation writes matches here after each weekly PR is pulled.</p>
          </div>
          <div className="stat">
            <label>Quick add</label>
            <strong style={{ fontSize: '1.05rem' }}>Spot something?</strong>
            <p style={{ marginBottom: 12 }}>Log it so it stays in your pipeline.</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              Log opening
            </button>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>All openings</h3>
            <p>Filter by status, role type, or scan vs manual</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Log opening
          </button>
        </div>

        <div className="filters">
          <input
            placeholder="Search title or company…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select value={source} onChange={(e) => setSource(e.target.value as typeof source)}>
            <option value="all">All sources</option>
            <option value="scan">Weekly scan</option>
            <option value="manual">Logged manually</option>
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {JOB_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="all">All role types</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="empty">
            No openings here yet. After the first Saturday scan — or when you log a role —
            they&apos;ll show up on this tab.
          </div>
        ) : (
          <div className="list">
                {filtered.map((j) => {
              const company = store.state.companies.find((c) => c.id === j.companyId)
              const companyLabel = company?.name ?? j.companyName ?? 'Unknown'
              return (
                <div className="row" key={j.id}>
                  <div>
                    <h4>{j.title}</h4>
                    <div className="meta">
                      {companyLabel} · {ROLE_LABELS[j.roleFocus]} ·{' '}
                      {j.location}
                      {j.salaryRange ? ` · ${j.salaryRange}` : ''}
                    </div>
                    {j.notes && <div className="meta" style={{ marginTop: 6 }}>{j.notes}</div>}
                    <div className="chips">
                      <span className={`chip ${j.status === 'new' ? 'amber' : 'muted'}`}>
                        {JOB_STATUS_LABELS[j.status]}
                      </span>
                      <span className={`chip ${isScanJob(j) ? 'sky' : ''}`}>
                        {isScanJob(j) ? 'Weekly scan' : 'Manual'}
                      </span>
                      <span className="chip muted">Found {formatDate(j.foundAt)}</span>
                    </div>
                    <div className="inline-actions" style={{ marginTop: 10 }}>
                      <select
                        value={j.status}
                        onChange={(e) =>
                          store.setJobStatus(j.id, e.target.value as JobStatus)
                        }
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {JOB_STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                      {j.url && (
                        <a href={j.url} target="_blank" rel="noreferrer">
                          Open posting
                        </a>
                      )}
                      <button onClick={() => store.deleteJob(j.id)}>Remove</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {showForm && (
        <JobForm
          store={store}
          onClose={() => setShowForm(false)}
          onSave={(data) => {
            store.addJob(data)
            setShowForm(false)
          }}
        />
      )}
    </div>
  )
}

function JobForm({
  store,
  onClose,
  onSave,
}: {
  store: Store
  onClose: () => void
  onSave: (j: Omit<Job, 'id' | 'foundAt'>) => void
}) {
  const companies = store.state.companies
  const [companyName, setCompanyName] = useState('')
  const [title, setTitle] = useState('')
  const [roleFocus, setRoleFocus] = useState<RoleFocus>('ux-research')
  const [location, setLocation] = useState<LocationTag>('SF Bay')
  const [url, setUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [salaryRange, setSalaryRange] = useState('')
  const [postedAt, setPostedAt] = useState('')

  const listId = 'company-name-suggestions'

  function resolveCompany() {
    const typed = companyName.trim()
    if (!typed) return null
    const existing = companies.find(
      (c) => c.name.toLowerCase() === typed.toLowerCase(),
    )
    if (existing) return existing
    return store.addCompany({
      name: typed,
      website: '',
      careersUrl: url || '',
      locations: [location],
      size: 'startup',
      focus: 'Added from job log',
      stage: 'watching',
      priority: 2,
      notes: 'Created when logging an opening',
      contacts: '',
      lastChecked: null,
    })
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Log job opening</h3>
        <div className="form-grid">
          <label className="full">
            Company
            <input
              list={listId}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Type a company name…"
              autoComplete="off"
            />
            <datalist id={listId}>
              {companies.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
          </label>
          <label>
            Role type
            <select
              value={roleFocus}
              onChange={(e) => setRoleFocus(e.target.value as RoleFocus)}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </label>
          <label className="full">
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Associate UX Researcher"
            />
          </label>
          <label>
            Location
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value as LocationTag)}
            >
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label>
            Posted date
            <input
              type="date"
              value={postedAt}
              onChange={(e) => setPostedAt(e.target.value)}
            />
          </label>
          <label className="full">
            Job URL
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" />
          </label>
          <label>
            Salary range
            <input
              value={salaryRange}
              onChange={(e) => setSalaryRange(e.target.value)}
              placeholder="optional"
            />
          </label>
          <label className="full">
            Notes
            <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
        </div>
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              if (!title.trim() || !companyName.trim()) return
              const company = resolveCompany()
              if (!company) return
              onSave({
                companyId: company.id,
                companyName: company.name,
                title: title.trim(),
                roleFocus,
                location,
                url,
                status: 'new',
                postedAt: postedAt ? new Date(postedAt).toISOString() : null,
                notes,
                salaryRange,
              })
            }}
          >
            Save opening
          </button>
        </div>
      </div>
    </div>
  )
}
