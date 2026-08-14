// ========================================
// KTV MONITORING SYSTEM
// AUTHENTICATION & ROLE CONTROL
// ========================================


// ========================================
// STORAGE KEYS
// ========================================

const KTV_ROLE_KEY =
    "ktvUserRole";

const KTV_USERNAME_KEY =
    "ktvUsername";

const KTV_DISPLAY_NAME_KEY =
    "ktvDisplayName";


// ========================================
// GET CURRENT USER
// ========================================

function getCurrentUser() {

    const role =
        localStorage.getItem(KTV_ROLE_KEY) ||
        sessionStorage.getItem(KTV_ROLE_KEY);

    const username =
        localStorage.getItem(KTV_USERNAME_KEY) ||
        sessionStorage.getItem(KTV_USERNAME_KEY);

    const displayName =
        localStorage.getItem(KTV_DISPLAY_NAME_KEY) ||
        sessionStorage.getItem(KTV_DISPLAY_NAME_KEY);


    if (!role) {

        return null;

    }


    return {

        role:
            role.toLowerCase(),

        username:
            username || "",

        displayName:
            displayName || ""

    };

}


// ========================================
// GET ROLE
// ========================================

function getUserRole() {

    const user =
        getCurrentUser();


    if (!user) {

        return null;

    }


    return user.role;

}


// ========================================
// CHECK ADMIN
// ========================================

function isAdmin() {

    return (
        getUserRole() ===
        "admin"
    );

}


// ========================================
// CHECK STAFF
// ========================================

function isStaff() {

    return (
        getUserRole() ===
        "staff"
    );

}


// ========================================
// PAGE PERMISSIONS
// ========================================

const PAGE_PERMISSIONS = {

    "dashboard.html": [
        "staff",
        "admin"
    ],

    "room.html": [
        "staff",
        "admin"
    ],

    "notifications.html": [
        "staff",
        "admin"
    ],

    "activitylog.html": [
        "admin"
    ],

    "reports.html": [
        "admin"
    ],

    "daily-summary.html": [
        "admin"
    ],

    "settings.html": [
        "admin"
    ]

};


// ========================================
// GET CURRENT PAGE
// ========================================

function getCurrentPage() {

    let path =
        window.location.pathname;


    let page =
        path.split("/").pop();


    if (!page) {

        page =
            "dashboard.html";

    }


    return page.toLowerCase();

}


// ========================================
// PROTECT PAGE
// ========================================

function protectPage() {

    const page =
        getCurrentPage();


    // Login does not need protection

    if (
        page === "login.html" ||
        page === ""
    ) {

        return;

    }


    const user =
        getCurrentUser();


    // No logged-in user

    if (!user) {

        window.location.replace(
            "login.html"
        );

        return;

    }


    // Get permissions for page

    const allowedRoles =
        PAGE_PERMISSIONS[page];


    // Page isn't role restricted

    if (!allowedRoles) {

        return;

    }


    // User doesn't have permission

    if (
        !allowedRoles.includes(
            user.role
        )
    ) {

        window.location.replace(
            "dashboard.html"
        );

    }

}


// ========================================
// HIDE RESTRICTED SIDEBAR LINKS
// ========================================

function hideRestrictedLink(
    selector,
    role
) {

    const links =
        document.querySelectorAll(
            selector
        );


    links.forEach(
        function (link) {

            if (role !== "admin") {

                /*
                 * IMPORTANT:
                 *
                 * Some pages use:
                 *
                 * <ul>
                 *   <li>
                 *     <a>
                 *
                 * Other pages use:
                 *
                 * <nav>
                 *   <a>
                 *
                 * If there is an <li>, hide
                 * the <li>.
                 *
                 * Otherwise hide ONLY the
                 * link itself.
                 */

                const listItem =
                    link.closest("li");


                if (listItem) {

                    listItem.style.display =
                        "none";

                }
                else {

                    link.style.display =
                        "none";

                }

            }
            else {

                // Admin sees the link

                link.style.display =
                    "";

                const listItem =
                    link.closest("li");


                if (listItem) {

                    listItem.style.display =
                        "";

                }

            }

        }
    );

}


// ========================================
// APPLY ROLE PERMISSIONS
// ========================================

function applyRolePermissions() {

    const user =
        getCurrentUser();


    if (!user) {

        return;

    }


    const role =
        user.role;


    // ====================================
    // ACTIVITY LOG
    // ====================================

    hideRestrictedLink(
        'a[href$="activitylog.html"]',
        role
    );


    // ====================================
    // REPORTS
    // ====================================

    hideRestrictedLink(
        'a[href$="reports.html"]',
        role
    );


    // ====================================
    // DAILY SUMMARY
    // ====================================

    hideRestrictedLink(
        'a[href$="daily-summary.html"],' +
        'a[href$="dailysummary.html"]',
        role
    );


    // ====================================
    // SETTINGS
    // ====================================

    hideRestrictedLink(
        'a[href$="settings.html"]',
        role
    );


    // ====================================
    // USER NAME
    // ====================================

    const userNameElements =
        document.querySelectorAll(
            "[data-user-name]"
        );


    userNameElements.forEach(
        function (element) {

            element.textContent =
                user.displayName ||
                user.username;

        }
    );


    // ====================================
    // USER ROLE
    // ====================================

    const roleElements =
        document.querySelectorAll(
            "[data-user-role]"
        );


    roleElements.forEach(
        function (element) {

            element.textContent =
                role === "admin"
                    ? "Administrator"
                    : "Staff";

        }
    );

}


// ========================================
// LOGOUT
// ========================================

function logoutUser() {

    localStorage.removeItem(
        KTV_ROLE_KEY
    );

    localStorage.removeItem(
        KTV_USERNAME_KEY
    );

    localStorage.removeItem(
        KTV_DISPLAY_NAME_KEY
    );


    sessionStorage.removeItem(
        KTV_ROLE_KEY
    );

    sessionStorage.removeItem(
        KTV_USERNAME_KEY
    );

    sessionStorage.removeItem(
        KTV_DISPLAY_NAME_KEY
    );


    window.location.replace(
        "login.html"
    );

}


// ========================================
// INITIALIZE
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        protectPage();

        applyRolePermissions();

    }
);