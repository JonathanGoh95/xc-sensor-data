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

export default function LeakSuccess({pageItems,results,handleBack,handleRefresh}){
    const STATUS_MAP = {
        0: 'Normal (No Leaks)',
        1: 'Cable Disconnection',
        2: 'Leak Detected',
        3: 'Cable Disconnection + Leakage',
        4: 'Anomaly',
    };

    const chartData = pageItems
    .map((res) => {
        const payloadLast = res.payload?.split(":")[res.payload.split(":").length - 1] || "";
        const sequenceNumber = parseInt(payloadLast?.slice(17, -14), 16) || 0;
        const statusVal = parseInt(payloadLast?.slice(25, -12), 16);
        const leakPosRaw = parseInt(payloadLast?.slice(27, -8), 16);
        const wireResRaw = parseInt(payloadLast?.slice(31, -4), 16);
        const leakPos = leakPosRaw / 10.0;
        const wireRes = wireResRaw / 13.3;
        let statusCode = 4; // default -> Anomaly
        if (statusVal === 0) statusCode = 0;
        else if (statusVal === 1) statusCode = 1;
        else if (statusVal === 2) statusCode = 2;
        else if (statusVal === 3) statusCode = 3;
        
        return {
            datetime: new Date(res.created_at).toLocaleString(),
            time: new Date(res.created_at).toLocaleTimeString(),
            seq: sequenceNumber,
            site: res.site_name,
            statusCode,
            leakPos,
            wireRes,
            sensor_id: res.sensor_id,
            gateway_id: res.gateway_id,
        };
    })

    const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const p = payload[0].payload;
    const statusLabel = STATUS_MAP[p.statusCode] ?? 'Unknown';
    return (
        <div className="bg-white border p-2 text-sm shadow">
            <div className="font-bold">{p.datetime}</div>
            <div>Sensor: {p.sensor_id}</div>
            <div>Gateway: {p.gateway_id}</div>
            <div>Site: {p.site}</div>
            <div>Sequence Number: {p.seq}</div>
            <div>Wire Length: {p.statusCode === 1 || p.statusCode === 3 ? "Disconnected" : p.wireRes + " m (13.3 Ω/m)"}</div>
            <div>Leak Status: {statusLabel}</div>
            <div>Leak Location: {p.statusCode === 1 ? "Disconnected" : p.leakPos > 0 ? p.leakPos + " m" : "No Leaks"}</div>
            <div>Wire Status: {p.statusCode === 1 || p.statusCode === 3 ? "Disconnected" : "Normal"}</div>
        </div>
    );
    }

    return(
        <>
            <h1 className="font-bold italic text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center">Leak Sensor Data</h1>
            <RefreshBack results={results} handleBack={handleBack} handleRefresh={handleRefresh}/>
            {/* Chart: responsive container that adapts on mobile */}
            <div className="w-full md:w-4/5 h-64 md:h-96 mx-auto px-4 md:px-0 mb-4">
            <ResponsiveContainer width="110%" height="110%">
                <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 15 }} />
                <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 15 }} tickFormatter={(v) => v} />
                <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 3]}
                    tick={{ fontSize: 15 }}
                    ticks={[0,1,2,3]}
                    tickFormatter={(v) => STATUS_MAP[v]}
                    allowDecimals={false}
                    width={225}
                />
                <Tooltip content={CustomTooltip} />
                <Legend wrapperStyle={{ marginTop: '20px' }} />
                <Line type="monotone" dataKey="seq" name="Sequence Number" stroke="#FFFF00" yAxisId="left" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="wireLength" name="Wire Length" stroke="#FFA500" yAxisId="left" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="stepAfter" dataKey="statusCode" name="Leak Status" stroke="#EE4035" yAxisId="right" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
            </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full md:w-4/5 justify-items-center px-4 md:px-0 py-0 md:py-4">
                {pageItems.map((res) => {
                    const sequenceNumber = parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(17, -14),16) || '';
                    const statusVal = parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(25, -12),16);
                    const leakPosRaw = parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(27, -8),16);
                    const wireResRaw = parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(31, -4),16);
                    const leakPos = leakPosRaw / 10.0;
                    const wireRes = wireResRaw / 13.3;
                    let statusMsg = "Anomaly";
                    if(statusVal === 0){
                        statusMsg = "Normal (No Leaks)";
                    } else if (statusVal === 1){
                        statusMsg = "Cable Disconnection";
                    } else if (statusVal === 2){
                        statusMsg = "Leak Detected";
                    } else if (statusVal === 3){
                        statusMsg = "Cable Disconnection + Leakage";
                    }

                    return (
                        <div key={res.id} className="flex flex-col justify-center border-2 gap-2 p-3 md:p-2 text-center w-full rounded-md text-sm md:text-xl">
                            <p><span className="font-bold">Sensor ID:</span> {res.sensor_id}</p>
                            <p><span className="font-bold">Gateway ID:</span> {res.gateway_id}</p>
                            <p><span className="font-bold">Created At:</span> {new Date(res.created_at).toLocaleString()}</p>
                            <p><span className="font-bold">Updated At:</span> {new Date(res.updated_at).toLocaleString()}</p>
                            <p><span className="font-bold">Site:</span> {res.site_name} (ID: {res.site_id})</p>
                            <p><span className="font-bold">Sequence Number:</span> {sequenceNumber}</p>
                            <p><span className="font-bold">Wire Length:</span> {statusVal === 1 || statusVal === 3 ? "Disconnected" : wireRes + " m (13.3 Ω/m)"}</p>
                            <p><span className="font-bold">Leak Status:</span> {statusMsg}</p>
                            <p><span className="font-bold">Leak Location:</span> {statusVal === 1 ? "Disconnected" : leakPos > 0 ? leakPos + " m" : "No Leaks"}</p>
                            <p><span className="font-bold">Wire Status:</span> {statusVal === 1 || statusVal === 3 ? "Disconnected" : "Normal"}</p>
                        </div>
                    )
                })}
            </div>
        </>
    )
}