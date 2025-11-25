export default function RefreshBack({results,handleBack,handleRefresh}){
    return(
        <div className="flex flex-col md:flex-row justify-center text-lg md:text-2xl md:gap-4 w-1/2 md:w-auto">
            {results?.data?.length > 0 ? <button onClick={handleRefresh} className="mt-4 border px-3 py-1 rounded w-auto hover:cursor-pointer hover:bg-gray-100">Refresh</button> : null}
            <button onClick={handleBack} className="mt-4 border px-3 py-1 rounded w-auto hover:cursor-pointer hover:bg-gray-100">Back</button>
        </div>
    )
}