import type { Store } from '../hooks/useStore'
import { STAGE_LABELS } from '../lib/labels'
import type { CompanyStage } from '../types'

const ORDER: CompanyStage[] = [
  'watching',
  'researching',
  'networking',
  'applied',
  'interviewing',
  'offer',
  'closed',
]

export function Pipeline({ store }: { store: Store }) {
  const { companies, jobs } = store.state

  return (
    <div>
      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>Company pipeline</h3>
            <p>Move orgs from watching → networking → applied as the year progresses</p>
          </div>
        </div>
        <div className="pipeline">
          {ORDER.map((stage) => {
            const items = companies.filter((c) => c.stage === stage)
            return (
              <div className="pipe-col" key={stage}>
                <h4>
                  {STAGE_LABELS[stage]} ({items.length})
                </h4>
                {items.map((c) => (
                  <div className="pipe-item" key={c.id}>
                    <strong>{c.name}</strong>
                    <div className="meta">P{c.priority} · {c.locations.join(', ')}</div>
                    <select
                      style={{ marginTop: 8, width: '100%' }}
                      value={c.stage}
                      onChange={(e) =>
                        store.setCompanyStage(c.id, e.target.value as CompanyStage)
                      }
                    >
                      {ORDER.map((s) => (
                        <option key={s} value={s}>
                          {STAGE_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </div>
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
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>Application pulse</h3>
            <p>Quick read on roles in motion</p>
          </div>
        </div>
        <div className="chips">
          <span className="chip">New: {jobs.filter((j) => j.status === 'new').length}</span>
          <span className="chip amber">
            Saved: {jobs.filter((j) => j.status === 'saved').length}
          </span>
          <span className="chip sky">
            Applied: {jobs.filter((j) => j.status === 'applied').length}
          </span>
          <span className="chip coral">
            Interviewing: {jobs.filter((j) => j.status === 'interviewing').length}
          </span>
          <span className="chip muted">
            Closed/Rejected:{' '}
            {jobs.filter((j) => ['closed', 'rejected'].includes(j.status)).length}
          </span>
        </div>
      </section>
    </div>
  )
}
