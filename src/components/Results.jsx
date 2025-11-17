import { useState, useEffect } from "react"
import * as apiService from '../services/getAPI'

export default function Results(){
    const [query,setQuery] = useState('')
    const [searched,setSearched] = useState(false)
    const [results,setResults] = useState([])
    const [page, setPage] = useState(1)
    const PAGE_SIZE = 10    // Results per Page
    const [loading, setLoading] = useState(false)
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

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
            const apiData = await apiService.api(query);
            setResults(apiData || []);
        } catch (err) {
            console.error('Error Occurred while API Data: ', err);
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    const handleBack = () =>{
        setSearched(false);
        setQuery('');
        setLoading(false);
    }

    const handleRefresh = async (e) => {
        e.preventDefault();
        setPage(1);
        setLoading(true)
        try {
            const apiData = await apiService.api(query);
            setResults(apiData || []);
        } catch (err) {
            console.error('Error Occurred while API Data: ', err);
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    if (!searched){
        return(
            <form class="flex flex-col md:flex-row items-center justify-center gap-4 mt-6 px-4 md:px-0" onSubmit={handleSubmit}>
                <label class="font-bold italic text-xl md:text-2xl">Enter Sensor ID: </label>
                <input class="border-2 text-lg md:text-2xl rounded-lg w-full md:w-1/5 text-center" value={query} type='text' placeholder='Sensor ID' onChange={({target})=>setQuery(target.value)}></input>
                <button class="border-2 text-lg md:text-2xl rounded-lg pt-2 pb-2 pl-5 pr-5 cursor-pointer italic w-full md:w-auto" type="submit">Search</button>
            </form>
        )
        } else{
        // When results comes back it is expected to be an object like { success: 1, data: [...] }
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
            <div class="flex flex-col items-center justify-center mt-5 text-lg md:text-2xl gap-4 px-4 md:px-0">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <svg className="animate-spin h-8 md:h-12 w-8 md:w-12 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                        <p className="mt-3 text-lg md:text-xl">Loading...</p>
                    </div>
                ) : null}

                {!loading && (
                    results.success === 1 && data.length > 0 ? (
                    <>
                        <div class="flex flex-col md:flex-row justify-center text-lg md:text-2xl md:gap-4 w-full md:w-auto">
                            {results?.data?.length > 0 ? <button onClick={handleRefresh} class="mt-4 border px-3 py-1 rounded w-full md:w-auto">Refresh</button> : null}
                            <button onClick={handleBack} class="mt-4 border px-3 py-1 rounded w-full md:w-auto">Back</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full md:w-3/4 justify-items-center px-4 md:px-0">
                            {pageItems.map((res) => {
                                const statusRaw = res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(25, -4) || '';

                                let statusMessage;
                                if (statusRaw === "00FFFF") {
                                    statusMessage = `Water Level is Normal (${statusRaw})`;
                                } else if (statusRaw === "FFFF00") {
                                    statusMessage = `Water Level is Too High (${statusRaw})`;
                                } else if (statusRaw === "000000") {
                                    statusMessage = `Water Level is Too Low (${statusRaw})`;
                                } else {
                                    statusMessage = `Anomaly/Sensor Issue Detected (${statusRaw})`;
                                }

                                return (
                                    <div key={res.id} className="flex flex-col justify-center border-2 gap-2 p-3 md:p-2 text-center w-full rounded-md text-sm md:text-base">
                                        <p><span className="font-bold">Sensor ID:</span> {res.sensor_id}</p>
                                        <p><span className="font-bold">Gateway ID:</span> {res.gateway_id}</p>
                                        <p><span className="font-bold">Created At:</span> <span>{new Date(res.created_at).toLocaleString()}</span></p>
                                        <p><span className="font-bold">Updated At:</span> <span>{new Date(res.updated_at).toLocaleString()}</span></p>
                                        <p><span className="font-bold">Status:</span> <span>{statusMessage}</span></p>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                    ) : (
                        <>
                            <p class="text-center text-lg md:text-2xl">No Results Found.</p>
                            <button onClick={handleBack} class="border px-3 py-1 rounded text-sm md:text-base w-full md:w-auto mt-4">Back</button>
                        </>
                    )
                )}
                {/* Pagination controls (grouped page numbers, groups of 10) */}
                {results.success === 1 && data.length > 0 && !loading && (
                    <div class="flex items-center justify-center gap-2 m-4 flex-wrap text-xs md:text-sm lg:text-base">
                        {/* Prev page */}
                        <button
                            class="border px-2 md:px-3 py-1 rounded disabled:opacity-50 text-xs md:text-sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            Prev
                        </button>

                        {/* Jump to previous group */}
                        {groupStart > 1 && (
                            <button
                                class="border px-2 py-1 rounded text-xs md:text-sm hidden sm:inline-block"
                                onClick={() => setPage(groupStart - 1)}
                                aria-label="Previous pages"
                            >
                                &laquo;
                            </button>
                        )}

                        {/* Page number buttons for current group */}
                        {pageNumbers.map((num) => (
                            <button
                                key={num}
                                class={"px-2 md:px-3 py-1 border rounded text-xs md:text-sm " + (num === page ? "bg-blue-600 text-white" : "hover:bg-gray-100")}
                                onClick={() => setPage(num)}
                                aria-current={num === page ? 'page' : undefined}
                            >
                                {num}
                            </button>
                        ))}

                        {/* Jump to next group */}
                        {groupEnd < totalPages && (
                            <button
                                class="border px-2 py-1 rounded text-xs md:text-sm hidden sm:inline-block"
                                onClick={() => setPage(groupEnd + 1)}
                                aria-label="Next pages"
                            >
                                &raquo;
                            </button>
                        )}

                        {/* Next page */}
                        <button
                            class="border px-2 md:px-3 py-1 rounded disabled:opacity-50 text-xs md:text-sm"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            Next
                        </button>

                        <span class="ml-2 md:ml-3 text-xs md:text-sm">Page {page} of {totalPages}</span>
                    </div>
                )}
            </div>
            </>
        )
    }
}