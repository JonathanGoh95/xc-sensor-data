import RefreshBack from "./RefreshBack";
import {
    ResponsiveContainer,
    ComposedChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";

export default function PeopleSuccess({pageItems,results,handleBack,handleRefresh}){
    const chartData = pageItems
    .map((res) => {
        const payloadLast = res.payload?.split(":")[res.payload.split(":").length - 1] || "";
        const sequenceNumber = parseInt(payloadLast?.slice(17, -6), 16) || 0;
        const numPeople = parseInt(payloadLast?.slice(25, -4), 16) || 0;
        const testRaw = parseInt(payloadLast?.slice(27, -2), 16) || '';
        const testCode = testRaw === 255 ? 1 : 0;
        const testStatus = testRaw === 255 ? "Testing" : "Normal";
        return {
            time: new Date(res.created_at).toLocaleTimeString(),
            datetime: new Date(res.created_at).toLocaleString(),
            seq: sequenceNumber,
            site: res.site_name,
            numPeople,
            testCode,
            testStatus,
            sensor_id: res.sensor_id,
            gateway_id: res.gateway_id,
        };
    })
    
    const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const p = payload[0].payload;
    return (
        <div className="bg-white border p-2 text-sm shadow">
            <div className="font-bold">{p.datetime}</div>
            <div>Sensor: {p.sensor_id}</div>
            <div>Gateway: {p.gateway_id}</div>
            <div>Site: {p.site}</div>
            <div>Sequence Number: {p.seq}</div>
            <div>Number of People: {p.numPeople}</div>
            <div>Testing Status: {p.testStatus}</div>
        </div>
    );
    }

    return(
        <>
            <h1 className="font-bold italic text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center">People Sensor Data</h1>
            <RefreshBack results={results} handleBack={handleBack} handleRefresh={handleRefresh}/>
            {/* Chart: responsive container that adapts on mobile */}
            <div className="w-full md:w-4/5 h-64 md:h-96 mx-auto px-4 md:px-0 mb-4">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 15 }} />
                {/* Left axis for sequence numbers */}
                <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 15 }} tickFormatter={(v) => v} />
                <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 1]}
                    tick={{ fontSize: 16 }}
                    ticks={[0,1]}
                    tickFormatter={(v) => v === 0 ? 'Normal' : 'Testing'}
                    allowDecimals={false}
                />
                <Tooltip content={CustomTooltip} />
                <Legend />
                <Line type="monotone" dataKey="numPeople" name="Number of People" stroke="#3182CE" yAxisId="left" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="stepAfter" dataKey="testCode" name="Testing Status" stroke="#E53E3E" yAxisId="right" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
            </ResponsiveContainer>
            </div>
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