// ==========================================
// GLOBAL THEME
// ==========================================

(function () {

    const SETTINGS_KEY = "ktvSettings";

    function applyTheme() {

        let darkMode = false;

        const savedSettings =
            localStorage.getItem(SETTINGS_KEY);

        if (savedSettings) {

            try {

                const settings =
                    JSON.parse(savedSettings);

                darkMode = settings.darkMode === true;

            } catch (error) {

                darkMode = false;

            }

        }

        document.documentElement.classList.toggle(
            "dark-mode",
            darkMode
        );
    }

    // Apply theme immediately
    applyTheme();

})();