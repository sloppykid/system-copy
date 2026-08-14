// ========================================
// KTV MONITORING SYSTEM
// LOGIN & ROLE MANAGEMENT
// ========================================


// ========================================
// ELEMENTS
// ========================================

const loginForm =
    document.getElementById(
        "loginForm"
    );


const errorMessage =
    document.getElementById(
        "error"
    );


const usernameInput =
    document.getElementById(
        "username"
    );


const passwordInput =
    document.getElementById(
        "password"
    );


const rememberInput =
    document.getElementById(
        "remember"
    );


// ========================================
// USER ACCOUNTS
// ========================================
//
// These are temporary local accounts
// for the current front-end system.
//
// Admin:
// username = admin
// password = admin123
//
// Staff:
// username = staff
// password = staff123
//
// ========================================

const USERS = [

    {
        username: "admin",
        password: "admin123",
        role: "admin",
        displayName: "Administrator"
    },

    {
        username: "staff",
        password: "staff123",
        role: "staff",
        displayName: "Staff"
    }

];


// ========================================
// STORAGE KEYS
// ========================================

const ROLE_KEY =
    "ktvUserRole";


const USERNAME_KEY =
    "ktvUsername";


const DISPLAY_NAME_KEY =
    "ktvDisplayName";


// ========================================
// CLEAR OLD LOGIN
// ========================================

function clearLoginData() {

    localStorage.removeItem(
        ROLE_KEY
    );

    localStorage.removeItem(
        USERNAME_KEY
    );

    localStorage.removeItem(
        DISPLAY_NAME_KEY
    );


    sessionStorage.removeItem(
        ROLE_KEY
    );

    sessionStorage.removeItem(
        USERNAME_KEY
    );

    sessionStorage.removeItem(
        DISPLAY_NAME_KEY
    );
}


// ========================================
// SAVE LOGIN DATA
// ========================================

function saveLoginData(
    user
) {

    const storage =
        rememberInput &&
        rememberInput.checked
            ? localStorage
            : sessionStorage;


    storage.setItem(
        ROLE_KEY,
        user.role
    );


    storage.setItem(
        USERNAME_KEY,
        user.username
    );


    storage.setItem(
        DISPLAY_NAME_KEY,
        user.displayName
    );
}


// ========================================
// LOGIN
// ========================================

loginForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const username =
            usernameInput
                .value
                .trim()
                .toLowerCase();


        const password =
            passwordInput
                .value
                .trim();


        // ====================================
        // CLEAR PREVIOUS MESSAGE
        // ====================================

        errorMessage.textContent =
            "";


        errorMessage.style.color =
            "#d93025";


        // ====================================
        // FIND USER
        // ====================================

        const user =
            USERS.find(
                function(account) {

                    return (
                        account.username ===
                        username &&

                        account.password ===
                        password
                    );

                }
            );


        // ====================================
        // INVALID LOGIN
        // ====================================

        if (!user) {

            errorMessage.textContent =
                "Invalid username or password.";


            passwordInput.value =
                "";


            passwordInput.focus();


            return;
        }


        // ====================================
        // CLEAR OLD SESSION
        // ====================================

        clearLoginData();


        // ====================================
        // SAVE CURRENT USER
        // ====================================

        saveLoginData(
            user
        );


        // ====================================
        // SUCCESS MESSAGE
        // ====================================

        errorMessage.style.color =
            "#28a745";


        errorMessage.textContent =
            "Login successful!";


        // ====================================
        // REDIRECT
        // ====================================

        setTimeout(
            function() {

                window.location.href =
                    "dashboard.html";

            },
            500
        );

    }
);