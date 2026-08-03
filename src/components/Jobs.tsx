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

export function Jobs({ store }: { store: Store }) {
  const [showForm, setShowForm] = useState(false)
  const [status, setStatus] = useState<string>('all')
  const [role, setRole] = useState<string>('all')

  const filtered = useMemo(() => {
    return store.state.jobs.filter((j) => {
      if (status !== 'all' && j.status !== status) return false
      if (role !== 'all' && j.roleFocus !== role) return false
      return true
    })
  }, [store.state.jobs, status, role])

  return (
    <div>
      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>Job openings</h3>
            <p>Log roles as you find them — Laszlo Launchpad keeps status and history</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Log opening
          </button>
        </div>

        <div className="filters">
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
            No openings logged yet. When Dexcom, Intuitive, or a startup posts a UXR /
            HF / APM role, add it here.
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Company</th>
                  <th>Focus</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Found</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((j) => {
                  const company = store.state.companies.find((c) => c.id === j.companyId)
                  return (
                    <tr key={j.id}>
                      <td>
                        <strong>{j.title}</strong>
                        {j.notes && <div className="meta">{j.notes}</div>}
                      </td>
                      <td>{company?.name ?? '—'}</td>
                      <td>{ROLE_LABELS[j.roleFocus]}</td>
                      <td>{j.location}</td>
                      <td>
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
                      </td>
                      <td>{formatDate(j.foundAt)}</td>
                      <td>
                        <div className="inline-actions">
                          {j.url && (
                            <a href={j.url} target="_blank" rel="noreferrer">
                              Link
                            </a>
                          )}
                          <button onClick={() => store.deleteJob(j.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
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
  const [companyId, setCompanyId] = useState(companies[0]?.id ?? '')
  const [title, setTitle] = useState('')
  const [roleFocus, setRoleFocus] = useState<RoleFocus>('ux-research')
  const [location, setLocation] = useState<LocationTag>('SF Bay')
  const [url, setUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [salaryRange, setSalaryRange] = useState('')
  const [postedAt, setPostedAt] = useState('')

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Log job opening</h3>
        <div className="form-grid">
          <label>
            Company
            <select value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
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
              if (!title.trim() || !companyId) return
              onSave({
                companyId,
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
