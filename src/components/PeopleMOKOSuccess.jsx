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

export default function PeopleMOKOSuccess({pageItems,results,handleBack,handleRefresh}){
        const STATUS_MAP = {
        0: 'False',
        1: 'True',
        2: 'Anomaly',
    };
    
    const chartData = pageItems
    .map((res) => {
        const devEUI = res.payload?.end_device_ids?.dev_eui;
        const devAddr = res.payload?.end_device_ids?.dev_addr;
        const sequenceNumber = res.payload?.uplink_message?.f_cnt || 0;
        const deviceID = res.payload?.end_device_ids?.device_id?.slice(4) || '';
        const numPeople = Math.ceil(parseInt(res.payload?.uplink_message?.decoded_payload?.extraBytes, 16) / 2) || 0;
        const lowBattery = res.payload?.uplink_message?.decoded_payload?.lowBattery;
        let statusCode = 2; // default -> Anomaly
        if (lowBattery === false) statusCode = 0;
        else if (lowBattery === true) statusCode = 1;
        return {
            devEUI,
            devAddr,
            gateway_eui: res.payload?.uplink_message?.rx_metadata?.[0]?.gateway_ids?.eui,
            time: new Date(res.created_at).toLocaleTimeString(),
            datetime: new Date(res.created_at).toLocaleString(),
            seq: sequenceNumber,
            deviceID,
            numPeople,
            lowBattery,
            statusCode,
        };
    })
    
    const TOOLTIP_FIELDS = [
        { key: "datetime", bold: true },
        { key: "devEUI", label: "Device EUI" },
        { key: "devAddr", label: "Device Address" },
        { key: "gateway_eui", label: "Gateway EUI" },
        { key: "deviceID", label: "Device ID" },
        { key: "seq", label: "Sequence Number" },
        { key: "numPeople", label: "Number of People" },
        { key: "statusCode", label: "Low Battery Status", format: (v) => STATUS_MAP[v] ?? "Unknown" },
    ]

    return(
        <>
            <h1 className="font-bold italic text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center">People Counter (LoRaWAN) Sensor Data</h1>
            <RefreshBack results={results} handleBack={handleBack} handleRefresh={handleRefresh}/>
            {/* Chart: responsive container that adapts on mobile */}
            <div className="w-full md:w-4/5 h-64 md:h-96 mx-auto px-4 md:px-0">
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
                <Tooltip wrapperStyle={{ zIndex: 10 }} content={(p) => <ChartTooltip {...p} fields={TOOLTIP_FIELDS} />} />
                <Legend wrapperStyle={{ marginTop: '20px' }} itemSorter={() => 0}/>
                <Line type="monotone" dataKey="seq" name="Sequence Number" stroke="#FFFF00" yAxisId="left" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="numPeople" name="Number of People" stroke="#3182CE" yAxisId="left" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="stepAfter" dataKey="statusCode" name="Low Battery Status" stroke="#E53E3E" yAxisId="right" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
            </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full md:w-4/5 justify-items-center px-4 md:px-0 py-0 md:py-4">
                {pageItems.map((res) => {
                    const sequenceNumber = res.payload?.uplink_message?.f_cnt || 0;
                    const deviceID = res.payload?.end_device_ids?.device_id?.slice(4) || '';
                    const numPeople = Math.ceil(parseInt(res.payload?.uplink_message?.decoded_payload?.extraBytes, 16) / 2) || 0;
                    const lowBattery = res.payload?.uplink_message?.decoded_payload?.lowBattery === true ? "True" : "False";
                    return (
                        <div key={res.id} className="flex flex-col justify-center border-2 gap-2 p-3 md:p-2 text-center w-full rounded-md text-sm md:text-xl">
                            <p><span className="font-bold">Device EUI:</span> {res.payload?.end_device_ids?.dev_eui}</p>
                            <p><span className="font-bold">Device Address:</span> {res.payload?.end_device_ids?.dev_addr}</p>
                            <p><span className="font-bold">Gateway EUI:</span> {res.payload?.uplink_message?.rx_metadata?.[0]?.gateway_ids?.eui}</p>
                            <p><span className="font-bold">Device ID:</span> {deviceID}</p>
                            <p><span className="font-bold">Created At:</span> {new Date(res.created_at).toLocaleString()}</p>
                            <p><span className="font-bold">Received At:</span> {new Date(res.payload?.received_at).toLocaleString()}</p>
                            <p><span className="font-bold">Sequence Number:</span> {sequenceNumber}</p>
                            <p><span className="font-bold">Number of People:</span> {numPeople}</p>
                            <p><span className="font-bold">Low Battery Status:</span> {lowBattery}</p>
                        </div>
                    )
                })}
            </div>
        </>
    )
}