import { createContext } from "react"

export const REFRESH_OPTIONS = [3, 5, 10]

// Must be one of REFRESH_OPTIONS, otherwise the controlled <select> in RefreshBack
// renders the first option while state holds a different value, and the timer runs
// at the unshown interval until the dropdown is changed.
export const DEFAULT_REFRESH_INTERVAL = REFRESH_OPTIONS[0]

// Shared so RefreshBack can drive the auto-refresh timer that lives in Results,
// without threading props through every *Success component.
export const AutoRefreshContext = createContext({
    autoRefresh: false,
    setAutoRefresh: () => {},
    refreshInterval: DEFAULT_REFRESH_INTERVAL,
    setRefreshInterval: () => {},
    lastUpdated: null,
    refreshing: false,
})
