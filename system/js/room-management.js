/* =========================================================
   KTV ADMIN - ROOM MANAGEMENT
   Add Room / Edit Room / VIP Room Support
   Works alongside the existing room.js
========================================================= */

const ROOM_CONFIG_STORAGE_KEY = "ktvRoomConfig";
const ROOM_MANAGEMENT_MAX = 50;

let roomManagementModal = null;
let editingManagedRoom = null;


/* =========================================================
   ROOM CONFIG
========================================================= */

function getRoomConfigs() {

    const saved =
        localStorage.getItem(
            ROOM_CONFIG_STORAGE_KEY
        );

    if (!saved) {
        return {};
    }

    try {
        return JSON.parse(saved);
    } catch (error) {
        console.error(
            "Room configuration error:",
            error
        );

        return {};
    }
}


function saveRoomConfigs(configs) {

    localStorage.setItem(
        ROOM_CONFIG_STORAGE_KEY,
        JSON.stringify(configs)
    );
}


function getManagedRoomNumbers() {

    const rooms =
        getRoomData();

    return Object.keys(rooms)
        .map(Number)
        .filter(
            function (number) {
                return (
                    Number.isInteger(number) &&
                    number > 0
                );
            }
        )
        .sort(
            function (a, b) {
                return a - b;
            }
        );
}


function ensureRoomConfigs() {

    const configs =
        getRoomConfigs();

    const roomNumbers =
        getManagedRoomNumbers();

    let changed = false;

    roomNumbers.forEach(
        function (roomNumber) {

            const key =
                String(roomNumber);

            if (!configs[key]) {

                configs[key] = {
                    name: "",
                    type: "regular",
                    description: ""
                };

                changed = true;
            } else {

                if (
                    typeof configs[key].name !== "string"
                ) {
                    configs[key].name = "";
                    changed = true;
                }

                if (
                    configs[key].type !== "vip" &&
                    configs[key].type !== "regular"
                ) {
                    configs[key].type = "regular";
                    changed = true;
                }

                if (
                    typeof configs[key].description !== "string"
                ) {
                    configs[key].description = "";
                    changed = true;
                }

            }

        }
    );

    if (changed) {
        saveRoomConfigs(configs);
    }

    return configs;
}


function getRoomConfig(roomNumber) {

    const configs =
        ensureRoomConfigs();

    return (
        configs[String(roomNumber)] ||
        {
            name: "",
            type: "regular",
            description: ""
        }
    );
}


/* =========================================================
   CARD HELPERS
========================================================= */

function getRoomCard(roomNumber) {

    const cards =
        document.querySelectorAll(
            ".room"
        );

    for (
        const card of cards
    ) {

        const title =
            card.querySelector("h3");

        if (!title) {
            continue;
        }

        if (
            title.textContent.trim() ===
            "Room " + roomNumber
        ) {
            return card;
        }

    }

    return null;
}


