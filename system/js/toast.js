function showToast(message, type = "success") {

    let toast = document.createElement("div");

    toast.className = `toast ${type}`;

    toast.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;


    document.body.appendChild(toast);


    setTimeout(() => {
        toast.classList.add("show");
    }, 100);


    setTimeout(() => {

        toast.classList.remove("show");

        setTimeout(() => {
            toast.remove();
        }, 300);

    }, 3000);

}