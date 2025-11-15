import { useState } from "react"
import * as apiService from '../services/getAPI'

export default function Results(){
    const [query,setQuery] = useState('')
    const [searched,setSearched] = useState(false)
    const [results,setResults] = useState([])
    const [page, setPage] = useState(1)
    const PAGE_SIZE = 10    // Results per Page
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSearched(true);
        setPage(1);
        const apiData = await apiService.api(query);
        setResults(apiData || []);
    }

    if (!searched){
        return(
            <form className='flex gap-10 justify-center' onSubmit={handleSubmit}>
                <label className="w-1/2 text-center">Sensor ID: </label>
                <input className='border-2 text-3xl rounded-lg w-1/2 text-center' value={query} type='text' placeholder='Input Sensor ID...' onChange={({target})=>setQuery(target.value)}></input>
                <button className='border-2 text-3xl rounded-lg pt-2 pb-2 pl-5 pr-5 cursor-pointer' type="submit">Search</button>
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
            <div className="flex-col justify-center mt-5 text-3xl">
                {results.success === 1 && data.length > 0 ? (
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
                            <div key={res.id} className="flex-col border-2 gap-2">
                                <p>Gateway ID: {res.gateway_id}</p>
                                <p>Created At: {new Date(res.created_at).toLocaleString()}</p>
                                <p>Updated At: {new Date(res.updated_at).toLocaleString()}</p>
                                <p>Sensor Status: {statusMessage}</p>
                            </div>
                        )
                    })
                ) : (
                    <p className="text-center">No results found.</p>
                )}

                {/* Pagination controls (grouped page numbers, groups of 10) */}
                {results.success === 1 && data.length > 0 && (
                    <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                        {/* Prev page */}
                        <button
                            className="border px-3 py-1 rounded disabled:opacity-50"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            Prev
                        </button>

                        {/* Jump to previous group */}
                        {groupStart > 1 && (
                            <button
                                className="border px-2 py-1 rounded"
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
                                className={"px-3 py-1 border rounded " + (num === page ? "bg-blue-600 text-white" : "hover:bg-gray-100")}
                                onClick={() => setPage(num)}
                                aria-current={num === page ? 'page' : undefined}
                            >
                                {num}
                            </button>
                        ))}

                        {/* Jump to next group */}
                        {groupEnd < totalPages && (
                            <button
                                className="border px-2 py-1 rounded"
                                onClick={() => setPage(groupEnd + 1)}
                                aria-label="Next pages"
                            >
                                &raquo;
                            </button>
                        )}

                        {/* Next page */}
                        <button
                            className="border px-3 py-1 rounded disabled:opacity-50"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            Next
                        </button>

                        <span className="ml-3">Page {page} of {totalPages}</span>
                    </div>
                )}
            </div>
            <button onClick={() => setSearched(false)} className="mt-4 border px-3 py-1 rounded">Back</button>
            </>
        )
    }
}