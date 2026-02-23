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

export default function FloatSuccess({pageItems,results,handleBack,handleRefresh}){
    // Order ticks 0..2 so they display as: Heartbeat, Full, Anomaly
    const STATUS_MAP = {
        0: 'Anomaly',
        1: 'Heartbeat',
        2: 'Full',
    };

    const chartData = pageItems
    .map((res) => {
        const payloadLast = res.payload?.split(":")[res.payload.split(":").length - 1] || "";
    const sequenceNumber = parseInt(payloadLast?.slice(17, -10), 16) || 0;
    const voltage = parseInt(payloadLast?.slice(25, -6), 16);
    const statusRaw = parseInt(payloadLast?.slice(29, -4), 16);
    let statusCode = 0; // default -> Anomaly
    if (statusRaw === 255) statusCode = 1; // Full
    else if (statusRaw === 0) statusCode = 2; // Heartbeat
        
        return {
            datetime: new Date(res.created_at).toLocaleString(),
            time: new Date(res.created_at).toLocaleTimeString(),
            seq: sequenceNumber,
            site: res.site_name,
            voltage,
            statusCode,
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
            <div>Voltage: {p.voltage}</div>
            <div>Status: {statusLabel}</div>
        </div>
    );
    }

    return(
        <>
            <h1 className="font-bold italic text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center">Float Switch Sensor Data</h1>
            <RefreshBack results={results} handleBack={handleBack} handleRefresh={handleRefresh}/>
            {/* Chart: responsive container that adapts on mobile */}
            <div className="w-full md:w-4/5 h-64 md:h-96 mx-auto px-4 md:px-0 mb-4">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 15 }} />
                <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 15 }} tickFormatter={(v) => v} />
                <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 2]}
                    tick={{ fontSize: 12 }}
                    ticks={[0,1,2]}
                    tickFormatter={(v) => STATUS_MAP[v]}
                    allowDecimals={false}
                />
                <Tooltip content={CustomTooltip} />
                <Legend />
                <Line type="monotone" dataKey="seq" name="Sequence Number" stroke="#FFFF00" yAxisId="left" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="voltage" name="Voltage" stroke="#38761D" yAxisId="left" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="stepAfter" dataKey="statusCode" name="Status" stroke="#EE4035" yAxisId="right" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
            </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full md:w-4/5 justify-items-center px-4 md:px-0">
                {pageItems.map((res) => {
                    const sequenceNumber = parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(17, -10),16) || '';
                    const voltage = parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(25, -6),16);
                    const statusRaw = parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(29, -4),16);
                    let isFull = "Anomaly";
                    if(statusRaw === 0){
                        isFull = "Full";
                    } else if (statusRaw === 255){
                        isFull = "Heartbeat";
                    }

                    return (
                        <div key={res.id} className="flex flex-col justify-center border-2 gap-2 p-3 md:p-2 text-center w-full rounded-md text-sm md:text-xl">
                            <p><span className="font-bold">Sensor ID:</span> {res.sensor_id}</p>
                            <p><span className="font-bold">Gateway ID:</span> {res.gateway_id}</p>
                            <p><span className="font-bold">Created At:</span> {new Date(res.created_at).toLocaleString()}</p>
                            <p><span className="font-bold">Updated At:</span> {new Date(res.updated_at).toLocaleString()}</p>
                            <p><span className="font-bold">Site:</span> {res.site_name} (ID: {res.site_id})</p>
                            <p><span className="font-bold">Sequence Number:</span> {sequenceNumber}</p>
                            <p><span className="font-bold">Voltage:</span> {voltage} V</p>
                            <p><span className="font-bold">Status:</span> {isFull}</p>
                        </div>
                    )
                })}
            </div>
        </>
    )
}