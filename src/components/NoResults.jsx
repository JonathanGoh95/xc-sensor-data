export default function NoResults({handleBack}){
    return(
        <>
            <p className="text-center text-lg md:text-2xl">No Results Found.</p>
            <button onClick={handleBack} className="border px-3 py-1 rounded text-sm md:text-base w-full md:w-auto mt-4">Back</button>
        </>
    )
}