// ========================================
// KTV MONITORING SYSTEM
// ROOM SESSION SYSTEM
// ========================================

const ROOM_STORAGE_KEY = "ktvRoomData";
const ACTIVITY_STORAGE_KEY = "ktvActivityLog";
const NOTIFICATION_STORAGE_KEY = "ktvNotifications";


const FIRST_ROOM = 1;
const LAST_ROOM = 17;

const DEFAULT_WARNING_TIME = 10;

let roomTimer = null;
let selectedRoomForEnding = null;
let selectedRoomForStarting = null;
let selectedRoomForExtending = null;
let extendSessionTimer = null;


// ========================================
// DEFAULT ROOM
// ========================================

function createDefaultRoom() {

    return {

        status: "available",

        // Session / Pricing Information
        persons: 2,
        hourlyRate: 120,
        estimatedTotal: 120,

        // Session Information
        startTime: null,
        duration: 0,

        remaining: 0,

        endTime: null,

        warningNotified: false,

        expiredNotified: false
    };

}


// ========================================
// SETTINGS
// ========================================

function getRoomSettings() {

    const saved = localStorage.getItem("ktvSettings");

    const defaults = {
        warningTime: DEFAULT_WARNING_TIME
    };

    if (!saved) {
        return defaults;
    }

    try {
        return {
            ...defaults,
            ...JSON.parse(saved)
        };
    } catch (error) {
        console.error("Settings loading error:", error);
        return defaults;
    }
}


// ========================================
// ROOM DATA
// ========================================

function getRoomData() {

    const saved =
        localStorage.getItem(
            ROOM_STORAGE_KEY
        );


    if (saved) {

        try {

            const rooms =
                JSON.parse(saved);


            let migrated = false;


            // Migrate old rooms 101-117
            for (
                let oldRoom = 101;
                oldRoom <= 117;
                oldRoom++
            ) {

                const newRoom =
                    oldRoom - 100;


                if (
                    rooms[oldRoom] &&
                    !rooms[newRoom]
                ) {

                    rooms[newRoom] =
                        rooms[oldRoom];

                    migrated = true;
                }


                if (rooms[oldRoom]) {

                    delete rooms[oldRoom];

                    migrated = true;
                }

            }



            // Make sure Room 1-17 exists

            for (
                let roomNumber = FIRST_ROOM;
                roomNumber <= LAST_ROOM;
                roomNumber++
            ) {


                if (!rooms[roomNumber]) {


                    rooms[roomNumber] =
                        createDefaultRoom();


                    migrated = true;


                } else {


                    if (
                        rooms[roomNumber].customerName === undefined
                    ) {

                        rooms[roomNumber].customerName = "";

                    }


                    if (
                        rooms[roomNumber].customerPhone === undefined
                    ) {

                        rooms[roomNumber].customerPhone = "";

                    }


                    if (
                        rooms[roomNumber].startTime === undefined
                    ) {

                        rooms[roomNumber].startTime = null;

                    }


                    if (
                        rooms[roomNumber].duration === undefined
                    ) {

                        rooms[roomNumber].duration = 0;

                    }
                    if (
                        rooms[roomNumber].persons === undefined
                    ) {

                        rooms[roomNumber].persons = 2;

                    }


                    if (
                        rooms[roomNumber].hourlyRate === undefined
                    ) {

                        rooms[roomNumber].hourlyRate = 120;

                    }


                    if (
                        rooms[roomNumber].estimatedTotal === undefined
                    ) {

                        rooms[roomNumber].estimatedTotal = 0;

                    }



                }

            }



            if (migrated) {

                saveRoomData(rooms);

            }


            return rooms;


        } catch (error) {


            console.error(
                "Room data error:",
                error
            );


            return {};

        }

    }



    // Create new room data

    const rooms = {};


    for (
        let roomNumber = FIRST_ROOM;
        roomNumber <= LAST_ROOM;
        roomNumber++
    ) {

        rooms[roomNumber] =
            createDefaultRoom();

    }


    saveRoomData(rooms);


    return rooms;

}


// ========================================
// SAVE ROOM DATA
// ========================================

