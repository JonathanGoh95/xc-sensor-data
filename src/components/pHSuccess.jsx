import RefreshBack from "./RefreshBack";

export default function PHSuccess({pageItems,results,handleBack,handleRefresh}){
    return(
        <>
            <h1 className="font-bold italic text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center">pH Sensor Data</h1>
            <RefreshBack results={results} handleBack={handleBack} handleRefresh={handleRefresh}/>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full md:w-4/5 justify-items-center px-4 md:px-0">
                {pageItems.map((res) => {
                    const sequenceNumber = parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(17, -10),16) || '';
                    const pHValue = parseFloat(parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(25, -8),16) / 10) || 0;
                    const temp = parseFloat(parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(27, -4),16) / 10) || '';
                    
                    return (
                        <div key={res.id} className="flex flex-col justify-center border-2 gap-2 p-3 md:p-2 text-center w-full rounded-md text-sm md:text-xl">
                            <p><span className="font-bold">Sensor ID:</span> {res.sensor_id}</p>
                            <p><span className="font-bold">Gateway ID:</span> {res.gateway_id}</p>
                            <p><span className="font-bold">Created At:</span> {new Date(res.created_at).toLocaleString()}</p>
                            <p><span className="font-bold">Updated At:</span> {new Date(res.updated_at).toLocaleString()}</p>
                            <p><span className="font-bold">Site:</span> {res.site_name} (ID: {res.site_id})</p>
                            <p><span className="font-bold">Sequence Number:</span> {sequenceNumber}</p>
                            <p><span className="font-bold">pH Value:</span> {pHValue}</p>
                            <p><span className="font-bold">Temperature:</span> {temp}°C</p>
                        </div>
                    )
                })}
            </div>
        </>
    )
}