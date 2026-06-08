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

export default function IAQSuccess({pageItems,results,handleBack,handleRefresh}){
    const chartData = pageItems
    .map((res) => {
        const payloadLast = res.payload?.split(":")[res.payload.split(":").length - 1] || "";
        const sequenceNumber = parseInt(payloadLast?.slice(17, -34), 16) || 0;
        const etoh = parseInt(payloadLast?.slice(25, -30), 16) / 100 || 0;
        const tvoc = parseInt(payloadLast?.slice(29, -28), 16) / 50 || 0;
        const eco2 = parseInt(payloadLast?.slice(31, -24), 16) || 0;
        const iaq = parseInt(payloadLast?.slice(35, -22), 16) / 10 || 0;
        const co2 = parseInt(payloadLast?.slice(37, -18), 16) || 0;
        const temp = parseInt(payloadLast?.slice(41, -14), 16) / 10 || 0;
        const humidity = parseInt(payloadLast?.slice(45, -12), 16);
        const lux = parseInt(payloadLast?.slice(47, -8), 16);
        const pm25 = parseInt(payloadLast?.slice(51, -4), 16);
        
        return {
            datetime: new Date(res.created_at).toLocaleString(),
            time: new Date(res.created_at).toLocaleTimeString(),
            seq: sequenceNumber,
            site: res.site_name,
            etoh,
            tvoc,
            eco2,
            iaq,
            co2,
            temp,
            humidity,
            lux,
            pm25,
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
            <div>Ethanol: {p.etoh} ppm</div>
            <div>Total VOC: {p.tvoc} ppm</div>
            <div>Equivalent CO2: {p.eco2} ppm</div>
            <div>Indoor Air Quality: {p.iaq}</div>
            <div>CO2: {p.co2} ppm</div>
            <div>Temperature: {p.temp} °C</div>
            <div>Humidity: {p.humidity} %</div>
            <div>Ambient Light: {p.lux} klux</div>
            <div>PM2.5: {p.pm25} µg/m³</div>
        </div>
    );
    }

    return(
        <>
            <h1 className="font-bold italic text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center">Indoor Air Quality (IAQ) Sensor Data</h1>
            <RefreshBack results={results} handleBack={handleBack} handleRefresh={handleRefresh}/>
            {/* Chart: responsive container that adapts on mobile */}
            <div className="w-full md:w-4/5 h-64 md:h-96 mx-auto px-4 md:px-0">
            <ResponsiveContainer width="105%" height="105%">
                <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 15 }} tickMargin={5}/>
                <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 15 }} tickFormatter={(v) => v}/>
                <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 3]}
                    tick={{ fontSize: 15 }}
                    tickFormatter={(v) => v}
                    allowDecimals={false}
                    width={80}
                />
                <Tooltip content={CustomTooltip} />
                <Legend wrapperStyle={{ marginTop: '20px' }} />
                <Line type="monotone" dataKey="seq" name="Sequence Number" stroke="#FFFF00" yAxisId="right" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="etoh" name="Ethanol" stroke="#1E90FF" yAxisId="left" strokeWidth={2} dot={{ r: 3 }}/>
                <Line type="monotone" dataKey="tvoc" name="Total VOC" stroke="#FF6347" yAxisId="left" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="eco2" name="Equivalent CO2" stroke="#228B22" yAxisId="left" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="iaq" name="Indoor Air Quality" stroke="#DC143C" yAxisId="left" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="co2" name="CO2" stroke="#FF1493" yAxisId="left" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="temp" name="Temperature" stroke="#008B8B" yAxisId="left" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="humidity" name="Humidity" stroke="#9932CC" yAxisId="left" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="lux" name="Ambient Light" stroke="#8B5A00" yAxisId="left" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="pm25" name="PM2.5" stroke="#004D4D" yAxisId="left" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
            </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full md:w-4/5 justify-items-center px-4 md:px-0 py-0 md:py-4">
                {pageItems.map((res) => {
                    const payloadLast = res.payload?.split(":")[res.payload.split(":").length - 1] || "";
                    const sequenceNumber = parseInt(payloadLast?.slice(17, -34), 16) || 0;
                    const etoh = parseInt(payloadLast?.slice(25, -30), 16) / 100 || 0;
                    const tvoc = parseInt(payloadLast?.slice(29, -28), 16) / 50 || 0;
                    const eco2 = parseInt(payloadLast?.slice(31, -24), 16) || 0;
                    const iaq = parseInt(payloadLast?.slice(35, -22), 16) / 10 || 0;
                    const co2 = parseInt(payloadLast?.slice(37, -18), 16) || 0;
                    const temp = parseInt(payloadLast?.slice(41, -14), 16) / 10 || 0;
                    const humidity = parseInt(payloadLast?.slice(45, -12), 16);
                    const lux = parseInt(payloadLast?.slice(47, -8), 16);
                    const pm25 = parseInt(payloadLast?.slice(51, -4), 16);

                    return (
                        <div key={res.id} className="flex flex-col justify-center border-2 gap-2 p-3 md:p-2 text-center w-full rounded-md text-sm md:text-xl">
                            <p><span className="font-bold">Sensor ID:</span> {res.sensor_id}</p>
                            <p><span className="font-bold">Gateway ID:</span> {res.gateway_id}</p>
                            <p><span className="font-bold">Created At:</span> {new Date(res.created_at).toLocaleString()}</p>
                            <p><span className="font-bold">Updated At:</span> {new Date(res.updated_at).toLocaleString()}</p>
                            <p><span className="font-bold">Site:</span> {res.site_name} (ID: {res.site_id})</p>
                            <p><span className="font-bold">Sequence Number:</span> {sequenceNumber}</p>
                            <p><span className="font-bold">Ethanol:</span> {etoh} ppm</p>
                            <p><span className="font-bold">Total VOC:</span> {tvoc} ppm</p>
                            <p><span className="font-bold">Equivalent CO2:</span> {eco2} ppm</p>
                            <p><span className="font-bold">Indoor Air Quality:</span> {iaq}</p>
                            <p><span className="font-bold">CO2:</span> {co2} ppm</p>
                            <p><span className="font-bold">Temperature:</span> {temp} °C</p>
                            <p><span className="font-bold">Humidity:</span> {humidity} %</p>
                            <p><span className="font-bold">Ambient Light:</span> {lux} klux</p>
                            <p><span className="font-bold">PM2.5:</span> {pm25} µg/m³</p>
                        </div>
                    )
                })}
            </div>
        </>
    )
}