function saveRoomData(rooms) {

    localStorage.setItem(
        ROOM_STORAGE_KEY,
        JSON.stringify(rooms)
    );

}


// ========================================
// ACTIVITY LOG
// ========================================

function getActivityLog() {

    const saved =
        localStorage.getItem(ACTIVITY_STORAGE_KEY);

    if (!saved) {
        return [];
    }

    try {
        return JSON.parse(saved);
    } catch (error) {
        console.error("Activity log error:", error);
        return [];
    }
}


function saveActivityLog(activities) {

    localStorage.setItem(
        ACTIVITY_STORAGE_KEY,
        JSON.stringify(activities)
    );

}


function addActivity(type, message) {

    const activities = getActivityLog();

    activities.unshift({
        type: type,
        message: message,
        time: new Date().toISOString()
    });

    if (activities.length > 200) {
        activities.splice(200);
    }

    saveActivityLog(activities);
}


// ========================================
// NOTIFICATIONS
// ========================================

function getNotifications() {

    const saved =
        localStorage.getItem(NOTIFICATION_STORAGE_KEY);

    if (!saved) {
        return [];
    }

    try {
        return JSON.parse(saved);
    } catch (error) {
        console.error("Notification error:", error);
        return [];
    }
}


function saveNotifications(notifications) {

    localStorage.setItem(
        NOTIFICATION_STORAGE_KEY,
        JSON.stringify(notifications)
    );

}


function addSystemNotification(
    type,
    message,
    uniqueKey = null
) {

    const notifications = getNotifications();

    if (uniqueKey) {

        const duplicate =
            notifications.some(
                notification =>
                    notification.uniqueKey === uniqueKey
            );

        if (duplicate) {
            return;
        }
    }

    notifications.unshift({
        type: type,
        message: message,
        time: new Date().toISOString(),
        uniqueKey: uniqueKey
    });

    if (notifications.length > 100) {
        notifications.splice(100);
    }

    saveNotifications(notifications);
}


// ========================================
// TOAST
// ========================================

function showRoomToast(
    message,
    type = "success"
) {

    let toastContainer =
        document.getElementById("roomToastContainer");

    if (!toastContainer) {

        toastContainer =
            document.createElement("div");

        toastContainer.id =
            "roomToastContainer";

        toastContainer.style.position = "fixed";
        toastContainer.style.top = "20px";
        toastContainer.style.right = "20px";
        toastContainer.style.zIndex = "99999";
        toastContainer.style.display = "flex";
        toastContainer.style.flexDirection = "column";
        toastContainer.style.gap = "10px";

        document.body.appendChild(toastContainer);
    }


    const toast =
        document.createElement("div");

    toast.textContent = message;

    toast.style.padding = "12px 18px";
    toast.style.borderRadius = "8px";
    toast.style.color = "#ffffff";
    toast.style.fontSize = "14px";
    toast.style.fontWeight = "600";
    toast.style.boxShadow =
        "0 5px 15px rgba(0,0,0,.2)";


    if (type === "error") {

        toast.style.background = "#dc3545";

    } else if (type === "warning") {

        toast.style.background = "#ffc107";
        toast.style.color = "#222";

    } else {

        toast.style.background = "#28a745";

    }


    toastContainer.appendChild(toast);


    setTimeout(() => {
        toast.remove();
    }, 3000);
}


// ========================================
// FORMAT TIME
// ========================================

function formatTime(seconds) {

    seconds = Math.max(
        0,
        Math.floor(Number(seconds) || 0)
    );

    const hours =
        Math.floor(seconds / 3600);

    const minutes =
        Math.floor((seconds % 3600) / 60);

    const secs =
        seconds % 60;

    return (
        String(hours).padStart(2, "0") +
        ":" +
        String(minutes).padStart(2, "0") +
        ":" +
        String(secs).padStart(2, "0")
    );
}


// ========================================
// FIND ROOM CARD
// ========================================

