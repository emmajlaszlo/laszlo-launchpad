import { createContext, useContext } from 'react'

const ViewModeContext = createContext(false)

/** Public share site (GitHub Pages) — always use this for friend links */
export const PUBLIC_SHARE_ORIGIN = 'https://emmajlaszlo.github.io/laszlo-launchpad'

export function ViewModeProvider({
  readOnly,
  children,
}: {
  readOnly: boolean
  children: React.ReactNode
}) {
  return (
    <ViewModeContext.Provider value={readOnly}>{children}</ViewModeContext.Provider>
  )
}

export function useReadOnly() {
  return useContext(ViewModeContext)
}

export function isShareView() {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  const view = params.get('view')
  return view === '1' || view === 'share' || view === 'true'
}

/** Always return the public view-only URL (never localhost). */
export function shareViewUrl() {
  return `${PUBLIC_SHARE_ORIGIN}/?view=1`
}
