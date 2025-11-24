export default function KEDSuccess({pageItems,results,handleBack,handleRefresh}){
    return(
        <>
            <h1 className="font-bold italic text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center">Kitchen Exhaust Duct (KED) Sensor Data</h1>
            <div className="flex flex-col md:flex-row justify-center text-lg md:text-2xl md:gap-4 w-1/2 md:w-auto">
                {results?.data?.length > 0 ? <button onClick={handleRefresh} className="mt-4 border px-3 py-1 rounded w-auto">Refresh</button> : null}
                <button onClick={handleBack} className="mt-4 border px-3 py-1 rounded w-auto">Back</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full md:w-4/5 justify-items-center px-4 md:px-0">
                {pageItems.map((res) => {
                    const sequenceNumber = parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(17, -18),16) || '';
                    const appVer = parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(25, -16),16) || '';
                    const reference = parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(27, -10),16) || 0;
                    const brightness = parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(33, -4),16) || 0;
                    const testing = parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(39, -2),16) || '';
                    let isTesting; 
                    if(testing === 255){
                        isTesting = "True";
                    } else{
                        isTesting = "False";
                    }

                    return (
                        <div key={res.id} className="flex flex-col justify-center border-2 gap-2 p-3 md:p-2 text-center w-full rounded-md text-sm md:text-xl">
                            <p><span className="font-bold">Sensor ID:</span> {res.sensor_id}</p>
                            <p><span className="font-bold">Gateway ID:</span> {res.gateway_id}</p>
                            <p><span className="font-bold">Created At:</span> {new Date(res.created_at).toLocaleString()}</p>
                            <p><span className="font-bold">Updated At:</span> {new Date(res.updated_at).toLocaleString()}</p>
                            <p><span className="font-bold">Sequence Number:</span> {sequenceNumber}</p>
                            <p><span className="font-bold">App Version:</span> {appVer}</p>
                            <p><span className="font-bold">Internal Reference:</span> {reference}</p>
                            <p><span className="font-bold">Brightness Value:</span> {brightness}</p>
                            <p><span className="font-bold">Testing Status:</span> {isTesting}</p>
                        </div>
                    )
                })}
            </div>
        </>
    )
}