function findRoomCard(roomNumber) {

    const roomCards =
        document.querySelectorAll(".room");

    for (const room of roomCards) {

        const title =
            room.querySelector("h3");

        if (!title) {
            continue;
        }

        if (
            title.textContent.trim() ===
            "Room " + roomNumber
        ) {
            return room;
        }
    }

    return null;
}


// ========================================
// CREATE ROOM ACTIONS
// ========================================

function createRoomActions(roomNumber) {

    const actions =
        document.createElement("div");

    actions.className = "room-actions";


    const extendButton =
        document.createElement("button");

    extendButton.className =
        "extend-button";

    extendButton.textContent =
        "Extend Session";

    extendButton.onclick = function () {

        extendSession(roomNumber);

    };


    const endButton =
        document.createElement("button");

    endButton.className =
        "end-button";

    endButton.textContent =
        "End Session";

    endButton.onclick = function () {

        endSession(roomNumber);

    };


    actions.appendChild(extendButton);
    actions.appendChild(endButton);

    return actions;
}


// ========================================
// UPDATE ROOM UI
// ========================================

function updateRoom(roomNumber) {

    const rooms = getRoomData();

    const data = rooms[roomNumber];

    if (!data) {
        return;
    }


    const room =
        findRoomCard(roomNumber);

    if (!room) {
        return;
    }


    const status =
        room.querySelector(".status");

    const sessionText =
        room.querySelector("p");

    if (!status || !sessionText) {
        return;
    }

    let sessionMeta =
        room.querySelector(".room-session-meta");

    if (!sessionMeta) {
        sessionMeta = document.createElement("div");
        sessionMeta.className = "room-session-meta";
        sessionText.insertAdjacentElement("afterend", sessionMeta);
    }

    sessionMeta.textContent = "";


    // Remove previous states

    room.classList.remove(
        "available",
        "occupied",
        "warning",
        "expired"
    );


    // Remove old buttons

    const oldActions =
        room.querySelector(".room-actions");

    if (oldActions) {
        oldActions.remove();
    }


    const oldButton =
        room.querySelector(":scope > button");

    if (oldButton) {
        oldButton.remove();
    }


    // ========================================
    // AVAILABLE
    // ========================================

    if (data.status === "available") {

        room.classList.add("available");

        status.innerHTML =
            '<span class="dot"></span> Available';

        sessionText.textContent =
            "No Active Session";

        sessionMeta.textContent = "";

        const startButton =
            document.createElement("button");

        startButton.textContent =
            "Start Session";

        startButton.type = "button";

        startButton.onclick =
            function () {
                startSession(roomNumber);
            };


        room.appendChild(startButton);

        return;
    }


    // ========================================
    // OCCUPIED
    // ========================================

    if (data.status === "occupied") {

        room.classList.add("occupied");

        status.innerHTML =
            '<span class="dot"></span> Occupied';

        sessionText.textContent =
            "Time Remaining - " +
            formatTime(
                getLiveRemaining(data)
            );

        const rate = Number(data.hourlyRate) || 0;
        const guests = Number(data.persons) || 0;
        const total = Number(data.estimatedTotal) || 0;

        sessionMeta.textContent =
            guests +
            " guests • " +
            formatCurrency(rate) +
            "/hour • Estimated " +
            formatCurrency(total);

        room.appendChild(
            createRoomActions(roomNumber)
        );

        return;
    }


    // ========================================
    // WARNING
    // ========================================

    if (data.status === "warning") {

        room.classList.add("warning");

        status.innerHTML =
            '<span class="dot"></span> Expiring Soon';

        sessionText.textContent =
            "Time Remaining - " +
            formatTime(
                getLiveRemaining(data)
            );

        const rate = Number(data.hourlyRate) || 0;
        const guests = Number(data.persons) || 0;
        const total = Number(data.estimatedTotal) || 0;

        sessionMeta.textContent =
            guests +
            " guests • " +
            formatCurrency(rate) +
            "/hour • Estimated " +
            formatCurrency(total);

        room.appendChild(
            createRoomActions(roomNumber)
        );

        return;
    }


    // ========================================
    // EXPIRED
    // ========================================

    if (data.status === "expired") {

        room.classList.add("expired");

        status.innerHTML =
            '<span class="dot"></span> Expired';

        sessionText.textContent =
            "Session has expired";


        const clearButton =
            document.createElement("button");

        clearButton.className =
            "clear-button";

        clearButton.textContent =
            "Clear Room";

        clearButton.type = "button";

        clearButton.onclick =
            function () {
                endSession(roomNumber);
            };


        room.appendChild(clearButton);
    }
}


