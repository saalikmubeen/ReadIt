// Modules
const {app, BrowserWindow, ipcMain, shell, Menu} = require('electron')
const windowStateKeeper = require("electron-window-state");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

// Create a new BrowserWindow when `app` is ready
function createWindow () {

  let mainWindowState = windowStateKeeper({
      defaultWidth: 650,
      defaultHeight: 800,
  });

  mainWindow = new BrowserWindow({
    minHeight: 300,
    minWidth: 350,
    maxWidth: 650,
    'x': mainWindowState.x,
    'y': mainWindowState.y,
    'width': mainWindowState.width,
    'height': mainWindowState.height,
    webPreferences: {
      // --- !! IMPORTANT !! ---
      // Disable 'contextIsolation' to allow 'nodeIntegration'
      // 'contextIsolation' defaults to "true" as from Electron v12
      contextIsolation: false,
      nodeIntegration: true
    }
  })

  mainWindowState.manage(mainWindow);

  // Load index.html into the new BrowserWindow
  mainWindow.loadFile('src/main.html')

  // Open DevTools - Remove for PRODUCTION!
  mainWindow.webContents.openDevTools();

  // Listen for window being closed
  mainWindow.on('closed',  () => {
    mainWindow = null
  })
}




let offScreenBrowserWindow;

// create new offscreen browser window;
const readItem = (url, callback) => {
    
  offScreenBrowserWindow = new BrowserWindow({
      width: 500,
      height: 500,
      show: false,
      webPreferences: {
        offscreen: true,
        nodeIntegration: false
      }
  })

  // load item url into the offscreen window
  offScreenBrowserWindow.loadURL(url);


  // wait for contents to finish loading
  offScreenBrowserWindow.webContents.on("did-finish-load", (e) => {
      
    // get page title
    const title = offScreenBrowserWindow.getTitle();

    // get page screenshot - thumbnail

    offScreenBrowserWindow.webContents
        .capturePage()
        .then((image) => {
            // convert image to data url
            const screenshot = image.toDataURL();

            console.log(screenshot);

            // execute callback with title and screenshot

            callback({
                title,
                screenshot,
                url,
            });

            // clean up
            offScreenBrowserWindow.close();
            offScreenBrowserWindow = null;
        })
        .catch((err) => {
            console.log(err);
        });
  }) 
}



ipcMain.on("item:add", (event, url) => {
  
  readItem(url, (item) => {
      event.sender.send("item:add:success", item);
  })

});




// Menu template
const menuTemplate = [
    {
        label: "Items",
        submenu: [
            {
                label: "Add New",
                click: () => {
                    mainWindow.webContents.send("open:add");
                },
                accelerator: "CmdOrCtrl+O",
            },
            {
                label: "Read Item",
                accelerator: "CmdOrCtrl+Enter",
                click: () => {
                    mainWindow.webContents.send("read:item");
                },
            },
            {
                label: "Delete Item",
                accelerator: "CmdOrCtrl+Backspace",
                click: () => {
                    mainWindow.webContents.send("delete:item");
                },
            },
            {
                label: "Open in Browser",
                accelerator: "CmdOrCtrl+Shift+O",
                click: () => {
                    mainWindow.webContents.send("open-in-browser");
                },
            },
            {
                label: "Search Items",
                accelerator: "CmdOrCtrl+S",
                click: () => {
                    mainWindow.webContents.send("search:items");
                },
            },
        ],
    },
    {
        role: "editMenu",
    },
    {
        role: "windowMenu",
    },
    {
        role: "help",
        submenu: [
            {
                label: "Learn more",
                click: () => {
                    shell.openExternal("https://github.com/saalikmubeen");
                },
            },
        ],
    },
];

// Set Mac-specific first menu item
if (process.platform === 'darwin') {

  menuTemplate.unshift({
    label: app.getName(),
    submenu: [
      { role: 'about' },
      { type: 'separator'},
      { role: 'services' },
      { type: 'separator'},
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator'},
      { role: 'quit' }
    ]
  })
}


// Electron `app` is ready
app.on('ready', () => {
    // create main window
    createWindow();

    // Build menu
    const menu = Menu.buildFromTemplate(menuTemplate);

    // Set as main app menu
    Menu.setApplicationMenu(menu);
})

// Quit when all windows are closed - (Not macOS - Darwin)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// When app icon is clicked and app is running, (macOS) recreate the BrowserWindow
app.on('activate', () => {
  if (mainWindow === null) createWindow()
})