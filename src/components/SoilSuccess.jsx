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

export default function SoilSuccess({pageItems,results,handleBack,handleRefresh}){
    const chartData = pageItems
    .map((res) => {
        const payloadLast = res.payload?.split(":")[res.payload.split(":").length - 1] || "";
        const sequenceNumber = parseInt(payloadLast?.slice(17, -24), 16) || 0;
        const dryBase = parseInt(payloadLast?.slice(25, -20), 16) || 0;
        const rawMoisture = parseInt(payloadLast?.slice(29, -16), 16) || 0;
        const ldr = parseInt(payloadLast?.slice(33, -12), 16) || 0;
        const temp = parseFloat(parseInt(payloadLast?.slice(37, -8), 16) / 10) || 0;
        const moisturePct = parseFloat(parseInt(payloadLast?.slice(41, -4), 16) / 10) || 0;
        const mode = parseInt(payloadLast?.slice(45, -2), 16) || 0;
        let modeStatus;
        if (mode === 0){
            modeStatus = "Normal";
        }else{
            modeStatus = "Testing";
        }
        return {
            time: new Date(res.created_at).toLocaleTimeString(),
            datetime: new Date(res.created_at).toLocaleString(),
            seq: sequenceNumber,
            site: res.site_name,
            dryBase,
            rawMoisture,
            ldr,
            temp,
            moisturePct,
            modeStatus,
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
            <div>Dryness Base Value: {p.dryBase}</div>
            <div>Raw Moisture Value: {p.rawMoisture}</div>
            <div>LDR Value: {p.ldr}</div>
            <div>Temperature: {p.temp}°C</div>
            <div>Moisture Percentage: {p.moisturePct}%</div>
            <div>Mode: {p.modeStatus}</div>
        </div>
    );
    }

    return(
        <>
            <h1 className="font-bold italic text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center">Soil Sensor Data</h1>
            <RefreshBack results={results} handleBack={handleBack} handleRefresh={handleRefresh}/>
            {/* Chart: responsive container that adapts on mobile */}
            <div className="w-full md:w-4/5 h-64 md:h-96 mx-auto px-4 md:px-0 mb-4">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 15 }} />
                {/* Left axis for sequence numbers */}
                <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 15 }} tickFormatter={(v) => v} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 15 }} tickFormatter={(v) => v} />
                <Tooltip content={CustomTooltip} />
                <Legend />
                <Line type="monotone" dataKey="dryBase" name="Dryness Base Value" stroke="#FF7518 " yAxisId="left" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="rawMoisture" name="Raw Moisture Value" stroke="#00FF00" yAxisId="left" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="ldr" name="LDR Value" stroke="#3182CE" yAxisId="left" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="moisturePct" name="Moisture Percentage" stroke="#f4f400" yAxisId="right" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="temp" name="Temperature" stroke="#E53E3E" yAxisId="right" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="seq" name="Sequence Number" stroke="#9532A8" yAxisId="right" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
            </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full md:w-4/5 justify-items-center px-4 md:px-0">
                {pageItems.map((res) => {
                    const sequenceNumber = parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(17, -24),16) || '';
                    const dryBase = parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(25, -20),16)|| 0;
                    const rawMoisture = parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(29, -16),16) || '';
                    const ldr = parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(33, -12), 16) || 0;
                    const temp = parseFloat(parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(37, -8), 16) / 10) || 0;
                    const moisturePct = parseFloat(parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(41, -4), 16) / 10) || 0;
                    const mode = parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(45, -2), 16) || 0;
                    let modeStatus;
                    if (mode === 0){
                        modeStatus = "Normal";
                    }else{
                        modeStatus = "Testing";
                    }

                    return (
                        <div key={res.id} className="flex flex-col justify-center border-2 gap-2 p-3 md:p-2 text-center w-full rounded-md text-sm md:text-xl">
                            <p><span className="font-bold">Sensor ID:</span> {res.sensor_id}</p>
                            <p><span className="font-bold">Gateway ID:</span> {res.gateway_id}</p>
                            <p><span className="font-bold">Created At:</span> {new Date(res.created_at).toLocaleString()}</p>
                            <p><span className="font-bold">Updated At:</span> {new Date(res.updated_at).toLocaleString()}</p>
                            <p><span className="font-bold">Site:</span> {res.site_name} (ID: {res.site_id})</p>
                            <p><span className="font-bold">Sequence Number:</span> {sequenceNumber}</p>
                            <p><span className="font-bold">Dryness Base Value:</span> {dryBase}</p>
                            <p><span className="font-bold">Raw Moisture Value:</span> {rawMoisture}</p>
                            <p><span className="font-bold">LDR Value:</span> {ldr}</p>
                            <p><span className="font-bold">Temperature:</span> {temp}°C</p>
                            <p><span className="font-bold">Moisture Percentage:</span> {moisturePct}%</p>
                            <p><span className="font-bold">Mode:</span> {modeStatus}</p>
                        </div>
                    )
                })}
            </div>
        </>
    )
}