// ========================================
// LIVE REMAINING TIME
// ========================================

function getLiveRemaining(data) {

    if (!data) {
        return 0;
    }

    if (data.endTime) {

        return Math.max(
            0,
            Math.ceil(
                (Number(data.endTime) - Date.now()) / 1000
            )
        );
    }

    return Math.max(
        0,
        Number(data.remaining) || 0
    );
}


// ========================================
// PRICING
// ========================================

function getHourlyRateForPersons(guests) {

    const count = Number(guests);

    if (count >= 2 && count <= 4) {
        return 120;
    }

    if (count >= 5 && count <= 8) {
        return 150;
    }

    if (count >= 9 && count <= 15) {
        return 200;
    }

    if (count >= 16 && count <= 20) {
        return 350;
    }

    return null;
}


function calculateEstimatedTotal(hourlyRate, minutes) {
    return Number(hourlyRate) * (Number(minutes) / 60);
}


function formatCurrency(amount) {
    return "₱" + Number(amount || 0).toFixed(2);
}


function updateStartSessionPricing() {

    const personInput = document.getElementById("startPersonCount");
    const duration = document.getElementById("startSessionDuration");
    const customDuration = document.getElementById("customDurationMinutes");
    const rateElement = document.getElementById("startHourlyRate");
    const totalElement = document.getElementById("startEstimatedTotal");

    if (!personInput || !duration || !rateElement || !totalElement) {
        return;
    }

    const guests = Number(personInput.value);
    const rate = getHourlyRateForPersons(guests);

    let minutes = 0;

    if (duration.value === "custom") {
        minutes = Number(customDuration ? customDuration.value : 0);
    } else {
        minutes = Number(duration.value);
    }

    if (!rate) {
        rateElement.textContent = "No rate available";
        totalElement.textContent = "—";
        return;
    }

    rateElement.textContent =
        formatCurrency(rate) + " / hour";

    if (!minutes || minutes <= 0) {
        totalElement.textContent = "—";
        return;
    }

    totalElement.textContent =
        formatCurrency(
            calculateEstimatedTotal(rate, minutes)
        );
}


// ========================================
// START SESSION
// ========================================

function startSession(roomNumber) {

    const rooms = getRoomData();

    if (
        rooms[roomNumber] &&
        (
            rooms[roomNumber].status === "occupied" ||
            rooms[roomNumber].status === "warning"
        )
    ) {
        showRoomToast(
            "Room " + roomNumber + " already has an active session.",
            "warning"
        );
        updateRoom(roomNumber);
        return;
    }

    selectedRoomForStarting = roomNumber;

    const roomNumberElement = document.getElementById("startSessionRoomNumber");
    const personInput = document.getElementById("startPersonCount");
    const duration = document.getElementById("startSessionDuration");
    const customDuration = document.getElementById("customDurationMinutes");
    const customGroup = document.getElementById("customDurationGroup");
    const modal = document.getElementById("startSessionModal");

    if (roomNumberElement) roomNumberElement.textContent = roomNumber;
    if (personInput) personInput.value = "2";
    if (duration) duration.value = "60";
    if (customDuration) customDuration.value = "";
    if (customGroup) customGroup.style.display = "none";

    if (!modal) {
        showRoomToast("Start Session form is unavailable.", "error");
        selectedRoomForStarting = null;
        return;
    }

    updateStartSessionPricing();
    modal.classList.add("show");

    setTimeout(function () {
        if (personInput) personInput.focus();
    }, 100);
}


// ========================================
// CLOSE START SESSION MODAL
// ========================================

function closeStartSessionModal() {
    const modal = document.getElementById("startSessionModal");
    if (modal) modal.classList.remove("show");
    selectedRoomForStarting = null;
}


