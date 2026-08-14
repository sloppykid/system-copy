// ========================================
// KTV MONITORING SYSTEM
// NOTIFICATIONS SYSTEM
// ========================================

const NOTIFICATION_STORAGE_KEY =
    "ktvNotifications";


// ========================================
// PAGE LOAD
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadNotifications();

        setupClearNotifications();

    }
);


// ========================================
// GET STORED NOTIFICATIONS
// ========================================

function getStoredNotifications() {

    const saved =
        localStorage.getItem(
            NOTIFICATION_STORAGE_KEY
        );


    if (!saved) {

        return [];

    }


    try {

        const notifications =
            JSON.parse(saved);


        if (
            !Array.isArray(
                notifications
            )
        ) {

            return [];

        }


        return notifications;

    }

    catch (error) {

        console.error(
            "Unable to load notifications:",
            error
        );

        return [];

    }

}


// ========================================
// SAVE NOTIFICATIONS
// ========================================

function saveNotifications(
    notifications
) {

    localStorage.setItem(

        NOTIFICATION_STORAGE_KEY,

        JSON.stringify(
            notifications
        )

    );

}


// ========================================
// LOAD NOTIFICATIONS
// ========================================

function loadNotifications() {

    const notificationList =
        document.getElementById(
            "notificationList"
        );


    const notificationCount =
        document.getElementById(
            "notificationCount"
        );


    if (!notificationList) {

        console.error(
            "notificationList element was not found."
        );

        return;

    }


    const notifications =
        getStoredNotifications();


    // ====================================
    // CLEAR CURRENT DISPLAY
    // ====================================

    notificationList.innerHTML =
        "";


    // ====================================
    // UPDATE COUNT
    // ====================================

    if (notificationCount) {

        notificationCount.textContent =
            notifications.length +
            (
                notifications.length === 1
                    ? " total alert"
                    : " total alerts"
            );

    }


    // ====================================
    // NO NOTIFICATIONS
    // ====================================

    if (
        notifications.length === 0
    ) {

        showEmptyState(
            notificationList
        );

        return;

    }


    // ====================================
    // SHOW ALL NOTIFICATIONS
    //
    // IMPORTANT:
    // Staff and Admin both see ALL
    // notifications.
    // ====================================

    notifications.forEach(

        function (
            notification
        ) {

            renderNotification(
                notificationList,
                notification
            );

        }

    );

}


// ========================================
// RENDER NOTIFICATION
// ========================================

function renderNotification(
    notificationList,
    notification
) {

    const card =
        document.createElement(
            "div"
        );


    const type =
        normalizeNotificationType(
            notification.type
        );


    card.className =
        "notification-card " +
        type;


    // ====================================
    // ICON
    // ====================================

    let icon =
        "fa-circle-info";


    if (
        type === "success"
    ) {

        icon =
            "fa-check";

    }

    else if (
        type === "warning"
    ) {

        icon =
            "fa-triangle-exclamation";

    }

    else if (
        type === "error"
    ) {

        icon =
            "fa-xmark";

    }

    else if (
        type === "info"
    ) {

        icon =
            "fa-circle-info";

    }


    // ====================================
    // TIME
    // ====================================

    const time =
        formatNotificationTime(
            notification.time
        );


    // ====================================
    // MESSAGE
    // ====================================

    let message =
        notification.message ||
        "Notification";


    /*
     * Make the normal room-available
     * message clearer.
     *
     * Existing records that say:
     *
     * "Room 1 is now available."
     *
     * will display as:
     *
     * "Room 1 session ended. Room is now available."
     *
     * This does NOT modify the stored data.
     */

    if (
        /^Room\s+\d+\s+is now available\.?$/i
            .test(
                message.trim()
            )
    ) {

        const roomMatch =
            message.match(
                /Room\s+(\d+)/i
            );


        if (roomMatch) {

            message =
                "Room " +
                roomMatch[1] +
                " session ended. " +
                "Room is now available.";

        }

    }


    // ====================================
    // BUILD CARD
    // ====================================

    card.innerHTML = `

        <div class="notification-icon">

            <i class="fas ${icon}"></i>

        </div>


        <div class="notification-content">

            <div class="notification-info">

                <span class="notification-type">

                    ${capitalizeFirstLetter(type)}

                </span>


                <span class="notification-time">

                    ${time}

                </span>

            </div>


            <p>
                ${escapeHTML(message)}
            </p>

        </div>

    `;


    // ====================================
    // ADD TO PAGE
    // ====================================

    notificationList.appendChild(
        card
    );

}


// ========================================
// NORMALIZE NOTIFICATION TYPE
// ========================================

function normalizeNotificationType(
    type
) {

    const validTypes = [

        "success",
        "warning",
        "error",
        "info"

    ];


    const normalized =
        String(
            type || "info"
        )
        .toLowerCase()
        .trim();


    if (
        validTypes.includes(
            normalized
        )
    ) {

        return normalized;

    }


    return "info";

}


