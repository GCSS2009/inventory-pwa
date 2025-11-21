import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
const TimesheetPage = ({ currentClockIn, selectedProject, setSelectedProject, selectedWorkType, setSelectedWorkType, onClockIn, onClockOut, weekEnding, setWeekEnding, entries, loadingEntries, totalHours, downloadTimesheet, }) => {
    const formatClockIn = (iso) => {
        const d = new Date(iso);
        const time = d.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
        });
        const date = d.toLocaleDateString();
        return { time, date };
    };
    // shared card style so it respects theme
    const cardStyle = {
        border: "1px solid var(--gcss-border, #d1d5db)",
        borderRadius: 8,
        padding: "1rem 1.25rem",
        marginBottom: "1.25rem",
        background: "var(--gcss-card-bg, var(--gcss-surface))",
    };
    const labelStyle = {
        display: "block",
        fontSize: "0.85rem",
        marginBottom: "0.25rem",
    };
    const inputStyle = {
        width: "100%",
        padding: "0.45rem",
        borderRadius: 4,
        border: "1px solid var(--gcss-border, #d1d5db)",
        background: "var(--gcss-surface)",
        color: "var(--gcss-text)",
        fontSize: "0.9rem",
    };
    const selectStyle = {
        ...inputStyle,
    };
    const mutedText = {
        fontSize: "0.9rem",
        color: "var(--gcss-muted, #6b7280)",
    };
    const thBase = {
        borderBottom: "1px solid #ddd",
        padding: "0.25rem 0.4rem",
        textAlign: "left",
    };
    const thRight = {
        ...thBase,
        textAlign: "right",
    };
    const tdBase = {
        borderBottom: "1px solid #eee",
        padding: "0.25rem 0.4rem",
    };
    const tdRight = {
        ...tdBase,
        textAlign: "right",
    };
    return (_jsxs("div", { style: {
            padding: "1.5rem 1.25rem 2rem",
            maxWidth: 960,
            margin: "0 auto",
        }, children: [_jsxs("div", { style: { marginBottom: "1.25rem" }, children: [_jsx("h1", { style: { margin: 0, fontSize: "2rem" }, children: "Timesheet" }), _jsx("div", { style: mutedText, children: "Clock in / out and generate a GCSS-branded weekly timesheet." })] }), _jsxs("section", { style: cardStyle, children: [_jsx("h2", { style: { marginTop: 0, marginBottom: "0.75rem" }, children: "Current Status" }), currentClockIn ? (_jsxs(_Fragment, { children: [_jsx("div", { style: { ...mutedText, marginBottom: "0.5rem" }, children: (() => {
                                    const { time, date } = formatClockIn(currentClockIn.start_time);
                                    return (_jsxs(_Fragment, { children: ["You are currently", " ", _jsx("strong", { style: { color: "var(--gcss-text)" }, children: "clocked in" }), " ", "since ", time, " on ", date, "."] }));
                                })() }), _jsxs("div", { style: {
                                    display: "grid",
                                    gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.4fr)",
                                    gap: "0.75rem",
                                    maxWidth: 600,
                                    marginBottom: "0.8rem",
                                }, children: [_jsxs("div", { children: [_jsx("label", { style: labelStyle, children: "Project / Location" }), _jsx("input", { type: "text", value: selectedProject, onChange: (e) => setSelectedProject(e.target.value), placeholder: "e.g. TJ Maxx \u2013 Pineville, Fire Alarm", style: inputStyle })] }), _jsxs("div", { children: [_jsx("label", { style: labelStyle, children: "Work Type" }), _jsxs("select", { value: selectedWorkType, onChange: (e) => setSelectedWorkType(e.target.value), style: selectStyle, children: [_jsx("option", { value: "Install", children: "Install" }), _jsx("option", { value: "Service", children: "Service" }), _jsx("option", { value: "Inspection", children: "Inspection" }), _jsx("option", { value: "Programming", children: "Programming" }), _jsx("option", { value: "Travel", children: "Travel" }), _jsx("option", { value: "Office", children: "Office" })] })] })] }), _jsx("button", { onClick: onClockOut, style: {
                                    padding: "0.5rem 1.1rem",
                                    borderRadius: 6,
                                    border: "none",
                                    background: "#dc2626",
                                    color: "white",
                                    cursor: "pointer",
                                    fontWeight: 600,
                                    fontSize: "0.95rem",
                                }, children: "Clock Out" })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { style: { ...mutedText, marginBottom: "0.75rem" }, children: ["You are currently", " ", _jsx("strong", { style: { color: "var(--gcss-text)" }, children: "clocked out." })] }), _jsx("button", { onClick: onClockIn, style: {
                                    padding: "0.5rem 1.1rem",
                                    borderRadius: 6,
                                    border: "none",
                                    background: "#16a34a",
                                    color: "white",
                                    cursor: "pointer",
                                    fontWeight: 600,
                                    fontSize: "0.95rem",
                                }, children: "Clock In" })] }))] }), _jsxs("section", { style: { ...cardStyle, maxWidth: 640 }, children: [_jsx("h2", { style: { marginTop: 0, marginBottom: "0.75rem" }, children: "Weekly Timesheet" }), _jsxs("div", { style: {
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "0.75rem",
                            alignItems: "flex-end",
                            marginBottom: "0.75rem",
                        }, children: [_jsxs("div", { children: [_jsx("label", { style: labelStyle, children: "Week ending (Sunday)" }), _jsx("input", { type: "date", value: weekEnding, onChange: (e) => setWeekEnding(e.target.value), style: {
                                            ...inputStyle,
                                            width: "auto",
                                            minWidth: 180,
                                        } })] }), _jsx("button", { onClick: downloadTimesheet, style: {
                                    padding: "0.5rem 0.9rem",
                                    borderRadius: 6,
                                    border: "none",
                                    background: "#0062ff",
                                    color: "white",
                                    cursor: "pointer",
                                    fontWeight: 600,
                                    fontSize: "0.9rem",
                                }, children: "Download GCSS Timesheet" })] }), _jsxs("div", { style: mutedText, children: ["Total hours for selected week:", " ", _jsx("strong", { style: { color: "var(--gcss-text)" }, children: totalHours.toFixed(2) })] })] }), _jsxs("section", { children: [_jsx("h2", { style: { marginTop: "1.5rem" }, children: "Entries for selected week" }), loadingEntries ? (_jsx("div", { children: "Loading timesheet\u2026" })) : entries.length === 0 ? (_jsx("div", { style: mutedText, children: "No entries for this week yet." })) : (_jsx("div", { style: {
                            overflowX: "auto",
                            borderRadius: 6,
                            border: "1px solid var(--gcss-border, #d1d5db)",
                            background: "var(--gcss-surface)",
                        }, children: _jsxs("table", { style: {
                                width: "100%",
                                borderCollapse: "collapse",
                                fontSize: "0.85rem",
                                minWidth: 480,
                            }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: thBase, children: "Date" }), _jsx("th", { style: thBase, children: "Project / Location" }), _jsx("th", { style: thBase, children: "Type" }), _jsx("th", { style: thRight, children: "Hours" })] }) }), _jsx("tbody", { children: entries.map((row) => {
                                        const d = new Date(row.created_at);
                                        return (_jsxs("tr", { children: [_jsx("td", { style: tdBase, children: d.toLocaleDateString() }), _jsx("td", { style: tdBase, children: row.project ?? "" }), _jsx("td", { style: tdBase, children: row.work_type ?? "" }), _jsx("td", { style: tdRight, children: row.hours != null ? row.hours.toFixed(2) : "" })] }, row.id));
                                    }) })] }) }))] })] }));
};
export default TimesheetPage;
