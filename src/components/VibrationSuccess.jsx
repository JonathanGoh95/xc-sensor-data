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

// WISE-2410 accelerometer metrics, in the order they sit in each axis' data:
// [ext-mask bit, field name, display label]
const METRICS = [
    [0x01, "velocity_rms", "Velocity RMS (mm/s)"],
    [0x02, "peak_acceleration", "Acceleration Peak (g)"],
    [0x04, "acceleration_rms", "Acceleration RMS (g)"],
    [0x08, "kurtosis", "Kurtosis"],
    [0x10, "crest_factor", "Crest Factor"],
    [0x20, "skewness", "Skewness"],
    [0x40, "std_dev", "Standard Deviation"],
    [0x80, "peak_displacement", "Peak-to-Peak Displacement (μm)"],
];
const AXES = [[1, "X"], [2, "Y"], [4, "Z"]];

const s16 = (v) => (v & 0x8000 ? v - 0x10000 : v);
const s32 = (v) => (v >= 0x80000000 ? v - 0x100000000 : v);
const popcount = (v) => v.toString(2).split("1").length - 1;

function scaleMetric(name, raw, rng) {
    if (name === "velocity_rms") return raw / 100;
    if (name === "peak_acceleration" || name === "acceleration_rms") return rng === 4 ? raw / 1000 : raw / 100;
    if (name === "peak_displacement") return raw;
    return s16(raw) / 100;
}

class Overrun extends Error {}

// Decodes a raw WISE-2410 payload: 16 hex sensor id + 8 hex header sequence + the frame.
// Frame byte 0 = header, byte 1 = frame sequence number (0-255), blocks from byte 3.
function decodeWise2410(rawHex) {
    const out = { headerSeq: null, frameSeq: null, fields: {}, error: null };
    if (typeof rawHex !== "string" || rawHex.length < 24) { out.error = "no payload"; return out; }
    out.headerSeq = rawHex.slice(16, 24);
    const body = rawHex.slice(24);
    if (body.length % 2 || !/^[0-9A-Fa-f]*$/.test(body)) { out.error = "invalid hex"; return out; }
    const b = [];
    for (let i = 0; i < body.length; i += 2) b.push(parseInt(body.slice(i, i + 2), 16));
    if (b.length < 4) { out.error = "too short"; return out; }
    out.frameSeq = b[1];

    const f = out.fields;
    const at = (i) => { if (i >= b.length) throw new Overrun(); return b[i]; };
    const u16 = (i) => at(i) + (at(i + 1) << 8);
    const u32 = (i) => at(i) + at(i + 1) * 0x100 + at(i + 2) * 0x10000 + at(i + 3) * 0x1000000;

    let i = 3;
    try {
        while (i < 74 && i < b.length && (b[i] & 0xF0) === 0x50) {
            const start = i, rng = b[i] & 0x0F;
            if (rng <= 3) {                                   // temperature / humidity block
                let length = at(i + 1); const mask = at(i + 2) & 0x1F;
                i += 3; length -= 1;
                if (mask & 0x01) { f.temp_status = at(i); i += 1; length -= 1; }
                if (mask & 0x02) { f.temp_event = u16(i); i += 2; length -= 2; }
                if (mask & 0x04) { const r = u32(i); f.temperature = (rng === 3 ? r : s32(r)) / 1000; i += 4; length -= 4; }
                if (mask & 0x08) { f.temp_max = u32(i) / 100; i += 4; length -= 4; }
                if (mask & 0x10) { f.temp_min = u32(i) / 100; i += 4; length -= 4; }
                if (length > 0) i += length;
            } else if (rng === 4 || rng === 5) {              // accelerometer block
                let length = at(i + 1); const ab = at(i + 2);
                const axisMask = (ab & 0xE0) >> 5, mask = ab & 0x1F, ext = at(i + 3);
                i += 3;
                if (!(mask & 0x01)) {
                    const hasEvent = !!(mask & 0x02);
                    i += 1;
                    for (const [bit, axis] of AXES) {
                        if (!(axisMask & bit)) continue;
                        if (hasEvent) { f[`event_${axis}`] = u16(i); i += 2; }
                        for (const [ebit, name] of METRICS) {
                            if (ext & ebit) { f[`${name}_${axis}`] = scaleMetric(name, u16(i), rng); i += 2; }
                        }
                    }
                    length -= 2 + popcount(axisMask) * (popcount(ext) * 2 + (hasEvent ? 2 : 0));
                    if (length > 0) {
                        const mask2 = at(i); i += 1; length -= 1;
                        if (mask2 & 0x01) { i += 4; length -= 4; }
                        if (mask2 & 0x02) { i += 4; length -= 4; }
                        if (length > 0) i += length;
                    }
                }
            }
            if (i === start || !(i < b.length - 1)) break;
        }
        // Device block (0x6_), after the sensor blocks: mask bit0 = events (1 byte), bit1 = power
        // source (1 byte), bit3 = battery voltage (u16, mV), bit4 = time (u32). Bit 2's width is
        // unknown (never seen set), so the battery reading is skipped if it is.
        if (i < b.length && (b[i] & 0xF0) === 0x60) {
            const mask = at(i + 2);
            let j = i + 3;
            if (mask & 0x01) j += 1;
            if (mask & 0x02) j += 1;
            if ((mask & 0x08) && !(mask & 0x04)) f.battery_volt = u16(j) / 1000;
        }
    } catch (e) {
        if (e instanceof Overrun) out.error = "ran past end of payload"; else throw e;
    }
    return out;
}

