export default function Success({pageItems,results,handleBack,handleRefresh}){
    return(
        <>
            <div className="flex flex-col md:flex-row justify-center text-lg md:text-2xl md:gap-4 w-1/2 md:w-auto">
                {results?.data?.length > 0 ? <button onClick={handleRefresh} className="mt-4 border px-3 py-1 rounded w-auto">Refresh</button> : null}
                <button onClick={handleBack} className="mt-4 border px-3 py-1 rounded w-auto">Back</button>
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
                        <div key={res.id} className="flex flex-col justify-center border-2 gap-2 p-3 md:p-2 text-center w-full rounded-md text-sm md:text-xl">
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
    )
}