function decorateRoomCard(roomNumber) {

    const room =
        getRoomCard(roomNumber);

    if (!room) {
        return;
    }

    const config =
        getRoomConfig(roomNumber);

    const title =
        room.querySelector("h3");

    if (!title) {
        return;
    }


    /* -----------------------------------------
       HEADER
    ----------------------------------------- */

    let header =
        room.querySelector(
            ".room-card-header"
        );

    if (!header) {

        header =
            document.createElement(
                "div"
            );

        header.className =
            "room-card-header";

        title.parentNode.insertBefore(
            header,
            title
        );

        header.appendChild(
            title
        );

    }


    /* -----------------------------------------
       HEADER CONTENT
    ----------------------------------------- */

    let headerRight =
        header.querySelector(
            ".room-card-header-right"
        );

    if (!headerRight) {

        headerRight =
            document.createElement(
                "div"
            );

        headerRight.className =
            "room-card-header-right";

        header.appendChild(
            headerRight
        );

    }


    /* -----------------------------------------
       EDIT BUTTON
    ----------------------------------------- */

    let editButton =
        headerRight.querySelector(
            ".room-edit-button"
        );

    if (!editButton) {

        editButton =
            document.createElement(
                "button"
            );

        editButton.type =
            "button";

        editButton.className =
            "room-edit-button";

        editButton.title =
            "Edit room";

        editButton.innerHTML =
            '<i class="fa-solid fa-pen"></i>';

        editButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();
                event.stopPropagation();

                openRoomManagementModal(
                    "edit",
                    roomNumber
                );

            }
        );

        headerRight.appendChild(
            editButton
        );

    }


    /* -----------------------------------------
       DISPLAY NAME
    ----------------------------------------- */

    let nameElement =
        room.querySelector(
            ":scope > .room-display-name"
        );

    if (!nameElement) {

        nameElement =
            document.createElement(
                "div"
            );

        nameElement.className =
            "room-display-name";

        header.insertAdjacentElement(
            "afterend",
            nameElement
        );

    }

    nameElement.textContent =
        config.name || "";


    nameElement.style.display =
        config.name
            ? "block"
            : "none";


    /* -----------------------------------------
       TYPE BADGE
    ----------------------------------------- */

    let badge =
        headerRight.querySelector(
            ".room-type-badge"
        );

    if (!badge) {

        badge =
            document.createElement(
                "span"
            );

        badge.className =
            "room-type-badge";

        headerRight.insertBefore(
            badge,
            editButton
        );

    }

    badge.classList.remove(
        "regular",
        "vip"
    );

    badge.classList.add(
        config.type === "vip"
            ? "vip"
            : "regular"
    );

    badge.textContent =
        config.type === "vip"
            ? "VIP"
            : "Regular";


    /* -----------------------------------------
       DESCRIPTION
    ----------------------------------------- */

    let description =
        room.querySelector(
            ":scope > .room-description"
        );

    if (!description) {

        description =
            document.createElement(
                "div"
            );

        description.className =
            "room-description";

        const status =
            room.querySelector(
                ".status"
            );

        if (status) {

            status.insertAdjacentElement(
                "beforebegin",
                description
            );

        } else {

            room.appendChild(
                description
            );

        }

    }

    description.textContent =
        config.description || "";

    description.style.display =
        config.description
            ? "block"
            : "none";

}


function decorateAllRoomCards() {

    const roomNumbers =
        getManagedRoomNumbers();

    roomNumbers.forEach(
        function (roomNumber) {

            decorateRoomCard(
                roomNumber
            );

        }
    );

}


/* =========================================================
   ADD ROOM CARD
========================================================= */

function createAddRoomCard() {

    let card =
        document.querySelector(
            ".add-room-card"
        );

    if (card) {
        return card;
    }

    card =
        document.createElement(
            "button"
        );

    card.type =
        "button";

    card.className =
        "add-room-card";

    card.innerHTML = `
        <div class="add-room-icon">
            <i class="fa-solid fa-plus"></i>
        </div>

        <strong>
            Add Room
        </strong>

        <span>
            Create another KTV room
        </span>
    `;

    card.addEventListener(
        "click",
        function () {

            openRoomManagementModal(
                "add"
            );

        }
    );

    const grid =
        document.querySelector(
            ".room-grid"
        );

    if (grid) {
        grid.appendChild(card);
    }

    return card;
}


/* =========================================================
   MODAL
========================================================= */

