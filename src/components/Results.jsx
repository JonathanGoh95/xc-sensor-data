import { useState } from "react"
import * as apiService from '../services/getAPI'

export default function Results(){
    const [query,setQuery] = useState('')
    const [searched,setSearched] = useState(false)
    const [results,setResults] = useState([])
    const [page, setPage] = useState(1)
    const PAGE_SIZE = 10    // Results per Page
    const [loading, setLoading] = useState(false)
    
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
            <form class="flex items-center justify-center gap-4" onSubmit={handleSubmit}>
                <label class="text-bold text-2xl">Sensor ID: </label>
                <input class='border-2 text-3xl rounded-lg w-1/5 text-center' value={query} type='text' placeholder='Input Sensor ID...' onChange={({target})=>setQuery(target.value)}></input>
                <button class='border-2 text-3xl rounded-lg pt-2 pb-2 pl-5 pr-5 cursor-pointer' type="submit">Search</button>
            </form>
        )
        } else{
        // When results comes back it is expected to be an object like { success: 1, data: [...] }
        const data = results?.data || []
        const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE))
        const startIndex = (page - 1) * PAGE_SIZE
        const pageItems = data.slice(startIndex, startIndex + PAGE_SIZE)
        const GROUP_SIZE = 10
        const groupStart = Math.floor((page - 1) / GROUP_SIZE) * GROUP_SIZE + 1
        const groupEnd = Math.min(totalPages, groupStart + GROUP_SIZE - 1)
        const pageNumbers = []
        for (let i = groupStart; i <= groupEnd; i++) pageNumbers.push(i)

        return(
            <>
            <div class="flex flex-col items-center justify-center mt-5 text-2xl gap-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <svg className="animate-spin h-12 w-12 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                        <p className="mt-3">Loading...</p>
                    </div>
                ) : null}

                {!loading && (
                    results.success === 1 && data.length > 0 ? (
                        pageItems.map((res) => {
                            const statusRaw = res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(25, -4) || '';

                            let statusMessage;
                            if (statusRaw === "00FFFF") {
                                statusMessage = "Water Level is Normal";
                            } else if (statusRaw === "FFFF00") {
                                statusMessage = "Water Level is Too High";
                            } else if (statusRaw === "000000") {
                                statusMessage = "Water Level is Too Low";
                            } else {
                                statusMessage = "Anomaly/Sensor Issue Detected";
                            }

                            return (
                                <div key={res.id} class="flex flex-col justify-center border-2 gap-2 p-2 text-center w-1/3 rounded-md">
                                    <p><span class="font-bold">Sensor ID:</span> {res.sensor_id}</p>
                                    <p><span class="font-bold">Gateway ID:</span> {res.gateway_id}</p>
                                    <p><span class="font-bold">Created At:</span> {new Date(res.created_at).toLocaleString()}</p>
                                    <p><span class="font-bold">Updated At:</span> {new Date(res.updated_at).toLocaleString()}</p>
                                    <p><span class="font-bold">Sensor Status:</span> {statusMessage}</p>
                                </div>
                            )
                        })
                    ) : (
                        <p class="text-center">No Results Found.</p>
                    )
                )}

                {/* Pagination controls (grouped page numbers, groups of 10) */}
                {results.success === 1 && data.length > 0 && !loading && (
                    <div class="flex items-center justify-center gap-2 mt-4 flex-wrap">
                        {/* Prev page */}
                        <button
                            class="border px-3 py-1 rounded disabled:opacity-50"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            Prev
                        </button>

                        {/* Jump to previous group */}
                        {groupStart > 1 && (
                            <button
                                class="border px-2 py-1 rounded"
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
                                class={"px-3 py-1 border rounded " + (num === page ? "bg-blue-600 text-white" : "hover:bg-gray-100")}
                                onClick={() => setPage(num)}
                                aria-current={num === page ? 'page' : undefined}
                            >
                                {num}
                            </button>
                        ))}

                        {/* Jump to next group */}
                        {groupEnd < totalPages && (
                            <button
                                class="border px-2 py-1 rounded"
                                onClick={() => setPage(groupEnd + 1)}
                                aria-label="Next pages"
                            >
                                &raquo;
                            </button>
                        )}

                        {/* Next page */}
                        <button
                            class="border px-3 py-1 rounded disabled:opacity-50"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            Next
                        </button>

                        <span class="ml-3">Page {page} of {totalPages}</span>
                    </div>
                )}
            </div>
            <div class="flex justify-center text-2xl gap-6">
                {results?.data?.length > 0 ? <button onClick={handleRefresh} class="mt-4 border px-3 py-1 rounded">Refresh</button> : null}
                <button onClick={handleBack} class="mt-4 border px-3 py-1 rounded">Back</button>
            </div>
            </>
        )
    }
}