// ========================================
// CONFIRM START SESSION
// ========================================

function confirmStartSession() {

    if (selectedRoomForStarting === null) {
        return;
    }

    const roomNumber = selectedRoomForStarting;
    const personInput = document.getElementById("startPersonCount");
    const duration = document.getElementById("startSessionDuration");
    const customDuration = document.getElementById("customDurationMinutes");

    if (!personInput || !duration) {
        showRoomToast("Start Session form is incomplete.", "error");
        return;
    }

    const guests = Number(personInput.value);
    const hourlyRate = getHourlyRateForPersons(guests);

    if (!Number.isInteger(guests) || guests < 2 || guests > 20) {
        showRoomToast("Please enter between 2 and 20 guests.", "error");
        personInput.focus();
        return;
    }

    if (!hourlyRate) {
        showRoomToast(
            "No pricing tier is available for " + guests + " guests. Please use 2-20 guests.",
            "error"
        );
        personInput.focus();
        return;
    }

    let minutes = 0;

    if (duration.value === "custom") {
        minutes = parseInt(
            customDuration ? customDuration.value : "",
            10
        );

        if (isNaN(minutes) || minutes <= 0) {
            showRoomToast("Please enter a valid custom duration.", "error");
            if (customDuration) customDuration.focus();
            return;
        }
    } else {
        minutes = parseInt(duration.value, 10);
    }

    if (isNaN(minutes) || minutes <= 0) {
        showRoomToast("Please select a valid session duration.", "error");
        return;
    }

    const rooms = getRoomData();

    if (
        rooms[roomNumber] &&
        (
            rooms[roomNumber].status === "occupied" ||
            rooms[roomNumber].status === "warning"
        )
    ) {
        showRoomToast(
            "Room " + roomNumber + " already has an active session.",
            "warning"
        );
        closeStartSessionModal();
        updateRoom(roomNumber);
        return;
    }

    const totalSeconds = minutes * 60;
    const startTime = Date.now();
    const estimatedTotal = calculateEstimatedTotal(
        hourlyRate,
        minutes
    );

    rooms[roomNumber] = {
        status: "occupied",
        persons: guests,
        hourlyRate: hourlyRate,
        estimatedTotal: estimatedTotal,
        startTime: startTime,
        duration: minutes,
        remaining: totalSeconds,
        endTime: startTime + totalSeconds * 1000,
        warningNotified: false,
        expiredNotified: false
    };

    saveRoomData(rooms);
    updateRoom(roomNumber);

    addActivity(
        "blue",
        "Room " +
        roomNumber +
        ": Session started — " +
        guests +
        " guests at " +
        formatCurrency(hourlyRate) +
        "/hour"
    );

    addSystemNotification(
        "success",
        "Room " + roomNumber + " session started."
    );

    showRoomToast(
        "Room " + roomNumber + " session started.",
        "success"
    );

    closeStartSessionModal();
}


// ========================================
// EXTEND SESSION
// ========================================

function extendSession(roomNumber) {
    const rooms = getRoomData();
    const data = rooms[roomNumber];

    if (!data) {
        showRoomToast("Room data not found.", "error");
        return;
    }

    if (data.status !== "occupied" && data.status !== "warning") {
        showRoomToast("This room does not have an active session.", "error");
        return;
    }

    if (!data.endTime || data.endTime <= Date.now()) {
        showRoomToast("This session has already expired.", "error");
        return;
    }

    const modal = document.getElementById("extendSessionModal");
    if (!modal) {
        showRoomToast("Extend Session form is unavailable.", "error");
        return;
    }

    selectedRoomForExtending = roomNumber;

    const roomNumberElement = document.getElementById("extendSessionRoomNumber");
    const duration = document.getElementById("extendSessionDuration");
    const customGroup = document.getElementById("extendCustomGroup");
    const customMinutes = document.getElementById("extendCustomMinutes");

    if (roomNumberElement) roomNumberElement.textContent = roomNumber;
    if (duration) duration.value = "30";
    if (customMinutes) customMinutes.value = "";
    if (customGroup) customGroup.style.display = "none";

    modal.classList.add("show");

    clearInterval(extendSessionTimer);
    updateExtendSessionTimer();

    extendSessionTimer = setInterval(function () {
        updateExtendSessionTimer();
    }, 1000);
}


