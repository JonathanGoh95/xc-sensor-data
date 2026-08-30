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

// Legend display order, independent of the <Line> draw order (which controls z-stacking instead).
const LEGEND_ORDER = ['Sequence Number', 'Rating', 'Fault Status'];

export default function TouchSuccess({pageItems,results,handleBack,handleRefresh}){
    const RATING_MAP = {
        0: 'Heartbeat',
        1: '1',
        2: '2',
        3: '3',
        4: '4',
        5: '5',
        6: 'Anomaly'
    };

    const chartData = pageItems
    .map((res) => {
        const payloadLast = res.payload?.split(":")[res.payload.split(":").length - 1] || "";
        const sequenceNumber = parseInt(payloadLast?.slice(17, -8), 16) || 0;
        const ratingRaw = parseInt(payloadLast?.slice(25, -6),16) || 0;
        const faultRaw = parseInt(payloadLast?.slice(27, -6),16) || 0;
        const modeRaw = parseFloat(parseInt(payloadLast?.slice(29, -2),16)) || 0;
        
        let rating = 6;
        let faults = '';
        let mode = '';

        switch(ratingRaw){
            case 0:
            case 128:
                rating = 0;
                break;
            case 144:
                rating = 1;
                break;
            case 160:
                rating = 2;
                break;
            case 176:
                rating = 3;
                break;
            case 192:
                rating = 4;
                break;
            case 208:
                rating = 5;
                break;
            default:
                rating = 6;
                break;
        }

        faults = (faultRaw === 0) ? 'No Faults Detected' : 'Fault Detected';

        mode = (modeRaw === 0) ? 'Operational' : (modeRaw === 255) ? 'Testing' : 'Abnormal';

        return {
            time: new Date(res.created_at).toLocaleTimeString(),
            datetime: new Date(res.created_at).toLocaleString(),
            seq: sequenceNumber,
            sensor_id: res.sensor_id,
            gateway_id: res.gateway_id,
            site: res.site_name,
            rating,
            faults,
            mode,
        };
    })

    const TOOLTIP_FIELDS = [
        { key: "datetime", bold: true },
        { key: "sensor_id", label: "Sensor ID" },
        { key: "gateway_id", label: "Gateway ID" },
        { key: "site", label: "Site" },
        { key: "seq", label: "Sequence Number" },
        { key: "rating", label: "Rating", format: (v) => RATING_MAP[v] ?? "Unknown" },
        { key: "faults", label: "Fault Status" },
        { key: "mode", label: "Mode" },
    ]

    const RenderCustomDot = (props) => {
    const { cx, cy, payload } = props;
    
    // Choose color dynamically based on your chartData string
    const dotColor = payload.faults === 'Fault Detected' ? '#f44336' : '#4caf50';
    const radius = payload.faults === 'Fault Detected' ? 6 : 4; // Make fault dots larger

    return (
            <circle 
                cx={cx} 
                cy={cy} 
                r={radius} 
                fill={dotColor} 
                stroke="#fff" 
                strokeWidth={2} 
            />
        );
    };

    const RenderModeDot = (props) => {
    const { cx, cy, payload } = props;
    
    // Define unique styling configurations for each mode status
    let dotColor = '#9e9e9e'; // Default grey
    let strokeColor = '#ffffff';
    let radius = 4;
    // let isDash = '0';

    switch (payload.mode) {
        case 'Operational':
            dotColor = '#4caf50'; // Green for normal running
            radius = 4;
            break;
        case 'Testing':
            dotColor = '#ff9800'; // Orange for diagnostic testing
            radius = 5;
            break;
        case 'Abnormal':
            dotColor = '#f44336'; // Red for anomalies
            radius = 7;           // Larger visual priority anchor
            strokeColor = '#000000'; // Black border to draw attention
            break;
    }

    return (
        <circle 
            cx={cx} 
            cy={cy} 
            r={radius} 
            fill={dotColor} 
            stroke={strokeColor} 
            strokeWidth={2} 
        />
    );
};

    
    return(
        <>
            <h1 className="font-bold italic text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center">Toilet Panel (Touchscreen) Data</h1>
            <RefreshBack results={results} handleBack={handleBack} handleRefresh={handleRefresh}/>
            {/* Chart: responsive container that adapts on mobile */}
            <div className="w-full md:w-4/5 h-64 md:h-96 mx-auto px-4 md:px-0">
            <ResponsiveContainer width="105%" height="105%">
                <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 15 }} tickMargin={5}/>
                {/* Left axis for sequence numbers */}
                <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 15 }} tickFormatter={(v) => v}/>
                <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 15 }}
                    ticks={[0,1,2,3,4,5,6]}
                    tickFormatter={(v) => RATING_MAP[v]}
                    width={80}
                    interval={0}
                />
                <Tooltip wrapperStyle={{ zIndex: 10 }} content={(p) => <ChartTooltip {...p} fields={TOOLTIP_FIELDS} />} />
                {/* itemSorter picks legend order independently of draw order below (Legend's
                    payload prop is ignored by Recharts - it always sources from internal state). */}
                <Legend
                    wrapperStyle={{ marginTop: '20px' }}
                    itemSorter={(item) => LEGEND_ORDER.indexOf(item.value)}
                />
                {/* Draw order (bottom to top): Fault Status, Rating, Sequence Number - so the
                    Sequence Number dots render on top since both it and Fault Status share dataKey="seq". */}
                <Line
                    type="monotone"
                    dataKey="seq"
                    name="Fault Status"
                    stroke="#38761D" // Base line stays a neutral green
                    dot={RenderCustomDot} // Dots turn green or red based on 'faults' value
                />
                <Line type="stepAfter" dataKey="rating" name="Rating" stroke="#EE4B2B" yAxisId="right" strokeWidth={2} dot={{ r: 3 }} />
                <Line
                    type="monotone"
                    dataKey="seq"
                    name="Sequence Number"
                    stroke="#FFFF00" // Clean base line color (e.g., Yellow)
                    strokeWidth={2}
                    dot={RenderModeDot} // Evaluates individually for every point array element
                    yAxisId="left"
                />
                </ComposedChart>
            </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full md:w-4/5 justify-items-center px-4 md:px-0 py-0 md:py-4">
                {pageItems.map((res) => {
                    const payloadLast = res.payload?.split(":")[res.payload.split(":").length - 1] || "";
                    const sequenceNumber = parseInt(payloadLast?.slice(17, -8), 16) || 0;
                    const ratingRaw = parseInt(payloadLast?.slice(25, -6),16) || 0;
                    const faultRaw = parseInt(payloadLast?.slice(27, -6),16) || 0;
                    const modeRaw = parseFloat(parseInt(payloadLast?.slice(29, -2),16)) || 0;
                    
                    let rating = '';
                    let faults = '';
                    let mode = '';

                    switch(ratingRaw){
                        case 0:
                        case 128:
                            rating = 'Heartbeat';
                            break;
                        case 144:
                            rating = '1';
                            break;
                        case 160:
                            rating = '2';
                            break;
                        case 176:
                            rating = '3';
                            break;
                        case 192:
                            rating = '4';
                            break;
                        case 208:
                            rating = '5';
                            break;
                        default:
                            rating = 'Anomaly' ;
                            break;
                    }

                    faults = (faultRaw === 0) ? 'No Faults Detected' : 'Fault Detected';

                    mode = (modeRaw === 0) ? 'Operational' : (modeRaw === 255) ? 'Testing' : 'Abnormal';
                    
                    return (
                        <div key={res.id} className="flex flex-col justify-center border-2 gap-2 p-3 md:p-2 text-center w-full rounded-md text-sm md:text-xl">
                            <p><span className="font-bold">Sensor ID:</span> {res.sensor_id}</p>
                            <p><span className="font-bold">Gateway ID:</span> {res.gateway_id}</p>
                            <p><span className="font-bold">Created At:</span> {new Date(res.created_at).toLocaleString()}</p>
                            <p><span className="font-bold">Updated At:</span> {new Date(res.updated_at).toLocaleString()}</p>
                            <p><span className="font-bold">Site:</span> {res.site_name} (ID: {res.site_id})</p>
                            <p><span className="font-bold">Sequence Number:</span> {sequenceNumber}</p>
                            <p><span className="font-bold">Rating:</span> {rating}</p>
                            <p><span className="font-bold">Fault Status:</span> {faults}</p>
                            <p><span className="font-bold">Mode:</span> {mode}</p>
                        </div>
                    )
                })}
            </div>
        </>
    )
}