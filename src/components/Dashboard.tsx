import { differenceInCalendarDays, format } from 'date-fns'
import type { Store } from '../hooks/useStore'
import {
  JOB_STATUS_LABELS,
  ROLE_LABELS,
  SIZE_LABELS,
  STAGE_LABELS,
  daysUntil,
  formatDate,
  relativeChecked,
} from '../lib/labels'
import type { Company, Job } from '../types'

export function Dashboard({
  store,
  onOpenOpenings,
}: {
  store: Store
  onOpenOpenings?: () => void
}) {
  const { profile, companies, jobs, milestones } = store.state
  const days = daysUntil(profile.targetStart)
  const months = Math.max(0, Math.round(days / 30.4))
  const priority = companies.filter((c) => c.priority === 1)
  const startups = companies.filter((c) => c.size === 'startup')
  const stale = companies.filter((c) => {
    if (!c.lastChecked) return true
    return differenceInCalendarDays(new Date(), new Date(c.lastChecked)) >= 14
  })
  const activeJobs = jobs.filter((j) => !['rejected', 'closed'].includes(j.status))
  const nextMilestone = milestones.find((m) => !m.done)

  const alerts: { title: string; body: string }[] = []
  if (stale.length > 0) {
    alerts.push({
      title: `${stale.length} companies need a careers check`,
      body: 'Mark them checked after you scan openings — keeps your hunt current.',
    })
  }
  if (nextMilestone) {
    const d = daysUntil(nextMilestone.targetDate)
    alerts.push({
      title: `Next milestone: ${nextMilestone.title}`,
      body:
        d >= 0
          ? `Due in ${d} days (${formatDate(nextMilestone.targetDate)}).`
          : `Overdue by ${Math.abs(d)} days — nudge this forward.`,
    })
  }
  if (activeJobs.filter((j) => j.status === 'new').length > 0) {
    alerts.push({
      title: `${activeJobs.filter((j) => j.status === 'new').length} new roles to triage`,
      body: 'Move them to Saved or Applied so nothing slips.',
    })
  }

  return (
    <div>
      <section className="hero">
        <div className="hero-main">
          <p className="hero-kicker">Your personal job system</p>
          <h2>Laszlo Launchpad</h2>
          <p className="lede">
            Medtech UX research, human factors, and product roles across SF, San
            Diego, and LA — aimed at summer / fall 2027.
          </p>
          <div className="countdown">
            <div>
              <strong>{days}</strong>
              <span>days to target start</span>
            </div>
            <div>
              <strong>~{months}</strong>
              <span>months of runway</span>
            </div>
            <div>
              <strong>{format(new Date(profile.targetStart), 'MMM yyyy')}</strong>
              <span>ideal window</span>
            </div>
          </div>
        </div>
        <div className="hero-side">
          <div className="stat">
            <label>Companies tracked</label>
            <strong>{companies.length}</strong>
            <p>
              {priority.length} priority · {startups.length} startups
              {store.lastScanAt
                ? ` · last scan ${formatDate(store.lastScanAt)}`
                : ' · weekly scan not run yet'}
            </p>
          </div>
          <div className="stat">
            <label>Open roles logged</label>
            <strong>{activeJobs.length}</strong>
            <p>{jobs.filter((j) => j.status === 'applied').length} applied</p>
          </div>
          <div className="stat">
            <label>Profile</label>
            <strong style={{ fontSize: '1.15rem' }}>{profile.program}</strong>
            <p>
              {profile.school} · {profile.targetCities.join(' · ')}
            </p>
          </div>
        </div>
      </section>

      <div className="grid-2">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>Hunt signals</h3>
              <p>What to act on this week</p>
            </div>
          </div>
          {alerts.length === 0 ? (
            <div className="empty">You&apos;re caught up. Add a job or check a careers page.</div>
          ) : (
            alerts.map((a) => (
              <div className="alert" key={a.title}>
                <div>
                  <strong>{a.title}</strong>
                  <span>{a.body}</span>
                </div>
              </div>
            ))
          )}

          <div className="panel-head" style={{ marginTop: 18 }}>
            <div>
              <h3>Priority companies</h3>
              <p>Your top medtech targets</p>
            </div>
          </div>
          <div className="list">
            {priority.slice(0, 6).map((c) => (
              <CompanyMini key={c.id} company={c} />
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>Path to 2027</h3>
              <p>Milestones from now through start</p>
            </div>
          </div>
          <div className="timeline">
            {milestones.map((m) => (
              <div className={`milestone ${m.done ? 'done' : ''}`} key={m.id}>
                <h4>
                  <button
                    className="btn-ghost"
                    style={{ padding: 0, border: 0, font: 'inherit', fontWeight: 650 }}
                    onClick={() => store.toggleMilestone(m.id)}
                    title="Toggle done"
                  >
                    {m.done ? '✓ ' : ''}
                    {m.title}
                  </button>
                </h4>
                <p>{m.description}</p>
                <div className="when">{formatDate(m.targetDate)}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>Recent openings</h3>
            <p>Preview — full board lives on the Openings tab</p>
          </div>
          {onOpenOpenings && (
            <button className="btn btn-primary" onClick={onOpenOpenings}>
              Open openings
            </button>
          )}
        </div>
        {jobs.length === 0 ? (
          <div className="empty">
            No openings yet. The Saturday scan will fill the Openings tab — or log one
            there anytime.
          </div>
        ) : (
          <div className="list">
            {jobs.slice(0, 5).map((j) => (
              <JobMini
                key={j.id}
                job={j}
                companyName={companyName(store, j.companyId, j.companyName)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function companyName(store: Store, id: string, fallback?: string) {
  return store.state.companies.find((c) => c.id === id)?.name ?? fallback ?? 'Unknown'
}

function CompanyMini({ company }: { company: Company }) {
  return (
    <div className={`row priority-${company.priority}`}>
      <div>
        <h4>{company.name}</h4>
        <div className="meta">
          {company.focus} · {relativeChecked(company.lastChecked)}
        </div>
        <div className="chips">
          {company.locations.map((l) => (
            <span className="chip sky" key={l}>
              {l}
            </span>
          ))}
          <span className="chip">{SIZE_LABELS[company.size]}</span>
          <span className="chip muted">{STAGE_LABELS[company.stage]}</span>
        </div>
      </div>
      <a className="btn" href={company.careersUrl} target="_blank" rel="noreferrer">
        Careers
      </a>
    </div>
  )
}

function JobMini({ job, companyName }: { job: Job; companyName: string }) {
  return (
    <div className="row">
      <div>
        <h4>{job.title}</h4>
        <div className="meta">
          {companyName} · {ROLE_LABELS[job.roleFocus]} · {job.location}
        </div>
        <div className="chips">
          <span className="chip amber">{JOB_STATUS_LABELS[job.status]}</span>
          <span className="chip muted">Found {formatDate(job.foundAt)}</span>
        </div>
      </div>
      {job.url ? (
        <a className="btn" href={job.url} target="_blank" rel="noreferrer">
          Open
        </a>
      ) : null}
    </div>
  )
}
