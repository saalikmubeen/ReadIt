// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { ipcRenderer } = require("electron");


const showModal = document.getElementById("show-modal"),
    closeModal = document.getElementById("close-modal"),
    modal = document.getElementById("modal"),
    addItemBtn = document.getElementById("add-item"),
    itemUrl = document.getElementById("url"); // input


const toggleModalBtns = () => {

    if (addItemBtn.disabled) {
        addItemBtn.disabled = false;
        addItemBtn.style.opacity = 1;
        addItemBtn.innerText = "Add Item";
        closeModal.style.display = "inline"
        addItemBtn.style.cursor = "pointer";
    } else {
        addItemBtn.disabled = true;
        addItemBtn.style.opacity = 0.5;
        addItemBtn.innerText = "Adding.....!";
        addItemBtn.style.cursor = "not-allowed"
        closeModal.style.display = "none";
    }
}

showModal.addEventListener("click", () => {
    modal.style.display = "flex";
    itemUrl.focus();
})


closeModal.addEventListener("click", () => {
    modal.style.display = "none";
});


addItemBtn.addEventListener("click", () => {
    const url = itemUrl.value;

    if (!url) {
        alert("URL is required!");
        return
    }

    // send new url to the main process
    ipcRenderer.send("item:add", url);

    // disable add button
    toggleModalBtns();
})


itemUrl.addEventListener("keyup", (e) => {
    if (e.key === "enter") {
        addItemBtn.click();
    }
} )


ipcRenderer.on("item:add:success", (event, data) => {

    // console.log(data)

    // add new item to the items list

    let itemNode = document.createElement("div");
    itemNode.className = "read-item";

    itemNode.innerHTML = `
        <img src=${data.screenshot} alt="screenshot of page"/>
        <h2>${data.title}</h2>
    `

    const itemList = document.getElementById("items");
    itemList.appendChild(itemNode);

    toggleModalBtns()
    modal.style.display = "none";
    itemUrl.value = "";
});
