import { useState, useEffect, useRef, useCallback } from "react"
import * as apiService from '../services/getAPI'
import { AutoRefreshContext, DEFAULT_REFRESH_INTERVAL } from "../context/AutoRefreshContext"
import { resolveDeviceID } from "../config/deviceIdOverrides"
import Search from "./Search"
import Loading from "./Loading"
import NoResults from "./NoResults"
import DWTSuccess from "./DWTSuccess"
import BinSuccess from "./BinSuccess"
import PacketSuccess from "./PacketSuccess"
// import KEDSuccess from "./KEDSuccess"
import PeopleSuccess from "./PeopleSuccess"
import PeopleMOKOSuccess from "./PeopleMOKOSuccess"
import VibrationSuccess from "./VibrationSuccess"
import Pagination from "./Pagination"
import LightSuccess from "./LightSuccess"
import PHSuccess from "./pHSuccess"
import PHChlorineSuccess from "./pHChlorineSuccess"
import WaterflowSuccess from "./WaterflowSuccess"
import SoilSuccess from "./SoilSuccess"
import FloatSuccess from "./FloatSuccess"
import LeakSuccess from "./LeakSuccess"
import IAQSuccess from "./IAQSuccess"
import TouchSuccess from "./TouchSuccess"

// Sensor types whose data comes from the LoRaWAN endpoint (apiService.apiLORAWAN).
// Everything not listed here uses the default sensor-data endpoint (apiService.api).
// Add a sensor type to this set to route it through the LoRaWAN backend.
const LORAWAN_SENSORS = new Set(["peopleMOKO","vibration"])

