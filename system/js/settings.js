const SETTINGS_KEY = "ktvSettings";

const defaultSettings = {
    establishmentName: "KTV Monitoring System",
    operatorName: "",
    roomCount: 17,
    defaultDuration: 2,
    warningTime: 10,
    soundPager: true,
    visualIndicator: true,
    browserNotifications: true,
    darkMode: false
};


// ==========================================
// GET SETTINGS
// ==========================================

function getSettings() {

    const saved = localStorage.getItem(SETTINGS_KEY);

    if (!saved) {
        return {
            ...defaultSettings
        };
    }

    try {

        return {
            ...defaultSettings,
            ...JSON.parse(saved)
        };

    } catch (error) {

        console.error(
            "Settings loading error:",
            error
        );

        return {
            ...defaultSettings
        };
    }

}


// ==========================================
// APPLY THEME
// ==========================================

function applyTheme() {

    const settings = getSettings();

    document.documentElement.classList.toggle(
        "dark-mode",
        settings.darkMode === true
    );

}


// ==========================================
// SETTINGS PAGE
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        applyTheme();


        // ======================================
        // DATE
        // ======================================

        const currentDate =
            document.getElementById(
                "currentDate"
            );


        if (currentDate) {

            const today =
                new Date();


            currentDate.textContent =
                today.toLocaleDateString(
                    "en-US",
                    {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    }
                );

        }


        // ======================================
        // INPUTS
        // ======================================

        const establishmentName =
            document.getElementById(
                "establishmentName"
            );


        const operatorName =
            document.getElementById(
                "operatorName"
            );


        const roomCount =
            document.getElementById(
                "roomCount"
            );


        const defaultDuration =
            document.getElementById(
                "defaultDuration"
            );


        const warningTime =
            document.getElementById(
                "warningTime"
            );


        const soundPager =
            document.getElementById(
                "soundPager"
            );


        const visualIndicator =
            document.getElementById(
                "visualIndicator"
            );


        const browserNotifications =
            document.getElementById(
                "browserNotifications"
            );


        const darkMode =
            document.getElementById(
                "darkMode"
            );


        const saveMessage =
            document.getElementById(
                "saveMessage"
            );


        // Stop if this is not the Settings page

        if (!establishmentName) {
            return;
        }


        // ======================================
        // LOAD SAVED SETTINGS
        // ======================================

        const settings =
            getSettings();


        establishmentName.value =
            settings.establishmentName;


        operatorName.value =
            settings.operatorName;


        roomCount.value =
            settings.roomCount;


        defaultDuration.value =
            settings.defaultDuration;


        warningTime.value =
            settings.warningTime;


        soundPager.checked =
            settings.soundPager;


        visualIndicator.checked =
            settings.visualIndicator;


        browserNotifications.checked =
            settings.browserNotifications;


        darkMode.checked =
            settings.darkMode;


        // ======================================
        // LIVE DARK MODE
        // ======================================

        darkMode.addEventListener(
            "change",
            function () {

                document.documentElement.classList.toggle(
                    "dark-mode",
                    darkMode.checked
                );

            }
        );


        // ======================================
        // SAVE SETTINGS
        // ======================================

        window.saveSettings =
            function () {

                const rooms =
                    Number(
                        roomCount.value
                    );


                if (
                    rooms < 1 ||
                    rooms > 17
                ) {

                    alert(
                        "The number of KTV rooms must be between 1 and 17."
                    );

                    return;

                }


                const newSettings = {

                    establishmentName:
                        establishmentName.value.trim(),

                    operatorName:
                        operatorName.value.trim(),

                    roomCount:
                        rooms,

                    defaultDuration:
                        Number(
                            defaultDuration.value
                        ),

                    warningTime:
                        Number(
                            warningTime.value
                        ),

                    soundPager:
                        soundPager.checked,

                    visualIndicator:
                        visualIndicator.checked,

                    browserNotifications:
                        browserNotifications.checked,

                    darkMode:
                        darkMode.checked

                };


                // SAVE TO LOCAL STORAGE

                localStorage.setItem(
                    SETTINGS_KEY,
                    JSON.stringify(
                        newSettings
                    )
                );


                // APPLY IMMEDIATELY

                applyTheme();


                // SHOW SAVE MESSAGE

                if (saveMessage) {

                    saveMessage.classList.add(
                        "show"
                    );


                    setTimeout(
                        function () {

                            saveMessage.classList.remove(
                                "show"
                            );

                        },
                        3000
                    );

                }

            };


        // ======================================
        // RESET SETTINGS
        // ======================================

        window.resetSettings =
            function () {

                const confirmation =
                    confirm(
                        "Reset all settings to default?"
                    );


                if (!confirmation) {
                    return;
                }


                localStorage.setItem(
                    SETTINGS_KEY,
                    JSON.stringify(
                        defaultSettings
                    )
                );


                establishmentName.value =
                    defaultSettings.establishmentName;


                operatorName.value =
                    defaultSettings.operatorName;


                roomCount.value =
                    defaultSettings.roomCount;


                defaultDuration.value =
                    defaultSettings.defaultDuration;


                warningTime.value =
                    defaultSettings.warningTime;


                soundPager.checked =
                    defaultSettings.soundPager;


                visualIndicator.checked =
                    defaultSettings.visualIndicator;


                browserNotifications.checked =
                    defaultSettings.browserNotifications;


                darkMode.checked =
                    defaultSettings.darkMode;


                applyTheme();


                if (saveMessage) {

                    saveMessage.classList.add(
                        "show"
                    );


                    setTimeout(
                        function () {

                            saveMessage.classList.remove(
                                "show"
                            );

                        },
                        3000
                    );

                }

            };

    }
);