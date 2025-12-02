import { useState, useEffect } from "react"
import * as apiService from '../services/getAPI'
import Search from "./Search"
import Loading from "./Loading"
import NoResults from "./NoResults"
import DWTSuccess from "./DWTSuccess"
import BinSuccess from "./BinSuccess"
import KEDSuccess from "./KEDSuccess"
import PeopleSuccess from "./PeopleSuccess"
import Pagination from "./Pagination"
import LightSuccess from "./LightSuccess"
import PHSuccess from "./pHSuccess"
import WaterflowSuccess from "./WaterflowSuccess"
import SoilSuccess from "./SoilSuccess"

export default function Results(){
    const [sensorType,setSensorType] = useState('dwt')
    const [query,setQuery] = useState('')
    const [queryID,setQueryID] = useState('')
    const [searched,setSearched] = useState(false)
    const [results,setResults] = useState([])
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
    const PAGE_SIZE = isMobile ? 5 : 12    // Results per Page

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSearched(true);
        setPage(1);
        setLoading(true)
        try {
            const apiData = await apiService.api(query,queryID);
            setResults(apiData || []);
        } catch (err) {
            console.error('Error Occurred while fetching API Data: ', err);
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    const handleBack = () =>{
        setSearched(false);
        setQuery('');
        setQueryID('');
        setLoading(false);
    }

    const handleRefresh = async (e) => {
        e.preventDefault();
        setPage(1);
        setLoading(true)
        try {
            const apiData = await apiService.api(query,queryID);
            setResults(apiData || []);
        } catch (err) {
            console.error('Error Occurred while fetching API Data: ', err);
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    if (!searched){
        return <Search handleSubmit={handleSubmit} query={query} setQuery={setQuery} queryID={queryID} setQueryID={setQueryID} sensorType={sensorType} setSensorType={setSensorType}/>
    } else{
        const data = results?.data || []
        const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE))
        const startIndex = (page - 1) * PAGE_SIZE
        const pageItems = data.slice(startIndex, startIndex + PAGE_SIZE)
        const GROUP_SIZE = isMobile ? 5 : 10
        const groupStart = Math.floor((page - 1) / GROUP_SIZE) * GROUP_SIZE + 1
        const groupEnd = Math.min(totalPages, groupStart + GROUP_SIZE - 1)
        const pageNumbers = []
        for (let i = groupStart; i <= groupEnd; i++) pageNumbers.push(i)

        return(
            <>
            {/* Pagination controls (grouped page numbers, groups of 10) */}
            {results.success === 1 && data.length > 0 && !loading && <Pagination groupStart={groupStart} groupEnd={groupEnd} page={page} pageNumbers={pageNumbers} setPage={setPage} totalPages={totalPages} dataLength={data.length}/>}
            <div className="flex flex-col items-center justify-center mt-5 text-lg md:text-2xl gap-4 px-4 md:px-0">
                {loading ? <Loading /> : null}
                {!loading && (
                    results.success === 1 && data.length > 0 ? (
                        sensorType === "dwt" ? 
                        <DWTSuccess pageItems={pageItems} results={results} handleBack={handleBack} handleRefresh={handleRefresh}/> :
                        sensorType === "bin" ?
                        <BinSuccess pageItems={pageItems} results={results} handleBack={handleBack} handleRefresh={handleRefresh}/> :
                        sensorType === "ked" ?
                        <KEDSuccess pageItems={pageItems} results={results} handleBack={handleBack} handleRefresh={handleRefresh}/> :
                        sensorType === "light" ?
                        <LightSuccess pageItems={pageItems} results={results} handleBack={handleBack} handleRefresh={handleRefresh}/> :
                        sensorType === "people" ?
                        <PeopleSuccess pageItems={pageItems} results={results} handleBack={handleBack} handleRefresh={handleRefresh}/> :
                        sensorType === "pH" ?
                        <PHSuccess pageItems={pageItems} results={results} handleBack={handleBack} handleRefresh={handleRefresh}/> :
                        sensorType === "water" ?
                        <WaterflowSuccess pageItems={pageItems} results={results} handleBack={handleBack} handleRefresh={handleRefresh}/> :
                        sensorType === "soil" ?
                        <SoilSuccess pageItems={pageItems} results={results} handleBack={handleBack} handleRefresh={handleRefresh}/> :
                        <NoResults handleBack={handleBack}/>
                    ) : (
                        <NoResults handleBack={handleBack}/>
                    )
                )}
                {/* Pagination controls (grouped page numbers, groups of 10) */}
                {results.success === 1 && data.length > 0 && !loading && <Pagination groupStart={groupStart} groupEnd={groupEnd} page={page} pageNumbers={pageNumbers} setPage={setPage} totalPages={totalPages} dataLength={data.length}/>}
            </div>
            </>
        )
    }
}