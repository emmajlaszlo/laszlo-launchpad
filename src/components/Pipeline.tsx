import { useMemo, useState } from 'react'
import type { Store } from '../hooks/useStore'
import {
  APPLICATION_PIPELINE_ORDER,
  APPLICATION_STATUS_LABELS,
  LOCATIONS,
  ROLE_LABELS,
  formatDate,
  pct,
} from '../lib/labels'
import type {
  Application,
  ApplicationStatus,
  LocationTag,
  RoleFocus,
} from '../types'

const ROLES = Object.keys(ROLE_LABELS) as RoleFocus[]
const PIPE_STATUSES = APPLICATION_PIPELINE_ORDER
const ALL_STATUSES = Object.keys(APPLICATION_STATUS_LABELS) as ApplicationStatus[]

export function Pipeline({ store }: { store: Store }) {
  const apps = store.state.applications
  const [showForm, setShowForm] = useState(false)

  const stats = useMemo(() => {
    const total = apps.length
    const count = (s: ApplicationStatus) => apps.filter((a) => a.status === s).length
    const applied = count('applied')
    const interviewing = count('interviewing')
    const denied = count('denied')
    const ghosted = count('ghosted')
    const accepted = count('accepted')
    const withdrawn = count('withdrawn')
    const decided = denied + ghosted + accepted + withdrawn
    const heardBack = interviewing + denied + accepted
    return {
      total,
      applied,
      interviewing,
      denied,
      ghosted,
      accepted,
      withdrawn,
      responseRate: pct(heardBack, total),
      interviewRate: pct(interviewing + accepted, total),
      acceptRate: pct(accepted, total),
      denyRate: pct(denied, total),
      ghostRate: pct(ghosted, total),
      decided,
    }
  }, [apps])

  const maxBar = Math.max(
    1,
    ...PIPE_STATUSES.map((s) => apps.filter((a) => a.status === s).length),
    stats.withdrawn,
  )

  return (
    <div>
      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>Application pipeline</h3>
            <p>
              Empty until you apply — then log where &amp; when, and move apps through
              interview, denied, ghosted, or accepted
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Log application
          </button>
        </div>

        {apps.length === 0 ? (
          <div className="empty" style={{ padding: '48px 16px' }}>
            <p style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--ink)' }}>
              No applications yet
            </p>
            <p style={{ margin: '0 0 18px' }}>
              When you hit submit on a role, log it here with the company and date.
            </p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              Log your first application
            </button>
          </div>
        ) : (
          <div className="pipeline">
            {PIPE_STATUSES.map((status) => {
              const items = apps.filter((a) => a.status === status)
              return (
                <div className="pipe-col" key={status}>
                  <h4>
                    {APPLICATION_STATUS_LABELS[status]} ({items.length})
                  </h4>
                  {items
                    .slice()
                    .sort(
                      (a, b) =>
                        new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime(),
                    )
                    .map((a) => (
                      <ApplicationCard key={a.id} app={a} store={store} />
                    ))}
                  {items.length === 0 && (
                    <div className="meta" style={{ padding: 8 }}>
                      Empty
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>Application analytics</h3>
            <p>How your hunt is converting over time</p>
          </div>
        </div>

        {apps.length === 0 ? (
          <div className="empty">Stats will show up after you log applications.</div>
        ) : (
          <>
            <div className="analytics-grid">
              <div className="stat">
                <label>Total applied</label>
                <strong>{stats.total}</strong>
                <p>Applications logged</p>
              </div>
              <div className="stat">
                <label>Interviewing</label>
                <strong>{stats.interviewing}</strong>
                <p>{stats.interviewRate}% of apps</p>
              </div>
              <div className="stat">
                <label>Accepted</label>
                <strong>{stats.accepted}</strong>
                <p>{stats.acceptRate}% of apps</p>
              </div>
              <div className="stat">
                <label>Denied</label>
                <strong>{stats.denied}</strong>
                <p>{stats.denyRate}% of apps</p>
              </div>
              <div className="stat">
                <label>Ghosted</label>
                <strong>{stats.ghosted}</strong>
                <p>{stats.ghostRate}% of apps</p>
              </div>
              <div className="stat">
                <label>Heard back</label>
                <strong>{stats.responseRate}%</strong>
                <p>Interview, deny, or accept</p>
              </div>
            </div>

            <div className="bar-chart" style={{ marginTop: 20 }}>
              {(
                [
                  ...PIPE_STATUSES.map((s) => ({
                    key: s,
                    label: APPLICATION_STATUS_LABELS[s],
                    value: apps.filter((a) => a.status === s).length,
                    tone: s,
                  })),
                  {
                    key: 'withdrawn',
                    label: 'Withdrawn',
                    value: stats.withdrawn,
                    tone: 'withdrawn',
                  },
                ] as const
              ).map((row) => (
                <div className="bar-row" key={row.key}>
                  <span className="bar-label">{row.label}</span>
                  <div className="bar-track">
                    <div
                      className={`bar-fill bar-${row.tone}`}
                      style={{ width: `${(row.value / maxBar) * 100}%` }}
                    />
                  </div>
                  <span className="bar-value">{row.value}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {showForm && (
        <ApplicationForm
          store={store}
          onClose={() => setShowForm(false)}
          onSave={() => setShowForm(false)}
        />
      )}
    </div>
  )
}

function ApplicationCard({ app, store }: { app: Application; store: Store }) {
  return (
    <div className="pipe-item">
      <strong>{app.companyName}</strong>
      <div className="meta">{app.roleTitle}</div>
      <div className="meta">Applied {formatDate(app.appliedAt)} · {app.location}</div>
      {app.notes && <div className="meta" style={{ marginTop: 4 }}>{app.notes}</div>}
      <select
        style={{ marginTop: 8, width: '100%' }}
        value={app.status}
        onChange={(e) =>
          store.setApplicationStatus(app.id, e.target.value as ApplicationStatus)
        }
      >
        {ALL_STATUSES.map((s) => (
          <option key={s} value={s}>
            {APPLICATION_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <div className="inline-actions" style={{ marginTop: 8 }}>
        {app.url && (
          <a href={app.url} target="_blank" rel="noreferrer">
            Link
          </a>
        )}
        <button
          onClick={() => {
            if (confirm(`Remove application to ${app.companyName}?`)) {
              store.deleteApplication(app.id)
            }
          }}
        >
          Remove
        </button>
      </div>
    </div>
  )
}

function ApplicationForm({
  store,
  onClose,
  onSave,
}: {
  store: Store
  onClose: () => void
  onSave: () => void
}) {
  const companies = store.state.companies
  const [companyName, setCompanyName] = useState('')
  const [roleTitle, setRoleTitle] = useState('')
  const [roleFocus, setRoleFocus] = useState<RoleFocus>('ux-research')
  const [location, setLocation] = useState<LocationTag>('SF Bay')
  const [appliedAt, setAppliedAt] = useState(new Date().toISOString().slice(0, 10))
  const [url, setUrl] = useState('')
  const [notes, setNotes] = useState('')
  const listId = 'app-company-suggestions'

  function resolveCompany() {
    const typed = companyName.trim()
    if (!typed) return null
    const existing = companies.find((c) => c.name.toLowerCase() === typed.toLowerCase())
    if (existing) return existing
    return store.addCompany({
      name: typed,
      website: '',
      careersUrl: url || '',
      locations: [location],
      size: 'startup',
      focus: 'Added from application log',
      stage: 'applied',
      priority: 2,
      notes: 'Created when logging an application',
      contacts: '',
      lastChecked: null,
    })
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Log application</h3>
        <div className="form-grid">
          <label className="full">
            Company
            <input
              list={listId}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Where did you apply?"
              autoComplete="off"
            />
            <datalist id={listId}>
              {companies.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
          </label>
          <label className="full">
            Role title
            <input
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="Associate UX Researcher"
            />
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
          <label>
            Date applied
            <input
              type="date"
              value={appliedAt}
              onChange={(e) => setAppliedAt(e.target.value)}
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
          <label className="full">
            Posting URL
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" />
          </label>
          <label className="full">
            Notes
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Referral, recruiter name, materials sent…"
            />
          </label>
        </div>
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              if (!companyName.trim() || !roleTitle.trim() || !appliedAt) return
              const company = resolveCompany()
              if (!company) return
              store.addApplication({
                companyId: company.id,
                companyName: company.name,
                roleTitle: roleTitle.trim(),
                roleFocus,
                location,
                url,
                appliedAt: new Date(appliedAt).toISOString(),
                status: 'applied',
                notes,
              })
              onSave()
            }}
          >
            Save application
          </button>
        </div>
      </div>
    </div>
  )
}
