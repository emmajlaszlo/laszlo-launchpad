import { createContext, useContext } from 'react'

const ViewModeContext = createContext(false)

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

export function shareViewUrl() {
  if (typeof window === 'undefined') return ''
  const url = new URL(window.location.href)
  url.search = ''
  url.hash = ''
  url.searchParams.set('view', '1')
  return url.toString()
}
