export default function Pagination({groupStart,groupEnd,page,pageNumbers,setPage,totalPages,dataLength}){
    return(
        <div className="flex items-center justify-center gap-2 m-4 flex-wrap text-xs md:text-sm lg:text-base">
            {/* Prev page */}
            <button
                className="border px-2 md:px-3 py-1 rounded disabled:opacity-50 text-xs md:text-sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
            >
                Prev
            </button>

            {/* Jump to previous group */}
            {groupStart > 1 && (
                <button
                    className="border px-2 py-1 rounded text-xs md:text-sm hidden sm:inline-block"
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
                    className={"px-2 md:px-3 py-1 border rounded text-xs md:text-sm " + (num === page ? "bg-blue-600 text-white" : "hover:bg-gray-100")}
                    onClick={() => setPage(num)}
                    aria-current={num === page ? 'page' : undefined}
                >
                    {num}
                </button>
            ))}

            {/* Jump to next group */}
            {groupEnd < totalPages && (
                <button
                    className="border px-2 py-1 rounded text-xs md:text-sm hidden sm:inline-block"
                    onClick={() => setPage(groupEnd + 1)}
                    aria-label="Next pages"
                >
                    &raquo;
                </button>
            )}

            {/* Next page */}
            <button
                className="border px-2 md:px-3 py-1 rounded disabled:opacity-50 text-xs md:text-sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
            >
                Next
            </button>

            <span className="ml-2 md:ml-3 text-xs md:text-sm">Page {page} of {totalPages} ({dataLength} Results)</span>
        </div>
    )
}