import { useState } from 'react'
import type { Store } from '../hooks/useStore'
import { ROLE_LABELS, LOCATIONS } from '../lib/labels'
import type { LocationTag, RoleFocus } from '../types'

export function Settings({ store }: { store: Store }) {
  const { profile } = store.state
  const [name, setName] = useState(profile.name)
  const [school, setSchool] = useState(profile.school)
  const [program, setProgram] = useState(profile.program)
  const [targetStart, setTargetStart] = useState(profile.targetStart.slice(0, 10))

  function toggleCity(city: LocationTag) {
    const has = profile.targetCities.includes(city)
    store.updateProfile({
      targetCities: has
        ? profile.targetCities.filter((c) => c !== city)
        : [...profile.targetCities, city],
    })
  }

  function toggleRole(role: RoleFocus) {
    const has = profile.targetRoles.includes(role)
    store.updateProfile({
      targetRoles: has
        ? profile.targetRoles.filter((r) => r !== role)
        : [...profile.targetRoles, role],
    })
  }

  return (
    <div>
      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>Your hunt profile</h3>
            <p>Personalize Laszlo Launchpad — saved in this browser</p>
          </div>
        </div>
        <div className="form-grid">
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            Target start
            <input
              type="date"
              value={targetStart}
              onChange={(e) => setTargetStart(e.target.value)}
            />
          </label>
          <label>
            School
            <input value={school} onChange={(e) => setSchool(e.target.value)} />
          </label>
          <label>
            Program
            <input value={program} onChange={(e) => setProgram(e.target.value)} />
          </label>
          <label className="full">
            Target cities
            <div className="chips" style={{ marginTop: 4 }}>
              {LOCATIONS.map((l) => (
                <button
                  type="button"
                  key={l}
                  className={`chip ${profile.targetCities.includes(l) ? '' : 'muted'}`}
                  style={{ border: 0 }}
                  onClick={() => toggleCity(l)}
                >
                  {l}
                </button>
              ))}
            </div>
          </label>
          <label className="full">
            Target roles
            <div className="chips" style={{ marginTop: 4 }}>
              {(Object.keys(ROLE_LABELS) as RoleFocus[]).map((r) => (
                <button
                  type="button"
                  key={r}
                  className={`chip ${profile.targetRoles.includes(r) ? '' : 'muted'}`}
                  style={{ border: 0 }}
                  onClick={() => toggleRole(r)}
                >
                  {ROLE_LABELS[r]}
                </button>
              ))}
            </div>
          </label>
        </div>
        <div className="form-actions">
          <button
            className="btn btn-primary"
            onClick={() =>
              store.updateProfile({
                name,
                school,
                program,
                targetStart: new Date(targetStart).toISOString(),
              })
            }
          >
            Save profile
          </button>
          <button className="btn" onClick={store.exportJson}>
            Export backup JSON
          </button>
          <button className="btn btn-danger" onClick={store.resetToSeed}>
            Reset starter data
          </button>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>Weekly Saturday scan</h3>
            <p>Cursor checks careers pages and writes matches into the project</p>
          </div>
        </div>
        <div className="list">
          <div className="row">
            <div>
              <h4>What gets scanned</h4>
              <div className="meta">
                Every Saturday the automation refreshes the <strong>Company atlas</strong>{' '}
                (add/fix targets, fix careers URLs) and scans careers pages for UX research,
                human factors, usability, and associate/product roles — especially CA (SF, SD,
                LA) or remote-CA.
              </div>
            </div>
          </div>
          <div className="row">
            <div>
              <h4>Where results land</h4>
              <div className="meta">
                Companies update in <code>src/data/companies.ts</code> (+{' '}
                <code>atlas-meta.json</code>). Openings land in{' '}
                <code>src/data/discovered-jobs.json</code>. Pull the weekly PR, refresh the
                app, and both the Companies and Openings tabs update.
              </div>
            </div>
          </div>
          <div className="row">
            <div>
              <h4>Your link</h4>
              <div className="meta">
                Run <code>npm run dev</code> and open{' '}
                <strong>http://localhost:5173</strong> — bookmark it.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
