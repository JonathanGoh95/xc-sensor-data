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

export default function KEDSuccess({pageItems,results,handleBack,handleRefresh}){
    const chartData = pageItems
    .map((res) => {
        const payloadLast = res.payload?.split(":")[res.payload.split(":").length - 1] || "";
        const sequenceNumber = parseInt(payloadLast?.slice(17, -18), 16) || 0;
        const reference = parseInt(payloadLast?.slice(27, -10),16) || 0;
        const brightness = parseInt(payloadLast?.slice(33, -4),16) || 0;
        const testRaw = parseInt(payloadLast?.slice(39, -2),16) || 0;
        
        return {
            datetime: new Date(res.created_at).toLocaleString(),
            seq: sequenceNumber,
            sensor_id: res.sensor_id,
            gateway_id: res.gateway_id,
            site: res.site_name,
            reference,
            brightness,
            testRaw,
        };
    })

    const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const p = payload[0].payload;
    let isTesting; 
    if(p.testRaw === 255){
        isTesting = "Testing (True)";
    } else{
        isTesting = "Normal (False)";
    }
    return (
        <div className="bg-white border p-2 text-sm shadow">
            <div className="font-bold">{p.datetime}</div>
            <div>Sensor: {p.sensor_id}</div>
            <div>Gateway: {p.gateway_id}</div>
            <div>Site: {p.site}</div>
            <div>Sequence Number: {p.seq}</div>
            <div>Internal Reference: {p.reference}</div>
            <div>Brightness Value: {p.brightness}</div>
            <div>Test Status: {isTesting}</div>
        </div>
    );
    }

    return(
        <>
            <h1 className="font-bold italic text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center">Kitchen Exhaust Duct (KED) Sensor Data</h1>
            <RefreshBack results={results} handleBack={handleBack} handleRefresh={handleRefresh}/>
            {/* Chart: responsive container that adapts on mobile */}
            <div className="w-full md:w-4/5 h-64 md:h-96 mx-auto px-4 md:px-0 mb-4">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="seq" tick={{ fontSize: 15 }} tickFormatter={(v) => v}/>
                {/* Left axis for sequence numbers */}
                <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 15 }} tickFormatter={(v) => v} />
                <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 15 }}
                    tickFormatter={(v) => v}
                />
                <Tooltip content={CustomTooltip} />
                <Legend />
                <Line type="monotone" dataKey="reference" name="Internal Reference" stroke="#3182CE" yAxisId="left" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="brightness" name="Brightness" stroke="#E53E3E" yAxisId="right" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
            </ResponsiveContainer>
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
                        isTesting = "Testing (True)";
                    } else{
                        isTesting = "Normal (False)";
                    }
                    return (
                        <div key={res.id} className="flex flex-col justify-center border-2 gap-2 p-3 md:p-2 text-center w-full rounded-md text-sm md:text-xl">
                            <p><span className="font-bold">Sensor ID:</span> {res.sensor_id}</p>
                            <p><span className="font-bold">Gateway ID:</span> {res.gateway_id}</p>
                            <p><span className="font-bold">Created At:</span> {new Date(res.created_at).toLocaleString()}</p>
                            <p><span className="font-bold">Updated At:</span> {new Date(res.updated_at).toLocaleString()}</p>
                            <p><span className="font-bold">Site:</span> {res.site_name} (ID: {res.site_id})</p>
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