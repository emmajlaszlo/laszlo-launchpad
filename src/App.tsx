import { useMemo, useState } from 'react'
import { Companies } from './components/Companies'
import { Dashboard } from './components/Dashboard'
import { Jobs } from './components/Jobs'
import { Pipeline } from './components/Pipeline'
import { Settings } from './components/Settings'
import { useStore } from './hooks/useStore'
import { ViewModeProvider, isShareView, shareViewUrl } from './lib/viewMode'
import './index.css'

type Tab = 'home' | 'companies' | 'jobs' | 'pipeline' | 'settings'

export default function App() {
  const readOnly = useMemo(() => isShareView(), [])
  const store = useStore(readOnly)
  const [tab, setTab] = useState<Tab>('home')
  const [copied, setCopied] = useState(false)

  const tabs = useMemo(() => {
    const all: { id: Tab; label: string }[] = [
      { id: 'home', label: 'Home' },
      { id: 'companies', label: 'Companies' },
      { id: 'jobs', label: 'Openings' },
      { id: 'pipeline', label: 'Applications' },
      { id: 'settings', label: 'Profile' },
    ]
    // Viewers can browse atlas + openings; applications stay private
    if (readOnly) {
      return all.filter((t) => t.id !== 'pipeline' && t.id !== 'settings')
    }
    return all
  }, [readOnly])

  function copyShareLink() {
    const url = shareViewUrl()
    void navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <ViewModeProvider readOnly={readOnly}>
      <div className={`app-shell ${readOnly ? 'is-readonly' : ''}`}>
        {readOnly && (
          <div className="view-banner" role="status">
            <strong>View only</strong>
            <span> — you can browse Laszlo Launchpad, but can&apos;t edit this hunt.</span>
          </div>
        )}

        <header className="topbar">
          <div className="brand">
            <div className="brand-mark">
              <img
                className="brand-logo"
                src="/logo.png"
                alt=""
                width={48}
                height={48}
              />
              <h1>Laszlo Launchpad</h1>
            </div>
            <p>Combating the post grad scaries</p>
          </div>
          {!readOnly && (
            <div className="top-actions">
              <button className="btn" onClick={copyShareLink}>
                {copied ? 'Copied!' : 'Copy view-only link'}
              </button>
              <button className="btn" onClick={store.exportJson}>
                Export
              </button>
            </div>
          )}
        </header>

        <nav className="nav" aria-label="Main">
          {tabs.map((t) => (
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
        {!readOnly && tab === 'pipeline' && <Pipeline store={store} />}
        {!readOnly && tab === 'settings' && <Settings store={store} />}
      </div>
    </ViewModeProvider>
  )
}
