// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { ipcRenderer } = require("electron");

const savedItems = JSON.parse(localStorage.getItem("saved-items")) || [];


const showModal = document.getElementById("show-modal"),
    closeModal = document.getElementById("close-modal"),
    modal = document.getElementById("modal"),
    addItemBtn = document.getElementById("add-item"),
    itemUrl = document.getElementById("url"), // input
    itemList = document.getElementById("items"),
    search = document.getElementById("search");

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


const addItem = (item, idx) => {
    let itemNode = document.createElement("div");
    itemNode.className = "read-item";

    if (idx !== undefined && idx === 0) {
        itemNode.classList.add("selected");
    }

    // set item url as data attribute
    itemNode.setAttribute("data-url", item.url);

    itemNode.innerHTML = `
        <img src=${item.screenshot} alt="screenshot of page"/>
        <h2>${item.title}</h2>
    `;

    // add event listener to the created item
    itemNode.addEventListener("click", (e) => {
        // unselect the currently selected item
        document.getElementsByClassName("read-item selected")[0] &&
            document
                .getElementsByClassName("read-item selected")[0]
                .classList.remove("selected");

        // select the clicked item
        e.currentTarget.classList.add("selected");
    });


    // attach double click handler to open the item in a new window;

    itemNode.addEventListener("dblclick", (e) => {
        const url = e.currentTarget.getAttribute("data-url");
        // console.log(url) 

        // open item in proxy BrowserWindow;
        let win = window.open(url, "", `
            maxWidth=2000,
            maxHeight=2000,
            width=1200,
            height=1200,
            backgroundColor="#DEDEDE",
            nodeIntegrations=0,
            contextIsolation=1
        `)


    })

    itemList.appendChild(itemNode);
}

ipcRenderer.on("item:add:success", (event, data) => {

    // console.log(data)

    // add new item to the items list

    addItem(data);

    // save item to local storage
    savedItems.push(data)
    localStorage.setItem("saved-items", JSON.stringify(savedItems));

    toggleModalBtns()
    modal.style.display = "none";
    itemUrl.value = "";
});


// show saved items (in local storage) on page load 
savedItems.forEach((item, idx) => {
    addItem(item, idx);
})



// search for items

search.addEventListener("keyup", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const readItems = document.getElementsByClassName("read-item");

    Array.from(readItems).forEach((item) => {
        
        if (!item.innerText.toLowerCase().includes(searchTerm)) {
            item.style.display = "none";
        } else {
            item.style.display = "flex";
        }
    })
})


document.addEventListener("keyup", (e) => {

    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        const selectedItem = document.getElementsByClassName("read-item selected")[0];

        if (selectedItem) {
            
            if (e.key === "ArrowUp") {
                const prevItem = selectedItem.previousSibling;
                console.log(prevItem)
                if (prevItem && prevItem.classList) {
                    selectedItem.classList.remove("selected");
                    prevItem.classList.add("selected");
                }
            } else if (e.key === "ArrowDown") {
                const nextItem = selectedItem.nextSibling;
                console.log(nextItem);
                if (nextItem) {
                    selectedItem.classList.remove("selected");
                    nextItem.classList.add("selected");
                } else {
                    selectedItem.classList.remove("selected");
                    const items = document.getElementsByClassName("read-item")
                    items[0] && items[0].classList.add("selected")
                }
            }
        }
    }
})