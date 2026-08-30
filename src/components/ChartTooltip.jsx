// Generic Recharts tooltip content, shared by every *Success chart component. Each chart
// passes its own small `fields` array describing what to show instead of hand-rolling the
// same "if (!active...) return null" + labeled-<div> markup in every file - which is also
// what let a tooltip drift out of sync with its own chartData shape unnoticed in the past.
//
// Each field entry is either:
//   { header: "X-Axis" }              - a bold section divider, for grouping fields (e.g. a
//                                        chart with separate X/Y/Z axis readings)
//   { key, label, bold, format }      - a normal value line, where:
//     key    - property to read off the data point (payload[0].payload)
//     label  - text shown before the value, e.g. "Sequence Number: 12" (omit for an unlabeled
//              line, e.g. the bold datetime header)
//     bold   - renders the line with font-bold (used for the datetime header)
//     format - (value, point) => displayValue - transforms the raw value; receives the whole
//              data point too, for fields whose display depends on another field (e.g. a
//              status code gating what a reading means)
export default function ChartTooltip({ active, payload, fields }) {
    if (!active || !payload?.length) return null;
    const p = payload[0].payload;
    return (
        <div className="bg-white border p-2 text-sm shadow">
            {fields.map(({ key, label, bold, format, header }, i) =>
                header ? (
                    <div key={`header-${header}-${i}`}><b>{header}:</b></div>
                ) : (
                    <div key={label ?? key} className={bold ? "font-bold" : undefined}>
                        {label ? `${label}: ` : ""}{format ? format(p[key], p) : p[key]}
                    </div>
                )
            )}
        </div>
    );
}