export default function Results(){
    const [sensorType,setSensorType] = useState('')
    const [query,setQuery] = useState('')
    const [queryID,setQueryID] = useState('')
    const [searched,setSearched] = useState(false)
    const [results,setResults] = useState([])
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
    const [autoRefresh, setAutoRefresh] = useState(false)
    const [refreshInterval, setRefreshInterval] = useState(DEFAULT_REFRESH_INTERVAL)   // Seconds between auto refreshes
    const [lastUpdated, setLastUpdated] = useState(null)         // Timestamp of the last successful fetch
    const [refreshing, setRefreshing] = useState(false)          // A silent auto-refresh tick is in flight
    const fetching = useRef(false)
    const PAGE_SIZE = isMobile ? 5 : 12    // Results per Page

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])
    
    // Silent fetches (manual Refresh + auto refresh) skip the loading screen so the
    // table is not blanked; they show the "Refreshing…" pulse instead. Initial search
    // still uses the full loading screen since there is no data to keep on screen.
    const fetchResults = useCallback(async (searchQuery, id, {silent = false} = {}) => {
        if (fetching.current) return
        fetching.current = true
        setPage(1)
        if (silent) setRefreshing(true)
        else setLoading(true)
        try {
            const apiData = LORAWAN_SENSORS.has(sensorType)
                ? await apiService.apiLORAWAN(id)
                : await apiService.api(searchQuery, id);
            setResults(apiData || []);
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Error Occurred while fetching API Data: ', err);
            setResults([])
        } finally {
            if (silent) setRefreshing(false)
            else setLoading(false)
            fetching.current = false
        }
    }, [sensorType])

    const handleSubmit = async (e) => {
        e.preventDefault()
        let paddedID = sensorType === "pkt" ? "000F" : String(queryID).padStart(4,'0')
        paddedID = resolveDeviceID(sensorType, paddedID)
        setQueryID(paddedID)
        setSearched(true)
        await fetchResults(query, paddedID)
    }

    const handleBack = () =>{
        setSearched(false);
        setQuery('');
        setQueryID('');
        setLoading(false);
        setAutoRefresh(false);
    }

    const handleRefresh = async (e) => {
        e.preventDefault();
        await fetchResults(query, queryID, {silent: true})
    }

    useEffect(() => {
        if (!searched || !autoRefresh) return
        const timer = setInterval(() => fetchResults(query, queryID, {silent: true}), refreshInterval * 1000)
        return () => clearInterval(timer)
    }, [searched, autoRefresh, refreshInterval, query, queryID, fetchResults])

    if (!searched){
        return <Search handleSubmit={handleSubmit} setQuery={setQuery} queryID={queryID} setQueryID={setQueryID} sensorType={sensorType} setSensorType={setSensorType}/>
    } else{
        const rawData = results?.data || []
        // peopleMOKO sends non-heartbeat uplinks (e.g. join/status) alongside people-count
        // heartbeats; only heartbeat packets carry a usable people count, so filter before paginating.
        const data = sensorType === "peopleMOKO"
            ? rawData.filter((res) => res.payload?.uplink_message?.decoded_payload?.payloadType === "heartbeat")
            : rawData
        const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE))
        const startIndex = (page - 1) * PAGE_SIZE
        const pageItems = data.slice(startIndex, startIndex + PAGE_SIZE)
        const GROUP_SIZE = isMobile ? 5 : 10
        const groupStart = Math.floor((page - 1) / GROUP_SIZE) * GROUP_SIZE + 1
        const groupEnd = Math.min(totalPages, groupStart + GROUP_SIZE - 1)
        const pageNumbers = []
        for (let i = groupStart; i <= groupEnd; i++) pageNumbers.push(i)

        return(
            <AutoRefreshContext.Provider value={{autoRefresh, setAutoRefresh, refreshInterval, setRefreshInterval, lastUpdated, refreshing}}>
            {/* Pagination controls (grouped page numbers, groups of 10) */}
            {results.success === 1 && data.length > 0 && !loading && <div className="mt-2 -mb-2"><Pagination groupStart={groupStart} groupEnd={groupEnd} page={page} pageNumbers={pageNumbers} setPage={setPage} totalPages={totalPages} dataLength={data.length}/></div>}
            <div className="flex flex-col items-center justify-center mt-5 text-lg md:text-2xl gap-4 px-4 md:px-0">
                {loading ? <Loading /> : null}
                {!loading && (
                    results.success === 1 && data.length > 0 ? (
                        sensorType === "pkt" ? 
                        <PacketSuccess pageItems={pageItems} results={results} handleBack={handleBack} handleRefresh={handleRefresh}/> :
                        sensorType === "dwt" ? 
                        <DWTSuccess pageItems={pageItems} results={results} handleBack={handleBack} handleRefresh={handleRefresh}/> :
                        sensorType === "bin" ?
                        <BinSuccess pageItems={pageItems} results={results} handleBack={handleBack} handleRefresh={handleRefresh}/> :
                        // sensorType === "ked" ?
                        // <KEDSuccess pageItems={pageItems} results={results} handleBack={handleBack} handleRefresh={handleRefresh}/> :
                        sensorType === "light" ?
                        <LightSuccess pageItems={pageItems} results={results} handleBack={handleBack} handleRefresh={handleRefresh}/> :
                        sensorType === "people" ?
                        <PeopleSuccess pageItems={pageItems} results={results} handleBack={handleBack} handleRefresh={handleRefresh}/> :
                        sensorType === "peopleMOKO" ?
                        <PeopleMOKOSuccess pageItems={pageItems} results={results} handleBack={handleBack} handleRefresh={handleRefresh}/> :
                        sensorType === "vibration" ?
                        <VibrationSuccess pageItems={pageItems} results={results} handleBack={handleBack} handleRefresh={handleRefresh}/> :
                        sensorType === "pH" ?
                        <PHSuccess pageItems={pageItems} results={results} handleBack={handleBack} handleRefresh={handleRefresh}/> :
                        sensorType === "pHChlorine" ?
                        <PHChlorineSuccess pageItems={pageItems} results={results} handleBack={handleBack} handleRefresh={handleRefresh}/> :
                        sensorType === "water" ?
                        <WaterflowSuccess pageItems={pageItems} results={results} handleBack={handleBack} handleRefresh={handleRefresh}/> :
                        sensorType === "soil" ?
                        <SoilSuccess pageItems={pageItems} results={results} handleBack={handleBack} handleRefresh={handleRefresh}/> :
                        sensorType === "float" ?
                        <FloatSuccess pageItems={pageItems} results={results} handleBack={handleBack} handleRefresh={handleRefresh}/> :
                        sensorType === "leak" ?
                        <LeakSuccess pageItems={pageItems} results={results} handleBack={handleBack} handleRefresh={handleRefresh}/> :
                        sensorType === "iaq" ?
                        <IAQSuccess pageItems={pageItems} results={results} handleBack={handleBack} handleRefresh={handleRefresh}/> :
                        sensorType === "touch" ?
                        <TouchSuccess pageItems={pageItems} results={results} handleBack={handleBack} handleRefresh={handleRefresh}/> :
                        <NoResults handleBack={handleBack}/>
                    ) : (
                        <NoResults handleBack={handleBack}/>
                    )
                )}
                {/* Pagination controls (grouped page numbers, groups of 10) */}
                </div>
                {results.success === 1 && data.length > 0 && !loading && <div className="mt-4 pb-4"><Pagination groupStart={groupStart} groupEnd={groupEnd} page={page} pageNumbers={pageNumbers} setPage={setPage} totalPages={totalPages} dataLength={data.length}/></div>}
            </AutoRefreshContext.Provider>
        )
    }
}