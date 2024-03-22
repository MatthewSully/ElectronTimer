// const path = require("path");
// require("electron-reload")(__dirname, {
//   electron: require(`${__dirname}/node_modules/electron`),
// });

const { app, BrowserWindow } = require("electron");
const { ipcMain } = require("electron");

function createWindow() {
  const win = new BrowserWindow({
    width: 300,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    frame: false, // Keep the frame to allow for window dragging
    titleBarStyle: "hidden", // Hide the default title bar but allow drag
    alwaysOnTop: true,
  });

  win.loadFile("index.html");

  // Remove the menu
  win.setMenu(null); // or win.removeMenu();
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

let previousSize = [];
ipcMain.on("collapse-window", (event) => {
  const window = BrowserWindow.getFocusedWindow();
  const collapsedWidth = 250;
  const collapsedHeight = 60;
  previousSize = window.getSize();
  window.setSize(collapsedWidth, collapsedHeight);
});

ipcMain.on("toggle-collapse", (event) => {
  const mainWindow = BrowserWindow.getFocusedWindow();
  if (mainWindow) {
    if (previousSize.length > 0) {
      // Restore the window to its previous size if it was previously stored
      mainWindow.setSize(...previousSize);
      previousSize = []; // Clear the previous size after restoring
    } else {
      // If no previous size, restore to default dimensions
      mainWindow.setSize(300, 600);
    }
  }
});
