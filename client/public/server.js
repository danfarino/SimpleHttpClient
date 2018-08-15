const path = require("path");
const electron = require("electron");

let windowCount = 0;

const DEV_MODE = process.env.DEV_MODE === "1";

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

  if (DEV_MODE) {
    win.loadURL("http://localhost:3000/");

    const devToolsInstaller = require("electron-devtools-installer");
    devToolsInstaller.default(devToolsInstaller.REACT_DEVELOPER_TOOLS);
    devToolsInstaller.default(devToolsInstaller.REDUX_DEVTOOLS);
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
