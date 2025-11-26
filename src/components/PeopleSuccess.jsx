import RefreshBack from "./RefreshBack";

export default function PeopleSuccess({pageItems,results,handleBack,handleRefresh}){
    return(
        <>
            <h1 className="font-bold italic text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center">People Sensor Data</h1>
            <RefreshBack results={results} handleBack={handleBack} handleRefresh={handleRefresh}/>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full md:w-4/5 justify-items-center px-4 md:px-0">
                {pageItems.map((res) => {
                    const sequenceNumber = parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(17, -6),16) || '';
                    const numPeople = parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(25, -4),16) || 0;
                    const testStatusRaw = parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(27, -2),16) || '';
                    let testStatus;
                    if (testStatusRaw === 255){
                        testStatus = "Testing (True)";
                    } else{
                        testStatus = "Normal (False)";
                    }
                    return (
                        <div key={res.id} className="flex flex-col justify-center border-2 gap-2 p-3 md:p-2 text-center w-full rounded-md text-sm md:text-xl">
                            <p><span className="font-bold">Sensor ID:</span> {res.sensor_id}</p>
                            <p><span className="font-bold">Gateway ID:</span> {res.gateway_id}</p>
                            <p><span className="font-bold">Created At:</span> {new Date(res.created_at).toLocaleString()}</p>
                            <p><span className="font-bold">Updated At:</span> {new Date(res.updated_at).toLocaleString()}</p>
                            <p><span className="font-bold">Site:</span> {res.site_name} (ID: {res.site_id})</p>
                            <p><span className="font-bold">Sequence Number:</span> {sequenceNumber}</p>
                            <p><span className="font-bold">Number of People:</span> {numPeople}</p>
                            <p><span className="font-bold">Testing Status:</span> {testStatus}</p>
                        </div>
                    )
                })}
            </div>
        </>
    )
}