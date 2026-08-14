// ========================================
// KTV MONITORING SYSTEM
// ACTIVITY LOG
// ========================================

const ACTIVITY_STORAGE_KEY = "ktvActivityLog";


// ========================================
// GET LOG
// ========================================

function getActivityLog() {

    const saved =
        localStorage.getItem(
            ACTIVITY_STORAGE_KEY
        );


    if (!saved) {
        return [];
    }


    try {

        const activities =
            JSON.parse(saved);


        if (!Array.isArray(activities)) {
            return [];
        }


        return activities;

    } catch (error) {

        console.error(
            "Activity log loading error:",
            error
        );

        return [];
    }
}


// ========================================
// SAVE LOG
// ========================================

function saveActivityLog(
    activities
) {

    localStorage.setItem(
        ACTIVITY_STORAGE_KEY,
        JSON.stringify(
            activities
        )
    );
}


// ========================================
// ADD ACTIVITY
// ========================================

function addActivity(
    type,
    message
) {

    const activities =
        getActivityLog();


    activities.unshift({

        type: type,

        message: message,

        time:
            new Date().toISOString()

    });


    // Keep only latest 200 records

    if (
        activities.length > 200
    ) {

        activities.length = 200;
    }


    saveActivityLog(
        activities
    );
}


// ========================================
// TIME AGO
// ========================================

function formatTimeAgo(
    timestamp
) {

    const date =
        new Date(timestamp);


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return "Unknown time";
    }


    const difference =
        Math.floor(
            (
                Date.now() -
                date.getTime()
            ) / 1000
        );


    if (
        difference < 10
    ) {

        return "Just now";
    }


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
                    ? " minute ago"
                    : " minutes ago"
            )
        );
    }


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


    const days =
        Math.floor(
            hours / 24
        );


    return (
        days +
        (
            days === 1
                ? " day ago"
                : " days ago"
        )
    );
}


// ========================================
// ACTIVITY ICON
// ========================================

function getActivityIcon(
    type
) {

    switch (type) {

        case "red":

            return "fa-stopwatch";


        case "orange":

            return "fa-clock";


        case "green":

            return "fa-check";


        case "purple":

            return "fa-bell";


        case "blue":

            return "fa-play";


        default:

            return "fa-info";
    }
}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(
    text
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text ?? "";


    return div.innerHTML;
}


// ========================================
// RENDER ACTIVITY LOG
// ========================================

function renderActivityLog() {

    const activityCard =
        document.querySelector(
            ".activity-card"
        );


    if (!activityCard) {

        console.warn(
            "Activity card was not found."
        );

        return;
    }


    const activities =
        getActivityLog();


    activityCard.innerHTML =
        "";


    // ====================================
    // NO ACTIVITY
    // ====================================

    if (
        activities.length === 0
    ) {

        activityCard.innerHTML = `

            <div class="activity-item">

                <div class="activity-icon blue">

                    <i class="fa-solid fa-info"></i>

                </div>


                <div class="activity-info">

                    <div class="activity-title">

                        No activity recorded yet.

                    </div>


                    <div class="activity-time">

                        Just now

                    </div>

                </div>

            </div>

        `;


        return;
    }


    // ====================================
    // DISPLAY ACTIVITIES
    // ====================================

    activities.forEach(
        function(activity) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "activity-item";


            const allowedColors = [

                "blue",
                "red",
                "orange",
                "green",
                "purple"

            ];


            const color =
                allowedColors.includes(
                    activity.type
                )
                    ? activity.type
                    : "blue";


            const icon =
                getActivityIcon(
                    activity.type
                );


            item.innerHTML = `

                <div class="activity-icon ${color}">

                    <i class="fa-solid ${icon}"></i>

                </div>


                <div class="activity-info">

                    <div class="activity-title">

                        ${escapeHTML(
                            activity.message
                        )}

                    </div>


                    <div class="activity-time">

                        ${formatTimeAgo(
                            activity.time
                        )}

                    </div>

                </div>

            `;


            activityCard.appendChild(
                item
            );

        }
    );
}


// ========================================
// PAGE LOAD
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        renderActivityLog();


        // Refresh relative timestamps

        setInterval(
            function() {

                renderActivityLog();

            },
            30000
        );

    }
);