export default function BinSuccess({pageItems,results,handleBack,handleRefresh}){
    return(
        <>
            <h1 className="font-bold italic text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center">Bin Sensor Data</h1>
            <div className="flex flex-col md:flex-row justify-center text-lg md:text-2xl md:gap-4 w-1/2 md:w-auto">
                {results?.data?.length > 0 ? <button onClick={handleRefresh} className="mt-4 border px-3 py-1 rounded w-auto">Refresh</button> : null}
                <button onClick={handleBack} className="mt-4 border px-3 py-1 rounded w-auto">Back</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full md:w-4/5 justify-items-center px-4 md:px-0">
                {pageItems.map((res) => {
                    const sequenceNumber = parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(17, -18),16) || '';
                    const isFullRaw = parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(25, -16),16) || '';
                    const alertSessions = parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(27, -12),16) || '';
                    const maxCalibVal = parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(31, -8),16) || '';
                    const currRange = parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(35, -4),16) || '';
                    let isFull;
                    if(isFullRaw === 0){
                        isFull = "Not Full";
                    } else if (isFullRaw === 1){
                        isFull = "Full";
                    } else if (isFullRaw === 255){
                        isFull = "Heartbeat";
                    }

                    return (
                        <div key={res.id} className="flex flex-col justify-center border-2 gap-2 p-3 md:p-2 text-center w-full rounded-md text-sm md:text-xl">
                            <p><span className="font-bold">Sensor ID:</span> {res.sensor_id}</p>
                            <p><span className="font-bold">Gateway ID:</span> {res.gateway_id}</p>
                            <p><span className="font-bold">Created At:</span> {new Date(res.created_at).toLocaleString()}</p>
                            <p><span className="font-bold">Updated At:</span> {new Date(res.updated_at).toLocaleString()}</p>
                            <p><span className="font-bold">Sequence Number:</span> {sequenceNumber}</p>
                            <p><span className="font-bold">Bin Status:</span> {isFull}</p>
                            <p><span className="font-bold">Alert Sessions:</span> {alertSessions}</p>
                            <p><span className="font-bold">Maximum Calibration Value:</span> {maxCalibVal}</p>
                            <p><span className="font-bold">Current Range:</span> {currRange}</p>
                        </div>
                    )
                })}
            </div>
        </>
    )
}