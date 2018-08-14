const path = require("path");
const electron = require("electron");

let windowCount = 0;

function createWindow() {
  ++windowCount;

  const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;

  let win = new electron.BrowserWindow({
    width: width - 50,
    height: height - 50,
    show: false,
    webPreferences: {
      devTools: true
    }
  });

  win.on("closed", () => {
    if (--windowCount === 0) {
      electron.app.quit();
    }
  });

  if (process.env.DEV_MODE === "1") {
    win.loadURL("http://localhost:3000/");
  } else {
    win.loadFile("index.html");
  }
  win.webContents.on("dom-ready", () => {
    win.show();
  });

  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "New window",
          accelerator: "CommandOrControl+n",
          click() {
            createWindow();
          }
        }
      ]
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "pasteandmatchstyle" },
        { role: "delete" },
        { role: "selectall" }
      ]
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forcereload" },
        { role: "toggledevtools" },
        { type: "separator" },
        { role: "resetzoom" },
        { role: "zoomin", accelerator: "CommandOrControl+=" },
        { role: "zoomout" },
        { type: "separator" },
        { role: "togglefullscreen" }
      ]
    },
    {
      role: "window",
      submenu: [{ role: "minimize" }, { role: "close" }]
    }
  ];

  const menu = electron.Menu.buildFromTemplate(template);
  win.setMenu(menu);
}

electron.app.on("ready", createWindow);
