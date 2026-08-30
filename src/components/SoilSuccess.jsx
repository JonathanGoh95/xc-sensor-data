import RefreshBack from "./RefreshBack";
import ChartTooltip from "./ChartTooltip";
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
        const temp = parseInt(payloadLast?.slice(37, -8), 16) / 10 || 0;
        const moisturePct = parseInt(payloadLast?.slice(41, -4), 16) / 10 || 0;
        const mode = parseInt(payloadLast?.slice(45, -2), 16) || 0;
        let modeStatus;
        if (mode === 0){
            modeStatus = "Normal";
        }else{
            modeStatus = "Calibration";
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

    const TOOLTIP_FIELDS = [
        { key: "datetime", bold: true },
        { key: "sensor_id", label: "Sensor ID" },
        { key: "gateway_id", label: "Gateway ID" },
        { key: "site", label: "Site" },
        { key: "seq", label: "Sequence Number" },
        { key: "dryBase", label: "Dryness Base Value" },
        { key: "rawMoisture", label: "Raw Moisture Value" },
        { key: "ldr", label: "LDR Value" },
        { key: "temp", label: "Temperature", format: (v) => `${v}°C` },
        { key: "moisturePct", label: "Moisture Percentage", format: (v) => `${v}%` },
        { key: "modeStatus", label: "Mode" },
    ]

    return(
        <>
            <h1 className="font-bold italic text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center">Soil Sensor Data</h1>
            <RefreshBack results={results} handleBack={handleBack} handleRefresh={handleRefresh}/>
            {/* Chart: responsive container that adapts on mobile */}
            <div className="w-full md:w-4/5 h-64 md:h-96 mx-auto px-4 md:px-0">
            <ResponsiveContainer width="105%" height="105%">
                <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 15 }} tickMargin={5}/>
                {/* Left axis for sequence numbers */}
                <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 15 }} tickFormatter={(v) => v} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 15 }} tickFormatter={(v) => v} width={60}/>
                <Tooltip wrapperStyle={{ zIndex: 10 }} content={(p) => <ChartTooltip {...p} fields={TOOLTIP_FIELDS} />} />
                <Legend wrapperStyle={{ marginTop: '20px' }} itemSorter={() => 0}/>
                <Line type="monotone" dataKey="seq" name="Sequence Number" stroke="#FFFF00" yAxisId="right" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="moisturePct" name="Moisture Percentage" stroke="#9532A8" yAxisId="right" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="rawMoisture" name="Raw Moisture Value" stroke="#00FF00" yAxisId="left" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="dryBase" name="Dryness Base Value" stroke="#004D4D" yAxisId="left" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="ldr" name="LDR Value" stroke="#3182CE" yAxisId="left" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="temp" name="Temperature" stroke="#E53E3E" yAxisId="right" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
            </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full md:w-4/5 justify-items-center px-4 md:px-0 py-0 md:py-4">
                {pageItems.map((res) => {
                    const sequenceNumber = parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(17, -24),16) || '';
                    const dryBase = parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(25, -20),16)|| 0;
                    const rawMoisture = parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(29, -16),16) || '';
                    const ldr = parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(33, -12), 16) || 0;
                    const temp = parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(37, -8), 16) / 10 || 0;
                    const moisturePct = parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(41, -4), 16) / 10 || 0;
                    const mode = parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(45, -2), 16) || 0;
                    let modeStatus;
                    if (mode === 0){
                        modeStatus = "Normal";
                    }else{
                        modeStatus = "Calibration";
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