// ========================================
// UPDATE EXTEND SESSION MODAL TIMER
// ========================================

function updateExtendSessionTimer() {
    if (selectedRoomForExtending === null) return;

    const rooms = getRoomData();
    const data = rooms[selectedRoomForExtending];
    const timeElement = document.getElementById("extendCurrentTime");

    if (!data || !timeElement) return;

    const remaining = getLiveRemaining(data);
    timeElement.textContent = formatTime(remaining);

    if (remaining <= 0) {
        const roomNumber = selectedRoomForExtending;
        closeExtendSessionModal();
        updateRoom(roomNumber);
        showRoomToast("This session has expired.", "warning");
    }
}


// ========================================
// CLOSE EXTEND SESSION MODAL
// ========================================

function closeExtendSessionModal() {
    const modal = document.getElementById("extendSessionModal");
    if (modal) modal.classList.remove("show");

    clearInterval(extendSessionTimer);
    extendSessionTimer = null;
    selectedRoomForExtending = null;
}


// ========================================
// CONFIRM EXTEND SESSION
// ========================================

function confirmExtendSession() {
    if (selectedRoomForExtending === null) return;

    const roomNumber = selectedRoomForExtending;
    const rooms = getRoomData();
    const data = rooms[roomNumber];

    if (!data) {
        closeExtendSessionModal();
        showRoomToast("Room data not found.", "error");
        return;
    }

    if (getLiveRemaining(data) <= 0) {
        closeExtendSessionModal();
        updateRoom(roomNumber);
        showRoomToast("This session has already expired.", "warning");
        return;
    }

    const duration = document.getElementById("extendSessionDuration");
    const customMinutes = document.getElementById("extendCustomMinutes");

    if (!duration) {
        closeExtendSessionModal();
        showRoomToast("Extend Session form is unavailable.", "error");
        return;
    }

    let additionalMinutes = 0;

    if (duration.value === "custom") {
        additionalMinutes = parseInt(customMinutes ? customMinutes.value : "", 10);
        if (isNaN(additionalMinutes) || additionalMinutes <= 0) {
            showRoomToast("Please enter a valid number of minutes.", "error");
            if (customMinutes) customMinutes.focus();
            return;
        }
    } else {
        additionalMinutes = parseInt(duration.value, 10);
    }

    if (isNaN(additionalMinutes) || additionalMinutes <= 0) {
        showRoomToast("Please select valid additional time.", "error");
        return;
    }

    data.endTime += additionalMinutes * 60 * 1000;
    data.remaining = getLiveRemaining(data);

    const settings = getRoomSettings();
    const warningSeconds = Number(settings.warningTime) * 60;
    data.status = data.remaining <= warningSeconds ? "warning" : "occupied";
    data.warningNotified = false;
    data.expiredNotified = false;

    rooms[roomNumber] = data;
    saveRoomData(rooms);
    updateRoom(roomNumber);

    addActivity(
        "green",
        "Room " + roomNumber + ": Session extended by " + additionalMinutes + " minute(s)"
    );

    addSystemNotification(
        "success",
        "Room " + roomNumber + " session extended by " + additionalMinutes + " minute(s)."
    );

    showRoomToast(
        "Room " + roomNumber + " extended by " + additionalMinutes + " minute(s).",
        "success"
    );

    closeExtendSessionModal();
}


// ========================================
// END SESSION
// ========================================

function endSession(roomNumber) {

    selectedRoomForEnding =
        roomNumber;


    const modal =
        document.getElementById(
            "endSessionModal"
        );

    const message =
        document.getElementById(
            "endSessionMessage"
        );


    if (!modal) {

        const confirmed =
            confirm(
                "End the session for Room " +
                roomNumber +
                "?"
            );

        if (confirmed) {
            actuallyEndSession(roomNumber);
        }

        return;
    }


    if (message) {

        message.textContent =
            "Are you sure you want to end the session for Room " +
            roomNumber +
            "?";
    }


    modal.classList.add("show");
}


