const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("badhus", {
  version: "0.1.0",
});
