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

export default function BinSuccess({pageItems,results,handleBack,handleRefresh}){
    const STATUS_MAP = {
        0: 'Calibrating',
        1: 'Full',
        2: 'Heartbeat',
        3: 'Anomaly',
    };

    const chartData = pageItems
    .map((res) => {
        const payloadLast = res.payload?.split(":")[res.payload.split(":").length - 1] || "";
        const sequenceNumber = parseInt(payloadLast?.slice(17, -18), 16) || 0;
        const isFullRaw = parseInt(payloadLast?.slice(25, -16), 16);
        const alert = parseInt(payloadLast?.slice(27, -12), 16);
        const maxCalib = parseInt(payloadLast?.slice(31, -8), 16) || '';
        const curr = parseInt(payloadLast?.slice(35, -4), 16) || '';
        let statusCode = 3; // default -> Anomaly
        if (isFullRaw === 0) statusCode = 0;
        else if (isFullRaw === 1) statusCode = 1;
        else if (isFullRaw === 255) statusCode = 2;
        
        return {
            datetime: new Date(res.created_at).toLocaleString(),
            time: new Date(res.created_at).toLocaleTimeString(),
            seq: sequenceNumber,
            site: res.site_name,
            statusCode,
            alert,
            maxCalib,
            curr,
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
            <div>Bin Status: {statusLabel}</div>
            <div>Alert Sessions: {p.alert}</div>
            <div>Max Calibration Range: {p.maxCalib}</div>
            <div>Current Range: {p.curr}</div>
        </div>
    );
    }

    return(
        <>
            <h1 className="font-bold italic text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center">Bin Sensor Data</h1>
            <RefreshBack results={results} handleBack={handleBack} handleRefresh={handleRefresh}/>
            {/* Chart: responsive container that adapts on mobile */}
            <div className="w-full md:w-4/5 h-64 md:h-96 mx-auto px-4 md:px-0 mb-4">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 12 }} tickFormatter={(v) => v} />
                <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 3]}
                    tick={{ fontSize: 12 }}
                    ticks={[0,1,2,3]}
                    tickFormatter={(v) => STATUS_MAP[v]}
                    allowDecimals={false}
                />
                <Tooltip content={CustomTooltip} />
                <Legend />
                <Line type="monotone" dataKey="maxCalib" name="Maximum Calibration Range" stroke="#3182CE" yAxisId="left" strokeWidth={2} dot={{ r: 3 }}/>
                <Line type="monotone" dataKey="curr" name="Current Range" stroke="#FFDA03" yAxisId="left" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="stepAfter" dataKey="statusCode" name="Bin Status" stroke="#E53E3E" yAxisId="right" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
            </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full md:w-4/5 justify-items-center px-4 md:px-0">
                {pageItems.map((res) => {
                    const sequenceNumber = parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(17, -18),16) || '';
                    const isFullRaw = parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(25, -16),16);
                    const alertSessions = parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(27, -12),16);
                    const maxCalibVal = parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(31, -8),16) || '';
                    const currRange = parseInt(res.payload?.split(":")[res.payload.split(":").length - 1]?.slice(35, -4),16) || '';
                    let isFull = "Anomaly";
                    if(isFullRaw === 0){
                        isFull = "Calibrating";
                    } else if (isFullRaw === 1){
                        isFull = "Full";
                    } else if (isFullRaw === 255){
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
                            <p><span className="font-bold">Bin Status:</span> {isFull}</p>
                            <p><span className="font-bold">Alert Sessions:</span> {alertSessions}</p>
                            <p><span className="font-bold">Maximum Calibration Value:</span> {maxCalibVal}</p>
                            <p><span className="font-bold">Current Range:</span> {currRange}</p>
                        </div>
                    )
                })}
            </div>
        </>
    )
}