// ========================================
// ACTUALLY END SESSION
// ========================================

function actuallyEndSession(roomNumber) {

    const rooms =
        getRoomData();


    if (!rooms[roomNumber]) {
        return;
    }


    const previousStatus =
        rooms[roomNumber].status;


    rooms[roomNumber] =
        createDefaultRoom();


    saveRoomData(rooms);

    updateRoom(roomNumber);


    if (previousStatus === "expired") {

        addActivity(
            "green",
            "Room " +
            roomNumber +
            ": Expired session cleared — room is now available"
        );

    } else {

        addActivity(
            "green",
            "Room " +
            roomNumber +
            ": Session ended — room is now available"
        );
    }


    addSystemNotification(
        "success",
        "Room " +
        roomNumber +
        " is now available."
    );


    showRoomToast(
        "Room " +
        roomNumber +
        " is now available.",
        "success"
    );
}


// ========================================
// CLOSE END SESSION MODAL
// ========================================

function closeEndSessionModal() {

    const modal =
        document.getElementById(
            "endSessionModal"
        );

    if (modal) {
        modal.classList.remove("show");
    }

    selectedRoomForEnding = null;
}


// ========================================
// CONFIRM END SESSION
// ========================================

function confirmEndSession() {

    if (
        selectedRoomForEnding === null
    ) {
        return;
    }


    const roomNumber =
        selectedRoomForEnding;


    actuallyEndSession(roomNumber);

    closeEndSessionModal();
}


// ========================================
// UPDATE ALL ROOM TIMERS
// ========================================

function updateAllRoomTimers() {

    const rooms =
        getRoomData();

    const settings =
        getRoomSettings();

    const warningSeconds =
        Number(settings.warningTime) * 60;

    let changed = false;


    for (
        let roomNumber = FIRST_ROOM;
        roomNumber <= LAST_ROOM;
        roomNumber++
    ) {

        const data =
            rooms[roomNumber];

        if (!data) {
            continue;
        }


        if (
            data.status !== "occupied" &&
            data.status !== "warning"
        ) {
            continue;
        }


        if (!data.endTime) {
            continue;
        }


        const remainingSeconds =
            Math.max(
                0,
                Math.ceil(
                    (Number(data.endTime) - Date.now()) /
                    1000
                )
            );


        data.remaining =
            remainingSeconds;


        // ========================================
        // EXPIRED
        // ========================================

        if (remainingSeconds <= 0) {

            data.remaining = 0;

            data.status = "expired";


            if (
                data.expiredNotified !== true
            ) {

                data.expiredNotified = true;


                addActivity(
                    "red",
                    "Room " +
                    roomNumber +
                    ": Session expired — staff clearance required"
                );


                addSystemNotification(
                    "error",
                    "Room " +
                    roomNumber +
                    " session has expired — staff clearance required.",
                    "expired-" +
                    roomNumber +
                    "-" +
                    data.endTime
                );
            }


            changed = true;
        }


        // ========================================
        // WARNING
        // ========================================

        else if (
            remainingSeconds <= warningSeconds
        ) {

            data.status = "warning";


            if (
                data.warningNotified !== true
            ) {

                data.warningNotified = true;


                const warningMinutes =
                    Math.ceil(
                        remainingSeconds / 60
                    );


                addActivity(
                    "orange",
                    "Room " +
                    roomNumber +
                    ": Session expiring soon — " +
                    warningMinutes +
                    " minute(s) remaining"
                );


                addSystemNotification(
                    "warning",
                    "Room " +
                    roomNumber +
                    " is expiring soon — " +
                    warningMinutes +
                    " minute(s) remaining.",
                    "warning-" +
                    roomNumber +
                    "-" +
                    data.endTime
                );
            }


            changed = true;
        }


        // ========================================
        // OCCUPIED
        // ========================================

        else {

            data.status = "occupied";

            changed = true;
        }
    }


    if (changed) {
        saveRoomData(rooms);
    }


    // ========================================
    // UPDATE UI
    // ========================================

    for (
        let roomNumber = FIRST_ROOM;
        roomNumber <= LAST_ROOM;
        roomNumber++
    ) {

        updateRoom(roomNumber);
    }
}


