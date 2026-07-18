const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    switchPage: (index) => ipcRenderer.send("switch-page", index)
});