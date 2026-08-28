import { createContext } from "react"

// Shared so RefreshBack can drive the auto-refresh timer that lives in Results,
// without threading props through every *Success component.
export const AutoRefreshContext = createContext({
    autoRefresh: false,
    setAutoRefresh: () => {},
    refreshInterval: 30,
    setRefreshInterval: () => {},
    lastUpdated: null,
    refreshing: false,
})

export const REFRESH_OPTIONS = [3, 5, 10]
