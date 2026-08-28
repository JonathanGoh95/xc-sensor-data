import { useContext } from "react"
import { AutoRefreshContext, REFRESH_OPTIONS } from "../context/AutoRefreshContext"

export default function RefreshBack({results,handleBack,handleRefresh}){
    const {autoRefresh,setAutoRefresh,refreshInterval,setRefreshInterval,lastUpdated,refreshing} = useContext(AutoRefreshContext)
    const hasResults = results?.data?.length > 0

    // Mobile: controls wrap into a 2-up grid inside a capped width, bigger tap targets.
    // Desktop (md+): single horizontal row, unchanged.
    const btn = "border rounded hover:cursor-pointer px-3 py-2 md:py-1 flex-1 min-w-[8rem] md:flex-none md:min-w-0"

    return(
        <div className="flex flex-col items-center gap-1 w-full">
            <div className="flex flex-row flex-wrap justify-center gap-2 w-full max-w-xs text-lg
                            md:flex-nowrap md:w-auto md:max-w-none md:gap-4 md:text-2xl md:items-center">
                {hasResults ? <button onClick={handleRefresh} className={btn}>Refresh</button> : null}
                <button onClick={handleBack} className={btn}>Back</button>
                {hasResults ? (
                    <>
                        <button
                            onClick={()=>setAutoRefresh(!autoRefresh)}
                            title={autoRefresh ? `Refreshing every ${refreshInterval}s` : "Start auto refresh"}
                            className={`${btn} ${autoRefresh ? "border-red-500 text-red-600" : "border-green-600 text-green-700"}`}>
                            {autoRefresh ? "Stop Auto" : "Auto Refresh"}
                        </button>
                        <select
                            value={refreshInterval}
                            onChange={({target})=>setRefreshInterval(Number(target.value))}
                            title="Seconds between auto refreshes"
                            aria-label="Auto refresh interval in seconds"
                            className={`${btn} text-center`}>
                            {REFRESH_OPTIONS.map((seconds)=>(
                                <option key={seconds} value={seconds}>{seconds}s</option>
                            ))}
                        </select>
                    </>
                ) : null}
            </div>
            {hasResults && (autoRefresh || lastUpdated) ? (
                <div className="flex items-center justify-center gap-2 text-xs md:text-base text-gray-500 mt-1">
                    <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${refreshing ? "bg-green-500 animate-ping" : autoRefresh ? "bg-green-500" : "bg-gray-400"}`}></span>
                    <span>
                        {refreshing ? "Refreshing…" : lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : "Auto refresh on"}
                    </span>
                </div>
            ) : null}
        </div>
    )
}