// ========================================
// FORMAT NOTIFICATION TIME
// ========================================

function formatNotificationTime(
    timestamp
) {

    if (!timestamp) {

        return "Just now";

    }


    const date =
        new Date(
            timestamp
        );


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return "Just now";

    }


    const now =
        new Date();


    const difference =
        Math.floor(

            (
                now.getTime() -
                date.getTime()
            ) / 1000

        );


    // ====================================
    // JUST NOW
    // ====================================

    if (
        difference < 10
    ) {

        return "Just now";

    }


    // ====================================
    // SECONDS
    // ====================================

    if (
        difference < 60
    ) {

        return (
            difference +
            (
                difference === 1
                    ? " second ago"
                    : " seconds ago"
            )
        );

    }


    // ====================================
    // MINUTES
    // ====================================

    const minutes =
        Math.floor(
            difference / 60
        );


    if (
        minutes < 60
    ) {

        return (
            minutes +
            (
                minutes === 1
                    ? " min ago"
                    : " mins ago"
            )
        );

    }


    // ====================================
    // HOURS
    // ====================================

    const hours =
        Math.floor(
            minutes / 60
        );


    if (
        hours < 24
    ) {

        return (
            hours +
            (
                hours === 1
                    ? " hour ago"
                    : " hours ago"
            )
        );

    }


    // ====================================
    // DAYS
    // ====================================

    const days =
        Math.floor(
            hours / 24
        );


    if (
        days < 7
    ) {

        return (
            days +
            (
                days === 1
                    ? " day ago"
                    : " days ago"
            )
        );

    }


    // ====================================
    // OLDER
    // ====================================

    return date.toLocaleDateString(

        undefined,

        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }

    );

}


// ========================================
// EMPTY STATE
// ========================================

function showEmptyState(
    notificationList
) {

    const empty =
        document.createElement(
            "div"
        );


    empty.className =
        "notification-empty";


    empty.innerHTML = `

        <div class="notification-icon">

            <i class="fas fa-bell-slash"></i>

        </div>


        <div>

            <p>
                No notifications available.
            </p>

        </div>

    `;


    notificationList.appendChild(
        empty
    );

}


// ========================================
// CLEAR NOTIFICATIONS
// ========================================

function setupClearNotifications() {

    const clearButton =
        document.getElementById(
            "clearNotificationsBtn"
        );


    if (!clearButton) {

        console.warn(
            "Clear Notifications button was not found."
        );

        return;

    }


    /*
     * Prevent duplicate event listeners
     * if this function is called again.
     */

    if (
        clearButton.dataset
            .notificationReady ===
        "true"
    ) {

        return;

    }


    clearButton.dataset
        .notificationReady =
        "true";


    clearButton.addEventListener(

        "click",

        function () {

            const notifications =
                getStoredNotifications();


            // =================================
            // NOTHING TO CLEAR
            // =================================

            if (
                notifications.length === 0
            ) {

                alert(
                    "There are no notifications to clear."
                );

                return;

            }


            // =================================
            // CONFIRM
            // =================================

            const confirmed =
                confirm(

                    "Are you sure you want to clear all notifications?"

                );


            if (!confirmed) {

                return;

            }


            // =================================
            // CLEAR STORAGE
            // =================================

            saveNotifications(
                []
            );


            // =================================
            // REFRESH DISPLAY
            // =================================

            loadNotifications();


            alert(
                "Notifications cleared successfully."
            );

        }

    );

}


// ========================================
// ADD NOTIFICATION
//
// This function can also be used by
// other JavaScript files if needed.
// ========================================

function addNotification(
    type,
    message
) {

    const notifications =
        getStoredNotifications();


    notifications.unshift({

        type:
            normalizeNotificationType(
                type
            ),

        message:
            String(
                message || ""
            ),

        time:
            new Date().toISOString(),

        uniqueKey:
            null

    });


    // Keep maximum 100 stored notifications.

    if (
        notifications.length > 100
    ) {

        notifications.splice(
            100
        );

    }


    saveNotifications(
        notifications
    );


    loadNotifications();

}


// ========================================
// SUCCESS
// ========================================

function showSuccess(
    message
) {

    addNotification(
        "success",
        message
    );

}


// ========================================
// WARNING
// ========================================

function showWarning(
    message
) {

    addNotification(
        "warning",
        message
    );

}


// ========================================
// ERROR
// ========================================

function showError(
    message
) {

    addNotification(
        "error",
        message
    );

}


// ========================================
// INFO
// ========================================

function showInfo(
    message
) {

    addNotification(
        "info",
        message
    );

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(
            value
        );


    return div.innerHTML;

}


// ========================================
// CAPITALIZE FIRST LETTER
// ========================================

function capitalizeFirstLetter(
    text
) {

    if (!text) {

        return "";

    }


    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );

}