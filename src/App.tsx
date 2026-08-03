import { useState } from 'react'
import { Companies } from './components/Companies'
import { Dashboard } from './components/Dashboard'
import { Jobs } from './components/Jobs'
import { Pipeline } from './components/Pipeline'
import { Settings } from './components/Settings'
import { useStore } from './hooks/useStore'
import './index.css'

type Tab = 'home' | 'companies' | 'jobs' | 'pipeline' | 'settings'

const TABS: { id: Tab; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'companies', label: 'Companies' },
  { id: 'jobs', label: 'Openings' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'settings', label: 'Profile' },
]

export default function App() {
  const store = useStore()
  const [tab, setTab] = useState<Tab>('home')

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <span className="brand-dot" aria-hidden />
            <h1>Laszlo Launchpad</h1>
          </div>
          <p>Combating the post grad scaries</p>
        </div>
        <div className="top-actions">
          <button className="btn" onClick={store.exportJson}>
            Export
          </button>
        </div>
      </header>

      <nav className="nav" aria-label="Main">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? 'active' : ''}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'home' && (
        <Dashboard store={store} onOpenOpenings={() => setTab('jobs')} />
      )}
      {tab === 'companies' && <Companies store={store} />}
      {tab === 'jobs' && <Jobs store={store} />}
      {tab === 'pipeline' && <Pipeline store={store} />}
      {tab === 'settings' && <Settings store={store} />}
    </div>
  )
}
