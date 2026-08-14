// ========================================
// KTV MONITORING SYSTEM
// DASHBOARD
// ========================================


// ========================================
// SETTINGS
// ========================================

const ROOM_STORAGE_KEY =
    "ktvRoomData";

const ROOM_CONFIG_STORAGE_KEY =
    "ktvRoomConfig";

const FIRST_ROOM = 1;

const DEFAULT_LAST_ROOM = 17;

const ROOM_MANAGEMENT_MAX = 50;


// ========================================
// DASHBOARD DATE
// ========================================

function updateDashboardDate() {

    const dateElement =
        document.getElementById(
            "date"
        );


    if (!dateElement) {

        return;

    }


    const today =
        new Date();


    dateElement.textContent =
        today.toLocaleDateString(
            "en-PH",
            {
                weekday:
                    "long",

                year:
                    "numeric",

                month:
                    "long",

                day:
                    "numeric"
            }
        );

}



// ========================================
// GET ROOM DATA
// ========================================

function getDashboardRoomData() {

    const savedData =
        localStorage.getItem(
            ROOM_STORAGE_KEY
        );


    if (!savedData) {

        return {};

    }


    try {

        return JSON.parse(
            savedData
        );

    }

    catch (error) {

        console.error(
            "Dashboard room data error:",
            error
        );

        return {};

    }

}



// ========================================
// GET ROOM CONFIGURATION
// ========================================

function getDashboardRoomConfigs() {

    const savedConfig =
        localStorage.getItem(
            ROOM_CONFIG_STORAGE_KEY
        );

    if (!savedConfig) {
        return {};
    }

    try {
        return JSON.parse(
            savedConfig
        );
    } catch (error) {
        console.error(
            "Dashboard room configuration error:",
            error
        );

        return {};
    }
}


// ========================================
// GET ALL MANAGED ROOM NUMBERS
// ========================================

function getDashboardRoomNumbers(rooms) {

    const numbers =
        Object.keys(rooms || {})
            .map(Number)
            .filter(function (number) {
                return (
                    Number.isInteger(number) &&
                    number >= FIRST_ROOM &&
                    number <= ROOM_MANAGEMENT_MAX
                );
            });

    // Keep the original 17 rooms present even if
    // the stored data is temporarily incomplete.
    for (
        let roomNumber = FIRST_ROOM;
        roomNumber <= DEFAULT_LAST_ROOM;
        roomNumber++
    ) {

        if (!numbers.includes(roomNumber)) {
            numbers.push(roomNumber);
        }
    }

    return numbers.sort(
        function (a, b) {
            return a - b;
        }
    );
}


function getDashboardRoomConfig(roomNumber) {

    const configs =
        getDashboardRoomConfigs();

    return (
        configs[String(roomNumber)] ||
        {
            name: "",
            type: "regular",
            description: ""
        }
    );
}


// ========================================
// GET WARNING TIME
// ========================================

function getWarningSeconds() {

    const savedSettings =
        localStorage.getItem(
            "ktvSettings"
        );


    const defaultWarning =
        10;


    if (!savedSettings) {

        return (
            defaultWarning *
            60
        );

    }


    try {

        const settings =
            JSON.parse(
                savedSettings
            );


        const warningMinutes =
            Number(
                settings.warningTime
            );


        if (
            !isNaN(
                warningMinutes
            )
            &&
            warningMinutes >= 0
        ) {

            return (
                warningMinutes *
                60
            );

        }

    }

    catch (error) {

        console.error(
            "Dashboard settings error:",
            error
        );

    }


    return (
        defaultWarning *
        60
    );

}



// ========================================
// CALCULATE LIVE REMAINING TIME
// ========================================

function getRemainingTime(
    room
) {

    if (!room) {

        return 0;

    }


    /*
     * endTime is the most accurate value.
     */

    if (
        room.endTime
    ) {

        return Math.max(

            0,

            Math.ceil(

                (
                    Number(
                        room.endTime
                    )
                    -
                    Date.now()

                ) / 1000

            )

        );

    }


    /*
     * Fallback to saved remaining time.
     */

    return Math.max(

        0,

        Number(
            room.remaining
        ) || 0

    );

}



