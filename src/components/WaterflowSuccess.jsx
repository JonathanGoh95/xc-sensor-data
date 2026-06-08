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

export default function WaterflowSuccess({pageItems,results,handleBack,handleRefresh}){
    const STATUS_MAP = {
        0: 'Normal',
        1: 'Calibration',
        2: 'Anomaly',
    };
    
    const chartData = pageItems
    .map((res) => {
        const payloadLast = res.payload?.split(":")[res.payload.split(":").length - 1] || "";
        const sequenceNumber = parseInt(payloadLast?.slice(17, -16), 16) || 0;
        const calibModeRaw = parseInt(payloadLast?.slice(25, -14), 16) || 0;
        const calibCoef = parseFloat(parseInt(payloadLast?.slice(27, -12), 16) / 100) || 0;
        const numLitres = parseFloat(parseInt(payloadLast?.slice(29, -4), 16) / 100) || 0;
        let calibMode = 2; // Default: Anomaly
        if (calibModeRaw === 255) calibMode = 1;
        else if (calibModeRaw === 0) calibMode = 0;

        return {
            time: new Date(res.created_at).toLocaleTimeString(),
            datetime: new Date(res.created_at).toLocaleString(),
            seq: sequenceNumber,
            site: res.site_name,
            calibMode,
            calibCoef,
            numLitres,
            sensor_id: res.sensor_id,
            gateway_id: res.gateway_id,
        };
    })

    const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const p = payload[0].payload;
    const calibLabel = STATUS_MAP[p.calibMode] ?? 'Unknown';
    return (
        <div className="bg-white border p-2 text-sm shadow">
            <div className="font-bold">{p.datetime}</div>
            <div>Sensor: {p.sensor_id}</div>
            <div>Gateway: {p.gateway_id}</div>
            <div>Site: {p.site}</div>
            <div>Sequence Number: {p.seq}</div>
            <div>Calibration Mode: {calibLabel}</div>
            <div>Calibration Coefficient: {p.calibCoef}</div>
            <div>Number of Litres: {p.numLitres}</div>
        </div>
    );
    }

    return(
        <>
            <h1 className="font-bold italic text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center">Waterflow Sensor Data</h1>
            <RefreshBack results={results} handleBack={handleBack} handleRefresh={handleRefresh}/>
            {/* Chart: responsive container that adapts on mobile */}
            <div className="w-full md:w-4/5 h-64 md:h-96 mx-auto px-4 md:px-0 mb-4">
            <ResponsiveContainer width="105%" height="105%">
                <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 15 }} tickMargin={5}/>
                {/* Left axis for sequence numbers */}
                <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 15 }} tickFormatter={(v) => v} />
                <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 2]}
                    tick={{ fontSize: 15 }}
                    ticks={[0,1,2]}
                    tickFormatter={(v) => STATUS_MAP[v]}
                    allowDecimals={false}
                    width={80}
                />
                <Tooltip content={CustomTooltip} />
                <Legend wrapperStyle={{ marginTop: '20px' }} />
                <Line type="monotone" dataKey="seq" name="Sequence Number" stroke="#FFFF00" yAxisId="left" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="stepAfter" dataKey="calibMode" name="Calibration Mode" stroke="#FF0000" yAxisId="right" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="calibCoef" name="Calibration Coefficient" stroke="#FFA500" yAxisId="left" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="numLitres" name="Number of Litres" stroke="#8FCE00" yAxisId="left" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
            </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full md:w-4/5 justify-items-center px-4 md:px-0">
                {pageItems.map((res) => {
                    const payloadLast = res.payload?.split(":")[res.payload.split(":").length - 1] || "";
                    const sequenceNumber = parseInt(payloadLast?.slice(17, -16),16) || '';
                    const calibMode = parseInt(payloadLast?.slice(25, -14), 16) || 0;
                    const calibCoef = parseFloat(parseInt(payloadLast?.slice(27, -12), 16) / 100) || 0;
                    const numLitres = parseFloat(parseInt(payloadLast?.slice(29, -4), 16) / 100) || 0;
                    
                    return (
                        <div key={res.id} className="flex flex-col justify-center border-2 gap-2 p-3 md:p-2 text-center w-full rounded-md text-sm md:text-xl">
                            <p><span className="font-bold">Sensor ID:</span> {res.sensor_id}</p>
                            <p><span className="font-bold">Gateway ID:</span> {res.gateway_id}</p>
                            <p><span className="font-bold">Created At:</span> {new Date(res.created_at).toLocaleString()}</p>
                            <p><span className="font-bold">Updated At:</span> {new Date(res.updated_at).toLocaleString()}</p>
                            <p><span className="font-bold">Site:</span> {res.site_name} (ID: {res.site_id})</p>
                            <p><span className="font-bold">Sequence Number:</span> {sequenceNumber}</p>
                            <p><span className="font-bold">Calibration Mode:</span> {calibMode}</p>
                            <p><span className="font-bold">Calibration Coefficient:</span> {calibCoef}</p>
                            <p><span className="font-bold">Number of Litres:</span> {numLitres}</p>
                        </div>
                    )
                })}
            </div>
        </>
    )
}