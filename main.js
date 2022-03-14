// Modules
const {app, BrowserWindow, ipcMain} = require('electron')
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
  // mainWindow.webContents.openDevTools();

  // Listen for window being closed
  mainWindow.on('closed',  () => {
    mainWindow = null
  })
}

// Electron `app` is ready
app.on('ready', createWindow)

// Quit when all windows are closed - (Not macOS - Darwin)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// When app icon is clicked and app is running, (macOS) recreate the BrowserWindow
app.on('activate', () => {
  if (mainWindow === null) createWindow()
})



ipcMain.on("item:add", (event, url) => {
  // console.log(url)

  setTimeout(() => {
      event.sender.send("item:add:success", "New Item from main process");
  }, 3000)
});