function createRoomManagementModal() {

    if (roomManagementModal) {
        return;
    }

    roomManagementModal =
        document.createElement(
            "div"
        );

    roomManagementModal.id =
        "roomManagementModal";

    roomManagementModal.className =
        "room-management-overlay";

    roomManagementModal.innerHTML = `
        <div
            class="room-management-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="roomManagementTitle"
        >

            <div class="room-management-icon">
                <i class="fa-solid fa-door-open"></i>
            </div>

            <div class="room-management-heading">

                <div>
                    <h2 id="roomManagementTitle">
                        Add Room
                    </h2>

                    <p id="roomManagementSubtitle">
                        Create a new room for the KTV system.
                    </p>
                </div>

                <button
                    type="button"
                    class="room-management-close"
                    id="roomManagementClose"
                    aria-label="Close"
                >
                    <i class="fa-solid fa-xmark"></i>
                </button>

            </div>


            <div class="room-management-room-number">

                <span>
                    Room Number
                </span>

                <strong id="managementRoomNumber">
                    -
                </strong>

            </div>


            <div class="room-management-form">

                <div class="management-field">

                    <label for="managementRoomName">
                        Room Name
                    </label>

                    <input
                        type="text"
                        id="managementRoomName"
                        maxlength="40"
                        placeholder="Example: VIP Room"
                        autocomplete="off"
                    >

                </div>


                <div class="management-field">

                    <label for="managementRoomType">
                        Room Type
                    </label>

                    <select id="managementRoomType">

                        <option value="regular">
                            Regular
                        </option>

                        <option value="vip">
                            VIP
                        </option>

                    </select>

                </div>


                <div class="management-field">

                    <label for="managementRoomDescription">
                        Description
                    </label>

                    <textarea
                        id="managementRoomDescription"
                        maxlength="100"
                        rows="3"
                        placeholder="Example: Large room with premium sound system"
                    ></textarea>

                </div>

            </div>


            <div class="room-management-actions">

                <button
                    type="button"
                    class="management-delete"
                    id="managementDelete"
                    style="display:none"
                >
                    <i class="fa-solid fa-trash"></i>
                    <span>Delete Room</span>
                </button>

                <button
                    type="button"
                    class="management-cancel"
                    id="managementCancel"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    class="management-save"
                    id="managementSave"
                >
                    <i class="fa-solid fa-check"></i>
                    <span>
                        Add Room
                    </span>
                </button>

            </div>

        </div>
    `;

    document.body.appendChild(
        roomManagementModal
    );


    document
        .getElementById(
            "roomManagementClose"
        )
        .addEventListener(
            "click",
            closeRoomManagementModal
        );


    document
        .getElementById(
            "managementCancel"
        )
        .addEventListener(
            "click",
            closeRoomManagementModal
        );


    document
        .getElementById(
            "managementSave"
        )
        .addEventListener(
            "click",
            saveRoomManagement
        );


    document
        .getElementById(
            "managementDelete"
        )
        .addEventListener(
            "click",
            confirmDeleteManagedRoom
        );


    roomManagementModal
        .addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    roomManagementModal
                ) {

                    closeRoomManagementModal();

                }

            }
        );


    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                roomManagementModal &&
                roomManagementModal.classList.contains("show")
            ) {

                closeRoomManagementModal();

            }

        }
    );

}


/* =========================================================
   OPEN MODAL
========================================================= */

