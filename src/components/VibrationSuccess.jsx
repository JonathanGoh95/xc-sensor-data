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
} from "recharts"

// Pulls every reading this sensor sends out of the raw LoRaWAN payload, one axis at a time.
// Shared by chartData and the per-item card list below so the field list (and the fix for
// the X-Axis reading, which previously read RMSmg/Skewness off "Y-Axis" instead of "X-Axis")
// only has to live in one place.
function parseVibrationReading(res) {
    const payload = res.payload?.uplink_message?.decoded_payload?.payload;
    const accel = payload?.Accelerometer;

    const readAxis = (axis) => {
        const a = accel?.[`${axis}-Axis`];
        return {
            [`crestFactor${axis}`]: a?.CrestFactor || 0,
            [`standardDeviation${axis}`]: a?.Deviation || 0,
            [`kurtosis${axis}`]: a?.Kurtosis || 0,
            [`velocityRMS${axis}`]: a?.OAVelocity || 0,
            [`displacement${axis}`]: a?.["Peak-to-Peak Displacement"] || 0,
            [`accelerationPeak${axis}`]: a?.Peakmg || 0,
            [`accelerationRMS${axis}`]: a?.RMSmg || 0,
            [`skewness${axis}`]: a?.Skewness || 0,
        };
    };

    return {
        devEUI: res.payload?.end_device_ids?.dev_eui,
        devAddr: res.payload?.end_device_ids?.dev_addr,
        gateway_eui: res.payload?.uplink_message?.rx_metadata?.[0]?.gateway_ids?.eui,
        seq: payload?.SequenceNumber || 0,
        volts: payload?.Device?.BatteryVolt / 1000 || 0,
        temp: payload?.TempHumi?.SenVal || 0,
        ...readAxis("X"),
        ...readAxis("Y"),
        ...readAxis("Z"),
    };
}

export default function VibrationSuccess({pageItems,results,handleBack,handleRefresh}){
    const chartData = pageItems
    .map((res) => ({
        ...parseVibrationReading(res),
        time: new Date(res.created_at).toLocaleTimeString(),
        datetime: new Date(res.created_at).toLocaleString(),
    }))

    // One field list per axis instead of three near-identical copies - this is exactly the
    // kind of duplication ChartTooltip's generic renderer is meant to let us collapse.
    const axisFields = (axis) => [
        { header: `${axis}-Axis` },
        { key: `velocityRMS${axis}`, label: "Velocity RMS (mm/s)" },
        { key: `accelerationPeak${axis}`, label: "Acceleration Peak (g)" },
        { key: `accelerationRMS${axis}`, label: "Acceleration RMS (g)" },
        { key: `kurtosis${axis}`, label: "Kurtosis" },
        { key: `crestFactor${axis}`, label: "Crest Factor" },
        { key: `skewness${axis}`, label: "Skewness" },
        { key: `standardDeviation${axis}`, label: "Standard Deviation" },
        { key: `displacement${axis}`, label: "Peak-to-Peak Displacement (μm)" },
    ]

    const TOOLTIP_FIELDS = [
        { key: "datetime", bold: true },
        { key: "devEUI", label: "Device EUI" },
        { key: "devAddr", label: "Device Address" },
        { key: "gateway_eui", label: "Gateway EUI" },
        { key: "seq", label: "Sequence Number" },
        { key: "volts", label: "Voltage Level", format: (v) => `${v}V` },
        { key: "temp", label: "Temperature", format: (v) => `${v}°C` },
        ...axisFields("X"),
        ...axisFields("Y"),
        ...axisFields("Z"),
    ]

    return(
        <>
            <h1 className="font-bold italic text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center">WISE-2410 Vibration (LoRaWAN) Sensor Data</h1>
            <RefreshBack results={results} handleBack={handleBack} handleRefresh={handleRefresh}/>
            {/* Chart: responsive container that adapts on mobile */}
            <div className="w-full md:w-4/5 h-64 md:h-96 mx-auto px-4 md:px-0">
            <ResponsiveContainer width="105%" height="105%">
                <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 15 }} tickMargin={5}/>
                {/* Left axis for sequence numbers */}
                <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 15 }} tickFormatter={(v) => v} />
                {/* Right axis for velocity RMS (mm/s) - the standard machinery vibration severity metric, shared across all three axes */}
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 15 }} tickFormatter={(v) => v} width={70} />
                <Tooltip wrapperStyle={{ zIndex: 10 }} content={(p) => <ChartTooltip {...p} fields={TOOLTIP_FIELDS} />} />
                <Legend wrapperStyle={{ marginTop: '20px' }} itemSorter={() => 0}/>
                <Line type="monotone" dataKey="seq" name="Sequence Number" stroke="#FFFF00" yAxisId="left" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="velocityRMSX" name="Velocity RMS (X)" stroke="#3182CE" yAxisId="right" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="velocityRMSY" name="Velocity RMS (Y)" stroke="#38A169" yAxisId="right" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="velocityRMSZ" name="Velocity RMS (Z)" stroke="#E53E3E" yAxisId="right" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
            </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full md:w-4/5 justify-items-center px-4 md:px-0 py-0 md:py-4">
                {pageItems.map((res) => {
                    const r = parseVibrationReading(res);
                    const axisRows = (axis) => (
                        <>
                            <p className="font-bold mt-1">{axis}-Axis</p>
                            <p><span className="font-bold">Velocity RMS (mm/s):</span> {r[`velocityRMS${axis}`]}</p>
                            <p><span className="font-bold">Acceleration Peak (g):</span> {r[`accelerationPeak${axis}`]}</p>
                            <p><span className="font-bold">Acceleration RMS (g):</span> {r[`accelerationRMS${axis}`]}</p>
                            <p><span className="font-bold">Kurtosis:</span> {r[`kurtosis${axis}`]}</p>
                            <p><span className="font-bold">Crest Factor:</span> {r[`crestFactor${axis}`]}</p>
                            <p><span className="font-bold">Skewness:</span> {r[`skewness${axis}`]}</p>
                            <p><span className="font-bold">Standard Deviation:</span> {r[`standardDeviation${axis}`]}</p>
                            <p><span className="font-bold">Peak-to-Peak Displacement (μm):</span> {r[`displacement${axis}`]}</p>
                        </>
                    );
                    return (
                        <div key={res.id} className="flex flex-col justify-center border-2 gap-2 p-3 md:p-2 text-center w-full rounded-md text-sm md:text-xl">
                            <p><span className="font-bold">Device EUI:</span> {r.devEUI}</p>
                            <p><span className="font-bold">Device Address:</span> {r.devAddr}</p>
                            <p><span className="font-bold">Gateway EUI:</span> {r.gateway_eui}</p>
                            <p><span className="font-bold">Created At:</span> {new Date(res.created_at).toLocaleString()}</p>
                            <p><span className="font-bold">Sequence Number:</span> {r.seq}</p>
                            <p><span className="font-bold">Voltage Level:</span> {r.volts}V</p>
                            <p><span className="font-bold">Temperature:</span> {r.temp}°C</p>
                            {axisRows("X")}
                            {axisRows("Y")}
                            {axisRows("Z")}
                        </div>
                    )
                })}
            </div>
        </>
    )
}