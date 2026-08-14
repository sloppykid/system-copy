document.addEventListener("DOMContentLoaded", function () {

    const ROOM_STORAGE_KEY = "ktvRoomData";
    const ACTIVITY_STORAGE_KEY = "ktvActivityLog";
    const ROOM_CONFIG_KEY = "ktvRoomConfig";
    const REPORT_STORAGE_KEY = "ktvReports";

    const currentDate = document.getElementById("currentDate");
    const searchInput = document.getElementById("searchReport");
    const statusFilter = document.getElementById("statusFilter");
    const dateFilter = document.getElementById("dateFilter");
    const reportTable = document.getElementById("reportTable");
    const clearFiltersButton = document.getElementById("clearFilters");
    const refreshButton = document.getElementById("refreshReports");
    const printButton = document.getElementById("printReports");
    const exportButton = document.getElementById("exportReports");
    const clearReportsButton = document.getElementById("clearReports");
    const sessionModal = document.getElementById("sessionModal");
    const sessionDetails = document.getElementById("sessionDetails");
    const closeSessionModalButton = document.getElementById("closeSessionModal");

    function money(value) {
        return Number(value || 0).toLocaleString("en-PH", {
            style: "currency",
            currency: "PHP",
            minimumFractionDigits: 2
        });
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function toDateParts(date) {
        const d = new Date(date);
        if (Number.isNaN(d.getTime())) {
            return { date: "", time: "", timestamp: 0 };
        }

        return {
            date: d.toLocaleDateString("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric"
            }),
            time: d.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit"
            }),
            timestamp: d.getTime()
        };
    }

    function readJson(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (error) {
            console.error("Reports storage error:", key, error);
            return fallback;
        }
    }

    function getRoomData() {
        return readJson(ROOM_STORAGE_KEY, {});
    }

    function getActivityLog() {
        return readJson(ACTIVITY_STORAGE_KEY, []);
    }

    function getRoomConfig() {
        return readJson(ROOM_CONFIG_KEY, {});
    }

    function getSavedReports() {
        return readJson(REPORT_STORAGE_KEY, []);
    }

    function saveReports(reports) {
        localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(reports));
    }

    function getRoomLabel(roomNumber, config) {
        const cfg = config?.[roomNumber];

        if (!cfg) {
            return `Room ${roomNumber}`;
        }

        return cfg.name
            ? cfg.name
            : `Room ${roomNumber}`;
    }

    function getRoomType(roomNumber, config) {
        const cfg = config?.[roomNumber];

        if (!cfg) {
            return "Regular";
        }

        return cfg.type || cfg.roomType || "Regular";
    }

    function parseStartMessage(message) {
        const match = message.match(
            /^Room\s+(.+?):\s+Session started\s+—\s+(.+?)\s+at\s+₱([\d,]+(?:\.\d+)?)\/hour\s+for\s+(\d+)\s+hour\(s\)/i
        );

        if (!match) {
            return null;
        }

        return {
            roomKey: match[1].trim(),
            pricingLabel: match[2].trim(),
            hourlyRate: Number(match[3].replace(/,/g, "")),
            hours: Number(match[4])
        };
    }

    function parseExtendMessage(message) {
        const match = message.match(
            /^Room\s+(.+?):\s+Session extended by\s+(\d+)\s+hour\(s\)/i
        );

        if (!match) {
            return null;
        }

        return {
            roomKey: match[1].trim(),
            hours: Number(match[2])
        };
    }

    function parseEndMessage(message) {
        const match = message.match(
            /^Room\s+(.+?):\s+(?:Expired session cleared|Session ended)\s+—\s+room is now available/i
        );

        if (!match) {
            return null;
        }

        return {
            roomKey: match[1].trim()
        };
    }

    function parseExpiredMessage(message) {
        const match = message.match(
            /^Room\s+(.+?):\s+Session expired\s+—\s+staff clearance required/i
        );

        if (!match) {
            return null;
        }

        return {
            roomKey: match[1].trim()
        };
    }

    function createSessionId(roomKey, startTimestamp) {
        return `${String(roomKey).replace(/\s+/g, "_")}_${startTimestamp}`;
    }

    function syncReportsFromSystem() {

        const activities = getActivityLog()
            .slice()
            .sort(function (a, b) {
                return new Date(a.time).getTime() -
                    new Date(b.time).getTime();
            });

        const rooms = getRoomData();
        const config = getRoomConfig();

        const savedReports = getSavedReports();

        const byId = new Map();

        savedReports.forEach(function (report) {
            if (report && report.id) {
                byId.set(report.id, report);
            }
        });

        const openByRoom = new Map();

        activities.forEach(function (activity) {

            if (!activity || !activity.message || !activity.time) {
                return;
            }

            const time = new Date(activity.time).getTime();
            if (!Number.isFinite(time)) {
                return;
            }

            const start = parseStartMessage(activity.message);

            if (start) {

                const id = createSessionId(
                    start.roomKey,
                    time
                );

                const parts = toDateParts(time);

                const record = {
                    id,
                    roomKey: start.roomKey,
                    room: `Room ${start.roomKey}`,
                    roomName: getRoomLabel(start.roomKey, config),
                    roomType: getRoomType(start.roomKey, config),
                    pricingLabel: start.pricingLabel,
                    hourlyRate: start.hourlyRate,
                    hours: start.hours,
                    date: parts.date,
                    time: parts.time,
                    startTimestamp: time,
                    endTimestamp: null,
                    status: "active",
                    estimatedTotal: start.hourlyRate * start.hours
                };

                byId.set(id, record);
                openByRoom.set(start.roomKey, id);
                return;
            }

            const extension = parseExtendMessage(activity.message);

            if (extension) {

                const id = openByRoom.get(extension.roomKey);

                if (id && byId.has(id)) {
                    const record = byId.get(id);

                    record.hours =
                        Number(record.hours || 0) +
                        extension.hours;

                    record.estimatedTotal =
                        Number(record.estimatedTotal || 0) +
                        (Number(record.hourlyRate || 0) * extension.hours);
                }

                return;
            }

            const expired = parseExpiredMessage(activity.message);

            if (expired) {

                const id = openByRoom.get(expired.roomKey);

                if (id && byId.has(id)) {
                    const record = byId.get(id);
                    record.status = "expired";
                }

                return;
            }

            const ended = parseEndMessage(activity.message);

            if (ended) {

                const id = openByRoom.get(ended.roomKey);

                if (id && byId.has(id)) {

                    const record = byId.get(id);

                    record.endTimestamp = time;
                    record.status = "completed";

                    delete record.activeRemaining;

                    openByRoom.delete(ended.roomKey);
                }
            }
        });

        // Current active/expired rooms are authoritative for live information.
        Object.keys(rooms).forEach(function (roomKey) {

            const data = rooms[roomKey];

            if (!data || !data.startTime) {
                return;
            }

            const activeStatus =
                data.status === "occupied" ||
                data.status === "warning" ||
                data.status === "expired";

            if (!activeStatus) {
                return;
            }

            const startTimestamp = Number(data.startTime);

            if (!Number.isFinite(startTimestamp)) {
                return;
            }

            const id = createSessionId(roomKey, startTimestamp);
            const parts = toDateParts(startTimestamp);

            const pricingLabel =
                data.pricingLabel ||
                data.pricingTier ||
                "Unspecified";

            const hourlyRate =
                Number(data.hourlyRate || 0);

            const durationHours =
                Number(
                    data.durationHours ||
                    ((Number(data.duration || 0)) / 60) ||
                    0
                );

            let record = byId.get(id);

            if (!record) {
                record = {
                    id,
                    roomKey,
                    room: `Room ${roomKey}`,
                    roomName: getRoomLabel(roomKey, config),
                    roomType: getRoomType(roomKey, config),
                    pricingLabel,
                    hourlyRate,
                    hours: durationHours,
                    date: parts.date,
                    time: parts.time,
                    startTimestamp,
                    endTimestamp: null,
                    status: data.status === "expired"
                        ? "expired"
                        : "active",
                    estimatedTotal:
                        Number(data.estimatedTotal || 0) ||
                        (hourlyRate * durationHours)
                };

                byId.set(id, record);
            } else {
                record.roomName =
                    getRoomLabel(roomKey, config);
                record.roomType =
                    getRoomType(roomKey, config);
                record.pricingLabel =
                    data.pricingLabel ||
                    record.pricingLabel;
                record.hourlyRate =
                    hourlyRate || record.hourlyRate;
                record.hours =
                    durationHours || record.hours;
                record.estimatedTotal =
                    Number(data.estimatedTotal || record.estimatedTotal || 0);
                record.status =
                    data.status === "expired"
                        ? "expired"
                        : "active";
            }

            record.activeRemaining =
                Number(data.remaining || 0);

            openByRoom.set(String(roomKey), id);
        });

        const reports = Array.from(byId.values())
            .sort(function (a, b) {
                return Number(b.startTimestamp || 0) -
                    Number(a.startTimestamp || 0);
            })
            .slice(0, 200);

        saveReports(reports);

        return reports;
    }

    function getFilteredReports(reports) {

        const searchValue =
            (searchInput?.value || "")
                .toLowerCase()
                .trim();

        const statusValue =
            statusFilter?.value || "all";

        const dateValue =
            dateFilter?.value || "";

        return reports.filter(function (report) {

            const roomText =
                `${report.room} ${report.roomName || ""} ${report.pricingLabel || ""}`
                    .toLowerCase();

            const matchesSearch =
                !searchValue ||
                roomText.includes(searchValue);

            const matchesStatus =
                statusValue === "all" ||
                report.status === statusValue;

            let matchesDate = true;

            if (dateValue) {

                const parts =
                    dateValue.split("-");

                const formattedDate =
                    `${parts[1]}/${parts[2]}/${parts[0]}`;

                matchesDate =
                    report.date === formattedDate;
            }

            return (
                matchesSearch &&
                matchesStatus &&
                matchesDate
            );
        });
    }

    function statusHtml(status) {

        if (status === "completed") {
            return `<span class="status completed">Completed</span>`;
        }

        if (status === "expired") {
            return `<span class="status expired-status">Expired</span>`;
        }

        return `<span class="status active-status">Active</span>`;
    }

    function displayReports() {

        const reports =
            syncReportsFromSystem();

        const filtered =
            getFilteredReports(reports);

        reportTable.innerHTML = "";

        if (!filtered.length) {

            reportTable.innerHTML = `
                <tr>
                    <td colspan="8" class="no-data">
                        No session records found.
                    </td>
                </tr>
            `;

            updateSummary([]);
            return;
        }

        filtered.forEach(function (report) {

            const row =
                document.createElement("tr");

            const currentDuration =
                Number(report.hours || 0);

            row.innerHTML = `
                <td>
                    <strong>
                        ${escapeHtml(report.roomName || report.room)}
                    </strong>
                    <small>
                        ${escapeHtml(report.roomType || "Regular")}
                    </small>
                </td>

                <td>
                    ${escapeHtml(report.pricingLabel || "—")}
                </td>

                <td>
                    ${money(report.hourlyRate)}/hr
                </td>

                <td>
                    ${escapeHtml(report.date || "—")}
                </td>

                <td>
                    ${escapeHtml(report.time || "—")}
                </td>

                <td>
                    ${currentDuration} ${currentDuration === 1 ? "Hour" : "Hours"}
                </td>

                <td>
                    ${money(report.estimatedTotal)}
                </td>

                <td>
                    ${statusHtml(report.status)}
                </td>
            `;

            row.addEventListener("click", function () {
                showSessionDetails(report);
            });

            reportTable.appendChild(row);
        });

        updateSummary(filtered);
    }

    function updateSummary(reports) {

        const total =
            reports.length;

        const completed =
            reports.filter(function (report) {
                return report.status === "completed";
            }).length;

        const activeOrExpired =
            reports.filter(function (report) {
                return report.status === "active" ||
                    report.status === "expired";
            }).length;

        const totalHours =
            reports.reduce(function (sum, report) {
                return sum +
                    Number(report.hours || 0);
            }, 0);

        const totalRevenue =
            reports.reduce(function (sum, report) {
                return sum +
                    Number(report.estimatedTotal || 0);
            }, 0);

        document.getElementById(
            "totalSessions"
        ).textContent = total;

        document.getElementById(
            "completedSessions"
        ).textContent = completed;

        document.getElementById(
            "activeSessions"
        ).textContent = activeOrExpired;

        document.getElementById(
            "totalHours"
        ).textContent =
            `${totalHours}h`;

        document.getElementById(
            "totalRevenue"
        ).textContent =
            money(totalRevenue);
    }

    function showSessionDetails(report) {

        if (!sessionModal || !sessionDetails) {
            return;
        }

        const start =
            Number(report.startTimestamp || 0);

        const end =
            Number(report.endTimestamp || 0);

        const liveRemaining =
            Number(report.activeRemaining || 0);

        const endText =
            end
                ? new Date(end).toLocaleString("en-PH")
                : report.status === "active"
                    ? `Active — ${formatLiveRemaining(liveRemaining)} remaining`
                    : report.status === "expired"
                        ? "Expired — awaiting room clearance"
                        : "—";

        sessionDetails.innerHTML = `
            <div class="session-detail">
                <span>Room</span>
                <strong>${escapeHtml(report.roomName || report.room)}</strong>
            </div>

            <div class="session-detail">
                <span>Room Type</span>
                <strong>${escapeHtml(report.roomType || "Regular")}</strong>
            </div>

            <div class="session-detail">
                <span>Pricing Tier</span>
                <strong>${escapeHtml(report.pricingLabel || "—")}</strong>
            </div>

            <div class="session-detail">
                <span>Hourly Rate</span>
                <strong>${money(report.hourlyRate)}/hour</strong>
            </div>

            <div class="session-detail">
                <span>Start</span>
                <strong>${start ? new Date(start).toLocaleString("en-PH") : `${escapeHtml(report.date)} ${escapeHtml(report.time)}`}</strong>
            </div>

            <div class="session-detail">
                <span>Duration</span>
                <strong>${Number(report.hours || 0)} ${Number(report.hours || 0) === 1 ? "Hour" : "Hours"}</strong>
            </div>

            <div class="session-detail">
                <span>Estimated Total</span>
                <strong>${money(report.estimatedTotal)}</strong>
            </div>

            <div class="session-detail">
                <span>Status</span>
                <strong>${report.status === "completed" ? "Completed" : report.status === "expired" ? "Expired" : "Active"}</strong>
            </div>

            <div class="session-detail">
                <span>End / Current State</span>
                <strong>${escapeHtml(endText)}</strong>
            </div>
        `;

        sessionModal.classList.add("show");
        sessionModal.setAttribute("aria-hidden", "false");
    }

    function formatLiveRemaining(totalSeconds) {

        let seconds =
            Math.max(0, Number(totalSeconds || 0));

        const hours =
            Math.floor(seconds / 3600);

        seconds %= 3600;

        const minutes =
            Math.floor(seconds / 60);

        seconds %= 60;

        return [
            String(hours).padStart(2, "0"),
            String(minutes).padStart(2, "0"),
            String(seconds).padStart(2, "0")
        ].join(":");
    }

    function closeSessionModal() {

        if (!sessionModal) {
            return;
        }

        sessionModal.classList.remove("show");
        sessionModal.setAttribute("aria-hidden", "true");
    }

    function exportCsv() {

        const reports =
            getFilteredReports(
                syncReportsFromSystem()
            );

        if (!reports.length) {
            alert("There are no reports to export.");
            return;
        }

        const headers = [
            "Room",
            "Room Type",
            "Pricing Tier",
            "Hourly Rate",
            "Date",
            "Start Time",
            "Duration Hours",
            "Estimated Total",
            "Status"
        ];

        const rows = reports.map(function (report) {
            return [
                report.roomName || report.room,
                report.roomType || "",
                report.pricingLabel || "",
                Number(report.hourlyRate || 0).toFixed(2),
                report.date || "",
                report.time || "",
                Number(report.hours || 0),
                Number(report.estimatedTotal || 0).toFixed(2),
                report.status || ""
            ];
        });

        const csv = [
            headers,
            ...rows
        ]
            .map(function (row) {
                return row.map(function (cell) {
                    const value = String(cell ?? "");
                    return `"${value.replace(/"/g, '""')}"`;
                }).join(",");
            })
            .join("\r\n");

        const blob =
            new Blob(
                [csv],
                { type: "text/csv;charset=utf-8;" }
            );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            `ktv-reports-${new Date().toISOString().slice(0, 10)}.csv`;

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
    }

    function clearReports() {

        const confirmed =
            confirm(
                "Clear the saved report history? This does not delete Room sessions or Activity Log entries."
            );

        if (!confirmed) {
            return;
        }

        localStorage.removeItem(
            REPORT_STORAGE_KEY
        );

        displayReports();
    }

    function printReports() {

        window.print();
    }

    function initializeDate() {

        if (!currentDate) {
            return;
        }

        currentDate.textContent =
            new Date().toLocaleDateString(
                "en-PH",
                {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                }
            );
    }

    searchInput?.addEventListener(
        "input",
        displayReports
    );

    statusFilter?.addEventListener(
        "change",
        displayReports
    );

    dateFilter?.addEventListener(
        "change",
        displayReports
    );

    clearFiltersButton?.addEventListener(
        "click",
        function () {

            if (searchInput) {
                searchInput.value = "";
            }

            if (statusFilter) {
                statusFilter.value = "all";
            }

            if (dateFilter) {
                dateFilter.value = "";
            }

            displayReports();
        }
    );

    refreshButton?.addEventListener(
        "click",
        displayReports
    );

    printButton?.addEventListener(
        "click",
        printReports
    );

    exportButton?.addEventListener(
        "click",
        exportCsv
    );

    clearReportsButton?.addEventListener(
        "click",
        clearReports
    );

    closeSessionModalButton?.addEventListener(
        "click",
        closeSessionModal
    );

    sessionModal?.addEventListener(
        "click",
        function (event) {

            if (event.target === sessionModal) {
                closeSessionModal();
            }
        }
    );

    window.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {
                closeSessionModal();
            }
        }
    );

    window.addEventListener(
        "storage",
        function (event) {

            if (
                event.key === ROOM_STORAGE_KEY ||
                event.key === ACTIVITY_STORAGE_KEY ||
                event.key === ROOM_CONFIG_KEY
            ) {
                displayReports();
            }
        }
    );

    document.addEventListener(
        "visibilitychange",
        function () {

            if (!document.hidden) {
                displayReports();
            }
        }
    );

    // Keep active/expired report states current.
    setInterval(
        displayReports,
        1000
    );

    initializeDate();
    displayReports();
});