// ========================================
// DETERMINE LIVE STATUS
// ========================================

function getLiveStatus(
    room
) {

    if (!room) {

        return "available";

    }


    /*
     * If Room JS says the room is available,
     * Dashboard also treats it as available.
     */

    if (
        room.status ===
        "available"
    ) {

        return "available";

    }


    /*
     * If there is an active session,
     * calculate the timer ourselves.
     */

    const remaining =
        getRemainingTime(
            room
        );


    /*
     * Expired
     */

    if (
        remaining <= 0
    ) {

        return "expired";

    }


    /*
     * Expiring Soon
     */

    if (
        remaining <=
        getWarningSeconds()
    ) {

        return "warning";

    }


    /*
     * Normal active session
     */

    return "occupied";

}



// ========================================
// FORMAT TIMER
// ========================================

function formatTime(
    totalSeconds
) {

    totalSeconds =
        Math.max(

            0,

            Math.floor(
                Number(
                    totalSeconds
                ) || 0
            )

        );


    const hours =
        Math.floor(
            totalSeconds /
            3600
        );


    const minutes =
        Math.floor(

            (
                totalSeconds %
                3600

            ) / 60

        );


    const seconds =
        totalSeconds %
        60;


    return (

        String(
            hours
        ).padStart(
            2,
            "0"
        )

        +

        ":" +

        String(
            minutes
        ).padStart(
            2,
            "0"
        )

        +

        ":" +

        String(
            seconds
        ).padStart(
            2,
            "0"
        )

    );

}



// ========================================
// DISPLAY ROOM NUMBER
// ========================================
//
// Internal:
// 101 = Room 1
// 102 = Room 2
// ...
// 117 = Room 17
//
// This keeps your actual Room JS untouched.
// ========================================

function displayRoomNumber(
    roomNumber
) {

    return Number(
        roomNumber
    );

}



// ========================================
// CREATE ROOM CARD
// ========================================

function createDashboardRoomCard(
    roomNumber,
    roomData,
    status
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "room " +
        status;


    const visibleRoomNumber =
        displayRoomNumber(
            roomNumber
        );

    const roomConfig =
        getDashboardRoomConfig(
            roomNumber
        );

    const roomName =
        roomConfig.name &&
        roomConfig.name.trim()
            ? roomConfig.name.trim()
            : "Room " + visibleRoomNumber;

    const roomTypeLabel =
        roomConfig.type === "vip"
            ? "VIP"
            : "Regular";


    let icon =
        "fa-solid fa-door-open";


    let statusText =
        "Available";


    let message =
        "Available";


    // ====================================
    // OCCUPIED
    // ====================================

    if (
        status ===
        "occupied"
    ) {

        icon =
            "fa-solid fa-microphone";


        statusText =
            "Occupied";


        message =
            "Time Remaining - " +
            formatTime(
                getRemainingTime(
                    roomData
                )
            );

    }


    // ====================================
    // WARNING
    // ====================================

    else if (
        status ===
        "warning"
    ) {

        icon =
            "fa-solid fa-clock";


        statusText =
            "Expiring Soon";


        message =
            "Time Remaining - " +
            formatTime(
                getRemainingTime(
                    roomData
                )
            );

    }


    // ====================================
    // EXPIRED
    // ====================================

    else if (
        status ===
        "expired"
    ) {

        icon =
            "fa-solid fa-triangle-exclamation";


        statusText =
            "Expired";


        message =
            "Session has expired";

    }


    // ====================================
    // CARD
    // ====================================

    card.innerHTML = `

        <div class="room-top">

            <div class="room-icon">

                <i class="${icon}"></i>

            </div>


            <span class="status-badge">

                ${statusText}

            </span>

        </div>


        <h3>
            ${roomName}
        </h3>


        <p>
            ${message}
        </p>

        <small class="dashboard-room-type">
            ${roomTypeLabel}
        </small>

    `;


    return card;

}



// ========================================
// UPDATE STATISTICS
// ========================================