// ========================================
// START ROOM TIMER
// ========================================

function startRoomTimer() {

    if (roomTimer !== null) {

        clearInterval(roomTimer);
    }


    updateAllRoomTimers();


    roomTimer =
        setInterval(
            function () {
                updateAllRoomTimers();
            },
            1000
        );
}


// ========================================
// STORAGE EVENT
// ========================================

window.addEventListener(
    "storage",
    function (event) {

        if (
            event.key === ROOM_STORAGE_KEY
        ) {

            for (
                let roomNumber = FIRST_ROOM;
                roomNumber <= LAST_ROOM;
                roomNumber++
            ) {

                updateRoom(roomNumber);
            }
        }


        if (
            event.key === "ktvSettings"
        ) {

            updateAllRoomTimers();
        }
    }
);


// ========================================
// ROOM MODAL EVENTS
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const startPersonInput = document.getElementById("startPersonCount");
        const startDuration = document.getElementById("startSessionDuration");
        const startCustomGroup = document.getElementById("customDurationGroup");
        const startCustomInput = document.getElementById("customDurationMinutes");

        if (startPersonInput) {
            startPersonInput.addEventListener("input", updateStartSessionPricing);
        }

        if (startDuration) {
            startDuration.addEventListener("change", function () {
                if (startCustomGroup && startDuration.value === "custom") {
                    startCustomGroup.style.display = "block";
                    if (startCustomInput) startCustomInput.focus();
                } else if (startCustomGroup) {
                    startCustomGroup.style.display = "none";
                    if (startCustomInput) startCustomInput.value = "";
                }

                updateStartSessionPricing();
            });
        }

        if (startCustomInput) {
            startCustomInput.addEventListener("input", updateStartSessionPricing);
        }

        const extendDuration = document.getElementById("extendSessionDuration");
        const extendCustomGroup = document.getElementById("extendCustomGroup");
        const extendCustomInput = document.getElementById("extendCustomMinutes");

        if (extendDuration) {
            extendDuration.addEventListener("change", function () {
                if (extendCustomGroup && extendDuration.value === "custom") {
                    extendCustomGroup.style.display = "block";
                    if (extendCustomInput) extendCustomInput.focus();
                } else if (extendCustomGroup) {
                    extendCustomGroup.style.display = "none";
                    if (extendCustomInput) extendCustomInput.value = "";
                }
            });
        }

        const startModal = document.getElementById("startSessionModal");
        if (startModal) {
            startModal.addEventListener("click", function (event) {
                if (event.target === startModal) closeStartSessionModal();
            });
        }

        const extendModal = document.getElementById("extendSessionModal");
        if (extendModal) {
            extendModal.addEventListener("click", function (event) {
                if (event.target === extendModal) closeExtendSessionModal();
            });
        }
    }
);


// ========================================
// PAGE LOAD
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        // IMPORTANT:
        // Load saved room state first.

        getRoomData();


        for (
            let roomNumber = FIRST_ROOM;
            roomNumber <= LAST_ROOM;
            roomNumber++
        ) {

            updateRoom(roomNumber);
        }


        startRoomTimer();
    }
);


// ========================================
// ROOM SEARCH
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const searchBox =
            document.getElementById("roomSearch");

        if (!searchBox) {
            return;
        }
    

        searchBox.addEventListener(
            "input",
            function () {

                const searchValue =
                    searchBox.value
                        .toLowerCase()
                        .trim();


                const room =
                    document.querySelectorAll(".room");


                room.forEach(
                    function (room) {

                        const roomName =
                            room.querySelector("h3");

                        if (!roomName) {
                            return;
                        }


                        const name =
                            roomName.textContent
                                .toLowerCase();


                        if (
                            name.includes(searchValue)
                        ) {

                            room.style.display = "";

                        } else {

                            room.style.display = "none";
                        }
                    }
                );
            }
        );
    }
);