function openRoomManagementModal(
    mode,
    roomNumber = null
) {

    createRoomManagementModal();

    editingManagedRoom =
        mode === "edit"
            ? Number(roomNumber)
            : null;


    const title =
        document.getElementById(
            "roomManagementTitle"
        );

    const subtitle =
        document.getElementById(
            "roomManagementSubtitle"
        );

    const number =
        document.getElementById(
            "managementRoomNumber"
        );

    const name =
        document.getElementById(
            "managementRoomName"
        );

    const type =
        document.getElementById(
            "managementRoomType"
        );

    const description =
        document.getElementById(
            "managementRoomDescription"
        );

    const saveButton =
        document.getElementById(
            "managementSave"
        );


    if (mode === "add") {

        const next =
            getNextAvailableRoomNumber();

        title.textContent =
            "Add Room";

        subtitle.textContent =
            "Create another KTV room.";

        number.textContent =
            next;

        name.value =
            "";

        type.value =
            "regular";

        description.value =
            "";

        saveButton.innerHTML =
            '<i class="fa-solid fa-plus"></i><span>Add Room</span>';

    } else {

        const config =
            getRoomConfig(
                roomNumber
            );

        title.textContent =
            "Edit Room";

        subtitle.textContent =
            "Update this room's information.";

        number.textContent =
            roomNumber;

        name.value =
            config.name || "";

        type.value =
            config.type || "regular";

        description.value =
            config.description || "";

        saveButton.innerHTML =
            '<i class="fa-solid fa-floppy-disk"></i><span>Save Changes</span>';

        const deleteButton =
            document.getElementById(
                "managementDelete"
            );

        if (deleteButton) {

            deleteButton.style.display =
                Number(roomNumber) > 17
                    ? "inline-flex"
                    : "none";

        }

    }


    if (mode === "add") {

        const deleteButton =
            document.getElementById(
                "managementDelete"
            );

        if (deleteButton) {
            deleteButton.style.display = "none";
        }

    }


    roomManagementModal.classList.add(
        "show"
    );


    setTimeout(
        function () {

            name.focus();

        },
        80
    );

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeRoomManagementModal() {

    if (
        roomManagementModal
    ) {

        roomManagementModal.classList.remove(
            "show"
        );

    }

    editingManagedRoom =
        null;
}


/* =========================================================
   NEXT ROOM NUMBER
========================================================= */

function getNextAvailableRoomNumber() {

    const used =
        new Set(
            getManagedRoomNumbers()
        );

    for (
        let number = 1;
        number <= ROOM_MANAGEMENT_MAX;
        number++
    ) {

        if (!used.has(number)) {
            return number;
        }

    }

    return null;
}


/* =========================================================
   SAVE ROOM
========================================================= */

function saveRoomManagement() {

    const nameInput =
        document.getElementById(
            "managementRoomName"
        );

    const typeInput =
        document.getElementById(
            "managementRoomType"
        );

    const descriptionInput =
        document.getElementById(
            "managementRoomDescription"
        );

    const name =
        nameInput.value.trim();

    const type =
        typeInput.value === "vip"
            ? "vip"
            : "regular";

    const description =
        descriptionInput.value.trim();


    if (editingManagedRoom === null) {

        const roomNumber =
            getNextAvailableRoomNumber();

        if (!roomNumber) {

            showRoomToast(
                "Maximum of " +
                ROOM_MANAGEMENT_MAX +
                " rooms reached.",
                "error"
            );

            return;

        }


        const rooms =
            getRoomData();

        const configs =
            getRoomConfigs();


        if (
            rooms[roomNumber]
        ) {

            showRoomToast(
                "That room number already exists.",
                "error"
            );

            return;

        }


        rooms[roomNumber] =
            createDefaultRoom();


        configs[String(roomNumber)] = {

            name:
                name,

            type:
                type,

            description:
                description

        };


        saveRoomData(
            rooms
        );

        saveRoomConfigs(
            configs
        );


        createManagedRoomCard(
            roomNumber
        );


        updateRoom(
            roomNumber
        );


        decorateRoomCard(
            roomNumber
        );


        showRoomToast(
            "Room " +
            roomNumber +
            " added successfully.",
            "success"
        );


        addActivity(
            "blue",
            "Room " +
            roomNumber +
            " added to the system."
        );


        closeRoomManagementModal();


        return;
    }


    /* -----------------------------------------
       EDIT
    ----------------------------------------- */

    const roomNumber =
        editingManagedRoom;

    const rooms =
        getRoomData();

    if (
        !rooms[roomNumber]
    ) {

        showRoomToast(
            "Room data not found.",
            "error"
        );

        return;

    }


    const configs =
        getRoomConfigs();


    configs[String(roomNumber)] = {

        name:
            name,

        type:
            type,

        description:
            description

    };


    saveRoomConfigs(
        configs
    );


    decorateRoomCard(
        roomNumber
    );


    showRoomToast(
        "Room " +
        roomNumber +
        " updated successfully.",
        "success"
    );


    addActivity(
        "blue",
        "Room " +
        roomNumber +
        " information updated."
    );


    closeRoomManagementModal();

}


/* =========================================================
   DELETE ROOM
   Admin-created rooms only (Room 18+)
========================================================= */

function confirmDeleteManagedRoom() {

    const roomNumber =
        Number(editingManagedRoom);


    if (!roomNumber) {

        return;

    }


    if (roomNumber <= 17) {

        showRoomToast(
            "Default rooms 1-17 cannot be deleted.",
            "error"
        );

        return;

    }


    const rooms =
        getRoomData();

    const data =
        rooms[roomNumber];


    if (!data) {

        showRoomToast(
            "Room data not found.",
            "error"
        );

        return;

    }


    const liveRemaining =
        getLiveRemaining(data);


    if (
        data.status === "occupied" ||
        data.status === "warning" ||
        liveRemaining > 0
    ) {

        showRoomToast(
            "You cannot delete an active room. End the session first.",
            "error"
        );

        return;

    }


    const title =
        document.getElementById(
            "roomManagementTitle"
        );

    const subtitle =
        document.getElementById(
            "roomManagementSubtitle"
        );

    const form =
        document.querySelector(
            ".room-management-form"
        );

    const actions =
        document.querySelector(
            ".room-management-actions"
        );

    const icon =
        document.querySelector(
            ".room-management-icon i"
        );


    if (!form || !actions) {

        return;

    }


    title.textContent =
        "Delete Room";

    subtitle.textContent =
        "This action permanently removes this admin-created room.";

    icon.className =
        "fa-solid fa-triangle-exclamation";


    form.innerHTML = `
        <div class="room-delete-warning">

            <i class="fa-solid fa-circle-exclamation"></i>

            <div>
                <strong>Delete Room ${roomNumber}?</strong>

                <p>
                    The room configuration and room data will be removed.
                    This cannot be undone.
                </p>
            </div>

        </div>
    `;


    actions.innerHTML = `
        <button
            type="button"
            class="management-cancel"
            id="managementDeleteCancel"
        >
            Cancel
        </button>

        <button
            type="button"
            class="management-delete management-delete-confirm"
            id="managementDeleteConfirm"
        >
            <i class="fa-solid fa-trash"></i>
            <span>Delete Room</span>
        </button>
    `;


    document
        .getElementById(
            "managementDeleteCancel"
        )
        .addEventListener(
            "click",
            closeRoomManagementModal
        );


    document
        .getElementById(
            "managementDeleteConfirm"
        )
        .addEventListener(
            "click",
            function () {

                deleteManagedRoom(
                    roomNumber
                );

            }
        );

}


function deleteManagedRoom(roomNumber) {

    const rooms =
        getRoomData();

    const configs =
        getRoomConfigs();


    if (!rooms[roomNumber]) {

        showRoomToast(
            "Room data not found.",
            "error"
        );

        return;

    }


    delete rooms[roomNumber];

    delete configs[String(roomNumber)];


    saveRoomData(
        rooms
    );

    saveRoomConfigs(
        configs
    );


    const card =
        getRoomCard(roomNumber);

    if (card) {
        card.remove();
    }


    createAddRoomCard();


    addActivity(
        "red",
        "Room " +
        roomNumber +
        " was deleted from the system."
    );


    showRoomToast(
        "Room " +
        roomNumber +
        " deleted successfully.",
        "success"
    );


    closeRoomManagementModal();

}


/* =========================================================
   CREATE EXTRA ROOM CARD
========================================================= */

function createManagedRoomCard(
    roomNumber
) {

    if (
        getRoomCard(roomNumber)
    ) {
        return;
    }


    const grid =
        document.querySelector(
            ".room-grid"
        );

    if (!grid) {
        return;
    }


    const addCard =
        document.querySelector(
            ".add-room-card"
        );


    const card =
        document.createElement(
            "div"
        );

    card.className =
        "room available";

    card.innerHTML = `

        <div class="room-card-header">

            <h3>
                Room ${roomNumber}
            </h3>

            <div class="room-card-header-right">

                <span class="room-type-badge regular">
                    Regular
                </span>

            </div>

        </div>

        <div
            class="room-display-name"
            style="display:none"
        ></div>

        <div
            class="room-description"
            style="display:none"
        ></div>

        <div class="status">

            <span class="dot"></span>

            Available

        </div>

        <p>
            No Active Session
        </p>

    `;


    if (
        addCard &&
        addCard.parentNode === grid
    ) {

        grid.insertBefore(
            card,
            addCard
        );

    } else {

        grid.appendChild(
            card
        );

    }


    /* Add edit button through decorator */

    decorateRoomCard(
        roomNumber
    );

}


/* =========================================================
   RENDER EXTRA ROOMS
========================================================= */

function renderManagedRooms() {

    createRoomManagementModal();

    ensureRoomConfigs();


    const roomNumbers =
        getManagedRoomNumbers();


    roomNumbers.forEach(
        function (roomNumber) {

            if (
                roomNumber > 17
            ) {

                createManagedRoomCard(
                    roomNumber
                );

            }

        }
    );


    decorateAllRoomCards();

    createAddRoomCard();

}


/* =========================================================
   EXTRA ROOM LIVE TIMER
   Existing room.js handles Rooms 1-17.
   This handles rooms added by Admin.
========================================================= */

function updateExtraRoomTimers() {

    const roomNumbers =
        getManagedRoomNumbers();


    roomNumbers.forEach(
        function (roomNumber) {

            if (
                roomNumber <= 17
            ) {
                return;
            }


            if (
                getRoomCard(roomNumber)
            ) {

                updateRoom(
                    roomNumber
                );

                decorateRoomCard(
                    roomNumber
                );

            }

        }
    );

}


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        renderManagedRooms();


        setInterval(
            function () {

                updateExtraRoomTimers();

            },
            1000
        );

    }
);


/* =========================================================
   EXPOSE MANAGEMENT FUNCTIONS
========================================================= */

window.openRoomManagementModal =
    openRoomManagementModal;

window.closeRoomManagementModal =
    closeRoomManagementModal;
