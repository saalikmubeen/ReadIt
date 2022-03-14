// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


const showModal = document.getElementById("show-modal"),
    closeModal = document.getElementById("close-modal"),
    modal = document.getElementById("modal");


showModal.addEventListener("click", () => {
    modal.style.display = "flex"
})


closeModal.addEventListener("click", () => {
    modal.style.display = "none";
});