function updateDashboardStatistics(
    rooms
) {

    let occupied =
        0;

    let available =
        0;

    let expiring =
        0;


    const roomNumbers =
        getDashboardRoomNumbers(
            rooms
        );


    roomNumbers.forEach(
        function (roomNumber) {

            const room =
                rooms[
                    roomNumber
                ];


        const status =
            getLiveStatus(
                room
            );


        if (
            status ===
            "occupied"
        ) {

            occupied++;

        }


        else if (
            status ===
            "warning"
        ) {

            occupied++;

            expiring++;

        }


        else if (
            status ===
            "available"
        ) {

            available++;

        }


            /*
             * Expired rooms are not counted
             * as available until staff clears
             * the session from the Room page.
             */

        }
    );


    const totalElement =
        document.getElementById(
            "totalRooms"
        );


    const occupiedElement =
        document.getElementById(
            "occupiedRooms"
        );


    const availableElement =
        document.getElementById(
            "availableRooms"
        );


    const expiringElement =
        document.getElementById(
            "expiringRooms"
        );


    if (totalElement) {

        totalElement.textContent =
            roomNumbers.length;

    }


    if (occupiedElement) {

        occupiedElement.textContent =
            occupied;

    }


    if (availableElement) {

        availableElement.textContent =
            available;

    }


    if (expiringElement) {

        expiringElement.textContent =
            expiring;

    }

}



// ========================================
// UPDATE ROOM MONITORING
// ========================================

function updateDashboardRooms(
    rooms
) {

    const grid =
        document.getElementById(
            "dashboardRoomGrid"
        );


    if (!grid) {

        return;

    }


    /*
     * Remove previous cards.
     */

    grid.innerHTML = "";


    let activeCount =
        0;


    // ====================================
    // CHECK ALL 17 ROOMS
    // ====================================

    const roomNumbers =
        getDashboardRoomNumbers(
            rooms
        );


    roomNumbers.forEach(
        function (roomNumber) {

            const room =
                rooms[
                    roomNumber
                ];


            if (!room) {

                return;

            }


        const status =
            getLiveStatus(
                room
            );


        /*
         * Dashboard monitoring should
         * focus on active room.
         *
         * Available rooms aren't shown.
         */

            if (
                status ===
                "available"
            ) {

                return;

            }


        const card =
            createDashboardRoomCard(

                roomNumber,

                room,

                status

            );


        grid.appendChild(
            card
        );


            activeCount++;

        }
    );


    // ====================================
    // NO ACTIVE SESSIONS
    // ====================================

    if (
        activeCount ===
        0
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "dashboard-empty";


        empty.innerHTML = `

            <i class="fa-solid fa-circle-check"></i>

            <h3>
                No Active Sessions
            </h3>

            <p>
                All KTV rooms are currently available.
            </p>

        `;


        grid.appendChild(
            empty
        );

    }

}



// ========================================
// MAIN DASHBOARD UPDATE
// ========================================

function updateDashboard() {

    const rooms =
        getDashboardRoomData();


    updateDashboardStatistics(
        rooms
    );


    updateDashboardRooms(
        rooms
    );

}



// ========================================
// STORAGE EVENT
// ========================================
//
// If Room page changes localStorage in
// another browser tab, Dashboard updates.
// ========================================

window.addEventListener(
    "storage",
    function(event) {

        if (
            event.key ===
            ROOM_STORAGE_KEY
        ) {

            updateDashboard();

        }


        if (
            event.key ===
            "ktvSettings"
        ) {

            updateDashboard();

        }


        if (
            event.key ===
            ROOM_CONFIG_STORAGE_KEY
        ) {

            updateDashboard();

        }

    }
);



// ========================================
// WHEN DASHBOARD BECOMES VISIBLE
// ========================================

document.addEventListener(
    "visibilitychange",
    function() {

        if (
            !document.hidden
        ) {

            updateDashboard();

        }

    }
);



// ========================================
// INITIALIZE
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        updateDashboardDate();


        updateDashboard();


        /*
         * Keep the dashboard timer live.
         */

        setInterval(

            function() {

                updateDashboard();

            },

            1000

        );

    }
);