// Shared by chartData and the per-item card list below so the decoding only lives in one place.
function parseVibrationReading(res) {
    const decoded = decodeWise2410(res.payload_raw);
    return {
        sensor_id: res.sensor_id,
        gateway_id: res.gateway_id,
        site: res.site_name,
        seq: decoded.frameSeq ?? 0,
        error: decoded.error,
        ...decoded.fields,
    };
}

// Fields the decoder can leave out (masked off in the frame) show as "-" instead of blank.
const show = (v) => v ?? "-";

export default function VibrationSuccess({pageItems,results,handleBack,handleRefresh}){
    const chartData = pageItems
    .map((res) => ({
        ...parseVibrationReading(res),
        time: new Date(res.created_at).toLocaleTimeString(),
        datetime: new Date(res.created_at).toLocaleString(),
    }))

    // One field list per axis, used by both the tooltip and the cards.
    const axisFields = (axis) => [
        { header: `${axis}-Axis` },
        { key: `event_${axis}`, label: "Event", format: show },
        ...METRICS.map(([, name, label]) => ({ key: `${name}_${axis}`, label, format: show })),
    ]

    const TOOLTIP_FIELDS = [
        { key: "datetime", bold: true },
        { key: "sensor_id", label: "Sensor ID" },
        { key: "gateway_id", label: "Gateway ID" },
        { key: "site", label: "Site" },
        { key: "seq", label: "Sequence Number" },
        { key: "battery_volt", label: "Voltage Level", format: (v) => v != null ? `${v}V` : "-" },
        { key: "temperature", label: "Temperature", format: (v) => v != null ? `${v}°C` : "-" },
        ...axisFields("X"),
        ...axisFields("Y"),
        ...axisFields("Z"),
        { key: "error", label: "Decode Error", format: show },
    ]

    return(
        <>
            <h1 className="font-bold italic text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center">Vibration (LoRaWAN) Sensor Data</h1>
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
                <Line type="monotone" dataKey="velocity_rms_X" name="Velocity RMS (X)" stroke="#3182CE" yAxisId="right" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="velocity_rms_Y" name="Velocity RMS (Y)" stroke="#38A169" yAxisId="right" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="velocity_rms_Z" name="Velocity RMS (Z)" stroke="#E53E3E" yAxisId="right" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
            </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full md:w-4/5 justify-items-center px-4 md:px-0 py-0 md:py-4">
                {pageItems.map((res) => {
                    const r = parseVibrationReading(res);
                    const rows = (fields) => fields.map(({ key, label, format, header }) =>
                        header
                            ? <p key={header} className="font-bold mt-1">{header}</p>
                            : <p key={key}><span className="font-bold">{label}:</span> {format(r[key])}</p>
                    );
                    return (
                        <div key={res.id} className="flex flex-col justify-center border-2 gap-2 p-3 md:p-2 text-center w-full rounded-md text-sm md:text-xl">
                            <p><span className="font-bold">Sensor ID:</span> {r.sensor_id}</p>
                            <p><span className="font-bold">Gateway ID:</span> {r.gateway_id}</p>
                            <p><span className="font-bold">Created At:</span> {new Date(res.created_at).toLocaleString()}</p>
                            <p><span className="font-bold">Updated At:</span> {new Date(res.updated_at).toLocaleString()}</p>
                            <p><span className="font-bold">Site:</span> {res.site_name} (ID: {res.site_id})</p>
                            <p><span className="font-bold">Sequence Number:</span> {r.seq}</p>
                            <p><span className="font-bold">Voltage Level:</span> {r.battery_volt != null ? `${r.battery_volt}V` : "-"}</p>
                            <p><span className="font-bold">Temperature:</span> {r.temperature != null ? `${r.temperature}°C` : "-"}</p>
                            {rows(axisFields("X"))}
                            {rows(axisFields("Y"))}
                            {rows(axisFields("Z"))}
                            {r.error && <p className="text-red-600"><span className="font-bold">Decode Error:</span> {r.error}</p>}
                        </div>
                    )
                })}
            </div>
        </>
    )
}
