import { useMemo, useState } from 'react'
import type { Store } from '../hooks/useStore'
import {
  LOCATIONS,
  SIZE_LABELS,
  STAGE_LABELS,
  formatDate,
  relativeChecked,
} from '../lib/labels'
import type { Company, CompanySize, CompanyStage, LocationTag } from '../types'

const STAGES = Object.keys(STAGE_LABELS) as CompanyStage[]
const SIZES = Object.keys(SIZE_LABELS) as CompanySize[]

export function Companies({ store }: { store: Store }) {
  const readOnly = store.readOnly
  const [q, setQ] = useState('')
  const [loc, setLoc] = useState<string>('all')
  const [size, setSize] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)

  const filtered = useMemo(() => {
    return store.state.companies
      .filter((c) => {
        if (loc !== 'all' && !c.locations.includes(loc as LocationTag)) return false
        if (size !== 'all' && c.size !== size) return false
        if (q) {
          const hay = `${c.name} ${c.focus} ${c.notes}`.toLowerCase()
          if (!hay.includes(q.toLowerCase())) return false
        }
        return true
      })
      .sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name))
  }, [store.state.companies, q, loc, size])

  return (
    <div>
      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>Company atlas</h3>
            <p>
              Medtech & healthtech targets — refreshed weekly with the Saturday scan
              {store.lastAtlasUpdateAt
                ? ` · last atlas update ${formatDate(store.lastAtlasUpdateAt)}`
                : ''}
            </p>
          </div>
          {!readOnly && (
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              Add company
            </button>
          )}
        </div>

        {store.atlasUpdateNotes && (
          <div className="alert" style={{ marginBottom: 14 }}>
            <div>
              <strong>Atlas pulse</strong>
              <span>{store.atlasUpdateNotes}</span>
            </div>
          </div>
        )}

        <div className="filters">
          <input
            placeholder="Search companies…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select value={loc} onChange={(e) => setLoc(e.target.value)}>
            <option value="all">All locations</option>
            {LOCATIONS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <select value={size} onChange={(e) => setSize(e.target.value)}>
            <option value="all">All sizes</option>
            {SIZES.map((s) => (
              <option key={s} value={s}>
                {SIZE_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        <div className="list">
          {filtered.map((c) => (
            <CompanyRow key={c.id} company={c} store={store} readOnly={readOnly} />
          ))}
          {filtered.length === 0 && <div className="empty">No companies match.</div>}
        </div>
      </section>

      {!readOnly && showForm && (
        <CompanyForm
          onClose={() => setShowForm(false)}
          onSave={(data) => {
            store.addCompany(data)
            setShowForm(false)
          }}
        />
      )}
    </div>
  )
}

function CompanyRow({
  company,
  store,
  readOnly,
}: {
  company: Company
  store: Store
  readOnly: boolean
}) {
  return (
    <div className={`row priority-${company.priority}`}>
      <div>
        <h4>{company.name}</h4>
        <div className="meta">
          {company.focus}
          {company.notes ? ` — ${company.notes}` : ''}
        </div>
        <div className="chips">
          {company.locations.map((l) => (
            <span className="chip sky" key={l}>
              {l}
            </span>
          ))}
          <span className="chip">{SIZE_LABELS[company.size]}</span>
          <span className="chip amber">P{company.priority}</span>
          {!readOnly && (
            <span className="chip muted">{relativeChecked(company.lastChecked)}</span>
          )}
          {readOnly && (
            <span className="chip muted">{STAGE_LABELS[company.stage]}</span>
          )}
        </div>
        <div className="inline-actions" style={{ marginTop: 10 }}>
          {!readOnly && (
            <>
              <select
                value={company.stage}
                onChange={(e) =>
                  store.setCompanyStage(company.id, e.target.value as CompanyStage)
                }
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {STAGE_LABELS[s]}
                  </option>
                ))}
              </select>
              <button onClick={() => store.markChecked(company.id)}>Mark checked</button>
            </>
          )}
          <a href={company.careersUrl} target="_blank" rel="noreferrer">
            Careers
          </a>
          <a href={company.website} target="_blank" rel="noreferrer">
            Site
          </a>
          {!readOnly && (
            <button
              onClick={() => {
                if (confirm(`Remove ${company.name}?`)) store.deleteCompany(company.id)
              }}
            >
              Remove
            </button>
          )}
        </div>
        {company.contacts && !readOnly && (
          <div className="meta" style={{ marginTop: 8 }}>
            Contacts: {company.contacts}
          </div>
        )}
      </div>
      {!readOnly && (
        <div className="meta" style={{ textAlign: 'right' }}>
          Added {formatDate(company.createdAt)}
        </div>
      )}
    </div>
  )
}

function CompanyForm({
  onClose,
  onSave,
}: {
  onClose: () => void
  onSave: (c: Omit<Company, 'id' | 'createdAt'>) => void
}) {
  const [name, setName] = useState('')
  const [website, setWebsite] = useState('')
  const [careersUrl, setCareersUrl] = useState('')
  const [focus, setFocus] = useState('')
  const [notes, setNotes] = useState('')
  const [contacts, setContacts] = useState('')
  const [size, setSize] = useState<CompanySize>('startup')
  const [priority, setPriority] = useState<1 | 2 | 3>(2)
  const [locations, setLocations] = useState<LocationTag[]>(['SF Bay'])

  function toggleLoc(l: LocationTag) {
    setLocations((prev) =>
      prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l],
    )
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Add company</h3>
        <div className="form-grid">
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Size
            <select value={size} onChange={(e) => setSize(e.target.value as CompanySize)}>
              {SIZES.map((s) => (
                <option key={s} value={s}>
                  {SIZE_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Website
            <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
          </label>
          <label>
            Careers URL
            <input
              value={careersUrl}
              onChange={(e) => setCareersUrl(e.target.value)}
              placeholder="https://"
            />
          </label>
          <label className="full">
            Focus
            <input
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="e.g. CGM patient UX, surgical HF"
            />
          </label>
          <label>
            Priority
            <select
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value) as 1 | 2 | 3)}
            >
              <option value={1}>1 — top</option>
              <option value={2}>2 — strong</option>
              <option value={3}>3 — watch</option>
            </select>
          </label>
          <label>
            Contacts
            <input value={contacts} onChange={(e) => setContacts(e.target.value)} />
          </label>
          <label className="full">
            Locations
            <div className="chips" style={{ marginTop: 4 }}>
              {LOCATIONS.map((l) => (
                <button
                  type="button"
                  key={l}
                  className={`chip ${locations.includes(l) ? '' : 'muted'}`}
                  onClick={() => toggleLoc(l)}
                  style={{ border: 0 }}
                >
                  {l}
                </button>
              ))}
            </div>
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
              if (!name.trim()) return
              onSave({
                name: name.trim(),
                website,
                careersUrl: careersUrl || website,
                locations: locations.length ? locations : ['Other CA'],
                size,
                focus,
                stage: 'watching',
                priority,
                notes,
                contacts,
                lastChecked: null,
              })
            }}
          >
            Save company
          </button>
        </div>
      </div>
    </div>
  )
}
