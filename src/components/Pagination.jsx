export default function Pagination({groupStart,groupEnd,page,pageNumbers,setPage,totalPages,dataLength}){
    const handlePrevPage = () => {
        setPage((p) => Math.max(1, p - 1));
        window.scrollTo(0, 0);
    }

    const handlePrevGroup = () => {
        setPage(Math.max(1, groupStart - 5))
        window.scrollTo(0, 0);
    }

    const handlePageChange = (num) => {
        setPage(num);
        window.scrollTo(0, 0);
    }

    const handleNextPage = () => {
        setPage((p) => Math.min(totalPages, p + 1));
        window.scrollTo(0, 0);
    }

    const handleNextGroup = () => {
        setPage(Math.min(totalPages, groupEnd + 1));
        window.scrollTo(0, 0);
    }

    return(
        <div className="flex items-center justify-center gap-2 m-4 flex-wrap text-xs md:text-sm lg:text-base">
            {/* Prev page */}
            <button
                className="border px-2 md:px-3 py-1 rounded disabled:opacity-50 text-xs md:text-sm hover:cursor-pointer"
                onClick={handlePrevPage}
                disabled={page === 1}
            >
                Prev
            </button>

            {/* Jump to previous group */}
            {groupStart > 1 && (
                <button
                    className="border px-2 py-1 rounded text-xs md:text-sm hidden sm:inline-block hover:cursor-pointer"
                    onClick={handlePrevGroup}
                    aria-label="Previous pages"
                >
                    &laquo;
                </button>
            )}

            {/* Page number buttons for current group */}
            {pageNumbers.map((num) => (
                <button
                    key={num}
                    className={"hover:cursor-pointer px-2 md:px-3 py-1 border rounded text-xs md:text-sm " + (num === page && "bg-blue-600 text-white")}
                    onClick={() => handlePageChange(num)}
                    aria-current={num === page ? 'page' : undefined}
                >
                    {num}
                </button>
            ))}

            {/* Jump to next group */}
            {groupEnd < totalPages && (
                <button
                    className="border px-2 py-1 rounded text-xs md:text-sm hidden sm:inline-block hover:cursor-pointer"
                    onClick={handleNextGroup}
                    aria-label="Next pages"
                >
                    &raquo;
                </button>
            )}

            {/* Next page */}
            <button
                className="border px-2 md:px-3 py-1 rounded disabled:opacity-50 text-xs md:text-sm hover:cursor-pointer"
                onClick={handleNextPage}
                disabled={page === totalPages}
            >
                Next
            </button>

            <span className="ml-2 md:ml-3 text-xs md:text-sm">Page {page} of {totalPages} ({dataLength} Results)</span>
        </div>
    )
}